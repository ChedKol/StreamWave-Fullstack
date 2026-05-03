// services/axios.ts
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: 'https://localhost:7032/api/'
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        
        // לוג לבדיקה - יופיע ב-Console לפני כל שליחה
        console.log("Checking token before request:", token ? "Found ✅" : "NOT FOUND ❌");

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;