import uuid
from django.db import models
from django.conf import settings
from apps.authentication.models import Organization

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('UPLOAD_DOCUMENT', 'Uploaded Document'),
        ('EDIT_DOCUMENT', 'Edited Document Metadata'),
        ('DELETE_DOCUMENT', 'Deleted Document'),
        ('EXPORT_DATA', 'Exported Financial Ledger'),
        ('SEARCH_QUERY', 'Performed Semantic Search'),
        ('RESOLVE_ANOMALY', 'Resolved Anomaly Alert'),
        ('INVITE_MEMBER', 'Invited Team Member'),
        ('UPDATE_ROLE', 'Updated User Permissions'),
        ('UPDATE_PLAN', 'Upgraded Subscription Tier'),
        ('DOCUMENT_PROCESSED', 'AI Pipeline Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='audit_logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=40, choices=ACTION_CHOICES)
    document_name = models.CharField(max_length=255, blank=True, default='')
    details = models.TextField(blank=True, default='')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        actor = self.user.name if self.user else "System"
        return f"{self.timestamp.strftime('%Y-%m-%d %H:%M')} | {actor} -> {self.action}"
