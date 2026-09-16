from django.urls import path
from .views import PlansListView, BillingOverviewView, UpgradePlanView

urlpatterns = [
    path('plans/', PlansListView.as_view(), name='billing_plans'),
    path('overview/', BillingOverviewView.as_view(), name='billing_overview'),
    path('upgrade/', UpgradePlanView.as_view(), name='billing_upgrade'),
]
