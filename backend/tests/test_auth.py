import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.authentication.models import Organization

User = get_user_model()

@pytest.mark.django_db
class TestAuthentication:
    def setup_method(self):
        self.client = APIClient()

    def test_user_registration(self):
        payload = {
            "name": "David Miller",
            "email": "david@fintech.test",
            "password": "Password123!",
            "organization_name": "Miller Financial Holdings",
            "role": "ADMIN"
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        assert response.status_code == 201
        assert response.data['user']['email'] == 'david@fintech.test'
        assert 'tokens' in response.data
        assert 'access' in response.data['tokens']

    def test_user_login(self):
        org = Organization.objects.create(name="Apex Ventures")
        User.objects.create_user(
            email="login@fintech.test",
            password="SecurePassword99!",
            name="Login Tester",
            organization=org
        )

        response = self.client.post('/api/auth/login/', {
            "email": "login@fintech.test",
            "password": "SecurePassword99!"
        }, format='json')

        assert response.status_code == 200
        assert response.data['user']['name'] == 'Login Tester'
        assert 'access' in response.data['tokens']

    def test_invalid_login(self):
        response = self.client.post('/api/auth/login/', {
            "email": "nonexistent@fintech.test",
            "password": "WrongPassword!"
        }, format='json')
        assert response.status_code == 401
