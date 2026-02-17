import React, { useEffect, useMemo, useRef, useState } from "react";
import API from "../api";
import { logout } from "../utils/auth";

export default function CustomerDashboard() {
  const initialized = useRef(false);
  const chartRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "Customer",
    username: "customer",
    email: "-",
    client_id: "-",
  });

  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    receipts: 0,
    receipts_paid: 0,
    receipts_total: 0,
  });

  const [displayStats, setDisplayStats] = useState({
    patients: 0,
    appointments: 0,
    receipts: 0,
  });

  const [chartLabels, setChartLabels] = useState([]);
  const [chartData, setChartData] = useState([]);

  function toList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }

  function monthlyVisits(visits) {
    const grouped = {};
    visits.forEach((v) => {
      const raw = v?.visit_date || v?.date || v?.created_at;
      if (!raw) return;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      grouped[key] = (grouped[key] || 0) + 1;
    });

    const keys = Object.keys(grouped).sort();
    return {
      labels: keys,
      data: keys.map((k) => grouped[k]),
    };
  }

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function loadData() {
      const [patientsRes, appointmentsRes, receiptsRes, visitsRes, clientsRes] = await Promise.allSettled([
        API.get("/patients/"),
        API.get("/appointments/"),
        API.get("/receipts/"),
        API.get("/visits/"),
        API.get("/clients/"),
      ]);

      const patients = patientsRes.status === "fulfilled" ? toList(patientsRes.value.data) : [];
      const appointments = appointmentsRes.status === "fulfilled" ? toList(appointmentsRes.value.data) : [];
      const receipts = receiptsRes.status === "fulfilled" ? toList(receiptsRes.value.data) : [];
      const visits = visitsRes.status === "fulfilled" ? toList(visitsRes.value.data) : [];
      const clients = clientsRes.status === "fulfilled" ? toList(clientsRes.value.data) : [];

      const paidCount = receipts.filter((r) => String(r?.status || "").toLowerCase() === "paid").length;
      const receiptsTotal = receipts.reduce((sum, r) => sum + (Number.parseFloat(r?.amount) || 0), 0);

      setStats({
        patients: patients.length,
        appointments: appointments.length,
        receipts: receipts.length,
        receipts_paid: paidCount,
        receipts_total: receiptsTotal,
      });

      const firstClient = clients[0];
      if (firstClient) {
        setProfile({
          full_name: firstClient.full_name || firstClient.name || firstClient.username || "Customer",
          username: firstClient.username || "customer",
          email: firstClient.email || "-",
          client_id: firstClient.client_id || firstClient.id || "-",
        });
      }

      const monthly = monthlyVisits(visits);
      setChartLabels(monthly.labels);
      setChartData(monthly.data);
    }

    loadData();
  }, []);

  useEffect(() => {
    const targets = {
      patients: stats.patients,
      appointments: stats.appointments,
      receipts: stats.receipts,
    };

    const timers = [];
    Object.keys(targets).forEach((k) => {
      const end = Number(targets[k] || 0);
      let current = 0;
      const step = Math.max(1, Math.floor(Math.max(end / 25, 1)));
      const t = setInterval(() => {
        current += step;
        if (current >= end) {
          current = end;
          clearInterval(t);
        }
        setDisplayStats((s) => ({ ...s, [k]: current }));
      }, 40);
      timers.push(t);
    });

    return () => {
      timers.forEach((t) => clearInterval(t));
    };
  }, [stats.patients, stats.appointments, stats.receipts]);

  useEffect(() => {
    let canceled = false;

    function renderChart() {
      if (canceled) return;
      const canvas = document.getElementById("visitsChart");
      if (!canvas || !window.Chart) return;

      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvas.getContext("2d");
      chartRef.current = new window.Chart(ctx, {
        type: "line",
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: "Visits",
              data: chartData,
              fill: true,
              tension: 0.3,
              borderWidth: 2,
              pointRadius: 3,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });
    }

    if (window.Chart) {
      renderChart();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      script.onload = renderChart;
      document.head.appendChild(script);
    }

    return () => {
      canceled = true;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [chartLabels, chartData]);

  useEffect(() => {
    function closeMenu() {
      setProfileOpen(false);
    }
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const beatVars = useMemo(() => {
    function speed(value, max) {
      const bpm = Math.min(160, Math.max(50, ((value || 0) / max) * 120 || 70));
      return `${60 / bpm}s`;
    }
    return {
      patients: { "--beat-speed": speed(stats.patients, 500) },
      appointments: { "--beat-speed": speed(stats.appointments, 500) },
      receipts: { "--beat-speed": speed(stats.receipts, 500) },
    };
  }, [stats.patients, stats.appointments, stats.receipts]);

  return (
    <div className="layout">
      <style>{`
:root{
  --glass-bg: rgba(255,255,255,.72);
  --glass-shadow: 0 18px 40px rgba(0,0,0,.18);
  --primary:#0b5cff;
}
*{box-sizing:border-box}
html,body{height:100%;margin:0}
body{
  font-family:"Segoe UI",Tahoma,Verdana,sans-serif;
  background-image:url("https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg");
  background-size:cover;
  background-position:center;
  color:#111;
}
.layout{display:flex;height:100vh;padding:24px;gap:20px}
.sidebar{
  width:260px;
  background:var(--glass-bg);
  backdrop-filter:blur(14px);
  box-shadow:var(--glass-shadow);
  border-radius:20px;
  padding:24px 18px;
}
.sidebar h2{text-align:center;margin-bottom:22px}
.nav a{
  display:flex;
  align-items:center;
  gap:10px;
  padding:12px 16px;
  border-radius:12px;
  margin-bottom:8px;
  font-weight:600;
  text-decoration:none;
  color:#111;
}
.nav a:hover,.nav a.active{
  background:rgba(0,0,0,.85);
  color:#fff;
}
.main{flex:1;display:flex;flex-direction:column;gap:20px}
.topbar{
  background:var(--glass-bg);
  backdrop-filter:blur(14px);
  box-shadow:var(--glass-shadow);
  border-radius:18px;
  padding:16px 22px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  position:relative;
  z-index:1000;
}
.profile{position:relative}
.profile-btn{
  display:flex;
  align-items:center;
  gap:8px;
  padding:8px 14px;
  border-radius:999px;
  background:rgba(255,255,255,.55);
  border:1px solid rgba(0,0,0,.15);
  font-weight:700;
  cursor:pointer;
}
.profile-menu{
  position:absolute;
  right:0;
  top:54px;
  width:260px;
  background:var(--glass-bg);
  backdrop-filter:blur(14px);
  box-shadow:var(--glass-shadow);
  border-radius:16px;
  padding:14px;
  display:none;
  z-index:9999;
}
.profile-menu.show{display:block}
.logout-btn{
  width:100%;
  border:none;
  background:#e53935;
  color:#fff;
  padding:10px;
  border-radius:10px;
  font-weight:700;
  cursor:pointer;
}
.content{
  flex:1;
  background:var(--glass-bg);
  backdrop-filter:blur(14px);
  box-shadow:var(--glass-shadow);
  border-radius:22px;
  padding:28px;
  overflow:auto;
}
.stats-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:22px;
}
.stat-box{
  background:rgba(255,255,255,.65);
  border-radius:22px;
  padding:24px;
  box-shadow:0 18px 35px rgba(0,0,0,.18);
  text-align:center;
}
.circle{
  width:120px;
  height:120px;
  border-radius:50%;
  margin:14px auto;
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  background:#fff;
  animation: beat var(--beat-speed) infinite ease-in-out;
}
.circle span{
  font-size:22px;
  font-weight:800;
}
@keyframes beat{
  0%{transform:scale(1)}
  30%{transform:scale(1.08)}
  60%{transform:scale(.96)}
  100%{transform:scale(1)}
}
.panel-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:18px;
  margin-top:18px;
}
.panel{
  background:rgba(255,255,255,.9);
  padding:16px;
  border-radius:12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  text-align:left;
}
.small{
  font-size:13px;color:#555;margin-top:8px;
}
.chart-wrap{max-width:900px;margin:18px auto}
@media (max-width: 1024px){
  .layout{height:auto;min-height:100vh;flex-direction:column}
  .sidebar{width:100%}
}
@media (max-width: 720px){
  .panel-grid{grid-template-columns:1fr}
}
      `}</style>

      <aside className="sidebar">
        <h2>VMS panel🐾</h2>
        <nav className="nav">
          <a className="active" href="/customer-dashboard">
            Dashboard
          </a>
          <a href="/appointments">Appointments</a>
          <a href="/receipts">Receipts</a>
          <a href="/overview">Overview</a>
        </nav>
      </aside>

      <main className="main">
        <div className="topbar">
          <h1>Client Dashboard — VMS</h1>
          <div className="profile">
            <div
              className="profile-btn"
              onClick={(e) => {
                e.stopPropagation();
                setProfileOpen((s) => !s);
              }}
            >
              {profile.full_name || profile.username} ▼
            </div>

            <div className={`profile-menu ${profileOpen ? "show" : ""}`}>
              <p>
                <strong>{profile.full_name || profile.username}</strong>
              </p>
              <p>Email: {profile.email || "-"}</p>
              <button
                className="logout-btn"
                onClick={() => {
                  logout("customer");
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <section className="content">
          <div className="stats-grid">
            <div className="stat-box" style={beatVars.patients}>
              <div>🐶 Patients</div>
              <div className="circle">
                <span>{displayStats.patients}</span>
              </div>
              <div className="small">Total patients in your account</div>
            </div>

            <div className="stat-box" style={beatVars.appointments}>
              <div>📅 Appointments</div>
              <div className="circle">
                <span>{displayStats.appointments}</span>
              </div>
              <div className="small">All scheduled appointments (past + future)</div>
            </div>

            <div className="stat-box" style={beatVars.receipts}>
              <div>🧾 Receipts</div>
              <div className="circle">
                <span>{displayStats.receipts}</span>
              </div>
              <div className="small">
                Receipts count — Paid: {stats.receipts_paid}, Total: {stats.receipts_total.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="panel-grid">
            <div className="panel">
              <h3>Quick summary</h3>
              <p className="small">
                Showing data for: <strong>{profile.full_name}</strong> ({profile.client_id})
              </p>

              <ul className="small">
                <li>Patients: {stats.patients}</li>
                <li>Appointments: {stats.appointments}</li>
                <li>
                  Receipts: {stats.receipts} (Paid: {stats.receipts_paid})
                </li>
                <li>Total received amount: {stats.receipts_total.toFixed(2)}</li>
              </ul>
            </div>

            <div className="panel">
              <h3>Monthly visits</h3>
              <div className="small">Visits per month (by visit_date)</div>
              <div className="chart-wrap">
                <canvas id="visitsChart" width="600" height="220" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
