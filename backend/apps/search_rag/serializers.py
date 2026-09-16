from rest_framework import serializers
from .models import ChatMessage, DocumentChunk

class ChatMessageSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'citations', 'user_name', 'created_at']


class SearchQuerySerializer(serializers.Serializer):
    query = serializers.CharField(max_length=500)
    doc_ids = serializers.ListField(child=serializers.UUIDField(), required=False)
    top_k = serializers.IntegerField(default=5, min_value=1, max_value=20)


class RAGChatRequestSerializer(serializers.Serializer):
    query = serializers.CharField(max_length=1000)
    doc_ids = serializers.ListField(child=serializers.UUIDField(), required=False)
