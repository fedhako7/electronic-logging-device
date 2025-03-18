from django.urls import path
from .views import TripAPIView

urlpatterns = [
    path('api/trips/', TripAPIView.as_view(), name='trip-api'),
]