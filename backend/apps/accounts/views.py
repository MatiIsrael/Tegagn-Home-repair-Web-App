from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import (
    CustomerRegistrationSerializer,
    WorkerRegistrationSerializer,
    UserDetailSerializer,
    UserProfileUpdateSerializer,
    CustomTokenObtainPairSerializer,
    LogoutSerializer,
)

class CustomerRegistrationView(generics.CreateAPIView):
    """Public endpoint for customer account creation."""
    serializer_class = CustomerRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "status": "success",
                "message": "Customer account registered successfully.",
                "data": UserDetailSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )


class WorkerRegistrationView(generics.CreateAPIView):
    """Public endpoint for worker registration with initial trade profile."""
    serializer_class = WorkerRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "status": "success",
                "message": "Trade professional registered and profile initialized.",
                "data": UserDetailSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    """Authenticate with email and password to receive JWT credentials."""
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve or update currently authenticated user."""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserProfileUpdateSerializer
        return UserDetailSerializer

    def get_object(self):
        return self.request.user


class LogoutView(generics.GenericAPIView):
    """Securely invalidates the provided refresh token on server logout."""
    serializer_class = LogoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "status": "success",
                "message": "Successfully logged out. Refresh token has been blacklisted."
            },
            status=status.HTTP_200_OK
        )
