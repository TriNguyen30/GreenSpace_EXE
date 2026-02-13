import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Order, CreateOrderPayload } from "@/types/order";
import {
    getMyOrders,
    getOrderById,
    createOrder,
    cancelOrder,
} from "@/services/order.service";

interface OrderState {
    orders: Order[];
    currentOrder: Order | null;
    loading: boolean;
    error: string | null;
}

const initialState: OrderState = {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
};

/* ================= Thunks ================= */

export const fetchMyOrdersThunk = createAsyncThunk<Order[]>(
    "orders/fetchMyOrders",
    async () => await getMyOrders(),
);

export const fetchOrderByIdThunk = createAsyncThunk<Order, string>(
    "orders/fetchById",
    async (id) => await getOrderById(id),
);

export const createOrderThunk = createAsyncThunk<Order, CreateOrderPayload>(
    "orders/create",
    async (payload) => await createOrder(payload),
);

export const cancelOrderThunk = createAsyncThunk<Order, string>(
    "orders/cancel",
    async (orderId) => await cancelOrder(orderId),
);

/* ================= Slice ================= */

const orderSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {
        clearCurrentOrder(state) {
            state.currentOrder = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== Fetch my orders =====
            .addCase(fetchMyOrdersThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyOrdersThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchMyOrdersThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Fetch orders failed";
            })

            // ===== Fetch order by id =====
            .addCase(fetchOrderByIdThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderByIdThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(fetchOrderByIdThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Fetch order failed";
            })

            // ===== Create order =====
            .addCase(createOrderThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrderThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
                state.orders.unshift(action.payload);
            })
            .addCase(createOrderThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Create order failed";
            })

            // ===== Cancel order =====
            .addCase(cancelOrderThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelOrderThunk.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.orders.findIndex(
                    (o) => o.orderId === action.payload.orderId,
                );
                if (idx !== -1) state.orders[idx] = action.payload;
                if (state.currentOrder?.orderId === action.payload.orderId) {
                    state.currentOrder = action.payload;
                }
            })
            .addCase(cancelOrderThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Cancel order failed";
            });
    },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
