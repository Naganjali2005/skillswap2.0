from django.db import models
from django.conf import settings  # to use Django's User model


# -----------------------------
#  SKILLS
# -----------------------------
class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class UserSkillHave(models.Model):
    LEVEL_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="skills_have",
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)

    def __str__(self):
        return f"{self.user.username} has {self.skill.name} ({self.level})"


class UserSkillWant(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="skills_want",
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} wants {self.skill.name}"


# -----------------------------
#  LEARNING REQUESTS
# -----------------------------
class LearningRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]

    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="learning_requests_sent",
        on_delete=models.CASCADE,
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="learning_requests_received",
        on_delete=models.CASCADE,
    )
    message = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default="pending"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.from_user.username} -> {self.to_user.username} ({self.status})"


# -----------------------------
#  CHAT (for after accept)
# -----------------------------
class Conversation(models.Model):
    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="conversations_as_user1",
        on_delete=models.CASCADE,
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="conversations_as_user2",
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # avoid duplicate conversation rows for same pair
        unique_together = ("user1", "user2")

    def __str__(self):
        return f"Conversation: {self.user1.username} & {self.user2.username}"


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        related_name="messages",
        on_delete=models.CASCADE,
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Msg from {self.sender.username} in conv {self.conversation.id}"
