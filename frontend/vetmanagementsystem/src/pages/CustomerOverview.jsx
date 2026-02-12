import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";



export default function CustomerOverview() {
  const [data, setData] = useState({
    allergies: [],
    visits: [],
    vitals: [],
    medical_notes: [],
    medications: [],
    documents: [],
    treatments: [],
    patients: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoints = {
          patients: "/patients/",
          allergies: "/allergies/",
          visits: "/visits/",
          vitals: "/vitals/",
          medical_notes: "/medical-notes/",
          medications: "/medications/",
          documents: "/documents/",
          treatments: "/treatment-plans/",
        };

        
        const promises = Object.values(endpoints).map((ep) => API.get(ep).catch((e) => null));
        const results = await Promise.all(promises);

        const newData = {};
        const keys = Object.keys(endpoints);
        keys.forEach((k, i) => {
          newData[k] = results[i] && results[i].data ? results[i].data : [];
        });

        setData((prev) => ({ ...prev, ...newData }));
      } catch (err) {
        console.error(err);
        setError("Failed to fetch overview. Check your API endpoints and tokens.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) return <div style={{padding:20}}>Loading overview...</div>;
  if (error) return <div style={{color:"red", padding:20}}>{error}</div>;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: "url('https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg')",
      backgroundSize: "cover",
      padding: "20px"
    }}>
      <Navbar role="customer" />

      <div style={{ maxWidth: 1200, margin: "20px auto", color: "#111" }}>
        <h1>My Overview</h1>

        <section style={{ marginTop: 12 }}>
          <h2>My Patients</h2>
          {data.patients.length ? (
            <ul>{data.patients.map(p => <li key={p.id}>{p.name} ({p.patient_id})</li>)}</ul>
          ) : <div>No patients found.</div>}
        </section>

        <section style={{ marginTop: 12 }}>
          <h2>Visits</h2>
          {data.visits.length ? (
            <table style={{ width:"100%", background:"rgba(255,255,255,0.72)", borderRadius:12, padding:12 }}>
              <thead><tr><th style={{padding:8}}>Patient</th><th style={{padding:8}}>Date</th><th style={{padding:8}}>Notes</th></tr></thead>
              <tbody>
                {data.visits.map(v => (
                  <tr key={v.id}>
                    <td style={{padding:8}}>{v.patient && (v.patient.name || v.patient) || v.patient_name}</td>
                    <td style={{padding:8}}>{new Date(v.visit_date).toLocaleString()}</td>
                    <td style={{padding:8}}>{v.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div>No visits yet.</div>}
        </section>

        <section style={{ marginTop: 12 }}>
          <h2>Vitals</h2>
          {data.vitals.length ? (
            <ul>{data.vitals.map(v => <li key={v.id}>Visit {v.visit || v.visit_id} — Temp: {v.temperature} — Weight: {v.weight_kg ?? v.weight_lbs}</li>)}</ul>
          ) : <div>No vitals recorded.</div>}
        </section>

        <section style={{ marginTop: 12 }}>
          <h2>Medical Notes</h2>
          {data.medical_notes.length ? (
            <ul>{data.medical_notes.map(n => <li key={n.id}>{n.note}</li>)}</ul>
          ) : <div>No medical notes.</div>}
        </section>

        <section style={{ marginTop: 12 }}>
          <h2>Medications</h2>
          {data.medications.length ? (
            <ul>{data.medications.map(m => <li key={m.id}>{m.name} — {m.dosage}</li>)}</ul>
          ) : <div>No medications.</div>}
        </section>

        <section style={{ marginTop: 12 }}>
          <h2>Documents</h2>
          {data.documents.length ? (
            <ul>{data.documents.map(d => <li key={d.id}>{d.document_type} — {d.issued_date} — <a href={d.file} target="_blank" rel="noreferrer">View</a></li>)}</ul>
          ) : <div>No documents.</div>}
        </section>

        <section style={{ marginTop: 12 }}>
          <h2>Treatments</h2>
          {data.treatments.length ? (
            <ul>{data.treatments.map(t => <li key={t.id}>{t.diagnosis} — follow up: {t.follow_up_date}</li>)}</ul>
          ) : <div>No treatments.</div>}
        </section>
      </div>
    </div>
  );
}
