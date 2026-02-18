// src/pages/Communications.jsx
import React, { useEffect, useState } from "react";
import API from "../api"; // your axios instance

export default function Communications() {
  const [patients, setPatients] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [form, setForm] = useState({ patient: "", message: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPatients();
    loadCommunications();
  }, []);

  async function loadPatients() {
    try {
      const res = await API.get("/patients/");
      setPatients(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load patients");
    }
  }

  async function loadCommunications() {
    try {
      const res = await API.get("/communications/");
      setCommunications(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load communications");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    setError("");
    if (!form.patient || !form.message) {
      setError("Patient and message are required");
      return;
    }
    setLoading(true);
    try {
      await API.post("/communications/", form);
      setStatus("✅ Message sent");
      setForm({ patient: "", message: "" });
      loadCommunications();
    } catch (err) {
      console.error(err);
      setError("Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <style>{`
        :root{
          --card-bg: rgba(255,255,255,0.72);
          --card-shadow: 0 18px 40px rgba(0,0,0,0.18);
        }
        html,body{height:100%;margin:0}
        body{
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          background-image: url("https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: repeat;
          color:#111;
        }
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
        .btn {
          display:inline-block;
          padding: 10px 20px;
          border-radius: 999px;
          font-weight:700;
          text-decoration:none;
          border:1px solid rgba(0,0,0,0.12);
          background: rgba(255,255,255,0.42);
          color:#111;
          cursor:pointer;
        }
        .btn:hover{ background: rgba(0,0,0,0.85); color:#fff; }
        .form-card{
          max-width:880px;
          margin: 0 auto 28px;
          background:var(--card-bg);
          backdrop-filter: blur(12px) saturate(120%);
          box-shadow: var(--card-shadow);
          border-radius: 18px;
          padding: 18px;
        }
        .form-grid{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap:12px;
        }
        .form-grid .full { grid-column: 1 / -1; }
        label { display:block; font-weight:600; margin-bottom:6px; }
        input,textarea,select {
          width:100%;
          padding:10px 12px;
          border-radius:12px;
          border:1px solid rgba(0,0,0,0.12);
        }
        .communications {
          display:grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap:18px;
        }
        .communication-card{
          background:var(--card-bg);
          backdrop-filter: blur(12px) saturate(120%);
          box-shadow: var(--card-shadow);
          border-radius:16px;
          padding:14px;
        }
      `}</style>

      <div className="hero">
        <h1>Communication🐾</h1>
        <p>Send messages to clients/patients and review past communications.</p>
      </div>

      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <a href="/" className="btn">Back Home</a>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label>Recipient (Patient)</label>
              <select
                name="patient"
                value={form.patient}
                onChange={handleChange}
                required
              >
                <option value="">Select patient</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.patient_id ?? p.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="full">
              <label>Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                required
              />
            </div>
          </div>

          <div style={{ textAlign:"right", marginTop:12 }}>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>
          </div>

          {status && <p style={{ color:"green", marginTop:10 }}>{status}</p>}
          {error && <p style={{ color:"crimson", marginTop:10 }}>{error}</p>}
        </form>
      </div>

      <div className="communications">
        {communications.length === 0 && <p>No messages yet.</p>}
        {communications.map(c => (
          <div key={c.id} className="communication-card">
            <strong>To: {c.patient_name ?? c.patient}</strong>
            <p>{c.message}</p>
            <small>{c.created_at ? new Date(c.created_at).toLocaleString() : ''}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
