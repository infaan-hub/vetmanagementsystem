import axios from "axios";

// ------------------
// Tokens (from localStorage)
// ------------------
let ACCESS_TOKEN = localStorage.getItem("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcwOTk5MjgxLCJpYXQiOjE3NzA5OTU2ODEsImp0aSI6IjUwMTg2MWZiZTAwMjQ2YTc4NTRiNjVhMDIzYjY3YjJmIiwidXNlcl9pZCI6IjEifQ.e8NP2G3fFoKhMGPIR29o2KhIspksCazr_3O5h779VRE") || null;
let REFRESH_TOKEN = localStorage.getItem("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MTA4MjA4MSwiaWF0IjoxNzcwOTk1NjgxLCJqdGkiOiI2N2M2YjgyZmY4MjU0OGM3ODFlNjIwMmJhOWM0ZWIzZSIsInVzZXJfaWQiOiIxIn0.-OWtEJ3S491jIgYqmXhDwdoFrDEJ4v4Ar8DYpj5Lg6w") || null;

// ------------------
// Axios instance
// ------------------
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/", // change if backend URL is different
});

// ------------------
// Request interceptor to attach access token
// ------------------
API.interceptors.request.use(
  (req) => {
    ACCESS_TOKEN = localStorage.getItem("access_token") || null;
    REFRESH_TOKEN = localStorage.getItem("refresh_token") || null;

    if (ACCESS_TOKEN) {
      req.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

// ------------------
// Response interceptor to handle 401 and refresh token
// ------------------
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      REFRESH_TOKEN = localStorage.getItem("refresh_token");
      if (!REFRESH_TOKEN) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          { refresh: REFRESH_TOKEN }
        );

        ACCESS_TOKEN = res.data.access;
        localStorage.setItem("access_token", ACCESS_TOKEN);

        originalRequest.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
        return API(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// ------------------
// API Functions
// ------------------
export const getPatients = () => API.get("patients/");
export const getVisits = () => API.get("visits/");
export const getClients = () => API.get("clients/");
export const getAppointments = () => API.get("appointments/");
export const getReceipts = () => API.get("receipts/");
export const getMedications = () => API.get("medications/");
export const getDocuments = () => API.get("documents/");
export const getAllergies = () => API.get("allergies/");
export const getTreatments = () => API.get("treatments/");
export const getOverview = () => API.get("overview_customer/"); // client overview

// ------------------
// Set tokens after login
// ------------------
export function setTokens(access, refresh) {
  ACCESS_TOKEN = access || null;
  REFRESH_TOKEN = refresh || null;
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}

export default API;
