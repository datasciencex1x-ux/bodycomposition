/* ui.jsx — shared components + icons.  Exposes globals via window. */
const { useState, useRef, useEffect } = React;

/* ---------------- icons (stroke, 18px grid) ---------------- */
const ICONS = {
  dashboard: "M3 13h8V3H3v10zm10 8h8V3h-8v18zM3 21h8v-6H3v6z",
  patients: "M16 14a4 4 0 10-8 0M12 7a3 3 0 100 6 3 3 0 000-6zM4 20c0-3 3.5-5 8-5s8 2 8 5",
  eval: "M9 3h6v3H9zM7 5H5v16h14V5h-2M9 11h6M9 15h6",
  results: "M3 12h3l3 7 4-16 3 9h5",
  soma: "M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0M12 12m-4 0a4 4 0 108 0 4 4 0 10-8 0M12 12l6-6",
  compare: "M5 4v16M19 4v16M5 8h6M5 16h6M13 12h6M13 6h4M13 18h4",
  reports: "M7 3h7l5 5v13H7zM14 3v5h5M9 13h6M9 17h6",
  methods: "M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2zM8 7h7M8 11h7",
  settings: "M12 9a3 3 0 100 6 3 3 0 000-6zM19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 00-2-1.2l-.3-2.5H10l-.3 2.5a7 7 0 00-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 005 12a7 7 0 00.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 002 1.2l.3 2.5h4l.3-2.5a7 7 0 002-1.2l2.3 1 2-3.4-2-1.5c.06-.4.1-.8.1-1.2z",
  calendar: "M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1zM8 12h2M14 12h2M8 16h2M14 16h2",
  sun: "M12 4V2M12 22v-2M4 12H2M22 12h-2M6 6L4.5 4.5M19.5 19.5L18 18M18 6l1.5-1.5M4.5 19.5L6 18M12 8a4 4 0 100 8 4 4 0 000-8z",
  moon: "M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z",
  globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9z",
  fx: "M7 6h6M9 6v12M6 18h3M14 8l5 8M19 8l-5 8",
  download: "M12 4v10M8 11l4 4 4-4M5 19h14",
  check: "M5 12l4 4 10-10",
  alert: "M12 4l9 16H3zM12 10v4M12 17v.5",
  chevron: "M9 6l6 6-6 6",
  spark: "M12 3l2.2 6.3L21 11l-6 1.8L12 21l-3-8.2L3 11l6.8-1.7z",
  user: "M12 7a3 3 0 100 6 3 3 0 000-6zM5 20c0-3 3-5 7-5s7 2 7 5",
  flame: "M12 3c.6 2.7 3.5 4 3.5 7.5A3.5 3.5 0 0112 14a3.5 3.5 0 01-3.5-3.5c0-1 .4-1.8 1-2.5.2 1.3 1 1.7 1.6 1.2.8-.6.4-2.4-.6-3.7.8-.4 1.5-1.4 2-2.5zM7 13a5 5 0 1010 .2c0 3.8-2.2 5.8-5 7.8-2.8-2-5-4-5-8z",
  pill: "M10.5 13.5l3-3M8.5 15.5a3.5 3.5 0 010-5l2-2a3.5 3.5 0 015 5l-2 2a3.5 3.5 0 01-5 0z",
  diet: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 3v2M21 12h-2M5 12H3M12 19v2M6 6l1.5 1.5M18 6l-1.5 1.5",
  bolt: "M13 3L5 13h6l-1 8 9-11h-6z",
  watch: "M9 2h6l.8 4M9 22h6l.8-4M6 12a6 6 0 1012 0 6 6 0 10-12 0zM12 9.5V12l1.8 1.2",
  target: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM12 11.5a.5.5 0 100 1 .5.5 0 000-1z",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6L6 18",
  link: "M9 15l6-6M10.5 7.5l1.8-1.8a3.5 3.5 0 015 5l-1.8 1.8M13.5 16.5l-1.8 1.8a3.5 3.5 0 01-5-5l1.8-1.8",
};
function Icon({ n, s = 18, className = "" }) {
  return (
    <svg className={className} width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[n] || ""} />
    </svg>
  );
}

/* ---------------- equation popover ---------------- */
function EqPopover({ title, cite, formula, label = "ƒ equation", align = "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <span className="tip" ref={ref} style={{ position: "relative" }}>
      <button className="eq-btn" onClick={() => setOpen(o => !o)}>
        <Icon n="fx" s={11} /> {label}
      </button>
      {open && (
        <div className="popover fade-in" style={{ top: "26px", [align]: 0 }}>
          <div className="pop-title">{title}</div>
          {cite && <div className="pop-cite">{cite}</div>}
          <div className="formula">{formula}</div>
          <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
            Phantom 170.18 cm · Ross & Wilson 1974
          </div>
        </div>
      )}
    </span>
  );
}

/* ---------------- badge ---------------- */
function Badge({ tone = "", children, dot = true, style }) {
  return <span className={"badge " + tone} style={style}>{dot && <span className="dot" />}{children}</span>;
}

/* ---------------- segmented gauge bar with marker ---------------- */
function GaugeBar({ segments, value, min, max }) {
  // segments: [{to, color}] cumulative thresholds across [min,max]
  const span = max - min;
  const pos = Math.max(0, Math.min(100, (value - min) / span * 100));
  let prev = min;
  return (
    <div className="gauge" style={{ height: 10 }}>
      {segments.map((sg, i) => {
        const left = (prev - min) / span * 100;
        const w = (Math.min(sg.to, max) - prev) / span * 100;
        prev = sg.to;
        return <div key={i} className="seg" style={{ left: left + "%", width: w + "%", background: sg.color, opacity: .85 }} />;
      })}
      <div className="gauge-marker" style={{ left: pos + "%" }} />
    </div>
  );
}

/* ---------------- mini sparkline / radial ring ---------------- */
function Ring({ pct, color, size = 56, stroke = 6, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c * (1 - pct/100)} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dashoffset .6s ease" }} />
      {label && <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle"
        fontFamily="var(--font-mono)" fontSize={size*0.24} fill="var(--text)">{label}</text>}
    </svg>
  );
}

Object.assign(window, { Icon, ICONS, EqPopover, Badge, GaugeBar, Ring, LineChart, AreaChart, Avatar });

/* ---------------- gradient area chart (high-quality) ---------------- */
function AreaChart({ series, labels, height = 170, yfmt = (v) => v.toFixed(0), unit = "" }) {
  const uid = React.useMemo(() => Math.random().toString(36).slice(2), []);
  const W = 520, H = height, pad = { l: 42, r: 16, t: 16, b: 26 };
  const all = series.flatMap(s => s.data.filter(v => v != null));
  let min = Math.min(...all), max = Math.max(...all);
  if (!isFinite(min)) { min = 0; max = 1; }
  if (min === max) { min -= 1; max += 1; }
  const range = max - min; min -= range * 0.16; max += range * 0.16;
  const n = labels.length;
  const x = i => pad.l + (n <= 1 ? (W - pad.l - pad.r) / 2 : i * (W - pad.l - pad.r) / (n - 1));
  const y = v => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
  const ticks = [min, (min + max) / 2, max];
  const baseY = H - pad.b;
  return (
    <svg className="trend-svg" viewBox={`0 0 ${W} ${H}`}>
      <defs>
        {series.map((s, si) => (
          <linearGradient key={si} id={`area-${uid}-${si}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.42" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
          </linearGradient>
        ))}
      </defs>
      {ticks.map((tv, i) => (
        <g key={i}>
          <line x1={pad.l} y1={y(tv)} x2={W - pad.r} y2={y(tv)} stroke="var(--line)" strokeWidth="1" strokeDasharray="2 5" />
          <text x={pad.l - 7} y={y(tv) + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-faint)">{yfmt(tv)}</text>
        </g>
      ))}
      {labels.map((lb, i) => (
        <text key={i} x={x(i)} y={H - 7} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-faint)">{lb}</text>
      ))}
      {series.map((s, si) => {
        const pts = s.data.map((v, i) => v == null ? null : [x(i), y(v)]).filter(Boolean);
        if (!pts.length) return null;
        const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
        const area = `${line} L ${pts[pts.length-1][0]} ${baseY} L ${pts[0][0]} ${baseY} Z`;
        return (
          <g key={si}>
            <path d={area} fill={`url(#area-${uid}-${si})`} />
            <path d={line} fill="none" stroke={s.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.4" fill={s.color} stroke="var(--surface)" strokeWidth="1.6" />)}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- mini multi-series line chart ---------------- */
function LineChart({ series, labels, height = 150, yfmt = (v)=>v.toFixed(0), unit = "" }) {
  // series: [{name, color, data:[numbers]}]
  const W = 480, H = height, pad = { l: 38, r: 12, t: 12, b: 22 };
  const all = series.flatMap(s => s.data);
  let min = Math.min(...all), max = Math.max(...all);
  if (min === max) { min -= 1; max += 1; }
  const range = max - min; min -= range * 0.12; max += range * 0.12;
  const n = labels.length;
  const x = i => pad.l + (n <= 1 ? 0 : i * (W - pad.l - pad.r) / (n - 1));
  const y = v => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
  const ticks = [min, (min+max)/2, max];
  return (
    <svg className="trend-svg" viewBox={`0 0 ${W} ${H}`}>
      {ticks.map((tv, i) => (
        <g key={i}>
          <line x1={pad.l} y1={y(tv)} x2={W - pad.r} y2={y(tv)} stroke="var(--line)" strokeWidth="1" strokeDasharray="2 4" />
          <text x={pad.l - 6} y={y(tv) + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-faint)">{yfmt(tv)}</text>
        </g>
      ))}
      {labels.map((lb, i) => (
        <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-faint)">{lb}</text>
      ))}
      {series.map((s, si) => {
        const d = s.data.map((v, i) => `${i===0?"M":"L"} ${x(i)} ${y(v)}`).join(" ");
        return (
          <g key={si}>
            <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {s.data.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.2" fill={s.color} stroke="var(--surface)" strokeWidth="1.5" />)}
          </g>
        );
      })}
    </svg>
  );
}

function Avatar({ name, sex }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return <div className={"avatar" + (sex === "female" ? " f" : "")}>{initials}</div>;
}


/* ============================================================
   Logo de marca "Body Composition" — alto impacto, SVG embebido.
   Monograma B dinámico, degradado teal->verde, acento ámbar,
   badge oscuro con brillo y arco de medición. Sin archivos externos.
   ============================================================ */
function BCLogo({ size = 40, className = "brand-logo", style }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48"
         role="img" aria-label="Body Composition" style={style}>
      <defs>
        <linearGradient id="bcBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#123a3f" />
          <stop offset="100%" stopColor="#0a0d12" />
        </linearGradient>
        <linearGradient id="bcMark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2bd4c0" />
          <stop offset="52%" stopColor="#3fb84e" />
          <stop offset="100%" stopColor="#8fd14a" />
        </linearGradient>
        <radialGradient id="bcGlow" cx="32%" cy="20%" r="85%">
          <stop offset="0%" stopColor="rgba(63,184,78,0.45)" />
          <stop offset="100%" stopColor="rgba(63,184,78,0)" />
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="13" fill="url(#bcBg)" stroke="rgba(255,255,255,0.10)" />
      <rect x="1" y="1" width="46" height="46" rx="13" fill="url(#bcGlow)" />
      {/* arco de medición */}
      <path d="M33 8.5 A 18 18 0 0 1 39.5 24" fill="none" stroke="rgba(143,209,74,0.40)" strokeWidth="2" strokeLinecap="round" />
      {/* monograma B */}
      <g fill="none" stroke="url(#bcMark)" strokeWidth="5.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 11 V37" />
        <path d="M16 11 H25 a6.6 6.6 0 0 1 0 13 H16" />
        <path d="M16 24 H26.5 a6.9 6.9 0 0 1 0 13 H16" />
      </g>
      {/* núcleo / acento ámbar (cabeza de figura) */}
      <circle cx="30.5" cy="13" r="3.2" fill="#f7a823" />
      <circle cx="30.5" cy="13" r="3.2" fill="none" stroke="rgba(10,13,18,0.25)" strokeWidth="0.6" />
    </svg>
  );
}

/* Versión en cadena para HTML de reportes/impresión (ids propios). */
window.BC_LOGO_SVG =
  '<svg width="56" height="56" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">' +
  '<defs>' +
  '<linearGradient id="bcBgR" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#123a3f"/><stop offset="100%" stop-color="#0a0d12"/></linearGradient>' +
  '<linearGradient id="bcMarkR" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2bd4c0"/><stop offset="52%" stop-color="#3fb84e"/><stop offset="100%" stop-color="#8fd14a"/></linearGradient>' +
  '<radialGradient id="bcGlowR" cx="32%" cy="20%" r="85%"><stop offset="0%" stop-color="rgba(63,184,78,0.45)"/><stop offset="100%" stop-color="rgba(63,184,78,0)"/></radialGradient>' +
  '</defs>' +
  '<rect x="1" y="1" width="46" height="46" rx="13" fill="url(#bcBgR)" stroke="rgba(255,255,255,0.10)"/>' +
  '<rect x="1" y="1" width="46" height="46" rx="13" fill="url(#bcGlowR)"/>' +
  '<path d="M33 8.5 A 18 18 0 0 1 39.5 24" fill="none" stroke="rgba(143,209,74,0.40)" stroke-width="2" stroke-linecap="round"/>' +
  '<g fill="none" stroke="url(#bcMarkR)" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M16 11 V37"/><path d="M16 11 H25 a6.6 6.6 0 0 1 0 13 H16"/><path d="M16 24 H26.5 a6.9 6.9 0 0 1 0 13 H16"/></g>' +
  '<circle cx="30.5" cy="13" r="3.2" fill="#f7a823"/></svg>';
