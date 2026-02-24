// src/lib/axios.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: '', // Empty - frontend will use full paths like /api/properties/
});

// Public endpoints that should NOT send Authorization headers
const PUBLIC_ENDPOINTS = [
    '/api/auth/login/',
    '/api/auth/verify/',
    '/api/auth/register/',
];

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint =>
            config.url?.includes(endpoint)
        );

        if (isPublicEndpoint) {
            delete config.headers.Authorization;
        } else {
            const token = Cookies.get('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    }
    return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint =>
            originalRequest.url?.includes(endpoint)
        );

        if (isPublicEndpoint || originalRequest.url.includes('/api/auth/token/refresh/')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (typeof window === 'undefined') {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = Cookies.get('refresh_token');

            if (!refreshToken) {
                Cookies.remove('access_token');
                Cookies.remove('refresh_token');
                localStorage.removeItem('saudapakka-auth');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(
                    '/api/auth/token/refresh/',
                    { refresh: refreshToken }
                );

                if (response.status === 200) {
                    const { access } = response.data;
                    Cookies.set('access_token', access, { expires: 7 });
                    api.defaults.headers.common['Authorization'] = 'Bearer ' + access;
                    originalRequest.headers['Authorization'] = 'Bearer ' + access;
                    processQueue(null, access);
                    isRefreshing = false;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                Cookies.remove('access_token');
                Cookies.remove('refresh_token');
                localStorage.removeItem('saudapakka-auth');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
