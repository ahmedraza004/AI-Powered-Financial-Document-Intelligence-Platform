from rest_framework import views, status, permissions
from rest_framework.response import Response
from .rag_service import search_documents, answer_rag_question
from .serializers import SearchQuerySerializer, RAGChatRequestSerializer, ChatMessageSerializer
from .models import ChatMessage

class HybridSearchView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SearchQuerySerializer(data=request.data)
        if serializer.is_valid():
            q = serializer.validated_data['query']
            top_k = serializer.validated_data.get('top_k', 5)
            doc_ids = serializer.validated_data.get('doc_ids', None)

            results = search_documents(
                query=q,
                organization=request.user.organization,
                top_k=top_k,
                doc_ids=doc_ids
            )
            return Response({"query": q, "count": len(results), "results": results})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RAGChatView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RAGChatRequestSerializer(data=request.data)
        if serializer.is_valid():
            q = serializer.validated_data['query']
            doc_ids = serializer.validated_data.get('doc_ids', None)

            result = answer_rag_question(
                query=q,
                organization=request.user.organization,
                user=request.user,
                doc_ids=doc_ids
            )
            return Response(result)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        messages = ChatMessage.objects.filter(
            organization=request.user.organization
        ).order_by('created_at')[:50]
        return Response(ChatMessageSerializer(messages, many=True).data)

    def delete(self, request):
        ChatMessage.objects.filter(organization=request.user.organization).delete()
        return Response({"message": "Chat history cleared successfully"})
