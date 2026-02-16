import React, { useEffect, useMemo, useRef, useState } from "react";
import API from "../api";

export default function DoctorDashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    visits: 0,
    treatments: 0,
  });
  const [displayStats, setDisplayStats] = useState({
    patients: 0,
    visits: 0,
    treatments: 0,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const didLoadRef = useRef(false);

  function toList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  }

  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;

    async function fetchData() {
      try {
        const [patientsRes, visitsRes, treatmentsRes] = await Promise.allSettled([
          API.get("/patients/"),
          API.get("/visits/"),
          API.get("/treatments/"),
        ]);

        const patients = patientsRes.status === "fulfilled" ? toList(patientsRes.value.data).length : 0;
        const visits = visitsRes.status === "fulfilled" ? toList(visitsRes.value.data).length : 0;
        const treatments = treatmentsRes.status === "fulfilled" ? toList(treatmentsRes.value.data).length : 0;

        setStats({ patients, visits, treatments });
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const keys = ["patients", "visits", "treatments"];
    const timers = [];

    keys.forEach((key) => {
      let current = 0;
      const target = stats[key] || 0;
      const step = Math.max(1, Math.floor(target / 25));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setDisplayStats((prev) => ({ ...prev, [key]: current }));
      }, 40);
      timers.push(timer);
    });

    return () => timers.forEach((t) => clearInterval(t));
  }, [stats]);

  const bpm = useMemo(() => {
    return {
      patients: Math.min(160, Math.max(50, (stats.patients / 200) * 120 || 50)),
      visits: Math.min(160, Math.max(50, (stats.visits / 150) * 120 || 50)),
      treatments: Math.min(160, Math.max(50, (stats.treatments / 150) * 120 || 50)),
    };
  }, [stats]);

  const username = localStorage.getItem("username") || "Doctor";
  const email = localStorage.getItem("email") || "Not available";

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    window.location.href = "/login";
  }

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

.layout{display:flex;min-height:100vh;padding:20px;gap:20px;overflow:auto}

.sidebar{
  width:clamp(220px, 24vw, 260px);
  background:var(--glass-bg);
  backdrop-filter:blur(14px);
  box-shadow:var(--glass-shadow);
  border-radius:20px;
  padding:24px 18px;
  flex-shrink:0;
  max-height:calc(100vh - 40px);
  overflow:auto;
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

.main{flex:1;display:flex;flex-direction:column;gap:20px;min-width:0}

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

.profile-btn:hover{
  background:rgba(0,0,0,.85);
  color:#fff;
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

.profile-menu p{
  margin:0 0 10px;
  font-size:14px;
}

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

.logout-btn:hover{background:#c62828}

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
  grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
  gap:22px;
}

.stat-box{
  background:rgba(255,255,255,.65);
  border-radius:22px;
  padding:20px;
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

.circle::before{
  content:"";
  position:absolute;
  inset:-10px;
  border-radius:50%;
  border:3px solid rgba(255, 11, 11, 0.6);
  animation:pulse var(--beat-speed) infinite;
  filter: drop-shadow(0 0 6px rgba(229,57,53,.8));
}

@keyframes beat{
  0%{transform:scale(1)}
  30%{transform:scale(1.08)}
  60%{transform:scale(.96)}
  100%{transform:scale(1)}
}

@keyframes pulse{
  0%{opacity:.8;transform:scale(.9)}
  70%{opacity:0;transform:scale(1.25)}
  100%{opacity:0}
}

.wave{margin-top:10px;height:36px;overflow:hidden}
.wave svg{width:200%;height:36px}
.ecg{
  fill:none;
  stroke:#e53935;
  stroke-width:3;
  stroke-dasharray:240;
  animation:ecgMove var(--beat-speed) linear infinite;
  filter: drop-shadow(0 0 6px rgba(229,57,53,.8));
}
@keyframes ecgMove{
  from{stroke-dashoffset:0}
  to{stroke-dashoffset:-240}
}

@media (max-width: 960px){
  .layout{flex-direction:column;padding:14px}
  .sidebar{width:100%;max-height:none}
  .topbar{padding:12px 14px;flex-wrap:wrap;gap:10px}
  .content{padding:16px}
}

@media (max-width: 520px){
  .stats-grid{grid-template-columns:1fr}
  .circle{width:96px;height:96px}
}
      `}</style>

      <aside className="sidebar">
        <h2>VMS Doctor Panel🩺</h2>
        <nav className="nav">
          <a className="active" href="/doctor/">
            Dashboard
          </a>
          <a href="/overview/">Overview</a>
          <a href="/patients/">Patients</a>
          <a href="/allergies/">Allergies</a>
          <a href="/visits/">Visits</a>
          <a href="/vitals/">Vitals</a>
          <a href="/medical-notes/">Medical Notes</a>
          <a href="/medications/">Medications</a>
          <a href="/documents/">Documents</a>
          <a href="/treatments/">Treatments</a>
        </nav>
      </aside>

      <main className="main">
        <div className="topbar">
          <h1>Veterinary Management System 🐾</h1>

          <div className="profile">
            <button className="profile-btn" id="profileBtn" onClick={() => setMenuOpen((v) => !v)}>
              Dr. {username} ▼
            </button>

            <div className={`profile-menu ${menuOpen ? "show" : ""}`} id="profileMenu">
              <p>
                <strong>{username}</strong>
              </p>
              <p>Email: {email}</p>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        <section className="content">
          <div className="stats-grid">
            <div className="stat-box" style={{ "--beat-speed": `${60 / bpm.patients}s` }}>
              <div>🐶 Patients</div>
              <div className="circle">
                <span>{displayStats.patients}</span>
              </div>
              <div className="wave">
                <svg viewBox="0 0 300 40">
                  <path className="ecg" d="M0 20 L30 20 L40 10 L50 30 L60 20 L90 20 L100 10 L110 30 L120 20 L300 20" />
                </svg>
              </div>
            </div>

            <div className="stat-box" style={{ "--beat-speed": `${60 / bpm.visits}s` }}>
              <div>📅 Visits</div>
              <div className="circle">
                <span>{displayStats.visits}</span>
              </div>
              <div className="wave">
                <svg viewBox="0 0 300 40">
                  <path className="ecg" d="M0 20 L30 20 L40 8 L50 32 L60 20 L90 20 L100 8 L110 32 L120 20 L300 20" />
                </svg>
              </div>
            </div>

            <div className="stat-box" style={{ "--beat-speed": `${60 / bpm.treatments}s` }}>
              <div>💉 Treatments</div>
              <div className="circle">
                <span>{displayStats.treatments}</span>
              </div>
              <div className="wave">
                <svg viewBox="0 0 300 40">
                  <path className="ecg" d="M0 20 L30 20 L40 12 L50 28 L60 20 L90 20 L100 12 L110 28 L120 20 L300 20" />
                </svg>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
