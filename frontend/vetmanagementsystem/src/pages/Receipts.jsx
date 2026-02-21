import React, { useEffect, useState } from "react";
import API from "../api";

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [clients, setClients] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    amount: "",
    date: "",
    status: "Pending",
    client: "",
  });

  useEffect(() => {
    loadReceipts();
    loadClients();
  }, []);

  function toList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  }

  async function loadReceipts() {
    try {
      const res = await API.get("/receipts/");
      setReceipts(toList(res.data));
    } catch (err) {
      console.error(err);
      setStatus("Could not load receipts");
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

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function clearForm() {
    setEditingId(null);
    setForm({ amount: "", date: "", status: "Pending", client: "" });
  }

  function startEdit(r) {
    setEditingId(r.id);
    setForm({
      amount: r.amount || "",
      date: r.date || "",
      status: r.status || "Pending",
      client: String(r.client?.id ?? r.client ?? ""),
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this receipt?")) return;
    try {
      await API.delete(`/receipts/${id}/`);
      if (editingId === id) clearForm();
      setStatus("Receipt deleted");
      await loadReceipts();
    } catch (err) {
      console.error(err);
      setStatus("Failed to delete receipt");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || !form.date || !form.client) {
      setStatus("Amount, date and client are required");
      return;
    }

    const payload = {
      amount: form.amount,
      date: form.date,
      status: form.status,
      client: form.client,
    };

    try {
      if (editingId) {
        await API.patch(`/receipts/${editingId}/`, payload);
        setStatus("Receipt updated");
      } else {
        await API.post("/receipts/", payload);
        setStatus("Receipt added");
      }
      clearForm();
      await loadReceipts();
    } catch (err) {
      console.error(err);
      setStatus("Failed to save receipt");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Receipts</h1>
      <form onSubmit={handleSubmit}>
        <input type="number" step="0.01" name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" required />
        <input type="date" name="date" value={form.date} onChange={handleChange} required />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select name="client" value={form.client} onChange={handleChange} required>
          <option value="">Select client</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.full_name || c.username || c.id}</option>)}
        </select>
        <button type="submit">{editingId ? "Update Receipt" : "Add Receipt"}</button>
        {editingId ? <button type="button" onClick={clearForm}>Cancel</button> : null}
      </form>
      <p>{status}</p>
      {receipts.map((r) => (
        <div key={r.id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 8 }}>
          <strong>Receipt {r.id}</strong>
          <div>{r.amount}</div>
          <div>{r.date}</div>
          <div>{r.status}</div>
          <button type="button" onClick={() => startEdit(r)}>Edit</button>
          <button type="button" onClick={() => handleDelete(r.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

