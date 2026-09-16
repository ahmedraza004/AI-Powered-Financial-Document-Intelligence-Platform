from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        "status": "healthy",
        "service": "FinDoc Intelligence SaaS API",
        "version": "1.0.0",
        "ai_engine": "active" if bool(getattr(settings, 'OPENAI_API_KEY', None)) else "fallback_nlp_heuristic",
        "celery_eager": settings.CELERY_TASK_ALWAYS_EAGER,
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health_check'),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/documents/', include('apps.documents.urls')),
    path('api/processing/', include('apps.processing.urls')),
    path('api/ai/', include('apps.ai_engine.urls')),
    path('api/search/', include('apps.search_rag.urls')),
    path('api/anomalies/', include('apps.anomalies.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/audit/', include('apps.audit.urls')),
    path('api/billing/', include('apps.billing.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
