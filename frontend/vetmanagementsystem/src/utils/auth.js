export const setRole = (role) => localStorage.setItem("role", role);
export const getRole = () => localStorage.getItem("role"); // "doctor" or "customer"
export const logout = () => {
  localStorage.clear();
  window.location.href = "/login";
};
