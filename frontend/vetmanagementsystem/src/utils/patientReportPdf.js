const SECTION_ENDPOINTS = {
  allergies: "/allergies/",
  visits: "/visits/",
  vitals: "/vitals/",
  medical_notes: "/medical-notes/",
  medications: "/medications/",
  documents: "/documents/",
  treatments: "/treatments/",
};

function toList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function normalizeId(v) {
  if (v === null || v === undefined || v === "") return "";
  return String(v);
}

export function getPatientIdFromRecord(sectionKey, item) {
  if (!item || typeof item !== "object") return "";
  const direct = item.patient?.id ?? item.patient_id ?? item.patient ?? item.patient_pk;
  if (direct !== undefined && direct !== null && direct !== "") return normalizeId(direct);

  const visit = item.visit;
  if (visit && typeof visit === "object") {
    const fromVisit = visit.patient?.id ?? visit.patient_id ?? visit.patient;
    if (fromVisit !== undefined && fromVisit !== null && fromVisit !== "") return normalizeId(fromVisit);
  }
  return "";
}

export async function loadPatientReportData(API, patientId) {
  const [patientsRes, clientsRes, ...sectionResults] = await Promise.allSettled([
    API.get("/patients/"),
    API.get("/clients/"),
    ...Object.values(SECTION_ENDPOINTS).map((url) => API.get(url)),
  ]);

  const patients = patientsRes.status === "fulfilled" ? toList(patientsRes.value.data) : [];
  const clients = clientsRes.status === "fulfilled" ? toList(clientsRes.value.data) : [];
  const patient = patients.find((p) => normalizeId(p.id ?? p.patient_id) === normalizeId(patientId));

  const sections = {};
  Object.keys(SECTION_ENDPOINTS).forEach((key, idx) => {
    const r = sectionResults[idx];
    const items = r.status === "fulfilled" ? toList(r.value.data) : [];
    sections[key] = items.filter((x) => normalizeId(getPatientIdFromRecord(key, x)) === normalizeId(patientId));
  });

  const clientId = patient?.client?.id ?? patient?.client_id ?? patient?.client;
  const client = clients.find((c) => normalizeId(c.id ?? c.client_id) === normalizeId(clientId)) || null;

  return { patient, client, sections };
}

function sectionLine(sectionKey, row) {
  if (sectionKey === "allergies") {
    return `Severity: ${row.severity_level || "-"} | ${row.description || row.notes || "-"}`;
  }
  if (sectionKey === "visits") {
    return `Date: ${row.visit_date || "-"} | Status: ${row.visit_status || "-"} | Notes: ${row.notes || row.reason || "-"}`;
  }
  if (sectionKey === "vitals") {
    return `Recorded: ${row.recorded_at || "-"} | Temp: ${row.temperature ?? "-"} | HR: ${row.heart_rate ?? "-"} | RR: ${row.respiratory_rate ?? "-"} | Weight: ${row.weight_kg ?? row.weight_lbs ?? "-"}`;
  }
  if (sectionKey === "medical_notes") {
    return `Date: ${row.created_at || "-"} | ${row.note || row.body || "-"}`;
  }
  if (sectionKey === "medications") {
    return `${row.name || "-"} | Dosage: ${row.dosage || "-"} | Frequency: ${row.frequency || "-"} | Duration: ${row.duration || "-"}`;
  }
  if (sectionKey === "documents") {
    return `${row.title || row.document_type || "Document"} | Date: ${row.issued_date || row.created_at || "-"}`;
  }
  if (sectionKey === "treatments") {
    return `${row.name || "Treatment"} | Date: ${row.date || row.follow_up_date || "-"} | ${row.description || row.treatment_description || "-"}`;
  }
  return JSON.stringify(row);
}

function getCachedPatientPhoto(patient) {
  try {
    const raw = sessionStorage.getItem("patientPhotoCache");
    if (!raw) return "";
    const cache = JSON.parse(raw);
    if (!cache || typeof cache !== "object") return "";
    const keys = [
      patient?.id,
      patient?.patient_id,
      patient?.patientId,
    ].filter(Boolean);
    for (const k of keys) {
      const hit = cache[String(k)];
      if (hit) return String(hit);
    }
  } catch (_err) {}
  return "";
}

async function ensureJsPdf() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return window.jspdf.jsPDF;
}

export async function generatePatientReportPdf({ patient, client, sections }) {
  if (!patient) throw new Error("Patient not found");
  const jsPDFClass = await ensureJsPdf();
  const doc = new jsPDFClass({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 40;
  const maxWidth = pageWidth - marginX * 2;
  let y = 44;

  function ensureSpace(lines = 1) {
    if (y + lines * 18 > pageHeight - 40) {
      doc.addPage();
      y = 44;
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Veterinary Management System", marginX, y);
  y += 24;

  const cachedPhoto = getCachedPatientPhoto(patient);
  if (cachedPhoto) {
    try {
      const passportW = 100;
      const passportH = 130;
      const photoX = pageWidth - marginX - passportW;
      const photoY = 30;
      doc.addImage(cachedPhoto, "JPEG", photoX, photoY, passportW, passportH);
    } catch (_err) {}
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const patientLines = [
    `Patient: ${patient.name || "-"}`,
    `Patient ID: ${patient.patient_id || patient.id || "-"}`,
    `Species: ${patient.species || "-"}   Breed: ${patient.breed || "-"}`,
    `Gender: ${patient.gender || "-"}   DOB: ${patient.date_of_birth || "-"}`,
    `Color: ${patient.color || "-"}   Weight: ${patient.weight_kg || "-"} kg`,
    `Client: ${client?.full_name || client?.name || client?.username || "-"}`,
    `Client Email: ${client?.email || "-"}`,
    `Generated At: ${new Date().toLocaleString()}`,
  ];
  patientLines.forEach((line) => {
    ensureSpace();
    doc.text(line, marginX, y);
    y += 16;
  });

  y += 8;
  const orderedSections = [
    ["allergies", "Allergies"],
    ["visits", "Visits"],
    ["vitals", "Vitals"],
    ["medical_notes", "Medical Notes"],
    ["medications", "Medications"],
    ["documents", "Documents"],
    ["treatments", "Treatments"],
  ];

  orderedSections.forEach(([key, title]) => {
    const rows = sections[key] || [];
    ensureSpace(2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`${title} (${rows.length})`, marginX, y);
    y += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (!rows.length) {
      ensureSpace();
      doc.text("- No records", marginX + 10, y);
      y += 14;
      return;
    }

    rows.forEach((row) => {
      const text = `- ${sectionLine(key, row)}`;
      const wrapped = doc.splitTextToSize(text, maxWidth - 10);
      ensureSpace(wrapped.length + 1);
      doc.text(wrapped, marginX + 10, y);
      y += wrapped.length * 12 + 4;
    });
    y += 4;
  });

  const safeName = String(patient.name || `patient-${patient.id || "report"}`).replace(/[^\w.-]+/g, "_");
  doc.save(`${safeName}_full_report.pdf`);
}
