import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ChevronRight, ShoppingBag, ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyOrdersThunk } from "@/store/slices/orderSlice";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
    PENDING: { label: "Chờ xác nhận", cls: "bg-yellow-50 border-yellow-200 text-yellow-700", dot: "#f59e0b" },
    CONFIRMED: { label: "Đã xác nhận", cls: "bg-blue-50 border-blue-200 text-blue-700", dot: "#3b82f6" },
    PROCESSING: { label: "Đang xử lý", cls: "bg-violet-50 border-violet-200 text-violet-700", dot: "#8b5cf6" },
    SHIPPED: { label: "Đang giao", cls: "bg-indigo-50 border-indigo-200 text-indigo-700", dot: "#6366f1" },
    COMPLETED: { label: "Hoàn thành", cls: "bg-green-50 border-green-200 text-green-700", dot: "#16a34a" },
    CANCELLED: { label: "Đã hủy", cls: "bg-red-50 border-red-200 text-red-600", dot: "#ef4444" },
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes ol-fade-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes ol-card-in {
    from { opacity:0; transform:translateX(-14px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes ol-empty-in {
    from { opacity:0; transform:scale(.94); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes ol-spinner {
    to { transform:rotate(360deg); }
  }
  @keyframes ol-bag-bounce {
    0%,100% { transform:translateY(0) rotate(0deg); }
    30%     { transform:translateY(-8px) rotate(-5deg); }
    60%     { transform:translateY(-4px) rotate(4deg); }
  }

  .ol-e1 { animation: ol-fade-up .45s ease .04s both; }
  .ol-e2 { animation: ol-fade-up .45s ease .12s both; }

  /* Order card */
  .ol-card {
    animation: ol-card-in .38s ease both;
    transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s ease, border-color .2s;
  }
  .ol-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0,0,0,.08);
    border-color: #bbf7d0;
  }
  .ol-card:active { transform:scale(.99) translateY(-1px); }

  /* Package icon */
  .ol-pkg-icon {
    transition: transform .25s cubic-bezier(.34,1.56,.64,1), background .2s;
  }
  .ol-card:hover .ol-pkg-icon {
    transform: scale(1.1) rotate(-5deg);
    background: #dcfce7;
  }

  /* Chevron */
  .ol-chevron { transition: transform .2s, color .2s; }
  .ol-card:hover .ol-chevron { transform: translateX(4px); color:#16a34a; }

  /* Amount */
  .ol-amount { transition: color .2s; }
  .ol-card:hover .ol-amount { color:#15803d; }

  /* Empty state */
  .ol-empty { animation: ol-empty-in .5s cubic-bezier(.22,.68,0,1) both; }
  .ol-bag   { animation: ol-bag-bounce 2.2s ease-in-out infinite 1s; }

  /* CTA btn */
  .ol-cta {
    transition: background .2s, transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
  }
  .ol-cta:hover {
    background:#15803d;
    transform:translateY(-2px) scale(1.02);
    box-shadow:0 6px 18px rgba(22,163,74,.3);
  }
  .ol-cta:active { transform:scale(.97); }

  /* Back btn */
  .ol-back { transition: color .2s, transform .2s; }
  .ol-back:hover { color:#16a34a; transform:translateX(-3px); }
  .ol-back-icon { transition:transform .2s; }
  .ol-back:hover .ol-back-icon { transform:translateX(-3px); }

  /* Spinner */
  .ol-spinner {
    width:36px; height:36px;
    border:3px solid rgba(22,163,74,.2);
    border-top-color:#16a34a;
    border-radius:50%;
    animation:ol-spinner .8s linear infinite;
  }

  /* Status dot pulse for PENDING */
  @keyframes ol-pulse {
    0%,100% { opacity:1; }
    50%      { opacity:.4; }
  }
  .ol-dot-pulse { animation: ol-pulse 1.6s ease-in-out infinite; }
`;

function injectStyles() {
    if (typeof document === "undefined") return;
    if (document.getElementById("ol-styles")) return;
    const el = document.createElement("style");
    el.id = "ol-styles";
    el.textContent = CSS;
    document.head.appendChild(el);
}

const formatDate = (s: string) =>
    new Date(s).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" });

// ─── Main component ───────────────────────────────────────────────────────────
export default function OrderListPage() {
    injectStyles();

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { orders, loading, error } = useAppSelector((s) => s.orders);

    useEffect(() => { dispatch(fetchMyOrdersThunk()); }, [dispatch]);

    // ── Loading ──
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-3">
                    <div className="ol-spinner mx-auto" />
                    <p className="text-sm text-gray-400">Đang tải đơn hàng...</p>
                </div>
            </div>
        );
    }

    // ── Error ──
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
                <p className="text-red-500 text-sm">{error}</p>
                <button onClick={() => dispatch(fetchMyOrdersThunk())}
                    className="text-sm text-green-600 font-medium hover:underline">
                    Thử lại
                </button>
            </div>
        );
    }

    const orderList = Array.isArray(orders) ? orders : [];

    // ── Empty ──
    if (orderList.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-14 flex items-start justify-center">
                <div className="ol-empty bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center max-w-sm w-full mx-4 mt-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <ShoppingBag className="ol-bag w-10 h-10 text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có đơn hàng</h2>
                    <p className="text-sm text-gray-500 mb-7 leading-relaxed">
                        Hãy mua sắm để tạo đơn hàng đầu tiên của bạn.
                    </p>
                    <button onClick={() => navigate("/product")}
                        className="ol-cta w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm">
                        Mua sắm ngay
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-14">
            <div className="max-w-3xl mx-auto px-4">

                {/* ── Header ── */}
                <div className="ol-e1 mb-7">
                    <button onClick={() => navigate("/profile")}
                        className="ol-back inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 mb-4">
                        <ArrowLeft className="ol-back-icon w-4 h-4" />
                        Hồ sơ của tôi
                    </button>
                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Đơn hàng của tôi</h1>
                            <p className="text-sm text-gray-400">
                                <span className="font-semibold text-gray-700">{orderList.length}</span> đơn hàng
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Order list ── */}
                <div className="ol-e2 space-y-3">
                    {orderList.map((order, i) => {
                        const status = STATUS_MAP[order.status] ?? {
                            label: order.status,
                            cls: "bg-gray-100 border-gray-200 text-gray-600",
                            dot: "#9ca3af",
                        };
                        const isPending = order.status === "PENDING";

                        return (
                            <div
                                key={order.orderId}
                                onClick={() => navigate(`/orders/${order.orderId}`)}
                                className="ol-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer"
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                <div className="flex items-center gap-4">

                                    {/* Icon */}
                                    <div className="ol-pkg-icon w-11 h-11 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Package className="w-5 h-5" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-gray-900">
                                                #{order.orderId.slice(0, 8).toUpperCase()}
                                            </span>
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${status.cls}`}>
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPending ? "ol-dot-pulse" : ""}`}
                                                    style={{ background: status.dot }}
                                                />
                                                {status.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                                    </div>

                                    {/* Amount + chevron */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="ol-amount text-base font-black text-green-700">
                                            {order.totalAmount.toLocaleString("vi-VN")} ₫
                                        </span>
                                        <ChevronRight className="ol-chevron w-4 h-4 text-gray-300" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}