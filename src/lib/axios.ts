import axios from 'axios';

// Create an instance of axios
const api = axios.create({
    baseURL: 'https://backend-fggt.onrender.com/api/v1', // Should be in .env in production
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for API calls
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized)
        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Call refresh endpoint directly using axios to satisfy the circular dependency or just import api?
                // Importing api might cause circular issues if we use it inside its own interceptor definitions depending on how it's structured.
                // But generally safe if we don't recurse. 
                // However, easier to just use fetch or a separate axios instance or just import axios.
                const response = await axios.post('https://backend-fggt.onrender.com/api/v1/auth/refresh', {
                    refreshToken
                });

                const { token, refreshToken: newRefreshToken } = response.data.data;

                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Update header and retry original request
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh failed - logout
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
