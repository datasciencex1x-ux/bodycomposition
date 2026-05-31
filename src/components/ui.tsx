import { ReactNode, useState } from 'react';

export function KPI({ label, value, unit, accent, meta }: { label: string; value: ReactNode; unit?: string; accent?: string; meta?: ReactNode }) {
  return (
    <div className="stat">
      <div className="k">{label}</div>
      <div className="v" style={{ color: accent }}>{value}{unit && <small>{unit}</small>}</div>
      {meta && <div className="meta">{meta}</div>}
    </div>
  );
}

export function Badge({ children, kind }: { children: ReactNode; kind?: 'good' | 'warn' | 'bad' | 'info' }) {
  return <span className={`badge ${kind ?? ''}`}><span className="dot" />{children}</span>;
}

export function Empty({ icon = '◌', title, hint }: { icon?: string; title: string; hint?: ReactNode }) {
  return (
    <div className="empty">
      <div className="big">{icon}</div>
      <div style={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}>{title}</div>
      {hint && <div className="faint" style={{ marginTop: 8 }}>{hint}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={wide ? { maxWidth: 820 } : { maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="spread" style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Botón "ver ecuación" con popover (transparencia metodológica). */
export function EquationButton({ label, author, year, formula, note }: { label: string; author: string; year: number; formula: string; note?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button className="eq-btn" onClick={() => setOpen((o) => !o)} title="Ver ecuación">ƒ ecuación</button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 55 }} onClick={() => setOpen(false)} />
          <div className="popover" style={{ right: 0, top: 26 }}>
            <div className="pop-title">{label}</div>
            <div className="pop-cite">{author} · {year}</div>
            <div className="formula">{formula}</div>
            {note && <div className="faint" style={{ fontSize: 11 }}>{note}</div>}
          </div>
        </>
      )}
    </span>
  );
}

export function Gauge({ position, color, segments }: { position: number; color: string; segments?: { color: string; label: string; w: number }[] }) {
  const pos = Math.max(0, Math.min(1, position));
  const totalW = segments?.reduce((s, x) => s + x.w, 0) || 1;
  let acc = 0;
  return (
    <div className="gauge" style={{ height: 12 }}>
      {segments?.map((s, i) => {
        const left = (acc / totalW) * 100; acc += s.w;
        return <div key={i} className="seg" style={{ left: `${left}%`, width: `${(s.w / totalW) * 100}%`, background: s.color, opacity: 0.6 }} title={s.label} />;
      })}
      {!segments && <div className="seg" style={{ left: 0, width: `${pos * 100}%`, background: color }} />}
      <div className="gauge-marker" style={{ left: `${pos * 100}%`, background: color }} />
    </div>
  );
}
