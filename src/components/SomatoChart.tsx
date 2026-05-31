import { useState } from 'react';

export interface SomatoPoint {
  x: number;
  y: number;
  color: string;
  label: string;
  size?: number;
  ring?: boolean;
}

const W = 540;
const H = 540;
const PAD = 46;
const XMIN = -9, XMAX = 9, YMIN = -10, YMAX = 14;

function px(x: number) { return PAD + ((x - XMIN) / (XMAX - XMIN)) * (W - 2 * PAD); }
function py(y: number) { return H - PAD - ((y - YMIN) / (YMAX - YMIN)) * (H - 2 * PAD); }

// Etiquetas de las 13 categorías en posiciones representativas (x,y somatocarta)
const REGIONS: { x: number; y: number; t: string }[] = [
  { x: 0, y: 11.5, t: 'Mesomorfo balanceado' },
  { x: -3, y: 7, t: 'Endo-mesomorfo' },
  { x: 3, y: 7, t: 'Ecto-mesomorfo' },
  { x: -5.5, y: 2.5, t: 'Mesomorfo-endomorfo' },
  { x: 5.5, y: 2.5, t: 'Mesomorfo-ectomorfo' },
  { x: -6.5, y: -3.5, t: 'Endomorfo balanceado' },
  { x: 6.5, y: -3.5, t: 'Ectomorfo balanceado' },
  { x: -3.2, y: -5.6, t: 'Ecto-endomorfo' },
  { x: 3.2, y: -5.6, t: 'Endo-ectomorfo' },
  { x: 0, y: -6.2, t: 'Endo-ectomorfo bal.' },
  { x: 0, y: 1.6, t: 'Central' },
];

export default function SomatoChart({ points, title }: { points: SomatoPoint[]; title?: string }) {
  const [hover, setHover] = useState<SomatoPoint | null>(null);

  // Triángulo límite (vértices puros endo/meso/ecto)
  const endoV = { x: -6, y: -6 };
  const mesoV = { x: 0, y: 12 };
  const ectoV = { x: 6, y: -6 };

  return (
    <div className="card" style={{ position: 'relative' }}>
      {title && <h3>{title}</h3>}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <radialGradient id="somatoGlow" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="rgba(79,140,255,.10)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="url(#somatoGlow)" rx={14} />

        {/* grid */}
        {[-8, -4, 0, 4, 8].map((gx) => (
          <line key={'gx' + gx} x1={px(gx)} y1={py(YMIN)} x2={px(gx)} y2={py(YMAX)} stroke="var(--border)" strokeWidth={1} />
        ))}
        {[-8, -4, 0, 4, 8, 12].map((gy) => (
          <line key={'gy' + gy} x1={px(XMIN)} y1={py(gy)} x2={px(XMAX)} y2={py(gy)} stroke="var(--border)" strokeWidth={1} />
        ))}

        {/* triángulo de somatotipos */}
        <polygon
          points={`${px(endoV.x)},${py(endoV.y)} ${px(mesoV.x)},${py(mesoV.y)} ${px(ectoV.x)},${py(ectoV.y)}`}
          fill="rgba(34,211,238,.05)" stroke="var(--accent-2)" strokeWidth={1.5} strokeDasharray="4 4"
        />
        {/* ejes */}
        <line x1={px(XMIN)} y1={py(0)} x2={px(XMAX)} y2={py(0)} stroke="var(--text-faint)" strokeWidth={1.2} />
        <line x1={px(0)} y1={py(YMIN)} x2={px(0)} y2={py(YMAX)} stroke="var(--text-faint)" strokeWidth={1.2} />

        {/* etiquetas de ejes */}
        <text x={px(XMAX) - 4} y={py(0) - 6} fill="var(--text-dim)" fontSize={11} textAnchor="end">Ectomorfia →</text>
        <text x={px(XMIN) + 4} y={py(0) - 6} fill="var(--text-dim)" fontSize={11}>← Endomorfia</text>
        <text x={px(0) + 6} y={py(YMAX) + 12} fill="var(--text-dim)" fontSize={11}>↑ Mesomorfia</text>

        {/* nombres de regiones */}
        {REGIONS.map((r, i) => (
          <text key={i} x={px(r.x)} y={py(r.y)} fill="var(--text-faint)" fontSize={9.5} textAnchor="middle" opacity={0.85}>
            {r.t}
          </text>
        ))}

        {/* puntos */}
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHover(p)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
            <circle cx={px(p.x)} cy={py(p.y)} r={p.size ?? 6} fill={p.color} opacity={p.ring ? 0.25 : 0.9} />
            {p.ring && <circle cx={px(p.x)} cy={py(p.y)} r={(p.size ?? 6) + 3} fill="none" stroke={p.color} strokeWidth={2} />}
          </g>
        ))}
      </svg>
      {hover && (
        <div className="card" style={{ position: 'absolute', top: 12, right: 12, padding: '.5rem .7rem', fontSize: '.78rem' }}>
          <strong>{hover.label}</strong>
          <div className="faint">X {hover.x.toFixed(1)} · Y {hover.y.toFixed(1)}</div>
        </div>
      )}
    </div>
  );
}
