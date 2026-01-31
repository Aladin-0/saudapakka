from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, ExternalPropertyCreateView

router = DefaultRouter()
router.register(r'properties', PropertyViewSet, basename='property')

urlpatterns = [
    path('properties/external/create/', ExternalPropertyCreateView.as_view(), name='external-property-create'),
    path('', include(router.urls)),
]