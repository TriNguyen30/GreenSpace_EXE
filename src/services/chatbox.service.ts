import { axiosInstance } from "@/lib/axios";

export interface SendChatPayload {
    message: string;
    imageBase64?: string;
    imageUrl?: string;
    language?: string;
    plantType?: string;
    includeProductRecommendations?: boolean;
    skipCache?: boolean;
}

export interface ChatResponse {
    result: string;
}

interface ChatboxApiResponse {
    data?: {
        isSuccessful?: boolean;
        errorMessage?: string | null;
        message?: string;
    };
    isSuccess?: boolean;
    message?: string;
    errors?: unknown;
    statusCode?: number;
}

export const sendChatMessage = async (
    payload: SendChatPayload
): Promise<ChatResponse> => {
    const res = await axiosInstance.post<ChatboxApiResponse>(
        "/Chatbox/message",
        {
            message: payload.message,
            imageBase64: payload.imageBase64 ?? null,
            imageUrl: payload.imageUrl ?? null,
            language: payload.language ?? "vi",
            plantType: payload.plantType ?? "general",
            includeProductRecommendations:
                payload.includeProductRecommendations ?? true,
            skipCache: payload.skipCache ?? true,
        }
    );

    const response = res.data;

    // ❌ HTTP fail (axios thường tự throw rồi, nhưng check thêm cho chắc)
    if (res.status !== 200) {
        throw new Error("Lỗi kết nối máy chủ.");
    }

    // ❌ Wrapper fail
    if (!response?.isSuccess || response?.statusCode !== 200) {
        throw new Error(response?.message || "Xử lý thất bại.");
    }

    // ❌ Data fail
    if (!response?.data?.isSuccessful) {
        throw new Error(
            response?.data?.errorMessage || "AI xử lý thất bại."
        );
    }

    const message = response?.data?.message;

    if (!message) {
        throw new Error("Không nhận được nội dung phản hồi từ AI.");
    }

    return { result: message };
};