# Vetmanagementsystem/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()

# -------------------------
# Doctor-only APIs
# -------------------------
router.register(r"allergies", views.AllergyAlertViewSet, basename="allergies")
router.register(r"visits", views.VisitViewSet, basename="visits")
router.register(r"vitals", views.VitalSignsViewSet, basename="vitals")
router.register(r"communications", views.CommunicationViewSet, basename="communications")
router.register(r"medical-notes", views.ClientNoteViewSet, basename="medical-notes")
router.register(r"medications", views.MedicationViewSet, basename="medications")
router.register(r"documents", views.DocumentViewSet, basename="documents")
router.register(r"treatments", views.TreatmentViewSet, basename="treatments")

# -------------------------
# Shared APIs
# -------------------------
router.register(r"clients", views.ClientViewSet, basename="clients")
router.register(r"patients", views.PatientViewSet, basename="patients")
router.register(r"appointments", views.AppointmentViewSet, basename="appointments")
router.register(r"receipts", views.ReceiptViewSet, basename="receipts")

# -------------------------
# URL Patterns
# -------------------------
urlpatterns = [
    # React-friendly API endpoints
    path("api/", include(router.urls)),

    # Client registration / login
    path("api/client/register/", views.ClientRegistrationView.as_view(), name="client-register"),


    # Dashboard & overview
    path("api/dashboard/", views.DashboardAPIView.as_view(), name="dashboard"),
    path("api/overview_customer/", views.OverviewCustomerAPIView.as_view(), name="overview-customer"),
]
