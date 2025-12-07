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
)
from .services import get_recommendations_for_user
from .models import LearningRequest, Conversation

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

    # Call ML + DB glue function
    matches = get_recommendations_for_user(current_user_id=user_id, top_k=5)

    # Format output
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

        # avoid duplicate pending or accepted requests
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
                role = "learner"  # current user is learner
            else:
                other = lr.from_user
                role = "teacher"  # current user is teacher

            # try to find existing conversation between the two users (if any)
            conv = Conversation.objects.filter(
                Q(user1=request.user, user2=other)
                | Q(user1=other, user2=request.user)
            ).first()

            results.append(
                {
                    "id": lr.id,  # learning request id
                    "other_user_id": other.id,
                    "other_user_username": other.username,
                    "other_user_email": other.email,
                    "status": lr.status,  # should be "accepted"
                    "role": role,  # "learner" or "teacher" from current user's view
                    "created_at": lr.created_at,
                    "conversation_id": conv.id if conv else None,
                }
            )

        return Response(results)



class LearningRequestActionView(APIView):
    """
    POST /api/requests/<id>/action/
    Body: { "action": "accept" } or { "action": "reject" }
    Only the to_user (teacher) can perform this.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        action = request.data.get("action")

        try:
            lr = LearningRequest.objects.get(pk=pk, to_user=request.user)
        except LearningRequest.DoesNotExist:
            return Response(
                {"detail": "Request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if lr.status != "pending":
            return Response(
                {"detail": "Request is already processed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if action not in ["accept", "reject"]:
            return Response(
                {"detail": "Invalid action."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if action == "accept":
            lr.status = "accepted"
            lr.save()

            # ensure conversation exists between both users
            u1, u2 = sorted([lr.from_user, lr.to_user], key=lambda u: u.id)
            conv, created = Conversation.objects.get_or_create(
                user1=u1, user2=u2
            )

            return Response(
                {
                    "detail": "Request accepted.",
                    "conversation_id": conv.id,
                }
            )

        else:  # reject
            lr.status = "rejected"
            lr.save()
            return Response({"detail": "Request rejected."})
