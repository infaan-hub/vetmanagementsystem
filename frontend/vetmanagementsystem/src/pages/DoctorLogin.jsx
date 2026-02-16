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

      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      localStorage.setItem("username", form.username);
      if (res.data?.email) localStorage.setItem("email", res.data.email);

      setRole("doctor");
      navigate("/doctor-dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <style>{`
:root{
  --card-bg: rgba(255,255,255,0.72);
  --card-shadow: 0 18px 40px rgba(0,0,0,0.18);
}

html, body { height: 100%; margin: 0; }
body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url("https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: repeat;
}

.login-root{
  min-height:100vh;
  width:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:12px;
}

.card {
  width: min(92vw, 400px);
  padding: 36px 34px;
  border-radius: 18px;
  background: var(--card-bg);
  backdrop-filter: blur(10px) saturate(120%);
  -webkit-backdrop-filter: blur(10px) saturate(120%);
  box-shadow: var(--card-shadow);
  text-align: center;
  color: #111;
}

h1 { margin: 0 0 16px; font-size: 24px; }
form { display: flex; flex-direction: column; gap: 14px; text-align: left; }
label { font-weight: 600; }
input { padding: 10px 12px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.12); font-size: 14px; }
button { padding: 12px; border-radius: 999px; border: 1px solid rgba(0,0,0,0.12); background: rgba(255,255,255,0.42); font-weight: 700; cursor: pointer; transition: transform .18s ease, background .18s ease, color .18s ease; }
button:hover { transform: translateY(-3px); background: rgba(0,0,0,0.85); color: #fff; }
button:disabled { opacity: .75; cursor: default; transform: none; }
p.error { color: red; margin: 0 0 10px; font-weight: 600; }
.switch-login { text-align: center; margin-top: 12px; }
.switch-login a { color: #333; text-decoration: underline; font-weight: 600; }

@media (max-width: 420px) { .card { padding: 24px; border-radius: 14px; } }
      `}</style>

      <div className="card">
        <h1>Veterinary Management System Doctor🩺🐾 Login</h1>
        {error ? <p className="error">{error}</p> : null}
        <form onSubmit={handleSubmit}>
          <label>Username:</label>
          <input type="text" name="username" value={form.username} onChange={handleChange} required />

          <label>Password:</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="switch-login">
          <p>
            Customer? <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}
