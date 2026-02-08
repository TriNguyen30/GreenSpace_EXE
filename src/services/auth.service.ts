import { axiosInstance } from "@/lib/axios";
import type {
  LoginPayload,
  ApiResponse,
  LoginResponseData,
  RegisterFinalizePayload,
  RegisterInitiatePayload,
  RegisterVerifyPayload,
  RegisterResendPayload,
} from "@/types/api";

export const login = async (payload: LoginPayload) => {
  const res = await axiosInstance.post<ApiResponse<LoginResponseData>>(
    "/Auth/login",
    payload,
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

export const registerInitiate = async (payload: RegisterInitiatePayload) => {
  const res = await axiosInstance.post("/Auth/register/initiate", payload);
  return res.data;
};

export const registerVerify = async (payload: RegisterVerifyPayload) => {
  const res = await axiosInstance.post("/Auth/register/verify", payload);
  return res.data;
};

export const registerResend = async (payload: RegisterResendPayload) => {
  const res = await axiosInstance.post("/Auth/register/resend", payload);
  return res.data;
};

export const registerFinalize = async (payload: RegisterFinalizePayload) => {
  const res = await axiosInstance.post("/Auth/register/finalize", payload);
  return res.data;
};
