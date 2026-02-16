// src/pages/Visits.jsx
import React, { useEffect, useState } from "react";
import API from "../api"; // your axios instance or fetch wrapper

export default function Visits() {
  const [patients, setPatients] = useState([]);
  const [vets, setVets] = useState([]);
  const [visits, setVisits] = useState([]);
  const [form, setForm] = useState({
    patient: "",
    veterinarian: "",
    visit_date: "",
    visit_status: "Checked-in",
    location_status: "",
    age_months: "",
    notes: "",
  });
  const [status, setStatus] = useState("");
  const [debug, setDebug] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadPatients();
    loadVets();
    loadVisits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getCSRFToken() {
    const cookieString = document.cookie || "";
    for (const c of cookieString.split(";").map((s) => s.trim())) {
      if (c.startsWith("csrftoken=")) return decodeURIComponent(c.split("=")[1]);
    }
    return null;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function formatApiErrors(resData) {
    if (!resData) return "Unknown";
    if (typeof resData === "string") return resData;
    if (Array.isArray(resData)) return resData.join(", ");
    if (typeof resData === "object")
      return Object.entries(resData)
        .map(([k, v]) =>
          Array.isArray(v) ? `${k}: ${v.join(", ")}` : `${k}: ${v}`
        )
        .join(" | ");
    return JSON.stringify(resData);
  }

  // Fetch patients
  async function loadPatients() {
    try {
      const res = await API.get("/patients/");
      setPatients(res.data || []);
      if (res.data && res.data.length === 1) {
        setForm((p) => ({ ...p, patient: res.data[0].id }));
      }
    } catch (err) {
      console.error("loadPatients:", err);
      setStatus("Could not load patients");
      setDebug(err);
    }
  }

  // Fetch vets
  async function loadVets() {
    try {
      const res = await API.get("/users/");
      setVets(res.data || []);
    } catch (err) {
      console.error("loadVets:", err);
      setDebug(err);
    }
  }

  // Fetch visits
  async function loadVisits() {
    try {
      const res = await API.get("/visits/");
      setVisits(res.data || []);
    } catch (err) {
      console.error("loadVisits:", err);
      setStatus("Could not load visits");
      setDebug(err);
    }
  }

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    setDebug(null);

    if (!form.patient) return setStatus("Select a patient");
    if (!form.visit_date) return setStatus("Enter visit date");

    setLoading(true);
    const payload = {
      patient: form.patient,
      veterinarian: form.veterinarian || null,
      visit_date: form.visit_date,
      visit_status: form.visit_status,
      location_status: form.location_status || "",
      age_months: form.age_months || null,
      notes: form.notes || "",
    };

    try {
      const csrf = getCSRFToken();
      if (!csrf) {
        setStatus("CSRF token missing");
        return;
      }

      const res = await API.post("/visits/", payload, {
        headers: { "X-CSRFToken": csrf },
      });

      setStatus("Visit added successfully!");
      setDebug(res.data);
      setForm({
        patient: "",
        veterinarian: "",
        visit_date: "",
        visit_status: "Checked-in",
        location_status: "",
        age_months: "",
        notes: "",
      });
      loadVisits();
      loadPatients();
    } catch (err) {
      console.error("submit visit:", err);
      const detail =
        err?.response?.data ||
        err?.response?.statusText ||
        err?.message ||
        "Submission failed";
      setStatus("Error: " + (typeof detail === "string" ? detail : JSON.stringify(detail)));
      setDebug(err?.response?.data ?? err?.toString());
    } finally {
      setLoading(false);
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
  flex-direction:row; /* keep sidebar left */
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

/* ===== Notes Cards ===== */
.notes{
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap:18px;
}
.note-card{
  background:var(--card-bg);
  backdrop-filter: blur(12px) saturate(120%);
  box-shadow: var(--card-shadow);
  border-radius:16px;
  padding:14px;
  transition: transform .18s ease, box-shadow .18s ease;
  overflow:hidden;
}
.note-card:hover{
  transform: translateY(-6px);
  box-shadow:0 30px 60px rgba(0,0,0,0.25);
}
.meta{font-size:14px;color:#222;line-height:1.4;}

@media(max-width:960px){.form-grid{grid-template-columns:1fr 1fr}}
@media(max-width:640px){.form-grid{grid-template-columns:1fr}.container{padding:20px}}
@media(max-width:600px){
  .layout{flex-direction:row; overflow-x:auto;} /* keep row layout, allow scroll */
  .sidebar{width:200px;}
}
      `}</style>

      {/* Sidebar */}
      <aside className="sidebar">
        <h2>🩺 VMS Doctor</h2>
        <nav className="nav">
          <a href="/doctor">Dashboard</a>
          <a className="active" href="/visits/">Visits</a>
          <a href="/allergies/">Allergies</a>
          <a href="/vitals/">Vitals</a>
          <a href="/medical-notes/">Medical Notes</a>
          <a href="/medications/">Medications</a>
          <a href="/documents/">Documents</a>
          <a href="/treatments/">Treatments</a>
        </nav>
      </aside>

      {/* Main */}
      <main className="main">
        <div className="container">
          <div className="hero">
            <h1>Visits</h1>
            <p>Create and browse visit records. Assign patients, optionally a veterinarian, set visit date and status.</p>
          </div>

          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label>Patient</label>
                  <select
                    name="patient"
                    value={form.patient}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      {patients.length ? "Select patient" : "Loading patients..."}
                    </option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.patient_id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Veterinarian (optional)</label>
                  <select
                    name="veterinarian"
                    value={form.veterinarian}
                    onChange={handleChange}
                  >
                    <option value="">{vets.length ? "(not assigned)" : "Loading vets..."}</option>
                    {vets.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.full_name || v.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Visit date & time</label>
                  <input
                    type="datetime-local"
                    name="visit_date"
                    value={form.visit_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>Visit status</label>
                  <select
                    name="visit_status"
                    value={form.visit_status}
                    onChange={handleChange}
                    required
                  >
                    <option value="Checked-in">Checked-in</option>
                    <option value="Ready for discharge">Ready for discharge</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>

                <div>
                  <label>Location status</label>
                  <input
                    type="text"
                    name="location_status"
                    value={form.location_status}
                    onChange={handleChange}
                    placeholder="e.g. Kennel 3"
                  />
                </div>

                <div>
                  <label>Age (months)</label>
                  <input
                    type="number"
                    name="age_months"
                    value={form.age_months}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="full">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Clinical notes, reason for visit..."
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 }}>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? "Adding..." : "Add Visit"}
                </button>
              </div>

              <p className="status" style={{ color: status.startsWith("Error") ? "crimson" : "green" }}>
                {status}
              </p>
              {debug && (
                <pre style={{ marginTop: 8, color: "#444", fontSize: 13 }}>
                  {JSON.stringify(debug, null, 2)}
                </pre>
              )}
            </form>
          </div>

          <div className="visits">
            {visits.length === 0 && <p style={{ gridColumn: "1/-1", color: "#333" }}>No visits yet.</p>}
            {visits.map((v) => {
              const patientLabel = v.patient_name || v.patient_display || v.patient || v.patient_id || "-";
              const vetLabel = v.veterinarian_name || v.veterinarian_display || v.veterinarian || "(not set)";
              const date = v.visit_date ? new Date(v.visit_date).toLocaleString() : "-";
              return (
                <div key={v.id} className="visit-card">
                  <div className="visit-meta">
                    <strong>Patient: {patientLabel}</strong><br/>
                    <small>{date}</small>
                    <p style={{ margin: "8px 0 0" }}>
                      Status: {v.visit_status || "-"}<br/>
                      Location: {v.location_status || "-"}<br/>
                      Age (months): {v.age_months ?? "-"}<br/>
                      Vet: {vetLabel}
                    </p>
                    <p style={{ marginTop: 8, color: "#333" }}>
                      {v.notes ? v.notes.substring(0, 220) : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
