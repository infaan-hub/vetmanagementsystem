import React, { useState } from "react";
import API, { setTokens } from "../api";
import { useNavigate } from "react-router-dom";
import { setRole } from "../utils/auth";

export default function CustomerLogin() {
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
      let res;
      // Try normal login first
      try {
        res = await API.post("/login/", form);
      } catch (err) {
        if (err.response?.status === 403) {
          // fallback to doctor login
          res = await API.post("/doctor/login/", form);
        } else {
          throw err;
        }
      }

      if (!res.data?.access || !res.data?.refresh) {
        throw new Error("Token response is missing access/refresh fields.");
      }

      setTokens(res.data.access, res.data.refresh);

      // Determine role
      const role = res.data.user?.role || (res.data.user?.is_staff ? "doctor" : "customer");
      setRole(role);

      // Redirect based on role
      if (role === "doctor") navigate("/doctor-dashboard");
      else navigate("/customer-dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 16px",
        backgroundImage:
          "url('https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        color: "#111",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(12px) saturate(120%)",
          WebkitBackdropFilter: "blur(12px) saturate(120%)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
          borderRadius: "18px",
          padding: "40px 30px",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: "0 0 16px", fontSize: "28px" }}>
          Veterinary Management System Customer Login🐾
        </h1>
        <p style={{ margin: "0 0 24px", color: "#222" }}>
          Enter your credentials to access your client portal
        </p>

        {error && (
          <div
            style={{
              color: "red",
              marginBottom: "10px",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            textAlign: "left",
          }}
        >
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
              outline: "none",
            }}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            required
            style={{
              padding: "10px 12px",
              borderRadius: "12px",
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: "16px",
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 18px",
              borderRadius: "999px",
              border: "none",
              background: "rgba(255,255,255,0.42)",
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
              transition:
                "transform .15s ease, background .15s ease, color .15s ease",
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.background = "rgba(0,0,0,0.85)";
                e.target.style.color = "#fff";
                e.target.style.transform = "translateY(-3px)";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.background = "rgba(255,255,255,0.42)";
                e.target.style.color = "#000";
                e.target.style.transform = "translateY(0)";
              }
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "14px", textAlign: "center" }}>
          No account?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{ color: "#0b5cff", cursor: "pointer", textDecoration: "underline" }}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}
