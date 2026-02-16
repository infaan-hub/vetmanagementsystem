// src/pages/Vitals.jsx
import React, { useEffect, useState } from "react";
import API from "../api";

export default function Vitals() {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [status, setStatus] = useState("");
  const [debug, setDebug] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patient: "",
    visit: "",
    temperature: "",
    heart_rate: "",
    respiratory_rate: "",
    weight_kg: "",
    recorded_at: "",
    notes: "",
  });

  useEffect(() => {
    loadPatients();
    loadVitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPatients() {
    try {
      const res = await API.get("/patients/");
      setPatients(res.data || []);
    } catch (err) {
      console.error(err);
      setStatus("Could not load patients");
      setDebug(String(err));
    }
  }

  async function loadVisitsForPatient(patientId) {
    if (!patientId) {
      setVisits([]);
      setForm((s) => ({ ...s, visit: "" }));
      return;
    }
    try {
      // try endpoint that filters by patient (commonly available)
      const res = await API.get(`/visits/?patient=${patientId}`);
      setVisits(res.data || []);
      // if there is at least one visit, preselect the latest
      if (Array.isArray(res.data) && res.data.length > 0) {
        setForm((s) => ({ ...s, visit: res.data[0].id }));
      } else {
        setForm((s) => ({ ...s, visit: "" }));
      }
    } catch (err) {
      // if backend doesn't support filtering like that, just clear visits
      console.warn("Could not load visits:", err);
      setVisits([]);
      setForm((s) => ({ ...s, visit: "" }));
    }
  }

  async function loadVitals() {
    try {
      const res = await API.get("/vitals/");
      setVitals(res.data || []);
    } catch (err) {
      console.error(err);
      setStatus("Could not load vitals");
      setDebug(String(err));
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (name === "patient") {
      // load visits for selected patient
      loadVisitsForPatient(value);
    }
  }

  function clearStatus() {
    setTimeout(() => {
      setStatus("");
    }, 3500);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    setDebug("");
    // Minimal validation
    if (!form.patient || !form.recorded_at) {
      setStatus("Please select a patient and recorded time.");
      return;
    }

    setLoading(true);
    try {
      // prepare payload - use visit if available, otherwise include patient (best-effort)
      const payload = {
        // prefer visit id if set
        ...(form.visit ? { visit: form.visit } : { patient: form.patient }),
        // numeric fields
        ...(form.temperature ? { temperature: parseFloat(form.temperature) } : {}),
        ...(form.heart_rate ? { heart_rate: parseInt(form.heart_rate, 10) } : {}),
        ...(form.respiratory_rate ? { respiratory_rate: parseInt(form.respiratory_rate, 10) } : {}),
        ...(form.weight_kg ? { weight_kg: parseFloat(form.weight_kg) } : {}),
        ...(form.recorded_at ? { recorded_at: form.recorded_at } : {}),
        ...(form.notes ? { notes: form.notes } : {}),
      };

      const res = await API.post("/vitals/", payload);
      setStatus("Vitals added successfully!");
      setDebug(JSON.stringify(res.data, null, 2));
      // reset form but keep patient selected if there is only one client/patient
      setForm((s) => ({
        patient: s.patient,
        visit: s.visit,
        temperature: "",
        heart_rate: "",
        respiratory_rate: "",
        weight_kg: "",
        recorded_at: "",
        notes: "",
      }));
      await loadVitals();
    } catch (err) {
      console.error("submit error:", err);
      setStatus("Failed to submit vitals — see debug.");
      setDebug(err.response?.data ? JSON.stringify(err.response.data, null, 2) : String(err));
    } finally {
      setLoading(false);
      clearStatus();
    }
  }

  return (
    <div className="layout">
  <style>{`
:root{
  --card-bg: rgba(255,255,255,0.72);
  --card-shadow: 0 18px 40px rgba(0,0,0,0.18);
}
*{box-sizing:border-box}
html,body{height:100%;margin:0}
body{
  font-family:"Segoe UI",Tahoma,Verdana,sans-serif;
  background-image:url("https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg");
  background-size:cover;
  background-position:center;
  background-repeat:repeat;
  color:#111;
}

/* ===== Layout ===== */
.layout{
  display:flex;
  height:100vh;
  gap:20px;
  padding:24px;
  flex-direction:row; /* always keep sidebar left */
}

/* ===== Sidebar ===== */
.sidebar{
  width:260px;
  flex-shrink:0;
  background:var(--card-bg);
  backdrop-filter:blur(14px);
  box-shadow:var(--card-shadow);
  border-radius:18px;
  padding:24px 18px;
  display:flex;
  flex-direction:column;
  position:sticky;
  top:24px;
  height:calc(100vh - 48px);
  overflow-y:auto;
}
.sidebar h2{text-align:center;margin:0 0 20px;font-size:22px}
.nav a{
  display:flex;
  align-items:center;
  gap:10px;
  padding:12px 16px;
  border-radius:12px;
  margin-bottom:8px;
  text-decoration:none;
  font-weight:600;
  color:#111;
}
.nav a.active,.nav a:hover{
  background:rgba(0,0,0,0.85);
  color:#fff;
}

/* ===== Main ===== */
.main{flex:1;overflow:auto}

/* ===== Container ===== */
.container{max-width:1100px;margin:0 auto;padding:0 20px}

/* ===== Hero ===== */
.hero{
  background:var(--card-bg);
  backdrop-filter: blur(12px) saturate(120%);
  box-shadow: var(--card-shadow);
  border-radius: 18px;
  padding: 28px 22px;
  text-align:center;
  margin-bottom:26px;
}
.hero h1{margin:0 0 8px;font-size:28px}
.hero p{margin:0;color:#222}

/* ===== Buttons ===== */
.btn{
  display:inline-block;
  padding:10px 20px;
  border-radius:999px;
  font-weight:700;
  border:1px solid rgba(0,0,0,0.12);
  background: rgba(255,255,255,0.42);
  cursor:pointer;
}
.btn:hover{
  transform:translateY(-3px);
  background:rgba(0,0,0,0.85);
  color:#fff;
}

/* ===== Form ===== */
.form-card{
  max-width:840px;
  margin:0 auto 28px;
  background:var(--card-bg);
  backdrop-filter: blur(12px) saturate(120%);
  box-shadow: var(--card-shadow);
  border-radius: 18px;
  padding: 18px;
}
.form-grid{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap:12px;
  align-items:flex-start;
}
.form-grid .full { grid-column: 1 / -1; }
label{display:block;font-weight:600;margin-bottom:6px}
input,select,textarea{
  width:100%;
  padding:10px 12px;
  border-radius:12px;
  border:1px solid rgba(0,0,0,0.12);
  font-size:14px;
  box-sizing:border-box;
}
textarea{min-height:80px;padding:10px;border-radius:12px}
.status{margin-top:10px;font-weight:600}

/* ===== Vitals Cards ===== */
.vitals{
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap:18px;
}
.vital-card{
  background:var(--card-bg);
  backdrop-filter: blur(12px) saturate(120%);
  box-shadow: var(--card-shadow);
  border-radius:16px;
  padding:14px;
  transition: transform .18s ease, box-shadow .18s ease;
  overflow:hidden;
}
.vital-card:hover{
  transform: translateY(-6px);
  box-shadow:0 30px 60px rgba(0,0,0,0.25);
}
.meta{font-size:14px;color:#222;line-height:1.4;}

/* ===== Responsive ===== */
@media(max-width:960px){.form-grid{grid-template-columns:1fr 1fr}}
@media(max-width:640px){.form-grid{grid-template-columns:1fr}.container{padding:20px}}
@media(max-width:600px){
  .layout{flex-direction:row; overflow-x:auto;} /* keep row layout, allow scroll */
  .sidebar{width:200px;}
}
      `}</style>


      <div className="layout">
        <aside className="sidebar">
          <h2>🩺 VMS Doctor</h2>
          <nav className="nav">
            <a href="/doctor">Dashboard</a>
            <a href="/visits/">Visits</a>
            <a href="/allergies/">Allergies</a>
            <a className="active" href="/vitals/">Vitals</a>
            <a href="/medical-notes/">Medical Notes</a>
            <a href="/medications/">Medications</a>
            <a href="/documents/">Documents</a>
            <a href="/treatments/">Treatments</a>
          </nav>
        </aside>

        <main className="main">
          <div className="container">
            <div className="hero">
              <h1>Vitals</h1>
              <p>Record vitals for patients and browse existing vitals records.</p>
            </div>

            <div className="form-card">
              <form id="vitalForm" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div>
                    <label>Patient</label>
                    <select
                      id="patientSelect"
                      name="patient"
                      required
                      value={form.patient}
                      onChange={handleChange}
                    >
                      <option value="">Select patient</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.patient_id ? ` — ${p.patient_id}` : ""}
                        </option>
                      ))}
                    </select>
                    <div id="patientHint" style={{ marginTop: 6, color: "#444", fontSize: 13 }}>
                      {visits.length > 0 ? `${visits.length} visits found` : ""}
                    </div>
                  </div>

                  <div>
                    <label>Temperature (°C)</label>
                    <input
                      type="number"
                      name="temperature"
                      step="0.1"
                      min="30"
                      max="45"
                      placeholder="e.g. 38.5"
                      value={form.temperature}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label>Heart Rate (bpm)</label>
                    <input
                      type="number"
                      name="heart_rate"
                      step="1"
                      min="20"
                      max="300"
                      value={form.heart_rate}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label>Respiratory Rate (breaths/min)</label>
                    <input
                      type="number"
                      name="respiratory_rate"
                      step="1"
                      min="5"
                      max="150"
                      value={form.respiratory_rate}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label>Weight (kg)</label>
                    <input
                      type="number"
                      name="weight_kg"
                      step="0.01"
                      min="0"
                      value={form.weight_kg}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label>Recorded At</label>
                    <input
                      type="datetime-local"
                      name="recorded_at"
                      required
                      value={form.recorded_at}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Show Visit select if visits were found for the patient */}
                  {visits.length > 0 && (
                    <div className="full">
                      <label>Visit (optional)</label>
                      <select name="visit" value={form.visit} onChange={handleChange}>
                        <option value="">Select visit (optional)</option>
                        {visits.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.summary || v.visit_date || `Visit ${v.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="full">
                    <label>Notes</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Optional notes about vitals..."></textarea>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 }}>
                  <button className="btn" type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Add Vitals"}
                  </button>
                </div>

                <p id="status" className="status" style={{ color: status.includes("Failed") ? "crimson" : "green" }}>
                  {status}
                </p>
                <pre id="debug" style={{ marginTop: 8, color: "#444", fontSize: 13 }}>{debug}</pre>
              </form>
            </div>

            <div className="vitals" id="vitalsGrid">
              {vitals.length === 0 && <p style={{ gridColumn: "1/-1", color: "#333" }}>No vitals recorded.</p>}
              {vitals.map((v) => {
                // support different field names that API might return
                const patientLabel = v.patient_name || v.patient_display || v.patient || (v.visit?.patient_name ?? "-");
                const recordedAt = v.recorded_at || v.recorded || v.created_at || "";
                return (
                  <div key={v.id} className="vital-card">
                    <div className="meta">
                      <strong>Patient: {patientLabel}</strong><br />
                      <small>Recorded: {recordedAt ? new Date(recordedAt).toLocaleString() : "-"}</small>
                      <p style={{ margin: "6px 0 0" }}>
                        Temp: {v.temperature ?? v.temp ?? "-"} °C<br />
                        HR: {v.heart_rate ?? v.pulse ?? "-"} bpm<br />
                        RR: {v.respiratory_rate ?? v.respiration ?? "-"} breaths/min<br />
                        Weight: {v.weight_kg ?? v.weight ?? v.weight_lbs ?? "-"} {v.weight_kg ? "kg" : ""}
                      </p>
                      <p style={{ marginTop: 6, color: "#333" }}>{v.notes ?? v.comment ?? ""}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
