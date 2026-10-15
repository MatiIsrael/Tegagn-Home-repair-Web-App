from django.urls import path
from .views import ServiceCategoryListView, ServiceCategoryDetailView

app_name = 'services'

urlpatterns = [
    path('', ServiceCategoryListView.as_view(), name='category-list'),
    path('<slug:slug>/', ServiceCategoryDetailView.as_view(), name='category-detail'),
]
