# Vetmanagementsystem/auth_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .models import Client

User = get_user_model()


class ClientRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Register a new customer/client.
        POST /api/register/
        """
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        full_name = request.data.get('full_name')

        # Validate input
        if not all([username, email, password, full_name]):
            return Response(
                {"detail": "Missing required fields: username, email, password, full_name"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user exists
        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "Username already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"detail": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user (not staff = customer)
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_staff=False
            )

            # Create client profile
            client = Client.objects.create(
                user=user,
                full_name=full_name
            )

            return Response({
                "detail": "Registration successful. You can now login.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": "customer"
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ClientLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Customer/Client login via JWT tokens.
        POST /api/login/
        """
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {"detail": "Missing username or password"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if user is a customer (not staff)
        if user.is_staff:
            return Response(
                {"detail": "This account is for doctors. Please use doctor login."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': 'customer'
            }
        }, status=status.HTTP_200_OK)


class DoctorRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Register a new doctor (staff user).
        POST /api/doctor/register/
        """
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        # Validate input
        if not all([username, email, password]):
            return Response(
                {"detail": "Missing required fields: username, email, password"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user exists
        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "Username already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"detail": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create doctor user (staff=True)
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_staff=True,
                is_active=True
            )

            return Response({
                "detail": "Doctor registration successful. You can now login.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": "doctor"
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class DoctorLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Doctor login via JWT tokens.
        POST /api/doctor/login/
        """
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {"detail": "Missing username or password"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if user is a doctor (staff)
        if not user.is_staff:
            return Response(
                {"detail": "This account is for customers. Please use customer login."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': 'doctor'
            }
        }, status=status.HTTP_200_OK)
