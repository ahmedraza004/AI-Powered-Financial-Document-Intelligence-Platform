from django.urls import path
from .views import ReExtractView

urlpatterns = [
    path('re-extract/<uuid:doc_id>/', ReExtractView.as_view(), name='ai_re_extract'),
]
