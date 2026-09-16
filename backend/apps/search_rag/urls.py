from django.urls import path
from .views import HybridSearchView, RAGChatView

urlpatterns = [
    path('', HybridSearchView.as_view(), name='search_documents'),
    path('chat/', RAGChatView.as_view(), name='rag_chat'),
]
