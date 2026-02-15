import React from "react";
import { useApiData } from "../hooks/useApiData";

function Dashboard() {
  const {
    patients,
    visits,
    clients,
    appointments,
    receipts,
    medications,
    documents,
    allergies,
    treatments,
    overview,
    loading,
    error
  } = useApiData();

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Patients: {patients.length}</p>
      <p>Visits: {visits.length}</p>
      <p>Appointments: {appointments.length}</p>
      <p>Receipts: {receipts.length}</p>
      <p>Medications: {medications.length}</p>
      <p>Documents: {documents.length}</p>
      <p>Allergies: {allergies.length}</p>
      <p>Treatments: {treatments.length}</p>

      <h2>Overview</h2>
      <pre>{JSON.stringify(overview, null, 2)}</pre>
    </div>
  );
}

export default Dashboard;
