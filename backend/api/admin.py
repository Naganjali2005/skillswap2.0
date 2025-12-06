from django.contrib import admin
from .models import Skill, UserSkillHave, UserSkillWant


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
