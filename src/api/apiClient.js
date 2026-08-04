import axios from 'axios';

const API_BASE_URL = 'https://c-footprint-backend.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken = null;
let refreshHandler = null; // async () => newAccessToken
let authFailureHandler = null; // () => void, called when refresh also fails

export const setAccessToken = (token) => {
  accessToken = token;
};

export const setAuthHandlers = (onRefresh, onFailure) => {
  refreshHandler = onRefresh;
  authFailureHandler = onFailure;
};

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const isAuthError = status === 401 || status === 403;

    if (isAuthError && !originalRequest._retry && refreshHandler) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshHandler();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (authFailureHandler) authFailureHandler();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;