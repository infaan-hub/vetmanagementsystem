import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function DoctorRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    specialization: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/doctor/register/", form);
      console.log("Doctor registered:", res.data);
      navigate("/doctor/login");
    } catch (err) {
      console.error("Backend error:", err.response?.data || err.message);
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.username ||
        err.response?.data?.email ||
        "Registration failed";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
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
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.84)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
          borderRadius: "18px",
          padding: "40px 30px",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: "0 0 16px", fontSize: "28px" }}>
          Doctor Registration
        </h1>
        <p style={{ margin: "0 0 24px", color: "#222" }}>
          Fill in your details to create a doctor account
        </p>

        {error && (
          <div
            style={{
              color: "crimson",
              fontWeight: 700,
              marginBottom: "12px",
              textAlign: "center",
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
            gap: "12px",
            textAlign: "left",
          }}
        >
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            style={{
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: 16,
              outline: "none",
            }}
          />
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: 16,
              outline: "none",
            }}
          />
          <input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: 16,
              outline: "none",
            }}
          />
          <input
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
            style={{
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: 16,
              outline: "none",
            }}
          />
          <input
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
            style={{
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: 16,
              outline: "none",
            }}
          />
          <input
            name="specialization"
            placeholder="Specialization"
            value={form.specialization}
            onChange={handleChange}
            style={{
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: 16,
              outline: "none",
            }}
          />
          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            style={{
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: 16,
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              border: "none",
              background: loading ? "rgba(0,0,0,0.2)" : "rgba(11,92,255,0.95)",
              color: "#fff",
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
                e.target.style.background = "rgba(11,92,255,0.95)";
                e.target.style.color = "#fff";
                e.target.style.transform = "translateY(0)";
              }
            }}
          >
            {loading ? "Registering…" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
