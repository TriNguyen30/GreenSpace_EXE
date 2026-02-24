import { axiosInstance } from "@/lib/axios";

export interface SendChatPayload {
    description: string;
    language?: string;
    plantType?: string;
    imageBase64?: string;
}

export interface ChatResponse {
    result: string;
}

/** Diagnosis API response (res.data.data) */
export interface DiagnosisData {
    isSuccessful?: boolean;
    errorMessage?: string | null;
    plantInfo?: {
        commonName?: string;
        scientificName?: string;
        family?: string;
        description?: string;
    };
    diseaseInfo?: {
        isHealthy?: boolean;
        diseaseName?: string;
        severity?: string;
        symptoms?: string[];
        causes?: string[];
        notes?: string;
    };
    treatment?: {
        immediateActions?: string[];
        longTermCare?: string[];
        preventionTips?: string[];
        wateringAdvice?: string;
        lightingAdvice?: string;
        fertilizingAdvice?: string;
    };
    recommendedProducts?: unknown[];
    confidenceScore?: number;
}

function formatDiagnosisAsText(data: DiagnosisData | null | undefined): string {
    if (!data || data === null) {
        return "Không nhận được phản hồi từ AI.";
    }
    if (data.errorMessage) {
        return data.errorMessage;
    }

    const lines: string[] = [];

    if (data.plantInfo) {
        const p = data.plantInfo;
        if (p.commonName || p.scientificName) {
            lines.push(`🌿 Cây: ${p.commonName || ""}${p.scientificName ? ` (${p.scientificName})` : ""}`);
        }
        if (p.family) lines.push(`Họ: ${p.family}`);
        if (p.description) lines.push(p.description);
        if (lines.length) lines.push("");
    }

    if (data.diseaseInfo) {
        const d = data.diseaseInfo;
        if (d.isHealthy) {
            lines.push("✅ Chẩn đoán: Cây có vẻ khỏe mạnh.");
        } else {
            if (d.diseaseName) {
                lines.push(`🔍 Chẩn đoán: ${d.diseaseName}${d.severity ? ` — Mức độ: ${d.severity}` : ""}`);
            }
            if (d.symptoms?.length) {
                lines.push(`Triệu chứng: ${d.symptoms.join(", ")}`);
            }
            if (d.causes?.length) {
                lines.push(`Nguyên nhân có thể: ${d.causes.join(", ")}`);
            }
            if (d.notes) lines.push(`Ghi chú: ${d.notes}`);
        }
        lines.push("");
    }

    if (data.treatment) {
        const t = data.treatment;
        if (t.immediateActions?.length) {
            lines.push("Hành động ngay:");
            t.immediateActions.forEach((a) => lines.push(`• ${a}`));
            lines.push("");
        }
        if (t.longTermCare?.length) {
            lines.push("Chăm sóc lâu dài:");
            t.longTermCare.forEach((a) => lines.push(`• ${a}`));
            lines.push("");
        }
        if (t.preventionTips?.length) {
            lines.push("Phòng tránh:");
            t.preventionTips.forEach((a) => lines.push(`• ${a}`));
            lines.push("");
        }
        if (t.wateringAdvice) lines.push(`💧 Tưới nước: ${t.wateringAdvice}`);
        if (t.lightingAdvice) lines.push(`☀️ Ánh sáng: ${t.lightingAdvice}`);
        if (t.fertilizingAdvice) lines.push(`🌱 Bón phân: ${t.fertilizingAdvice}`);
        lines.push("");
    }

    if (data.confidenceScore != null) {
        lines.push(`Độ tin cậy: ${data.confidenceScore}%`);
    }

    const text = lines.join("\n").trim();
    return text || "Không có nội dung chẩn đoán.";
}

export const sendChatMessage = async (
    payload: SendChatPayload
): Promise<ChatResponse> => {
    const res = await axiosInstance.post<{ data: DiagnosisData }>("/Diagnosis", {
        description: payload.description,
        language: payload.language ?? "vi",
        plantType: payload.plantType ?? "general",
        imageBase64: payload.imageBase64 ?? null,
        skipCache: false,
    });

    const data = res.data?.data ?? res.data;
    const result = formatDiagnosisAsText(data as DiagnosisData);
    return { result };
};
