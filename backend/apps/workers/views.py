from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import WorkerProfile, WorkerService
from .serializers import (
    WorkerProfileListSerializer,
    WorkerProfileDetailSerializer,
    WorkerProfileUpdateSerializer,
    WorkerProfileCreateSerializer,
    WorkerServiceSerializer,
)
from .filters import WorkerProfileFilter
from .permissions import IsWorkerProfileOwner, IsWorkerServiceOwner
from apps.accounts.permissions import IsWorker

class WorkerListView(generics.ListAPIView):
    """
    Public directory of trade service professionals.
    Supports comprehensive search by skill, category, city/location,
    price bounds, ratings, verification badges, and sorting.
    """
    queryset = WorkerProfile.objects.filter(is_available=True).select_related('user', 'primary_category')
    serializer_class = WorkerProfileListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_class = WorkerProfileFilter


class WorkerDetailView(generics.RetrieveAPIView):
    """Public storefront detail page for an individual worker."""
    queryset = WorkerProfile.objects.select_related('user', 'primary_category').prefetch_related('services')
    serializer_class = WorkerProfileDetailSerializer
    permission_classes = [permissions.AllowAny]


class WorkerProfileMeView(generics.GenericAPIView):
    """
    Retrieve, create, or update the trade profile for the currently authenticated user.
    - GET: Returns worker profile details (404 if user has no worker profile yet).
    - POST: Creates worker profile and elevates account to Worker role.
    - PATCH / PUT: Updates trade profile details (rates, bio, areas, skills, certifications).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return WorkerProfileCreateSerializer
        elif self.request.method in ['PUT', 'PATCH']:
            return WorkerProfileUpdateSerializer
        return WorkerProfileDetailSerializer

    def get(self, request, *args, **kwargs):
        if not hasattr(request.user, 'worker_profile'):
            return Response(
                {
                    "status": "error",
                    "status_code": status.HTTP_404_NOT_FOUND,
                    "message": "No trade worker profile found for this user account. Use POST to initialize your profile."
                },
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = WorkerProfileDetailSerializer(request.user.worker_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        if hasattr(request.user, 'worker_profile'):
            return Response(
                {
                    "status": "error",
                    "status_code": status.HTTP_400_BAD_REQUEST,
                    "message": "Worker profile already exists for this account. Use PATCH to update."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = WorkerProfileCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        worker_profile = serializer.save()
        return Response(
            {
                "status": "success",
                "message": "Trade worker profile created successfully.",
                "data": WorkerProfileDetailSerializer(worker_profile).data
            },
            status=status.HTTP_201_CREATED
        )

    def patch(self, request, *args, **kwargs):
        return self.update(request, partial=True)

    def put(self, request, *args, **kwargs):
        return self.update(request, partial=False)

    def update(self, request, partial=False):
        if not hasattr(request.user, 'worker_profile'):
            return Response(
                {
                    "status": "error",
                    "status_code": status.HTTP_404_NOT_FOUND,
                    "message": "No trade profile found to update. Use POST to initialize your profile."
                },
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = WorkerProfileUpdateSerializer(
            request.user.worker_profile,
            data=request.data,
            partial=partial
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "status": "success",
                "message": "Trade profile updated successfully.",
                "data": WorkerProfileDetailSerializer(request.user.worker_profile).data
            },
            status=status.HTTP_200_OK
        )


class WorkerServiceListCreateView(generics.ListCreateAPIView):
    """
    - GET: List services. If worker_id query param is supplied, returns public active services for that worker.
           If authenticated worker calls without worker_id, returns all services owned by that worker.
    - POST: Worker creates a new priced service for their own profile.
    """
    serializer_class = WorkerServiceSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsWorker()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        worker_id = self.request.query_params.get('worker_id')
        if worker_id:
            return WorkerService.objects.filter(worker_id=worker_id, is_active=True).select_related('category', 'worker__user')

        user = self.request.user
        if user.is_authenticated and hasattr(user, 'worker_profile'):
            return WorkerService.objects.filter(worker=user.worker_profile).select_related('category', 'worker__user')

        return WorkerService.objects.none()

    def list(self, request, *args, **kwargs):
        worker_id = request.query_params.get('worker_id')
        if not worker_id and (not request.user.is_authenticated or not hasattr(request.user, 'worker_profile')):
            return Response(
                {
                    "status": "error",
                    "status_code": status.HTTP_400_BAD_REQUEST,
                    "message": "Provide a 'worker_id' query parameter to view public services, or authenticate as a worker."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save()


class WorkerServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    - GET: Retrieve a service by UUID (public if active, or owner).
    - PUT / PATCH: Update service (only the owning worker).
    - DELETE: Delete service (only the owning worker).
    """
    serializer_class = WorkerServiceSerializer
    queryset = WorkerService.objects.select_related('category', 'worker__user')

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsWorker(), IsWorkerServiceOwner()]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {
                "status": "success",
                "message": "Worker service deleted successfully."
            },
            status=status.HTTP_200_OK
        )
