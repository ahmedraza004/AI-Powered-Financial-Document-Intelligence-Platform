from django.urls import path
from .views import RetryProcessingView

urlpatterns = [
    path('retry/<uuid:doc_id>/', RetryProcessingView.as_view(), name='retry_processing'),
]
