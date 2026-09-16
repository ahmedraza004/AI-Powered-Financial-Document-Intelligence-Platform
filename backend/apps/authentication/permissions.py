from rest_framework import permissions

class IsOrgAdmin(permissions.BasePermission):
    """Allows access only to Admin users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class IsOrgManagerOrAbove(permissions.BasePermission):
    """Allows access to Admin and Manager users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'MANAGER'])

class CanUploadDocs(permissions.BasePermission):
    """Allows Admin, Manager, and Employee to upload documents."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'MANAGER', 'EMPLOYEE'])

class CanExportDocs(permissions.BasePermission):
    """Allows Admin, Manager, and Viewer to export reports."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'MANAGER', 'VIEWER'])
