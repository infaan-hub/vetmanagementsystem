import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { setRole } from "../utils/auth";

export default function DoctorLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/doctor/login/", form);

      // Save tokens
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      setRole("doctor");
      navigate("/doctor-dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          padding: "30px",
          borderRadius: 14,
          boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
          maxWidth: 360,
          width: "100%",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Doctor Login</h1>

        {error && (
          <div style={{ color: "red", fontWeight: 600, marginBottom: 10 }}>
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            style={{ padding: 10, borderRadius: 10, fontSize: 16 }}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ padding: 10, borderRadius: 10, fontSize: 16 }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 10,
              borderRadius: 999,
              border: "none",
              background: loading ? "rgba(0,0,0,0.2)" : "#0b5cff",
              color: "#fff",
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
