from decimal import Decimal
from rest_framework import views, status, permissions
from rest_framework.response import Response
from .models import Subscription, InvoiceRecord
from .serializers import SubscriptionSerializer, InvoiceRecordSerializer
from apps.audit.models import AuditLog

PLANS = [
    {
        "id": "FREE",
        "name": "Starter / Sandbox",
        "price_monthly": 0,
        "ai_credits": 100,
        "storage_gb": 1,
        "max_users": 2,
        "features": [
            "100 AI Document Extractions / mo",
            "Basic OCR & Field Parsing",
            "Up to 2 Team Members",
            "CSV & JSON Ledger Exports",
            "Community Support"
        ]
    },
    {
        "id": "PRO",
        "name": "Professional",
        "price_monthly": 79,
        "ai_credits": 1000,
        "storage_gb": 10,
        "max_users": 10,
        "popular": True,
        "features": [
            "1,000 AI Document Extractions / mo",
            "Advanced OCR & Table Extractor",
            "RAG AI Chat with Citations",
            "Automated Anomaly & Fraud Detection",
            "Up to 10 Team Members & RBAC",
            "Excel, CSV, PDF & JSON Exports",
            "Priority Support & 99.9% Uptime SLA"
        ]
    },
    {
        "id": "BUSINESS",
        "name": "Business Suite",
        "price_monthly": 249,
        "ai_credits": 5000,
        "storage_gb": 50,
        "max_users": 50,
        "features": [
            "5,000 AI Document Extractions / mo",
            "Full RAG & Semantic Vector Indexing",
            "Multi-Tenant Organization Management",
            "Custom Classification Rules",
            "Audit Trail & Compliance Logging",
            "Dedicated Slack & Email Support"
        ]
    },
    {
        "id": "ENTERPRISE",
        "name": "Enterprise Ultra",
        "price_monthly": 799,
        "ai_credits": 25000,
        "storage_gb": 500,
        "max_users": 999,
        "features": [
            "Unlimited AI Document Processing",
            "Dedicated Cloud / On-Premise Instance",
            "Custom LLM Fine-Tuning",
            "Enterprise SSO / SAML & SCIM",
            "24/7 Dedicated Financial AI Engineer",
            "Custom SLA & Regulatory Compliance"
        ]
    }
]

class PlansListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(PLANS)


class BillingOverviewView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        org = request.user.organization
        subscription, _ = Subscription.objects.get_or_create(
            organization=org,
            defaults={'status': 'ACTIVE'}
        )
        invoices = InvoiceRecord.objects.filter(organization=org)[:10]

        return Response({
            "current_plan": org.plan,
            "subscription": SubscriptionSerializer(subscription).data,
            "usage": {
                "ai_credits_limit": org.ai_credits_limit,
                "ai_credits_used": org.ai_credits_used,
                "ai_credits_pct": round((org.ai_credits_used / max(org.ai_credits_limit, 1)) * 100, 1),
                "storage_limit_mb": org.storage_limit_mb,
                "storage_used_mb": org.storage_used_mb,
                "storage_pct": round((org.storage_used_mb / max(org.storage_limit_mb, 1)) * 100, 1),
            },
            "invoices": InvoiceRecordSerializer(invoices, many=True).data,
            "plans": PLANS
        })


class UpgradePlanView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id', '').upper()
        matching_plan = next((p for p in PLANS if p['id'] == plan_id), None)
        
        if not matching_plan:
            return Response({'error': 'Invalid plan selected'}, status=status.HTTP_400_BAD_REQUEST)

        org = request.user.organization
        old_plan = org.plan
        org.plan = plan_id
        org.ai_credits_limit = matching_plan['ai_credits']
        org.storage_limit_mb = matching_plan['storage_gb'] * 1024
        org.save()

        # Create billing record
        if matching_plan['price_monthly'] > 0:
            InvoiceRecord.objects.create(
                organization=org,
                amount=Decimal(str(matching_plan['price_monthly'])),
                currency='USD',
                stripe_invoice_id=f"in_mock_{plan_id.lower()}_2026",
                status='PAID',
                billing_period=f"{matching_plan['name']} Subscription"
            )

        AuditLog.objects.create(
            organization=org,
            user=request.user,
            action='UPDATE_PLAN',
            document_name=f"{old_plan} -> {plan_id}",
            details=f"Upgraded organization subscription tier to {matching_plan['name']} (${matching_plan['price_monthly']}/mo)"
        )

        return Response({
            "message": f"Successfully switched to {matching_plan['name']}",
            "plan": org.plan,
            "ai_credits_limit": org.ai_credits_limit
        })
