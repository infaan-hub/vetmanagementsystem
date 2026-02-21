import React, { useEffect, useState } from "react";
import API from "../api";
import { crudThemeStyles } from "../styles/crudThemeStyles";

export default function Treatments() {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    patient: "",
    visit: "",
    name: "",
    date: "",
    veterinarian: "",
    description: "",
  });

  useEffect(() => {
    loadPatients();
    loadTreatments();
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

  async function loadVisits(patientId) {
    if (!patientId) return setVisits([]);
    try {
      const res = await API.get(`/visits/?patient=${encodeURIComponent(patientId)}`);
      setVisits(toList(res.data));
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
      setStatus("Could not load treatments");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (name === "patient") loadVisits(value);
  }

  function clearForm() {
    setEditingId(null);
    setForm({
      patient: "",
      visit: "",
      name: "",
      date: "",
      veterinarian: "",
      description: "",
    });
  }

  function startEdit(t) {
    const patientId = String(t.patient?.id ?? t.patient ?? "");
    setEditingId(t.id);
    setForm({
      patient: patientId,
      visit: String(t.visit?.id ?? t.visit ?? ""),
      name: t.name || "",
      date: t.date || "",
      veterinarian: t.veterinarian || "",
      description: t.description || "",
    });
    loadVisits(patientId);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this treatment?")) return;
    try {
      await API.delete(`/treatments/${id}/`);
      if (editingId === id) clearForm();
      setStatus("Treatment deleted");
      await loadTreatments();
    } catch (err) {
      console.error(err);
      setStatus("Failed to delete treatment");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.patient || !form.visit || !form.name.trim()) {
      setStatus("Patient, visit and name are required");
      return;
    }
    const payload = {
      patient: form.patient,
      visit: form.visit,
      name: form.name,
      date: form.date || null,
      veterinarian: form.veterinarian || "",
      description: form.description || "",
    };
    try {
      if (editingId) {
        await API.patch(`/treatments/${editingId}/`, payload);
        setStatus("Treatment updated");
      } else {
        await API.post("/treatments/", payload);
        setStatus("Treatment added");
      }
      clearForm();
      await loadTreatments();
    } catch (err) {
      console.error(err);
      setStatus("Failed to save treatment");
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
          <a href="/documents">Documents</a>
          <a className="active" href="/treatments">Treatments</a>
        </nav>
      </aside>
      <main className="crud-main">
      <div className="crud-content">
      <h1>Treatments</h1>
      <form onSubmit={handleSubmit}>
        <select name="patient" value={form.patient} onChange={handleChange} required>
          <option value="">Select patient</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.name || p.id}</option>)}
        </select>
        <select name="visit" value={form.visit} onChange={handleChange} required>
          <option value="">Select visit</option>
          {visits.map((v) => <option key={v.id} value={v.id}>{v.visit_date || `Visit ${v.id}`}</option>)}
        </select>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Treatment name" required />
        <input type="date" name="date" value={form.date} onChange={handleChange} />
        <input name="veterinarian" value={form.veterinarian} onChange={handleChange} placeholder="Veterinarian" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />
        <button type="submit">{editingId ? "Update Treatment" : "Add Treatment"}</button>
        {editingId ? <button type="button" onClick={clearForm}>Cancel</button> : null}
      </form>
      <p className="status-msg">{status}</p>
      {treatments.map((t) => (
        <div key={t.id} className="crud-record-card">
          <strong>{t.name}</strong>
          <div>{t.patient_name || t.patient}</div>
          <button type="button" className="action-btn" onClick={() => startEdit(t)}>Edit</button>
          <button type="button" className="action-btn" onClick={() => handleDelete(t.id)}>Delete</button>
        </div>
      ))}
      </div>
      </main>
      </div>
    </div>
  );
}







