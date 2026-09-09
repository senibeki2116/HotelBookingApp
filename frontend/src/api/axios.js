import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use(
  (config) => {
    const rawToken = localStorage.getItem("token");

    if (rawToken && rawToken !== "null" && rawToken !== "undefined") {
      const cleanToken = rawToken.replace(/^Bearer\s+/i, "").trim();

      if (cleanToken) {
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
