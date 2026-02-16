import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Package, KeyRound, LogOut, ChevronRight, Shield } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

type UserWithName = { fullName?: string; name?: string; email?: string; role?: string; id?: string };

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes up-fade-up {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes up-card-in {
    from { opacity:0; transform:scale(.96) translateY(12px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes up-avatar-in {
    from { opacity:0; transform:scale(.7) rotate(-8deg); }
    to   { opacity:1; transform:scale(1) rotate(0deg); }
  }
  @keyframes up-badge-in {
    from { opacity:0; transform:scale(.7); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes up-spinner {
    to { transform:rotate(360deg); }
  }

  .up-card  { animation: up-card-in  .5s cubic-bezier(.22,.68,0,1) .06s both; }
  .up-menu  { animation: up-fade-up  .45s ease .18s both; }
  .up-info  { animation: up-fade-up  .45s ease .1s  both; }

  /* Avatar */
  .up-avatar { animation: up-avatar-in .55s cubic-bezier(.34,1.56,.64,1) .12s both; }
  .up-avatar-wrap {
    transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s;
  }
  .up-avatar-wrap:hover {
    transform: scale(1.06) rotate(-3deg);
    box-shadow: 0 8px 24px rgba(22,163,74,.25);
  }

  /* Role badge */
  .up-badge { animation: up-badge-in .4s cubic-bezier(.34,1.56,.64,1) .3s both; }

  /* Profile card */
  .up-profile-card {
    transition: box-shadow .25s ease;
  }
  .up-profile-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,.08); }

  /* Menu row */
  .up-menu-row {
    transition: background .15s, padding-left .18s;
  }
  .up-menu-row:hover { padding-left: 28px; }
  .up-menu-row:hover .up-row-icon {
    transform: scale(1.1) rotate(-5deg);
    background: #dcfce7;
  }
  .up-row-icon {
    transition: background .2s, transform .2s cubic-bezier(.34,1.56,.64,1);
  }
  .up-menu-row:hover .up-row-chevron { transform: translateX(3px); color:#16a34a; }
  .up-row-chevron { transition: transform .2s, color .2s; }

  /* Logout row */
  .up-logout-row {
    transition: background .15s, padding-left .18s;
  }
  .up-logout-row:hover { background:#fff5f5; padding-left: 28px; }
  .up-logout-row:hover .up-logout-icon { transform: scale(1.1) rotate(5deg); background:#fecaca; }
  .up-logout-icon { transition: background .2s, transform .2s cubic-bezier(.34,1.56,.64,1); }
  .up-logout-row:hover .up-logout-chevron { transform:translateX(3px); color:#dc2626; }
  .up-logout-chevron { transition: transform .2s, color .2s; }

  /* Spinner */
  .up-spinner {
    width:36px; height:36px;
    border:3px solid rgba(22,163,74,.2);
    border-top-color:#16a34a;
    border-radius:50%;
    animation:up-spinner .8s linear infinite;
  }
`;

function injectStyles() {
    if (typeof document === "undefined") return;
    if (document.getElementById("up-styles")) return;
    const el = document.createElement("style");
    el.id = "up-styles";
    el.textContent = CSS;
    document.head.appendChild(el);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name?: string, email?: string) {
    if (name) {
        const parts = name.trim().split(" ");
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return parts[0][0].toUpperCase();
    }
    return email ? email[0].toUpperCase() : "U";
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function UserProfile() {
    injectStyles();

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, token } = useAppSelector((s) => s.auth);

    useEffect(() => {
        if (!token || !user) navigate("/login", { replace: true });
    }, [token, user, navigate]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="up-spinner" />
            </div>
        );
    }

    const u = user as UserWithName;
    const displayName = u.fullName ?? u.name ?? u.email ?? "Khách hàng";
    const initials = getInitials(u.fullName ?? u.name, u.email);
    const isAdmin = u.role === "ADMIN";
    const roleLabel = isAdmin ? "Quản trị viên" : "Khách hàng";

    const handleLogout = () => { dispatch(logout()); navigate("/login", { replace: true }); };

    const menuItems = [
        { icon: Package, label: "Đơn hàng của tôi", desc: "Xem và theo dõi đơn hàng", onClick: () => navigate("/orders") },
        { icon: KeyRound, label: "Đổi mật khẩu", desc: "Đặt lại mật khẩu qua email", onClick: () => navigate("/forgot-password") },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-14">
            <div className="max-w-md mx-auto px-4">

                {/* ── Profile card ── */}
                <div className="up-card up-profile-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">

                    {/* Top strip with dot pattern */}
                    <div className="h-20 bg-white border-b border-gray-100 relative overflow-hidden">
                        <svg className="absolute inset-0 w-full h-full opacity-[.04]" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <circle cx="2" cy="2" r="2" fill="#16a34a" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#dots)" />
                        </svg>
                        {/* Subtle green accent line */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />
                    </div>

                    {/* Avatar + info */}
                    <div className="px-6 pb-6 -mt-10 relative">
                        <div className="up-avatar-wrap w-20 h-20 rounded-2xl bg-white shadow-md border-2 border-white inline-flex items-center justify-center up-avatar">
                            <div className="w-full h-full rounded-xl bg-green-600 flex items-center justify-center text-white text-2xl font-bold select-none">
                                {initials}
                            </div>
                        </div>

                        <div className="up-info mt-3">
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">{displayName}</h1>
                            <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                <span className="text-xs truncate">{u.email}</span>
                            </div>
                            <span className={`up-badge inline-flex items-center gap-1 mt-2.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isAdmin ? "bg-amber-50 border border-amber-200 text-amber-700" : "bg-green-50 border border-green-200 text-green-700"}`}>
                                {isAdmin
                                    ? <Shield className="w-3 h-3" />
                                    : <User className="w-3 h-3" />}
                                {roleLabel}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Menu ── */}
                <div className="up-menu bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">

                    {menuItems.map(({ icon: Icon, label, desc, onClick }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={onClick}
                            className="up-menu-row w-full px-5 py-4 flex items-center gap-4 text-left"
                        >
                            <div className="up-row-icon w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                <Icon className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">{label}</p>
                                <p className="text-xs text-gray-400 truncate mt-0.5">{desc}</p>
                            </div>
                            <ChevronRight className="up-row-chevron w-4 h-4 text-gray-300 shrink-0" />
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="up-logout-row w-full px-5 py-4 flex items-center gap-4 text-left"
                    >
                        <div className="up-logout-icon w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                            <LogOut className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-red-600">Đăng xuất</p>
                            <p className="text-xs text-gray-400 mt-0.5">Thoát khỏi tài khoản</p>
                        </div>
                        <ChevronRight className="up-logout-chevron w-4 h-4 text-gray-300 shrink-0" />
                    </button>
                </div>

                {/* ── User ID footer ── */}
                {u.id && (
                    <p className="up-menu text-center text-xs text-gray-300 mt-5 font-mono">
                        ID: {u.id}
                    </p>
                )}
            </div>
        </div>
    );
}