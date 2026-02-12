import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", full_name: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/client_register/", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
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
        <h1>VMS🐾 Register</h1>
        <p>Create your doctor or client account</p>
        {error && <div style={{color:"red", fontWeight:"600", marginBottom:"10px"}}>{error}</div>}
        <form onSubmit={handleSubmit} style={{display:"flex", flexDirection:"column", gap:"14px", textAlign:"left"}}>
          <label>Full Name</label>
          <input name="full_name" value={form.full_name} onChange={handleChange} required />
          <label>Username</label>
          <input name="username" value={form.username} onChange={handleChange} required />
          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} required type="email" />
          <label>Password</label>
          <input name="password" value={form.password} onChange={handleChange} required type="password" />
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}
