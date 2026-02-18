import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
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

  const photoRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    loadPatients();
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPatients() {
    setStatus("Loading patients...");
    setError("");
    try {
      const res = await API.get("/patients/");
      const data = res.data && res.data.results ? res.data.results : res.data;
      setPatients(Array.isArray(data) ? data : []);
      setStatus("");
    } catch (err) {
      console.error("loadPatients error:", err);
      setStatus("Could not load patients.");
    }
  }

  async function loadClients() {
    try {
      const res = await API.get("/clients/");
      const data = res.data && res.data.results ? res.data.results : res.data;
      setClients(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length === 1) {
        setForm((prev) => ({ ...prev, client: data[0].id }));
      }
    } catch (err) {
      console.error("loadClients error:", err);
    }
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setForm((prev) => ({ ...prev, photo: files?.[0] || null }));
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

    if (!form.name || !form.species || !form.client) {
      setError("Please fill required fields: Name, Species, Client");
      setLoading(false);
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
      fd.append(key, value);
    });
    fd.append("patient_id", generatePatientId());

    try {
      await API.post("/patients/", fd, {
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
      if (photoRef.current) photoRef.current.value = "";
      await loadPatients();
    } catch (err) {
      console.error("submit error:", err);
      if (err.response?.status === 401) {
        setError("Not authenticated. Please login (401).");
      } else if (err.response?.status === 500) {
        // show helpful details for server errors
        setError(
          `Server error (500). See console for details. ${JSON.stringify(
            err.response?.data
          )}`
        );
      } else {
        setError(
          err.response?.data?.detail ||
            (err.response && JSON.stringify(err.response.data)) ||
            err.message ||
            "Submission failed"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Inline SVG fallback (data URI) so we don't rely on external placeholder host
  const svgPlaceholder = (() => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='160'>
      <rect width='100%' height='100%' fill='#eeeeee'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#888' font-family='Segoe UI, Arial' font-size='18'>No Photo</text>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  })();

  // Build safe photo url (handles absolute urls, relative /media/... or object form)
  const getPhotoUrl = (photo) => {
    if (!photo) return svgPlaceholder;

    // If API gave an object like { url: '/media/..' }
    if (typeof photo === "object") {
      if (photo.url) {
        photo = photo.url;
      } else {
        return svgPlaceholder;
      }
    }

    if (typeof photo !== "string") return svgPlaceholder;

    // absolute
    if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;

    // relative path starting with '/'
    if (photo.startsWith("/")) return `${window.location.origin}${photo}`;

    // fallback: assume media fileName and prefix /media/
    return `${window.location.origin}/media/${photo}`;
  };

  // Sidebar requested items
  const sidebarLinks = [
    { to: "/overview", label: "Overview" },
    { to: "/patients", label: "Patients" },
    { to: "/allergies", label: "Allergies" },
    { to: "/visits", label: "Visits" },
    { to: "/vitals", label: "Vitals" },
    { to: "/communications", label: "Communications" },
    { to: "/medical-notes", label: "Medical Notes" },
    { to: "/medications", label: "Medications" },
    { to: "/documents", label: "Documents" },
    { to: "/treatments", label: "Treatments" },
  ];

  const linkStyle = {
    padding: "12px 16px",
    borderRadius: "12px",
    fontWeight: 600,
    color: "#111",
    textDecoration: "none",
    display: "block",
  };
  const activeLinkStyle = { ...linkStyle, color: "#fff", background: "rgba(0,0,0,0.85)" };

  return (
    <div
      className="layout"
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
        boxSizing: "border-box",
      }}
    >
      <style>{`
        .patients-wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0;
        }

        .patients-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .patients-full {
          grid-column: 1 / -1;
        }

        .patients-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
        }

        @media (max-width: 768px) {
          .patients-wrap {
            padding: 0 8px;
          }

          .patients-form {
            grid-template-columns: 1fr;
          }

          .patients-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Sidebar */}
      <aside
        className="sidebar"
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
        <h2 style={{ margin: 0, marginBottom: "18px", fontSize: 20 }}>VMS 🩺🐾</h2>
        <nav className="nav" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {sidebarLinks.map((l) => {
            const isActive = location.pathname === l.to;
            return (
              <Link key={l.to} to={l.to} style={isActive ? activeLinkStyle : linkStyle}>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="main" style={{ flex: 1 }}>
        <div className="patients-wrap">
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
              Register new patients and browse existing patients. Photo upload and client assignment supported.
            </p>
          </div>

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
            {error && <p style={{ color: "crimson", fontWeight: 700 }}>{error}</p>}
            {status && <p style={{ color: "#0b5cff", fontWeight: 600 }}>{status}</p>}

            <form
              onSubmit={handleSubmit}
              className="patients-form"
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
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{field.label}</label>
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

              <div className="patients-full">
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Client *</label>
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
                    <option key={c.id} value={c.id}>
                      {c.full_name || c.username || `Client ${c.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Photo</label>
                <input ref={photoRef} type="file" name="photo" accept="image/*" onChange={handleChange} style={{ padding: 6 }} />
              </div>

              <div className="patients-full" style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
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

          <div className="patients-grid">
            {patients.length === 0 && <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#444" }}>No patients yet.</p>}

            {patients.map((p) => {
              const photo = p.photo || p.photo_url || p.image || p.photo_path;
              const imgSrc = getPhotoUrl(photo);
              return (
                <div key={p.id} style={{
                  background: "rgba(255,255,255,0.72)",
                  backdropFilter: "blur(12px) saturate(120%)",
                  WebkitBackdropFilter: "blur(12px) saturate(120%)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
                  borderRadius: 16, padding: 14, transition: "transform .18s ease, box-shadow .18s ease", overflow: "hidden"
                }}>
                  <img
                    src={imgSrc}
                    alt={p.name || "Patient"}
                    style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 10, marginBottom: 10, background: "#eee" }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = svgPlaceholder;
                    }}
                  />
                  <div style={{ fontSize: 14, color: "#222", lineHeight: 1.4 }}>
                    <strong>{p.name || "Unnamed"}</strong><br />
                    {p.species} {p.breed ? "• " + p.breed : ""}<br />
                    {p.gender ? "Gender: " + p.gender + (p.date_of_birth ? " • " : "") : ""}
                    {p.date_of_birth ? `DOB: ${p.date_of_birth}` : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
