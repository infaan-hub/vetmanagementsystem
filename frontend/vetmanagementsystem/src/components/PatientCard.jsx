import React from "react";

export default function PatientCard({ patient }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(12px) saturate(120%)",
      borderRadius: "18px",
      padding: "20px",
      boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
      marginBottom: "16px"
    }}>
      <h3>{patient.name} 🐾</h3>
      <p>Species: {patient.species}</p>
      <p>Breed: {patient.breed || "N/A"}</p>
      <p>Age: {patient.age || "Unknown"}</p>
    </div>
  );
}
