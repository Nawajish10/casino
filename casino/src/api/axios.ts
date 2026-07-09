import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_HOST_API || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);
