# Vetmanagementsystem/views.py

from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    BasePermission,
    SAFE_METHODS
)
from rest_framework import status

from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.contrib.auth.hashers import make_password

from .models import (
    Client,
    Patient,
    Appointment,
    Receipt,
    Visit,
    AllergyAlert,
    VitalSigns,
    ClientCommunicationNote,
    ClientNote,
    Medication,
    Document,
    TreatmentPlan,
    CustomUser,
    

   
)

from .serializers import (
    ClientSerializer,
    PatientSerializer,
    AppointmentSerializer,
    ReceiptSerializer,
    AllergyAlertSerializer,
    VisitSerializer,
    VitalSignsSerializer,
    CommunicationSerializer,
    ClientNoteSerializer,
    MedicationSerializer,
    DocumentSerializer,
    TreatmentSerializer,
    ClientRegistrationSerializer,
    
)

# ============================================================
# PERMISSIONS
# ============================================================

class IsDoctorFullClientReadOnly(BasePermission):
    """
    Doctor → FULL access
    Client → READ ONLY
    """

    def has_permission(self, request, view):

        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Doctor full access
        if user.is_staff:
            return True

        # Client read only
        return request.method in SAFE_METHODS


class IsClientFullDoctorReadOnly(BasePermission):
    """
    Client → FULL access
    Doctor → READ ONLY
    """

    def has_permission(self, request, view):

        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Doctor read only
        if user.is_staff:
            return request.method in SAFE_METHODS

        # Client full access
        return True


# ============================================================
# HELPERS
# ============================================================

def _client_for_user(user):

    if not user.is_authenticated:
        return None

    return Client.objects.filter(user=user).first()


def _client_filter_kwargs(user):

    if user.is_staff:
        return {}

    client = _client_for_user(user)

    if client:
        return {"client": client}

    return {"client__id": -1}


# ============================================================
# CLIENT VIEWSET
# ============================================================

class ClientViewSet(ModelViewSet):

    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if user.is_staff:
            return Client.objects.all()

        client = _client_for_user(user)

        if client:
            return Client.objects.filter(id=client.id)

        return Client.objects.none()


# ============================================================
# CLIENT REGISTRATION
# ============================================================

class ClientRegistrationView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = ClientRegistrationSerializer(data=request.data)

        if serializer.is_valid():

            data = serializer.validated_data

            user = CustomUser.objects.create(
                username=data["username"],
                email=data.get("email", ""),
                full_name=data.get("full_name", ""),
                password=make_password(data["password"]),
                phone=data.get("phone", ""),
                address=data.get("address", ""),
                is_staff=False
            )

            Client.objects.create(
                user=user,
                full_name=data.get("full_name", ""),
                email=data.get("email", ""),
                phone=data.get("phone", ""),
                address=data.get("address", "")
            )

            return Response(
                {"detail": "Registration successful"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# PATIENT (Doctor FULL, Client READ ONLY)
# ============================================================

class PatientViewSet(ModelViewSet):

    serializer_class = PatientSerializer
    permission_classes = [IsDoctorFullClientReadOnly]

    def get_queryset(self):

        user = self.request.user

        if user.is_staff:
            return Patient.objects.all()

        return Patient.objects.filter(**_client_filter_kwargs(user))

    def perform_create(self, serializer):

        serializer.save()

    


# ============================================================
# APPOINTMENT (Client FULL, Doctor READ ONLY)
# ============================================================

class AppointmentViewSet(ModelViewSet):

    serializer_class = AppointmentSerializer
    permission_classes = [IsClientFullDoctorReadOnly]

    def get_queryset(self):

        user = self.request.user

        if user.is_staff:
            return Appointment.objects.all()

        return Appointment.objects.filter(**_client_filter_kwargs(user))

    def perform_create(self, serializer):

        client = _client_for_user(self.request.user)

        serializer.save(client=client)


# ============================================================
# RECEIPT (Client FULL, Doctor READ ONLY)
# ============================================================

class ReceiptViewSet(ModelViewSet):

    serializer_class = ReceiptSerializer
    permission_classes = [IsClientFullDoctorReadOnly]

    def get_queryset(self):

        user = self.request.user

        if user.is_staff:
            return Receipt.objects.all()

        return Receipt.objects.filter(**_client_filter_kwargs(user))

    def perform_create(self, serializer):

        client = _client_for_user(self.request.user)

        serializer.save(client=client)


# ============================================================
# MEDICAL RECORD VIEWSETS (Doctor FULL, Client READ ONLY)
# ============================================================

class VisitViewSet(ModelViewSet):

    serializer_class = VisitSerializer
    permission_classes = [IsDoctorFullClientReadOnly]

    def get_queryset(self):

        user = self.request.user

        if user.is_staff:
            return Visit.objects.all()

        return Visit.objects.filter(
            patient__client=_client_for_user(user)
        )


class AllergyAlertViewSet(ModelViewSet):

    serializer_class = AllergyAlertSerializer
    permission_classes = [IsDoctorFullClientReadOnly]

    def get_queryset(self):

        user = self.request.user

        if user.is_staff:
            return AllergyAlert.objects.all()

        return AllergyAlert.objects.filter(
            patient__client=_client_for_user(user)
        )


class VitalSignsViewSet(ModelViewSet):

    serializer_class = VitalSignsSerializer
    permission_classes = [IsDoctorFullClientReadOnly]

    def get_queryset(self):

        user = self.request.user

        if user.is_staff:
            return VitalSigns.objects.all()

        return VitalSigns.objects.filter(
            visit__patient__client=_client_for_user(user)
        )


class CommunicationViewSet(ModelViewSet):

    serializer_class = CommunicationSerializer
    permission_classes = [IsDoctorFullClientReadOnly]

    def get_queryset(self):

        user = self.request.user

        if user.is_staff:
            return ClientCommunicationNote.objects.all()

        return ClientCommunicationNote.objects.filter(
            patient__client=_client_for_user(user)
        )


class ClientNoteViewSet(ModelViewSet):

    serializer_class = ClientNoteSerializer
    permission_classes = [IsDoctorFullClientReadOnly]

    def get_queryset(self):

        user = self.request.user

        if user.is_staff:
            return ClientNote.objects.all()

        return ClientNote.objects.filter(
            visit__patient__client=_client_for_user(user)
        )


class MedicationViewSet(ModelViewSet):

    serializer_class = MedicationSerializer
    permission_classes = [IsDoctorFullClientReadOnly]

    def get_queryset(self):

        user = self.request.user

        if user.is_staff:
            return Medication.objects.all()

        return Medication.objects.filter(
            visit__patient__client=_client_for_user(user)
        )


class DocumentViewSet(ModelViewSet):

    serializer_class = DocumentSerializer
    permission_classes = [IsDoctorFullClientReadOnly]

    def get_queryset(self):

        user = self.request.user

        if user.is_staff:
            return Document.objects.all()

        return Document.objects.filter(
            patient__client=_client_for_user(user)
        )


class TreatmentViewSet(ModelViewSet):

    serializer_class = TreatmentSerializer
    permission_classes = [IsDoctorFullClientReadOnly]

    def get_queryset(self):

        user = self.request.user

        if user.is_staff:
            return TreatmentPlan.objects.all()

        return TreatmentPlan.objects.filter(
            visit__patient__client=_client_for_user(user)
        )


# ============================================================
# DASHBOARD
# ============================================================

class DashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        if user.is_staff:

            patients_count = Patient.objects.count()

            appointments_count = Appointment.objects.count()

            receipts = Receipt.objects.all()

            return Response({
                "dashboard_for": "doctor",
                "patients_count": patients_count,
                "appointments_count": appointments_count,
                "receipts_count": receipts.count(),
                "receipts_total": receipts.aggregate(
                    total=Sum("amount")
                )["total"] or 0
            })


        client = _client_for_user(user)

        if not client:
            return Response({"detail": "Client not found"}, status=404)

        receipts = Receipt.objects.filter(client=client)

        return Response({

            "dashboard_for": "client",

            "patients_count":
                Patient.objects.filter(client=client).count(),

            "appointments_count":
                Appointment.objects.filter(client=client).count(),

            "receipts_count": receipts.count(),

            "receipts_total":
                receipts.aggregate(total=Sum("amount"))["total"] or 0
        })


# ============================================================
# CUSTOMER OVERVIEW
# ============================================================

class OverviewCustomerAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        client = _client_for_user(request.user)

        patients = Patient.objects.filter(client=client)

        return Response({

            "patients": PatientSerializer(patients, many=True).data,

            "allergies":
                AllergySerializer(
                    AllergyAlert.objects.filter(patient__in=patients),
                    many=True
                ).data,

            "visits":
                VisitSerializer(
                    Visit.objects.filter(patient__in=patients),
                    many=True
                ).data,

            "medications":
                MedicationSerializer(
                    Medication.objects.filter(patient__in=patients),
                    many=True
                ).data

        })
    

