from django.urls import re_path
from .consumers import ChatConsumer
from call.consumers import CallConsumer   # 👈 only import extra class

websocket_urlpatterns = [
    # Chat WebSocket (existing, untouched)
    # ws://127.0.0.1:8000/ws/chat/1/
    re_path(r"ws/chat/(?P<room_id>\w+)/$", ChatConsumer.as_asgi()),

    # Video call WebSocket (NEW)
    # ws://127.0.0.1:8000/ws/video/testroom/
    re_path(r"ws/video/(?P<room_id>\w+)/$", CallConsumer.as_asgi()),
]
