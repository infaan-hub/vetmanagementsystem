// src/pages/MedicalNotes.jsx
import React, { useEffect, useState } from "react";
import API from "../api"; // your axios instance

export default function MedicalNotes() {
  const [patients, setPatients] = useState([]);
  const [vets, setVets] = useState([]);
  const [visits, setVisits] = useState([]);
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({
    patient: "",
    visit: "",
    note_type: "Observation",
    veterinarian: "",
    title: "",
    body: "",
  });
  const [status, setStatus] = useState("");
  const [debug, setDebug] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingVisits, setLoadingVisits] = useState(false);

  useEffect(() => {
    loadPatients();
    loadVets();
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  }

  function toId(value) {
    if (!value || typeof value !== "object") return value;
    return value.id ?? value.pk ?? value.patient_id ?? "";
  }

  async function loadPatients() {
    setLoadingPatients(true);
    try {
      const res = await API.get("/patients/");
      setPatients(toList(res.data));
    } catch (err) {
      console.error("loadPatients:", err);
      setStatus("Could not load patients.");
    } finally {
      setLoadingPatients(false);
    }
  }

  async function loadVets() {
    const endpoints = ["/users/", "/auth/users/", "/doctors/"];
    try {
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
    } catch (err) {
      console.error("loadVets:", err);
      // not critical
    }
  }

  async function loadVisitsForPatient(patientId) {
    setLoadingVisits(true);
    setVisits([]);
    setForm((s) => ({ ...s, visit: "" }));
    if (!patientId) {
      setLoadingVisits(false);
      return;
    }
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
        setForm((s) => ({ ...s, visit: toId(sorted[0]) }));
      }
    } catch (err) {
      console.warn("Could not load visits for patient:", err);
      // leave visits empty
    } finally {
      setLoadingVisits(false);
    }
  }

  async function loadNotes() {
    try {
      const res = await API.get("/medical-notes/");
      setNotes(toList(res.data));
    } catch (err) {
      console.error("loadNotes:", err);
      setStatus("Could not load medical notes.");
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
    setForm((p) => ({ ...p, [name]: value }));
    if (name === "patient") {
      loadVisitsForPatient(value);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    setDebug(null);

    // Validation aligned with Django model: visit and note are required
    if (!form.visit) {
      setStatus("Please select a visit (required).");
      return;
    }
    if (!form.body || form.body.trim() === "") {
      setStatus("Note body is required.");
      return;
    }

    setLoading(true);

    // Backend ClientNote serializer accepts only `visit` and `note`.
    const payload = {
      visit: form.visit,
      note: form.body,
    };

    try {
      const csrf = getCSRFToken();
      const headers = {};
      if (csrf) headers["X-CSRFToken"] = csrf;

      const res = await API.post("/medical-notes/", payload, { headers });
      const selectedPatient = form.patient;
      setStatus("Medical note added!");
      setDebug(res.data);

      // reset but keep patient selected (and visits) to allow quick multi-add
      setForm({
        patient: selectedPatient,
        visit: "",
        note_type: "Observation",
        veterinarian: "",
        title: "",
        body: "",
      });
      // reload visits for the patient (server may create note -> visit unchanged)
      if (selectedPatient) await loadVisitsForPatient(selectedPatient);
      await loadNotes();
    } catch (err) {
      console.error("submit note:", err);
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

  // Helper to derive a readable label from a visit record
  function visitLabelFromVisit(v) {
    if (!v) return "";
    if (v.summary) return v.summary;
    if (v.visit_date) return v.visit_date;
    if (v.patient && (v.patient.name || v.patient.patient_id)) {
      return `${v.patient.name || "Patient"}${v.patient.patient_id ? ` — ${v.patient.patient_id}` : ""}`;
    }
    return `Visit ${v.id ?? v.pk ?? ""}`;
  }

  return (
    <div>
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
  .container{padding:10px}
}
      `}</style>

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar" aria-hidden={false}>
          <h2>VMS Doctor Panel🩺</h2>
          <nav className="nav" aria-label="doctor navigation">
            <a href="/doctor">Dashboard</a>
            <a href="/visits/">Visits</a>
            <a href="/allergies/">Allergies</a>
            <a href="/vitals/">Vitals</a>
            <a className="active" href="/medical-notes/">
              Medical Notes
            </a>
            <a href="/medications/">Medications</a>
            <a href="/documents/">Documents</a>
            <a href="/treatments/">Treatments</a>
          </nav>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="container">
            <div className="hero">
              <h1>Medical Notes🩺</h1>
              <p>Create clinical notes, prescriptions, observations and browse past notes.</p>
            </div>

            <div className="form-card" role="region" aria-labelledby="note-form">
              <form id="noteForm" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div>
                    <label>Patient</label>
                    <select
                      id="patientSelect"
                      name="patient"
                      value={form.patient}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        {patients.length ? "Select patient" : (loadingPatients ? "Loading patients..." : "No patients found")}
                      </option>
                      {patients.map((p) => (
                        <option key={p.id ?? p.patient_id} value={p.id ?? p.patient_id}>
                          {p.name ?? p.patient_name ?? `#${p.patient_id ?? p.id}`}
                          {p.patient_id ? ` — ${p.patient_id}` : ""}
                        </option>
                      ))}
                    </select>
                    <div id="patientHint" style={{ marginTop: 6, color: "#444", fontSize: 13 }}>
                      {patients.length ? `${patients.length} patients` : ""}
                    </div>
                  </div>

                  <div>
                    <label>Visit (required)</label>
                    <select
                      id="visitSelect"
                      name="visit"
                      value={form.visit}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        {visits.length ? "Select visit" : (loadingVisits ? "Loading visits..." : "Select patient first")}
                      </option>
                      {visits.map((v) => (
                        <option key={v.id ?? v.pk} value={v.id ?? v.pk}>
                          {visitLabelFromVisit(v)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Note Type</label>
                    <select name="note_type" id="noteType" value={form.note_type} onChange={handleChange}>
                      <option value="Observation">Observation</option>
                      <option value="Treatment">Treatment</option>
                      <option value="Prescription">Prescription</option>
                      <option value="Lab">Lab result</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label>Veterinarian (optional)</label>
                    <select id="vetSelect" name="veterinarian" value={form.veterinarian} onChange={handleChange}>
                      <option value="">{vets.length ? "(not assigned)" : "No vets endpoint found"}</option>
                      {vets.map((u) => (
                        <option key={u.id ?? u.pk ?? u.username} value={u.id ?? u.pk ?? u.username}>
                          {u.full_name || u.get_full_name || u.username || u.email || u.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Title</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Brief title (e.g. Post-op check)"
                      value={form.title}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="full">
                    <label>Note / Details (required)</label>
                    <textarea
                      name="body"
                      placeholder="Write the clinical note, instructions, prescription etc."
                      required
                      value={form.body}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 }}>
                  <button type="submit" className="btn" disabled={loading}>
                    {loading ? "Adding..." : "Add Note"}
                  </button>
                </div>

                <p id="status" className="status" style={{ color: status && status.startsWith("Error") ? "crimson" : "green" }}>
                  {status}
                </p>
                {debug && (
                  <pre id="debug" style={{ marginTop: 8, color: "#444", fontSize: 13 }}>
                    {JSON.stringify(debug, null, 2)}
                  </pre>
                )}
              </form>
            </div>

            <div className="notes" id="notesGrid" aria-live="polite">
              {notes.length === 0 && <p style={{ gridColumn: "1/-1", color: "#333" }}>No medical notes yet.</p>}
              {notes.map((n, index) => {
                const visitObj = n.visit || n.visit_detail || null;
                const patientLabel =
                  visitObj?.patient?.name ||
                  n.patient_name ||
                  n.patient_display ||
                  (typeof n.visit === "number" || typeof n.visit === "string" ? `Visit #${n.visit}` : "") ||
                  (visitObj?.patient?.patient_id ? `#${visitObj.patient.patient_id}` : "") ||
                  "-";
                const vetLabel = n.veterinarian_name || n.veterinarian_display || n.veterinarian || "(not set)";
                const title = n.title || "";
                const created = n.created_at ? new Date(n.created_at).toLocaleString() : "-";
                const type = n.note_type || "(type not set)";
                const noteText = n.note ?? n.body ?? "";

                return (
                  <div key={n.id ?? n.pk ?? `note-${index}`} className="note-card" role="article">
                    <div className="meta">
                      {title ? (
                        <>
                          <strong>{title}</strong>
                          <br />
                        </>
                      ) : null}
                      <small>
                        Patient: {String(patientLabel)} • {String(type)}
                      </small>
                      <div style={{ marginTop: 6, color: "#666", fontSize: 13 }}>
                        Vet: {String(vetLabel)} · {String(created)}
                      </div>
                      <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{noteText}</div>
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
