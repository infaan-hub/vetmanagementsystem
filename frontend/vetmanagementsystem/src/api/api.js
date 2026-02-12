import axios from "axios";

// ------------------
// Tokens (from localStorage)
// ------------------
let ACCESS_TOKEN = localStorage.getItem("access_token") || null;
let REFRESH_TOKEN = localStorage.getItem("refresh_token") || null;


// ------------------
// Axios instance
// ------------------
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/", // change if your backend URL is different
});

// ------------------
// Request interceptor to attach access token
// ------------------
API.interceptors.request.use(
  (req) => {
    // Refresh token from localStorage on each request
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

    // Retry only once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // if no refresh token, force logout
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

        // update tokens in memory & localStorage
        ACCESS_TOKEN = res.data.access;
        localStorage.setItem("access_token", ACCESS_TOKEN);

        // retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
        return API(originalRequest);
      } catch (err) {
        // refresh failed -> logout
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
export const getOverview = () => API.get("overview/"); // unified overview

// ------------------
// Helper to set tokens after login
// ------------------
export function setTokens(access, refresh) {
  ACCESS_TOKEN = access || null;
  REFRESH_TOKEN = refresh || null;
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}

export default API;
