from django.urls import re_path
from .consumers import CallConsumer

# ws://127.0.0.1:8000/ws/video/room123/
websocket_urlpatterns = [
    re_path(r"ws/video/(?P<room_id>\w+)/$", CallConsumer.as_asgi()),
]
