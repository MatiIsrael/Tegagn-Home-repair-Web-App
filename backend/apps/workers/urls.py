from django.urls import path
from .views import (
    WorkerListView,
    WorkerDetailView,
    WorkerProfileMeView,
    WorkerServiceListCreateView,
    WorkerServiceDetailView,
)

app_name = 'workers'

urlpatterns = [
    path('', WorkerListView.as_view(), name='worker-list'),
    path('me/', WorkerProfileMeView.as_view(), name='worker-me'),
    path('services/', WorkerServiceListCreateView.as_view(), name='worker-services-list-create'),
    path('services/<uuid:pk>/', WorkerServiceDetailView.as_view(), name='worker-service-detail'),
    path('<uuid:pk>/', WorkerDetailView.as_view(), name='worker-detail'),
]
