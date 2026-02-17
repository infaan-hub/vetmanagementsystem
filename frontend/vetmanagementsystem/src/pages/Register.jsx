import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function CustomerRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      try {
        await API.post("/client/register/", form);
      } catch (err) {
        // Fallback to auth endpoint used by backend auth_views
        if (err?.response?.status === 404) {
          await API.post("/register/", form);
        } else {
          throw err;
        }
      }
      navigate("/login");
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.username?.[0] ||
        err?.response?.data?.email?.[0] ||
        err?.response?.data?.password?.[0] ||
        err?.message;
      console.error("Registration error:", err?.response?.data || err?.message || err);
      setError(detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: '"Segoe UI",Tahoma,Verdana,sans-serif',
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 16px",
        backgroundImage:
          "url('https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "repeat"
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
          borderRadius: "18px",
          padding: "40px 30px",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center"
        }}
      >
        <h1 style={{ margin: "0 0 16px", fontSize: "28px" }}>
          Customer Registration
        </h1>
        <p style={{ margin: "0 0 24px", color: "#222" }}>
          Create a new account to access your client dashboard
        </p>

        {error && (
          <div
            style={{
              color: "red",
              marginBottom: "10px",
              textAlign: "center",
              fontWeight: 600
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "14px", textAlign: "left" }}
        >
          <label htmlFor="full_name">Full Name</label>
          <input
            id="full_name"
            name="full_name"
            autoComplete="name"
            value={form.full_name}
            onChange={handleChange}
            required
            style={{
              padding: "10px 12px",
              borderRadius: "12px",
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: "16px",
              outline: "none"
            }}
          />

          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            value={form.username}
            onChange={handleChange}
            required
            style={{
              padding: "10px 12px",
              borderRadius: "12px",
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: "16px",
              outline: "none"
            }}
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              padding: "10px 12px",
              borderRadius: "12px",
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: "16px",
              outline: "none"
            }}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
            style={{
              padding: "10px 12px",
              borderRadius: "12px",
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: "16px",
              outline: "none"
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 18px",
              borderRadius: "999px",
              border: "none",
              background: loading ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.85)",
              color: "#fff",
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
              transition: "transform .15s ease, background .15s ease, color .15s ease"
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.background = "rgba(255,255,255,0.42)";
                e.target.style.color = "#111";
                e.target.style.transform = "translateY(-3px)";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.background = "rgba(0,0,0,0.85)";
                e.target.style.color = "#fff";
                e.target.style.transform = "translateY(0)";
              }
            }}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p style={{ marginTop: "16px", textAlign: "center" }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "#0b5cff", cursor: "pointer", textDecoration: "underline" }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
