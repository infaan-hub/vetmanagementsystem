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

  useEffect(() => {
    loadPatients();
    loadVets();
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPatients() {
    try {
      const res = await API.get("/patients/");
      setPatients(res.data || []);
    } catch (err) {
      console.error("loadPatients:", err);
      setStatus("Could not load patients.");
    }
  }

  async function loadVets() {
    try {
      const res = await API.get("/users/"); // adjust if users endpoint differs
      setVets(res.data || []);
    } catch (err) {
      console.error("loadVets:", err);
      // not critical
    }
  }

  async function loadVisitsForPatient(patientId) {
    setVisits([]);
    setForm((s) => ({ ...s, visit: "" }));
    if (!patientId) return;
    try {
      const res = await API.get(`/visits/?patient=${patientId}`);
      const list = res.data || [];
      setVisits(list);
      // Auto-select the latest visit if present
      if (Array.isArray(list) && list.length > 0) {
        setForm((s) => ({ ...s, visit: list[0].id }));
      }
    } catch (err) {
      console.warn("Could not load visits for patient:", err);
      // leave visits empty
    }
  }

  async function loadNotes() {
    try {
      const res = await API.get("/medical-notes/");
      setNotes(res.data || []);
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

  function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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

    // Backend ClientNote expects `visit` and `note`
    const payload = {
      visit: form.visit,
      note: form.body,
      // Optional extras — server may ignore them, but we don't rely on them:
      // title, note_type, veterinarian are not required by model but kept for context if your backend handles them.
      title: form.title || undefined,
      note_type: form.note_type || undefined,
      veterinarian: form.veterinarian || undefined,
    };

    try {
      const csrf = getCSRFToken();
      const headers = {};
      if (csrf) headers["X-CSRFToken"] = csrf;

      const res = await API.post("/medical-notes/", payload, { headers });
      setStatus("Medical note added!");
      setDebug(res.data);
      // reset but keep patient selected (and visits) to allow quick multi-add
      setForm({
        patient: form.patient,
        visit: "",
        note_type: "Observation",
        veterinarian: "",
        title: "",
        body: "",
      });
      // reload visits for the patient (server may create note -> visit unchanged)
      if (form.patient) await loadVisitsForPatient(form.patient);
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

  // Helper to derive a readable label from a visit or note record
  function visitLabelFromVisit(v) {
    if (!v) return "";
    if (v.summary) return v.summary;
    if (v.visit_date) return v.visit_date;
    // try nested patient
    if (v.patient && (v.patient.name || v.patient.patient_id)) {
      return `${v.patient.name || "Patient"}${v.patient.patient_id ? ` — ${v.patient.patient_id}` : ""}`;
    }
    return `Visit ${v.id ?? v.pk ?? ""}`;
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

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar" aria-hidden={false}>
          <h2>🩺 VMS Doctor</h2>
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
              <h1>Medical Notes</h1>
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
                      <option value="">{patients.length ? "Select patient" : "Loading patients..."}</option>
                      {patients.map((p) => (
                        <option key={p.id ?? p.patient_id ?? p.patient_id} value={p.id ?? p.patient_id}>
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
                      <option value="">{visits.length ? "Select visit" : "Select patient first"}</option>
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
                      <option value="">{vets.length ? "(not assigned)" : "Loading vets..."}</option>
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
              {notes.map((n) => {
                // Notes returned from API may vary. Try to display visit/patient info if nested.
                const visitObj = n.visit || n.visit_detail || null;
                const patientLabel =
                  visitObj?.patient?.name ||
                  n.patient_name ||
                  n.patient_display ||
                  (visitObj?.patient?.patient_id ? `#${visitObj.patient.patient_id}` : "") ||
                  "-";
                const vetLabel = n.veterinarian_name || n.veterinarian_display || n.veterinarian || "(not set)";
                const title = n.title ? escapeHtml(n.title) : "";
                const created = n.created_at ? new Date(n.created_at).toLocaleString() : "-";
                const type = n.note_type || "(type not set)";
                // note text might be in field `note` or `body`
                const noteText = n.note ?? n.body ?? "";
                const bodyHtml = noteText ? escapeHtml(noteText).replace(/\n/g, "<br/>") : "";
                return (
                  <div key={n.id ?? (n.pk ?? Math.random())} className="note-card" role="article">
                    <div
                      className="meta"
                      dangerouslySetInnerHTML={{
                        __html: `${title ? `<strong>${title}</strong><br/>` : ""}<small>Patient: ${escapeHtml(
                          String(patientLabel)
                        )} • ${escapeHtml(String(type))}</small><div style="margin-top:6px;color:#666;font-size:13px">Vet: ${escapeHtml(
                          String(vetLabel)
                        )} · ${escapeHtml(String(created))}</div>${bodyHtml}`,
                      }}
                    />
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
