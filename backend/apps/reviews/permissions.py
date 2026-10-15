from rest_framework import permissions

class CanReplyToReview(permissions.BasePermission):
    """Allows only the reviewed worker to post an official reply."""
    message = "Only the reviewed trade professional can reply to this review."

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'worker_profile') and 
            obj.worker == request.user.worker_profile
        )
