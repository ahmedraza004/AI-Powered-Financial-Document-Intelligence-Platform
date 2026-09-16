from rest_framework import serializers
from .models import AnomalyAlert

class AnomalyAlertSerializer(serializers.ModelSerializer):
    document_name = serializers.CharField(source='document.file_name', read_only=True)
    vendor_name = serializers.CharField(source='document.extracted_data.vendor_name', read_only=True)
    total_amount = serializers.DecimalField(source='document.extracted_data.total_amount', max_digits=14, decimal_places=2, read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.name', read_only=True)

    class Meta:
        model = AnomalyAlert
        fields = [
            'id', 'document', 'document_name', 'vendor_name', 'total_amount',
            'anomaly_type', 'severity', 'title', 'description', 
            'suggested_action', 'status', 'resolved_by_name', 
            'created_at', 'updated_at'
        ]
