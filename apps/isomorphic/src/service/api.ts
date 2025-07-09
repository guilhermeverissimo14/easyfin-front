import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/env.mjs';

// const BASE_URL = env.NEXT_PUBLIC_API_URL || 'https://minas-drones-api.onrender.com/api/';
const BASE_URL = env.NEXT_PUBLIC_API_URL || 'https://easyfin-api.onrender.com/api/';

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
