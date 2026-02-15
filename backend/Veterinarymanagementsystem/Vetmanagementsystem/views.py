# Vetmanagementsystem/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission, SAFE_METHODS
from rest_framework import status
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import (
    Client, Patient, Appointment, Receipt, Visit, AllergyAlert, VitalSigns,
    ClientCommunicationNote, ClientNote, Medication, Document, TreatmentPlan,CustomUser
)
from .serializers import (
    ClientSerializer, PatientSerializer, AppointmentSerializer, ReceiptSerializer,
    AllergySerializer, VisitSerializer, VitalSerializer, CommunicationSerializer,
    MedicalNoteSerializer, MedicationSerializer, DocumentSerializer, TreatmentSerializer,
    ClientRegistrationSerializer
)

# -------------------------
# Custom Permissions
# -------------------------
class IsDoctorReadOnlyOrClientFullAccess(BasePermission):
    """
    Staff users (doctors) have read-only access.
    Authenticated clients have full CRUD access.
    """
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        if user.is_staff:
            return request.method in SAFE_METHODS
        return True


# -------------------------
# Helper Functions
# -------------------------
def _client_for_user(user):
    """Return the Client object linked to a Django user."""
    return Client.objects.filter(user=user).first()


def _client_filter_kwargs_for_user(user):
    """Return kwargs to filter objects by client."""
    if user.is_staff:
        return None
    client = _client_for_user(user)
    if client:
        return {"client": client}
    return {"client__id": -1}  # impossible filter


# -------------------------
# Client APIs
# -------------------------
class ClientViewSet(ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsDoctorReadOnlyOrClientFullAccess]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Client.objects.all()
        client = _client_for_user(user)
        return Client.objects.filter(id=client.id) if client else Client.objects.none()


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password
from .models import CustomUser, Client
from .serializers import ClientRegistrationSerializer

class ClientRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ClientRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data

            # 1️⃣ Create the user
            user = CustomUser.objects.create(
                username=data["username"],
                email=data.get("email", ""),
                full_name=data.get("full_name", ""),
                password=make_password(data["password"]),
                phone=data.get("phone", ""),
                
            )

            # 2️⃣ Create the Client linked to this user
            Client.objects.create(
                user=user,
                full_name=data.get("full_name", ""),
                phone=data.get("phone", ""),
                
            )

            return Response({"detail": "Registration successful."}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------------
# Patient API
# -------------------------
class PatientViewSet(ModelViewSet):
    serializer_class = PatientSerializer
    permission_classes = [IsDoctorReadOnlyOrClientFullAccess]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Patient.objects.all()
        kwargs = _client_filter_kwargs_for_user(user)
        return Patient.objects.filter(**kwargs)

    def perform_create(self, serializer):
        user = self.request.user
        kwargs = _client_filter_kwargs_for_user(user)
        serializer.save(client=kwargs.get("client") if kwargs else None)


# -------------------------
# CRUD APIs for other models
# -------------------------
class AppointmentViewSet(ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsDoctorReadOnlyOrClientFullAccess]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Appointment.objects.all()
        kwargs = _client_filter_kwargs_for_user(user)
        return Appointment.objects.filter(**kwargs)

    def perform_create(self, serializer):
        kwargs = _client_filter_kwargs_for_user(self.request.user)
        serializer.save(client=kwargs.get("client") if kwargs else None)


class ReceiptViewSet(ModelViewSet):
    serializer_class = ReceiptSerializer
    permission_classes = [IsDoctorReadOnlyOrClientFullAccess]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Receipt.objects.all()
        kwargs = _client_filter_kwargs_for_user(user)
        return Receipt.objects.filter(**kwargs)

    def perform_create(self, serializer):
        kwargs = _client_filter_kwargs_for_user(self.request.user)
        serializer.save(client=kwargs.get("client") if kwargs else None)


class VisitViewSet(ModelViewSet):
    serializer_class = VisitSerializer
    permission_classes = [IsDoctorReadOnlyOrClientFullAccess]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Visit.objects.all()
        kwargs = _client_filter_kwargs_for_user(user)
        return Visit.objects.filter(patient__client=kwargs.get("client") if kwargs else None)

    def perform_create(self, serializer):
        kwargs = _client_filter_kwargs_for_user(self.request.user)
        serializer.save(patient__client=kwargs.get("client") if kwargs else None)


class AllergyViewSet(ModelViewSet):
    serializer_class = AllergySerializer
    permission_classes = [IsDoctorReadOnlyOrClientFullAccess]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return AllergyAlert.objects.all()
        client = _client_for_user(user)
        return AllergyAlert.objects.filter(patient__client=client)

    def perform_create(self, serializer):
        client = _client_for_user(self.request.user)
        serializer.save(patient__client=client)


class VitalViewSet(ModelViewSet):
    serializer_class = VitalSerializer
    permission_classes = [IsDoctorReadOnlyOrClientFullAccess]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return VitalSigns.objects.all()
        client = _client_for_user(user)
        return VitalSigns.objects.filter(visit__patient__client=client)

    def perform_create(self, serializer):
        client = _client_for_user(self.request.user)
        serializer.save(visit__patient__client=client)


class CommunicationViewSet(ModelViewSet):
    serializer_class = CommunicationSerializer
    permission_classes = [IsDoctorReadOnlyOrClientFullAccess]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return ClientCommunicationNote.objects.all()
        client = _client_for_user(user)
        return ClientCommunicationNote.objects.filter(patient__client=client)

    def perform_create(self, serializer):
        client = _client_for_user(self.request.user)
        serializer.save(patient__client=client)


class MedicalNoteViewSet(ModelViewSet):
    serializer_class = MedicalNoteSerializer
    permission_classes = [IsDoctorReadOnlyOrClientFullAccess]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return ClientNote.objects.all()
        client = _client_for_user(user)
        return ClientNote.objects.filter(patient__client=client)

    def perform_create(self, serializer):
        client = _client_for_user(self.request.user)
        serializer.save(patient__client=client)


class MedicationViewSet(ModelViewSet):
    serializer_class = MedicationSerializer
    permission_classes = [IsDoctorReadOnlyOrClientFullAccess]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Medication.objects.all()
        client = _client_for_user(user)
        return Medication.objects.filter(patient__client=client)

    def perform_create(self, serializer):
        client = _client_for_user(self.request.user)
        serializer.save(patient__client=client)


class DocumentViewSet(ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsDoctorReadOnlyOrClientFullAccess]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Document.objects.all()
        client = _client_for_user(user)
        return Document.objects.filter(patient__client=client)

    def perform_create(self, serializer):
        client = _client_for_user(self.request.user)
        serializer.save(patient__client=client)


class TreatmentViewSet(ModelViewSet):
    serializer_class = TreatmentSerializer
    permission_classes = [IsDoctorReadOnlyOrClientFullAccess]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return TreatmentPlan.objects.all()
        client = _client_for_user(user)
        return TreatmentPlan.objects.filter(patient__client=client)

    def perform_create(self, serializer):
        client = _client_for_user(self.request.user)
        serializer.save(patient__client=client)


# -------------------------
# Dashboard API
# -------------------------
class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Doctor
        if user.is_staff:
            patients_count = Patient.objects.count()
            appointments_count = Appointment.objects.count()
            receipts_qs = Receipt.objects.all()
            receipts_count = receipts_qs.count()
            receipts_total = receipts_qs.aggregate(total=Sum("amount"))["total"] or 0
            receipts_paid_count = receipts_qs.filter(status="Paid").count()

            monthly_visits = (
                Visit.objects.annotate(month=TruncMonth("visit_date"))
                .values("month")
                .annotate(total=Count("id"))
                .order_by("month")
            )

            chart_labels = [v["month"].strftime("%b %Y") for v in monthly_visits if v.get("month")]
            chart_data = [v["total"] for v in monthly_visits if v.get("month")]

            return Response({
                "dashboard_for": "doctor",
                "patients_count": patients_count,
                "appointments_count": appointments_count,
                "receipts_count": receipts_count,
                "receipts_total": float(receipts_total),
                "receipts_paid_count": receipts_paid_count,
                "chart_labels": chart_labels,
                "chart_data": chart_data
            })

        # Client
        client = _client_for_user(user)
        if not client:
            return Response({"detail": "Client not found."}, status=404)

        patients_count = Patient.objects.filter(client=client).count()
        appointments_count = Appointment.objects.filter(client=client).count()
        receipts_qs = Receipt.objects.filter(client=client)
        receipts_count = receipts_qs.count()
        receipts_total = receipts_qs.aggregate(total=Sum("amount"))["total"] or 0
        receipts_paid_count = receipts_qs.filter(status="Paid").count()

        monthly_visits = (
            Visit.objects.filter(patient__client=client)
            .annotate(month=TruncMonth("visit_date"))
            .values("month")
            .annotate(total=Count("id"))
            .order_by("month")
        )

        chart_labels = [v["month"].strftime("%b %Y") for v in monthly_visits if v.get("month")]
        chart_data = [v["total"] for v in monthly_visits if v.get("month")]

        return Response({
            "dashboard_for": "client",
            "patients_count": patients_count,
            "appointments_count": appointments_count,
            "receipts_count": receipts_count,
            "receipts_total": float(receipts_total),
            "receipts_paid_count": receipts_paid_count,
            "chart_labels": chart_labels,
            "chart_data": chart_data
        })


# -------------------------
# Customer Overview API
# -------------------------
class OverviewCustomerAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        client = _client_for_user(request.user)
        if not client:
            return Response({"detail": "Client not found."}, status=404)

        patients = Patient.objects.filter(client=client)

        data = {
            "allergies": list(AllergyAlert.objects.filter(patient__in=patients).values()),
            "visits": list(Visit.objects.filter(patient__in=patients).values()),
            "vitals": list(VitalSigns.objects.filter(visit__patient__in=patients).values()),
            "medical_notes": list(ClientNote.objects.filter(visit__patient__in=patients).values()),
            "medications": list(Medication.objects.filter(visit__patient__in=patients).values()),
            "documents": list(Document.objects.filter(patient__in=patients).values()),
            "treatments": list(TreatmentPlan.objects.filter(visit__patient__in=patients).values()),
        }

        return Response(data)
