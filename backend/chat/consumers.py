from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json

from .models import Message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"chat_{self.room_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

        # System message when someone connects
        await self.send(
            text_data=json.dumps(
                {
                    "system": True,
                    "message": f"Connected to room {self.room_id}",
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
        Expect JSON: { "message": "...", "senderName": "learner1" }
        """
        data = json.loads(text_data or "{}")

        message = data.get("message", "").strip()
        sender_name = data.get("senderName", "Unknown")

        if not message:
            return

        # Save to DB and get created_at
        saved = await self.save_message(self.room_id, sender_name, message)

        # Broadcast to everyone in this room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.message",
                "message": saved.text,
                "senderName": saved.sender_name,
                "createdAt": saved.created_at.isoformat(),
            },
        )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "system": False,
                    "message": event["message"],
                    "senderName": event.get("senderName"),
                    "createdAt": event.get("createdAt"),
                }
            )
        )

    @database_sync_to_async
    def save_message(self, room_id, sender_name, text):
        return Message.objects.create(
            room_id=room_id,
            sender_name=sender_name,
            text=text,
        )
