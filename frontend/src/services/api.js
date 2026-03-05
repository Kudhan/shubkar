import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Add 10 second timeout
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle global errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle 401 Unauthorized (Session expired)
            if (error.response.status === 401) {
                toast.error('Session expired. Please login again.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            // Handle 500 Server Errors
            else if (error.response.status >= 500) {
                toast.error('Server error. Please try again later.');
            }
        } else if (error.request) {
            // Network error - server not reachable
            console.error('Network error - Server may be down:', error.message);
            toast.error('Unable to connect to server. Please check if the backend is running.');
        }
        return Promise.reject(error);
    }
);

export default api;
