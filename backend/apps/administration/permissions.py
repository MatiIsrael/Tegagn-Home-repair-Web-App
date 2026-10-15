from rest_framework import permissions

class IsPlatformAdministrator(permissions.BasePermission):
    """
    Enforces strict administrator-only access.
    
    Security Guarantees:
    1. Verifies database-backed user identity via server-side session/JWT authentication.
    2. Completely ignores any client-supplied role values in request bodies, headers, or query parameters.
    3. Requires active account status (is_active=True).
    4. Validates that user has role='admin', is_staff=True, or is_superuser=True.
    """
    message = "Administrator privileges required. Access denied."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if not user.is_active:
            return False

        # Strictly check database model attributes, ignoring client input
        is_admin_role = getattr(user, 'role', None) == 'admin'
        is_staff_or_super = bool(user.is_staff or user.is_superuser)

        return is_admin_role or is_staff_or_super
