import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:8000/api/',
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;