import { axiosInstance } from "@/lib/axios";
import type { LoginPayload, ApiResponse, LoginResponseData, RegisterFinalizePayload, RegisterInitiatePayload, RegisterVerifyPayload, RegisterResendPayload } from "@/types/api";

export const login = async (payload: LoginPayload) => {
    const res = await axiosInstance.post<ApiResponse<LoginResponseData>>(
        "/Auth/login",
        payload
    );

    const data = res.data.data;

    return {
        token: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        user: {
            id: data.userId,
            email: data.email,
            name: data.fullName,
            role: data.role,
        },
    };
};


