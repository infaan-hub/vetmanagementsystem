import React, { useEffect, useRef, useState } from "react";
import API from "../api";
import { crudThemeStyles } from "../styles/crudThemeStyles";
import { generatePatientReportPdf, loadPatientReportData } from "../utils/patientReportPdf";

export default function Documents() {
  const fileRef = useRef(null);
  const [patients, setPatients] = useState([]);
  const [clients, setClients] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [reportPatientId, setReportPatientId] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    patient: "",
    title: "",
    file: null,
    description: "",
  });

  useEffect(() => {
    loadPatients();
    loadClients();
    loadDocuments();
  }, []);

  function toList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  }

  async function loadPatients() {
    try {
      const res = await API.get("/patients/");
      setPatients(toList(res.data));
    } catch (err) {
      console.error(err);
    }
  }

  async function loadClients() {
    try {
      const res = await API.get("/clients/");
      setClients(toList(res.data));
    } catch (err) {
      console.error(err);
    }
  }

  async function loadDocuments() {
    try {
      const res = await API.get("/documents/");
      setDocuments(toList(res.data));
    } catch (err) {
      console.error(err);
      setStatus("Could not load documents");
    }
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm((s) => ({ ...s, file: files?.[0] || null }));
      return;
    }
    setForm((s) => ({ ...s, [name]: value }));
  }

  function clearForm() {
    setEditingId(null);
    setForm({ patient: "", title: "", file: null, description: "" });
    if (fileRef.current) fileRef.current.value = "";
  }

  function startEdit(d) {
    setEditingId(d.id);
    setForm({
      patient: String(d.patient?.id ?? d.patient ?? ""),
      title: d.title || "",
      file: null,
      description: d.description || "",
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this document?")) return;
    try {
      await API.delete(`/documents/${id}/`);
      if (editingId === id) clearForm();
      setStatus("Document deleted");
      await loadDocuments();
    } catch (err) {
      console.error(err);
      setStatus("Failed to delete document");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.patient || !form.title) {
      setStatus("Patient and title are required");
      return;
    }

    const fd = new FormData();
    fd.append("patient", form.patient);
    fd.append("title", form.title);
    fd.append("description", form.description || "");
    if (form.file) fd.append("file", form.file);

    try {
      if (editingId) {
        await API.patch(`/documents/${editingId}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setStatus("Document updated");
      } else {
        if (!form.file) {
          setStatus("File is required for new document");
          return;
        }
        await API.post("/documents/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setStatus("Document added");
      }
      clearForm();
      await loadDocuments();
    } catch (err) {
      console.error(err);
      setStatus("Failed to save document");
    }
  }

  async function handleGeneratePdf() {
    if (!reportPatientId) {
      setStatus("Select patient for report");
      return;
    }
    setGeneratingPdf(true);
    setStatus("");
    try {
      const { patient, client, sections } = await loadPatientReportData(API, reportPatientId);
      await generatePatientReportPdf({ patient, client, sections });
      setStatus("PDF report downloaded");
    } catch (err) {
      console.error(err);
      setStatus("Failed to generate PDF report");
    } finally {
      setGeneratingPdf(false);
    }
  }

  return (
    <div className="crud-page">
      <style>{crudThemeStyles}</style>
      <div className="crud-shell">
      <aside className="crud-sidebar">
        <h2>VMS Doctor Panel</h2>
        <nav className="crud-nav">
          <a href="/doctor-dashboard">Dashboard</a>
          <a href="/patients">Patients</a>
          <a href="/visits">Visits</a>
          <a href="/allergies">Allergies</a>
          <a href="/vitals">Vitals</a>
          <a href="/medical-notes">Medical Notes</a>
          <a href="/medications">Medications</a>
          <a className="active" href="/documents">Documents</a>
          <a href="/treatments">Treatments</a>
        </nav>
      </aside>
      <main className="crud-main">
      <div className="crud-content">
      <h1>Documents</h1>
      <div className="crud-record-card">
        <h3>Generate Full Patient PDF Report</h3>
        <label>Patient For Report</label>
        <select value={reportPatientId} onChange={(e) => setReportPatientId(e.target.value)}>
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name || p.patient_id || p.id}
            </option>
          ))}
        </select>
        <button type="button" onClick={handleGeneratePdf} disabled={generatingPdf}>
          {generatingPdf ? "Generating..." : "Download Full PDF"}
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <label>Patient</label>
        <select name="patient" value={form.patient} onChange={handleChange} required>
          <option value="">Select patient</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.name || p.id}</option>)}
        </select>
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
        <label>File</label>
        <input ref={fileRef} type="file" name="file" onChange={handleChange} />
        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />
        <button type="submit">{editingId ? "Update Document" : "Add Document"}</button>
        {editingId ? <button type="button" onClick={clearForm}>Cancel</button> : null}
      </form>
      <p className="status-msg">{status}</p>
      {documents.map((d) => (
        <div key={d.id} className="crud-record-card">
          <strong>{d.title || "Document"}</strong>
          <div>
            {d.patient_name || d.patient}{" "}
            {(() => {
              const pid = String(d.patient?.id ?? d.patient ?? "");
              const p = patients.find((x) => String(x.id ?? x.patient_id) === pid);
              const cid = p?.client?.id ?? p?.client_id ?? p?.client;
              const c = clients.find((x) => String(x.id ?? x.client_id) === String(cid));
              return c ? `| Client: ${c.full_name || c.username || c.id}` : "";
            })()}
          </div>
          {d.file ? <a href={d.file} target="_blank" rel="noreferrer">View</a> : null}
          <div>
            <button type="button" className="action-btn" onClick={() => startEdit(d)}>Edit</button>
            <button type="button" className="action-btn" onClick={() => handleDelete(d.id)}>Delete</button>
          </div>
        </div>
      ))}
      </div>
      </main>
      </div>
    </div>
  );
}






