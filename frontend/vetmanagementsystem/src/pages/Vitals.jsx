import React, { useEffect, useState } from "react";
import API from "../api";
import { crudThemeStyles } from "../styles/crudThemeStyles";

export default function Vitals() {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    patient: "",
    visit: "",
    temperature: "",
    heart_rate: "",
    respiratory_rate: "",
    weight_kg: "",
    recorded_at: "",
    notes: "",
  });

  useEffect(() => {
    loadPatients();
    loadVitals();
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
      const res = await API.get(`/visits/?patient=${patientId}`);
      setVisits(toList(res.data));
    } catch (err) {
      console.error(err);
      setVisits([]);
    }
  }

  async function loadVitals() {
    try {
      const res = await API.get("/vitals/");
      setVitals(toList(res.data));
    } catch (err) {
      console.error(err);
      setStatus("Could not load vitals");
    }
  }

  function clearForm() {
    setEditingId(null);
    setForm({
      patient: "",
      visit: "",
      temperature: "",
      heart_rate: "",
      respiratory_rate: "",
      weight_kg: "",
      recorded_at: "",
      notes: "",
    });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (name === "patient") loadVisits(value);
  }

  function startEdit(v) {
    const patientId = String(v.patient?.id ?? v.patient ?? v.visit?.patient ?? "");
    setEditingId(v.id);
    setForm({
      patient: patientId,
      visit: String(v.visit?.id ?? v.visit ?? ""),
      temperature: v.temperature ?? "",
      heart_rate: v.heart_rate ?? "",
      respiratory_rate: v.respiratory_rate ?? "",
      weight_kg: v.weight_kg ?? "",
      recorded_at: v.recorded_at ? String(v.recorded_at).slice(0, 16) : "",
      notes: v.notes || "",
    });
    loadVisits(patientId);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this vitals record?")) return;
    try {
      await API.delete(`/vitals/${id}/`);
      if (editingId === id) clearForm();
      setStatus("Vitals deleted");
      await loadVitals();
    } catch (err) {
      console.error(err);
      setStatus("Failed to delete vitals");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.patient || !form.recorded_at) {
      setStatus("Patient and recorded time are required");
      return;
    }

    const payload = {
      ...(form.visit ? { visit: form.visit } : { patient: form.patient }),
      ...(form.temperature ? { temperature: Number(form.temperature) } : {}),
      ...(form.heart_rate ? { heart_rate: Number(form.heart_rate) } : {}),
      ...(form.respiratory_rate ? { respiratory_rate: Number(form.respiratory_rate) } : {}),
      ...(form.weight_kg ? { weight_kg: Number(form.weight_kg) } : {}),
      recorded_at: form.recorded_at,
      notes: form.notes || "",
    };

    try {
      if (editingId) {
        await API.patch(`/vitals/${editingId}/`, payload);
        setStatus("Vitals updated");
      } else {
        await API.post("/vitals/", payload);
        setStatus("Vitals added");
      }
      clearForm();
      await loadVitals();
    } catch (err) {
      console.error(err);
      setStatus("Failed to save vitals");
    }
  }

  return (
    <div className="crud-page">
      <style>{crudThemeStyles}</style>
      <div className="crud-content">
      <h1>Vitals</h1>
      <form onSubmit={handleSubmit}>
        <select name="patient" value={form.patient} onChange={handleChange} required>
          <option value="">Select patient</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.name || p.id}</option>)}
        </select>
        <select name="visit" value={form.visit} onChange={handleChange}>
          <option value="">Select visit (optional)</option>
          {visits.map((v) => <option key={v.id} value={v.id}>{v.visit_date || `Visit ${v.id}`}</option>)}
        </select>
        <input type="number" step="0.1" name="temperature" value={form.temperature} onChange={handleChange} placeholder="Temperature" />
        <input type="number" name="heart_rate" value={form.heart_rate} onChange={handleChange} placeholder="Heart rate" />
        <input type="number" name="respiratory_rate" value={form.respiratory_rate} onChange={handleChange} placeholder="Respiratory rate" />
        <input type="number" step="0.01" name="weight_kg" value={form.weight_kg} onChange={handleChange} placeholder="Weight kg" />
        <input type="datetime-local" name="recorded_at" value={form.recorded_at} onChange={handleChange} required />
        <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" />
        <button type="submit">{editingId ? "Update Vitals" : "Add Vitals"}</button>
        {editingId ? <button type="button" onClick={clearForm}>Cancel</button> : null}
      </form>
      <p>{status}</p>
      {vitals.map((v) => (
        <div key={v.id} style={{ border: "1px solid #ddd", marginBottom: 8, padding: 10 }}>
          <strong>{v.patient_name || `Patient ${v.patient}`}</strong>
          <div>{v.recorded_at}</div>
          <div>Temp: {v.temperature}</div>
          <button type="button" onClick={() => startEdit(v)}>Edit</button>
          <button type="button" onClick={() => handleDelete(v.id)}>Delete</button>
        </div>
      ))}
      </div>
    </div>
  );
}






