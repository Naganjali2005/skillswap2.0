from django.contrib.auth import get_user_model

from .models import UserSkillHave, UserSkillWant
from ml.matcher import find_best_mentors  # your ML function

User = get_user_model()


def build_users_list_for_ml():
    """
    Read all users + their skills from DB,
    and convert into the list-of-dicts format expected by matcher.find_best_mentors.
    """
    users = (
        User.objects
        .all()
        .prefetch_related("skills_have__skill", "skills_want__skill")
    )

    users_list = []

    for user in users:
        skills_have = [
            {
                "name": ush.skill.name,
                "level": ush.level,
            }
            for ush in user.skills_have.all()
        ]

        skills_want = [
            usw.skill.name
            for usw in user.skills_want.all()
        ]

        users_list.append(
            {
                "id": user.id,
                "name": user.username,
                "skills_have": skills_have,
                "skills_want": skills_want,
            }
        )

    return users_list


def get_recommendations_for_user(current_user_id: int, top_k: int = 5):
    """
    This is the main function your view will call.
    It takes the user_id (current user),
    prepares the users list,
    runs the ML matcher,
    and returns the matched users.
    """
    users_list = build_users_list_for_ml()
    matches = find_best_mentors(current_user_id, users_list, top_k=top_k)
    return matches
