# Vetmanagementsystem/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Client, Patient, Appointment, Receipt, Visit, AllergyAlert, VitalSigns,
    ClientCommunicationNote, ClientNote, Medication, Document, TreatmentPlan,CustomUser,DoctorProfile,
)

# -------------------------
# Client
# -------------------------
class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ["id", "full_name", "phone", "user"]

class ClientRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ["full_name", "username", "email", "password", "phone"]


# -------------------------
# Patient
# -------------------------
class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "name", "species", "breed", "client", "patient_id"]


# -------------------------
# Appointment
# -------------------------
class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["id", "patient", "client", "appointment_date", "reason", "status"]


# -------------------------
# Receipt
# -------------------------
class ReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = ["id", "client", "amount", "status", "issued_date"]


# -------------------------
# Visit
# -------------------------
class VisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visit
        fields = ["id", "patient", "visit_date", "reason"]


# -------------------------
# Allergy
# -------------------------
class AllergyAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = AllergyAlert
        fields = ["id", "patient", "description", "severity_level"]


# -------------------------
# Vital Signs
# -------------------------
class VitalSignsSerializer(serializers.ModelSerializer):
    visit = serializers.PrimaryKeyRelatedField(
        queryset=Visit.objects.all(), required=False, allow_null=True
    )
    class Meta:
        model = VitalSigns
        fields = ["id", "visit", "temperature", "heart_rate", "respiration", "weight_lbs", "weight_oz"]


# -------------------------
# Communication Notes
# -------------------------
class CommunicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientCommunicationNote
        fields = ["id", "patient", "note", "created_at"]


# -------------------------
# Medical Notes
# -------------------------
class ClientNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientNote
        fields = ["id", "note", "created_at", "visit"]


# -------------------------
# Medication
# -------------------------
class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ["id", "patient", "name", "dosage", "instructions"]


# -------------------------
# Document
# -------------------------
class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["id", "patient", "file", "description"]


# -------------------------
# Treatment Plan
# -------------------------
class TreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentPlan
        fields = ["id", "patient", "treatment_type", "notes", "start_date", "end_date"]



class DoctorSerializer(serializers.ModelSerializer):
    specialization = serializers.CharField(
        source="doctor_profile.specialization",
        read_only=True
    )

    class Meta:
        model = CustomUser
        fields = ["id", "full_name", "username", "specialization"]

