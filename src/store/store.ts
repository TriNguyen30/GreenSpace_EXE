import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import orderReducer from "./slices/orderSlice";
import chatReducer from "./slices/chatboxSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: orderReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;