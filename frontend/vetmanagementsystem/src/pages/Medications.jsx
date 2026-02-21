import React, { useEffect, useState } from "react";
import API from "../api";

export default function Medications() {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [medications, setMedications] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    patient: "",
    visit: "",
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  useEffect(() => {
    loadPatients();
    loadMedications();
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

  async function loadMedications() {
    try {
      const res = await API.get("/medications/");
      setMedications(toList(res.data));
    } catch (err) {
      console.error(err);
      setStatus("Could not load medications");
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
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    });
  }

  function startEdit(m) {
    const patientId = String(m.patient?.id ?? m.patient ?? m.visit?.patient ?? "");
    setEditingId(m.id);
    setForm({
      patient: patientId,
      visit: String(m.visit?.id ?? m.visit ?? ""),
      name: m.name || "",
      dosage: m.dosage || "",
      frequency: m.frequency || "",
      duration: m.duration || "",
      instructions: m.notes || m.instructions || "",
    });
    loadVisits(patientId);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this medication?")) return;
    try {
      await API.delete(`/medications/${id}/`);
      if (editingId === id) clearForm();
      setStatus("Medication deleted");
      await loadMedications();
    } catch (err) {
      console.error(err);
      setStatus("Failed to delete medication");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.patient || !form.visit || !form.name.trim()) {
      setStatus("Patient, visit and medication name are required");
      return;
    }
    const payload = {
      visit: form.visit,
      name: form.name,
      dosage: form.dosage || "",
      frequency: form.frequency || "",
      duration: form.duration || "",
      notes: form.instructions || "",
    };
    try {
      if (editingId) {
        await API.patch(`/medications/${editingId}/`, payload);
        setStatus("Medication updated");
      } else {
        await API.post("/medications/", payload);
        setStatus("Medication added");
      }
      clearForm();
      await loadMedications();
    } catch (err) {
      console.error(err);
      setStatus("Failed to save medication");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Medications</h1>
      <form onSubmit={handleSubmit}>
        <select name="patient" value={form.patient} onChange={handleChange} required>
          <option value="">Select patient</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.name || p.id}</option>)}
        </select>
        <select name="visit" value={form.visit} onChange={handleChange} required>
          <option value="">Select visit</option>
          {visits.map((v) => <option key={v.id} value={v.id}>{v.visit_date || `Visit ${v.id}`}</option>)}
        </select>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Medication" required />
        <input name="dosage" value={form.dosage} onChange={handleChange} placeholder="Dosage" />
        <input name="frequency" value={form.frequency} onChange={handleChange} placeholder="Frequency" />
        <input name="duration" value={form.duration} onChange={handleChange} placeholder="Duration" />
        <textarea name="instructions" value={form.instructions} onChange={handleChange} placeholder="Instructions" />
        <button type="submit">{editingId ? "Update Medication" : "Add Medication"}</button>
        {editingId ? <button type="button" onClick={clearForm}>Cancel</button> : null}
      </form>
      <p>{status}</p>
      {medications.map((m) => (
        <div key={m.id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 8 }}>
          <strong>{m.name}</strong>
          <div>{m.patient_name || m.patient}</div>
          <button type="button" onClick={() => startEdit(m)}>Edit</button>
          <button type="button" onClick={() => handleDelete(m.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

