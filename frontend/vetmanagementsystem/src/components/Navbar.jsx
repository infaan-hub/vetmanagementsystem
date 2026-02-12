import React from 'react';
import { Link } from "react-router-dom";

export default function Navbar({ role }) {
  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 20px",
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(12px) saturate(120%)",
      borderRadius: "12px",
      boxShadow: "0 18px 40px rgba(0,0,0,0.18)"
    }}>
      <div>
        <h2>VMS🐾</h2>
      </div>
      <div style={{ display: "flex", gap: "16px" }}>
        {role === "doctor" && (
          <>
            <Link to="/patients">Patients</Link>
            <Link to="/visits">Visits</Link>
          </>
        )}
        {role === "customer" && (
          <>
            <Link to="/appointments">Appointments</Link>
            <Link to="/receipts">Receipts</Link>
          </>
        )}
        <Link to="/overview">Overview</Link>
        <Link to="/login" onClick={() => localStorage.clear()}>Logout</Link>
      </div>
    </nav>
  );
}
