import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  User, 
  Phone,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import BonSaiImage from "@/assets/image/BonSaiImage.png";
import Logo from "@/assets/image/Logo.png";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  registerInitiateThunk,
  registerVerifyThunk,
  registerResendThunk,
  registerFinalizeThunk,
  resetRegister,
} from "@/store/slices/authSlice";

/* ================= VALIDATION ================= */

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

/* ================= COMPONENT ================= */

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { loading, error, registerStep, registerMail } = useAppSelector(
    (state) => state.auth,
  );

  const [showPassword, setShowPassword] = useState(false);

  /* ================= HANDLERS ================= */

  const handleEmailSubmit = async (values: { email: string }) => {
    await dispatch(registerInitiateThunk({ email: values.email })).unwrap();
  };

  const handleOtpSubmit = async (values: { otp: string }) => {
    if (!registerMail) return;
    await dispatch(
      registerVerifyThunk({ email: registerMail, otp: values.otp }),
    ).unwrap();
  };

  const handleFinalSubmit = async (values: {
    fullName: string;
    phone: string;
    password: string;
  }) => {
    if (!registerMail) return;

    const [firstName, ...rest] = values.fullName.trim().split(" ");

    await dispatch(
      registerFinalizeThunk({
        email: registerMail,
        password: values.password,
        firstName,
        lastName: rest.join(" "),
        phoneNumber: values.phone,
        address: "",
      }),
    ).unwrap();

    navigate("/login");
  };

  const handleResend = async () => {
    if (!registerMail) return;
    await dispatch(registerResendThunk({ email: registerMail }));
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 to-green-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src={BonSaiImage}
            alt="BonSai"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 flex flex-col gap-4 text-white">
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-green-200"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Quay lại trang chủ</span>
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
            Mang thiên nhiên vào
            <br />
            không gian của bạn
          </h1>
          <div className="w-30 h-2 bg-white mb-6 rounded-full" />
          <p className="text-green-50 text-lg max-w-md">
            @ 2025 Cửa hàng cây cảnh BonSai. Bảo lưu mọi quyền
          </p>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-green-600/50 to-green-800/50 mix-blend-multiply"></div>
      </div>

      {/* Right Panel */}
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

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => navigate("/login")}
              className="flex-1 pb-4 text-center font-semibold text-gray-400 hover:text-gray-600"
            >
              Đăng nhập
            </button>

            <button className="flex-1 pb-4 text-center font-semibold text-green-600 relative">
              Đăng ký
              <span className="absolute left-0 bottom-0 w-full h-1 bg-green-500 rounded-full" />
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Tạo tài khoản mới
            </h2>
            <p className="text-gray-500">
              {registerStep === "email" && "Nhập email để nhận mã xác thực"}
              {registerStep === "otp" && "Nhập mã OTP đã gửi về email"}
              {registerStep === "final" &&
                "Hoàn tất thông tin để tạo tài khoản"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          {/* ================= STEP 1: EMAIL ================= */}
          {registerStep === "email" && (
            <Formik
              initialValues={{
                email:
                  // Ưu tiên email truyền từ Home (state)
                  (location.state as { prefillEmail?: string } | null)
                    ?.prefillEmail || "",
              }}
              validationSchema={emailSchema}
              onSubmit={handleEmailSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <Field
                        name="email"
                        type="email"
                        placeholder="Nhập email của bạn"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/30"
                  >
                    Gửi mã xác thực
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {/* ================= STEP 2: OTP ================= */}
          {registerStep === "otp" && (
            <Formik
              initialValues={{ otp: "" }}
              validationSchema={otpSchema}
              onSubmit={handleOtpSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã OTP
                    </label>
                    <Field
                      name="otp"
                      type="text"
                      placeholder="Nhập mã OTP"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    />
                    <ErrorMessage
                      name="otp"
                      component="p"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/30"
                  >
                    Xác nhận
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="w-full text-sm text-green-600 hover:underline"
                  >
                    Gửi lại mã OTP
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {/* ================= STEP 3: FINAL ================= */}
          {registerStep === "final" && (
            <Formik
              initialValues={{ fullName: "", phone: "", password: "" }}
              validationSchema={finalSchema}
              onSubmit={handleFinalSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-5">
                  {/* Full name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <Field
                        name="fullName"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                    <ErrorMessage
                      name="fullName"
                      component="p"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="w-5 h-5 text-gray-400" />
                      </div>
                      <Field
                        name="phone"
                        type="tel"
                        placeholder="Nhập số điện thoại"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                    <ErrorMessage
                      name="phone"
                      component="p"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <Field
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu"
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
                    <ErrorMessage
                      name="password"
                      component="p"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/30"
                  >
                    Hoàn tất đăng ký
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {/* ================= STEP DONE ================= */}
          {registerStep === "done" && (
            <div className="text-center space-y-4">
              <p className="text-green-600 font-semibold">
                🎉 Đăng ký thành công!
              </p>
              <button
                onClick={() => {
                  dispatch(resetRegister());
                  navigate("/login");
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
