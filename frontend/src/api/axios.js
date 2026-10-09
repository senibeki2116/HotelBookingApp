import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAuthToken = () => {
  if (typeof window === "undefined") return null;

  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  if (!token || token === "null" || token === "undefined") {
    return null;
  }

  return token.replace(/^Bearer\s+/i, "").trim();
};

API.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers.set
        ? config.headers.set("Authorization", `Bearer ${token}`)
        : (config.headers.Authorization = `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default API;
