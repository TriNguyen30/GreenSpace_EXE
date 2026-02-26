import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Mail, Package, KeyRound, LogOut, ChevronRight, Shield,
    Phone, MapPin, Home, Info, CheckCircle, XCircle,
    Pencil, Loader2, X, Save,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { axiosInstance } from "@/lib/axios";
import { updateUser } from "@/services/user.service";
import type { User as UserType, ApiResponse } from "@/types/user";

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

  .up-card    { animation: up-card-in  .5s cubic-bezier(.22,.68,0,1) .06s both; }
  .up-menu    { animation: up-fade-up  .45s ease .18s both; }
  .up-info    { animation: up-fade-up  .45s ease .1s  both; }
  .up-details { animation: up-fade-up  .45s ease .25s both; }

  .up-avatar { animation: up-avatar-in .55s cubic-bezier(.34,1.56,.64,1) .12s both; }
  .up-avatar-wrap {
    transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s;
  }
  .up-avatar-wrap:hover {
    transform: scale(1.06) rotate(-3deg);
    box-shadow: 0 8px 24px rgba(22,163,74,.25);
  }

  .up-badge { animation: up-badge-in .4s cubic-bezier(.34,1.56,.64,1) .3s both; }
  .up-profile-card { transition: box-shadow .25s ease; }
  .up-profile-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,.08); }

  .up-info-row { transition: background .15s; }
  .up-info-row:hover { background: #f9fafb; }

  .up-menu-row { transition: background .15s, padding-left .18s; }
  .up-menu-row:hover { padding-left: 28px; }
  .up-menu-row:hover .up-row-icon { transform: scale(1.1) rotate(-5deg); background: #dcfce7; }
  .up-row-icon { transition: background .2s, transform .2s cubic-bezier(.34,1.56,.64,1); }
  .up-menu-row:hover .up-row-chevron { transform: translateX(3px); color:#16a34a; }
  .up-row-chevron { transition: transform .2s, color .2s; }

  .up-logout-row { transition: background .15s, padding-left .18s; }
  .up-logout-row:hover { background:#fff5f5; padding-left: 28px; }
  .up-logout-row:hover .up-logout-icon { transform: scale(1.1) rotate(5deg); background:#fecaca; }
  .up-logout-icon { transition: background .2s, transform .2s cubic-bezier(.34,1.56,.64,1); }
  .up-logout-row:hover .up-logout-chevron { transform:translateX(3px); color:#dc2626; }
  .up-logout-chevron { transition: transform .2s, color .2s; }

  .up-spinner {
    width:36px; height:36px;
    border:3px solid rgba(22,163,74,.2);
    border-top-color:#16a34a;
    border-radius:50%;
    animation:up-spinner .8s linear infinite;
  }

  .up-input {
    transition: border-color .2s, box-shadow .2s;
  }
  .up-input:focus {
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22,163,74,.12);
    outline: none;
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

function mapResponseToUser(item: any): UserType {
    return {
        ...item,
        id: item.userId || item.id || "",
        userId: item.userId || item.id || "",
        firstName: item.firstName || "",
        lastName: item.lastName || "",
        fullName:
            item.fullName ||
            `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
            item.email?.split("@")[0] ||
            "Unknown",
        phoneNumber: item.phoneNumber || null,
        address: item.address || null,
        editAddress: item.address || item.editAddress || "",
        additionalAddress: item.additionalAddress || "",
        role: item.role || "CUSTOMER",
        createdAt: item.createdAt || null,
        updatedAt: item.updatedAt || null,
        birthday: item.birthday || null,
        status: item.status || null,
        isActive: item.isActive ?? true,
    };
}

type EditFormState = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    editAddress: string;
    additionalAddress: string;
};

function profileToEditForm(p: UserType): EditFormState {
    const parts = (p.fullName || "").trim().split(/\s+/);
    const firstName = p.firstName || (parts.length > 0 ? parts[0] : "");
    const lastName = p.lastName || (parts.length > 1 ? parts.slice(1).join(" ") : parts.length === 1 ? "" : "");
    return {
        firstName,
        lastName,
        phoneNumber: p.phoneNumber ?? "",
        editAddress: p.editAddress ?? p.address ?? "",
        additionalAddress: p.additionalAddress ?? "",
    };
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────
type InfoRowProps = {
    icon: React.ElementType;
    label: string;
    value: string;
    mono?: boolean;
    badge?: boolean;
    badgeGreen?: boolean;
};

function InfoRow({ icon: Icon, label, value, mono, badge, badgeGreen }: InfoRowProps) {
    const isEmpty = !value || value === "—";
    return (
        <div className="up-info-row px-5 py-3.5 flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                {badge ? (
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badgeGreen
                                ? "bg-green-50 border border-green-200 text-green-700"
                                : "bg-amber-50 border border-amber-200 text-amber-700"
                            }`}
                    >
                        {badgeGreen ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {value}
                    </span>
                ) : (
                    <p
                        className={`text-sm break-all leading-snug ${isEmpty
                                ? "text-gray-300 italic text-xs"
                                : mono
                                    ? "text-gray-500 font-mono text-xs"
                                    : "text-gray-800 font-medium"
                            }`}
                    >
                        {isEmpty ? "Chưa cập nhật" : value}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function UserProfile() {
    injectStyles();

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { token } = useAppSelector((s) => s.auth);

    const [profile, setProfile] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<EditFormState>({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        editAddress: "",
        additionalAddress: "",
    });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get<ApiResponse<any>>("/Users/me");
                const body = res.data;

                if (body && typeof body === "object" && "data" in body && body.data) {
                    setProfile(mapResponseToUser(body.data));
                } else if (body && typeof body === "object") {
                    setProfile(mapResponseToUser(body));
                } else {
                    setError("Không thể tải thông tin người dùng.");
                }
            } catch (err) {
                console.error("Failed to fetch /Users/me:", err);
                setError("Đã xảy ra lỗi khi tải hồ sơ.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token, navigate]);

    // Sync edit form when entering edit mode
    useEffect(() => {
        if (profile && editing) {
            setForm(profileToEditForm(profile));
        }
    }, [editing, profile]);

    const startEditing = () => {
        if (profile) {
            setForm(profileToEditForm(profile));
            setSaveError(null);
            setEditing(true);
        }
    };

    const cancelEditing = () => {
        setEditing(false);
        setSaveError(null);
    };

    const handleSaveProfile = async () => {
        if (!profile) return;
        setSaving(true);
        setSaveError(null);
        try {
            const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim() || profile.fullName;
            const updated = await updateUser(profile.userId || profile.id, {
                email: profile.email,
                fullName,
                phoneNumber: form.phoneNumber.trim() || "",
                editAddress: form.editAddress.trim() || "",
                additionalAddress: form.additionalAddress.trim() || "",
            });
            setProfile(mapResponseToUser({ ...updated, userId: updated.userId || updated.id }));
            setEditing(false);
        } catch (err) {
            console.error("Failed to update profile:", err);
            setSaveError("Không thể cập nhật. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login", { replace: true });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="up-spinner" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <p className="text-sm text-red-500">{error ?? "Không tìm thấy người dùng."}</p>
                <button type="button" onClick={handleLogout} className="text-xs text-gray-400 underline">
                    Đăng xuất
                </button>
            </div>
        );
    }

    const displayName = profile.fullName || profile.email || "Khách hàng";
    const initials = getInitials(profile.fullName, profile.email);
    const isAdmin = profile.role === "ADMIN";
    const roleLabel = isAdmin ? "Quản trị viên" : "Khách hàng";

    const menuItems = [
        {
            icon: Package,
            label: "Đơn hàng của tôi",
            desc: "Xem và theo dõi đơn hàng",
            onClick: () => navigate("/orders"),
        },
        {
            icon: KeyRound,
            label: "Đổi mật khẩu",
            desc: "Đặt lại mật khẩu qua email",
            onClick: () => navigate("/forgot-password"),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-14">
            <div className="max-w-md mx-auto px-4">

                {/* ── Profile card ── */}
                <div className="up-card up-profile-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
                    <div className="h-20 bg-white border-b border-gray-100 relative overflow-hidden">
                        <svg className="absolute inset-0 w-full h-full opacity-[.04]" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <circle cx="2" cy="2" r="2" fill="#16a34a" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#dots)" />
                        </svg>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />
                    </div>

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
                                <span className="text-xs truncate">{profile.email}</span>
                            </div>
                            <span
                                className={`up-badge inline-flex items-center gap-1 mt-2.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isAdmin
                                        ? "bg-amber-50 border border-amber-200 text-amber-700"
                                        : "bg-green-50 border border-green-200 text-green-700"
                                    }`}
                            >
                                {isAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                {roleLabel}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── All User Info ── */}
                <div className="up-details bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
                    <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Info className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Thông tin chi tiết
                            </span>
                        </div>
                        {!editing ? (
                            <button
                                type="button"
                                onClick={startEditing}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-green-600 bg-green-50 border border-green-200 hover:bg-green-100 transition-colors"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                Chỉnh sửa
                            </button>
                        ) : null}
                    </div>

                    {editing ? (
                        <div className="p-5 space-y-4">
                            {saveError && (
                                <p className="text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                                    {saveError}
                                </p>
                            )}
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                    Họ
                                </label>
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                                    className="up-input w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50"
                                    placeholder="Nhập họ"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                    Tên
                                </label>
                                <input
                                    type="text"
                                    value={form.firstName}
                                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                                    className="up-input w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50"
                                    placeholder="Nhập tên"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    value={form.phoneNumber}
                                    onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                                    className="up-input w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50"
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                    Địa chỉ
                                </label>
                                <input
                                    type="text"
                                    value={form.editAddress}
                                    onChange={(e) => setForm((f) => ({ ...f, editAddress: e.target.value }))}
                                    className="up-input w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50"
                                    placeholder="Nhập địa chỉ"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                    Địa chỉ bổ sung
                                </label>
                                <input
                                    type="text"
                                    value={form.additionalAddress}
                                    onChange={(e) => setForm((f) => ({ ...f, additionalAddress: e.target.value }))}
                                    className="up-input w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50"
                                    placeholder="Số nhà, tòa nhà, v.v."
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelEditing}
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Hủy
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            <InfoRow icon={Mail} label="Email" value={profile.email} />
                            <InfoRow icon={User} label="Họ (Last name)" value={profile.lastName || "—"} />
                            <InfoRow icon={User} label="Tên (First name)" value={profile.firstName || "—"} />
                            <InfoRow icon={Phone} label="Số điện thoại" value={profile.phoneNumber ?? "—"} />
                            <InfoRow icon={MapPin} label="Địa chỉ" value={profile.address ?? profile.editAddress ?? "—"} />
                            <InfoRow icon={Home} label="Địa chỉ bổ sung" value={profile.additionalAddress || "—"} />
                            <InfoRow
                                icon={CheckCircle}
                                label="Trạng thái tài khoản"
                                value={profile.isActive ? "Đang hoạt động" : "Đã bị khóa"}
                                badge
                                badgeGreen={profile.isActive}
                            />
                        </div>
                    )}
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
            </div>
        </div>
    );
}