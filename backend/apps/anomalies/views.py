from rest_framework import views, generics, status, permissions
from rest_framework.response import Response
from .models import AnomalyAlert
from .serializers import AnomalyAlertSerializer

class AnomalyListView(generics.ListAPIView):
    serializer_class = AnomalyAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = AnomalyAlert.objects.filter(organization=self.request.user.organization)
        status_filter = self.request.query_params.get('status')
        severity = self.request.query_params.get('severity')
        if status_filter:
            qs = qs.filter(status=status_filter.upper())
        if severity:
            qs = qs.filter(severity=severity.upper())
        return qs


class AnomalyActionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            alert = AnomalyAlert.objects.get(pk=pk, organization=request.user.organization)
            new_status = request.data.get('status', '').upper()
            if new_status in ['RESOLVED', 'DISMISSED', 'OPEN']:
                alert.status = new_status
                if new_status in ['RESOLVED', 'DISMISSED']:
                    alert.resolved_by = request.user
                else:
                    alert.resolved_by = None
                alert.save()
                return Response(AnomalyAlertSerializer(alert).data)
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        except AnomalyAlert.DoesNotExist:
            return Response({'error': 'Alert not found'}, status=status.HTTP_404_NOT_FOUND)
