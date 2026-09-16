from rest_framework import serializers
from .models import Document, ExtractedData, AISummary
from apps.authentication.serializers import UserSerializer

class ExtractedDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtractedData
        fields = [
            'id', 'vendor_name', 'invoice_number', 
            'issue_date', 'due_date', 'currency', 
            'subtotal', 'tax_amount', 'total_amount', 
            'confidence_score', 'line_items', 'bank_info', 'raw_json',
            'created_at', 'updated_at'
        ]


class AISummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = AISummary
        fields = [
            'id', 'executive_summary', 'key_insights', 
            'risk_assessment', 'financial_ratios', 'created_at'
        ]


class DocumentListSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.CharField(source='user.name', read_only=True)
    total_amount = serializers.DecimalField(source='extracted_data.total_amount', max_digits=14, decimal_places=2, read_only=True)
    vendor_name = serializers.CharField(source='extracted_data.vendor_name', read_only=True)
    confidence_score = serializers.FloatField(source='extracted_data.confidence_score', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'file_name', 'file_url', 'file_size', 'mime_type', 
            'status', 'doc_type', 'page_count', 'uploaded_by', 
            'vendor_name', 'total_amount', 'confidence_score',
            'created_at', 'updated_at'
        ]

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class DocumentDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    extracted_data = ExtractedDataSerializer(read_only=True)
    ai_summary = AISummarySerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    anomalies = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'file_name', 'file', 'file_url', 'file_size', 'mime_type', 
            'status', 'doc_type', 'page_count', 'ocr_text', 'processing_error',
            'metadata', 'user', 'extracted_data', 'ai_summary', 'anomalies',
            'created_at', 'updated_at'
        ]

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_anomalies(self, obj):
        from apps.anomalies.serializers import AnomalyAlertSerializer
        anomalies = obj.anomalies.all()
        return AnomalyAlertSerializer(anomalies, many=True).data


class DocumentUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    doc_type = serializers.CharField(required=False, default='UNKNOWN')
