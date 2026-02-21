import React, { useEffect, useRef, useState } from "react";
import API from "../api";
import { crudThemeStyles } from "../styles/crudThemeStyles";
import { BACKEND_URL } from "../api/api";

export default function Patients() {
  const fileRef = useRef(null);
  const objectUrlCacheRef = useRef(new Map());
  const [patients, setPatients] = useState([]);
  const [clients, setClients] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [imgFallbackMap, setImgFallbackMap] = useState({});
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

  useEffect(() => {
    loadPatients();
    loadClients();
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
      setStatus("Could not load patients");
    }
  }

  async function loadClients() {
    try {
      const res = await API.get("/clients/");
      setClients(toList(res.data));
    } catch (err) {
      console.error(err);
    }
  }

  function getPhotoUrl(photo) {
    if (!photo) return "";
    if (typeof photo === "object") {
      photo = photo.url || photo.path || photo.file || "";
    }
    if (typeof photo !== "string") return "";
    const s = photo.trim().replace(/\\/g, "/");
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("blob:") || s.startsWith("data:")) return s;
    if (s.startsWith("/api/media/")) return `${BACKEND_URL}${s.replace(/^\/api/, "")}`;
    if (s.startsWith("/media/")) return `${BACKEND_URL}${s}`;
    if (s.startsWith("media/")) return `${BACKEND_URL}/${s}`;
    if (s.startsWith("/")) return `${BACKEND_URL}${s}`;
    return `${BACKEND_URL}/media/${s}`;
  }

  const svgPlaceholder = (() => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='160'>
      <rect width='100%' height='100%' fill='#eeeeee'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#888' font-family='Segoe UI, Arial' font-size='18'>No Photo</text>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  })();

  async function loadImageWithAuthFallback(src, patientId) {
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) return;
    const cached = objectUrlCacheRef.current.get(src);
    if (cached) {
      setImgFallbackMap((prev) => ({ ...prev, [patientId]: cached }));
      return;
    }
    try {
      const res = await API.get(src, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      objectUrlCacheRef.current.set(src, url);
      setImgFallbackMap((prev) => ({ ...prev, [patientId]: url }));
    } catch (_err) {
      setImgFallbackMap((prev) => ({ ...prev, [patientId]: svgPlaceholder }));
    }
  }

  useEffect(() => {
    return () => {
      for (const url of objectUrlCacheRef.current.values()) URL.revokeObjectURL(url);
      objectUrlCacheRef.current.clear();
    };
  }, []);

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setForm((s) => ({ ...s, photo: files?.[0] || null }));
      return;
    }
    setForm((s) => ({ ...s, [name]: value }));
  }

  function clearForm() {
    setEditingId(null);
    setForm({
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
    if (fileRef.current) fileRef.current.value = "";
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name || "",
      species: p.species || "",
      breed: p.breed || "",
      gender: p.gender || "",
      color: p.color || "",
      date_of_birth: p.date_of_birth || "",
      weight_kg: p.weight_kg || "",
      client: String(p.client?.id ?? p.client ?? ""),
      photo: null,
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this patient?")) return;
    try {
      await API.delete(`/patients/${id}/`);
      if (editingId === id) clearForm();
      setStatus("Patient deleted");
      await loadPatients();
    } catch (err) {
      console.error(err);
      setStatus("Failed to delete patient");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.species || !form.client) {
      setStatus("Name, species and client are required");
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v === null || v === undefined || v === "") return;
      fd.append(k, v);
    });
    try {
      if (editingId) {
        await API.patch(`/patients/${editingId}/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        setStatus("Patient updated");
      } else {
        fd.append("patient_id", `P-${Math.floor(Math.random() * 900000 + 100000)}`);
        await API.post("/patients/", fd, { headers: { "Content-Type": "multipart/form-data" } });
        setStatus("Patient added");
      }
      clearForm();
      await loadPatients();
    } catch (err) {
      console.error(err);
      setStatus("Failed to save patient");
    }
  }

  return (
    <div className="crud-page">
      <style>{crudThemeStyles}</style>
      <div className="crud-content">
      <h1>Patients</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input name="species" value={form.species} onChange={handleChange} placeholder="Species" required />
        <input name="breed" value={form.breed} onChange={handleChange} placeholder="Breed" />
        <input name="gender" value={form.gender} onChange={handleChange} placeholder="Gender" />
        <input name="color" value={form.color} onChange={handleChange} placeholder="Color" />
        <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} />
        <input type="number" step="0.01" name="weight_kg" value={form.weight_kg} onChange={handleChange} placeholder="Weight kg" />
        <select name="client" value={form.client} onChange={handleChange} required>
          <option value="">Select client</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.full_name || c.username || c.id}</option>)}
        </select>
        <input ref={fileRef} type="file" name="photo" accept="image/*" onChange={handleChange} />
        <button type="submit">{editingId ? "Update Patient" : "Add Patient"}</button>
        {editingId ? <button type="button" onClick={clearForm}>Cancel</button> : null}
      </form>
      <p className="status-msg">{status}</p>
      {patients.map((p) => (
        <div key={p.id} className="crud-record-card">
          {(() => {
            const rawSrc = getPhotoUrl(p.photo || p.photo_url || p.image || p.photo_path);
            const src = imgFallbackMap[p.id] || rawSrc || svgPlaceholder;
            return (
          <img
            src={src}
            alt={p.name || "patient"}
            style={{ width: 120, height: 80, objectFit: "cover", background: "#eee" }}
            onError={() => {
              loadImageWithAuthFallback(rawSrc, p.id);
            }}
          />
            );
          })()}
          <strong>{p.name}</strong>
          <div>{p.species} {p.breed || ""}</div>
          <button type="button" className="action-btn" onClick={() => startEdit(p)}>Edit</button>
          <button type="button" className="action-btn" onClick={() => handleDelete(p.id)}>Delete</button>
        </div>
      ))}
      </div>
    </div>
  );
}






