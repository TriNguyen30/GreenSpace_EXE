import { axiosInstance } from "@/lib/axios";
import { LoginPayload } from "@/types/api";

export const login = (payload: LoginPayload) => {
    return axiosInstance.post("/auth/login", payload);
};
