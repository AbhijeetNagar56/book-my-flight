import axios from "axios";

const api = axios.create({
    // Fallback added to ensure it defaults cleanly if env strings aren't injected perfectly
    baseURL: (import.meta.env.VITE_API_BASE_URL || "http://backend:5000") + "/api"
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token && config.headers) {
            // Adds Authorization headers matching exactly what authMiddleware.js expects
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;