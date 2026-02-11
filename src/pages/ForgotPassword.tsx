import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import BonSaiImage from "@/assets/image/BonSaiImage.png";
import Logo from "@/assets/image/Logo.png";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    passwordForgotThunk,
    passwordResendThunk,
    passwordVerifyThunk,
    passwordResetThunk,
    resetPassword,
} from "@/store/slices/authSlice";

/* =======================
   Schemas
======================= */

const emailSchema = Yup.object({
    email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
});

const otpSchema = Yup.object({
    otp: Yup.string()
        .length(6, "OTP phải gồm 6 chữ số")
        .required("Vui lòng nhập OTP"),
});

const resetSchema = Yup.object({
    newPassword: Yup.string()
        .min(6, "Mật khẩu phải ít nhất 6 ký tự")
        .required("Vui lòng nhập mật khẩu mới"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Mật khẩu không khớp")
        .required("Vui lòng xác nhận mật khẩu"),
});

/* =======================
   Component
======================= */

export default function ForgotPassword() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { passwordStep, passwordMail, loading, error } = useAppSelector(
        (state) => state.auth,
    );

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    /* ---------- STEP 1: EMAIL ---------- */
    const emailFormik = useFormik({
        initialValues: { email: "" },
        validationSchema: emailSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                await dispatch(passwordForgotThunk(values)).unwrap();
            } catch (err) {
                console.error(err);
            } finally {
                setSubmitting(false);
            }
        },
    });

    /* ---------- STEP 2: OTP ---------- */
    const otpFormik = useFormik({
        initialValues: { otp: "" },
        validationSchema: otpSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                if (!passwordMail) return;
                await dispatch(
                    passwordVerifyThunk({ email: passwordMail, otp: values.otp }),
                ).unwrap();
            } catch (err) {
                console.error(err);
            } finally {
                setSubmitting(false);
            }
        },
    });

    /* ---------- STEP 3: RESET PASSWORD ---------- */
    const resetFormik = useFormik({
        initialValues: { newPassword: "", confirmPassword: "" },
        validationSchema: resetSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                if (!passwordMail) return;
                await dispatch(
                    passwordResetThunk({
                        email: passwordMail,
                        newPassword: values.newPassword,
                        confirmPassword: values.confirmPassword,
                    }),
                ).unwrap();
            } catch (err) {
                console.error(err);
            } finally {
                setSubmitting(false);
            }
        },
    });

    /* =======================
       UI RENDER
    ======================= */

    return (
        <div className="min-h-screen flex">
            {/* ========== LEFT PANEL ========== */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 to-green-700 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
                    <img
                        src={BonSaiImage}
                        alt="BonSai"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="relative z-10 flex flex-col gap-4 text-white">
                    <div
                        className="flex items-center gap-2 cursor-pointer text-white 
             transition-all duration-200 
             hover:text-green-200 hover:translate-x-[-2px]"
                        onClick={() => navigate("/login")}
                    >
                        <ArrowLeft className="w-6 h-6" />
                        <span className="hover:underline underline-offset-4">
                            Quay lại đăng nhập
                        </span>
                    </div>

                    <div className="flex items-center">
                        <img
                            src={Logo}
                            alt="Logo"
                            className="w-35 h-auto transition-transform hover:scale-110 -ml-10"
                        />
                        <span className="text-2xl font-bold absolute ml-20">
                            Green Space
                        </span>
                    </div>
                </div>

                <div className="relative z-10">
                    <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                        Khôi phục
                        <br />
                        tài khoản của bạn
                    </h1>
                    <div className="w-30 h-2 bg-white mb-6 rounded-full" />
                    <p className="text-green-50 text-lg max-w-md">
                        @ 2025 Cửa hàng cây cảnh BonSai. Bảo lưu mọi quyền
                    </p>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-green-600/50 to-green-800/50 mix-blend-multiply pointer-events-none z-0"></div>
            </div>

            {/* ========== RIGHT PANEL ========== */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center mb-8">
                        <img
                            src={Logo}
                            alt="Logo"
                            className="w-24 h-auto transition-transform hover:scale-110 absolute -ml-40"
                        />
                        <span className="text-2xl font-bold text-gray-900 ml-10">
                            Green Space
                        </span>
                    </div>

                    {/* Title */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {passwordStep === "email" && "Quên mật khẩu"}
                            {passwordStep === "otp" && "Xác thực OTP"}
                            {passwordStep === "reset" && "Tạo mật khẩu mới"}
                            {passwordStep === "done" && "Thành công 🎉"}
                        </h2>
                        <p className="text-gray-500">
                            {passwordStep === "email" &&
                                "Nhập email để nhận mã xác thực."}
                            {passwordStep === "otp" &&
                                "Nhập mã OTP đã gửi về email của bạn."}
                            {passwordStep === "reset" &&
                                "Tạo mật khẩu mới cho tài khoản của bạn."}
                            {passwordStep === "done" &&
                                "Mật khẩu của bạn đã được cập nhật thành công."}
                        </p>
                    </div>

                    {/* ========== STEP 1: EMAIL ========== */}
                    {passwordStep === "email" && (
                        <form className="space-y-6" onSubmit={emailFormik.handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={emailFormik.values.email}
                                        onChange={emailFormik.handleChange}
                                        onBlur={emailFormik.handleBlur}
                                        placeholder="Nhập email của bạn"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                    />
                                </div>
                                {emailFormik.touched.email && emailFormik.errors.email && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {emailFormik.errors.email}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={emailFormik.isSubmitting || loading}
                                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg shadow-green-500/30"
                            >
                                Gửi mã OTP
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                        </form>
                    )}

                    {/* ========== STEP 2: OTP ========== */}
                    {passwordStep === "otp" && (
                        <form className="space-y-6" onSubmit={otpFormik.handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mã OTP
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <ShieldCheck className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        value={otpFormik.values.otp}
                                        onChange={otpFormik.handleChange}
                                        onBlur={otpFormik.handleBlur}
                                        placeholder="Nhập mã OTP gồm 6 chữ số"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                    />
                                </div>
                                {otpFormik.touched.otp && otpFormik.errors.otp && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {otpFormik.errors.otp}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={otpFormik.isSubmitting || loading}
                                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg shadow-green-500/30"
                            >
                                Xác nhận OTP
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            <button
                                type="button"
                                disabled={loading}
                                onClick={() =>
                                    passwordMail &&
                                    dispatch(passwordResendThunk({ email: passwordMail }))
                                }
                                className="w-full text-sm text-green-600 hover:text-green-700 hover:underline"
                            >
                                Gửi lại mã OTP
                            </button>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                        </form>
                    )}

                    {/* ========== STEP 3: RESET PASSWORD ========== */}
                    {passwordStep === "reset" && (
                        <form className="space-y-6" onSubmit={resetFormik.handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu mới
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={resetFormik.values.newPassword}
                                        onChange={resetFormik.handleChange}
                                        onBlur={resetFormik.handleBlur}
                                        placeholder="Nhập mật khẩu mới"
                                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {resetFormik.touched.newPassword &&
                                    resetFormik.errors.newPassword && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {resetFormik.errors.newPassword}
                                        </p>
                                    )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Xác nhận mật khẩu
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={resetFormik.values.confirmPassword}
                                        onChange={resetFormik.handleChange}
                                        onBlur={resetFormik.handleBlur}
                                        placeholder="Nhập lại mật khẩu mới"
                                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {resetFormik.touched.confirmPassword &&
                                    resetFormik.errors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {resetFormik.errors.confirmPassword}
                                        </p>
                                    )}
                            </div>

                            <button
                                type="submit"
                                disabled={resetFormik.isSubmitting || loading}
                                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg shadow-green-500/30"
                            >
                                Đặt lại mật khẩu
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                        </form>
                    )}

                    {/* ========== STEP 4: DONE ========== */}
                    {passwordStep === "done" && (
                        <div className="space-y-6 text-center">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                            </div>

                            <p className="text-gray-600">
                                Mật khẩu của bạn đã được cập nhật thành công.
                            </p>

                            <button
                                onClick={() => {
                                    dispatch(resetPassword());
                                    navigate("/login");
                                }}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg shadow-green-500/30"
                            >
                                Quay lại đăng nhập
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
