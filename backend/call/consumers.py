import json
from channels.generic.websocket import AsyncWebsocketConsumer


class CallConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # room_id from (?P<room_id>\w+) in routing
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"video_{self.room_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data or "{}")

        data_type = data.get("type")
        payload = data.get("payload")
        sender = data.get("sender")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "signal_message",
                "data_type": data_type,
                "payload": payload,
                "sender": sender,
            },
        )

    async def signal_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": event["data_type"],
                    "payload": event["payload"],
                    "sender": event["sender"],
                }
            )
        )
