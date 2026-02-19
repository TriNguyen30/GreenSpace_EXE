import React, { useState, useEffect, useRef } from "react";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
  User, Phone, CheckCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import BonSaiImage from "@/assets/image/BonSaiImage.png";
import Logo from "@/assets/image/Logo.png";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  registerInitiateThunk, registerVerifyThunk,
  registerResendThunk, registerFinalizeThunk, resetRegister,
} from "@/store/slices/authSlice";

// ─── Inject keyframes (reuses ln- prefix for consistency with Login) ──────────
const STYLES = `
  @keyframes rg-panel-left {
    from { opacity: 0; transform: translateX(-60px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes rg-panel-right {
    from { opacity: 0; transform: translateX(60px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes rg-fade-up {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes rg-fade-down {
    from { opacity: 0; transform: translateY(-16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes rg-scale-in {
    from { opacity: 0; transform: scale(0.82); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes rg-float-a {
    0%,100% { transform: translateY(0px)   rotate(-8deg)  scale(1);    opacity:.18; }
    50%      { transform: translateY(-22px) rotate(-2deg)  scale(1.05); opacity:.28; }
  }
  @keyframes rg-float-b {
    0%,100% { transform: translateY(0px)  rotate(12deg) scale(1);    opacity:.15; }
    50%      { transform: translateY(18px) rotate(6deg)  scale(0.95); opacity:.22; }
  }
  @keyframes rg-float-c {
    0%,100% { transform: translateY(0px)   rotate(-4deg) scale(1);    opacity:.12; }
    50%      { transform: translateY(-14px) rotate(4deg)  scale(1.08); opacity:.2;  }
  }
  @keyframes rg-bg-pulse {
    0%,100% { background-position: 0%   50%; }
    50%      { background-position: 100% 50%; }
  }
  @keyframes rg-leaf-drift {
    from { transform: rotate(0deg) translateY(0); }
    to   { transform: rotate(360deg) translateY(-4px); }
  }
  @keyframes rg-underline-slide {
    from { transform: scaleX(0); transform-origin: left; }
    to   { transform: scaleX(1); transform-origin: left; }
  }
  @keyframes rg-input-glow {
    from { box-shadow: 0 0 0 0 rgba(34,197,94,.4); }
    to   { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
  }
  @keyframes rg-btn-shimmer {
    from { background-position: 200% center; }
    to   { background-position: -200% center; }
  }
  @keyframes rg-spinner {
    to { transform: rotate(360deg); }
  }
  @keyframes rg-error-shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-5px); }
    40%     { transform: translateX(5px); }
    60%     { transform: translateX(-3px); }
    80%     { transform: translateX(3px); }
  }
  @keyframes rg-divider-grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  /* Step transition */
  @keyframes rg-step-in {
    from { opacity: 0; transform: translateX(32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes rg-step-out {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(-32px); }
  }
  /* OTP digit focus */
  @keyframes rg-otp-pop {
    0%  { transform: scale(1); }
    40% { transform: scale(1.08); }
    100%{ transform: scale(1); }
  }
  /* Success burst */
  @keyframes rg-success-scale {
    0%  { opacity:0; transform: scale(0.6) rotate(-10deg); }
    60% { transform: scale(1.12) rotate(3deg); }
    100%{ opacity:1; transform: scale(1) rotate(0deg); }
  }
  @keyframes rg-success-ring {
    0%   { box-shadow: 0 0 0 0 rgba(34,197,94,.45); }
    100% { box-shadow: 0 0 0 20px rgba(34,197,94,0); }
  }
  /* Progress dots */
  @keyframes rg-dot-pulse {
    0%,100% { transform: scale(1);    opacity:.4; }
    50%      { transform: scale(1.35); opacity:1;  }
  }

  /* Left panel */
  .rg-left  { animation: rg-panel-left  .7s cubic-bezier(.22,.68,0,1) both; }
  .rg-right { animation: rg-panel-right .7s cubic-bezier(.22,.68,0,1) .08s both; }

  .rg-left-bg {
    background: linear-gradient(135deg, #15803d, #22c55e, #166534, #4ade80);
    background-size: 300% 300%;
    animation: rg-bg-pulse 8s ease infinite;
  }

  /* Floaters */
  .rg-leaf-a { animation: rg-float-a 8s  ease-in-out infinite; }
  .rg-leaf-b { animation: rg-float-b 10s ease-in-out infinite 1.5s; }
  .rg-leaf-c { animation: rg-float-c 7s  ease-in-out infinite 3s; }
  .rg-leaf-d { animation: rg-float-a 9s  ease-in-out infinite 2s; }
  .rg-leaf-e { animation: rg-float-b 11s ease-in-out infinite 4s; }
  .rg-leaf-spin { animation: rg-leaf-drift 12s linear infinite; }

  /* Mount stagger */
  .rg-logo-anim { animation: rg-scale-in  .55s cubic-bezier(.34,1.56,.64,1) .15s both; }
  .rg-back-btn  { animation: rg-fade-down .4s  ease .1s both; }
  .rg-hero-text { animation: rg-fade-up   .6s  ease .35s both; }
  .rg-hero-line { animation: rg-divider-grow .5s ease .55s both; transform-origin: left; }
  .rg-hero-foot { animation: rg-fade-up   .5s  ease .65s both; }
  .rg-heading   { animation: rg-fade-down .55s cubic-bezier(.22,.68,0,1) .28s both; }

  /* Form stagger */
  .rg-s1 { animation: rg-fade-up .5s ease .32s both; }
  .rg-s2 { animation: rg-fade-up .5s ease .42s both; }
  .rg-s3 { animation: rg-fade-up .5s ease .52s both; }
  .rg-s4 { animation: rg-fade-up .5s ease .62s both; }
  .rg-s5 { animation: rg-fade-up .5s ease .72s both; }
  .rg-s6 { animation: rg-fade-up .5s ease .82s both; }

  /* Step panels */
  .rg-step-enter { animation: rg-step-in  .35s cubic-bezier(.22,.68,0,1) both; }

  /* Tab underline */
  .rg-tab-bar { animation: rg-underline-slide .3s cubic-bezier(.34,1.56,.64,1) both; }

  /* Input */
  .rg-input:focus {
    animation: rg-input-glow .5s ease forwards;
    border-color: #22c55e !important;
    box-shadow: 0 0 0 3px rgba(34,197,94,.18);
  }

  /* Submit btn */
  .rg-submit-btn {
    background: linear-gradient(90deg, #16a34a, #22c55e, #16a34a, #22c55e);
    background-size: 300% auto;
    transition: background-position .6s ease, transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
  }
  .rg-submit-btn:hover:not(:disabled) {
    background-position: right center;
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 24px rgba(22,163,74,.4);
  }
  .rg-submit-btn:active:not(:disabled) { transform: scale(.97); }
  .rg-submit-btn:disabled { background: #86efac; cursor: not-allowed; }

  /* Resend btn */
  .rg-resend {
    transition: color .15s, letter-spacing .2s;
  }
  .rg-resend:hover { color: #15803d; letter-spacing: .02em; }

  /* Eye btn */
  .rg-eye-btn { transition: color .15s, transform .2s; }
  .rg-eye-btn:hover { color: #374151; transform: scale(1.12); }

  /* Error */
  .rg-error-msg   { animation: rg-fade-up .3s ease both; }
  .rg-error-shake { animation: rg-error-shake .4s ease; }

  /* Spinner */
  .rg-spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: rg-spinner .7s linear infinite;
  }

  /* Progress step dots */
  .rg-dot {
    transition: background .3s, transform .3s, width .3s;
    border-radius: 999px;
  }
  .rg-dot.active {
    background: #16a34a;
    transform: scale(1.2);
    width: 28px;
  }
  .rg-dot.done  { background: #16a34a; }
  .rg-dot.pending { background: #d1d5db; }

  /* OTP input */
  .rg-otp-input {
    transition: border-color .2s, box-shadow .2s, transform .15s;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: .1em;
  }
  .rg-otp-input:focus {
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34,197,94,.2);
    transform: scale(1.04);
    outline: none;
  }

  /* Success icon */
  .rg-success-icon { animation: rg-success-scale .6s cubic-bezier(.34,1.56,.64,1) both; }
  .rg-success-ring { animation: rg-success-ring .8s ease .3s both; }
`;

function injectRegisterStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("rg-styles")) return;
  const tag = document.createElement("style");
  tag.id = "rg-styles";
  tag.textContent = STYLES;
  document.head.appendChild(tag);
}

// ─── Validation ───────────────────────────────────────────────────────────────
const emailSchema = Yup.object({
  email: Yup.string().email("Email không hợp lệ").required("Bắt buộc"),
});
const otpSchema = Yup.object({
  otp: Yup.string().required("Bắt buộc").length(6, "OTP gồm 6 chữ số"),
});
const finalSchema = Yup.object({
  fullName: Yup.string().required("Bắt buộc"),
  phone: Yup.string()
    .matches(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ")
    .required("Bắt buộc"),
  password: Yup.string().min(6, "Ít nhất 6 ký tự").required("Bắt buộc"),
});

// ─── Floating leaf SVG ────────────────────────────────────────────────────────
function FloatLeaf({ className, size = 48, style }: {
  className?: string; size?: number; style?: React.CSSProperties;
}) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 8-8 8v0C11.82 10 10 9.1 9 8H7c0 2.5 1.5 5 4 7.1V17h2v-1.9c2.5 1.8 4 4.4 4 6.9h2c0-3-1.5-6.5-4-8.5C16.5 11.5 17 8 17 8z" />
    </svg>
  );
}

// ─── Step progress indicator ──────────────────────────────────────────────────
const STEP_ORDER = ["email", "otp", "final", "done"] as const;
type StepKey = typeof STEP_ORDER[number];

function StepDots({ current }: { current: StepKey }) {
  const idx = STEP_ORDER.indexOf(current);
  const labels = ["Email", "OTP", "Hoàn tất"];
  return (
    <div className="flex items-center justify-center gap-2 mb-6 rg-s1">
      {labels.map((label, i) => {
        const state = i < idx ? "done" : i === idx ? "active" : "pending";
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`rg-dot h-2 ${state === "active" ? "w-7" : "w-2"} ${state === "done" ? "done" : state === "active" ? "active" : "pending"
                  }`}
              />
              <span
                className="text-xs font-medium transition-colors duration-300"
                style={{ color: state === "pending" ? "#9ca3af" : "#16a34a" }}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className="h-px mb-4 transition-all duration-500"
                style={{
                  width: 24,
                  background: i < idx ? "#16a34a" : "#e5e7eb",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Shared field wrapper ─────────────────────────────────────────────────────
function FieldRow({
  name, label, type = "text", placeholder, icon, extra, stagger,
}: {
  name: string; label: string; type?: string; placeholder: string;
  icon: React.ReactNode; extra?: React.ReactNode; stagger: string;
}) {
  return (
    <div className={stagger}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {icon}
        </div>
        <Field
          name={name}
          type={type}
          placeholder={placeholder}
          className="rg-input w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl outline-none transition-all duration-200 bg-white hover:border-gray-400 text-sm"
        />
        {extra}
      </div>
      <ErrorMessage
        name={name}
        render={(msg) => (
          <p className="rg-error-msg mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span> {msg}
          </p>
        )}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Register() {
  injectRegisterStyles();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { loading, error, registerStep, registerMail } = useAppSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [stepKey, setStepKey] = useState(0); // increment to retrigger step animation
  const errorRef = useRef<HTMLDivElement>(null);

  // Shake error on change
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.classList.remove("rg-error-shake");
      void errorRef.current.offsetWidth;
      errorRef.current.classList.add("rg-error-shake");
    }
  }, [error]);

  // Bump key on step change to retrigger enter animation
  const prevStep = useRef(registerStep);
  useEffect(() => {
    if (prevStep.current !== registerStep) {
      setStepKey((k) => k + 1);
      prevStep.current = registerStep;
    }
  }, [registerStep]);

  /* Handlers */
  const handleEmailSubmit = async (values: { email: string }) => {
    await dispatch(registerInitiateThunk({ email: values.email })).unwrap();
  };
  const handleOtpSubmit = async (values: { otp: string }) => {
    if (!registerMail) return;
    await dispatch(registerVerifyThunk({ email: registerMail, otp: values.otp })).unwrap();
  };
  const handleFinalSubmit = async (values: { fullName: string; phone: string; password: string }) => {
    if (!registerMail) return;
    const [firstName, ...rest] = values.fullName.trim().split(" ");
    await dispatch(
      registerFinalizeThunk({
        email: registerMail, password: values.password,
        firstName, lastName: rest.join(" "),
        phoneNumber: values.phone, address: "",
      })
    ).unwrap();
    navigate("/login");
  };
  const handleResend = async () => {
    if (!registerMail) return;
    await dispatch(registerResendThunk({ email: registerMail }));
  };

  const stepSubtitle: Record<string, string> = {
    email: "Nhập email để nhận mã xác thực",
    otp: "Nhập mã OTP đã gửi về email",
    final: "Hoàn tất thông tin để tạo tài khoản",
    done: "",
  };

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── Left Panel ─────────────────────────────────────────────────── */}
      <div className="rg-left hidden lg:flex lg:w-1/2 rg-left-bg p-12 flex-col justify-between relative overflow-hidden">

        {/* BonSai bg */}
        <div className="absolute inset-0 opacity-8 pointer-events-none z-0">
          <img src={BonSaiImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/40 to-green-900/60 pointer-events-none z-0" />

        {/* Top */}
        <div className="relative z-10 flex flex-col gap-4 text-white">
          <div
            className="rg-back-btn flex items-center gap-2 cursor-pointer text-white/90 hover:text-white w-fit"
            style={{ transition: "all .2s" }}
            onClick={() => navigate("/")}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateX(-3px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "translateX(0)")}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hover:underline underline-offset-4">Quay lại trang chủ</span>
          </div>
          <div className="rg-logo-anim flex items-center gap-2">
            <img src={Logo} alt="Logo" className="w-24 h-auto drop-shadow-lg" />
            <span className="text-2xl font-bold tracking-wide">Green Space</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <h1 className="rg-hero-text text-5xl font-bold text-white mb-6 leading-tight drop-shadow-md">
            Mang thiên nhiên vào<br />không gian của bạn
          </h1>
          <div className="rg-hero-line h-2 bg-white/80 mb-6 rounded-full" style={{ width: "120px" }} />
          <p className="rg-hero-foot text-green-50/80 text-sm">
            © 2025 Cửa hàng cây cảnh BonSai. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────────────────────── */}
      <div className="rg-right w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8 rg-s1">
            <img src={Logo} alt="Logo" className="w-12 h-auto" />
            <span className="text-2xl font-bold text-gray-900">Green Space</span>
          </div>

          {/* Tabs */}
          <div className="rg-s1 flex border-b border-gray-200 mb-6">
            <button
              onClick={() => navigate("/login")}
              className="flex-1 pb-4 text-center font-semibold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              Đăng nhập
            </button>
            <button className="flex-1 pb-4 text-center font-semibold text-green-600 relative cursor-pointer">
              Đăng ký
              <span className="rg-tab-bar absolute left-0 bottom-0 w-full h-0.5 bg-green-500 rounded-full block" />
            </button>
          </div>

          {/* Heading */}
          {registerStep !== "done" && (
            <div className="rg-heading mb-5">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Tạo tài khoản mới</h2>
              <p className="text-gray-500 text-sm">{stepSubtitle[registerStep]}</p>
            </div>
          )}

          {/* Step progress dots */}
          {registerStep !== "done" && <StepDots current={registerStep as StepKey} />}

          {/* Error */}
          {error && (
            <div
              ref={errorRef}
              className="rg-error-msg mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2"
            >
              <span className="text-base">⚠️</span> {error}
            </div>
          )}

          {/* ── STEP 1: EMAIL ── */}
          {registerStep === "email" && (
            <div key={`step-email-${stepKey}`} className="rg-step-enter space-y-5">
              <Formik
                initialValues={{
                  email: (location.state as { prefillEmail?: string } | null)?.prefillEmail || "",
                }}
                validationSchema={emailSchema}
                onSubmit={handleEmailSubmit}
              >
                {({ isSubmitting, values }) => (
                  <Form className="space-y-5">
                    <div className="rg-s3">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail
                            className="w-4 h-4 transition-colors duration-200"
                            style={{ color: values.email ? "#16a34a" : "#9ca3af" }}
                          />
                        </div>
                        <Field
                          name="email"
                          type="email"
                          placeholder="Nhập email của bạn"
                          className="rg-input w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none transition-all duration-200 bg-white hover:border-gray-400 text-sm"
                        />
                      </div>
                      <ErrorMessage
                        name="email"
                        render={(msg) => (
                          <p className="rg-error-msg mt-1.5 text-xs text-red-500 flex items-center gap-1">
                            <span>⚠</span> {msg}
                          </p>
                        )}
                      />
                    </div>

                    <div className="rg-s4">
                      <button
                        type="submit"
                        disabled={loading || isSubmitting}
                        className="rg-submit-btn w-full text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading || isSubmitting ? (
                          <><span className="rg-spinner" /><span>Đang gửi...</span></>
                        ) : (
                          <>Gửi mã xác thực <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}

          {/* ── STEP 2: OTP ── */}
          {registerStep === "otp" && (
            <div key={`step-otp-${stepKey}`} className="rg-step-enter space-y-5">
              <Formik
                initialValues={{ otp: "" }}
                validationSchema={otpSchema}
                onSubmit={handleOtpSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-5">
                    <div className="rg-s3">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mã OTP
                        {registerMail && (
                          <span className="text-gray-400 font-normal ml-1">
                            (gửi đến <span className="text-green-600 font-medium">{registerMail}</span>)
                          </span>
                        )}
                      </label>
                      <Field
                        name="otp"
                        type="text"
                        maxLength={6}
                        placeholder="• • • • • •"
                        className="rg-otp-input rg-input w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm"
                      />
                      <ErrorMessage
                        name="otp"
                        render={(msg) => (
                          <p className="rg-error-msg mt-1.5 text-xs text-red-500 flex items-center gap-1">
                            <span>⚠</span> {msg}
                          </p>
                        )}
                      />
                    </div>

                    <div className="rg-s4">
                      <button
                        type="submit"
                        disabled={loading || isSubmitting}
                        className="rg-submit-btn w-full text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                      >
                        {loading || isSubmitting ? (
                          <><span className="rg-spinner" /><span>Đang xác nhận...</span></>
                        ) : (
                          <>Xác nhận <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </div>

                    <div className="rg-s5 text-center">
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={loading}
                        className="rg-resend text-sm text-green-600 font-medium disabled:opacity-50 cursor-pointer"
                      >
                        Gửi lại mã OTP
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}

          {/* ── STEP 3: FINAL ── */}
          {registerStep === "final" && (
            <div key={`step-final-${stepKey}`} className="rg-step-enter space-y-5">
              <Formik
                initialValues={{ fullName: "", phone: "", password: "" }}
                validationSchema={finalSchema}
                onSubmit={handleFinalSubmit}
              >
                {({ isSubmitting, values }) => (
                  <Form className="space-y-4">
                    {/* Full name */}
                    <div className="rg-s2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="w-4 h-4 transition-colors duration-200"
                            style={{ color: values.fullName ? "#16a34a" : "#9ca3af" }} />
                        </div>
                        <Field
                          name="fullName" type="text" placeholder="Nguyễn Văn A"
                          className="rg-input w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none transition-all duration-200 bg-white hover:border-gray-400 text-sm"
                        />
                      </div>
                      <ErrorMessage name="fullName"
                        render={(msg) => <p className="rg-error-msg mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {msg}</p>} />
                    </div>

                    {/* Phone */}
                    <div className="rg-s3">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="w-4 h-4 transition-colors duration-200"
                            style={{ color: values.phone ? "#16a34a" : "#9ca3af" }} />
                        </div>
                        <Field
                          name="phone" type="tel" placeholder="Nhập số điện thoại"
                          className="rg-input w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none transition-all duration-200 bg-white hover:border-gray-400 text-sm"
                        />
                      </div>
                      <ErrorMessage name="phone"
                        render={(msg) => <p className="rg-error-msg mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {msg}</p>} />
                    </div>

                    {/* Password */}
                    <div className="rg-s4">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="w-4 h-4 transition-colors duration-200"
                            style={{ color: values.password ? "#16a34a" : "#9ca3af" }} />
                        </div>
                        <Field
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu"
                          className="rg-input w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl outline-none transition-all duration-200 bg-white hover:border-gray-400 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="rg-eye-btn absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <ErrorMessage name="password"
                        render={(msg) => <p className="rg-error-msg mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {msg}</p>} />
                    </div>

                    <div className="rg-s5 pt-1">
                      <button
                        type="submit"
                        disabled={loading || isSubmitting}
                        className="rg-submit-btn w-full text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading || isSubmitting ? (
                          <><span className="rg-spinner" /><span>Đang tạo tài khoản...</span></>
                        ) : (
                          <>Hoàn tất đăng ký <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}

          {/* ── STEP DONE ── */}
          {registerStep === "done" && (
            <div
              key={`step-done-${stepKey}`}
              className="rg-step-enter text-center space-y-6 py-8"
            >
              <div className="flex justify-center">
                <div
                  className="rg-success-ring w-20 h-20 rounded-full bg-green-50 flex items-center justify-center"
                >
                  <CheckCircle className="rg-success-icon w-10 h-10 text-green-500" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h3>
                <p className="text-gray-500 text-sm">Tài khoản của bạn đã được tạo. Đăng nhập để khám phá.</p>
              </div>
              <button
                onClick={() => { dispatch(resetRegister()); navigate("/login"); }}
                className="rg-submit-btn w-full text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                Đăng nhập ngay <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}