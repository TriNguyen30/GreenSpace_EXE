import React, { useState, useEffect, useRef } from "react";
import {
    Mail, Lock, Eye, EyeOff, ArrowRight,
    ArrowLeft, ShieldCheck, CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import BonSaiImage from "@/assets/image/BonSaiImage.png";
import Logo from "@/assets/image/Logo.png";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    passwordForgotThunk, passwordResendThunk,
    passwordVerifyThunk, passwordResetThunk, resetPassword,
} from "@/store/slices/authSlice";

// ─── Styles (mirrors ln-/rg- patterns exactly) ────────────────────────────────
const STYLES = `
  @keyframes fp-panel-left {
    from { opacity:0; transform:translateX(-60px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes fp-panel-right {
    from { opacity:0; transform:translateX(60px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes fp-fade-up {
    from { opacity:0; transform:translateY(22px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fp-fade-down {
    from { opacity:0; transform:translateY(-16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fp-scale-in {
    from { opacity:0; transform:scale(0.82); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes fp-float-a {
    0%,100% { transform:translateY(0px)   rotate(-8deg)  scale(1);    opacity:.18; }
    50%      { transform:translateY(-22px) rotate(-2deg)  scale(1.05); opacity:.28; }
  }
  @keyframes fp-float-b {
    0%,100% { transform:translateY(0px)  rotate(12deg) scale(1);    opacity:.15; }
    50%      { transform:translateY(18px) rotate(6deg)  scale(.95);  opacity:.22; }
  }
  @keyframes fp-float-c {
    0%,100% { transform:translateY(0px)   rotate(-4deg) scale(1);    opacity:.12; }
    50%      { transform:translateY(-14px) rotate(4deg)  scale(1.08); opacity:.2;  }
  }
  @keyframes fp-bg-pulse {
    0%,100% { background-position:0%   50%; }
    50%      { background-position:100% 50%; }
  }
  @keyframes fp-leaf-drift {
    from { transform:rotate(0deg)  translateY(0); }
    to   { transform:rotate(360deg) translateY(-4px); }
  }
  @keyframes fp-divider-grow {
    from { transform:scaleX(0); }
    to   { transform:scaleX(1); }
  }
  @keyframes fp-step-in {
    from { opacity:0; transform:translateX(32px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes fp-input-glow {
    from { box-shadow:0 0 0 0 rgba(34,197,94,.4); }
    to   { box-shadow:0 0 0 6px rgba(34,197,94,0); }
  }
  @keyframes fp-error-shake {
    0%,100% { transform:translateX(0); }
    20%     { transform:translateX(-5px); }
    40%     { transform:translateX(5px); }
    60%     { transform:translateX(-3px); }
    80%     { transform:translateX(3px); }
  }
  @keyframes fp-success-scale {
    0%  { opacity:0; transform:scale(.6) rotate(-10deg); }
    60% { transform:scale(1.12) rotate(3deg); }
    100%{ opacity:1; transform:scale(1) rotate(0deg); }
  }
  @keyframes fp-success-ring {
    0%   { box-shadow:0 0 0 0 rgba(34,197,94,.45); }
    100% { box-shadow:0 0 0 20px rgba(34,197,94,0); }
  }
  @keyframes fp-spinner {
    to { transform:rotate(360deg); }
  }

  /* Panel mounts */
  .fp-left  { animation:fp-panel-left  .7s cubic-bezier(.22,.68,0,1) both; }
  .fp-right { animation:fp-panel-right .7s cubic-bezier(.22,.68,0,1) .08s both; }

  /* Left panel animated bg */
  .fp-left-bg {
    background:linear-gradient(135deg,#15803d,#22c55e,#166534,#4ade80);
    background-size:300% 300%;
    animation:fp-bg-pulse 8s ease infinite;
  }

  /* Floaters */
  .fp-leaf-a { animation:fp-float-a 8s  ease-in-out infinite; }
  .fp-leaf-b { animation:fp-float-b 10s ease-in-out infinite 1.5s; }
  .fp-leaf-c { animation:fp-float-c 7s  ease-in-out infinite 3s; }
  .fp-leaf-d { animation:fp-float-a 9s  ease-in-out infinite 2s; }
  .fp-leaf-e { animation:fp-float-b 11s ease-in-out infinite 4s; }
  .fp-leaf-spin { animation:fp-leaf-drift 12s linear infinite; }

  /* Left panel content */
  .fp-logo-anim  { animation:fp-scale-in   .55s cubic-bezier(.34,1.56,.64,1) .15s both; }
  .fp-back-btn   { animation:fp-fade-down  .4s  ease .1s both; }
  .fp-hero-text  { animation:fp-fade-up    .6s  ease .35s both; }
  .fp-hero-line  { animation:fp-divider-grow .5s ease .55s both; transform-origin:left; }
  .fp-hero-foot  { animation:fp-fade-up    .5s  ease .65s both; }

  /* Right panel */
  .fp-heading    { animation:fp-fade-down  .55s cubic-bezier(.22,.68,0,1) .28s both; }
  .fp-s1 { animation:fp-fade-up .5s ease .32s both; }
  .fp-s2 { animation:fp-fade-up .5s ease .42s both; }
  .fp-s3 { animation:fp-fade-up .5s ease .52s both; }
  .fp-s4 { animation:fp-fade-up .5s ease .62s both; }
  .fp-s5 { animation:fp-fade-up .5s ease .72s both; }

  /* Step transition */
  .fp-step-enter { animation:fp-step-in .35s cubic-bezier(.22,.68,0,1) both; }

  /* Step progress dots */
  .fp-dot {
    transition:background .3s, transform .3s, width .3s;
    border-radius:999px;
  }
  .fp-dot.active  { background:#16a34a; transform:scale(1.2); width:28px; }
  .fp-dot.done    { background:#16a34a; }
  .fp-dot.pending { background:#d1d5db; }

  /* Input */
  .fp-input:focus {
    animation:fp-input-glow .5s ease forwards;
    border-color:#22c55e !important;
    box-shadow:0 0 0 3px rgba(34,197,94,.18);
  }

  /* Submit btn */
  .fp-submit-btn {
    background:linear-gradient(90deg,#16a34a,#22c55e,#16a34a,#22c55e);
    background-size:300% auto;
    transition:background-position .6s ease,transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s;
  }
  .fp-submit-btn:hover:not(:disabled) {
    background-position:right center;
    transform:translateY(-2px) scale(1.02);
    box-shadow:0 8px 24px rgba(22,163,74,.4);
  }
  .fp-submit-btn:active:not(:disabled) { transform:scale(.97); }
  .fp-submit-btn:disabled { background:#86efac; cursor:not-allowed; }

  /* Resend / secondary link */
  .fp-resend { transition:color .15s,letter-spacing .2s; }
  .fp-resend:hover { color:#15803d; letter-spacing:.02em; }

  /* Eye btn */
  .fp-eye-btn { transition:color .15s,transform .2s; }
  .fp-eye-btn:hover { color:#374151; transform:scale(1.12); }

  /* Error */
  .fp-error-msg   { animation:fp-fade-up .3s ease both; }
  .fp-error-shake { animation:fp-error-shake .4s ease; }

  /* Spinner */
  .fp-spinner {
    width:18px;height:18px;
    border:2px solid rgba(255,255,255,.4);
    border-top-color:#fff;
    border-radius:50%;
    animation:fp-spinner .7s linear infinite;
  }

  /* Success */
  .fp-success-icon { animation:fp-success-scale .6s cubic-bezier(.34,1.56,.64,1) both; }
  .fp-success-ring { animation:fp-success-ring .8s ease .3s both; }

  /* OTP input */
  .fp-otp {
    text-align:center;font-size:1.25rem;font-weight:700;letter-spacing:.1em;
    transition:border-color .2s,box-shadow .2s,transform .15s;
  }
  .fp-otp:focus {
    border-color:#22c55e;
    box-shadow:0 0 0 3px rgba(34,197,94,.2);
    transform:scale(1.04);
    outline:none;
  }

  /* Password strength bar */
  .fp-strength-bar { transition:width .35s ease,background .35s ease; }
`;

function injectFPStyles() {
    if (typeof document === "undefined") return;
    if (document.getElementById("fp-styles")) return;
    const tag = document.createElement("style");
    tag.id = "fp-styles";
    tag.textContent = STYLES;
    document.head.appendChild(tag);
}

// ─── Floating leaf ────────────────────────────────────────────────────────────
function FloatLeaf({ className, size = 48, style }: {
    className?: string; size?: number; style?: React.CSSProperties;
}) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 8-8 8C11.82 10 10 9.1 9 8H7c0 2.5 1.5 5 4 7.1V17h2v-1.9c2.5 1.8 4 4.4 4 6.9h2c0-3-1.5-6.5-4-8.5C16.5 11.5 17 8 17 8z" />
        </svg>
    );
}

// ─── Step progress dots ───────────────────────────────────────────────────────
const STEP_ORDER = ["email", "otp", "reset", "done"] as const;
type StepKey = typeof STEP_ORDER[number];
const STEP_LABELS = ["Email", "OTP", "Mật khẩu"];

function StepDots({ current }: { current: StepKey }) {
    const idx = STEP_ORDER.indexOf(current);
    return (
        <div className="flex items-center justify-center gap-2 mb-6 fp-s1">
            {STEP_LABELS.map((label, i) => {
                const state = i < idx ? "done" : i === idx ? "active" : "pending";
                return (
                    <React.Fragment key={i}>
                        <div className="flex flex-col items-center gap-1">
                            <div className={`fp-dot h-2 ${state === "active" ? "w-7" : "w-2"} ${state}`} />
                            <span className="text-xs font-medium transition-colors duration-300"
                                style={{ color: state === "pending" ? "#9ca3af" : "#16a34a" }}>
                                {label}
                            </span>
                        </div>
                        {i < STEP_LABELS.length - 1 && (
                            <div className="h-px mb-4 transition-all duration-500"
                                style={{ width: 24, background: i < idx ? "#16a34a" : "#e5e7eb" }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ─── Password strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
    const score = !password ? 0
        : password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4
            : password.length >= 8 && /[A-Z0-9]/.test(password) ? 3
                : password.length >= 6 ? 2
                    : 1;

    const info = [
        null,
        { label: "Yếu", color: "#ef4444", w: "25%" },
        { label: "Trung bình", color: "#f97316", w: "50%" },
        { label: "Khá", color: "#eab308", w: "75%" },
        { label: "Mạnh", color: "#16a34a", w: "100%" },
    ][score];

    if (!password) return null;
    return (
        <div className="mt-2">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="fp-strength-bar h-full rounded-full"
                    style={{ width: info?.w, background: info?.color }} />
            </div>
            <p className="text-xs mt-1 font-medium" style={{ color: info?.color }}>{info?.label}</p>
        </div>
    );
}

// ─── Schemas ──────────────────────────────────────────────────────────────────
const emailSchema = Yup.object({
    email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
});
const otpSchema = Yup.object({
    otp: Yup.string().length(6, "OTP phải gồm 6 chữ số").required("Vui lòng nhập OTP"),
});
const resetSchema = Yup.object({
    newPassword: Yup.string().min(6, "Ít nhất 6 ký tự").required("Vui lòng nhập mật khẩu mới"),
    confirmPassword: Yup.string().oneOf([Yup.ref("newPassword")], "Mật khẩu không khớp").required("Vui lòng xác nhận"),
});

// ─── Main component ───────────────────────────────────────────────────────────
export default function ForgotPassword() {
    injectFPStyles();

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { passwordStep, passwordMail, loading, error } = useAppSelector((s) => s.auth);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [stepKey, setStepKey] = useState(0);
    const errorRef = useRef<HTMLDivElement>(null);
    const prevStep = useRef(passwordStep);

    // Retrigger step animation on step change
    useEffect(() => {
        if (prevStep.current !== passwordStep) {
            setStepKey((k) => k + 1);
            prevStep.current = passwordStep;
        }
    }, [passwordStep]);

    // Shake error on new error
    useEffect(() => {
        if (error && errorRef.current) {
            errorRef.current.classList.remove("fp-error-shake");
            void errorRef.current.offsetWidth;
            errorRef.current.classList.add("fp-error-shake");
        }
    }, [error]);

    /* Formiks */
    const emailFormik = useFormik({
        initialValues: { email: "" },
        validationSchema: emailSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try { await dispatch(passwordForgotThunk(values)).unwrap(); }
            catch (e) { console.error(e); }
            finally { setSubmitting(false); }
        },
    });

    const otpFormik = useFormik({
        initialValues: { otp: "" },
        validationSchema: otpSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                if (!passwordMail) return;
                await dispatch(passwordVerifyThunk({ email: passwordMail, otp: values.otp })).unwrap();
            } catch (e) { console.error(e); }
            finally { setSubmitting(false); }
        },
    });

    const resetFormik = useFormik({
        initialValues: { newPassword: "", confirmPassword: "" },
        validationSchema: resetSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                if (!passwordMail) return;
                await dispatch(passwordResetThunk({ email: passwordMail, newPassword: values.newPassword, confirmPassword: values.confirmPassword })).unwrap();
            } catch (e) { console.error(e); }
            finally { setSubmitting(false); }
        },
    });

    const headings: Record<string, string> = {
        email: "Quên mật khẩu", otp: "Xác thực OTP",
        reset: "Tạo mật khẩu mới", done: "Thành công!",
    };
    const subtitles: Record<string, string> = {
        email: "Nhập email để nhận mã xác thực.",
        otp: `Nhập mã OTP đã gửi về ${passwordMail ?? "email của bạn"}.`,
        reset: "Tạo mật khẩu mới cho tài khoản.",
        done: "Mật khẩu đã được cập nhật thành công.",
    };

    const isSubmitting = emailFormik.isSubmitting || otpFormik.isSubmitting || resetFormik.isSubmitting;

    return (
        <div className="min-h-screen flex overflow-hidden">

            {/* ── Left panel ────────────────────────────────────────────── */}
            <div className="fp-left hidden lg:flex lg:w-1/2 fp-left-bg p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-8 pointer-events-none z-0">
                    <img src={BonSaiImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/40 to-green-900/60 pointer-events-none z-0" />

                {/* Top */}
                <div className="relative z-10 flex flex-col gap-4 text-white">
                    <div
                        className="fp-back-btn flex items-center gap-2 cursor-pointer text-white/90 hover:text-white w-fit"
                        style={{ transition: "all .2s" }}
                        onClick={() => navigate("/login")}
                        onMouseEnter={e => (e.currentTarget.style.transform = "translateX(-3px)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "translateX(0)")}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium hover:underline underline-offset-4">Quay lại đăng nhập</span>
                    </div>
                    <div className="fp-logo-anim flex items-center gap-2">
                        <img src={Logo} alt="Logo" className="w-24 h-auto drop-shadow-lg" />
                        <span className="text-2xl font-bold tracking-wide">Green Space</span>
                    </div>
                </div>

                {/* Bottom */}
                <div className="relative z-10">
                    <h1 className="fp-hero-text text-5xl font-bold text-white mb-6 leading-tight drop-shadow-md">
                        Khôi phục<br />tài khoản của bạn
                    </h1>
                    <div className="fp-hero-line h-2 bg-white/80 mb-6 rounded-full" style={{ width: "120px" }} />
                    <p className="fp-hero-foot text-green-50/80 text-sm">
                        © 2025 Cửa hàng cây cảnh BonSai. Bảo lưu mọi quyền.
                    </p>
                </div>
            </div>

            {/* ── Right panel ───────────────────────────────────────────── */}
            <div className="fp-right w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8 fp-s1">
                        <img src={Logo} alt="Logo" className="w-12 h-auto" />
                        <span className="text-2xl font-bold text-gray-900">Green Space</span>
                    </div>

                    {/* Heading */}
                    {passwordStep !== "done" && (
                        <div className="fp-heading mb-5">
                            <h2 className="text-3xl font-bold text-gray-900 mb-1">{headings[passwordStep]}</h2>
                            <p className="text-gray-500 text-sm">{subtitles[passwordStep]}</p>
                        </div>
                    )}

                    {/* Step progress */}
                    {passwordStep !== "done" && <StepDots current={passwordStep as StepKey} />}

                    {/* Error */}
                    {error && (
                        <div ref={errorRef} className="fp-error-msg mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                            <span className="text-base">⚠️</span> {error}
                        </div>
                    )}

                    {/* ── STEP 1: EMAIL ── */}
                    {passwordStep === "email" && (
                        <div key={`fp-email-${stepKey}`} className="fp-step-enter space-y-5">
                            <form onSubmit={emailFormik.handleSubmit} className="space-y-5">
                                <div className="fp-s3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="w-4 h-4 transition-colors duration-200"
                                                style={{ color: emailFormik.values.email ? "#16a34a" : "#9ca3af" }} />
                                        </div>
                                        <input
                                            id="email" name="email" type="email"
                                            value={emailFormik.values.email}
                                            onChange={emailFormik.handleChange}
                                            onBlur={emailFormik.handleBlur}
                                            placeholder="Nhập email của bạn"
                                            className="fp-input w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none transition-all duration-200 bg-white hover:border-gray-400 text-sm"
                                        />
                                    </div>
                                    {emailFormik.touched.email && emailFormik.errors.email && (
                                        <p className="fp-error-msg mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                            <span>⚠</span> {emailFormik.errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="fp-s4">
                                    <button type="submit" disabled={isSubmitting || loading} className="fp-submit-btn w-full text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
                                        {isSubmitting || loading
                                            ? <><span className="fp-spinner" /><span>Đang gửi...</span></>
                                            : <>Gửi mã OTP <ArrowRight className="w-4 h-4" /></>}
                                    </button>
                                </div>

                                <div className="fp-s5 text-center">
                                    <button type="button" onClick={() => navigate("/login")}
                                        className="fp-resend text-sm text-green-600 font-medium">
                                        Quay lại đăng nhập
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ── STEP 2: OTP ── */}
                    {passwordStep === "otp" && (
                        <div key={`fp-otp-${stepKey}`} className="fp-step-enter space-y-5">
                            <form onSubmit={otpFormik.handleSubmit} className="space-y-5">
                                <div className="fp-s3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Mã OTP
                                        {passwordMail && (
                                            <span className="text-gray-400 font-normal ml-1">
                                                (gửi đến <span className="text-green-600 font-medium">{passwordMail}</span>)
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        id="otp" name="otp" type="text" maxLength={6}
                                        value={otpFormik.values.otp}
                                        onChange={otpFormik.handleChange}
                                        onBlur={otpFormik.handleBlur}
                                        placeholder="• • • • • •"
                                        className="fp-otp fp-input w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm"
                                    />
                                    {otpFormik.touched.otp && otpFormik.errors.otp && (
                                        <p className="fp-error-msg mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                            <span>⚠</span> {otpFormik.errors.otp}
                                        </p>
                                    )}
                                </div>

                                <div className="fp-s4">
                                    <button type="submit" disabled={isSubmitting || loading} className="fp-submit-btn w-full text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
                                        {isSubmitting || loading
                                            ? <><span className="fp-spinner" /><span>Đang xác nhận...</span></>
                                            : <>Xác nhận OTP <ArrowRight className="w-4 h-4" /></>}
                                    </button>
                                </div>

                                <div className="fp-s5 text-center">
                                    <button type="button" disabled={loading}
                                        onClick={() => passwordMail && dispatch(passwordResendThunk({ email: passwordMail }))}
                                        className="fp-resend text-sm text-green-600 font-medium disabled:opacity-50">
                                        Gửi lại mã OTP
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ── STEP 3: RESET ── */}
                    {passwordStep === "reset" && (
                        <div key={`fp-reset-${stepKey}`} className="fp-step-enter space-y-5">
                            <form onSubmit={resetFormik.handleSubmit} className="space-y-4">
                                {/* New password */}
                                <div className="fp-s2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu mới</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="w-4 h-4 transition-colors duration-200"
                                                style={{ color: resetFormik.values.newPassword ? "#16a34a" : "#9ca3af" }} />
                                        </div>
                                        <input
                                            id="newPassword" name="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            value={resetFormik.values.newPassword}
                                            onChange={resetFormik.handleChange}
                                            onBlur={resetFormik.handleBlur}
                                            placeholder="Nhập mật khẩu mới"
                                            className="fp-input w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl outline-none transition-all duration-200 bg-white hover:border-gray-400 text-sm"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="fp-eye-btn absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <PasswordStrength password={resetFormik.values.newPassword} />
                                    {resetFormik.touched.newPassword && resetFormik.errors.newPassword && (
                                        <p className="fp-error-msg mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                            <span>⚠</span> {resetFormik.errors.newPassword}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm password */}
                                <div className="fp-s3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="w-4 h-4 transition-colors duration-200"
                                                style={{ color: resetFormik.values.confirmPassword ? "#16a34a" : "#9ca3af" }} />
                                        </div>
                                        <input
                                            id="confirmPassword" name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={resetFormik.values.confirmPassword}
                                            onChange={resetFormik.handleChange}
                                            onBlur={resetFormik.handleBlur}
                                            placeholder="Nhập lại mật khẩu mới"
                                            className="fp-input w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl outline-none transition-all duration-200 bg-white hover:border-gray-400 text-sm"
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="fp-eye-btn absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400">
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword && (
                                        <p className="fp-error-msg mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                            <span>⚠</span> {resetFormik.errors.confirmPassword}
                                        </p>
                                    )}
                                </div>

                                <div className="fp-s4 pt-1">
                                    <button type="submit" disabled={isSubmitting || loading} className="fp-submit-btn w-full text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
                                        {isSubmitting || loading
                                            ? <><span className="fp-spinner" /><span>Đang cập nhật...</span></>
                                            : <>Đặt lại mật khẩu <ArrowRight className="w-4 h-4" /></>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ── STEP 4: DONE ── */}
                    {passwordStep === "done" && (
                        <div key={`fp-done-${stepKey}`} className="fp-step-enter text-center space-y-6 py-8">
                            <div className="fp-heading mb-2">
                                <h2 className="text-3xl font-bold text-gray-900 mb-1">{headings.done}</h2>
                                <p className="text-gray-500 text-sm">{subtitles.done}</p>
                            </div>

                            <div className="flex justify-center">
                                <div className="fp-success-ring w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                                    <CheckCircle className="fp-success-icon w-10 h-10 text-green-500" />
                                </div>
                            </div>

                            <button
                                onClick={() => { dispatch(resetPassword()); navigate("/login"); }}
                                className="fp-submit-btn w-full text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                            >
                                Quay lại đăng nhập <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}