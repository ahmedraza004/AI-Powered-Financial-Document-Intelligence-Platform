from rest_framework import serializers
from .models import Subscription, InvoiceRecord

class SubscriptionSerializer(serializers.ModelSerializer):
    plan = serializers.CharField(source='organization.plan', read_only=True)
    ai_credits_limit = serializers.IntegerField(source='organization.ai_credits_limit', read_only=True)
    ai_credits_used = serializers.IntegerField(source='organization.ai_credits_used', read_only=True)

    class Meta:
        model = Subscription
        fields = [
            'id', 'plan', 'status', 'ai_credits_limit', 'ai_credits_used',
            'current_period_start', 'current_period_end', 'cancel_at_period_end',
            'created_at', 'updated_at'
        ]


class InvoiceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceRecord
        fields = [
            'id', 'amount', 'currency', 'stripe_invoice_id', 
            'status', 'pdf_url', 'billing_period', 'created_at'
        ]
