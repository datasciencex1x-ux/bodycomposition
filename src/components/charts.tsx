import { useState } from 'react';

export interface Slice { label: string; value: number; color: string; }

/** Dona apilada (composición en 5 fracciones). */
export function Donut({ data, size = 200, unit = 'kg' }: { data: Slice[]; size?: number; unit?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 14;
  const cx = size / 2, cy = size / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="row" style={{ gap: '1.2rem', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          {data.map((d, i) => {
            const frac = d.value / total;
            const dash = frac * C;
            const el = (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color}
                strokeWidth={hover === i ? 26 : 20} strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset} opacity={hover === null || hover === i ? 1 : 0.4}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                style={{ transition: 'stroke-width .15s, opacity .15s', cursor: 'pointer' }} />
            );
            offset += dash;
            return el;
          })}
        </g>
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={20} fontWeight={700} fill="var(--text)">
          {hover !== null ? data[hover].value.toFixed(1) : total.toFixed(1)}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize={11} fill="var(--text-dim)">
          {hover !== null ? data[hover].label : `Total ${unit}`}
        </text>
      </svg>
      <div className="stack" style={{ gap: '.4rem', flex: 1 }}>
        {data.map((d, i) => (
          <div key={i} className="spread" style={{ fontSize: '.82rem' }} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <span className="row" style={{ gap: '.45rem' }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: d.color, display: 'inline-block' }} />
              {d.label}
            </span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              <strong>{d.value.toFixed(2)}</strong> {unit} · {((d.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Barras horizontales comparativas. */
export function Bars({ data, unit = '', max }: { data: Slice[]; unit?: string; max?: number }) {
  const m = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="stack" style={{ gap: '.55rem' }}>
      {data.map((d, i) => (
        <div key={i}>
          <div className="spread" style={{ fontSize: '.8rem', marginBottom: 2 }}>
            <span>{d.label}</span>
            <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{d.value.toFixed(2)} {unit}</strong>
          </div>
          <div className="gauge-track">
            <div className="gauge-fill" style={{ width: `${(d.value / m) * 100}%`, background: d.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export interface LinePoint { x: string; y: number; }
export interface LineSeries { label: string; color: string; points: LinePoint[]; }

/** Gráfico de líneas para tendencias longitudinales. */
export function LineChart({ series, unit = '', height = 220 }: { series: LineSeries[]; unit?: string; height?: number }) {
  const all = series.flatMap((s) => s.points.map((p) => p.y));
  if (!all.length) return <div className="faint">Sin datos.</div>;
  const min = Math.min(...all), max = Math.max(...all);
  const pad = (max - min) * 0.15 || 1;
  const lo = min - pad, hi = max + pad;
  const W = 600, H = height, PADX = 44, PADY = 24;
  const labels = series[0]?.points.map((p) => p.x) ?? [];
  const n = Math.max(1, labels.length - 1);
  const sx = (i: number) => PADX + (i / n) * (W - PADX - 12);
  const sy = (v: number) => H - PADY - ((v - lo) / (hi - lo)) * (H - 2 * PADY);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const v = lo + f * (hi - lo);
          return (
            <g key={f}>
              <line x1={PADX} y1={sy(v)} x2={W - 12} y2={sy(v)} stroke="var(--border)" />
              <text x={4} y={sy(v) + 3} fontSize={9} fill="var(--text-faint)">{v.toFixed(1)}</text>
            </g>
          );
        })}
        {labels.map((l, i) => (
          <text key={i} x={sx(i)} y={H - 6} fontSize={9} fill="var(--text-faint)" textAnchor="middle">{l}</text>
        ))}
        {series.map((s, si) => (
          <g key={si}>
            <polyline fill="none" stroke={s.color} strokeWidth={2.2}
              points={s.points.map((p, i) => `${sx(i)},${sy(p.y)}`).join(' ')} />
            {s.points.map((p, i) => (
              <circle key={i} cx={sx(i)} cy={sy(p.y)} r={3.5} fill={s.color} />
            ))}
          </g>
        ))}
      </svg>
      <div className="row" style={{ gap: '1rem', marginTop: '.4rem', fontSize: '.78rem' }}>
        {series.map((s, i) => (
          <span key={i} className="row" style={{ gap: '.35rem' }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: s.color }} /> {s.label} {unit && `(${unit})`}
          </span>
        ))}
      </div>
    </div>
  );
}
