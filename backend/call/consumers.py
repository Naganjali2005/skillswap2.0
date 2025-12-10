from channels.generic.websocket import AsyncWebsocketConsumer
import json


class CallConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"video_{self.room_name}"

        # join group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

        # simple system message so we know it works
        await self.send(
            text_data=json.dumps(
                {
                    "type": "system",
                    "message": f"Connected to video room {self.room_name}",
                }
            )
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive(self, text_data=None, bytes_data=None):
        """
        Later this will carry WebRTC signalling (offer/answer/ICE).
        For now, we just broadcast whatever we get.
        """
        if not text_data:
            return

        data = json.loads(text_data)

        # broadcast to all peers in same video room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "call.message",
                "data": data,
            },
        )

    async def call_message(self, event):
        # send message to WebSocket
        await self.send(text_data=json.dumps(event["data"]))
