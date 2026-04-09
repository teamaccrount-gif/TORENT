import axios, { AxiosError, AxiosHeaders, type AxiosRequestConfig } from 'axios';
import { API_URLS } from './apiUrl';

const axiosInstance = axios.create();

const isAuthEndpoint = (url?: string | null) => {
  if (!url) {
    return false;
  }

  return url.includes('/api/v1/auth/login') || url.includes('/api/v1/auth/refresh');
};

const getAccessToken = () =>
  localStorage.getItem('accessToken') 
const getRefreshToken = () =>
  localStorage.getItem('refresh_token')
const clearAuthState = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refresh_token');
};

const dispatchLogout = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
};

const extractAccessToken = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }     

  const data = payload as Record<string, unknown>;
  const nestedData = data.data;

  if (nestedData && typeof nestedData === 'object') {
    const nested = nestedData as Record<string, unknown>;
    const token = nested.access_token ?? nested.accessToken ?? null;
    return typeof token === 'string' ? token : null;
  }

  const token = data.access_token ?? data.accessToken ?? null;
  return typeof token === 'string' ? token : null;
};

const extractRefreshToken = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const data = payload as Record<string, unknown>;
  const nestedData = data.data;

  if (nestedData && typeof nestedData === 'object') {
    const nested = nestedData as Record<string, unknown>;
    const token = nested.refresh_token ?? nested.refreshToken ?? null;
    return typeof token === 'string' ? token : null;
  }

  const token = data.refresh_token ?? data.refreshToken ?? null;
  return typeof token === 'string' ? token : null;
};

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    const requestUrl = response.config?.url;

    if (isAuthEndpoint(requestUrl)) {
      const accessToken = extractAccessToken(response.data);
      const refreshToken = extractRefreshToken(response.data);

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }

      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url;

    if (!originalRequest || status !== 401 || isAuthEndpoint(requestUrl)) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthState();
      dispatchLogout();
      return Promise.reject(error);
    }

    try {
      const refreshResponse = await axios.post(API_URLS.REFRESH, {
        refresh_token: refreshToken,
      });

      const newAccessToken = extractAccessToken(refreshResponse.data);
      const newRefreshToken = extractRefreshToken(refreshResponse.data);

      if (!newAccessToken) {
        clearAuthState();
        dispatchLogout();
        return Promise.reject(error);
      }

      localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken);
      }

      const retryHeaders = AxiosHeaders.from(originalRequest.headers as any);
      retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
      originalRequest.headers = retryHeaders;

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      clearAuthState();
      dispatchLogout();
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;
