import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { setRole } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Try customer login first
      let res;
      try {
        res = await API.post("/login/", form);
      } catch (customerErr) {
        // If customer login fails, try doctor login
        if (customerErr.response?.status === 403) {
          res = await API.post("/doctor/login/", form);
        } else {
          throw customerErr;
        }
      }

      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      
      // Get role and store it
      const role = res.data.user?.role || (res.data.user?.is_staff ? "doctor" : "customer");
      setRole(role);
      
      // Route based on role
      if (role === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/customer-dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div style={{
      minHeight:"100vh",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      backgroundImage:"url('https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg')",
      backgroundSize:"cover",
      padding:"20px"
    }}>
      <div style={{
        background:"rgba(255,255,255,0.72)",
        backdropFilter:"blur(12px) saturate(120%)",
        WebkitBackdropFilter:"blur(12px) saturate(120%)",
        boxShadow:"0 18px 40px rgba(0,0,0,0.18)",
        borderRadius:"18px",
        padding:"40px 30px",
        maxWidth:"400px",
        width:"100%",
        textAlign:"center"
      }}>
        <h1>VMS🐾 Login</h1>
        <p>Enter your credentials</p>
        {error && <div style={{color:"red", fontWeight:"600", marginBottom:"10px"}}>{error}</div>}
        <form onSubmit={handleSubmit} style={{display:"flex", flexDirection:"column", gap:"14px", textAlign:"left"}}>
          <label>Username</label>
          <input name="username" value={form.username} onChange={handleChange} required />
          <label>Password</label>
          <input name="password" value={form.password} onChange={handleChange} required type="password" />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
