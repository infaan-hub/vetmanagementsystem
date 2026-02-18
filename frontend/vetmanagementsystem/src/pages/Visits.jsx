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
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingVisits, setLoadingVisits] = useState(false);

  // Load initial data
  useEffect(() => {
    loadPatients();
    loadVets();
    loadVisits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function formatApiErrors(resData) {
    if (!resData) return "Unknown";
    if (typeof resData === "string") return resData;
    if (Array.isArray(resData)) return resData.join(", ");
    if (typeof resData === "object") {
      return Object.entries(resData)
        .map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.join(", ")}` : `${k}: ${v}`))
        .join(" | ");
    }
    return JSON.stringify(resData);
  }

  function toLocalDateTimeInputValue(date) {
    const d = new Date(date);
    const pad = (v) => String(v).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  async function postVisitWithFallback(headers) {
    const base = {
      patient: form.patient,
      visit_date: form.visit_date,
    };

    const primaryPayload = {
      ...base,
      veterinarian: form.veterinarian || null,
      visit_status: form.visit_status,
      location_status: form.location_status || "",
      age_months: form.age_months || null,
      notes: form.notes || "",
    };

    const secondaryPayload = {
      ...base,
      reason: form.notes || "",
    };

    try {
      return await API.post("/visits/", primaryPayload, { headers });
    } catch (err) {
      const responseData = err?.response?.data;
      const hasNotesError =
        responseData &&
        typeof responseData === "object" &&
        Object.prototype.hasOwnProperty.call(responseData, "notes");
      const hasNonFieldError =
        Array.isArray(responseData?.non_field_errors) &&
        responseData.non_field_errors.length > 0;

      if (err?.response?.status === 400 && (hasNotesError || hasNonFieldError)) {
        return API.post("/visits/", secondaryPayload, { headers });
      }
      throw err;
    }
  }

  // Fetch patients
  async function loadPatients() {
    setLoadingPatients(true);
    try {
      const res = await API.get("/patients/");
      const list = toList(res.data);
      setPatients(list);
      if (list.length === 1) {
        setForm((p) => ({ ...p, patient: list[0].id ?? list[0].patient_id ?? "" }));
      }
    } catch (err) {
      console.error("loadPatients:", err);
    } finally {
      setLoadingPatients(false);
    }
  }

  // Fetch vets
  async function loadVets() {
    const endpoints = ["/users/", "/auth/users/", "/doctors/"];
    let loaded = [];
    for (const endpoint of endpoints) {
      try {
        const res = await API.get(endpoint);
        loaded = toList(res.data);
        if (loaded.length > 0) break;
      } catch (_err) {
        // try the next endpoint
      }
    }
    setVets(loaded);
  }

  // Fetch visits
  async function loadVisits() {
    setLoadingVisits(true);
    try {
      const res = await API.get("/visits/");
      const list = toList(res.data).sort((a, b) => {
        const aDate = a?.visit_date ? new Date(a.visit_date).getTime() : 0;
        const bDate = b?.visit_date ? new Date(b.visit_date).getTime() : 0;
        return bDate - aDate;
      });
      setVisits(list);
    } catch (err) {
      console.error("loadVisits:", err);
    } finally {
      setLoadingVisits(false);
    }
  }

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.patient || !form.visit_date) return;

    setLoading(true);
    try {
      const csrf = getCSRFToken();
      const headers = {};
      if (csrf) headers["X-CSRFToken"] = csrf;

      await postVisitWithFallback(headers);

      setForm({
        patient: form.patient,
        veterinarian: "",
        visit_date: toLocalDateTimeInputValue(new Date()),
        visit_status: "Checked-in",
        location_status: "",
        age_months: "",
        notes: "",
      });
      await loadVisits();
    } catch (err) {
      console.error("submit visit:", formatApiErrors(err?.response?.data || err?.message || err));
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

/* ===== Visits Cards ===== */
.visits{
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap:18px;
}
.visit-card{
  background:var(--card-bg);
  backdrop-filter: blur(12px) saturate(120%);
  box-shadow: var(--card-shadow);
  border-radius:16px;
  padding:14px;
  transition: transform .18s ease, box-shadow .18s ease;
  overflow:hidden;
}
.visit-card:hover{
  transform: translateY(-6px);
  box-shadow:0 30px 60px rgba(0,0,0,0.25);
}
.visit-meta{font-size:14px;color:#222;line-height:1.4;}

@media(max-width:960px){.form-grid{grid-template-columns:1fr 1fr}}
@media(max-width:640px){.form-grid{grid-template-columns:1fr}.container{padding:20px}}
@media(max-width:600px){
  .container{padding:10px}
}
      `}</style>

      {/* Sidebar */}
      <aside className="sidebar">
        <h2>VMS Doctor Panel🩺</h2>
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
            <h1>Visits🩺</h1>
            <p>Create and browse visit records. Assign patients, optionally a veterinarian, set visit date and status.</p>
          </div>

          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label>Patient</label>
                  <select name="patient" value={form.patient} onChange={handleChange} required>
                    <option value="">
                      {patients.length ? "Select patient" : (loadingPatients ? "Loading patients..." : "No patients found")}
                    </option>
                    {patients.map((p) => (
                      <option key={p.id ?? p.patient_id} value={p.id ?? p.patient_id}>
                        {p.name} {p.patient_id ? `— ${p.patient_id}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Veterinarian (optional)</label>
                  <select name="veterinarian" value={form.veterinarian} onChange={handleChange}>
                    <option value="">{vets.length ? "(not assigned)" : "No vets endpoint found"}</option>
                    {vets.map((v) => (
                      <option key={v.id ?? v.pk ?? v.username} value={v.id ?? v.pk ?? v.username}>
                        {v.full_name || v.username || v.email || v.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Visit date & time</label>
                  <input type="datetime-local" name="visit_date" value={form.visit_date} onChange={handleChange} required />
                </div>

                <div>
                  <label>Visit status</label>
                  <select name="visit_status" value={form.visit_status} onChange={handleChange} required>
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
                  <input type="number" name="age_months" value={form.age_months} onChange={handleChange} min="0" />
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
            </form>
          </div>

          <div className="visits">
            {!loadingVisits && visits.length === 0 && <p style={{ gridColumn: "1/-1", color: "#333" }}>No visits yet.</p>}
            {visits.map((v) => {
              const patientLabel = v.patient_name || v.patient_display || v.patient || v.patient_id || "-";
              const vetLabel = v.veterinarian_name || v.veterinarian_display || v.veterinarian || "(not set)";
              const date = v.visit_date ? new Date(v.visit_date).toLocaleString() : "-";
              const noteText = v.notes || v.reason || "";
              return (
                <div key={v.id ?? `${patientLabel}-${date}`} className="visit-card">
                  <div className="visit-meta">
                    <strong>Patient: {String(patientLabel)}</strong>
                    <br />
                    <small>{String(date)}</small>
                    <p style={{ margin: "8px 0 0" }}>
                      Status: {v.visit_status || "-"}
                      <br />
                      Location: {v.location_status || "-"}
                      <br />
                      Age (months): {v.age_months ?? "-"}
                      <br />
                      Vet: {String(vetLabel)}
                    </p>
                    <p style={{ marginTop: 8, color: "#333" }}>{noteText ? String(noteText).substring(0, 220) : ""}</p>
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
