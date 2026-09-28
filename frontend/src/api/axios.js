import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ============================================
// ADD AUTH TOKEN TO EVERY REQUEST
// ============================================

API.interceptors.request.use(
  (config) => {
    // Your login stores the token as "accessToken"
    const rawToken = localStorage.getItem("accessToken");

    if (rawToken && rawToken !== "null" && rawToken !== "undefined") {
      const cleanToken = rawToken.replace(/^Bearer\s+/i, "").trim();

      if (cleanToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${cleanToken}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default API;
