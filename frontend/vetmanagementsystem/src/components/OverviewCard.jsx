import React from "react";

export default function OverviewCard({ title, value }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(12px) saturate(120%)",
      borderRadius: "18px",
      padding: "20px",
      boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
      marginBottom: "16px",
      textAlign: "center"
    }}>
      <h4>{title}</h4>
      <p style={{ fontSize: "24px", fontWeight: "700" }}>{value}</p>
    </div>
  );
}
