from rest_framework import permissions

class IsCustomer(permissions.BasePermission):
    """Allows access only to authenticated users with the Customer role."""
    message = "Only registered customers can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'customer' or request.user.is_staff or request.user.is_superuser)
        )


class IsWorker(permissions.BasePermission):
    """Allows access only to authenticated users with the Worker role."""
    message = "Only registered trade professionals can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'worker' or request.user.is_staff or request.user.is_superuser)
        )


class IsAdministrator(permissions.BasePermission):
    """Allows access only to staff/admin users."""
    message = "Administrative credentials required for this endpoint."

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'admin' or request.user.is_staff or request.user.is_superuser)
        )


class IsAccountOwnerOrAdmin(permissions.BasePermission):
    """Object-level permission allowing users to edit only their own profile."""
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or (hasattr(request.user, 'role') and request.user.role == 'admin'):
            return True
        return obj == request.user or (hasattr(obj, 'user') and obj.user == request.user)
