import React, { useEffect, useMemo, useState } from "react";
import API from "../api";

export default function Appointments() {
  const [clients, setClients] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [status, setStatus] = useState("");
  const [statusError, setStatusError] = useState(false);
  const [form, setForm] = useState({
    client: "",
    patient: "",
    date: "",
    reason: "",
  });

  function toList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  }

  function getCSRFToken() {
    const cookieString = document.cookie || "";
    for (const c of cookieString.split(";").map((s) => s.trim())) {
      if (c.startsWith("csrftoken=")) return decodeURIComponent(c.split("=")[1]);
    }
    return null;
  }

  function setStatusMessage(msg, isError = false) {
    setStatus(msg);
    setStatusError(isError);
  }

  const filteredPatients = useMemo(() => {
    if (!form.client) return [];
    return patients.filter((p) => String(p.client) === String(form.client));
  }, [patients, form.client]);

  async function loadClients() {
    setLoadingClients(true);
    try {
      const res = await API.get("/clients/");
      const list = toList(res.data);
      setClients(list);
      if (list.length === 1) {
        setForm((s) => ({ ...s, client: String(list[0].id) }));
      }
    } catch (err) {
      console.error(err);
      setClients([]);
      setStatusMessage("Unable to load clients", true);
    } finally {
      setLoadingClients(false);
    }
  }

  async function loadPatients() {
    try {
      const res = await API.get("/patients/");
      setPatients(toList(res.data));
    } catch (err) {
      console.error(err);
      setPatients([]);
      setStatusMessage("Unable to load patients", true);
    }
  }

  async function loadAppointments() {
    try {
      const res = await API.get("/appointments/");
      setAppointments(toList(res.data));
    } catch (err) {
      console.error(err);
      setAppointments([]);
      setStatusMessage("Could not load appointments.", true);
    }
  }

  useEffect(() => {
    async function init() {
      await Promise.all([loadClients(), loadPatients(), loadAppointments()]);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!form.client) {
      setForm((s) => ({ ...s, patient: "" }));
      return;
    }
    const available = patients.filter((p) => String(p.client) === String(form.client));
    setForm((s) => {
      if (available.some((p) => String(p.id) === String(s.patient))) return s;
      return { ...s, patient: available.length ? String(available[0].id) : "" };
    });
  }, [form.client, patients]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatusMessage("Submitting...");
    if (!form.client || !form.patient || !form.date) {
      setStatusMessage("Please select client, patient and date/time", true);
      return;
    }

    const payload = {
      client: form.client,
      patient: form.patient,
      date: form.date,
      reason: form.reason || "",
    };

    try {
      const csrf = getCSRFToken();
      const headers = {};
      if (csrf) headers["X-CSRFToken"] = csrf;

      await API.post("/appointments/", payload, { headers });
      setStatusMessage("Appointment created");
      setForm((s) => ({ ...s, date: "", reason: "" }));
      await loadAppointments();
    } catch (err) {
      console.error(err);
      const detail = err?.response?.data || err?.message || "Request failed";
      setStatusMessage(typeof detail === "string" ? detail : JSON.stringify(detail), true);
    }
  }

  return (
    <div className="layout">
      <style>{`
:root{
  --card-bg: rgba(255,255,255,0.72);
  --shadow: 0 18px 40px rgba(0,0,0,0.18);
  --glass-bg: rgba(255,255,255,0.72);
  --glass-shadow: 0 18px 40px rgba(0,0,0,0.18);
}
*{box-sizing:border-box;}
html,body{height:100%;margin:0;font-family:"Segoe UI",Tahoma,Geneva,Verdana,sans-serif;}
body{
  background-image:url("https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg");
  background-size:cover;
  background-position:center;
}
.layout{display:flex;min-height:100vh;gap:20px;padding:20px;}
.sidebar{
  width:260px;
  background:var(--glass-bg);
  backdrop-filter:blur(14px);
  box-shadow:var(--glass-shadow);
  border-radius:18px;
  padding:24px 18px;
}
.sidebar h2{margin:0 0 20px;font-size:22px;text-align:center;}
.nav a{
  display:block;
  padding:12px 16px;
  border-radius:12px;
  margin-bottom:8px;
  text-decoration:none;
  font-weight:600;
  color:#111;
}
.nav a:hover, .nav a.active{
  background:rgba(0,0,0,0.85);
  color:#fff;
}
.main{flex:1;}
.wrap{max-width:1100px;margin:auto}
.hero{
  background:var(--card-bg);
  backdrop-filter:blur(12px);
  box-shadow:var(--shadow);
  border-radius:18px;
  padding:26px;
  text-align:center;
  margin-bottom:26px;
}
.form-card{
  max-width:720px;
  margin:auto;
  background:var(--card-bg);
  backdrop-filter:blur(12px);
  box-shadow:var(--shadow);
  border-radius:18px;
  padding:18px;
}
label{font-weight:600;margin-bottom:6px;display:block}
input,select,textarea,button{
  width:100%;
  padding:10px 12px;
  border-radius:12px;
  border:1px solid rgba(0,0,0,0.15);
  font-size:14px;
  box-sizing:border-box;
}
textarea{resize:none}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.full{grid-column:1/-1}
.btn{
  border-radius:999px;
  padding:10px 20px;
  font-weight:700;
  background:rgba(255,255,255,0.5);
  cursor:pointer;
}
.btn:hover{background:#000;color:#fff}
.cards{
  margin-top:30px;
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:18px;
}
.card{
  background:var(--card-bg);
  backdrop-filter:blur(12px);
  box-shadow:var(--shadow);
  border-radius:16px;
  padding:14px;
}
.status { margin-top:10px; font-weight:600; color:#0b5cff; }
@media (max-width:720px){
  .layout{flex-direction:column;}
  .sidebar{width:100%;}
}
      `}</style>

      <aside className="sidebar">
        <h2>Veterinary Management System(VMS)🩺🐾</h2>
        <nav className="nav">
          <a href="/customer-dashboard/">Dashboard</a>
          <a className="active" href="/appointments/">
            Appointments
          </a>
          <a href="/receipts/">Receipts</a>
        </nav>
      </aside>

      <main className="main">
        <div className="wrap">
          <div className="hero">
            <h1>Appointments🐾</h1>
            <p>Schedule client appointments to doctor</p>
          </div>

          <div className="form-card">
            <form id="appointmentForm" onSubmit={handleSubmit}>
              <div className="grid">
                <div className="full">
                  <label>Client</label>
                  <select name="client" value={form.client} onChange={handleChange} required>
                    <option value="">{loadingClients ? "Loading clients..." : "Select client"}</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name || c.username || `Client ${c.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="full">
                  <label>Patient</label>
                  <select name="patient" value={form.patient} onChange={handleChange} required disabled={!form.client}>
                    <option value="">{form.client ? "Select patient" : "Select client first"}</option>
                    {filteredPatients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.patient_id || `Patient ${p.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Date & Time</label>
                  <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required />
                </div>

                <div className="full">
                  <label>Reason</label>
                  <textarea name="reason" rows={3} value={form.reason} onChange={handleChange}></textarea>
                </div>
              </div>

              <div style={{ textAlign: "right", marginTop: 14 }}>
                <button className="btn" type="submit">
                  Add Appointment
                </button>
              </div>

              <p id="status" className="status" style={{ color: statusError ? "crimson" : "#0b5cff" }}>
                {status}
              </p>
            </form>
          </div>

          <div className="cards" id="appointmentsGrid">
            {appointments.length === 0 ? (
              <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#444" }}>No appointments yet.</p>
            ) : (
              appointments.map((a, idx) => {
                const when = a.date || a.appointment_date;
                const patient = a.patient_name || a.patient?.name || a.patient || "Unknown patient";
                return (
                  <div key={a.id ?? `appt-${idx}`} className="card">
                    <strong>{String(patient)}</strong>
                    <div>Date: {when ? new Date(when).toLocaleString() : "No date"}</div>
                    <div>{a.reason || ""}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
