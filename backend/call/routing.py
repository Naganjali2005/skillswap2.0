from django.urls import re_path
from .consumers import CallConsumer

websocket_urlpatterns = [
    # ws://127.0.0.1:8000/ws/video/<room_name>/
    re_path(r"ws/video/(?P<room_name>\w+)/$", CallConsumer.as_asgi()),
]
