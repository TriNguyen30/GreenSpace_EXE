import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Trash2, X, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    addUserMessage,
    clearChat,
    sendMessageThunk,
} from "@/store/slices/chatboxSlice";
import ChatMessage from "./ChatMessage";

// ─── Inject keyframes once ──────────────────────────────────────────────────
const STYLES = `
@keyframes cb-slide-up {
  from { opacity: 0; transform: translateY(24px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0)   scale(1);    }
}
@keyframes cb-slide-down {
  from { opacity: 1; transform: translateY(0)   scale(1);    }
  to   { opacity: 0; transform: translateY(24px) scale(0.96); }
}
@keyframes cb-fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0);    }
}
@keyframes cb-pop-in {
  0%   { opacity: 0; transform: scale(0.8) translateY(6px); }
  60%  { transform: scale(1.04) translateY(-2px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes cb-pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(22,163,74,.55); }
  70%  { box-shadow: 0 0 0 10px rgba(22,163,74,0); }
  100% { box-shadow: 0 0 0 0 rgba(22,163,74,0);   }
}
@keyframes cb-dot {
  0%, 80%, 100% { transform: scale(0.6); opacity: .4; }
  40%           { transform: scale(1);   opacity: 1;   }
}
@keyframes cb-btn-press {
  0%   { transform: scale(1); }
  40%  { transform: scale(.88); }
  100% { transform: scale(1); }
}
@keyframes cb-shake {
  0%,100% { transform: translateX(0); }
  20%     { transform: translateX(-4px); }
  40%     { transform: translateX(4px); }
  60%     { transform: translateX(-3px); }
  80%     { transform: translateX(3px); }
}

.cb-panel-enter { animation: cb-slide-up .32s cubic-bezier(.22,.68,0,1.2) forwards; }
.cb-panel-exit  { animation: cb-slide-down .22s ease-in forwards; }

.cb-msg { animation: cb-fade-in .28s ease both; }

.cb-chip { animation: cb-pop-in .35s cubic-bezier(.34,1.56,.64,1) both; }

.cb-fab { animation: cb-pulse-ring 2.4s ease-out infinite; }
.cb-fab:active { animation: cb-btn-press .18s ease forwards; }

.cb-typing span {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #6b7280;
  animation: cb-dot 1.2s ease-in-out infinite;
}
.cb-typing span:nth-child(2) { animation-delay: .18s; }
.cb-typing span:nth-child(3) { animation-delay: .36s; }

.cb-input-ring:focus-within {
  box-shadow: 0 0 0 3px rgba(22,163,74,.25);
  border-color: #16a34a;
  transition: box-shadow .2s, border-color .2s;
}
.cb-send-btn:not(:disabled):hover { transform: scale(1.08); }
.cb-send-btn:not(:disabled):active { transform: scale(.92); }
.cb-send-btn { transition: transform .15s cubic-bezier(.34,1.56,.64,1), background .15s; }

.cb-trash:hover { animation: cb-shake .4s ease; }

.cb-header-icon {
  transition: transform .2s;
}
.cb-header-icon:hover { transform: rotate(-15deg) scale(1.15); }
`;

function injectStyles() {
    if (typeof document === "undefined") return;
    if (document.getElementById("chatbox-anim-styles")) return;
    const tag = document.createElement("style");
    tag.id = "chatbox-anim-styles";
    tag.textContent = STYLES;
    document.head.appendChild(tag);
}

// ─── Suggested prompts ───────────────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
    "Lá cây bị vàng, nguyên nhân và cách xử lý?",
    "Cây bonsai bị sâu bệnh, tôi nên làm gì?",
    "Cách tưới nước đúng cách cho bonsai?",
    "Cây héo lá, thiếu nước hay bị bệnh?",
];

// ─── Typing indicator ────────────────────────────────────────────────────────
function TypingBubble() {
    return (
        <div className="flex gap-3 cb-msg">
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1 cb-typing">
                <span /><span /><span />
            </div>
        </div>
    );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function Chatbox() {
    const [open, setOpen] = useState(false);
    const [closing, setClosing] = useState(false);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();
    const { messages, loading, error } = useAppSelector((state) => state.chat);
    const prevMsgCount = useRef(0);

    injectStyles();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        prevMsgCount.current = messages.length;
    }, [messages, loading]);

    /* Smooth close */
    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            setOpen(false);
            setClosing(false);
        }, 220);
    };

    const toggleOpen = () => {
        if (open) handleClose();
        else setOpen(true);
    };

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

    const handleSend = () => sendPrompt(input);

    const handleClear = () => dispatch(clearChat());

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* ── FAB toggle ── */}
            <button
                type="button"
                onClick={toggleOpen}
                className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 flex items-center justify-center ${!open ? "cb-fab" : ""
                    }`}
                style={{ transition: "background .2s, transform .2s" }}
                aria-label={open ? "Đóng chat" : "Mở chat AI"}
            >
                <span
                    style={{
                        display: "flex",
                        transition: "transform .25s cubic-bezier(.34,1.56,.64,1), opacity .2s",
                        transform: open ? "rotate(90deg) scale(1.1)" : "rotate(0deg) scale(1)",
                    }}
                >
                    {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                </span>
            </button>

            {/* ── Panel ── */}
            {open && (
                <div
                    className={`fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[70vh] flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${closing ? "cb-panel-exit" : "cb-panel-enter"
                        }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-green-600 text-white shrink-0">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 cb-header-icon" />
                            <span className="font-semibold">Chat AI – Chẩn đoán cây</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cb-trash"
                            title="Xóa lịch sử"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.length === 0 && !loading && (
                            <div className="space-y-4 py-4">
                                <p
                                    className="text-center text-gray-500 text-sm cb-msg"
                                    style={{ animationDelay: "0.05s" }}
                                >
                                    Chào bạn! Chọn gợi ý bên dưới hoặc mô tả tình trạng cây để được tư vấn.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                                        <button
                                            key={prompt}
                                            type="button"
                                            onClick={() => sendPrompt(prompt)}
                                            className="cb-chip px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-medium hover:bg-green-50 hover:border-green-200 hover:text-green-800 text-left max-w-full"
                                            style={{
                                                animationDelay: `${0.1 + i * 0.07}s`,
                                                transition: "background .15s, border-color .15s, color .15s, transform .15s, box-shadow .15s",
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                                            onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className="cb-msg"
                                style={{
                                    animationDelay: i >= prevMsgCount.current - 1 ? "0ms" : "0ms",
                                    animationFillMode: "both",
                                }}
                            >
                                <ChatMessage role={msg.role} content={msg.content} />
                            </div>
                        ))}

                        {loading && <TypingBubble />}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            className="px-4 py-2 bg-red-50 text-red-700 text-sm shrink-0 cb-msg"
                        >
                            {error}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-3 border-t border-gray-200 bg-white shrink-0">
                        <div
                            className="flex gap-2 rounded-xl border border-gray-200 bg-white px-2 py-1 cb-input-ring"
                            style={{ transition: "border-color .2s" }}
                        >
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Mô tả tình trạng cây..."
                                rows={1}
                                className="flex-1 min-h-[36px] max-h-24 resize-none border-none bg-transparent px-1 py-2 text-sm outline-none"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="cb-send-btn shrink-0 self-end w-9 h-9 rounded-lg bg-green-600 text-white flex items-center justify-center hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed mb-0.5"
                                title="Gửi"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}