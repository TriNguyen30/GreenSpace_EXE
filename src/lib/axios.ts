import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { axiosConfig } from "../config/axios.config.ts";

const instance: AxiosInstance = axios.create({
  ...axiosConfig,
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default instance;
