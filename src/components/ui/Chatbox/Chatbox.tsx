import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Trash2, X, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    addUserMessage,
    clearChat,
    sendMessageThunk,
} from "@/store/slices/chatboxSlice";
import ChatMessage from "./ChatMessage";

const SUGGESTED_PROMPTS = [
    "Lá cây bị vàng, nguyên nhân và cách xử lý?",
    "Cây bonsai bị sâu bệnh, tôi nên làm gì?",
    "Cách tưới nước đúng cách cho bonsai?",
    "Cây héo lá, thiếu nước hay bị bệnh?",
];

export default function Chatbox() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();
    const { messages, loading, error } = useAppSelector((state) => state.chat);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendPrompt = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;
        setInput("");
        dispatch(addUserMessage(trimmed));
        dispatch(
            sendMessageThunk({
                description: trimmed,
                language: "vi",
                plantType: "general",
            })
        );
    };

    const handleSend = () => {
        const text = input.trim();
        if (!text || loading) return;
        sendPrompt(text);
    };

    const handleClear = () => {
        dispatch(clearChat());
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Toggle button */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                aria-label={open ? "Đóng chat" : "Mở chat AI"}
            >
                {open ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageCircle className="w-6 h-6" />
                )}
            </button>

            {/* Panel */}
            {open && (
                <div className="fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[70vh] flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-green-600 text-white shrink-0">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            <span className="font-semibold">Chat AI – Chẩn đoán cây</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                            title="Xóa lịch sử"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.length === 0 && !loading && (
                            <div className="space-y-4 py-4">
                                <p className="text-center text-gray-500 text-sm">
                                    Chào bạn! Chọn gợi ý bên dưới hoặc mô tả tình trạng cây để được tư vấn.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {SUGGESTED_PROMPTS.map((prompt) => (
                                        <button
                                            key={prompt}
                                            type="button"
                                            onClick={() => sendPrompt(prompt)}
                                            className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-medium hover:bg-green-50 hover:border-green-200 hover:text-green-800 transition-colors text-left max-w-full"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <ChatMessage
                                key={i}
                                role={msg.role}
                                content={msg.content}
                            />
                        ))}
                        {loading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                                <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-2.5">
                                    <span className="text-sm text-gray-500">Đang phân tích...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="px-4 py-2 bg-red-50 text-red-700 text-sm shrink-0">
                            {error}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-3 border-t border-gray-200 bg-white shrink-0">
                        <div className="flex gap-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Mô tả tình trạng cây..."
                                rows={1}
                                className="flex-1 min-h-[40px] max-h-24 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="shrink-0 w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Gửi"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
