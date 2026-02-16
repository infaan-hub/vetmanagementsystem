// src/pages/Treatments.jsx
import React, { useEffect, useState } from "react";
import API from "../api"; // your axios instance with credentials

export default function Treatments() {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [form, setForm] = useState({
    patient: "",
    visit: "",
    name: "",
    date: "",
    veterinarian: "",
    description: "",
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadPatients();
    loadTreatments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  }

  async function loadPatients() {
    try {
      const res = await API.get("/patients/");
      const list = toList(res.data);
      setPatients(list);
    } catch (err) {
      console.error(err);
      setPatients([]);
    }
  }

  async function loadVisitsForPatient(patientId) {
    setVisits([]);
    setForm((s) => ({ ...s, visit: "" }));
    if (!patientId) return;
    try {
      const res = await API.get(`/visits/?patient=${encodeURIComponent(patientId)}`);
      const list = toList(res.data);
      const filtered = list.filter((v) => String(v?.patient?.id ?? v?.patient) === String(patientId));
      const usable = filtered.length ? filtered : list;
      setVisits(usable);
      if (usable.length > 0) {
        const sorted = [...usable].sort((a, b) => {
          const aDate = a?.visit_date ? new Date(a.visit_date).getTime() : 0;
          const bDate = b?.visit_date ? new Date(b.visit_date).getTime() : 0;
          return bDate - aDate;
        });
        setForm((s) => ({ ...s, visit: sorted[0]?.id ?? sorted[0]?.pk ?? "" }));
      }
    } catch (err) {
      console.error(err);
      setVisits([]);
    }
  }

  async function loadTreatments() {
    try {
      const res = await API.get("/treatments/");
      setTreatments(toList(res.data));
    } catch (err) {
      console.error(err);
      setStatus("Error loading treatments");
    }
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
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "patient") {
      loadVisitsForPatient(value);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");

    if (!form.patient || !form.name) {
      setStatus("Please fill required fields.");
      return;
    }
    if (!form.visit) {
      setStatus("No visit found for selected patient. Create a visit first.");
      return;
    }

    const payload = {
      patient: form.patient,
      visit: form.visit,
      name: form.name,
      date: form.date || null,
      description: form.description || "",
    };

    try {
      await API.post("/treatments/", payload, {
        headers: { "X-CSRFToken": getCSRFToken() },
      });
      setStatus("Treatment added!");
      setForm((s) => ({
        patient: s.patient,
        visit: s.visit,
        name: "",
        date: "",
        veterinarian: "",
        description: "",
      }));
      loadTreatments();
    } catch (err) {
      console.error(err);
      const detail = err?.response?.data || err?.message || "Error adding treatment";
      setStatus(typeof detail === "string" ? detail : JSON.stringify(detail));
    }
  }

  return (
    <div className="layout-root">
      <style>{`
:root{
  --card-bg: rgba(255,255,255,0.72);
  --card-shadow: 0 18px 40px rgba(0,0,0,.18);
}
*{box-sizing:border-box}
body{
  margin:0;
  font-family:"Segoe UI",Tahoma,sans-serif;
  color:#111;
  background:url("https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg") center/cover no-repeat;
}

/* ===== Layout ===== */
.layout{display:flex;gap:20px;padding:24px;height:100vh;overflow:hidden}

/* ===== Sidebar ===== */
.sidebar{
  width:260px;
  background:var(--card-bg);
  backdrop-filter:blur(14px);
  box-shadow:var(--card-shadow);
  border-radius:18px;
  padding:24px 18px;
  display:flex;
  flex-direction:column;
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
.main{flex:1;overflow:auto;padding-right:10px}

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
.btn:hover{transform:translateY(-3px);background:rgba(0,0,0,0.85);color:#fff;}

/* ===== Form ===== */
.card{
  background:var(--card-bg);
  backdrop-filter:blur(12px);
  box-shadow:var(--card-shadow);
  border-radius:18px;
  padding:18px;
  margin-bottom:28px;
}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.full{grid-column:1/-1;}
label{font-weight:600;margin-bottom:6px;display:block;}
input,select,textarea{width:100%;padding:10px;border-radius:12px;border:1px solid rgba(0,0,0,.15);}
textarea{resize:vertical;min-height:100px;}
.status{margin-top:10px;font-weight:600;}

/* ===== Treatments Cards ===== */
.treatments{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
  gap:18px;
}
.treat-card{
  background:var(--card-bg);
  backdrop-filter:blur(12px);
  box-shadow:var(--card-shadow);
  border-radius:16px;
  padding:14px;
  transition: transform .18s ease, box-shadow .18s ease;
}
.treat-card:hover{transform:translateY(-6px);box-shadow:0 30px 60px rgba(0,0,0,0.25);}

@media(max-width:900px){.layout{flex-direction:column}.sidebar{width:100%}}
@media(max-width:720px){.grid{grid-template-columns:1fr}}
      `}</style>

      <div className="layout">
        <aside className="sidebar">
          <h2>🩺 VMS Doctor</h2>
          <nav className="nav">
            <a href="/doctor">Dashboard</a>
            <a href="/visits/">Visits</a>
            <a href="/allergies/">Allergies</a>
            <a href="/vitals/">Vitals</a>
            <a href="/medical-notes/">Medical Notes</a>
            <a href="/medications/">Medications</a>
            <a href="/documents/">Documents</a>
            <a className="active" href="/treatments/">Treatments</a>
          </nav>
        </aside>

        <main className="main">
          <div className="container">
            <div className="hero">
              <h1>Treatments</h1>
              <p>Clinical treatments & procedures</p>
            </div>

            <div className="card">
              <form onSubmit={handleSubmit}>
                <div className="grid">
                  <div>
                    <label>Patient</label>
                    <select name="patient" value={form.patient} onChange={handleChange} required>
                      <option value="">Select patient</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <div style={{ marginTop: 6, color: "#444", fontSize: 13 }}>
                      {form.patient
                        ? visits.length
                          ? `Auto-selected latest visit (#${form.visit || "-"})`
                          : "No visits for this patient"
                        : ""}
                    </div>
                  </div>
                  <div>
                    <label>Treatment Name</label>
                    <input name="name" value={form.name} onChange={handleChange} required />
                  </div>
                  <div>
                    <label>Date</label>
                    <input type="date" name="date" value={form.date} onChange={handleChange} />
                  </div>
                  <div>
                    <label>Veterinarian</label>
                    <input name="veterinarian" placeholder="Optional" value={form.veterinarian} onChange={handleChange} />
                  </div>
                  <div className="full">
                    <label>Description / Procedure</label>
                    <textarea name="description" value={form.description} onChange={handleChange}></textarea>
                  </div>
                </div>
                <div style={{ textAlign: "right", marginTop: 12 }}>
                  <button className="btn" type="submit">Add Treatment</button>
                </div>
                <p className="status">{status}</p>
              </form>
            </div>

            <div className="treatments">
              {treatments.length === 0 && <p>No treatments recorded</p>}
              {treatments.map((t) => (
                <div key={t.id} className="treat-card">
                  <strong>{t.name}</strong><br />
                  Patient: {t.patient_name || t.patient}<br />
                  Vet: {t.veterinarian || "-"}<br />
                  Date: {t.date || "-"}<br />
                  <div style={{ marginTop: 6 }}>{t.description || ""}</div>
                  <div style={{ marginTop: 6, fontSize: 13, color: "#555" }}>
                    {t.created_at ? new Date(t.created_at).toLocaleString() : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
