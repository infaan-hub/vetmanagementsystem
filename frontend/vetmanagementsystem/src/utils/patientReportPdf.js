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
    const raw = localStorage.getItem("patientPhotoCache");
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

function getPatientPhotoData(patient) {
  if (patient?.photo_data && String(patient.photo_data).startsWith("data:image/")) {
    return String(patient.photo_data);
  }
  return getCachedPatientPhoto(patient);
}

function getDataUrlFormat(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return "";
  const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);/);
  return match ? match[1].toLowerCase() : "";
}

function normalizeFormatForPdf(fmt) {
  if (fmt === "jpeg" || fmt === "jpg") return "JPEG";
  if (fmt === "png") return "PNG";
  if (fmt === "webp") return "WEBP";
  return "";
}

async function normalizePhotoForPdf(dataUrl) {
  const fmt = normalizeFormatForPdf(getDataUrlFormat(dataUrl));
  if (fmt) return { dataUrl, format: fmt };
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.9), format: "JPEG" });
      } catch (_err) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
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
  let y = 38;

  const colors = {
    black: [10, 10, 10],
    white: [255, 255, 255],
    red: [186, 45, 45],
    softGray: [242, 244, 246],
    line: [220, 224, 228],
  };

  function ensureSpace(lines = 1) {
    if (y + lines * 18 > pageHeight - 50) {
      doc.addPage();
      y = 40;
    }
  }

  function drawHeader() {
    doc.setFillColor(...colors.black);
    doc.rect(0, 0, pageWidth, 90, "F");
    doc.setFillColor(...colors.red);
    doc.rect(0, 90, pageWidth, 4, "F");

    doc.setTextColor(...colors.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Veterinary Management System", marginX, 36);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Premium Patient Report", marginX, 56);

    doc.setTextColor(...colors.red);
    doc.text("Confidential Medical Record", pageWidth - marginX, 56, { align: "right" });

    doc.setTextColor(...colors.black);
    y = 120;
  }

  function drawSectionTitle(title) {
    ensureSpace(2);
    doc.setFillColor(...colors.softGray);
    doc.rect(marginX, y - 14, maxWidth, 24, "F");
    doc.setTextColor(...colors.black);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, marginX + 12, y + 2);
    y += 26;
  }

  function drawKeyValueTable(rows) {
    const labelW = 150;
    const valueW = maxWidth - labelW;
    const rowH = 18;

    rows.forEach(([label, value]) => {
      ensureSpace(1.5);
      doc.setDrawColor(...colors.line);
      doc.rect(marginX, y - 12, maxWidth, rowH, "S");

      doc.setTextColor(...colors.black);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label, marginX + 8, y + 2);

      doc.setFont("helvetica", "normal");
      const wrapped = doc.splitTextToSize(String(value || "-"), valueW - 12);
      doc.text(wrapped, marginX + labelW + 6, y + 2);

      y += rowH;
    });
    y += 8;
  }

  function drawTableHeader(cols) {
    const total = cols.reduce((s, c) => s + c.w, 0);
    const scale = maxWidth / total;
    let x = marginX;
    doc.setFillColor(...colors.red);
    doc.rect(marginX, y - 14, maxWidth, 20, "F");
    doc.setTextColor(...colors.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    cols.forEach((c) => {
      const w = c.w * scale;
      doc.text(c.label, x + 6, y);
      x += w;
    });
    y += 14;
  }

  function drawTableRows(cols, rows) {
    const total = cols.reduce((s, c) => s + c.w, 0);
    const scale = maxWidth / total;
    rows.forEach((row, idx) => {
      ensureSpace(2);
      const rowHeight = 18;
      doc.setDrawColor(...colors.line);
      doc.rect(marginX, y - 12, maxWidth, rowHeight, "S");
      if (idx % 2 === 0) {
        doc.setFillColor(...colors.softGray);
        doc.rect(marginX, y - 12, maxWidth, rowHeight, "F");
      }
      let x = marginX;
      doc.setTextColor(...colors.black);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      cols.forEach((c) => {
        const w = c.w * scale;
        const text = String(row[c.key] || "-");
        const wrapped = doc.splitTextToSize(text, w - 10);
        doc.text(wrapped, x + 6, y);
        x += w;
      });
      y += rowHeight;
    });
    y += 10;
  }

  drawHeader();

  const cachedPhoto = getPatientPhotoData(patient);
  let photoBottom = 120;
  if (cachedPhoto) {
    try {
      const normalized = await normalizePhotoForPdf(cachedPhoto);
      if (!normalized) throw new Error("unsupported photo format");
      const passportW = 110;
      const passportH = 140;
      const photoX = pageWidth - marginX - passportW;
      const photoY = 108;
      doc.setFillColor(...colors.white);
      doc.rect(photoX - 6, photoY - 6, passportW + 12, passportH + 12, "F");
      doc.addImage(normalized.dataUrl, normalized.format, photoX, photoY, passportW, passportH);
      photoBottom = photoY + passportH + 12;
    } catch (_err) {}
  }
  y = Math.max(y, photoBottom + 8);

  drawSectionTitle("Patient & Client Details");
  drawKeyValueTable([
    ["Patient Name", patient.name || "-"],
    ["Patient ID", patient.patient_id || patient.id || "-"],
    ["Species", patient.species || "-"],
    ["Breed", patient.breed || "-"],
    ["Gender", patient.gender || "-"],
    ["Date of Birth", patient.date_of_birth || "-"],
    ["Color", patient.color || "-"],
    ["Weight (kg)", patient.weight_kg || "-"],
    ["Client Name", client?.full_name || client?.name || client?.username || "-"],
    ["Client Phone", client?.phone || client?.user?.phone || "-"],
    ["Client Address", client?.address || client?.user?.address || "-"],
    ["Client Location", client?.location || "-"],
    ["Client Email", client?.email || "-"],
    ["Generated At", new Date().toLocaleString()],
  ]);

  const orderedSections = [
    ["allergies", "Allergies", [
      { label: "Severity", key: "severity", w: 80 },
      { label: "Description", key: "description", w: 420 },
    ]],
    ["visits", "Visits", [
      { label: "Date", key: "date", w: 120 },
      { label: "Status", key: "status", w: 120 },
      { label: "Notes", key: "notes", w: 260 },
    ]],
    ["vitals", "Vitals", [
      { label: "Recorded", key: "recorded", w: 150 },
      { label: "Temp", key: "temp", w: 70 },
      { label: "HR", key: "hr", w: 60 },
      { label: "RR", key: "rr", w: 60 },
      { label: "Weight", key: "weight", w: 120 },
    ]],
    ["medical_notes", "Medical Notes", [
      { label: "Date", key: "date", w: 120 },
      { label: "Note", key: "note", w: 380 },
    ]],
    ["medications", "Medications", [
      { label: "Name", key: "name", w: 160 },
      { label: "Dosage", key: "dosage", w: 120 },
      { label: "Frequency", key: "frequency", w: 120 },
      { label: "Duration", key: "duration", w: 100 },
    ]],
    ["documents", "Documents", [
      { label: "Title", key: "title", w: 220 },
      { label: "Issued", key: "issued", w: 120 },
      { label: "Type", key: "type", w: 160 },
    ]],
    ["treatments", "Treatments", [
      { label: "Name", key: "name", w: 160 },
      { label: "Date", key: "date", w: 120 },
      { label: "Description", key: "desc", w: 220 },
    ]],
  ];

  orderedSections.forEach(([key, title, cols]) => {
    const rows = sections[key] || [];
    drawSectionTitle(`${title} (${rows.length})`);
    if (!rows.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...colors.black);
      doc.text("No records available.", marginX + 8, y);
      y += 18;
      return;
    }

    drawTableHeader(cols);

    const tableRows = rows.map((row) => {
      if (key === "allergies") {
        return {
          severity: row.severity_level || "-",
          description: row.description || row.notes || "-",
        };
      }
      if (key === "visits") {
        return {
          date: row.visit_date || "-",
          status: row.visit_status || "-",
          notes: row.notes || row.reason || "-",
        };
      }
      if (key === "vitals") {
        return {
          recorded: row.recorded_at || "-",
          temp: row.temperature ?? "-",
          hr: row.heart_rate ?? "-",
          rr: row.respiratory_rate ?? row.respiration ?? "-",
          weight: row.weight_kg ?? row.weight_lbs ?? "-",
        };
      }
      if (key === "medical_notes") {
        return {
          date: row.created_at || "-",
          note: row.note || row.body || "-",
        };
      }
      if (key === "medications") {
        return {
          name: row.name || "-",
          dosage: row.dosage || "-",
          frequency: row.frequency || "-",
          duration: row.duration || "-",
        };
      }
      if (key === "documents") {
        return {
          title: row.title || row.document_type || "Document",
          issued: row.issued_date || row.created_at || "-",
          type: row.document_type || "-",
        };
      }
      if (key === "treatments") {
        return {
          name: row.name || row.diagnosis || "Treatment",
          date: row.date || row.follow_up_date || "-",
          desc: row.description || row.treatment_description || "-",
        };
      }
      return {};
    });

    drawTableRows(cols, tableRows);
  });

  const clinicContact = {
    email: "infaanhameed@gmail.com",
    phone: "+255 711 252 758",
    address: "Morrocco Street, Fuoni, Zanzibar",
    location: "Zanzibar",
  };

  drawSectionTitle("Clinic Contact");
  drawKeyValueTable([
    ["Clinic Email", clinicContact.email],
    ["Clinic Phone", clinicContact.phone],
    ["Clinic Address", clinicContact.address],
    ["Clinic Location", clinicContact.location],
  ]);

  const safeName = String(patient.name || `patient-${patient.id || "report"}`).replace(/[^\w.-]+/g, "_");
  doc.save(`${safeName}_full_report.pdf`);
}
