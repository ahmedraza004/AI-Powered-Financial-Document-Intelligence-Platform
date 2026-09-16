from rest_framework import views, status, permissions
from rest_framework.response import Response
from apps.documents.models import Document, ExtractedData, AISummary
from .extractor import extract_financial_data
from .classifier import classify_document
from .summarizer import generate_ai_summary
from apps.documents.serializers import ExtractedDataSerializer, AISummarySerializer

class ReExtractView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, doc_id):
        try:
            doc = Document.objects.get(id=doc_id, organization=request.user.organization)
            extracted = extract_financial_data(doc.ocr_text, doc.doc_type, doc.file_name)

            data_obj, _ = ExtractedData.objects.update_or_create(
                document=doc,
                defaults={
                    "vendor_name": extracted.get("vendor_name", ""),
                    "invoice_number": extracted.get("invoice_number", ""),
                    "issue_date": extracted.get("issue_date"),
                    "due_date": extracted.get("due_date"),
                    "currency": extracted.get("currency", "USD"),
                    "subtotal": extracted.get("subtotal"),
                    "tax_amount": extracted.get("tax_amount"),
                    "total_amount": extracted.get("total_amount"),
                    "confidence_score": extracted.get("confidence_score", 0.95),
                    "line_items": extracted.get("line_items", []),
                    "bank_info": extracted.get("bank_info", {}),
                    "raw_json": extracted.get("raw_json", {}),
                }
            )

            summary_dict = generate_ai_summary(doc.ocr_text, doc.doc_type, extracted)
            AISummary.objects.update_or_create(
                document=doc,
                defaults={
                    "executive_summary": summary_dict.get("executive_summary", ""),
                    "key_insights": summary_dict.get("key_insights", []),
                    "risk_assessment": summary_dict.get("risk_assessment", "Low Risk"),
                    "financial_ratios": summary_dict.get("financial_ratios", {}),
                }
            )

            return Response({
                "message": "Document re-extracted successfully",
                "extracted_data": ExtractedDataSerializer(data_obj).data
            })
        except Document.DoesNotExist:
            return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)
