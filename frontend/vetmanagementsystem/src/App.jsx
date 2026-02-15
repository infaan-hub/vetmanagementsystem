import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getRole } from "./utils/auth";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorRegister from "./pages/DoctorRegister";
import DoctorLogin from "./pages/DoctorLogin";
import DoctorDashboard from "./pages/DoctorDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Patients from "./pages/Patients";
import Visits from "./pages/Visits";
import Appointments from "./pages/Appointments";
import Receipts from "./pages/Receipts";

// Import overview pages
import DoctorOverview from "./pages/DoctorOverview";
import CustomerOverview from "./pages/CustomerOverview";

// Dynamic Overview component
function Overview() {
  const role = getRole();

  if (role === "doctor") return <DoctorOverview />;
  if (role === "customer") return <CustomerOverview />;

  return <Navigate to="/login" />;
}

// PrivateRoute for role-based access
function PrivateRoute({ children, allowedRoles }) {
  const role = getRole();
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/overview" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Doctor auth pages */}
        <Route path="/doctor/register" element={<DoctorRegister />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor" element={<Navigate to="/doctor-dashboard" />} />

        {/* Doctor routes */}
        <Route
          path="/doctor-dashboard"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <Patients />
            </PrivateRoute>
          }
        />
        <Route
          path="/visits"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <Visits />
            </PrivateRoute>
          }
        />

        {/* Customer routes */}
        <Route
          path="/customer-dashboard"
          element={
            <PrivateRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <PrivateRoute allowedRoles={["customer"]}>
              <Appointments />
            </PrivateRoute>
          }
        />
        <Route
          path="/receipts"
          element={
            <PrivateRoute allowedRoles={["customer"]}>
              <Receipts />
            </PrivateRoute>
          }
        />

        {/* Shared overview */}
        <Route
          path="/overview"
          element={
            <PrivateRoute allowedRoles={["doctor", "customer"]}>
              <Overview />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
