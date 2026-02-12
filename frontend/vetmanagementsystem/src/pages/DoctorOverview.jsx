import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";


export default function DoctorOverview() {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // helper to safely extract client id from resource item
  const getClientIdFrom = (item) => {
    if (!item) return null;
    if (item.client && typeof item.client === "object") return item.client.id ?? item.client.pk ?? item.client;
    if (item.client_id) return item.client_id;
    if (item.client) return item.client; // maybe an id
    // fallback try receipt.customer etc
    if (item.customer && typeof item.customer === "object") return item.customer.id ?? item.customer.pk;
    return null;
  };

  useEffect(() => {
    const loadClientsAndData = async () => {
      setLoading(true);
      setError("");
      try {
        const clientsRes = await API.get("/clients/");
        setClients(clientsRes.data || []);

        // fetch full lists (doctor can access all)
        const [apptsRes, receiptsRes] = await Promise.allSettled([
          API.get("/appointments/"),
          API.get("/receipts/"),
        ]);

        const apptsData = apptsRes.status === "fulfilled" ? apptsRes.value.data : [];
        const receiptsData = receiptsRes.status === "fulfilled" ? receiptsRes.value.data : [];

        setAppointments(apptsData || []);
        setReceipts(receiptsData || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load overview data.");
      } finally {
        setLoading(false);
      }
    };

    loadClientsAndData();
  }, []);

  // filtered views for selected client
  const filteredAppointments = selectedClientId
    ? appointments.filter((a) => {
        const cid = getClientIdFrom(a);
        return cid && String(cid) === String(selectedClientId);
      })
    : [];

  const filteredReceipts = selectedClientId
    ? receipts.filter((r) => {
        const cid = getClientIdFrom(r);
        return cid && String(cid) === String(selectedClientId);
      })
    : [];

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: "url('https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg')",
      backgroundSize: "cover",
      padding: "20px"
    }}>
      <Navbar role="doctor" />

      <div style={{ maxWidth: 1200, margin: "20px auto", color: "#111" }}>
        <h1>Doctor — Client Overview</h1>

        {loading && <div style={{marginTop:12}}>Loading...</div>}
        {error && <div style={{color:"red", marginTop:12}}>{error}</div>}

        <div style={{display:"flex", gap:16, marginTop:18, alignItems:"center", flexWrap:"wrap"}}>
          <label style={{fontWeight:700}}>Select Client:</label>
          <select
            value={selectedClientId ?? ""}
            onChange={(e) => setSelectedClientId(e.target.value)}
            style={{ padding: "10px 12px", borderRadius:12, minWidth:260 }}
          >
            <option value="">-- choose client --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name || c.username || c.client_id || `Client ${c.id}`}</option>
            ))}
          </select>

          <button
            onClick={() => {
              // clear selection
              setSelectedClientId(null);
            }}
            style={{
              padding: "10px 14px",
              borderRadius:12,
              border:"none",
              cursor:"pointer",
              background:"#eee"
            }}
          >
            Clear
          </button>
        </div>

        {/* Appointments */}
        <section style={{ marginTop:24 }}>
          <h2>Appointments {selectedClientId ? `(for client ${selectedClientId})` : "(select a client)"}</h2>
          <div style={{ background:"rgba(255,255,255,0.72)", padding:16, borderRadius:12 }}>
            {selectedClientId ? (
              filteredAppointments.length ? (
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead style={{ textAlign:"left" }}>
                    <tr>
                      <th style={{padding:8}}>Patient</th>
                      <th style={{padding:8}}>Date</th>
                      <th style={{padding:8}}>Reason</th>
                      <th style={{padding:8}}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((a) => (
                      <tr key={a.id}>
                        <td style={{padding:8}}>{(a.patient && (a.patient.name || a.patient)) || a.patient_name || "—"}</td>
                        <td style={{padding:8}}>{new Date(a.date || a.visit_date || a.datetime || a.created_at || a.time || Date.now()).toLocaleString()}</td>
                        <td style={{padding:8}}>{a.reason || a.notes || "—"}</td>
                        <td style={{padding:8}}>{a.status || a.visit_status || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div>No appointments for selected client.</div>
            ) : <div>Please select a client to see appointments.</div>}
          </div>
        </section>

        {/* Receipts */}
        <section style={{ marginTop:24 }}>
          <h2>Receipts {selectedClientId ? `(for client ${selectedClientId})` : ""}</h2>
          <div style={{ background:"rgba(255,255,255,0.72)", padding:16, borderRadius:12 }}>
            {selectedClientId ? (
              filteredReceipts.length ? (
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr>
                      <th style={{padding:8}}>Date</th>
                      <th style={{padding:8}}>Amount</th>
                      <th style={{padding:8}}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReceipts.map((r) => (
                      <tr key={r.id}>
                        <td style={{padding:8}}>{r.date || r.created_at}</td>
                        <td style={{padding:8}}>{r.amount}</td>
                        <td style={{padding:8}}>{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div>No receipts for selected client.</div>
            ) : <div>Select a client to view receipts.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
