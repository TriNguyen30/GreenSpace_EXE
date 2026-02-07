import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { login } from "@/services/auth.service";
import type { LoginPayload } from "@/types/api";

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
};

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
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
