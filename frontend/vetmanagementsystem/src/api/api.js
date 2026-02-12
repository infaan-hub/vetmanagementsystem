import axios from "axios";

const ACCESS_TOKEN = "PUT_YOUR_ACCESS_TOKEN_HERE";
const REFRESH_TOKEN = "PUT_YOUR_REFRESH_TOKEN_HERE";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Attach access token
API.interceptors.request.use((req) => {
  if (ACCESS_TOKEN) {
    req.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  }
  return req;
});

// Refresh token automatically
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          { refresh: REFRESH_TOKEN }
        );
        const newAccess = res.data.access;
        API.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
        return API(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/login";
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
export const getOverview = () => API.get("overview/"); // unified overview for doctor or customer

export default API;
