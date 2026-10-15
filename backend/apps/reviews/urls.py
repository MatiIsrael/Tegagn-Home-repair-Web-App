from django.urls import path
from .views import ReviewListCreateView, ReviewDetailView, ReviewReplyView

app_name = 'reviews'

urlpatterns = [
    path('', ReviewListCreateView.as_view(), name='review-list-create'),
    path('<uuid:pk>/', ReviewDetailView.as_view(), name='review-detail'),
    path('<uuid:pk>/reply/', ReviewReplyView.as_view(), name='review-reply'),
]
