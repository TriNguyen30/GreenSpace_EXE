import React, { useState, useEffect, useRef } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import BonSaiImage from "@/assets/image/BonSaiImage.png";
import Logo from "@/assets/image/Logo.png";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginThunk } from "@/store/slices/authSlice";
import type { LoginPayload } from "@/types/api";
import { FcGoogle } from "react-icons/fc";

// ─── Inject keyframes ────────────────────────────────────────────────────────
const STYLES = `
  @keyframes ln-panel-left {
    from { opacity: 0; transform: translateX(-60px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes ln-panel-right {
    from { opacity: 0; transform: translateX(60px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes ln-fade-up {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ln-fade-down {
    from { opacity: 0; transform: translateY(-16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ln-scale-in {
    from { opacity: 0; transform: scale(0.82); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes ln-float-a {
    0%,100% { transform: translateY(0px)   rotate(-8deg)  scale(1);   opacity:.18; }
    50%      { transform: translateY(-22px) rotate(-2deg)  scale(1.05);opacity:.28; }
  }
  @keyframes ln-float-b {
    0%,100% { transform: translateY(0px)  rotate(12deg) scale(1);    opacity:.15; }
    50%      { transform: translateY(18px) rotate(6deg)  scale(0.95); opacity:.22; }
  }
  @keyframes ln-float-c {
    0%,100% { transform: translateY(0px)   rotate(-4deg) scale(1);    opacity:.12; }
    50%      { transform: translateY(-14px) rotate(4deg)  scale(1.08); opacity:.2;  }
  }
  @keyframes ln-underline-slide {
    from { transform: scaleX(0); transform-origin: left; }
    to   { transform: scaleX(1); transform-origin: left; }
  }
  @keyframes ln-input-glow {
    from { box-shadow: 0 0 0 0 rgba(34,197,94,.4); }
    to   { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
  }
  @keyframes ln-btn-shimmer {
    from { background-position: 200% center; }
    to   { background-position: -200% center; }
  }
  @keyframes ln-spinner {
    to { transform: rotate(360deg); }
  }
  @keyframes ln-error-shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-5px); }
    40%     { transform: translateX(5px); }
    60%     { transform: translateX(-3px); }
    80%     { transform: translateX(3px); }
  }
  @keyframes ln-success-pop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.04); }
    100% { transform: scale(1); }
  }
  @keyframes ln-leaf-drift {
    0%   { transform: rotate(0deg) translateY(0); }
    100% { transform: rotate(360deg) translateY(-4px); }
  }
  @keyframes ln-bg-pulse {
    0%,100% { background-position: 0% 50%; }
    50%      { background-position: 100% 50%; }
  }
  @keyframes ln-divider-grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  /* Left panel mount */
  .ln-left  { animation: ln-panel-left .7s cubic-bezier(.22,.68,0,1) both; }
  .ln-right { animation: ln-panel-right .7s cubic-bezier(.22,.68,0,1) .08s both; }

  /* Botanical floaters */
  .ln-leaf-a { animation: ln-float-a 8s  ease-in-out infinite; }
  .ln-leaf-b { animation: ln-float-b 10s ease-in-out infinite 1.5s; }
  .ln-leaf-c { animation: ln-float-c 7s  ease-in-out infinite 3s; }
  .ln-leaf-d { animation: ln-float-a 9s  ease-in-out infinite 2s; }
  .ln-leaf-e { animation: ln-float-b 11s ease-in-out infinite 4s; }

  /* Left panel animated gradient bg */
  .ln-left-bg {
    background: linear-gradient(135deg, #15803d, #22c55e, #166534, #4ade80);
    background-size: 300% 300%;
    animation: ln-bg-pulse 8s ease infinite;
  }

  /* Form elements stagger */
  .ln-stagger-1  { animation: ln-fade-up .5s ease .32s both; }
  .ln-stagger-2  { animation: ln-fade-up .5s ease .42s both; }
  .ln-stagger-3  { animation: ln-fade-up .5s ease .52s both; }
  .ln-stagger-4  { animation: ln-fade-up .5s ease .62s both; }
  .ln-stagger-5  { animation: ln-fade-up .5s ease .72s both; }
  .ln-stagger-6  { animation: ln-fade-up .5s ease .82s both; }
  .ln-stagger-7  { animation: ln-fade-up .5s ease .92s both; }
  .ln-stagger-8  { animation: ln-fade-up .5s ease 1.02s both; }

  .ln-heading    { animation: ln-fade-down .55s cubic-bezier(.22,.68,0,1) .28s both; }
  .ln-logo-anim  { animation: ln-scale-in .55s cubic-bezier(.34,1.56,.64,1) .15s both; }
  .ln-hero-text  { animation: ln-fade-up .6s ease .35s both; }
  .ln-hero-line  { animation: ln-divider-grow .5s ease .55s both; transform-origin: left; }
  .ln-hero-foot  { animation: ln-fade-up .5s ease .65s both; }
  .ln-back-btn   { animation: ln-fade-down .4s ease .1s both; }

  /* Tab underline */
  .ln-tab-bar {
    transform: scaleX(1);
    transform-origin: left;
    animation: ln-underline-slide .3s cubic-bezier(.34,1.56,.64,1) both;
  }

  /* Input focus ring pulse */
  .ln-input:focus {
    animation: ln-input-glow .5s ease forwards;
    border-color: #22c55e !important;
    box-shadow: 0 0 0 3px rgba(34,197,94,.18);
  }

  /* Submit button shimmer on hover */
  .ln-submit-btn {
    background: linear-gradient(90deg, #16a34a, #22c55e, #16a34a, #22c55e);
    background-size: 300% auto;
    transition: background-position .6s ease, transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
  }
  .ln-submit-btn:hover:not(:disabled) {
    background-position: right center;
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 24px rgba(22,163,74,.4);
  }
  .ln-submit-btn:active:not(:disabled) {
    transform: scale(.97);
  }
  .ln-submit-btn:disabled {
    background: #86efac;
    cursor: not-allowed;
  }

  /* Error shake */
  .ln-error-shake { animation: ln-error-shake .4s ease; }

  /* Error message */
  .ln-error-msg { animation: ln-fade-up .3s ease both; }

  /* Google btn */
  .ln-google-btn {
    transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s, background .15s;
  }
  .ln-google-btn:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 4px 16px rgba(0,0,0,.1);
    background: #f9fafb;
  }
  .ln-google-btn:active { transform: scale(.97); }

  /* Divider grow */
  .ln-divider { animation: ln-divider-grow .5s ease .95s both; transform-origin: center; }

  /* Forgot password link */
  .ln-forgot {
    transition: color .15s, letter-spacing .2s;
  }
  .ln-forgot:hover { color: #15803d; letter-spacing: .02em; }

  /* Password eye btn */
  .ln-eye-btn {
    transition: color .15s, transform .2s;
  }
  .ln-eye-btn:hover { color: #374151; transform: scale(1.12); }

  /* Left panel spinning leaf accent */
  .ln-leaf-spin { animation: ln-leaf-drift 12s linear infinite; }

  /* Spinner for loading state */
  .ln-spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ln-spinner .7s linear infinite;
  }
`;

function injectLoginStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("ln-styles")) return;
  const tag = document.createElement("style");
  tag.id = "ln-styles";
  tag.textContent = STYLES;
  document.head.appendChild(tag);
}

// ─── Validation ───────────────────────────────────────────────────────────────
const loginSchema = Yup.object({
  email: Yup.string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),
  password: Yup.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Vui lòng nhập mật khẩu"),
});

// ─── Floating leaf SVG ────────────────────────────────────────────────────────
function FloatLeaf({
  className,
  size = 48,
  style,
}: {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={style}
    >
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 8-8 8v0C11.82 10 10 9.1 9 8H7c0 2.5 1.5 5 4 7.1V17h2v-1.9c2.5 1.8 4 4.4 4 6.9h2c0-3-1.5-6.5-4-8.5C16.5 11.5 17 8 17 8z" />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Login() {
  injectLoginStyles();

  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { error, loading } = useAppSelector((state) => state.auth);

  // Shake error div when error appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.classList.remove("ln-error-shake");
      void errorRef.current.offsetWidth; // reflow
      errorRef.current.classList.add("ln-error-shake");
    }
  }, [error]);

  const formik = useFormik<LoginPayload>({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError(false);
      try {
        const result = await dispatch(loginThunk(values)).unwrap();
        if (result.user.role === "ADMIN") navigate("/admin");
        else navigate("/");
      } catch (err) {
        setSubmitError(true);
        console.error("Login failed:", err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── Left Panel ─────────────────────────────────────────────────────── */}
      <div className="ln-left hidden lg:flex lg:w-1/2 ln-left-bg p-12 flex-col justify-between relative overflow-hidden">

        {/* BonSai bg image */}
        <div className="absolute inset-0 opacity-8 pointer-events-none z-0">
          <img src={BonSaiImage} alt="" className="w-full h-full object-cover" />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/40 to-green-900/60 pointer-events-none z-0" />

        {/* Top row */}
        <div className="relative z-10 flex flex-col gap-4 text-white">
          <div
            className="ln-back-btn group flex items-center gap-2 cursor-pointer text-white/90 hover:text-white w-fit"
            style={{ transition: "all .2s" }}
            onClick={() => navigate("/")}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateX(-3px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "translateX(0)")}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hover:underline underline-offset-4">Quay lại trang chủ</span>
          </div>

          <div className="ln-logo-anim flex items-center gap-2">
            <img src={Logo} alt="Logo" className="w-24 h-auto drop-shadow-lg" />
            <span className="text-2xl font-bold tracking-wide">Green Space</span>
          </div>
        </div>

        {/* Bottom copy */}
        <div className="relative z-10">
          <h1 className="ln-hero-text text-5xl font-bold text-white mb-6 leading-tight drop-shadow-md">
            Mang thiên nhiên vào
            <br />
            không gian của bạn
          </h1>
          <div
            className="ln-hero-line h-2 bg-white/80 mb-6 rounded-full"
            style={{ width: "120px" }}
          />
          <p className="ln-hero-foot text-green-50/80 text-sm">
            © 2025 Cửa hàng cây cảnh BonSai. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────────────────────────── */}
      <div className="ln-right w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8 ln-stagger-1">
            <img src={Logo} alt="Logo" className="w-12 h-auto" />
            <span className="text-2xl font-bold text-gray-900">Green Space</span>
          </div>

          {/* Tabs */}
          <div className="ln-stagger-1 flex border-b border-gray-200 mb-8">
            {[
              { key: "login", label: "Đăng nhập" },
              { key: "register", label: "Đăng ký" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  if (key === "register") navigate("/register");
                }}
                className={`flex-1 pb-4 text-center font-semibold relative transition-colors duration-200 ${activeTab === key
                    ? "text-green-600"
                    : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                {label}
                {activeTab === key && (
                  <span className="ln-tab-bar absolute left-0 bottom-0 w-full h-0.5 bg-green-500 rounded-full block" />
                )}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="ln-heading mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Chào mừng bạn!</h2>
            <p className="text-gray-500 text-sm">Vui lòng nhập thông tin để đăng nhập.</p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={formik.handleSubmit}>

            {/* Email */}
            <div className="ln-stagger-3">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail
                    className="w-4 h-4 transition-colors duration-200"
                    style={{ color: formik.values.email ? "#16a34a" : "#9ca3af" }}
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Nhập email của bạn"
                  className="ln-input w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none transition-all duration-200 bg-white hover:border-gray-400 text-sm"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="ln-error-msg mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <span>⚠</span> {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="ln-stagger-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    className="w-4 h-4 transition-colors duration-200"
                    style={{ color: formik.values.password ? "#16a34a" : "#9ca3af" }}
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Nhập mật khẩu của bạn"
                  className="ln-input w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl outline-none transition-all duration-200 bg-white hover:border-gray-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ln-eye-btn absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="ln-error-msg mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <span>⚠</span> {formik.errors.password}
                </p>
              )}
            </div>

            {/* Forgot password */}
            <div className="ln-stagger-5 text-right -mt-2">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="ln-forgot text-sm text-green-600 font-medium"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit */}
            <div className="ln-stagger-6">
              <button
                type="submit"
                disabled={formik.isSubmitting || loading}
                className="ln-submit-btn w-full text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                {formik.isSubmitting || loading ? (
                  <>
                    <span className="ln-spinner" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div
                ref={errorRef}
                className="ln-error-msg bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"
              >
                <span className="text-base">⚠️</span>
                {error}
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="my-7 ln-stagger-7 flex items-center gap-4">
            <div className="ln-divider flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">Hoặc tiếp tục với</span>
            <div className="ln-divider flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <div className="ln-stagger-8">
            <button className="ln-google-btn w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm text-sm font-medium text-gray-700">
              <FcGoogle className="w-5 h-5" />
              Đăng nhập với Google
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}