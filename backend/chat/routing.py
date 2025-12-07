from django.urls import re_path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    # ws://127.0.0.1:8000/ws/chat/1/
    re_path(r"ws/chat/(?P<room_id>\w+)/$", ChatConsumer.as_asgi()),
]
