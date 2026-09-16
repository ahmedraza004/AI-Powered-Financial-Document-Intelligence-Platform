from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Organization

User = get_user_model()

class OrganizationSerializer(serializers.ModelSerializer):
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'slug', 'plan', 
            'ai_credits_limit', 'ai_credits_used', 
            'storage_limit_mb', 'storage_used_mb', 
            'members_count', 'created_at', 'updated_at'
        ]

    def get_members_count(self, obj):
        return obj.members.count()


class UserSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'role', 
            'organization', 'avatar_url', 'phone', 'title', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    organization_name = serializers.CharField(max_length=255, required=False, default="FinCorp Global")
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='ADMIN')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return value.lower()

    def create(self, validated_data):
        org_name = validated_data.get('organization_name', 'FinCorp Global')
        org = Organization.objects.create(name=org_name, plan='PRO')
        
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            role=validated_data.get('role', 'ADMIN'),
            organization=org
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class InviteMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=255)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='EMPLOYEE')
    title = serializers.CharField(max_length=100, default='Financial Analyst')
