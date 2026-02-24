import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Package, XCircle, AlertTriangle, Truck, CheckCircle2, Clock, Ban } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrderByIdThunk, cancelOrderThunk } from "@/store/slices/orderSlice";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; cls: string; dot: string; icon: React.ElementType }> = {
    PENDING: { label: "Chờ xác nhận", cls: "bg-yellow-50 border-yellow-200 text-yellow-700", dot: "#f59e0b", icon: Clock },
    CONFIRMED: { label: "Đã xác nhận", cls: "bg-blue-50 border-blue-200 text-blue-700", dot: "#3b82f6", icon: CheckCircle2 },
    PROCESSING: { label: "Đang xử lý", cls: "bg-violet-50 border-violet-200 text-violet-700", dot: "#8b5cf6", icon: Package },
    SHIPPED: { label: "Đang giao", cls: "bg-indigo-50 border-indigo-200 text-indigo-700", dot: "#6366f1", icon: Truck },
    COMPLETED: { label: "Hoàn thành", cls: "bg-green-50 border-green-200 text-green-700", dot: "#16a34a", icon: CheckCircle2 },
    CANCELLED: { label: "Đã hủy", cls: "bg-red-50 border-red-200 text-red-600", dot: "#ef4444", icon: Ban },
};

const STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED"] as const;

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes od-fade-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes od-card-in {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes od-item-in {
    from { opacity:0; transform:translateX(-10px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes od-spinner {
    to { transform:rotate(360deg); }
  }
  @keyframes od-step-fill {
    from { width:0; }
    to   { width:100%; }
  }
  @keyframes od-pulse {
    0%,100% { opacity:1; }
    50%      { opacity:.4; }
  }

  .od-e1 { animation: od-fade-up .45s ease .04s both; }
  .od-e2 { animation: od-card-in .45s ease .10s both; }
  .od-e3 { animation: od-card-in .45s ease .16s both; }
  .od-e4 { animation: od-card-in .45s ease .22s both; }
  .od-e5 { animation: od-card-in .45s ease .28s both; }
  .od-e6 { animation: od-card-in .45s ease .34s both; }

  /* Info cards */
  .od-card { transition: box-shadow .25s ease; }
  .od-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,.07); }

  /* Info row hover */
  .od-row {
    transition: background .15s, padding-left .15s;
    border-radius:10px;
  }
  .od-row:hover { background:#f0fdf4; padding-left:6px; }

  /* Section icon */
  .od-sec-icon {
    transition: transform .2s cubic-bezier(.34,1.56,.64,1), background .2s;
  }
  .od-card:hover .od-sec-icon {
    transform: scale(1.1) rotate(-5deg);
    background: #dcfce7;
  }

  /* Back btn */
  .od-back { transition: color .2s, transform .2s; }
  .od-back:hover { color:#16a34a; transform:translateX(-3px); }
  .od-back-icon { transition:transform .2s; }
  .od-back:hover .od-back-icon { transform:translateX(-3px); }

  /* Product item */
  .od-item { animation: od-item-in .35s ease both; }
  .od-item-img { transition:transform .35s ease; }
  .od-item:hover .od-item-img { transform:scale(1.06); }

  /* Cancel button */
  .od-cancel {
    transition: background .2s, transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
  }
  .od-cancel:hover {
    background:#dc2626;
    transform:translateY(-1px) scale(1.02);
    box-shadow:0 4px 14px rgba(239,68,68,.3);
  }
  .od-cancel:active { transform:scale(.97); }

  /* Step tracker */
  .od-step-bar { animation: od-step-fill .6s ease .4s both; }
  .od-step-dot-active { animation: od-pulse 1.6s ease-in-out infinite; }

  /* Spinner */
  .od-spinner {
    width:36px; height:36px;
    border:3px solid rgba(22,163,74,.2);
    border-top-color:#16a34a;
    border-radius:50%;
    animation:od-spinner .8s linear infinite;
  }
`;

function injectStyles() {
    if (typeof document === "undefined") return;
    if (document.getElementById("od-styles")) return;
    const el = document.createElement("style");
    el.id = "od-styles";
    el.textContent = CSS;
    document.head.appendChild(el);
}

const formatDate = (s?: string) =>
    s ? new Date(s).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" }) : "—";

const formatPrice = (n?: number) =>
    (Number(n ?? 0)).toLocaleString("vi-VN") + " ₫";

// ─── Status stepper ───────────────────────────────────────────────────────────
function StatusStepper({ status }: { status: string }) {
    if (status === "CANCELLED") return null;
    const idx = STEPS.indexOf(status as typeof STEPS[number]);

    return (
        <div className="flex items-center gap-0 w-full">
            {STEPS.map((step, i) => {
                const done = i < idx;
                const active = i === idx;
                const cfg = STATUS_MAP[step];

                return (
                    <div key={step} className="flex items-center flex-1 min-w-0">
                        <div className="flex flex-col items-center shrink-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all
                ${done ? "bg-green-600 border-green-600 text-white"
                                    : active ? "bg-white border-green-600 text-green-600"
                                        : "bg-white border-gray-200 text-gray-300"}`}>
                                {done
                                    ? <CheckCircle2 className="w-3.5 h-3.5" />
                                    : <span className={`w-2 h-2 rounded-full ${active ? "od-step-dot-active bg-green-500" : "bg-gray-200"}`} />
                                }
                            </div>
                            <span className={`text-xs mt-1 font-medium whitespace-nowrap ${done || active ? "text-green-700" : "text-gray-400"}`}>
                                {cfg.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className="flex-1 h-0.5 bg-gray-100 mx-1 mb-4 overflow-hidden relative">
                                {done && <div className="od-step-bar absolute inset-y-0 left-0 bg-green-500" />}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OrderDetailPage() {
    injectStyles();

    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { currentOrder, loading, error } = useAppSelector((s) => s.orders);

    useEffect(() => { if (id) dispatch(fetchOrderByIdThunk(id)); }, [dispatch, id]);

    if (loading || !currentOrder) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
                <div className="od-spinner" />
                <p className="text-sm text-gray-400">Đang tải đơn hàng...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <p className="text-sm text-red-500">{error}</p>
                <button onClick={() => id && dispatch(fetchOrderByIdThunk(id))}
                    className="text-sm text-green-600 font-medium hover:underline">Thử lại</button>
            </div>
        );
    }

    const statusKey = currentOrder.status?.toUpperCase();
    const status = STATUS_MAP[statusKey] ?? { label: statusKey, cls: "bg-gray-100 border-gray-200 text-gray-600", dot: "#9ca3af", icon: Package };
    const canCancel = ["PENDING", "CONFIRMED"].includes(statusKey);
    const StatusIcon = status.icon;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-14">
            <div className="max-w-4xl mx-auto px-4 space-y-5">

                {/* ── Header ── */}
                <div className="od-e1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <button onClick={() => navigate("/orders")}
                        className="od-back inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 w-fit">
                        <ArrowLeft className="od-back-icon w-4 h-4" />
                        Đơn hàng của tôi
                    </button>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                            #{currentOrder.orderId.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(currentOrder.createdAt)}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.cls}`}>
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: status.dot }} />
                            {status.label}
                        </span>
                    </div>
                </div>

                {/* ── Status stepper ── */}
                {statusKey !== "CANCELLED" && (
                    <div className="od-e2 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
                        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-5">Trạng thái đơn hàng</p>
                        <StatusStepper status={statusKey} />
                    </div>
                )}

                {/* ── Info cards ── */}
                <div className="grid md:grid-cols-3 gap-4">

                    {/* Shipping */}
                    <div className="od-e3 od-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Địa chỉ giao</p>
                        <div className="flex gap-3">
                            <div className="od-sec-icon w-9 h-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{currentOrder.shippingAddress || "—"}</p>
                        </div>
                    </div>

                    {/* Recipient */}
                    <div className="od-e3 od-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Người nhận</p>
                        <div className="flex gap-3">
                            <div className="od-sec-icon w-9 h-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="od-row px-1 py-0.5">
                                    <span className="text-xs text-gray-400 block">Tên</span>
                                    <span className="text-sm font-semibold text-gray-800">{currentOrder.recipientName ?? "—"}</span>
                                </div>
                                <div className="od-row px-1 py-0.5">
                                    <span className="text-xs text-gray-400 block">SĐT</span>
                                    <span className="text-sm font-semibold text-gray-800">{currentOrder.recipientPhone ?? "—"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="od-e3 od-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Thao tác</p>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                {canCancel
                                    ? "Đơn hàng có thể hủy vì chưa được xử lý."
                                    : "Đơn hàng không thể hủy ở trạng thái hiện tại."}
                            </p>
                        </div>
                        {canCancel ? (
                            <button
                                onClick={async () => {
                                    if (!id) return;
                                    if (!confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;
                                    await dispatch(cancelOrderThunk(id));
                                }}
                                className="od-cancel w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2.5 rounded-xl font-bold text-sm"
                            >
                                <XCircle className="w-4 h-4" /> Hủy đơn hàng
                            </button>
                        ) : (
                            <div className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold w-fit ${status.cls}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {status.label}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Products ── */}
                <div className="od-e4 od-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-5">Sản phẩm đã đặt</p>
                    <div className="space-y-0 divide-y divide-gray-50">
                        {(currentOrder.items ?? []).map((item, i) => (
                            <div key={item.productId}
                                className="od-item flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
                                style={{ animationDelay: `${0.28 + i * 0.05}s` }}>
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                                    {item.thumbnailUrl ? (
                                        <img
                                            src={item.thumbnailUrl}
                                            alt={item.productName}
                                            className="od-item-img w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Package className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">
                                        {item.productName}
                                    </h4>
                                    <p className="text-xs text-gray-400">
                                        {item.quantity} × {formatPrice(item.priceAtPurchase ?? item.unitPrice)}
                                        {item.variantSku ? <span className="ml-2 font-mono">({item.variantSku})</span> : null}
                                    </p>
                                </div>
                                <span className="text-sm font-bold text-gray-800 shrink-0">
                                    {formatPrice(
                                        item.subTotal ??
                                        item.totalPrice ??
                                        (Number(item.priceAtPurchase ?? item.unitPrice ?? 0) * Number(item.quantity ?? 0))
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Note ── */}
                {currentOrder.note && (
                    <div className="od-e5 od-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">Ghi chú</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{currentOrder.note}</p>
                    </div>
                )}

                {/* ── Summary ── */}
                <div className="od-e6 od-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Tổng kết</p>
                    <div className="max-w-xs ml-auto space-y-2.5">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Tạm tính</span>
                            <span className="font-semibold text-gray-800">{formatPrice(currentOrder.subTotal ?? currentOrder.totalAmount)}</span>
                        </div>
                        {!!currentOrder.discount && currentOrder.discount > 0 && (
                            <div className="flex justify-between text-sm text-green-700">
                                <span>Giảm giá</span>
                                <span className="font-semibold">−{formatPrice(currentOrder.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-600">
                            <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Vận chuyển</span>
                            <span className={`font-semibold ${Number(currentOrder.shippingFee ?? 0) === 0 ? "text-green-600" : "text-gray-800"}`}>
                                {Number(currentOrder.shippingFee ?? 0) === 0 ? "Miễn phí" : formatPrice(currentOrder.shippingFee)}
                            </span>
                        </div>
                        <div className="border-t border-gray-100 pt-2.5 flex justify-between">
                            <span className="font-bold text-gray-900">Tổng cộng</span>
                            <span className="text-xl font-black text-green-700">
                                {formatPrice(currentOrder.finalAmount ?? currentOrder.totalAmount)}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}