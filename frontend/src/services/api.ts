import axios from 'axios';

// Create axios instance with base configsuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for logging and auth token
api.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url);

        // Add admin token to requests if available
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
            config.headers.Authorization = `Bearer ${adminToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error(
            'API Error:',
            error.response?.status,
            error.response?.data
        );
        return Promise.reject(error);
    }
);

export default api;
