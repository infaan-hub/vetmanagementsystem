import React, { useEffect, useMemo, useState } from "react";
import API from "../api";

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
    setStatus("Editing appointment");
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
    <div className="layout">
      <style>{`
        *{box-sizing:border-box}
        .layout{
          min-height:100vh;
          display:flex;
          gap:20px;
          padding:20px;
          background-image:url("https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg");
          background-size:cover;
          background-position:center;
          background-repeat:repeat;
          font-family:"Segoe UI",Tahoma,Verdana,sans-serif;
          color:#111;
        }
        .sidebar{
          width:260px;
          flex-shrink:0;
          background:rgba(255,255,255,.72);
          backdrop-filter:blur(14px);
          box-shadow:0 18px 40px rgba(0,0,0,.18);
          border-radius:18px;
          padding:20px 16px;
          height:fit-content;
        }
        .sidebar h2{margin:0 0 14px;text-align:center;font-size:20px}
        .nav a{
          display:block;text-decoration:none;color:#111;font-weight:700;
          padding:10px 12px;border-radius:12px;margin-bottom:8px;
        }
        .nav a:hover,.nav a.active{background:rgba(0,0,0,.88);color:#fff}
        .main{flex:1;min-width:0}
        .hero,.form-card,.record-card{
          background:rgba(255,255,255,.72);
          backdrop-filter:blur(14px);
          box-shadow:0 18px 40px rgba(0,0,0,.18);
          border-radius:18px;
        }
        .hero{padding:22px;text-align:center;margin-bottom:14px}
        .hero h1{margin:0}
        .form-card{padding:14px;margin-bottom:14px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .full{grid-column:1/-1}
        input,select,textarea{
          width:100%;padding:10px 12px;border-radius:12px;border:1px solid rgba(0,0,0,.14);font-size:14px;
        }
        textarea{min-height:86px}
        .actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
        button{
          border-radius:999px;padding:9px 16px;font-weight:700;border:1px solid rgba(0,0,0,.14);
          background:rgba(255,255,255,.42);cursor:pointer;transition:all .16s ease;
        }
        button:hover{transform:translateY(-2px);background:rgba(0,0,0,.88);color:#fff}
        .action-btn{background:rgba(0,0,0,.92);color:#fff;border-color:rgba(0,0,0,.92)}
        .action-btn:hover{background:#000;color:#fff}
        .status{margin:8px 2px 0;font-weight:700}
        .list{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
        .record-card{padding:12px}

        @media (max-width: 900px){
          .layout{flex-direction:column;padding:14px}
          .sidebar{width:100%}
          .grid{grid-template-columns:1fr}
        }
        @media (max-width: 430px){
          .layout{padding:10px;gap:10px}
          .hero{padding:14px}
          .hero h1{font-size:22px}
          .form-card,.record-card{padding:10px}
          .actions button{width:100%}
        }
      `}</style>

      <aside className="sidebar">
        <h2>VMS Customer Panel</h2>
        <nav className="nav">
          <a href="/customer-dashboard">Dashboard</a>
          <a className="active" href="/appointments">Appointments</a>
          <a href="/receipts">Receipts</a>
          <a href="/overview">Overview</a>
        </nav>
      </aside>

      <main className="main">
        <section className="hero">
          <h1>Appointments 🐾</h1>
          <p className="page-desc">Plan visits with clarity and minimize wait time.</p>
        </section>

        <section className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="grid">
              <div className="full">
                <label>Client</label>
                <select name="client" value={form.client} onChange={handleChange} required>
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name || c.username || c.id}</option>
                  ))}
                </select>
              </div>
              <div className="full">
                <label>Patient</label>
                <select name="patient" value={form.patient} onChange={handleChange} required>
                  <option value="">Select patient</option>
                  {filteredPatients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name || p.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Date & Time</label>
                <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="full">
                <label>Reason</label>
                <textarea name="reason" value={form.reason} onChange={handleChange} placeholder="Reason" />
              </div>
            </div>
            <div className="actions">
              <button type="submit" className="action-btn">
                {editingId ? "Update Appointment" : "Add Appointment"}
              </button>
              {editingId ? <button type="button" className="action-btn" onClick={clearForm}>Cancel</button> : null}
            </div>
          </form>
          <p className="status">{status}</p>
        </section>

        <section className="list">
          {appointments.map((a) => (
            <article key={a.id} className="record-card">
              <strong>{a.patient_name || a.patient}</strong>
              <div>{a.date}</div>
              <div>{a.reason}</div>
              <div className="actions">
                <button type="button" className="action-btn" onClick={() => startEdit(a)}>Edit</button>
                <button type="button" className="action-btn" onClick={() => handleDelete(a.id)}>Delete</button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
