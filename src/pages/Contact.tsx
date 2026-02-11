import { useMemo, useState } from "react";
import { Mail, MapPin, Phone, Send, Clock } from "lucide-react";
import Badge from "@/components/ui/Badge";

type ContactFormState = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").trim();
}

function validate(values: ContactFormState) {
  const errors: Partial<Record<keyof ContactFormState, string>> = {};

  if (!values.fullName.trim()) errors.fullName = "Vui lòng nhập họ tên.";
  if (!values.email.trim()) errors.email = "Vui lòng nhập email.";
  else if (!isValidEmail(values.email))
    errors.email = "Email không hợp lệ. Ví dụ: name@example.com";

  const normalizedPhone = normalizePhone(values.phone);
  if (values.phone.trim() && normalizedPhone.length < 9) {
    errors.phone = "Số điện thoại có vẻ chưa đúng.";
  }

  if (!values.subject.trim()) errors.subject = "Vui lòng nhập chủ đề.";
  if (!values.message.trim()) errors.message = "Vui lòng nhập nội dung.";
  else if (values.message.trim().length < 10)
    errors.message = "Nội dung quá ngắn (tối thiểu 10 ký tự).";

  return errors;
}
export default function Contact() {
  const [values, setValues] = useState<ContactFormState>({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [touched, setTouched] = useState<
    Partial<Record<keyof ContactFormState, boolean>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const errors = useMemo(() => validate(values), [values]);
  const canSubmit = useMemo(() => {
    return Object.keys(errors).length === 0 && !submitting;
  }, [errors, submitting]);

  const onChange =
    (key: keyof ContactFormState) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setValues((prev) => ({ ...prev, [key]: e.target.value }));
      setSubmitted(false);
      setSubmitError(null);
    };

  const onBlur = (key: keyof ContactFormState) => () =>
    setTouched((prev) => ({ ...prev, [key]: true }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      subject: true,
      message: true,
    });

    const currentErrors = validate(values);
    if (Object.keys(currentErrors).length > 0) return;

    try {
      setSubmitting(true);
      setSubmitError(null);

      // TODO: integrate real API endpoint if available
      await new Promise((r) => setTimeout(r, 700));

      setSubmitted(true);
      setValues({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setTouched({});
    } catch (err) {
      console.error(err);
      setSubmitError("Gửi liên hệ thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-24 pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-2xl">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
                  Liên hệ Green Space
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  Cần tư vấn chọn cây, chăm sóc, hoặc hỗ trợ đơn hàng? Hãy gửi
                  lời nhắn — đội ngũ của chúng tôi sẽ phản hồi sớm nhất.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:support@greenspace.vn"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  <Mail className="w-4 h-4 text-green-700" />
                  support@greenspace.vn
                </a>
                <a
                  href="tel:+84900111222"
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                >
                  <Phone className="w-4 h-4" />
                  0900 111 222
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Thông tin liên hệ
              </h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Địa chỉ
                    </div>
                    <div className="text-sm text-gray-600">
                      123 Green Street, Quận 1, TP.HCM
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Giờ làm việc
                    </div>
                    <div className="text-sm text-gray-600">
                      Thứ 2–Thứ 7: 08:30–18:00
                      <br />
                      Chủ nhật: 09:00–12:00
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-green-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900">
                      Email
                    </div>
                    <div className="text-sm text-gray-600 break-words">
                      support@greenspace.vn
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Hotline
                    </div>
                    <div className="text-sm text-gray-600">0900 111 222</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl text-white p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-2">Mẹo nhanh</h3>
              <p className="text-sm text-green-50 leading-relaxed">
                Gửi kèm tên sản phẩm/SKU và ảnh (nếu có) để chúng tôi hỗ trợ
                nhanh hơn.
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Gửi yêu cầu
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Chúng tôi thường phản hồi trong vòng 24 giờ làm việc.
              </p>

              {submitted && (
                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  Đã gửi liên hệ thành công. Cảm ơn bạn!
                </div>
              )}
              {submitError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-semibold text-gray-900 mb-1"
                    >
                      Họ tên
                    </label>
                    <input
                      id="fullName"
                      value={values.fullName}
                      onChange={onChange("fullName")}
                      onBlur={onBlur("fullName")}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Nguyễn Văn A"
                      autoComplete="name"
                    />
                    {touched.fullName && errors.fullName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-900 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      value={values.email}
                      onChange={onChange("email")}
                      onBlur={onBlur("email")}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="name@example.com"
                      autoComplete="email"
                      inputMode="email"
                    />
                    {touched.email && errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-gray-900 mb-1"
                    >
                      Số điện thoại (tuỳ chọn)
                    </label>
                    <input
                      id="phone"
                      value={values.phone}
                      onChange={onChange("phone")}
                      onBlur={onBlur("phone")}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0900 111 222"
                      autoComplete="tel"
                      inputMode="tel"
                    />
                    {touched.phone && errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-semibold text-gray-900 mb-1"
                    >
                      Chủ đề
                    </label>
                    <input
                      id="subject"
                      value={values.subject}
                      onChange={onChange("subject")}
                      onBlur={onBlur("subject")}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Tư vấn chọn cây / Hỗ trợ đơn hàng..."
                    />
                    {touched.subject && errors.subject && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.subject}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-900 mb-1"
                  >
                    Nội dung
                  </label>
                  <textarea
                    id="message"
                    value={values.message}
                    onChange={onChange("message")}
                    onBlur={onBlur("message")}
                    className="w-full min-h-[140px] rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Bạn cần Green Space hỗ trợ gì?"
                  />
                  {touched.message && errors.message && (
                    <p className="mt-1 text-xs text-red-600">{errors.message}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between pt-1">
                  <p className="text-xs text-gray-500">
                    Bằng cách gửi, bạn đồng ý để chúng tôi liên hệ lại qua email
                    hoặc số điện thoại (nếu cung cấp).
                  </p>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Đang gửi..." : "Gửi liên hệ"}
                  </button>
                </div>
              </form>

              <div className="mt-8 border-t border-gray-100 pt-6">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4 text-gray-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-0.5">
                      Kênh nhanh
                    </div>
                    <div>
                      Email:{" "}
                      <a
                        className="text-green-700 font-semibold hover:underline"
                        href="mailto:support@greenspace.vn"
                      >
                        support@greenspace.vn
                      </a>{" "}
                      • Hotline:{" "}
                      <a
                        className="text-green-700 font-semibold hover:underline"
                        href="tel:+84900111222"
                      >
                        0900 111 222
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
