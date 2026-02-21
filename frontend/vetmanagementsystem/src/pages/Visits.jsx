import React, { useEffect, useState } from "react";
import API from "../api";
import { crudThemeStyles } from "../styles/crudThemeStyles";

export default function Visits() {
  const [patients, setPatients] = useState([]);
  const [vets, setVets] = useState([]);
  const [visits, setVisits] = useState([]);
  const [form, setForm] = useState({
    patient: "",
    veterinarian: "",
    visit_date: "",
    visit_status: "Checked-in",
    location_status: "",
    age_months: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadPatients();
    loadVets();
    loadVisits();
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

  async function loadVets() {
    const endpoints = ["/users/", "/auth/users/", "/doctors/"];
    for (const ep of endpoints) {
      try {
        const res = await API.get(ep);
        const list = toList(res.data);
        if (list.length) {
          setVets(list);
          return;
        }
      } catch (_err) {}
    }
    setVets([]);
  }

  async function loadVisits() {
    try {
      const res = await API.get("/visits/");
      setVisits(toList(res.data));
    } catch (err) {
      console.error(err);
      setStatus("Could not load visits");
    }
  }

  function clearForm() {
    setEditingId(null);
    setForm({
      patient: "",
      veterinarian: "",
      visit_date: "",
      visit_status: "Checked-in",
      location_status: "",
      age_months: "",
      notes: "",
    });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function startEdit(v) {
    setEditingId(v.id);
    setForm({
      patient: String(v.patient?.id ?? v.patient ?? ""),
      veterinarian: String(v.veterinarian?.id ?? v.veterinarian ?? ""),
      visit_date: v.visit_date ? String(v.visit_date).slice(0, 16) : "",
      visit_status: v.visit_status || "Checked-in",
      location_status: v.location_status || "",
      age_months: v.age_months ?? "",
      notes: v.notes || v.reason || "",
    });
    setStatus("Editing visit");
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this visit?")) return;
    try {
      await API.delete(`/visits/${id}/`);
      if (editingId === id) clearForm();
      setStatus("Visit deleted");
      await loadVisits();
    } catch (err) {
      console.error(err);
      setStatus("Failed to delete visit");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.patient || !form.visit_date) {
      setStatus("Patient and visit date are required");
      return;
    }

    const payload = {
      patient: form.patient,
      visit_date: form.visit_date,
      veterinarian: form.veterinarian || null,
      visit_status: form.visit_status,
      location_status: form.location_status || "",
      age_months: form.age_months || null,
      notes: form.notes || "",
    };

    try {
      if (editingId) {
        await API.patch(`/visits/${editingId}/`, payload);
        setStatus("Visit updated");
      } else {
        await API.post("/visits/", payload);
        setStatus("Visit added");
      }
      clearForm();
      await loadVisits();
    } catch (err) {
      console.error(err);
      setStatus("Failed to save visit");
    }
  }

  return (
    <div className="crud-page">
      <style>{crudThemeStyles}</style>
      <div className="crud-content">
      <h1>Visits</h1>
      <form onSubmit={handleSubmit}>
        <select name="patient" value={form.patient} onChange={handleChange} required>
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.name || p.id}</option>
          ))}
        </select>
        <select name="veterinarian" value={form.veterinarian} onChange={handleChange}>
          <option value="">No vet</option>
          {vets.map((v) => (
            <option key={v.id ?? v.username} value={v.id ?? v.username}>
              {v.full_name || v.username || v.id}
            </option>
          ))}
        </select>
        <input type="datetime-local" name="visit_date" value={form.visit_date} onChange={handleChange} required />
        <input name="visit_status" value={form.visit_status} onChange={handleChange} />
        <input name="location_status" value={form.location_status} onChange={handleChange} />
        <input type="number" name="age_months" value={form.age_months} onChange={handleChange} />
        <textarea name="notes" value={form.notes} onChange={handleChange} />
        <button type="submit">{editingId ? "Update Visit" : "Add Visit"}</button>
        {editingId ? <button type="button" onClick={clearForm}>Cancel</button> : null}
      </form>
      <p>{status}</p>
      <div>
        {visits.map((v) => (
          <div key={v.id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 8 }}>
            <strong>{v.patient_name || `Patient ${v.patient}`}</strong>
            <div>{v.visit_date}</div>
            <div>{v.visit_status}</div>
            <div>
              <button type="button" onClick={() => startEdit(v)}>Edit</button>
              <button type="button" onClick={() => handleDelete(v.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}






