// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/index.css"; // optional - remove if you don't have it

/* USER SIDE */
import Home from "./pages/Home.jsx";
import RegisterClient from "./pages/RegisterClient.jsx";
import AddPatient from "./pages/AddPatient.jsx";
import MedicalView from "./pages/MedicalView.jsx";

/* DOCTOR / ADMIN SIDE */
import DoctorLogin from "./pages/DoctorLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* ===== USER ROUTES ===== */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterClient />} />
        <Route path="/patient" element={<AddPatient />} />
        <Route path="/medical" element={<MedicalView />} />

        {/* ===== DOCTOR / ADMIN ROUTES ===== */}
        <Route path="/admin" element={<DoctorLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
