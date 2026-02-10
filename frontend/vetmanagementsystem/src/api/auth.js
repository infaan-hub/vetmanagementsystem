import axios from "axios";

export const loginDoctor = async (username, password) => {
  return axios.post(
    "http://127.0.0.1:8000/admin/login/",
    { username, password },
    { withCredentials: true }
  );
};
