import uuid
from django.db import models
from django.conf import settings
from apps.authentication.models import Organization
from apps.documents.models import Document

class AnomalyAlert(models.Model):
    ANOMALY_TYPES = [
        ('DUPLICATE_INVOICE', 'Duplicate Invoice Detected'),
        ('UNUSUAL_AMOUNT', 'Unusual Spending Spike / Outlier'),
        ('TAX_MISMATCH', 'Tax Calculation Discrepancy'),
        ('VENDOR_DISCREPANCY', 'Unrecognized Vendor Account'),
        ('LATE_PAYMENT_RISK', 'Immediate Late Payment Risk'),
    ]

    SEVERITY_CHOICES = [
        ('HIGH', 'High Severity'),
        ('MEDIUM', 'Medium Severity'),
        ('LOW', 'Low Severity'),
    ]

    STATUS_CHOICES = [
        ('OPEN', 'Open Alert'),
        ('RESOLVED', 'Resolved'),
        ('DISMISSED', 'Dismissed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='anomalies')
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='anomalies')
    anomaly_type = models.CharField(max_length=30, choices=ANOMALY_TYPES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='MEDIUM')
    title = models.CharField(max_length=255)
    description = models.TextField()
    suggested_action = models.TextField(blank=True, default='')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='OPEN')
    resolved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity}] {self.title} - {self.document.file_name}"
