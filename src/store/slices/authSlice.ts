import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { axiosInstance } from "@/lib/axios";
import {
  login,
  registerInitiate,
  registerVerify,
  registerResend,
  registerFinalize,
  passwordForgot,
  passwordResend,
  passwordVerify,
  passwordReset,
} from "@/services/auth.service";
import type {
  LoginPayload,
  RegisterInitiatePayload,
  RegisterVerifyPayload,
  RegisterResendPayload,
  RegisterFinalizePayload,
  PasswordForgotPayload,
  PasswordResendPayload,
  PasswordVerifyPayload,
  PasswordResetPayload,
} from "@/types/api";

/* =======================
   Types
======================= */

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
}

type RegisterStep = "email" | "otp" | "final" | "done";
type PasswordStep = "email" | "otp" | "reset" | "done";

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;

  registerStep: RegisterStep;
  registerMail: string | null;

  passwordStep: PasswordStep;
  passwordMail: string | null;
}

/* =======================
   Helpers
======================= */

const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem("user");
    if (!stored || stored === "undefined" || stored === "null") return null;
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

/* =======================
   Initial State
======================= */

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: getStoredUser(),
  loading: false,
  error: null,

  registerStep: "email",
  registerMail: null,

  passwordStep: "email",
  passwordMail: null,
};

/* =======================
   Thunks
======================= */

// ---------- LOGIN ----------
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      return await login(payload);
    } catch (err) {
      let message = "Đăng nhập thất bại";

      if (axios.isAxiosError(err)) {
        const rawMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message;

        if (rawMessage) {
          const lower = rawMessage.toLowerCase();
          if (
            lower.includes("invalid") ||
            lower.includes("wrong email") ||
            lower.includes("wrong password") ||
            lower.includes("credentials")
          ) {
            message = "Email hoặc mật khẩu không đúng";
          } else if (lower.includes("locked")) {
            message = "Tài khoản đã bị khóa";
          } else if (lower.includes("not verified")) {
            message = "Tài khoản chưa xác thực email";
          } else {
            message = rawMessage;
          }
        }
      }

      return rejectWithValue(message);
    }
  },
);

// ---------- REVOKE TOKEN ----------
export const revokeThunk = createAsyncThunk("auth/revoke", async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  await axiosInstance.post("/Auth/revoke", { refreshToken });
});

// ---------- REGISTER FLOW ----------
export const registerInitiateThunk = createAsyncThunk(
  "auth/register/initiate",
  async (payload: RegisterInitiatePayload, { rejectWithValue }) => {
    try {
      return await registerInitiate(payload);
    } catch {
      return rejectWithValue("Không thể gửi mã OTP");
    }
  },
);

export const registerVerifyThunk = createAsyncThunk(
  "auth/register/verify",
  async (payload: RegisterVerifyPayload, { rejectWithValue }) => {
    try {
      return await registerVerify(payload);
    } catch {
      return rejectWithValue("Mã OTP không hợp lệ");
    }
  },
);

export const registerResendThunk = createAsyncThunk(
  "auth/register/resend",
  async (payload: RegisterResendPayload, { rejectWithValue }) => {
    try {
      return await registerResend(payload);
    } catch {
      return rejectWithValue("Không thể gửi lại mã OTP");
    }
  },
);

export const registerFinalizeThunk = createAsyncThunk(
  "auth/register/finalize",
  async (payload: RegisterFinalizePayload, { rejectWithValue }) => {
    try {
      return await registerFinalize(payload);
    } catch {
      return rejectWithValue("Tạo tài khoản thất bại");
    }
  },
);

// ---------- PASSWORD RESET FLOW ----------
export const passwordForgotThunk = createAsyncThunk(
  "auth/password/forgot",
  async (payload: PasswordForgotPayload, { rejectWithValue }) => {
    try {
      return await passwordForgot(payload);
    } catch {
      return rejectWithValue("Không thể gửi email đặt lại mật khẩu");
    }
  },
);

export const passwordResendThunk = createAsyncThunk(
  "auth/password/resend",
  async (payload: PasswordResendPayload, { rejectWithValue }) => {
    try {
      return await passwordResend(payload);
    } catch {
      return rejectWithValue("Không thể gửi lại mã OTP");
    }
  },
);

export const passwordVerifyThunk = createAsyncThunk(
  "auth/password/verify",
  async (payload: PasswordVerifyPayload, { rejectWithValue }) => {
    try {
      return await passwordVerify(payload);
    } catch {
      return rejectWithValue("Mã OTP không hợp lệ");
    }
  },
);

export const passwordResetThunk = createAsyncThunk(
  "auth/password/reset",
  async (payload: PasswordResetPayload, { rejectWithValue }) => {
    try {
      return await passwordReset(payload);
    } catch {
      return rejectWithValue("Đặt lại mật khẩu thất bại");
    }
  },
);

/* =======================
   Slice
======================= */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
    resetRegister(state) {
      state.registerStep = "email";
      state.registerMail = null;
      state.error = null;
    },
    resetPassword(state) {
      state.passwordStep = "email";
      state.passwordMail = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ================= LOGIN =================
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || null;
      })

      // ================= REGISTER INITIATE =================
      .addCase(registerInitiateThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerInitiateThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.registerStep = "otp";
        state.registerMail = action.meta.arg.email;
      })
      .addCase(registerInitiateThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ================= REGISTER VERIFY =================
      .addCase(registerVerifyThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerVerifyThunk.fulfilled, (state) => {
        state.loading = false;
        state.registerStep = "final";
      })
      .addCase(registerVerifyThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ================= REGISTER RESEND =================
      .addCase(registerResendThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerResendThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerResendThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ================= REGISTER FINALIZE =================
      .addCase(registerFinalizeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerFinalizeThunk.fulfilled, (state) => {
        state.loading = false;
        state.registerStep = "done";
      })
      .addCase(registerFinalizeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ================= PASSWORD FORGOT =================
      .addCase(passwordForgotThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(passwordForgotThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.passwordStep = "otp";
        state.passwordMail = action.meta.arg.email;
      })
      .addCase(passwordForgotThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ================= PASSWORD RESEND =================
      .addCase(passwordResendThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(passwordResendThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(passwordResendThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ================= PASSWORD VERIFY =================
      .addCase(passwordVerifyThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(passwordVerifyThunk.fulfilled, (state) => {
        state.loading = false;
        state.passwordStep = "reset";
      })
      .addCase(passwordVerifyThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ================= PASSWORD RESET =================
      .addCase(passwordResetThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(passwordResetThunk.fulfilled, (state) => {
        state.loading = false;
        state.passwordStep = "done";
      })
      .addCase(passwordResetThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, resetRegister, resetPassword } = authSlice.actions;
export default authSlice.reducer;
