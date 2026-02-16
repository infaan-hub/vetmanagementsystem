// src/pages/Allergies.jsx
import React, { useEffect, useState } from "react";
import API from "../api";

export default function Allergies() {
  const [patients, setPatients] = useState([]);
  const [patientsMap, setPatientsMap] = useState({});
  const [allergies, setAllergies] = useState([]);
  const [form, setForm] = useState({
    patient: "",
    severity_level: "",
    description: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPatients();
    loadAllergies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPatients() {
    setLoadingPatients(true);
    try {
      const res = await API.get("/patients/");
      const list = res.data || [];
      setPatients(list);
      const map = {};
      list.forEach((p) => {
        map[p.id] = p;
      });
      setPatientsMap(map);
    } catch (err) {
      console.error("loadPatients:", err);
      setError("Could not load patients");
    } finally {
      setLoadingPatients(false);
    }
  }

  async function loadAllergies() {
    setStatus("Loading allergies...");
    try {
      // API wrapper returns res.data (consistent with other components)
      const res = await API.get("/allergies/");
      // handle paginated or plain arrays
      const data = res.data?.results ?? res.data ?? [];
      setAllergies(data);
      setStatus("");
    } catch (err) {
      console.error("loadAllergies:", err);
      setStatus("Could not load allergies.");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("");
    if (!form.patient) {
      setError("Please select a patient");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("patient", form.patient);
      if (form.severity_level) fd.append("severity_level", form.severity_level);
      if (form.description) fd.append("description", form.description);

      // POST via API (axios instance). FormData works fine.
      await API.post("/allergies/", fd);
      setStatus("✅ Allergy saved");
      setForm({ patient: "", severity_level: "", description: "" });
      loadAllergies();
    } catch (err) {
      console.error("submit error:", err);
      // Try to extract meaningful message
      const msg = err.response?.data?.detail
        || (typeof err.response?.data === "object" ? JSON.stringify(err.response.data) : err.message)
        || "Failed to save allergy";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // helper to display patient name (if API returned only id)
  const patientDisplay = (patientId) => {
    const p = patientsMap[patientId];
    if (!p) return `Patient (${patientId})`;
    return `${p.name || p.full_name || "Patient"} (${p.patient_id || p.client_id || p.id})`;
  };

  return (
    <div>
      {/* Inline CSS matching original HTML/stylesheet */}
      <style>{`
      :root{
        --card-bg: rgba(255,255,255,0.72);
        --card-shadow: 0 18px 40px rgba(0,0,0,0.18);
      }
      *{box-sizing:border-box}
      html,body{height:100%;margin:0}
      body{font-family:"Segoe UI",Tahoma,Verdana,sans-serif;
        background-image:url("https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg");
        background-size:cover;
        background-position:center;
        background-repeat:repeat;
      }
      .layout{display:flex;height:100vh;padding:24px;gap:20px}
      .sidebar{
        width:260px;background:var(--card-bg);backdrop-filter:blur(14px);
        box-shadow:var(--card-shadow);border-radius:18px;padding:24px 18px
      }
      .nav a{
        display:flex;padding:12px 16px;border-radius:12px;
        text-decoration:none;font-weight:600;color:#111;margin-bottom:8px
      }
      .nav a.active,.nav a:hover{background:#000;color:#fff}
      .main{flex:1;overflow:auto}
      .container{max-width:1100px;margin:auto;padding:36px 20px}
      .hero,.form-card,.allergy-card{
        background:var(--card-bg);backdrop-filter:blur(12px);
        box-shadow:var(--card-shadow);border-radius:18px
      }
      .form-card{padding:18px;margin-bottom:28px}
      .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .form-grid .full{grid-column:1/-1}
      input,select,textarea{
        width:100%;padding:10px;border-radius:12px;border:1px solid #ccc
      }
      textarea{min-height:100px}
      .btn{padding:10px 22px;border-radius:999px;font-weight:700;cursor:pointer}
      .allergies{
        display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px
      }
      .allergy-card{padding:14px}
      .status { margin-top:10px; font-weight:600; color:#0b5cff }
      .error { margin-top:10px; font-weight:700; color:crimson }
      `}</style>

      <div className="layout">
        <aside className="sidebar">
          <h2 style={{ textAlign: "center" }}>🩺 VMS Doctor</h2>
          <nav className="nav" style={{ marginTop: 12 }}>
            <a href="/doctor">Dashboard</a>
            <a className="active" href="/allergies/">Allergies</a>
            <a href="/visits/">Visits</a>
            <a href="/vitals/">Vitals</a>
            <a href="/medical-notes/">Medical Notes</a>
            <a href="/medications/">Medications</a>
            <a href="/documents/">Documents</a>
            <a href="/treatments/">Treatments</a>
          </nav>
        </aside>

        <main className="main">
          <div className="container">
            <div className="hero" style={{ padding: 26, textAlign: "center", marginBottom: 26 }}>
              <h1>Allergies</h1>
              <p>Record and manage patient allergy alerts.</p>
            </div>

            <div className="form-card">
              <form id="allergyForm" onSubmit={handleSubmit}>
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
                      <option value="">{loadingPatients ? "Loading patients…" : "Select patient…"}</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name ? `${p.name} (${p.patient_id ?? p.id})` : (p.full_name ?? p.username ?? p.id)}
                        </option>
                      ))}
                    </select>
                    <div id="patientHint" style={{ fontSize: 13, marginTop: 6 }}>
                      {patients.length ? `${patients.length} patients found` : ""}
                    </div>
                  </div>

                  <div>
                    <label>Severity</label>
                    <select
                      name="severity_level"
                      value={form.severity_level}
                      onChange={handleChange}
                    >
                      <option value="">(optional)</option>
                      <option>Low</option>
                      <option>Moderate</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>

                  <div className="full">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe the allergy..."
                    />
                  </div>
                </div>

                <div style={{ textAlign: "right", marginTop: 12 }}>
                  <button className="btn" type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Add Allergy"}
                  </button>
                </div>

                {status && <p className="status">{status}</p>}
                {error && <p className="error">{error}</p>}
              </form>
            </div>

            <div className="allergies" id="allergiesGrid">
              {allergies.length === 0 && <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#444" }}>No allergies yet.</p>}
              {allergies.map((a) => {
                const patientName = a.patient_name || (a.patient ? patientDisplay(a.patient) : "Patient");
                return (
                  <div key={a.id} className="allergy-card">
                    <strong>{patientName}</strong><br />
                    <small>Severity: {a.severity_level || "N/A"}</small>
                    <p style={{ marginTop: 8 }}>{a.description || a.notes || ""}</p>
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
