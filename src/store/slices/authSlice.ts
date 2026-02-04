import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { login } from "@/services/auth.service";
import type { LoginPayload } from "@/types/api";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  expiresAt: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  expiresAt: localStorage.getItem("expiresAt"),
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      return await login(payload); // gọi service ở trên
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.expiresAt = null;
      localStorage.clear();
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
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.expiresAt = action.payload.expiresAt;

        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("expiresAt", action.payload.expiresAt);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
