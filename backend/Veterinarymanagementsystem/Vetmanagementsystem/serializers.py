# Vetmanagementsystem/serializers.py
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User
from django.utils import timezone
from .models import (
    Client, Patient, Appointment, Receipt, Visit, AllergyAlert, VitalSigns,
    ClientCommunicationNote, ClientNote, Medication, Document, TreatmentPlan,CustomUser,
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
        fields = [
            "id",
            "name",
            "species",
            "breed",
            "gender",
            "color",
            "date_of_birth",
            "weight_kg",
            "photo",
            "client",
            "patient_id",
        ]


# -------------------------
# Appointment
# -------------------------
class AppointmentSerializer(serializers.ModelSerializer):
    appointment_date = serializers.DateTimeField(write_only=True, required=False, allow_null=True)
    status = serializers.CharField(write_only=True, required=False, allow_blank=True)
    patient_name = serializers.SerializerMethodField(read_only=True)

    def get_patient_name(self, obj):
        return obj.patient.name if obj.patient_id else ""

    def validate(self, attrs):
        appointment_date = attrs.pop("appointment_date", None)
        attrs.pop("status", None)
        if not attrs.get("date") and appointment_date:
            attrs["date"] = appointment_date
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["appointment_date"] = instance.date.isoformat() if instance.date else ""
        data["status"] = "Scheduled"
        return data

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "patient_name",
            "client",
            "date",
            "appointment_date",
            "reason",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "patient_name", "created_at"]


# -------------------------
# Receipt
# -------------------------
class ReceiptSerializer(serializers.ModelSerializer):
    issued_date = serializers.DateField(write_only=True, required=False, allow_null=True)
    client_name = serializers.SerializerMethodField(read_only=True)

    def get_client_name(self, obj):
        return obj.client.full_name if obj.client_id else ""

    def validate(self, attrs):
        issued_date = attrs.pop("issued_date", None)
        if not attrs.get("date") and issued_date:
            attrs["date"] = issued_date
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["issued_date"] = instance.date.isoformat() if instance.date else ""
        return data

    class Meta:
        model = Receipt
        fields = ["id", "client", "client_name", "amount", "status", "date", "issued_date", "created_at"]
        read_only_fields = ["id", "client_name", "created_at"]


# -------------------------
# Visit
# -------------------------
class VisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visit
        fields = [
            "id",
            "patient",
            "veterinarian",
            "visit_date",
            "visit_status",
            "location_status",
            "age_months",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


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
    patient = serializers.SerializerMethodField(read_only=True)
    patient_name = serializers.SerializerMethodField(read_only=True)

    def get_patient(self, obj):
        return obj.visit.patient_id if obj.visit_id else None

    def get_patient_name(self, obj):
        if obj.visit_id and obj.visit.patient_id:
            return obj.visit.patient.name
        return ""

    class Meta:
        model = Medication
        fields = [
            "id",
            "visit",
            "patient",
            "patient_name",
            "name",
            "dosage",
            "frequency",
            "duration",
            "notes",
        ]


# -------------------------
# Document
# -------------------------
class DocumentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField(read_only=True)
    created_at = serializers.SerializerMethodField(read_only=True)
    document_type = serializers.ChoiceField(
        choices=Document.DOCUMENT_TYPES, required=False, allow_null=True
    )
    issued_date = serializers.DateField(required=False, allow_null=True)
    title = serializers.CharField(required=False, allow_blank=True, write_only=True)
    description = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def get_patient_name(self, obj):
        return obj.patient.name if obj.patient_id else ""

    def get_created_at(self, obj):
        return obj.issued_date.isoformat() if obj.issued_date else ""

    def validate(self, attrs):
        title = (attrs.get("title") or "").strip()
        document_type = attrs.get("document_type")
        valid_types = {choice[0] for choice in Document.DOCUMENT_TYPES}

        if not document_type:
            attrs["document_type"] = title if title in valid_types else "Other"

        # Model has no description field; accept input for compatibility.
        attrs.pop("description", None)
        attrs.pop("title", None)

        if not attrs.get("issued_date"):
            attrs["issued_date"] = timezone.localdate()

        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["title"] = instance.document_type
        data["description"] = ""
        return data

    class Meta:
        model = Document
        fields = [
            "id",
            "patient",
            "patient_name",
            "file",
            "document_type",
            "issued_date",
            "title",
            "description",
            "created_at",
        ]
        read_only_fields = ["id", "patient_name", "created_at"]


# -------------------------
# Treatment Plan
# -------------------------
class TreatmentSerializer(serializers.ModelSerializer):
    patient = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    patient_name = serializers.SerializerMethodField(read_only=True)
    name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    description = serializers.CharField(write_only=True, required=False, allow_blank=True)
    date = serializers.DateField(write_only=True, required=False, allow_null=True)
    diagnosis = serializers.CharField(required=False, allow_blank=True)
    treatment_description = serializers.CharField(required=False, allow_blank=True)
    follow_up_date = serializers.DateField(required=False, allow_null=True)
    veterinarian = serializers.SerializerMethodField(read_only=True)
    created_at = serializers.SerializerMethodField(read_only=True)

    def get_patient_name(self, obj):
        if obj.visit_id and obj.visit.patient_id:
            return obj.visit.patient.name
        return ""

    def get_veterinarian(self, obj):
        if obj.visit_id and obj.visit.veterinarian_id:
            vet = obj.visit.veterinarian
            return getattr(vet, "full_name", None) or getattr(vet, "username", None) or str(vet.id)
        return "-"

    def get_created_at(self, obj):
        if obj.follow_up_date:
            return obj.follow_up_date.isoformat()
        return ""

    def validate(self, attrs):
        patient_id = attrs.pop("patient", None)
        name = (attrs.pop("name", "") or "").strip()
        description = attrs.pop("description", "")
        date = attrs.pop("date", None)

        visit = attrs.get("visit")
        if not visit and patient_id:
            visit = Visit.objects.filter(patient_id=patient_id).order_by("-visit_date").first()
            if visit:
                attrs["visit"] = visit

        if not attrs.get("visit"):
            raise ValidationError({"visit": ["Visit is required. Select a patient with at least one visit."]})

        if not attrs.get("diagnosis"):
            attrs["diagnosis"] = name
        if not attrs["diagnosis"]:
            raise ValidationError({"name": ["Treatment name is required."]})

        if not attrs.get("treatment_description"):
            attrs["treatment_description"] = description or name

        if not attrs.get("follow_up_date") and date:
            attrs["follow_up_date"] = date

        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["name"] = instance.diagnosis
        data["description"] = instance.treatment_description
        data["date"] = instance.follow_up_date.isoformat() if instance.follow_up_date else ""
        return data

    class Meta:
        model = TreatmentPlan
        fields = [
            "id",
            "visit",
            "patient",
            "patient_name",
            "name",
            "description",
            "date",
            "veterinarian",
            "diagnosis",
            "treatment_description",
            "follow_up_date",
            "created_at",
        ]
        read_only_fields = ["id", "patient_name", "veterinarian", "created_at"]



