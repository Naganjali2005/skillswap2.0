from django.shortcuts import render
from django.db.models import Q

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from django.contrib.auth import get_user_model

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    LearningRequestSerializer,
    UserDetailSerializer,
    UserProfileSerializer,
)
from .services import get_recommendations_for_user
from .models import (
    LearningRequest,
    Conversation,
    Skill,
    UserSkillHave,
    UserSkillWant,
     UserProfile,
    
)


User = get_user_model()


# -------------------------------
#   SIGNUP (REGISTER)
# -------------------------------
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User registered successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------------------
#   CURRENT USER DETAILS
# -------------------------------
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    

class ProfileLinksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get or create a profile for this user
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def post(self, request):
        # Update profile with incoming data
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        # If validation fails, return 400 with errors
        return Response(serializer.errors, status=400)




# -------------------------------
#   USER PROFILE DETAIL
# -------------------------------
class UserDetailView(APIView):
    """
    GET /api/users/<id>/
    View another user's public profile + skills
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = UserDetailSerializer(user)
        return Response(serializer.data)


# -------------------------------
#   RECOMMENDATIONS (ML MATCHING)
# -------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recommendations_view(request):
    """
    GET /api/recommendations/
    Uses the currently logged-in user (request.user)
    """
    user = request.user
    user_id = user.id

    matches = get_recommendations_for_user(current_user_id=user_id, top_k=5)

    result = []
    for item in matches:
        u = item["user"]
        score = item["score"]

        result.append(
            {
                "id": u["id"],
                "name": u["name"],
                "score": score,
                "skills_have": u["skills_have"],
                "skills_want": u["skills_want"],
            }
        )

    return Response(result)



# -------------------------------
#   SKILLS: LIST ALL SKILLS
# -------------------------------

class SkillsListView(APIView):
    """
    GET /api/skills/
    Returns the list of all skills (for selection in frontend).
    You will add/edit skills in Django admin only.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .serializers import SkillSerializer

        qs = Skill.objects.all().order_by("name")
        serializer = SkillSerializer(qs, many=True)
        return Response(serializer.data)



# -------------------------------
#   LEARNING REQUESTS
# -------------------------------
class LearningRequestCreateView(APIView):
    """
    POST /api/requests/
    Body: { "to_user_id": 5, "message": "Hi, I want to learn from you" }
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        to_user_id = request.data.get("to_user_id")
        message = request.data.get("message", "")

        if not to_user_id:
            return Response(
                {"detail": "to_user_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            to_user = User.objects.get(id=to_user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "Target user not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if to_user == request.user:
            return Response(
                {"detail": "You cannot send a request to yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if LearningRequest.objects.filter(
            from_user=request.user,
            to_user=to_user,
            status__in=["pending", "accepted"],
        ).exists():
            return Response(
                {
                    "detail": (
                        "You already have a pending or accepted "
                        "connection with this user."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        lr = LearningRequest.objects.create(
            from_user=request.user,
            to_user=to_user,
            message=message,
        )

        serializer = LearningRequestSerializer(lr)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class IncomingRequestsView(APIView):
    """
    GET /api/requests/incoming/
    Requests where current user is the teacher (to_user)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = LearningRequest.objects.filter(
            to_user=request.user
        ).order_by("-created_at")
        serializer = LearningRequestSerializer(qs, many=True)
        return Response(serializer.data)


class OutgoingRequestsView(APIView):
    """
    GET /api/requests/outgoing/
    Requests current user has sent
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = LearningRequest.objects.filter(
            from_user=request.user
        ).order_by("-created_at")
        serializer = LearningRequestSerializer(qs, many=True)
        return Response(serializer.data)


class ConnectionsView(APIView):
    """
    GET /api/connections/
    List all accepted learning relationships for the current user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = (
            LearningRequest.objects.filter(status="accepted")
            .filter(
                Q(from_user=request.user) | Q(to_user=request.user)
            )
            .select_related("from_user", "to_user")
            .order_by("-created_at")
        )

        results = []
        for lr in qs:
            if lr.from_user == request.user:
                other = lr.to_user
                role = "learner"
            else:
                other = lr.from_user
                role = "teacher"

            conv = Conversation.objects.filter(
                Q(user1=request.user, user2=other)
                | Q(user1=other, user2=request.user)
            ).first()

            results.append(
                {
                    "id": lr.id,
                    "other_user_id": other.id,
                    "other_user_username": other.username,
                    "other_user_email": other.email,
                    "status": lr.status,
                    "role": role,
                    "created_at": lr.created_at,
                    "conversation_id": conv.id if conv else None,
                }
            )

        return Response(results)


class LearningRequestActionView(APIView):
    """
    POST /api/requests/<id>/action/
    Body: { "action": "accept" | "reject" | "cancel" }

    - accept / reject → only the receiver (to_user)
    - cancel          → only the sender   (from_user)
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        action = request.data.get("action")

        if action not in ["accept", "reject", "cancel"]:
            return Response(
                {"detail": "Invalid action."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1) Always find by id
        try:
            lr = LearningRequest.objects.get(pk=pk)
        except LearningRequest.DoesNotExist:
            return Response(
                {"detail": "Request not found (NEW VIEW)."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # 2) Permission + behaviour per action

        # ACCEPT / REJECT → only receiver (teacher)
        if action in ["accept", "reject"]:
            if lr.to_user != request.user:
                return Response(
                    {"detail": "Not allowed for this user."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if lr.status != "pending":
                return Response(
                    {"detail": "Request already processed."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if action == "accept":
                lr.status = "accepted"
                lr.save()

                u1, u2 = sorted(
                    [lr.from_user, lr.to_user],
                    key=lambda u: u.id
                )
                conv, created = Conversation.objects.get_or_create(
                    user1=u1, user2=u2
                )

                return Response(
                    {
                        "detail": "Request accepted.",
                        "conversation_id": conv.id,
                    }
                )

            lr.status = "rejected"
            lr.save()
            return Response({"detail": "Request rejected."})

        # CANCEL → only sender (learner)
        if action == "cancel":
            if lr.from_user != request.user:
                return Response(
                    {"detail": "Not allowed for this user."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            lr.delete()
            return Response({"detail": "Request cancelled."})
        

# -------------------------------
#   SKILLS: MY SKILLS (HAVE + WANT)
# -------------------------------

# -------------------------------
#   SKILLS: MY SKILLS (HAVE + WANT)
# -------------------------------

class MySkillsView(APIView):
    """
    GET  /api/my-skills/
        -> returns skills user has & wants

    POST /api/my-skills/
        Body:
        {
          "have": [
            {"skill_id": 1, "level": "beginner"},
            {"skill_id": 2, "level": "advanced"}
          ],
          "want": [
            {"skill_id": 3},
            {"skill_id": 4}
          ]
        }
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        have_qs = (
            UserSkillHave.objects
            .filter(user=request.user)
            .select_related("skill")
            .order_by("skill__name")
        )
        want_qs = (
            UserSkillWant.objects
            .filter(user=request.user)
            .select_related("skill")
            .order_by("skill__name")
        )

        have_data = [
            {
                "id": h.id,
                "skill_id": h.skill.id,
                "skill_name": h.skill.name,
                "level": h.level,   # beginner / intermediate / advanced
            }
            for h in have_qs
        ]

        want_data = [
            {
                "id": w.id,
                "skill_id": w.skill.id,
                "skill_name": w.skill.name,
            }
            for w in want_qs
        ]

        return Response({"have": have_data, "want": want_data})

    def post(self, request):
        # expect: { "have": [ {...} ], "want": [ {...} ] }
        have_list = request.data.get("have", [])
        want_list = request.data.get("want", [])

        if not isinstance(have_list, list) or not isinstance(want_list, list):
            return Response(
                {"detail": "Fields 'have' and 'want' must be lists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # collect all skill_ids referenced
        have_ids = [item.get("skill_id") for item in have_list if item.get("skill_id")]
        want_ids = [item.get("skill_id") for item in want_list if item.get("skill_id")]
        all_ids = set(have_ids + want_ids)

        skills = Skill.objects.filter(id__in=all_ids)
        skill_map = {s.id: s for s in skills}

        # clear previous skills for this user
        UserSkillHave.objects.filter(user=request.user).delete()
        UserSkillWant.objects.filter(user=request.user).delete()

        # "have" with levels
        for item in have_list:
            sid = item.get("skill_id")
            if not sid or sid not in skill_map:
                continue

            level = item.get("level", "intermediate")
            if level not in ["beginner", "intermediate", "advanced"]:
                level = "intermediate"

            UserSkillHave.objects.create(
                user=request.user,
                skill=skill_map[sid],
                level=level,
            )

        # "want"
        for item in want_list:
            sid = item.get("skill_id")
            if not sid or sid not in skill_map:
                continue

            UserSkillWant.objects.create(
                user=request.user,
                skill=skill_map[sid],
            )

        # return fresh data so frontend can update its state
        return self.get(request)



class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = request.query_params.get("q", "").strip()

        if not q:
            return Response([])

        queryset = (
            User.objects.filter(
                Q(username__icontains=q)
                | Q(first_name__icontains=q)
                | Q(last_name__icontains=q)
            )
            .exclude(id=request.user.id)  # don’t show yourself
            .order_by("username")[:20]    # limit some results
        )

        serializer = UserSearchSerializer(queryset, many=True)
        return Response(serializer.data)