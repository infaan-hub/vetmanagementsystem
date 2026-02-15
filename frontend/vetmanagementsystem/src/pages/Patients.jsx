import React, { useEffect, useState } from "react";
import API from "../api";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    name: "",
    species: "",
    breed: "",
    gender: "",
    color: "",
    date_of_birth: "",
    weight_kg: "",
    client: "",
    photo: null,
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPatients();
    loadClients();
  }, []);

  async function loadPatients() {
    setStatus("Loading patients...");
    try {
      const res = await API.get("/patients/");
      setPatients(res.data || []);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Could not load patients.");
    }
  }

  async function loadClients() {
    try {
      const res = await API.get("/clients/");
      setClients(res.data || []);
      // Auto-fill client if only one client exists
      if (res.data?.length === 1) {
        setForm((prev) => ({ ...prev, client: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setForm((prev) => ({ ...prev, photo: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const generatePatientId = () =>
    `P-${Math.floor(Math.random() * 900000 + 100000)}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    setError("");

    // Validate required fields
    if (!form.name || !form.species || !form.client) {
      setError("Please fill required fields: Name, Species, Client");
      setLoading(false);
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) fd.append(key, value);
    });
    fd.append("patient_id", generatePatientId());

    try {
      const res = await API.post("/patients/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("Patient added successfully.");
      setForm({
        name: "",
        species: "",
        breed: "",
        gender: "",
        color: "",
        date_of_birth: "",
        weight_kg: "",
        client: clients.length === 1 ? clients[0].id : "",
        photo: null,
      });
      loadPatients();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: '"Segoe UI",Tahoma,Geneva,Verdana,sans-serif',
        backgroundImage:
          "url('https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
        color: "#111",
        display: "flex",
        gap: "20px",
        padding: "20px",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "260px",
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
          borderRadius: "18px",
          padding: "24px 18px",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <h2 style={{ margin: 0, marginBottom: "20px", fontSize: 22 }}>
          Veterinary Management System (VMS)🩺🐾
        </h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <a
            href="/home/"
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              fontWeight: 600,
              color: "#111",
              textDecoration: "none",
            }}
          >
            Dashboard
          </a>
          <a
            href="/patients/"
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              fontWeight: 600,
              color: "#fff",
              background: "rgba(0,0,0,0.85)",
              textDecoration: "none",
            }}
          >
            Patients
          </a>
          <a
            href="/appointments/"
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              fontWeight: 600,
              color: "#111",
              textDecoration: "none",
            }}
          >
            Appointments
          </a>
          <a
            href="/receipts/"
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              fontWeight: 600,
              color: "#111",
              textDecoration: "none",
            }}
          >
            Receipts
          </a>
        </nav>
      </aside>

      {/* Main */}
      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 0 }}>
          {/* Hero */}
          <div
            style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(12px) saturate(120%)",
              WebkitBackdropFilter: "blur(12px) saturate(120%)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
              borderRadius: "18px",
              padding: "28px 22px",
              textAlign: "center",
              marginBottom: "26px",
            }}
          >
            <h1 style={{ margin: "0 0 8px", fontSize: 28 }}>Patients🐾</h1>
            <p style={{ margin: 0, color: "#222" }}>
              Register new patients and browse existing patients. Photo upload
              and client assignment supported.
            </p>
          </div>

          {/* Back button */}
          <div style={{ textAlign: "center", marginBottom: "14px" }}>
            <a
              href="/home/"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                borderRadius: 999,
                fontWeight: 700,
                textDecoration: "none",
                border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(255,255,255,0.42)",
                color: "#111",
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            >
              Back Home
            </a>
          </div>

          {/* Form Card */}
          <div
            style={{
              maxWidth: 720,
              margin: "0 auto 28px",
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(12px) saturate(120%)",
              WebkitBackdropFilter: "blur(12px) saturate(120%)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
              borderRadius: "18px",
              padding: "18px",
            }}
          >
            {error && (
              <p style={{ color: "crimson", fontWeight: 700 }}>{error}</p>
            )}
            {status && <p style={{ color: "#0b5cff", fontWeight: 600 }}>{status}</p>}
            <form
              onSubmit={handleSubmit}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {[
                { label: "Patient Name", name: "name", required: true },
                { label: "Species", name: "species", required: true },
                { label: "Breed", name: "breed" },
                { label: "Gender", name: "gender" },
                { label: "Color", name: "color" },
                { label: "Date of Birth", name: "date_of_birth", type: "date" },
                { label: "Weight (kg)", name: "weight_kg", type: "number", step: "0.01", min: "0" },
              ].map((field) => (
                <div key={field.name}>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    placeholder={field.label}
                    step={field.step}
                    min={field.min}
                    required={field.required}
                    value={form[field.name]}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.12)",
                      fontSize: 14,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}

              {/* Client select */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                  Client *
                </label>
                <select
                  name="client"
                  value={form.client}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                  Photo
                </label>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleChange}
                  style={{ padding: 6 }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: "inline-block",
                    padding: "10px 20px",
                    borderRadius: 999,
                    fontWeight: 700,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "rgba(255,255,255,0.42)",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  {loading ? "Adding..." : "Add Patient"}
                </button>
              </div>
            </form>
          </div>

          {/* Patients Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "18px",
            }}
          >
            {patients.length === 0 && <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#444" }}>No patients yet.</p>}
            {patients.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "rgba(255,255,255,0.72)",
                  backdropFilter: "blur(12px) saturate(120%)",
                  WebkitBackdropFilter: "blur(12px) saturate(120%)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
                  borderRadius: 16,
                  padding: 14,
                  transition: "transform .18s ease, box-shadow .18s ease",
                  overflow: "hidden",
                }}
              >
                <img
                  src={p.photo || "https://via.placeholder.com/300x160?text=No+Photo"}
                  alt={p.name}
                  style={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 10,
                    marginBottom: 10,
                    background: "#eee",
                  }}
                />
                <div style={{ fontSize: 14, color: "#222", lineHeight: 1.4 }}>
                  <strong>{p.name}</strong><br />
                  {p.species} {p.breed ? "• " + p.breed : ""}<br />
                  {p.gender ? "Gender: " + p.gender + " • " : ""}
                  {p.date_of_birth ? "DOB: " + p.date_of_birth : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
