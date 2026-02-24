import { User, Bot } from "lucide-react";

interface ChatMessageProps {
    role: "user" | "assistant";
    content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === "user";

    return (
        <div
            className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
        >
            <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                    isUser ? "bg-green-500 text-white" : "bg-green-100 text-green-700"
                }`}
            >
                {isUser ? (
                    <User className="w-4 h-4" />
                ) : (
                    <Bot className="w-4 h-4" />
                )}
            </div>
            <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    isUser
                        ? "bg-green-600 text-white rounded-tr-md"
                        : "bg-gray-100 text-gray-900 rounded-tl-md"
                }`}
            >
                <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
            </div>
        </div>
    );
}
