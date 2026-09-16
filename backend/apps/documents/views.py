import io
import csv
import json
import logging
from django.http import HttpResponse
from rest_framework import views, generics, status, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Document, ExtractedData, AISummary
from .serializers import (
    DocumentListSerializer, 
    DocumentDetailSerializer, 
    DocumentUploadSerializer,
    ExtractedDataSerializer
)
from apps.authentication.permissions import CanUploadDocs, CanExportDocs
from apps.processing.tasks import process_document_pipeline
from apps.audit.models import AuditLog

logger = logging.getLogger(__name__)

class DocumentListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        qs = Document.objects.filter(organization=request.user.organization)
        
        doc_type = request.query_params.get('doc_type')
        doc_status = request.query_params.get('status')
        search = request.query_params.get('search')

        if doc_type:
            qs = qs.filter(doc_type=doc_type.upper())
        if doc_status:
            qs = qs.filter(status=doc_status.upper())
        if search:
            qs = qs.filter(file_name__icontains=search) | qs.filter(extracted_data__vendor_name__icontains=search)

        serializer = DocumentListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        if request.user.role not in ['ADMIN', 'MANAGER', 'EMPLOYEE']:
            return Response({'error': 'Permission denied to upload documents'}, status=status.HTTP_403_FORBIDDEN)

        files = request.FILES.getlist('file')
        if not files:
            file_obj = request.FILES.get('file')
            if file_obj:
                files = [file_obj]

        if not files:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        created_docs = []
        for file in files:
            mime = file.content_type or 'application/pdf'
            doc = Document.objects.create(
                user=request.user,
                organization=request.user.organization,
                file=file,
                file_name=file.name,
                file_size=file.size,
                mime_type=mime,
                status='PENDING'
            )

            # Audit log
            AuditLog.objects.create(
                organization=request.user.organization,
                user=request.user,
                action='UPLOAD_DOCUMENT',
                document_name=doc.file_name,
                details=f"Uploaded {file.size / 1024:.1f} KB document ({mime})"
            )

            # Process immediately or send to Celery
            try:
                process_document_pipeline(str(doc.id))
            except Exception as e:
                logger.error(f"Error processing doc {doc.id}: {e}")

            doc.refresh_from_db()
            created_docs.append(DocumentListSerializer(doc, context={'request': request}).data)

        return Response({
            "message": f"Successfully uploaded {len(created_docs)} document(s)",
            "documents": created_docs
        }, status=status.HTTP_201_CREATED)


class DocumentDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk, organization=request.user.organization)
            serializer = DocumentDetailSerializer(doc, context={'request': request})
            return Response(serializer.data)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk, organization=request.user.organization)
            
            # Allow updating extracted data fields
            if hasattr(doc, 'extracted_data') and doc.extracted_data:
                data_serializer = ExtractedDataSerializer(doc.extracted_data, data=request.data.get('extracted_data', {}), partial=True)
                if data_serializer.is_valid():
                    data_serializer.save()
            
            # Allow updating doc_type
            if 'doc_type' in request.data:
                doc.doc_type = request.data['doc_type']
                doc.save()

            AuditLog.objects.create(
                organization=request.user.organization,
                user=request.user,
                action='EDIT_DOCUMENT',
                document_name=doc.file_name,
                details="Updated extracted financial metadata fields."
            )

            serializer = DocumentDetailSerializer(doc, context={'request': request})
            return Response(serializer.data)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk, organization=request.user.organization)
            doc_name = doc.file_name
            doc.delete()

            AuditLog.objects.create(
                organization=request.user.organization,
                user=request.user,
                action='DELETE_DOCUMENT',
                document_name=doc_name,
                details="Permanently removed document and index embeddings."
            )

            return Response({'message': 'Document deleted successfully'}, status=status.HTTP_200_OK)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)


class DocumentExportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        format_type = request.query_params.get('format', 'csv').lower()
        docs = Document.objects.filter(
            organization=request.user.organization
        ).select_related('extracted_data')

        AuditLog.objects.create(
            organization=request.user.organization,
            user=request.user,
            action='EXPORT_DATA',
            document_name='Financial Ledger Export',
            details=f"Exported financial records in {format_type.upper()} format"
        )

        if format_type == 'json':
            data = []
            for d in docs:
                ext = getattr(d, 'extracted_data', None)
                data.append({
                    "id": str(d.id),
                    "file_name": d.file_name,
                    "doc_type": d.doc_type,
                    "status": d.status,
                    "vendor_name": ext.vendor_name if ext else "",
                    "invoice_number": ext.invoice_number if ext else "",
                    "issue_date": str(ext.issue_date) if ext and ext.issue_date else "",
                    "due_date": str(ext.due_date) if ext and ext.due_date else "",
                    "currency": ext.currency if ext else "USD",
                    "subtotal": float(ext.subtotal) if ext and ext.subtotal else 0.0,
                    "tax_amount": float(ext.tax_amount) if ext and ext.tax_amount else 0.0,
                    "total_amount": float(ext.total_amount) if ext and ext.total_amount else 0.0,
                    "created_at": d.created_at.isoformat()
                })
            response = HttpResponse(json.dumps(data, indent=2), content_type='application/json')
            response['Content-Disposition'] = 'attachment; filename="financial_records.json"'
            return response

        # Default CSV export
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            'File Name', 'Document Type', 'Status', 'Vendor Name', 
            'Invoice #', 'Issue Date', 'Due Date', 'Currency', 
            'Subtotal', 'Tax Amount', 'Total Amount', 'Confidence Score', 'Created At'
        ])

        for d in docs:
            ext = getattr(d, 'extracted_data', None)
            writer.writerow([
                d.file_name,
                d.doc_type,
                d.status,
                ext.vendor_name if ext else '',
                ext.invoice_number if ext else '',
                ext.issue_date if ext and ext.issue_date else '',
                ext.due_date if ext and ext.due_date else '',
                ext.currency if ext else 'USD',
                ext.subtotal if ext and ext.subtotal else '',
                ext.tax_amount if ext and ext.tax_amount else '',
                ext.total_amount if ext and ext.total_amount else '',
                f"{ext.confidence_score*100:.1f}%" if ext else '',
                d.created_at.strftime('%Y-%m-%d %H:%M')
            ])

        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="financial_documents_ledger.csv"'
        return response
