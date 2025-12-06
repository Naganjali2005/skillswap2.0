"""
URL configuration for core project.

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

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from api.views import (
    RegisterView,
    MeView,
    recommendations_view,
    LearningRequestCreateView,
    IncomingRequestsView,
    OutgoingRequestsView,
    LearningRequestActionView,
    UserDetailView,
)



from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from api.views import RegisterView, MeView


urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth endpoints
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/me/", MeView.as_view(), name="me"),

    # Recommendations
    path("api/recommendations/", recommendations_view, name="recommendations"),

    # Learning requests
    path("api/requests/", LearningRequestCreateView.as_view(), name="request-create"),
    path(
        "api/requests/incoming/",
        IncomingRequestsView.as_view(),
        name="requests-incoming",
    ),
    path(
        "api/requests/outgoing/",
        OutgoingRequestsView.as_view(),
        name="requests-outgoing",
    ),
    path(
        "api/requests/<int:pk>/action/",
        LearningRequestActionView.as_view(),
        name="request-action",
    ),


        # User profile
    path("api/users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),

]

