from rest_framework import generics, permissions
from .models import AuditLog
from .serializers import AuditLogSerializer

class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = AuditLog.objects.filter(organization=self.request.user.organization)
        action = self.request.query_params.get('action')
        search = self.request.query_params.get('search')

        if action:
            qs = qs.filter(action=action.upper())
        if search:
            qs = qs.filter(document_name__icontains=search) | qs.filter(details__icontains=search)

        return qs[:100]
