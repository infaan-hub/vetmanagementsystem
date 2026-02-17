import axios from "axios";

const configuredBackend =
  import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

const backendUrl = (
  configuredBackend || "https://veterinarymanagementsystem-backendpart.onrender.com"
).replace(/\/+$/, "");
const apiBaseUrl = `${backendUrl}/api/`;

let ACCESS_TOKEN = localStorage.getItem("access_token") || null;
let REFRESH_TOKEN = localStorage.getItem("refresh_token") || null;

// ------------------
// Axios instance
// ------------------
const API = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 60000,
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
    const isTimeout = error.code === "ECONNABORTED";
    const isNetworkError = error.message === "Network Error";

    if ((isTimeout || isNetworkError) && !originalRequest?._networkRetry) {
      originalRequest._networkRetry = true;
      return API(originalRequest);
    }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      REFRESH_TOKEN = localStorage.getItem("refresh_token");
      if (!REFRESH_TOKEN) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${backendUrl}/api/token/refresh/`,
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

export function clearTokens() {
  ACCESS_TOKEN = null;
  REFRESH_TOKEN = null;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export default API;
