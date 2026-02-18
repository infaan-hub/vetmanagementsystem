import React, { useEffect, useState } from "react";
import API from "../api";

export default function Medications() {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [medications, setMedications] = useState([]);
  const [form, setForm] = useState({
    patient: "",
    visit: "",
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPatients();
    loadMedications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  }

  function toId(value) {
    if (!value || typeof value !== "object") return value;
    return value.id ?? value.pk ?? "";
  }

  function getCSRFToken() {
    const cookieString = document.cookie || "";
    for (const c of cookieString.split(";").map((s) => s.trim())) {
      if (c.startsWith("csrftoken=")) return decodeURIComponent(c.split("=")[1]);
    }
    return null;
  }

  async function loadPatients() {
    try {
      const res = await API.get("/patients/");
      setPatients(toList(res.data));
    } catch (err) {
      console.error("loadPatients:", err);
      setStatus("Error loading patients");
    }
  }

  async function loadVisitsForPatient(patientId) {
    setVisits([]);
    setForm((s) => ({ ...s, visit: "" }));
    if (!patientId) return;
    try {
      const res = await API.get(`/visits/?patient=${encodeURIComponent(patientId)}`);
      const list = toList(res.data);
      const filtered = list.filter((v) => String(toId(v?.patient)) === String(patientId));
      const usable = filtered.length ? filtered : list;
      setVisits(usable);
      if (usable.length > 0) {
        const sorted = [...usable].sort((a, b) => {
          const aDate = a?.visit_date ? new Date(a.visit_date).getTime() : 0;
          const bDate = b?.visit_date ? new Date(b.visit_date).getTime() : 0;
          return bDate - aDate;
        });
        setForm((s) => ({ ...s, visit: sorted[0].id ?? sorted[0].pk ?? "" }));
      } else {
        setStatus("No visits found for selected patient");
      }
    } catch (err) {
      console.error("loadVisitsForPatient:", err);
      setStatus("Could not load visits for selected patient");
    }
  }

  async function loadMedications() {
    try {
      const res = await API.get("/medications/");
      setMedications(toList(res.data));
    } catch (err) {
      console.error("loadMedications:", err);
      setStatus("Error loading medications");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (name === "patient") {
      loadVisitsForPatient(value);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");

    if (!form.patient) {
      setStatus("Select a patient");
      return;
    }
    if (!form.visit) {
      setStatus("No visit found for this patient. Create a visit first.");
      return;
    }
    if (!form.name.trim()) {
      setStatus("Medication name is required");
      return;
    }

    setLoading(true);
    const payload = {
      visit: form.visit,
      name: form.name,
      dosage: form.dosage || "",
      frequency: form.frequency || "",
      duration: form.duration || "",
      notes: form.instructions || "",
    };

    try {
      const csrf = getCSRFToken();
      const headers = {};
      if (csrf) headers["X-CSRFToken"] = csrf;
      await API.post("/medications/", payload, { headers });
      setStatus("Medication added");
      setForm((s) => ({
        patient: s.patient,
        visit: s.visit,
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      }));
      await loadMedications();
    } catch (err) {
      console.error("submit medication:", err);
      const detail = err?.response?.data || err?.message || "Error saving medication";
      setStatus(typeof detail === "string" ? detail : JSON.stringify(detail));
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
body{margin:0;font-family:"Segoe UI",Tahoma,Verdana,sans-serif;color:#111;background-image:url("https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg");background-size:cover;background-position:center;}

/* ===== Layout ===== */
.layout{display:flex;gap:20px;padding:24px;height:100vh;}

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

/* ===== Medications Cards ===== */
.medications{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
  gap:18px;
}
.med-card{
  background:var(--card-bg);
  backdrop-filter:blur(12px);
  box-shadow:var(--card-shadow);
  border-radius:16px;
  padding:14px;
  transition: transform .18s ease, box-shadow .18s ease;
}
.med-card:hover{transform:translateY(-6px);box-shadow:0 30px 60px rgba(0,0,0,0.25);}

@media(max-width:900px){.layout{flex-direction:column}.sidebar{width:100%}}
@media(max-width:720px){.grid{grid-template-columns:1fr}}
`}</style>

      <aside className="sidebar">
        <h2>VMS Doctor Panel🩺</h2>
        <nav className="nav">
          <a href="/doctor">Dashboard</a>
          <a href="/visits/">Visits</a>
          <a href="/allergies/">Allergies</a>
          <a href="/vitals/">Vitals</a>
          <a href="/medical-notes/">Medical Notes</a>
          <a className="active" href="/medications/">
            Medications
          </a>
          <a href="/documents/">Documents</a>
          <a href="/treatments/">Treatments</a>
        </nav>
      </aside>

      <main className="main">
        <div className="container">
          <div className="hero">
            <h1>Medications🩺</h1>
            <p>Prescribed medications and treatment schedules</p>
          </div>

          <div className="card">
            <form id="medForm" onSubmit={handleSubmit}>
              <div className="grid">
                <div>
                  <label>Patient</label>
                  <select id="patientSelect" name="patient" value={form.patient} onChange={handleChange} required>
                    <option value="">{patients.length ? "Select patient" : "Loading patients..."}</option>
                    {patients.map((p) => (
                      <option key={p.id ?? p.patient_id} value={p.id ?? p.patient_id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Medication Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div>
                  <label>Dosage</label>
                  <input name="dosage" value={form.dosage} onChange={handleChange} placeholder="e.g. 5mg" />
                </div>
                <div>
                  <label>Frequency</label>
                  <input name="frequency" value={form.frequency} onChange={handleChange} placeholder="e.g. Twice daily" />
                </div>
                <div>
                  <label>Duration</label>
                  <input name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 7 days" />
                </div>
                <div className="full">
                  <label>Instructions</label>
                  <textarea name="instructions" value={form.instructions} onChange={handleChange}></textarea>
                </div>
              </div>

              <div style={{ textAlign: "right", marginTop: 12 }}>
                <button className="btn" disabled={loading}>
                  {loading ? "Adding..." : "Add Medication"}
                </button>
              </div>

              <p id="status" className="status">
                {status}
              </p>
            </form>
          </div>

          <div className="medications" id="medGrid">
            {medications.length === 0 && <p>No medications</p>}
            {medications.map((m, index) => (
              <div key={m.id ?? `m-${index}`} className="med-card">
                <strong>{m.name}</strong>
                <br />
                Patient: {m.patient_name || m.patient || "-"}
                <br />
                Dosage: {m.dosage || "-"}
                <br />
                Frequency: {m.frequency || "-"}
                <br />
                Duration: {m.duration || "-"}
                <br />
                <small>{m.created_at ? new Date(m.created_at).toLocaleString() : ""}</small>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
