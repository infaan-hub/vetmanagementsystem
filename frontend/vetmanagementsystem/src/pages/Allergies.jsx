import React, { useEffect, useState } from "react";
import API from "../api";

export default function Allergies() {
  const [patients, setPatients] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [form, setForm] = useState({
    patient: "",
    severity_level: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPatients();
    loadAllergies();
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
      console.error("loadPatients:", err);
      setStatus("Could not load patients");
    }
  }

  async function loadAllergies() {
    try {
      const res = await API.get("/allergies/");
      setAllergies(toList(res.data));
    } catch (err) {
      console.error("loadAllergies:", err);
      setStatus("Could not load allergies");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function clearForm() {
    setEditingId(null);
    setForm({ patient: "", severity_level: "", description: "" });
  }

  function startEdit(a) {
    setEditingId(a.id);
    setForm({
      patient: String(a.patient?.id ?? a.patient ?? ""),
      severity_level: a.severity_level || "",
      description: a.description || a.notes || "",
    });
    setStatus("Editing allergy record");
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this allergy?")) return;
    try {
      await API.delete(`/allergies/${id}/`);
      if (editingId === id) clearForm();
      setStatus("Allergy deleted");
      await loadAllergies();
    } catch (err) {
      console.error("delete allergy:", err);
      setStatus("Failed to delete allergy");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.patient) {
      setStatus("Please select a patient");
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      const fd = new FormData();
      fd.append("patient", form.patient);
      if (form.severity_level) fd.append("severity_level", form.severity_level);
      if (form.description) fd.append("description", form.description);

      if (editingId) {
        await API.patch(`/allergies/${editingId}/`, fd);
        setStatus("Allergy updated");
      } else {
        await API.post("/allergies/", fd);
        setStatus("Allergy added");
      }

      clearForm();
      await loadAllergies();
    } catch (err) {
      console.error("submit allergy:", err);
      setStatus("Failed to save allergy");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="layout">
      <style>{`
        .layout{display:flex;gap:20px;padding:24px;min-height:100vh;background:url("https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg") center/cover}
        .sidebar{width:260px;background:rgba(255,255,255,.72);backdrop-filter:blur(14px);border-radius:18px;padding:20px}
        .nav a{display:block;padding:10px 12px;border-radius:12px;text-decoration:none;color:#111;font-weight:700;margin-bottom:8px}
        .nav a.active,.nav a:hover{background:#000;color:#fff}
        .main{flex:1}
        .card{background:rgba(255,255,255,.72);backdrop-filter:blur(14px);border-radius:18px;padding:18px;box-shadow:0 18px 40px rgba(0,0,0,.18)}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .full{grid-column:1/-1}
        input,select,textarea,button{width:100%;padding:10px;border-radius:10px;border:1px solid rgba(0,0,0,.15)}
        .actions{display:flex;gap:8px;margin-top:10px}
        .items{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-top:16px}
      `}</style>
      <aside className="sidebar">
        <h2>VMS Doctor</h2>
        <nav className="nav">
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
        <div className="card">
          <h1>Allergies</h1>
          <form onSubmit={handleSubmit}>
            <div className="grid">
              <div>
                <label>Patient</label>
                <select name="patient" value={form.patient} onChange={handleChange} required>
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.patient_id || `Patient ${p.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Severity</label>
                <select name="severity_level" value={form.severity_level} onChange={handleChange}>
                  <option value="">(optional)</option>
                  <option>Low</option>
                  <option>Moderate</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div className="full">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} />
              </div>
            </div>
            <div className="actions">
              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update Allergy" : "Add Allergy"}
              </button>
              {editingId ? <button type="button" onClick={clearForm}>Cancel</button> : null}
            </div>
            {status ? <p>{status}</p> : null}
          </form>
        </div>

        <div className="items">
          {allergies.map((a) => (
            <div key={a.id} className="card">
              <strong>{a.patient_name || `Patient ${a.patient}`}</strong>
              <p>Severity: {a.severity_level || "N/A"}</p>
              <p>{a.description || a.notes || ""}</p>
              <div className="actions">
                <button type="button" onClick={() => startEdit(a)}>Edit</button>
                <button type="button" onClick={() => handleDelete(a.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

