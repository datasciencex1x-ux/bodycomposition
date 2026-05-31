/* somatochart.jsx — interactive Heath-Carter somatochart (Reuleaux frame). */
const { useState: useStateSC } = React;

function SomatoChart({ soma, overlay, cloud, showMain = true, lang = "es", size = 460 }) {
  const [hover, setHover] = useStateSC(null); // 'pt' | 'ov' | null

  const W = size, H = size;
  const cx = W / 2, cy = H * 0.52;
  const sx = W / 28, sy = H / 50;            // data→screen scale
  const map = (X, Y) => ({ x: cx + X * sx, y: cy - Y * sy });

  // poles (data coords): endo(-7,-7) meso(0,14) ecto(7,-7)
  const Pm = map(0, 14), Pen = map(-7, -7), Pec = map(7, -7);
  const side = Math.hypot(Pm.x - Pec.x, Pm.y - Pec.y);
  const R = side;
  // Reuleaux outline: each arc centered at opposite vertex, bulging outward
  const arc = (a, b) => `A ${R} ${R} 0 0 1 ${b.x} ${b.y}`;
  const outline = `M ${Pm.x} ${Pm.y} ${arc(Pm, Pec)} ${arc(Pec, Pen)} ${arc(Pen, Pm)} Z`;

  const labels = {
    es: { endo: "Endomorfia", meso: "Mesomorfia", ecto: "Ectomorfia" },
    en: { endo: "Endomorphy", meso: "Mesomorphy", ecto: "Ectomorphy" },
  }[lang];

  const pt = map(soma.X, soma.Y);
  const ov = overlay ? map(window.BC_ENGINE.somaToXY(overlay.s).x, window.BC_ENGINE.somaToXY(overlay.s).y) : null;

  // faint guide ticks along axes
  const ticks = [];
  for (let i = -6; i <= 6; i += 2) { const p = map(i, 0); ticks.push(p); }

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", maxWidth: size }}>
      <defs>
        <radialGradient id="scGlow" cx="50%" cy="46%" r="60%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <filter id="scShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>

      <rect x="0" y="0" width={W} height={H} fill="url(#scGlow)" />
      {/* outline */}
      <path d={outline} fill="var(--surface-2)" stroke="var(--line-strong)" strokeWidth="1.4" />

      {/* internal guide lines from centroid to poles */}
      {[Pm, Pen, Pec].map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--line)" strokeWidth="1" strokeDasharray="2 4" />
      ))}
      {/* x / y axes */}
      <line x1={map(-7,0).x} y1={map(-7,0).y} x2={map(7,0).x} y2={map(7,0).y} stroke="var(--line)" strokeWidth="1" />
      <line x1={cx} y1={map(0,-7).y} x2={cx} y2={map(0,14).y} stroke="var(--line)" strokeWidth="1" />
      {ticks.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="1.1" fill="var(--text-faint)" />)}

      {/* pole labels */}
      <text x={Pm.x} y={Pm.y - 12} textAnchor="middle" className="sc-pole">{labels.meso}</text>
      <text x={Pen.x - 4} y={Pen.y + 22} textAnchor="middle" className="sc-pole">{labels.endo}</text>
      <text x={Pec.x + 4} y={Pec.y + 22} textAnchor="middle" className="sc-pole">{labels.ecto}</text>

      {/* SAD connector */}
      {ov && (
        <line x1={pt.x} y1={pt.y} x2={ov.x} y2={ov.y} stroke="var(--info)" strokeWidth="1.4" strokeDasharray="4 3" opacity="0.8" />
      )}

      {/* cloud of squad points */}
      {cloud && cloud.map((c, i) => {
        const xy = window.BC_ENGINE.somaToXY(c.s); const p = map(xy.x, xy.y);
        return <circle key={i} cx={p.x} cy={p.y} r="4.5" fill={c.sex === "female" ? "var(--fr-residual)" : "var(--fr-muscle)"} fillOpacity="0.7" stroke="var(--bg)" strokeWidth="1.2">
          <title>{c.name}: {c.s.map(v=>v.toFixed(1)).join("–")}</title>
        </circle>;
      })}

      {/* sport overlay point */}
      {ov && (
        <g onMouseEnter={() => setHover("ov")} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }}>
          <circle cx={ov.x} cy={ov.y} r="9" fill="var(--info)" opacity="0.16" />
          <rect x={ov.x - 5} y={ov.y - 5} width="10" height="10" fill="var(--info)" transform={`rotate(45 ${ov.x} ${ov.y})`} stroke="var(--bg)" strokeWidth="1.5" />
          {hover === "ov" && (
            <g>
              <rect x={ov.x + 10} y={ov.y - 26} width="150" height="34" rx="6" fill="var(--surface-3)" stroke="var(--line-strong)" filter="url(#scShadow)" />
              <text x={ov.x + 18} y={ov.y - 13} className="sc-tip">{overlay.label}</text>
              <text x={ov.x + 18} y={ov.y + 1} className="sc-tip-mono">{overlay.s.map(v=>v.toFixed(1)).join(" · ")}</text>
            </g>
          )}
        </g>
      )}

      {/* patient point */}
      <g onMouseEnter={() => setHover("pt")} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer", display: showMain ? null : "none" }}>
        <circle cx={pt.x} cy={pt.y} r="14" fill="var(--accent)" opacity="0.16">
          <animate attributeName="r" values="11;17;11" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.22;0.05;0.22" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <circle cx={pt.x} cy={pt.y} r="6.5" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2" filter="url(#scShadow)" />
        {hover === "pt" && (
          <g>
            <rect x={pt.x + 10} y={pt.y - 26} width="150" height="34" rx="6" fill="var(--surface-3)" stroke="var(--accent-line)" filter="url(#scShadow)" />
            <text x={pt.x + 18} y={pt.y - 13} className="sc-tip">{lang==="es"?"Paciente":"Patient"}</text>
            <text x={pt.x + 18} y={pt.y + 1} className="sc-tip-mono">{[soma.endo,soma.meso,soma.ecto].map(v=>v.toFixed(1)).join(" · ")}</text>
          </g>
        )}
      </g>
    </svg>
  );
}

window.SomatoChart = SomatoChart;
