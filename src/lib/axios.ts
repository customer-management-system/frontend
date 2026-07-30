import axios from 'axios';
import { API_URL } from './apiConfig';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let refreshPromise: Promise<{ token: string; refreshToken: string }> | null = null;

async function refreshTokens(): Promise<{ token: string; refreshToken: string }> {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken,
            });

            const { token, refreshToken: newRefreshToken } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', newRefreshToken);

            return { token, refreshToken: newRefreshToken };
        })().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}

function clearAuthAndRedirect() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { token } = await refreshTokens();
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return api(originalRequest);
            } catch {
                clearAuthAndRedirect();
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
