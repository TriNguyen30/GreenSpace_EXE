import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

export type DropdownItem = {
  label: string;
  value: string;
  onClick?: () => void;
};

type DropdownMenuProps = {
  label: string;
  items: DropdownItem[];
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes dm-in {
    from { opacity:0; transform:translateY(-8px) scale(.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  .dm-panel { animation: dm-in .18s cubic-bezier(.22,.68,0,1.1) both; }

  .dm-trigger {
    transition: color .15s;
  }
  .dm-trigger.open { color:#16a34a; }

  .dm-chevron {
    transition: transform .25s cubic-bezier(.34,1.56,.64,1);
  }
  .dm-chevron.open { transform: rotate(180deg); }

  .dm-item {
    transition: background .13s, color .13s, padding-left .15s;
  }
  .dm-item:hover {
    background: #f0fdf4;
    color: #16a34a;
    padding-left: 20px;
  }
  .dm-item:active { background:#dcfce7; }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("dm-styles")) return;
  const el = document.createElement("style");
  el.id = "dm-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DropdownMenu({ label, items }: DropdownMenuProps) {
  injectStyles();

  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onEnter = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const onLeave = () => {
    timer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>

      {/* Trigger */}
      <button className={`dm-trigger flex items-center gap-1 font-medium text-sm text-gray-600 ${open ? "open" : ""}`}>
        {label}
        <ChevronDown className={`dm-chevron w-3.5 h-3.5 ${open ? "open" : ""}`} />
      </button>

      {/* Panel */}
      {open && (
        <div className="dm-panel absolute top-full left-0 pt-2 w-52 z-50">
          <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
            {/* Top accent line */}
            <div className="h-0.5 bg-green-500" />

            {items.map((item) => (
              <div
                key={item.value}
                onClick={() => { item.onClick?.(); setOpen(false); }}
                className="dm-item px-4 py-2.5 text-sm text-gray-600 cursor-pointer font-medium"
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}