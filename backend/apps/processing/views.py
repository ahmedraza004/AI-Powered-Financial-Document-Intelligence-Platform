from rest_framework import views, status, permissions
from rest_framework.response import Response
from apps.documents.models import Document
from .tasks import process_document_pipeline

class RetryProcessingView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, doc_id):
        try:
            doc = Document.objects.get(id=doc_id, organization=request.user.organization)
            process_document_pipeline(str(doc.id))
            return Response({"message": f"Reprocessing triggered for {doc.file_name}"})
        except Document.DoesNotExist:
            return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)
