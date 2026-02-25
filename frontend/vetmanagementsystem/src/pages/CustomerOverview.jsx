import React, { useEffect, useState } from "react";
import API from "../api";
import { generatePatientReportPdf, loadPatientReportData } from "../utils/patientReportPdf";

export default function CustomerOverview() {
  const [data, setData] = useState({
    allergies: [],
    visits: [],
    vitals: [],
    medical_notes: [],
    medications: [],
    documents: [],
    treatments: [],
  });
  const [activeTab, setActiveTab] = useState("allergies");
  const [menuOpen, setMenuOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function toList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
  }

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError("");
      try {
        const endpoints = {
          allergies: "/allergies/",
          visits: "/visits/",
          vitals: "/vitals/",
          medical_notes: "/medical-notes/",
          medications: "/medications/",
          documents: "/documents/",
          treatments: "/treatments/",
        };

        const keys = Object.keys(endpoints);
        const [patientsRes, ...responses] = await Promise.allSettled([
          API.get("/patients/"),
          ...keys.map((k) => API.get(endpoints[k])),
        ]);

        if (patientsRes.status === "fulfilled") {
          const patientList = toList(patientsRes.value.data);
          setPatients(patientList);
          if (patientList.length === 1) {
            setSelectedPatientId(String(patientList[0].id ?? patientList[0].patient_id));
          }
        } else {
          setPatients([]);
        }

        const next = { ...data };
        keys.forEach((k, idx) => {
          if (responses[idx].status === "fulfilled") {
            next[k] = toList(responses[idx].value.data);
          } else {
            next[k] = [];
          }
        });

        setData(next);
      } catch (err) {
        console.error(err);
        setError("Failed to load overview data.");
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const username = localStorage.getItem("username") || "Customer";
  const email = localStorage.getItem("email") || "Not available";

  async function handleDownloadPdf() {
    if (!selectedPatientId) {
      setError("Select patient first");
      return;
    }
    setPdfLoading(true);
    setError("");
    try {
      const { patient, client, sections } = await loadPatientReportData(API, selectedPatientId);
      await generatePatientReportPdf({ patient, client, sections });
    } catch (err) {
      console.error(err);
      setError("Failed to download PDF report");
    } finally {
      setPdfLoading(false);
    }
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
.layout{display:flex;height:100vh;padding:24px;gap:20px}
.sidebar{width:260px;background:var(--glass-bg);backdrop-filter:blur(14px);box-shadow:var(--glass-shadow);border-radius:20px;padding:24px 18px}
.sidebar h2{text-align:center;margin-bottom:22px}
.nav a{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:12px;margin-bottom:8px;font-weight:600;text-decoration:none;color:#111}
.nav a:hover,.nav a.active{background:rgba(0,0,0,.85);color:#fff}
.main{flex:1;display:flex;flex-direction:column;gap:20px}
.topbar{background:var(--glass-bg);backdrop-filter:blur(14px);box-shadow:var(--glass-shadow);border-radius:18px;padding:16px 22px;display:flex;justify-content:space-between;align-items:center;position:relative;z-index:10}
.topbar h1{margin:0;font-size:22px}
.profile{position:relative}
.profile-btn{display:flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.45);border:1px solid rgba(0,0,0,.15);font-weight:600;cursor:pointer}
.profile-menu{position:absolute;right:0;top:54px;width:240px;background:var(--glass-bg);backdrop-filter:blur(14px);box-shadow:var(--glass-shadow);border-radius:14px;padding:16px;display:none;z-index:9999}
.profile-menu.show{display:block}
.profile-menu p{margin:0 0 8px;font-size:14px}
.profile-menu a{display:block;margin-top:10px;padding:10px;border-radius:10px;background:rgba(0,0,0,.85);color:#fff;text-align:center;text-decoration:none;font-weight:700}
.content{flex:1;background:var(--glass-bg);backdrop-filter:blur(14px);box-shadow:var(--glass-shadow);border-radius:22px;padding:28px;overflow:auto}
.overview-section{margin-top:20px}
.overview-section h2{font-size:20px;font-weight:700;margin-bottom:16px}
.overview-table{width:100%;border-collapse:collapse;background:rgba(255,255,255,.65);backdrop-filter:blur(14px);border-radius:12px;overflow:hidden;box-shadow:0 18px 35px rgba(0,0,0,.18)}
.overview-table th, .overview-table td{padding:12px 16px;text-align:left;border-bottom:1px solid rgba(0,0,0,.1)}
.overview-table th{background:rgba(11,92,255,.1);font-weight:700}
.overview-table tr:hover{background:rgba(0,0,0,.05);cursor:pointer}
.section-tabs{display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap}
.section-tab{padding:8px 16px;border-radius:999px;background:rgba(255,255,255,.6);cursor:pointer;font-weight:600;transition:.25s;border:none}
.section-tab.active{background:var(--primary);color:#fff}
      `}</style>

      <aside className="sidebar">
        <h2>Veterinary Management System panel🐾</h2>
        <nav className="nav">
          <a href="/customer-dashboard">Dashboard</a>
          <a className="active" href="/overview">
            Overview
          </a>
          <a href="/appointments">Appointment</a>
          <a href="/receipts">Receipts</a>
        </nav>
      </aside>

      <main className="main">
        <div className="topbar">
          <h1>Veterinary Management System Customer Overview 🐾</h1>
          <p className="page-desc">A clear snapshot of patient care for every client.</p>
          <div className="profile">
            <button className="profile-btn" id="profileBtn" onClick={() => setMenuOpen((v) => !v)}>
              {username}
            </button>
            <div className={`profile-menu ${menuOpen ? "show" : ""}`} id="profileMenu">
              <p>
                <strong>Name</strong>
                <br />
                {username}
              </p>
              <p>
                <strong>Email</strong>
                <br />
                {email}
              </p>
              <a href="/logout?role=customer">Logout</a>
            </div>
          </div>
        </div>

        <section className="content">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)}>
              <option value="">Select patient for PDF</option>
              {patients.map((p) => (
                <option key={p.id ?? p.patient_id} value={p.id ?? p.patient_id}>
                  {p.name || p.patient_id || p.id}
                </option>
              ))}
            </select>
            <button type="button" className="section-tab active" onClick={handleDownloadPdf} disabled={pdfLoading}>
              {pdfLoading ? "Generating PDF..." : "Download Full PDF"}
            </button>
          </div>

          <div className="section-tabs">
            <button className={`section-tab ${activeTab === "allergies" ? "active" : ""}`} onClick={() => setActiveTab("allergies")}>
              Allergies
            </button>
            <button className={`section-tab ${activeTab === "visits" ? "active" : ""}`} onClick={() => setActiveTab("visits")}>
              Visits
            </button>
            <button className={`section-tab ${activeTab === "vitals" ? "active" : ""}`} onClick={() => setActiveTab("vitals")}>
              Vitals
            </button>
            <button className={`section-tab ${activeTab === "medical_notes" ? "active" : ""}`} onClick={() => setActiveTab("medical_notes")}>
              Medical Notes
            </button>
            <button className={`section-tab ${activeTab === "medications" ? "active" : ""}`} onClick={() => setActiveTab("medications")}>
              Medications
            </button>
            <button className={`section-tab ${activeTab === "documents" ? "active" : ""}`} onClick={() => setActiveTab("documents")}>
              Documents
            </button>
            <button className={`section-tab ${activeTab === "treatments" ? "active" : ""}`} onClick={() => setActiveTab("treatments")}>
              Treatments
            </button>
          </div>

          {loading ? <p>Loading overview...</p> : null}
          {error ? <p style={{ color: "crimson", fontWeight: 700 }}>{error}</p> : null}

          {activeTab === "allergies" ? (
            <div className="overview-section" id="allergies-tab">
              <h2>Allergies 🐾</h2>
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Severity</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {data.allergies.length ? (
                    data.allergies.map((allergy, idx) => (
                      <tr key={allergy.id ?? `allergy-${idx}`}>
                        <td>{allergy.patient_name || allergy.patient?.name || allergy.patient || "-"}</td>
                        <td>{allergy.severity_level || "-"}</td>
                        <td>{allergy.description || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>No allergies found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {activeTab === "visits" ? (
            <div className="overview-section" id="visits-tab">
              <h2>Visits 🐾</h2>
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.visits.length ? (
                    data.visits.map((visit, idx) => (
                      <tr key={visit.id ?? `visit-${idx}`}>
                        <td>{visit.visit_date ? new Date(visit.visit_date).toLocaleString() : "-"}</td>
                        <td>{visit.veterinarian_name || visit.veterinarian?.full_name || visit.veterinarian || "-"}</td>
                        <td>{visit.notes || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>No visits found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {activeTab === "vitals" ? (
            <div className="overview-section" id="vitals-tab">
              <h2>Vitals 🐾</h2>
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Weight (lbs)</th>
                    <th>Temperature</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.vitals.length ? (
                    data.vitals.map((vital, idx) => (
                      <tr key={vital.id ?? `vital-${idx}`}>
                        <td>{vital.recorded_at ? new Date(vital.recorded_at).toLocaleString() : "-"}</td>
                        <td>{vital.weight_lbs ?? "-"}</td>
                        <td>{vital.temperature ?? "-"}</td>
                        <td>{vital.notes || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>No vitals found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {activeTab === "medical_notes" ? (
            <div className="overview-section" id="medical_notes-tab">
              <h2>Medical Notes 🐾</h2>
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {data.medical_notes.length ? (
                    data.medical_notes.map((note, idx) => (
                      <tr key={note.id ?? `note-${idx}`}>
                        <td>{note.created_at ? new Date(note.created_at).toLocaleString() : "-"}</td>
                        <td>{note.veterinarian_name || note.veterinarian || "-"}</td>
                        <td>{note.note || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>No medical notes found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {activeTab === "medications" ? (
            <div className="overview-section" id="medications-tab">
              <h2>Medications 🐾</h2>
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {data.medications.length ? (
                    data.medications.map((med, idx) => (
                      <tr key={med.id ?? `med-${idx}`}>
                        <td>{med.name || "-"}</td>
                        <td>{med.dosage || "-"}</td>
                        <td>{med.frequency || "-"}</td>
                        <td>{med.duration || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>No medications found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {activeTab === "documents" ? (
            <div className="overview-section" id="documents-tab">
              <h2>Documents 🐾</h2>
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Issued Date</th>
                    <th>File</th>
                  </tr>
                </thead>
                <tbody>
                  {data.documents.length ? (
                    data.documents.map((doc, idx) => (
                      <tr key={doc.id ?? `doc-${idx}`}>
                        <td>{doc.document_type || doc.title || "-"}</td>
                        <td>{doc.issued_date || "-"}</td>
                        <td>{doc.file ? <a href={doc.file} target="_blank" rel="noreferrer">View</a> : "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>No documents found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {activeTab === "treatments" ? (
            <div className="overview-section" id="treatments-tab">
              <h2>Treatments 🐾</h2>
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {data.treatments.length ? (
                    data.treatments.map((treatment, idx) => (
                      <tr key={treatment.id ?? `treat-${idx}`}>
                        <td>{treatment.date || treatment.follow_up_date || "-"}</td>
                        <td>{treatment.veterinarian || "-"}</td>
                        <td>{treatment.description || treatment.treatment_description || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>No treatments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
