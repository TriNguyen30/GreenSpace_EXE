// ─── Inject keyframes once (pulse only) ───────────────────────────────────────
const STYLES = `
@keyframes zb-pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(14,165,233,.55); }
  70%  { box-shadow: 0 0 0 10px rgba(14,165,233,0); }
  100% { box-shadow: 0 0 0 0 rgba(14,165,233,0);   }
}
.zb-fab { animation: zb-pulse-ring 2.4s ease-out infinite; }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("zalo-box-anim-styles")) return;
  const tag = document.createElement("style");
  tag.id = "zalo-box-anim-styles";
  tag.textContent = STYLES;
  document.head.appendChild(tag);
}

const DEFAULT_ZALO_GROUP_URL = "https://zalo.me";

export default function MessageBox() {
  injectStyles();

  const zaloGroupUrl =
    (import.meta.env.VITE_ZALO_GROUP_URL as string | undefined) ||
    DEFAULT_ZALO_GROUP_URL;

  const handleClick = () => {
    window.open(zaloGroupUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer zb-fab"
      style={{ transition: "background .2s, transform .2s" }}
      aria-label="Mở Zalo Group"
    >
      <img
        src="https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Zalo-Arc.png"
        alt="Zalo"
        className="w-9 h-9 rounded-full bg-white"
      />
    </button>
  );
}
