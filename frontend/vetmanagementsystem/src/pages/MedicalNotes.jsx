import React, { useEffect, useState } from "react";
import API from "../api";
import { crudThemeStyles } from "../styles/crudThemeStyles";

export default function MedicalNotes() {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [notes, setNotes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    patient: "",
    visit: "",
    body: "",
  });

  useEffect(() => {
    loadPatients();
    loadNotes();
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
    if (!patientId) {
      setVisits([]);
      return;
    }
    try {
      const res = await API.get(`/visits/?patient=${encodeURIComponent(patientId)}`);
      setVisits(toList(res.data));
    } catch (err) {
      console.error(err);
      setVisits([]);
    }
  }

  async function loadNotes() {
    try {
      const res = await API.get("/medical-notes/");
      setNotes(toList(res.data));
    } catch (err) {
      console.error(err);
      setStatus("Could not load notes");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (name === "patient") loadVisits(value);
  }

  function clearForm() {
    setEditingId(null);
    setForm({ patient: "", visit: "", body: "" });
  }

  function startEdit(n) {
    const visitId = String(n.visit?.id ?? n.visit ?? "");
    const patientId = String(n.patient?.id ?? n.patient ?? n.visit?.patient ?? "");
    setEditingId(n.id);
    setForm({
      patient: patientId,
      visit: visitId,
      body: n.note || n.body || "",
    });
    loadVisits(patientId);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this note?")) return;
    try {
      await API.delete(`/medical-notes/${id}/`);
      if (editingId === id) clearForm();
      setStatus("Note deleted");
      await loadNotes();
    } catch (err) {
      console.error(err);
      setStatus("Failed to delete note");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.visit || !form.body.trim()) {
      setStatus("Visit and note are required");
      return;
    }
    const payload = { visit: form.visit, note: form.body };
    try {
      if (editingId) {
        await API.patch(`/medical-notes/${editingId}/`, payload);
        setStatus("Note updated");
      } else {
        await API.post("/medical-notes/", payload);
        setStatus("Note added");
      }
      clearForm();
      await loadNotes();
    } catch (err) {
      console.error(err);
      setStatus("Failed to save note");
    }
  }

  return (
    <div className="crud-page">
      <style>{crudThemeStyles}</style>
      <div className="crud-content">
      <h1>Medical Notes</h1>
      <form onSubmit={handleSubmit}>
        <select name="patient" value={form.patient} onChange={handleChange} required>
          <option value="">Select patient</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.name || p.id}</option>)}
        </select>
        <select name="visit" value={form.visit} onChange={handleChange} required>
          <option value="">Select visit</option>
          {visits.map((v) => <option key={v.id} value={v.id}>{v.visit_date || `Visit ${v.id}`}</option>)}
        </select>
        <textarea name="body" value={form.body} onChange={handleChange} required />
        <button type="submit">{editingId ? "Update Note" : "Add Note"}</button>
        {editingId ? <button type="button" onClick={clearForm}>Cancel</button> : null}
      </form>
      <p>{status}</p>
      {notes.map((n) => (
        <div key={n.id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 8 }}>
          <strong>{n.patient_name || `Visit ${n.visit}`}</strong>
          <p>{n.note || n.body}</p>
          <button type="button" onClick={() => startEdit(n)}>Edit</button>
          <button type="button" onClick={() => handleDelete(n.id)}>Delete</button>
        </div>
      ))}
      </div>
    </div>
  );
}






