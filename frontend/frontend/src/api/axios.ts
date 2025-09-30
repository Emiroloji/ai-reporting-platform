import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // Burayı kendi backend adresine göre ayarla
  headers: {
    "Content-Type": "application/json",
  },
});

// Her istekten önce token eklemek istersen:
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;