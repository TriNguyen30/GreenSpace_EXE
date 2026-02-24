import axios from "axios";

import { axiosConfig } from "@/config/axios.config";



export const axiosInstance = axios.create(axiosConfig);



axiosInstance.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {

    config.headers.Authorization = `Bearer ${token}`;

  }

  return config;

});



let isRefreshing = false;

let failedQueue: any[] = [];



const processQueue = (error: any, token: string | null = null) => {

  failedQueue.forEach((prom) => {

    if (error) prom.reject(error);

    else prom.resolve(token);

  });

  failedQueue = [];

};



axiosInstance.interceptors.response.use(

  (res) => res,

  async (error) => {

    const originalRequest = error.config;



    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {

        return new Promise((resolve, reject) => {

          failedQueue.push({ resolve, reject });

        }).then((token) => {

          originalRequest.headers.Authorization = `Bearer ${token}`;

          return axiosInstance(originalRequest);

        });

      }



      originalRequest._retry = true;

      isRefreshing = true;



      try {

        const refreshToken = localStorage.getItem("refreshToken");

        const res = await axios.post("/Auth/refresh", { refreshToken });



        const data = res.data.data;



        localStorage.setItem("token", data.accessToken);

        localStorage.setItem("refreshToken", data.refreshToken);



        axiosInstance.defaults.headers.Authorization = `Bearer ${data.accessToken}`;

        processQueue(null, data.accessToken);



        return axiosInstance(originalRequest);

      } catch (err) {

        processQueue(err, null);

        localStorage.clear();

        window.location.href = "/login";

        return Promise.reject(err);

      } finally {

        isRefreshing = false;

      }

    }



    return Promise.reject(error);

  },

);

