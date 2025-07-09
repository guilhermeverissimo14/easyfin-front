import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = 'https://easyfin-api.onrender.com/api/';

export const api: AxiosInstance = axios.create({
   baseURL: BASE_URL,
});

api.interceptors.request.use(
   (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('eas:token');
      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
   },
   (error) => Promise.reject(error)
);
