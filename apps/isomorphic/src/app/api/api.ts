import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

//const BASE_URL = 'https://easyapp-api.mgioqc.easypanel.host/api/';
const BASE_URL = "http://localhost:3333/api/"; 

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
