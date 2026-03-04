import { axiosInstance } from "@/lib/axios";

export interface SendChatPayload {
    message: string;
    language?: string;
    plantType?: string;
    imageBase64?: string;
    imageUrl?: string;
    includeProductRecommendations?: boolean;
    skipCache?: boolean;
}

export interface ChatResponse {
    result: string;
}

/** Response trả về từ Chatbox/message */
export interface ChatboxApiResponse {
    data?: {
        result?: string;
        message?: string;
    };
    result?: string;
    message?: string;
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

    const responseData = res.data;

    const result =
        responseData?.data?.result ??
        responseData?.result ??
        responseData?.data?.message ??
        responseData?.message ??
        "Không có phản hồi từ AI.";

    return { result };
};