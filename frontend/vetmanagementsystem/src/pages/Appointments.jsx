import React, { useEffect, useMemo, useState } from "react";
import API from "../api";
import { crudThemeStyles } from "../styles/crudThemeStyles";

export default function Appointments() {
  const [clients, setClients] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    client: "",
    patient: "",
    date: "",
    reason: "",
  });

  useEffect(() => {
    loadClients();
    loadPatients();
    loadAppointments();
  }, []);

  function toList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  }

  async function loadClients() {
    try {
      const res = await API.get("/clients/");
      setClients(toList(res.data));
    } catch (err) {
      console.error(err);
    }
  }

  async function loadPatients() {
    try {
      const res = await API.get("/patients/");
      setPatients(toList(res.data));
    } catch (err) {
      console.error(err);
    }
  }

  async function loadAppointments() {
    try {
      const res = await API.get("/appointments/");
      setAppointments(toList(res.data));
    } catch (err) {
      console.error(err);
      setStatus("Could not load appointments");
    }
  }

  const filteredPatients = useMemo(() => {
    if (!form.client) return [];
    return patients.filter((p) => String(p.client?.id ?? p.client) === String(form.client));
  }, [patients, form.client]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function clearForm() {
    setEditingId(null);
    setForm({ client: "", patient: "", date: "", reason: "" });
  }

  function startEdit(a) {
    setEditingId(a.id);
    setForm({
      client: String(a.client?.id ?? a.client ?? ""),
      patient: String(a.patient?.id ?? a.patient ?? ""),
      date: a.date ? String(a.date).slice(0, 16) : "",
      reason: a.reason || "",
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await API.delete(`/appointments/${id}/`);
      if (editingId === id) clearForm();
      setStatus("Appointment deleted");
      await loadAppointments();
    } catch (err) {
      console.error(err);
      setStatus("Failed to delete appointment");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.client || !form.patient || !form.date) {
      setStatus("Client, patient and date are required");
      return;
    }
    const payload = {
      client: form.client,
      patient: form.patient,
      date: form.date,
      reason: form.reason || "",
    };
    try {
      if (editingId) {
        await API.patch(`/appointments/${editingId}/`, payload);
        setStatus("Appointment updated");
      } else {
        await API.post("/appointments/", payload);
        setStatus("Appointment added");
      }
      clearForm();
      await loadAppointments();
    } catch (err) {
      console.error(err);
      setStatus("Failed to save appointment");
    }
  }

  return (
    <div className="crud-page">
      <style>{crudThemeStyles}</style>
      <div className="crud-content">
      <h1>Appointments</h1>
      <form onSubmit={handleSubmit}>
        <select name="client" value={form.client} onChange={handleChange} required>
          <option value="">Select client</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.full_name || c.username || c.id}</option>)}
        </select>
        <select name="patient" value={form.patient} onChange={handleChange} required>
          <option value="">Select patient</option>
          {filteredPatients.map((p) => <option key={p.id} value={p.id}>{p.name || p.id}</option>)}
        </select>
        <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required />
        <textarea name="reason" value={form.reason} onChange={handleChange} placeholder="Reason" />
        <button type="submit">{editingId ? "Update Appointment" : "Add Appointment"}</button>
        {editingId ? <button type="button" onClick={clearForm}>Cancel</button> : null}
      </form>
      <p>{status}</p>
      {appointments.map((a) => (
        <div key={a.id} style={{ border: "1px solid #ddd", marginBottom: 8, padding: 10 }}>
          <strong>{a.patient_name || a.patient}</strong>
          <div>{a.date}</div>
          <div>{a.reason}</div>
          <button type="button" onClick={() => startEdit(a)}>Edit</button>
          <button type="button" onClick={() => handleDelete(a.id)}>Delete</button>
        </div>
      ))}
      </div>
    </div>
  );
}






