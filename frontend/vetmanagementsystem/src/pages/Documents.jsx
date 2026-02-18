import React, { useEffect, useState } from "react";
import API from "../api";

export default function Documents() {
  const [patients, setPatients] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patient: "",
    title: "",
    file: null,
    description: "",
  });

  useEffect(() => {
    loadPatients();
    loadDocuments();
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

  async function loadPatients() {
    try {
      const res = await API.get("/patients/");
      setPatients(toList(res.data));
    } catch (err) {
      console.error("loadPatients:", err);
      setStatus("Error loading patients");
    }
  }

  async function loadDocuments() {
    try {
      const res = await API.get("/documents/");
      setDocuments(toList(res.data));
    } catch (err) {
      console.error("loadDocuments:", err);
      setStatus("Error loading documents");
    }
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm((s) => ({ ...s, file: files && files.length ? files[0] : null }));
      return;
    }
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");

    if (!form.patient || !form.title || !form.file) {
      setStatus("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("patient", form.patient);
      fd.append("title", form.title);
      fd.append("file", form.file);
      fd.append("description", form.description || "");

      const csrf = getCSRFToken();
      const headers = {};
      if (csrf) headers["X-CSRFToken"] = csrf;

      await API.post("/documents/", fd, { headers });
      setStatus("Document uploaded");
      setForm({
        patient: "",
        title: "",
        file: null,
        description: "",
      });

      const fileInput = document.querySelector('input[name="file"]');
      if (fileInput) fileInput.value = "";

      await loadDocuments();
    } catch (err) {
      console.error("upload document:", err);
      const detail = err?.response?.data || err?.message || "Upload failed";
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
.main{flex:1;overflow:auto;padding-right:10px}

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

/* ===== Documents Cards ===== */
.docs{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:18px;
}
.doc-card{
  background:var(--card-bg);
  backdrop-filter:blur(12px);
  box-shadow:var(--card-shadow);
  border-radius:16px;
  padding:14px;
  transition: transform .18s ease, box-shadow .18s ease;
}
.doc-card:hover{transform:translateY(-6px);box-shadow:0 30px 60px rgba(0,0,0,0.25);}

@media(max-width:900px){.layout{flex-direction:column}.sidebar{width:100%}}
@media(max-width:720px){.grid{grid-template-columns:1fr}}
      `}</style>

      <aside className="sidebar">
        <h2>🩺 VMS Doctor Panel</h2>
        <nav className="nav">
          <a href="/doctor">Dashboard</a>
          <a href="/visits/">Visits</a>
          <a href="/allergies/">Allergies</a>
          <a href="/vitals/">Vitals</a>
          <a href="/medical-notes/">Medical Notes</a>
          <a href="/medications/">Medications</a>
          <a className="active" href="/documents/">
            Documents
          </a>
          <a href="/treatments/">Treatments</a>
        </nav>
      </aside>

      <main className="main">
        <div className="container">
          <div className="hero">
            <h1>Documents🩺🐾</h1>
            <p>Patient medical files & attachments</p>
          </div>

          <div className="card">
            <form id="docForm" onSubmit={handleSubmit}>
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
                  <label>Title</label>
                  <input name="title" value={form.title} onChange={handleChange} required />
                </div>
                <div className="full">
                  <label>Document File</label>
                  <input type="file" name="file" onChange={handleChange} required />
                </div>
                <div className="full">
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange}></textarea>
                </div>
              </div>
              <div style={{ textAlign: "right", marginTop: 12 }}>
                <button className="btn" disabled={loading}>
                  {loading ? "Uploading..." : "Upload Document"}
                </button>
              </div>
              <p id="status" className="status">
                {status}
              </p>
            </form>
          </div>

          <div className="docs" id="docGrid">
            {documents.length === 0 && <p>No documents uploaded</p>}
            {documents.map((d, index) => (
              <div className="doc-card" key={d.id ?? `doc-${index}`}>
                <strong>{d.title || d.document_type || "Document"}</strong>
                <br />
                Patient: {d.patient_name || d.patient || "-"}
                <br />
                {(d.description || "").toString()}
                <br />
                <br />
                {d.file ? (
                  <a href={d.file} target="_blank" rel="noreferrer" className="btn">
                    View
                  </a>
                ) : null}
                <div style={{ marginTop: 6, fontSize: 13, color: "#555" }}>
                  {d.created_at ? new Date(d.created_at).toLocaleString() : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
