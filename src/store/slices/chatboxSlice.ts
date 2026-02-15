import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sendChatMessage, SendChatPayload } from "@/services/chatbox.service";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ChatState {
    messages: Message[];
    loading: boolean;
    error: string | null;
}

const initialState: ChatState = {
    messages: [],
    loading: false,
    error: null,
};

function getErrorMessage(error: unknown): string {
    if (error && typeof error === "object") {
        const err = error as { response?: { data?: { message?: string; error?: string }; status?: number }; message?: string };
        const msg = err.response?.data?.message ?? err.response?.data?.error ?? err.message;
        if (typeof msg === "string") return msg;
        if (err.response?.status === 404) return "API chẩn đoán không tồn tại.";
        if (err.response?.status === 500) return "Lỗi máy chủ AI, vui lòng thử lại.";
    }
    return "Không thể kết nối AI. Kiểm tra mạng hoặc thử lại.";
}

export const sendMessageThunk = createAsyncThunk(
    "chat/sendMessage",
    async (payload: SendChatPayload, { rejectWithValue }) => {
        try {
            const data = await sendChatMessage(payload);
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        addUserMessage: (state, action) => {
            state.messages.push({
                role: "user",
                content: action.payload,
            });
        },
        clearChat: (state) => {
            state.messages = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendMessageThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendMessageThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                const text =
                    action.payload?.result ??
                    (typeof action.payload === "string" ? action.payload : null) ??
                    "Không có phản hồi.";
                state.messages.push({
                    role: "assistant",
                    content: text,
                });
            })
            .addCase(sendMessageThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { addUserMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
