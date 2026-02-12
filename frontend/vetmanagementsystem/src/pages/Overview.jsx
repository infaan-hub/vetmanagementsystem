import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../Navbar";

export default function Overview() {
  const [overview, setOverview] = useState({
    allergies: [],
    visits: [],
    vitals: [],
    medical_notes: [],
    medications: [],
    documents: [],
    treatments: [],
  });

  useEffect(() => {
    async function fetchOverview() {
      try {
        const resAllergies = await API.get("/allergies/");
        const resVisits = await API.get("/visits/");
        const resVitals = await API.get("/vitals/");
        const resNotes = await API.get("/medicalnotes/");
        const resMeds = await API.get("/medications/");
        const resDocs = await API.get("/documents/");
        const resTreatments = await API.get("/treatmentplans/");

        setOverview({
          allergies: resAllergies.data,
          visits: resVisits.data,
          vitals: resVitals.data,
          medical_notes: resNotes.data,
          medications: resMeds.data,
          documents: resDocs.data,
          treatments: resTreatments.data,
        });
      } catch (err) {
        console.error(err);
      }
    }
    fetchOverview();
  }, []);

  return (
    <div style={{minHeight:"100vh", backgroundImage:"url('https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg')", backgroundSize:"cover", padding:"20px"}}>
      <Navbar role="doctor" />
      <h1>Overview</h1>
      <div>
        <h2>Allergies</h2>
        <ul>{overview.allergies.map(a => <li key={a.id}>{a.description}</li>)}</ul>

        <h2>Visits</h2>
        <ul>{overview.visits.map(v => <li key={v.id}>{v.patient_name} - {v.visit_status}</li>)}</ul>

        <h2>Vitals</h2>
        <ul>{overview.vitals.map(v => <li key={v.id}>{v.weight_kg}kg, Temp: {v.temperature}</li>)}</ul>

        <h2>Medical Notes</h2>
        <ul>{overview.medical_notes.map(n => <li key={n.id}>{n.note}</li>)}</ul>

        <h2>Medications</h2>
        <ul>{overview.medications.map(m => <li key={m.id}>{m.name} - {m.dosage}</li>)}</ul>

        <h2>Documents</h2>
        <ul>{overview.documents.map(d => <li key={d.id}>{d.document_type}</li>)}</ul>

        <h2>Treatments</h2>
        <ul>{overview.treatments.map(t => <li key={t.id}>{t.diagnosis}</li>)}</ul>
      </div>
    </div>
  );
}
