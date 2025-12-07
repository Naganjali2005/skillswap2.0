from django.db import models


class Message(models.Model):
    room_id = models.CharField(max_length=100)
    sender_name = models.CharField(max_length=150)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.room_id} - {self.sender_name}: {self.text[:20]}"
