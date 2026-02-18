import React, { useEffect, useRef, useState } from "react";
import API from "../api";

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    date: "",
    status: "Pending",
    client: "",
  });
  const [status, setStatus] = useState("");
  const [statusError, setStatusError] = useState(false);
  const [debug, setDebug] = useState("");
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientHint, setClientHint] = useState("");
  const didInitRef = useRef(false);

  function toList(raw) {
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.results)) return raw.results;
    if (raw && Array.isArray(raw.data)) return raw.data;
    return [];
  }

  function getCSRFToken() {
    const cookie = document.cookie
      .split(";")
      .map((s) => s.trim())
      .find((c) => c.startsWith("csrftoken="));
    if (cookie) return decodeURIComponent(cookie.split("=")[1]);
    return null;
  }

  function setStatusMessage(msg, isError = false) {
    setStatus(msg);
    setStatusError(isError);
  }

  function debugDump(obj) {
    setDebug(JSON.stringify(obj, null, 2));
  }

  function formatDateMMDDYYYY(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
    }
    return value;
  }

  function statusClass(statusText) {
    const s = String(statusText || "").toLowerCase();
    if (s === "paid") return "status-paid";
    if (s === "pending") return "status-pending";
    if (s === "cancelled") return "status-cancelled";
    return "";
  }

  async function loadReceipts() {
    try {
      const res = await API.get("/receipts/");
      const data = toList(res.data);
      setReceipts(data);
      if (!data.length) setStatusMessage("No receipts found.");
    } catch (err) {
      setStatusMessage("Could not load receipts.", true);
      debugDump(err?.response?.data || err?.message || err);
    }
  }

  async function loadClientsIntoSelect() {
    setLoadingClients(true);
    setClientHint("");
    try {
      const res = await API.get("/clients/");
      const items = toList(res.data);
      setClients(items);

      const options = items.filter((c) => c?.id != null);
      if (options.length === 1) {
        const c = options[0];
        setForm((s) => ({ ...s, client: String(c.id) }));
        setClientHint(`Auto-selected client: ${c.full_name || c.name || c.username || c.id}`);
      } else {
        setStatusMessage("Clients loaded");
      }
    } catch (err) {
      setStatusMessage("Failed to load clients", true);
      debugDump(err?.response?.data || err?.message || err);
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  }

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    loadReceipts();
    loadClientsIntoSelect();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatusMessage("Submitting...");
    setDebug("");

    if (!form.client) {
      setStatusMessage("Please select a client.", true);
      return;
    }

    const formData = new FormData();
    formData.append("amount", form.amount);
    formData.append("date", form.date);
    formData.append("status", form.status);
    formData.append("client", form.client);

    try {
      const csrf = getCSRFToken();
      const headers = {};
      if (csrf) headers["X-CSRFToken"] = csrf;
      const res = await API.post("/receipts/", formData, { headers });
      debugDump(res.data || {});
      setStatusMessage("Receipt added successfully!");
      setForm((s) => ({ ...s, amount: "", date: "", status: "Pending" }));
      await loadReceipts();
    } catch (err) {
      const detail = err?.response?.data || err?.message || "Request failed";
      const text = typeof detail === "string" ? detail : JSON.stringify(detail);
      setStatusMessage(`Error creating receipt: ${text}`, true);
      debugDump(detail);
    }
  }

  return (
    <div className="layout">
      <style>{`
    :root{
      --card-bg: rgba(255,255,255,0.72);
      --card-shadow: 0 18px 40px rgba(0,0,0,0.18);
      --glass-bg: rgba(255,255,255,0.72);
      --glass-shadow: 0 18px 40px rgba(0,0,0,0.18);
    }
    html,body{height:100%;margin:0;font-family:"Segoe UI",Tahoma,Geneva,Verdana,sans-serif;}
    body{
      background-image:url("https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg");
      background-size:cover;background-position:center;padding:20px;box-sizing:border-box;color:#111;
    }
    .layout{display:flex;min-height:100vh;gap:20px;}
    .sidebar{width:260px;background:var(--glass-bg);backdrop-filter:blur(14px);box-shadow:var(--glass-shadow);border-radius:18px;padding:24px 18px;}
    .sidebar h2{text-align:center;margin:0 0 20px;font-size:22px;}
    .nav a{display:block;padding:12px 16px;border-radius:12px;margin-bottom:8px;text-decoration:none;font-weight:600;color:#111;}
    .nav a:hover, .nav a.active{background:rgba(0,0,0,0.85); color:#fff;}
    .main{flex:1;}
    .wrap{max-width:1100px;margin:0 auto}
    .hero{background:var(--card-bg);backdrop-filter: blur(12px) saturate(120%);box-shadow: var(--card-shadow);border-radius: 18px;padding: 28px 22px;text-align:center;margin-bottom:26px;}
    .hero h1{margin:0 0 8px;font-size:28px}
    .btn{display:inline-block;padding:10px 20px;border-radius:999px;font-weight:700;text-decoration:none;border:1px solid rgba(0,0,0,0.12);background: rgba(255,255,255,0.42);color:#111;cursor:pointer;}
    .btn:hover{ transform:translateY(-3px); background:rgba(0,0,0,0.85); color:#fff; }
    .form-card{max-width:720px;margin:0 auto 28px;background:var(--card-bg);backdrop-filter: blur(12px) saturate(120%);box-shadow: var(--card-shadow);border-radius: 18px;padding: 18px;}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:center}
    .form-grid .full{grid-column:1/-1}
    label{display:block;font-weight:600;margin-bottom:6px}
    input,select,button{width:100%;padding:10px 12px;border-radius:12px;border:1px solid rgba(0,0,0,0.12);box-sizing:border-box;font-size:14px}
    input[type="number"]{width:100%;}
    .status{margin-top:10px;font-weight:600}
    pre#debug{margin-top:8px;color:#444;font-size:13px;white-space:pre-wrap}
    .cards{display:grid;grid-template-columns: repeat(auto-fit,minmax(260px,1fr));gap:18px}
    .card{background:var(--card-bg);backdrop-filter:blur(12px) saturate(120%);box-shadow:var(--card-shadow);border-radius:16px;padding:14px;transition:transform .18s ease;overflow:hidden;}
    .card:hover{transform:translateY(-6px);box-shadow:0 30px 60px rgba(0,0,0,0.25)}
    .card .title{font-weight:700;margin-bottom:6px}
    .card .row{display:flex;justify-content:space-between;margin:6px 0}
    .status-pill{padding:6px 10px;border-radius:999px;font-weight:700}
    .status-paid{background:#d4edda;color:#155724}
    .status-pending{background:#fff3cd;color:#856404}
    .status-cancelled{background:#f8d7da;color:#721c24}
    @media(max-width:720px){ .layout{flex-direction:column;} .form-grid{grid-template-columns:1fr} .sidebar{width:100%;} }
    .nav a[href="/clients/"] { display: none; }
  `}</style>

      <aside className="sidebar">
        <h2>Veterinary Management System🐾</h2>
        <nav className="nav">
          <a href="/home/">Dashboard</a>
          <a href="/appointments/">Appointments</a>
          <a className="active" href="/receipts/">
            Receipts
          </a>
          <a href="/clients/">Clients</a>
        </nav>
      </aside>

      <main className="main">
        <div className="wrap">
          <div className="hero">
            <h1>Receipts🐾</h1>
            <p>Amount, Date (MM/DD/YYYY), Status, Client</p>
          </div>

          <div className="form-card">
            <form id="receiptForm" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label>Amount</label>
                  <input type="number" name="amount" required step="0.01" value={form.amount} onChange={handleChange} />
                </div>

                <div>
                  <label>Date</label>
                  <input type="date" name="date" required value={form.date} onChange={handleChange} />
                </div>

                <div>
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="full">
                  <label>Client</label>
                  <select id="clientSelect" name="client" required value={form.client} onChange={handleChange} disabled={loadingClients}>
                    <option value="">{loadingClients ? "Loading clients..." : "Select client"}</option>
                    {clients.map((c) => {
                      const value = c.id ?? c.client_id ?? "";
                      const label = c.full_name || c.name || c.username || value;
                      return (
                        <option key={value} value={value}>
                          {label}
                          {c.client_id ? ` — ${c.client_id}` : ""}
                        </option>
                      );
                    })}
                  </select>
                  <small id="clientHint" style={{ color: "#444", display: "block", marginTop: 6 }}>
                    {clientHint}
                  </small>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button type="submit" className="btn" style={{ width: "auto", padding: "10px 18px" }}>
                  Add Receipt
                </button>
              </div>

              <p id="status" className="status" style={{ color: statusError ? "crimson" : "green" }}>
                {status}
              </p>
              <pre id="debug">{debug}</pre>
            </form>
          </div>

          <div className="cards" id="receiptsGrid">
            {receipts.length === 0 ? (
              <p style={{ gridColumn: "1/-1", color: "#333" }}>No receipts found.</p>
            ) : (
              receipts.map((r, idx) => {
                const amount = r.amount != null ? Number.parseFloat(r.amount).toFixed(2) : "-";
                const date = formatDateMMDDYYYY(r.date || r.created_at || r.issued_date);
                const statusText = r.status || r.payment_status || "Pending";
                const clientText = r.client_display || r.client_name || r.client || r.client_id || "-";
                return (
                  <div key={r.id ?? `receipt-${idx}`} className="card">
                    <div className="title">Receipt {r.id ?? ""}</div>
                    <div className="row">
                      <span>Amount</span>
                      <span>{amount}</span>
                    </div>
                    <div className="row">
                      <span>Date</span>
                      <span>{date}</span>
                    </div>
                    <div className="row">
                      <span>Status</span>
                      <span className={`status-pill ${statusClass(statusText)}`}>{statusText}</span>
                    </div>
                    <div className="row">
                      <span>Client</span>
                      <span>{clientText}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
