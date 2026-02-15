import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    Package,
    KeyRound,
    LogOut,
    ChevronRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

type UserWithName = { fullName?: string; name?: string; email?: string; role?: string; id?: string };

export default function UserProfile() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, token } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!token || !user) {
            navigate("/login", { replace: true });
        }
    }, [token, user, navigate]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50/30 to-white">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const u = user as UserWithName;
    const displayName = u.fullName ?? u.name ?? u.email ?? "Khách hàng";
    const roleLabel = u.role === "ADMIN" ? "Quản trị viên" : "Khách hàng";

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login", { replace: true });
    };

    const menuItems = [
        {
            icon: Package,
            label: "Đơn hàng của tôi",
            description: "Xem và theo dõi đơn hàng",
            onClick: () => navigate("/orders"),
        },
        {
            icon: KeyRound,
            label: "Đổi mật khẩu",
            description: "Đặt lại mật khẩu qua email",
            onClick: () => navigate("/forgot-password"),
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-24 pb-12">
            <div className="max-w-xl mx-auto px-4">
                {/* Profile card */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                    <div className="h-24 bg-gradient-to-r from-green-500 to-green-600" />
                    <div className="px-6 pb-6 -mt-12 relative">
                        <div className="w-24 h-24 rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center text-green-600">
                            <User className="w-12 h-12" />
                        </div>
                        <div className="mt-4">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {displayName}
                            </h1>
                            <div className="flex items-center gap-2 mt-1 text-gray-500">
                                <Mail className="w-4 h-4 shrink-0" />
                                <span className="text-sm">{u.email}</span>
                            </div>
                            <span
                                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                                    u.role === "ADMIN"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-green-100 text-green-700"
                                }`}
                            >
                                {roleLabel}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick links */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 divide-y divide-gray-100">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.label}
                                type="button"
                                onClick={item.onClick}
                                className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-gray-50/80 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900">
                                        {item.label}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {item.description}
                                    </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-red-50/80 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-red-600">
                                Đăng xuất
                            </p>
                            <p className="text-sm text-gray-500">
                                Thoát khỏi tài khoản
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                    </button>
                </div>
            </div>
        </div>
    );
}
