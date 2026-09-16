from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    MeView,
    OrganizationDetailView,
    TeamMembersView,
    TeamMemberDetailView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='auth_me'),
    path('organization/', OrganizationDetailView.as_view(), name='auth_org_detail'),
    path('team/', TeamMembersView.as_view(), name='auth_team_members'),
    path('team/<uuid:pk>/', TeamMemberDetailView.as_view(), name='auth_team_member_detail'),
]
