from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    LearningRequest,
    Skill,
    UserSkillHave,
    UserSkillWant,
    UserProfile,
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )


# ---------- Skills / Profile detail ----------

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]


class UserSkillHaveSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name")

    class Meta:
        model = UserSkillHave
        fields = ["id", "skill_name", "level"]


class UserSkillWantSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name")

    class Meta:
        model = UserSkillWant
        fields = ["id", "skill_name"]


class UserDetailSerializer(serializers.ModelSerializer):
    skills_have = UserSkillHaveSerializer(many=True, read_only=True)
    skills_want = UserSkillWantSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "skills_have", "skills_want"]


# ---------- Learning Requests ----------

class LearningRequestSerializer(serializers.ModelSerializer):
    from_user_username = serializers.CharField(
        source="from_user.username", read_only=True
    )
    to_user_username = serializers.CharField(
        source="to_user.username", read_only=True
    )

    class Meta:
        model = LearningRequest
        fields = [
            "id",
            "from_user",
            "from_user_username",
            "to_user",
            "to_user_username",
            "message",
            "status",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "from_user",
            "status",
            "created_at",
            "from_user_username",
            "to_user_username",
        ]

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "github_url",
            "linkedin_url",
            "leetcode_url",
            "portfolio_url",
            "resume_url",
        ]
class UserDetailSerializer(serializers.ModelSerializer):
    skills_have = UserSkillHaveSerializer(many=True, read_only=True)
    skills_want = UserSkillWantSerializer(many=True, read_only=True)
    profile = UserProfileSerializer(read_only=True)  # 👈 new

    class Meta:
        model = User
        fields = ["id", "username", "email", "skills_have", "skills_want", "profile"]

class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]
