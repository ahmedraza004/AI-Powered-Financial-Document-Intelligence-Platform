from django.urls import path
from .views import DocumentListCreateView, DocumentDetailView, DocumentExportView

urlpatterns = [
    path('', DocumentListCreateView.as_view(), name='document_list_create'),
    path('export/', DocumentExportView.as_view(), name='document_export'),
    path('<uuid:pk>/', DocumentDetailView.as_view(), name='document_detail'),
]
