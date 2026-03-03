import { useMemo, useState, useRef, useEffect } from "react";
import { Mail, MapPin, Phone, Send, Clock, CheckCircle, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ContactFormState = {
  fullName: string; email: string; phone: string;
  subject: string; message: string;
};
type Errors = Partial<Record<keyof ContactFormState, string>>;

// ─── Validation ───────────────────────────────────────────────────────────────
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
const normalizePhone = (p: string) => p.replace(/[^\d+]/g, "").trim();

function validate(v: ContactFormState): Errors {
  const e: Errors = {};
  if (!v.fullName.trim()) e.fullName = "Vui lòng nhập họ tên.";
  if (!v.email.trim()) e.email = "Vui lòng nhập email.";
  else if (!isValidEmail(v.email)) e.email = "Email không hợp lệ.";
  if (v.phone.trim() && normalizePhone(v.phone).length < 9) e.phone = "Số điện thoại chưa đúng.";
  if (!v.subject.trim()) e.subject = "Vui lòng nhập chủ đề.";
  if (!v.message.trim()) e.message = "Vui lòng nhập nội dung.";
  else if (v.message.trim().length < 10) e.message = "Nội dung quá ngắn (tối thiểu 10 ký tự).";
  return e;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes ct-fade-up {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes ct-fade-in {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes ct-shake {
    0%,100% { transform:translateX(0); }
    20%     { transform:translateX(-5px); }
    40%     { transform:translateX(5px); }
    60%     { transform:translateX(-3px); }
    80%     { transform:translateX(3px); }
  }
  @keyframes ct-success-scale {
    0%  { opacity:0; transform:scale(.65) rotate(-10deg); }
    65% { transform:scale(1.1) rotate(3deg); }
    100%{ opacity:1; transform:scale(1) rotate(0deg); }
  }
  @keyframes ct-spinner {
    to { transform:rotate(360deg); }
  }

  .ct-e1 { animation: ct-fade-up .45s ease .04s both; }
  .ct-e2 { animation: ct-fade-up .45s ease .1s  both; }
  .ct-e3 { animation: ct-fade-up .45s ease .18s both; }

  /* Info card */
  .ct-info-card {
    transition: box-shadow .25s ease, transform .25s ease;
  }
  .ct-info-card:hover {
    box-shadow: 0 8px 28px rgba(0,0,0,.07);
    transform: translateY(-2px);
  }

  /* Info row */
  .ct-info-row {
    transition: background .15s, transform .15s, padding-left .15s;
    border-radius: 12px;
  }
  .ct-info-row:hover { background:#f0fdf4; padding-left:4px; }

  /* Tip card */
  .ct-tip { transition: box-shadow .25s ease, transform .25s ease; }
  .ct-tip:hover { box-shadow: 0 8px 24px rgba(0,0,0,.07); transform:translateY(-2px); }

  /* Quick-link buttons */
  .ct-quick-email {
    transition: background .15s, border-color .15s, transform .18s;
  }
  .ct-quick-email:hover { background:#f0fdf4; border-color:#16a34a; color:#16a34a; transform:translateY(-1px); }

  .ct-quick-phone {
    transition: background .15s, transform .18s, box-shadow .18s;
  }
  .ct-quick-phone:hover { background:#15803d; transform:translateY(-1px); box-shadow:0 4px 14px rgba(22,163,74,.3); }

  /* Form card */
  .ct-form-card {
    transition: box-shadow .25s ease;
  }
  .ct-form-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,.07); }

  /* Input */
  .ct-input {
    transition: border-color .18s, box-shadow .18s;
  }
  .ct-input:hover:not(:focus) { border-color: #9ca3af; }
  .ct-input:focus {
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22,163,74,.14);
    outline: none;
  }

  /* Char counter */
  .ct-char { transition: color .2s; }
  .ct-char.warn { color:#f97316; }
  .ct-char.over { color:#ef4444; }

  /* Submit btn */
  .ct-submit {
    transition: background .2s, transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
  }
  .ct-submit:hover:not(:disabled) {
    background:#15803d;
    transform:translateY(-2px) scale(1.02);
    box-shadow:0 6px 20px rgba(22,163,74,.3);
  }
  .ct-submit:active:not(:disabled) { transform:scale(.97); }
  .ct-submit:disabled { background:#86efac; cursor:not-allowed; }

  /* Shake on error */
  .ct-shake { animation: ct-shake .4s ease; }

  /* Success icon */
  .ct-success-icon { animation: ct-success-scale .5s cubic-bezier(.34,1.56,.64,1) both; }

  /* Success banner */
  .ct-success-banner { animation: ct-fade-in .4s ease both; }

  /* Error message */
  .ct-err { animation: ct-fade-up .25s ease both; }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("ct-styles")) return;
  const el = document.createElement("style");
  el.id = "ct-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

// ─── Shared input class ───────────────────────────────────────────────────────
const inputCls = "ct-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-white text-gray-800 placeholder-gray-400";

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, children }: {
  icon: React.ReactNode; label: string; children: React.ReactNode;
}) {
  return (
    <div className="ct-info-row flex items-start gap-3 px-2 py-2.5 cursor-default">
      <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0 text-green-700">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
        <div className="text-sm text-gray-700">{children}</div>
      </div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required: req, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{req && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="ct-err mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  );
}

const EMPTY: ContactFormState = { fullName: "", email: "", phone: "", subject: "", message: "" };
const MSG_MAX = 500;

// ─── Main component ───────────────────────────────────────────────────────────
export default function Contact() {
  injectStyles();

  const [values, setValues] = useState<ContactFormState>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof ContactFormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const errors = useMemo(() => validate(values), [values]);
  const canSubmit = Object.keys(errors).length === 0 && !submitting;
  const msgLen = values.message.trim().length;

  const onChange = (key: keyof ContactFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((p) => ({ ...p, [key]: e.target.value }));
    setSubmitted(false);
    setSubmitError(null);
  };
  const onBlur = (key: keyof ContactFormState) => () => setTouched((p) => ({ ...p, [key]: true }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ fullName: true, email: true, phone: true, subject: true, message: true });
    if (Object.keys(validate(values)).length > 0) {
      // shake the form card
      formRef.current?.classList.remove("ct-shake");
      void formRef.current?.offsetWidth;
      formRef.current?.classList.add("ct-shake");
      return;
    }
    try {
      setSubmitting(true);
      setSubmitError(null);
      await new Promise((r) => setTimeout(r, 800));
      setSubmitted(true);
      setValues(EMPTY);
      setTouched({});
    } catch {
      setSubmitError("Gửi liên hệ thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header card ── */}
        <div className="ct-e1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-7">
          <div className="px-8 py-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs font-bold text-green-600 tracking-widest uppercase mb-2">Hỗ trợ khách hàng</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-1.5">Liên hệ Green Space</h1>
              <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
                Cần tư vấn chọn cây, chăm sóc, hoặc hỗ trợ đơn hàng? Gửi lời nhắn — đội ngũ sẽ phản hồi trong 24 giờ làm việc.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <a href="mailto:support@greenspace.vn"
                className="ct-quick-email inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700">
                <Mail className="w-4 h-4 text-green-600" />
                greenspace@org.com
              </a>
              <a href="tel:+84900111222"
                className="ct-quick-phone inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white">
                <Phone className="w-4 h-4" />
                0937 825 621
              </a>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-7">

          {/* ── Left sidebar ── */}
          <div className="ct-e2 lg:col-span-1 space-y-5">

            {/* Contact info */}
            <div className="ct-info-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                Thông tin liên hệ
              </h2>
              <div className="space-y-1">
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Địa chỉ">
                  242 Bưng Ông Thoàn, Phước Long B, Thủ Đức, TP HCM
                </InfoRow>
                <InfoRow icon={<Clock className="w-4 h-4" />} label="Giờ làm việc">
                  Thứ 2–Thứ 7: 08:30–18:00<br />Chủ nhật: 09:00–12:00
                </InfoRow>
                {/* <InfoRow icon={<Mail className="w-4 h-4" />} label="Email">
                  <a href="mailto:support@greenspace.vn" className="text-green-700 font-medium hover:underline">
                    support@greenspace.vn
                  </a>
                </InfoRow>
                <InfoRow icon={<Phone className="w-4 h-4" />} label="Hotline">
                  <a href="tel:+84900111222" className="text-green-700 font-medium hover:underline">
                    0900 111 222
                  </a>
                </InfoRow> */}
              </div>
            </div>

            {/* Tip card — flat, no gradient */}
            <div className="ct-tip bg-white border-2 border-green-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Mẹo nhanh</h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Gửi kèm tên sản phẩm / SKU và ảnh (nếu có) để chúng tôi hỗ trợ nhanh hơn.
              </p>
            </div>
          </div>

          {/* ── Form ── */}
          <div className="ct-e3 lg:col-span-2">
            <div ref={formRef} className="ct-form-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">

              <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                Gửi yêu cầu
              </h2>
              <p className="text-sm text-gray-500 mb-6">Thường phản hồi trong vòng 24 giờ làm việc.</p>

              {/* Success banner */}
              {submitted && (
                <div className="ct-success-banner mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5">
                  <CheckCircle className="ct-success-icon w-5 h-5 text-green-600 shrink-0" />
                  <p className="text-sm font-medium text-green-800">Đã gửi thành công! Chúng tôi sẽ phản hồi sớm nhất. Cảm ơn bạn 🌿</p>
                </div>
              )}
              {submitError && (
                <div className="ct-err mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                  <span>⚠️</span> {submitError}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Họ tên" required error={touched.fullName ? errors.fullName : undefined}>
                    <input id="fullName" value={values.fullName} onChange={onChange("fullName")} onBlur={onBlur("fullName")}
                      className={inputCls} placeholder="Nguyễn Văn A" autoComplete="name" />
                  </Field>
                  <Field label="Email" required error={touched.email ? errors.email : undefined}>
                    <input id="email" type="email" value={values.email} onChange={onChange("email")} onBlur={onBlur("email")}
                      className={inputCls} placeholder="name@example.com" autoComplete="email" inputMode="email" />
                  </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Số điện thoại" error={touched.phone ? errors.phone : undefined}>
                    <input id="phone" value={values.phone} onChange={onChange("phone")} onBlur={onBlur("phone")}
                      className={inputCls} placeholder="0900 111 222" autoComplete="tel" inputMode="tel" />
                  </Field>
                  <Field label="Chủ đề" required error={touched.subject ? errors.subject : undefined}>
                    <input id="subject" value={values.subject} onChange={onChange("subject")} onBlur={onBlur("subject")}
                      className={inputCls} placeholder="Tư vấn chọn cây / Hỗ trợ đơn hàng..." />
                  </Field>
                </div>

                <Field label="Nội dung" required error={touched.message ? errors.message : undefined}>
                  <div className="relative">
                    <textarea
                      id="message" value={values.message} onChange={onChange("message")} onBlur={onBlur("message")}
                      maxLength={MSG_MAX} rows={5}
                      className={`${inputCls} resize-none`}
                      placeholder="Bạn cần Green Space hỗ trợ gì?"
                    />
                    <span
                      className={`ct-char absolute bottom-3 right-3 text-xs font-medium pointer-events-none ${msgLen > MSG_MAX * 0.9 ? "over" : msgLen > MSG_MAX * 0.7 ? "warn" : "text-gray-300"}`}>
                      {msgLen}/{MSG_MAX}
                    </span>
                  </div>
                </Field>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between pt-1 border-t border-gray-200">
                  <p className="text-xs text-gray-400 leading-relaxed max-w-sm mt-2">
                    Bằng cách gửi, bạn đồng ý để chúng tôi liên hệ qua email hoặc số điện thoại đã cung cấp.
                  </p>
                  <button type="submit" disabled={!canSubmit}
                    className="ct-submit inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shrink-0 mt-2">
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</>
                      : <><Send className="w-4 h-4" /> Gửi liên hệ</>}
                  </button>
                </div>
              </form>

              {/* Quick contact */}
              {/* <div className="mt-7 pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Kênh nhanh</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <a href="mailto:support@greenspace.vn"
                    className="ct-quick-email inline-flex items-center gap-1.5 border-2 border-gray-200 rounded-xl px-3.5 py-2 font-medium text-gray-700">
                    <Mail className="w-4 h-4 text-green-600" /> support@greenspace.vn
                  </a>
                  <a href="tel:+84900111222"
                    className="ct-quick-phone inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3.5 py-2 font-medium text-white">
                    <Phone className="w-4 h-4" /> 0900 111 222
                  </a>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}