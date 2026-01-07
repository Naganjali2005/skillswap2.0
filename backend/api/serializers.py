from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import (
    LearningRequest,
    Skill,
    UserSkillHave,
    UserSkillWant,
    UserProfile,
)

User = get_user_model()


# -------------------------------
#   BASIC USER SERIALIZERS
# -------------------------------

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="This email is already in use by another account."
            )
        ]
    )

    class Meta:
        model = User
        fields = ["id", "username", "email"]



class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="An account with this email already exists."
            )
        ]
    )

    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )


# -------------------------------
#   SKILLS
# -------------------------------

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]


class UserSkillHaveSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name", read_only=True)

    class Meta:
        model = UserSkillHave
        fields = ["id", "skill_name", "level"]


class UserSkillWantSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name", read_only=True)

    class Meta:
        model = UserSkillWant
        fields = ["id", "skill_name"]


# -------------------------------
#   USER PROFILE
# -------------------------------

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
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "skills_have",
            "skills_want",
            "profile",
        ]


# -------------------------------
#   LEARNING REQUESTS
# -------------------------------

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


# -------------------------------
#   USER SEARCH
# -------------------------------

class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]
