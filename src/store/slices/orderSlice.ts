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

export const fetchMyOrdersThunk = createAsyncThunk(
    "orders/fetchMyOrders",
    async () => await getMyOrders(),
);

export const fetchOrderByIdThunk = createAsyncThunk(
    "orders/fetchById",
    async (id: string) => await getOrderById(id),
);

export const createOrderThunk = createAsyncThunk(
    "orders/create",
    async (payload: CreateOrderPayload) => await createOrder(payload),
);

export const cancelOrderThunk = createAsyncThunk(
    "orders/cancel",
    async (orderId: string) => await cancelOrder(orderId),
);

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
            // fetch my orders
            .addCase(fetchMyOrdersThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMyOrdersThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchMyOrdersThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Fetch orders failed";
            })

            // fetch by id
            .addCase(fetchOrderByIdThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrderByIdThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(fetchOrderByIdThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Fetch order failed";
            })

            // create
            .addCase(createOrderThunk.pending, (state) => {
                state.loading = true;
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

            // cancel
            .addCase(cancelOrderThunk.pending, (state) => {
                state.loading = true;
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
