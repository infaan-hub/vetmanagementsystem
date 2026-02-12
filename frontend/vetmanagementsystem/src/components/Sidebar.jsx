import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar({ role }) {
  return (
    <div style={{
      width: "220px",
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(12px) saturate(120%)",
      borderRadius: "18px",
      padding: "20px",
      boxShadow: "0 18px 40px rgba(0,0,0,0.18)"
    }}>
      <h3>Menu</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {role === "doctor" && <>
          <li><Link to="/patients">Patients</Link></li>
          <li><Link to="/visits">Visits</Link></li>
        </>}
        {role === "customer" && <>
          <li><Link to="/appointments">Appointments</Link></li>
          <li><Link to="/receipts">Receipts</Link></li>
        </>}
        <li><Link to="/overview">Overview</Link></li>
      </ul>
    </div>
  );
}
