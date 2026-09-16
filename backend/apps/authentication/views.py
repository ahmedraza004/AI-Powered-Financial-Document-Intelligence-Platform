from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .models import Organization
from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    OrganizationSerializer, 
    InviteMemberSerializer
)
from .permissions import IsOrgAdmin

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': tokens,
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').lower()
        password = request.data.get('password', '')

        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                tokens = get_tokens_for_user(user)
                return Response({
                    'user': UserSerializer(user).data,
                    'tokens': tokens,
                    'message': 'Login successful'
                }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            pass

        return Response({
            'error': 'Invalid email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)


class MeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        data = request.data
        if 'name' in data:
            user.name = data['name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'title' in data:
            user.title = data['title']
        if 'avatar_url' in data:
            user.avatar_url = data['avatar_url']
        user.save()
        return Response(UserSerializer(user).data)


class OrganizationDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not request.user.organization:
            return Response({'error': 'User has no organization'}, status=status.HTTP_404_NOT_FOUND)
        serializer = OrganizationSerializer(request.user.organization)
        return Response(serializer.data)

    def patch(self, request):
        if not request.user.organization:
            return Response({'error': 'User has no organization'}, status=status.HTTP_404_NOT_FOUND)
        if request.user.role != 'ADMIN':
            return Response({'error': 'Admin permissions required'}, status=status.HTTP_403_FORBIDDEN)
        
        org = request.user.organization
        serializer = OrganizationSerializer(org, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeamMembersView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not request.user.organization:
            return Response([])
        members = request.user.organization.members.all().order_by('-created_at')
        return Response(UserSerializer(members, many=True).data)

    def post(self, request):
        if request.user.role not in ['ADMIN', 'MANAGER']:
            return Response({'error': 'Admin or Manager permissions required to invite members'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = InviteMemberSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            if User.objects.filter(email=data['email']).exists():
                return Response({'error': 'A user with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create user with temporary password
            new_user = User.objects.create_user(
                email=data['email'],
                name=data['name'],
                password='ChangeMe123!',
                role=data['role'],
                title=data.get('title', 'Financial Analyst'),
                organization=request.user.organization
            )
            return Response(UserSerializer(new_user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeamMemberDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsOrgAdmin]

    def patch(self, request, pk):
        try:
            member = User.objects.get(pk=pk, organization=request.user.organization)
            new_role = request.data.get('role')
            if new_role in dict(User.ROLE_CHOICES).keys():
                member.role = new_role
                member.save()
                return Response(UserSerializer(member).data)
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Member not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            member = User.objects.get(pk=pk, organization=request.user.organization)
            if member.id == request.user.id:
                return Response({'error': 'Cannot remove yourself'}, status=status.HTTP_400_BAD_REQUEST)
            member.delete()
            return Response({'message': 'Member removed successfully'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'Member not found'}, status=status.HTTP_404_NOT_FOUND)
