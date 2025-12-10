from django.contrib import admin
from .models import Skill, UserSkillHave, UserSkillWant, LearningRequest, Conversation, UserProfile


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(UserSkillHave)
class UserSkillHaveAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "skill", "level")
    list_filter = ("level", "skill")
    search_fields = ("user__username", "skill__name")


@admin.register(UserSkillWant)
class UserSkillWantAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "skill")
    search_fields = ("user__username", "skill__name")


@admin.register(LearningRequest)
class LearningRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "from_user", "to_user", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("from_user__username", "to_user__username")


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "user1", "user2", "created_at")
    search_fields = ("user1__username", "user2__username")


from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "github_url", "linkedin_url", "leetcode_url")
