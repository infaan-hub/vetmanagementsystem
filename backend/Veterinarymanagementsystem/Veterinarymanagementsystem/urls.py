"""
URL configuration for Veterinarymanagementsystem project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Import auth views
from Vetmanagementsystem.auth_views import (
    ClientRegistrationView,
    ClientLoginView,
    DoctorRegistrationView,
    DoctorLoginView,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Auth APIs
    path('api/register/', ClientRegistrationView.as_view(), name='api-register'),
    path('api/login/', ClientLoginView.as_view(), name='api-login'),
    path('api/doctor/register/', DoctorRegistrationView.as_view(), name='api-doctor-register'),
    path('api/doctor/login/', DoctorLoginView.as_view(), name='api-doctor-login'),

    # JWT token endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # App URLs
    path('', include('Vetmanagementsystem.urls')),

    # DRF login (optional, browsable API)
    path('api-auth/', include('rest_framework.urls')),
]

# Media files (development only)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
