import React, { useEffect, useMemo, useState } from "react";
import API from "../api";

export default function DoctorOverview() {
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [activeTab, setActiveTab] = useState("appointments");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function toList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  }

  function getClientIdFrom(item) {
    if (!item) return null;
    if (item.client && typeof item.client === "object") return item.client.id ?? item.client.pk ?? null;
    if (item.client_id) return item.client_id;
    if (item.client) return item.client;
    if (item.customer && typeof item.customer === "object") return item.customer.id ?? item.customer.pk ?? null;
    if (item.customer_id) return item.customer_id;
    return null;
  }

  function getClientLabel(item) {
    if (!item) return "-";
    return item.client_name || item.customer_name || item.full_name || `Client ${getClientIdFrom(item) ?? "-"}`;
  }

  function getPatientLabel(item) {
    if (!item) return "-";
    if (item.patient && typeof item.patient === "object") return item.patient.name || item.patient.full_name || `#${item.patient.id ?? "-"}`;
    return item.patient_name || (item.patient ? String(item.patient) : "-");
  }

  function asDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [clientsRes, apptsRes, receiptsRes] = await Promise.allSettled([
          API.get("/clients/"),
          API.get("/appointments/"),
          API.get("/receipts/"),
        ]);

        if (!mounted) return;

        setClients(clientsRes.status === "fulfilled" ? toList(clientsRes.value.data) : []);
        setAppointments(apptsRes.status === "fulfilled" ? toList(apptsRes.value.data) : []);
        setReceipts(receiptsRes.status === "fulfilled" ? toList(receiptsRes.value.data) : []);

        if (clientsRes.status !== "fulfilled" && apptsRes.status !== "fulfilled" && receiptsRes.status !== "fulfilled") {
          setError("Failed to load overview data.");
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load overview data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredAppointments = useMemo(() => {
    if (!selectedClientId) return appointments;
    return appointments.filter((a) => String(getClientIdFrom(a) ?? "") === String(selectedClientId));
  }, [appointments, selectedClientId]);

  const filteredReceipts = useMemo(() => {
    if (!selectedClientId) return receipts;
    return receipts.filter((r) => String(getClientIdFrom(r) ?? "") === String(selectedClientId));
  }, [receipts, selectedClientId]);

  const username = localStorage.getItem("username") || "Doctor";
  const email = localStorage.getItem("email") || "Not available";

  return (
    <div className="layout">
      <style>{`
:root{
  --glass-bg: rgba(255,255,255,.72);
  --glass-shadow: 0 18px 40px rgba(0,0,0,.18);
  --primary:#0b5cff;
  --success:#1bbf6b;
  --warning:#ff9800;
}

*{box-sizing:border-box}
html,body{height:100%;margin:0}
body{
  font-family:"Segoe UI",Tahoma,Verdana,sans-serif;
  background-image:url("https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg");
  background-size:cover;
  background-position:center;
  color:#111;
}
.layout{display:flex;height:100vh;padding:24px;gap:20px}
.sidebar{width:260px;background:var(--glass-bg);backdrop-filter:blur(14px);box-shadow:var(--glass-shadow);border-radius:20px;padding:24px 18px}
.sidebar h2{text-align:center;margin-bottom:22px}
.nav a{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:12px;margin-bottom:8px;font-weight:600;text-decoration:none;color:#111}
.nav a:hover,.nav a.active{background:rgba(0,0,0,.85);color:#fff}
.main{flex:1;display:flex;flex-direction:column;gap:20px}
.topbar{background:var(--glass-bg);backdrop-filter:blur(14px);box-shadow:var(--glass-shadow);border-radius:18px;padding:16px 22px;display:flex;justify-content:space-between;align-items:center;position:relative;z-index:10}
.topbar h1{margin:0;font-size:22px}
.profile{position:relative}
.profile-btn{display:flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.45);border:1px solid rgba(0,0,0,.15);font-weight:600;cursor:pointer}
.profile-menu{position:absolute;right:0;top:54px;width:240px;background:var(--glass-bg);backdrop-filter:blur(14px);box-shadow:var(--glass-shadow);border-radius:14px;padding:16px;display:none;z-index:9999}
.profile-menu.show{display:block}
.profile-menu p{margin:0 0 8px;font-size:14px}
.profile-menu a{display:block;margin-top:10px;padding:10px;border-radius:10px;background:rgba(0,0,0,.85);color:#fff;text-align:center;text-decoration:none;font-weight:700}
.content{flex:1;background:var(--glass-bg);backdrop-filter:blur(14px);box-shadow:var(--glass-shadow);border-radius:22px;padding:28px;overflow:auto}
.overview-section{margin-top:20px}
.overview-section h2{font-size:20px;font-weight:700;margin-bottom:16px}
.overview-table{
  width:100%;
  border-collapse:collapse;
  background:rgba(255,255,255,.65);
  backdrop-filter:blur(14px);
  border-radius:12px;
  overflow:hidden;
  box-shadow:0 18px 35px rgba(0,0,0,.18);
}
.overview-table th, .overview-table td{
  padding:12px 16px;
  text-align:left;
  border-bottom:1px solid rgba(0,0,0,.1);
}
.overview-table th{
  background:rgba(11,92,255,.1);
  font-weight:700;
}
.overview-table tr:hover{
  background:rgba(0,0,0,.05);
  cursor:pointer;
}
.section-tabs{
  display:flex;
  gap:16px;
  margin-bottom:16px;
}
.section-tab{
  padding:8px 16px;
  border-radius:999px;
  background:rgba(255,255,255,.6);
  cursor:pointer;
  font-weight:600;
  transition:.25s;
  border:none;
}
.section-tab.active{background:var(--primary);color:#fff}
.filters{
  display:flex;
  gap:12px;
  align-items:center;
  flex-wrap:wrap;
  margin-bottom:6px;
}
.client-select{
  padding:10px 12px;
  border-radius:12px;
  border:1px solid rgba(0,0,0,.15);
  min-width:260px;
}
.clear-btn{
  padding:10px 14px;
  border-radius:12px;
  border:1px solid rgba(0,0,0,.15);
  background:rgba(255,255,255,.65);
  cursor:pointer;
}
      `}</style>

      <aside className="sidebar">
        <h2>🩺 VMS Overview</h2>
        <nav className="nav">
          <a href="/doctor">Dashboard</a>
          <a className="active" href="/overview/">
            Overview
          </a>
          <a href="/allergies/">Allergies</a>
          <a href="/visits/">Visits</a>
          <a href="/vitals/">Vitals</a>
          <a href="/medical-notes/">Medical Notes</a>
          <a href="/medications/">Medications</a>
          <a href="/documents/">Documents</a>
          <a href="/treatments/">Treatments</a>
        </nav>
      </aside>

      <main className="main">
        <div className="topbar">
          <h1>Overview 🩺</h1>
          <div className="profile">
            <button className="profile-btn" onClick={() => setMenuOpen((v) => !v)}>
              👨‍⚕️ {username}
            </button>
            <div className={`profile-menu ${menuOpen ? "show" : ""}`}>
              <p>
                <strong>Name</strong>
                <br />
                {username}
              </p>
              <p>
                <strong>Email</strong>
                <br />
                {email}
              </p>
              <a href="/login">Logout</a>
            </div>
          </div>
        </div>

        <section className="content">
          <div className="filters">
            <label style={{ fontWeight: 700 }}>Client:</label>
            <select className="client-select" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
              <option value="">All clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name || c.username || c.client_id || `Client ${c.id}`}
                </option>
              ))}
            </select>
            <button className="clear-btn" onClick={() => setSelectedClientId("")}>
              Clear
            </button>
          </div>

          <div className="section-tabs">
            <button className={`section-tab ${activeTab === "appointments" ? "active" : ""}`} onClick={() => setActiveTab("appointments")}>
              Appointments
            </button>
            <button className={`section-tab ${activeTab === "receipts" ? "active" : ""}`} onClick={() => setActiveTab("receipts")}>
              Receipts
            </button>
          </div>

          {error ? <div style={{ color: "crimson", fontWeight: 600 }}>{error}</div> : null}

          {activeTab === "appointments" ? (
            <div className="overview-section" id="appointments-tab">
              <h2>Appointments</h2>
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5}>Loading appointments...</td>
                    </tr>
                  ) : filteredAppointments.length ? (
                    filteredAppointments.map((a, idx) => {
                      const d = asDate(a.date || a.appointment_date || a.created_at);
                      return (
                        <tr key={a.id ?? `appt-${idx}`}>
                          <td>{getPatientLabel(a)}</td>
                          <td>{d ? d.toLocaleDateString() : "-"}</td>
                          <td>{d ? d.toLocaleTimeString() : "-"}</td>
                          <td>{a.reason || a.notes || "-"}</td>
                          <td>{a.status || "-"}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5}>No appointments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {activeTab === "receipts" ? (
            <div className="overview-section" id="receipts-tab">
              <h2>Receipts</h2>
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4}>Loading receipts...</td>
                    </tr>
                  ) : filteredReceipts.length ? (
                    filteredReceipts.map((r, idx) => (
                      <tr key={r.id ?? `receipt-${idx}`}>
                        <td>{getClientLabel(r)}</td>
                        <td>{r.date || r.issued_date || "-"}</td>
                        <td>{r.amount ?? "-"}</td>
                        <td>{r.status || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>No receipts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
