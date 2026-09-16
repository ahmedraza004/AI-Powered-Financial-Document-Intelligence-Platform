import uuid
from django.db import models
from django.conf import settings
from apps.authentication.models import Organization

class Document(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    DOC_TYPE_CHOICES = [
        ('INVOICE', 'Invoice'),
        ('RECEIPT', 'Receipt'),
        ('TAX_FORM', 'Tax Document / Form'),
        ('CONTRACT', 'Contract / Agreement'),
        ('PURCHASE_ORDER', 'Purchase Order'),
        ('BANK_STATEMENT', 'Bank Statement'),
        ('BALANCE_SHEET', 'Balance Sheet'),
        ('AUDIT_REPORT', 'Audit Report'),
        ('FINANCIAL_REPORT', 'Financial Report'),
        ('UNKNOWN', 'Unclassified'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='documents')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='documents/%Y/%m/%d/')
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField(default=0)
    mime_type = models.CharField(max_length=100, default='application/pdf')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    doc_type = models.CharField(max_length=30, choices=DOC_TYPE_CHOICES, default='UNKNOWN')
    page_count = models.IntegerField(default=1)
    ocr_text = models.TextField(blank=True, default='')
    processing_error = models.TextField(blank=True, default='')
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.file_name} ({self.status}) - {self.organization.name}"


class ExtractedData(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.OneToOneField(Document, on_delete=models.CASCADE, related_name='extracted_data')
    vendor_name = models.CharField(max_length=255, blank=True, default='')
    invoice_number = models.CharField(max_length=100, blank=True, default='')
    issue_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    currency = models.CharField(max_length=10, default='USD')
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    confidence_score = models.FloatField(default=0.95)
    line_items = models.JSONField(default=list, blank=True)
    bank_info = models.JSONField(default=dict, blank=True)
    raw_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Extraction for {self.document.file_name} - ${self.total_amount or 0}"


class AISummary(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.OneToOneField(Document, on_delete=models.CASCADE, related_name='ai_summary')
    executive_summary = models.TextField()
    key_insights = models.JSONField(default=list, blank=True)
    risk_assessment = models.TextField(blank=True, default='')
    financial_ratios = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Summary for {self.document.file_name}"
