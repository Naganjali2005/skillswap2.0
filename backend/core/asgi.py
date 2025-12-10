import os

from django.core.asgi import get_asgi_application

# 1) Configure Django settings FIRST
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django_asgi_app = get_asgi_application()

# 2) Now it is safe to import channels + your routing modules
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

from chat.routing import websocket_urlpatterns as chat_ws
from call.routing import websocket_urlpatterns as call_ws


# 3) Combine chat + video websocket routes
websocket_urlpatterns = chat_ws + call_ws


# 4) Final ASGI application
application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        ),
    }
)
