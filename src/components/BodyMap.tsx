import { useState } from 'react';

export interface BodyFraction { key: string; label: string; kg: number; pct: number; color: string; }

/** Figura corporal esquemática: al seleccionar una fracción, se resalta por color. */
export default function BodyMap({ fractions }: { fractions: BodyFraction[] }) {
  const [sel, setSel] = useState(fractions[0]?.key ?? '');
  const active = fractions.find((f) => f.key === sel) ?? fractions[0];
  const color = active?.color ?? 'var(--accent)';

  return (
    <div className="card">
      <h3>Visualización corporal · 5 fracciones</h3>
      <div className="row" style={{ alignItems: 'stretch', gap: '1.2rem' }}>
        <svg viewBox="0 0 120 240" width={130} height={260}>
          <defs>
            <linearGradient id="bodyfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.85} />
              <stop offset="100%" stopColor={color} stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <g fill="url(#bodyfill)" stroke="var(--border)" strokeWidth={1}>
            <circle cx={60} cy={26} r={16} />
            <rect x={50} y={42} width={20} height={10} rx={4} />
            <path d="M40 54 Q60 48 80 54 L86 120 Q60 130 34 120 Z" />
            <rect x={26} y={56} width={12} height={70} rx={6} />
            <rect x={82} y={56} width={12} height={70} rx={6} />
            <rect x={44} y={124} width={14} height={92} rx={7} />
            <rect x={62} y={124} width={14} height={92} rx={7} />
          </g>
          <text x={60} y={236} textAnchor="middle" fontSize={9} fill="var(--text-dim)">{active?.label}</text>
        </svg>
        <div className="stack" style={{ gap: '.4rem', flex: 1, justifyContent: 'center' }}>
          {fractions.map((f) => (
            <button key={f.key} onClick={() => setSel(f.key)}
              className={sel === f.key ? '' : 'ghost'}
              style={{ justifyContent: 'space-between', display: 'flex', borderColor: sel === f.key ? f.color : undefined }}>
              <span className="row" style={{ gap: '.45rem' }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: f.color }} /> {f.label}
              </span>
              <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{f.kg.toFixed(2)} kg · {f.pct.toFixed(1)}%</strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
