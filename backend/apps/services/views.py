from rest_framework import generics, permissions
from .models import ServiceCategory
from .serializers import ServiceCategorySerializer

class ServiceCategoryListView(generics.ListCreateAPIView):
    """
    - GET: Public listing of all active trade service categories.
    - POST: Admin creates a new trade category.
    """
    queryset = ServiceCategory.objects.filter(is_active=True)
    serializer_class = ServiceCategorySerializer
    pagination_class = None  # Full category menu for frontend filters

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class ServiceCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    - GET: Retrieve details for a single category via slug (Public).
    - PUT / PATCH: Update category details (Admin only).
    - DELETE: Remove/deactivate category (Admin only).
    """
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
