# Vetmanagementsystem/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Client, Patient, Appointment, Receipt, Visit, AllergyAlert, VitalSigns,
    ClientCommunicationNote, ClientNote, Medication, Document, TreatmentPlan,CustomUser
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
        fields = ["id", "name", "species", "breed", "client"]


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
class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = AllergyAlert
        fields = ["id", "patient", "allergy", "severity", "notes"]


# -------------------------
# Vital Signs
# -------------------------
class VitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSigns
        fields = ["id", "visit", "temperature", "pulse", "respiration", "weight"]


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
class MedicalNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientNote
        fields = ["id", "patient", "note", "created_at"]


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
