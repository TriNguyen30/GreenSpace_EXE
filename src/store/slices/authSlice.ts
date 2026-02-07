import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { login, registerInitiate, registerVerify, registerResend, registerFinalize } from "@/services/auth.service";
import type { LoginPayload, RegisterInitiatePayload, RegisterVerifyPayload, RegisterResendPayload, RegisterFinalizePayload } from "@/types/api";

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  registerStep: "email" | "otp" | "final" | "done";
  registerMail: string | null;
}

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

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: getStoredUser(),
  loading: false,
  error: null,
  registerStep: "email",
  registerMail: null,
};

//login flow
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      return await login(payload);
    } catch (err: unknown) {
      const rawMessage =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;

      let message = "Đăng nhập thất bại";

      if (rawMessage?.toLowerCase().includes("invalid")) {
        message = "Email hoặc mật khẩu không đúng";
      } else if (rawMessage?.toLowerCase().includes("locked")) {
        message = "Tài khoản đã bị khóa";
      } else if (rawMessage?.toLowerCase().includes("not verified")) {
        message = "Tài khoản chưa xác thực email";
      }

      return rejectWithValue(message);
    }
  }
);

//register flow
export const registerInitiateThunk = createAsyncThunk(
  "auth/register/initiate",
  async (payload: RegisterInitiatePayload, { rejectWithValue }) => {
    try {
      return await registerInitiate(payload);
    } catch {
      return rejectWithValue("Không thể gửi mã OTP");
    }
  }
);

export const registerVerifyThunk = createAsyncThunk(
  "auth/register/verify",
  async (payload: RegisterVerifyPayload, { rejectWithValue }) => {
    try {
      return await registerVerify(payload);
    } catch {
      return rejectWithValue("Mã OTP không hợp lệ");
    }
  }
);

export const registerResendThunk = createAsyncThunk(
  "auth/register/resend",
  async (payload: RegisterResendPayload, { rejectWithValue }) => {
    try {
      return await registerResend(payload);
    } catch {
      return rejectWithValue("Không thể gửi lại mã OTP");
    }
  }
);

export const registerFinalizeThunk = createAsyncThunk(
  "auth/register/finalize",
  async (payload: RegisterFinalizePayload, { rejectWithValue }) => {
    try {
      return await registerFinalize(payload);
    } catch {
      return rejectWithValue("Tạo tài khoản thất bại");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    resetRegister(state) {
      state.registerStep = "email";
      state.registerMail = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------- LOGIN ----------
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || null;
      })

      // ---------- REGISTER INITIATE ----------
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

      // ---------- REGISTER VERIFY ----------
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

      // ---------- REGISTER RESEND ----------
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

      // ---------- REGISTER FINALIZE ----------
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
      });
  },
});

export const { logout, resetRegister } = authSlice.actions;
export default authSlice.reducer;
