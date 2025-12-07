from django.urls import path
from .views import MessageListView

urlpatterns = [
    # /api/chat/<room_id>/messages/
    path("chat/<str:room_id>/messages/", MessageListView.as_view(), name="chat-messages"),
]
