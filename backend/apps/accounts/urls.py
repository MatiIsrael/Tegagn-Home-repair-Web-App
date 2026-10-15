from django.urls import path
from .views import (
    CustomerRegistrationView,
    WorkerRegistrationView,
    CustomTokenObtainPairView,
    UserProfileView,
    LogoutView,
)

app_name = 'accounts'

urlpatterns = [
    path('register/customer/', CustomerRegistrationView.as_view(), name='register-customer'),
    path('register/worker/', WorkerRegistrationView.as_view(), name='register-worker'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', UserProfileView.as_view(), name='user-profile'),
]
