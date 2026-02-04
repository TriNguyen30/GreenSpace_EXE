import { axiosInstance } from "@/lib/axios";
import { LoginPayload } from "@/types/api";

export const login = (payload: LoginPayload) => {
    const formData = new URLSearchParams();

    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, String(value));
        }
    });

    return axiosInstance.post("/Auth/login", formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
};