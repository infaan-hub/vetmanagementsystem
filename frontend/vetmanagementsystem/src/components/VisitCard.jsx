import React from "react";

export default function VisitCard({ visit }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(12px) saturate(120%)",
      borderRadius: "18px",
      padding: "20px",
      boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
      marginBottom: "16px"
    }}>
      <h3>{visit.patient_name}</h3>
      <p>Date: {new Date(visit.visit_date).toLocaleDateString()}</p>
      <p>Status: {visit.visit_status}</p>
      <p>Notes: {visit.notes}</p>
    </div>
  );
}
