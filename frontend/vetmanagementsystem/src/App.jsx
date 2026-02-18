import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getRole } from "./utils/auth";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorRegister from "./pages/DoctorRegister";
import DoctorLogin from "./pages/DoctorLogin";
import Logout from "./pages/Logout";
import DoctorDashboard from "./pages/DoctorDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Patients from "./pages/Patients";
import Visits from "./pages/Visits";
import Appointments from "./pages/Appointments";
import Receipts from "./pages/Receipts";
import Allergies from "./pages/Allergies";
import Vitals from "./pages/Vitals";
import Communications from "./pages/Communications";
import MedicalNotes from "./pages/MedicalNotes";
import Documents from "./pages/Documents";
import Treatments from "./pages/Treatments";
import Medications from "./pages/Medications";

import DoctorOverview from "./pages/DoctorOverview";
import CustomerOverview from "./pages/CustomerOverview";


// Dynamic Overview component
function Overview() {
  const role = getRole();

  if (role === "doctor") return <DoctorOverview />;
  if (role === "customer") return <CustomerOverview />;

  return <Navigate to="/home" replace />;
}


// PrivateRoute for role-based access
function PrivateRoute({ children, allowedRoles }) {
  const role = getRole();
  const requiresDoctorOnly = allowedRoles.length === 1 && allowedRoles[0] === "doctor";
  const loginPath = requiresDoctorOnly ? "/doctor/login" : "/login";

  if (!role) {
    return <Navigate to={loginPath} replace />;
  }

  if (!allowedRoles.includes(role)) {
    const roleHome = role === "doctor" ? "/doctor-dashboard" : "/customer-dashboard";
    return <Navigate to={roleHome} replace />;
  }

  return children;
}


function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <MobileSidebarControl />
      <Routes>

        {/* Default */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />

        {/* Doctor auth */}
        <Route path="/doctor/register" element={<DoctorRegister />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />

        {/* Doctor dashboard redirect */}
        <Route path="/doctor" element={<Navigate to="/doctor-dashboard" replace />} />


        {/* ================= DOCTOR ROUTES ================= */}

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

        <Route
          path="/allergies"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <Allergies />
            </PrivateRoute>
          }
        />

        <Route
          path="/vitals"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <Vitals />
            </PrivateRoute>
          }
        />

        <Route
          path="/communications"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <Communications />
            </PrivateRoute>
          }
        />

        <Route
          path="/medical-notes"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <MedicalNotes />
            </PrivateRoute>
          }
        />

        <Route
          path="/documents"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <Documents />
            </PrivateRoute>
          }
        />

        <Route
          path="/treatments"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <Treatments />
            </PrivateRoute>
          }
        />

        <Route
          path="/medications"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <Medications />
            </PrivateRoute>
          }
        />


        {/* ================= CUSTOMER ROUTES ================= */}

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


        {/* ================= SHARED ================= */}

        <Route
          path="/overview"
          element={
            <PrivateRoute allowedRoles={["doctor", "customer"]}>
              <Overview />
            </PrivateRoute>
          }
        />


        {/* ================= FALLBACK ================= */}

        <Route path="*" element={<Navigate to="/home" replace />} />

      </Routes>
    </Router>
  );
}

function MobileSidebarControl() {
  const location = useLocation();
  const path = location.pathname;
  const hideOnPaths = ["/home", "/login", "/register", "/doctor/login", "/doctor/register", "/logout"];
  const shouldHide = hideOnPaths.includes(path);

  useEffect(() => {
    document.body.classList.remove("mobile-sidebar-open");
  }, [path]);

  useEffect(() => {
    const handleClick = (event) => {
      const link = event.target.closest(".sidebar a");
      if (link) {
        document.body.classList.remove("mobile-sidebar-open");
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (shouldHide) return null;

  return (
    <button
      type="button"
      className="mobile-menu-toggle"
      aria-label="Toggle sidebar menu"
      onClick={() => document.body.classList.toggle("mobile-sidebar-open")}
    >
      ☰
    </button>
  );
}

export default App;
