import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  withCredentials: true, // REQUIRED for Django sessions
  headers: {
    'Content-Type': "application/json",
  },
});
/* =========================
   PATIENT APIs (FULL DATA)
========================= */

// GET all patients
export const getPatients = async () => {
  const response = await api.get("patients/");
  return response.data;
};

// GET single patient by ID
export const getPatientById = async (id) => {
  const response = await api.get(`patients/${id}/`);
  return response.data;
};

// CREATE patient (ALL fields + photo)
export const createPatient = async (patientData) => {
  const formData = new FormData();

  formData.append("patient_id", patientData.patient_id);
  formData.append("name", patientData.name);
  formData.append("species", patientData.species);
  if (patientData.breed) formData.append("breed", patientData.breed);
  formData.append("gender", patientData.gender);
  if (patientData.color) formData.append("color", patientData.color);
  if (patientData.date_of_birth) formData.append("date_of_birth", patientData.date_of_birth);
  if (patientData.weight_kg !== undefined && patientData.weight_kg !== null) {
    formData.append("weight_kg", patientData.weight_kg);
  }
  if (patientData.client !== undefined && patientData.client !== null) {
    formData.append("client", patientData.client);
  }

  if (patientData.photo) {
    formData.append("photo", patientData.photo);
  }

  const response = await api.post("patients/", formData);
  return response.data;
};

// UPDATE patient (ALL fields)
export const updatePatient = async (id, patientData) => {
  const formData = new FormData();

  if (patientData.patient_id !== undefined && patientData.patient_id !== null) formData.append("patient_id", patientData.patient_id);
  if (patientData.name !== undefined && patientData.name !== null) formData.append("name", patientData.name);
  if (patientData.species !== undefined && patientData.species !== null) formData.append("species", patientData.species);
  if (patientData.breed !== undefined && patientData.breed !== null) formData.append("breed", patientData.breed);
  if (patientData.gender !== undefined && patientData.gender !== null) formData.append("gender", patientData.gender);
  if (patientData.color !== undefined && patientData.color !== null) formData.append("color", patientData.color);
  if (patientData.date_of_birth !== undefined && patientData.date_of_birth !== null) formData.append("date_of_birth", patientData.date_of_birth);
  if (patientData.weight_kg !== undefined && patientData.weight_kg !== null) formData.append("weight_kg", patientData.weight_kg);
  if (patientData.client !== undefined && patientData.client !== null) formData.append("client", patientData.client);

  if (patientData.photo) {
    formData.append("photo", patientData.photo);
  }

  const response = await api.put(`patients/${id}/`, formData);
  return response.data;
};

// DELETE patient
export const deletePatient = async (id) => {
  const response = await api.delete(`patients/${id}/`);
  return response.data;
};

/* =========================
   CLIENT APIs
========================= */

// GET all clients
export const getClients = async () => {
  const response = await api.get("clients/");
  return response.data;
};

export default api;













