import { useState } from "react";
import api from "../api/api";

export default function RegisterClient() {
  const [form, setForm] = useState({ full_name: "", phone: "" });

  const submit = async e => {
    e.preventDefault();
    await api.post("clients/", form);
    alert("Registered successfully");
  };

  return (
    <form onSubmit={submit} className="glass">
      <input placeholder="Full Name" onChange={e=>setForm({...form, full_name:e.target.value})} />
      <input placeholder="Phone" onChange={e=>setForm({...form, phone:e.target.value})} />
      <button>Register</button>
    </form>
  );
}
