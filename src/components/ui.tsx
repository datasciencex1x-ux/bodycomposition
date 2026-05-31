import { ReactNode, useState } from 'react';

export function KPI({ label, value, unit, accent }: { label: string; value: ReactNode; unit?: string; accent?: string }) {
  return (
    <div className="card kpi">
      <span className="lab">{label}</span>
      <span className="val" style={{ color: accent }}>
        {value} {unit && <span className="unit">{unit}</span>}
      </span>
    </div>
  );
}

export function Badge({ children, kind }: { children: ReactNode; kind?: 'good' | 'warn' | 'bad' }) {
  return <span className={`badge ${kind ?? ''}`}>{children}</span>;
}

export function Empty({ icon = '◌', title, hint }: { icon?: string; title: string; hint?: ReactNode }) {
  return (
    <div className="empty">
      <div className="big">{icon}</div>
      <div style={{ fontWeight: 600 }}>{title}</div>
      {hint && <div className="faint" style={{ marginTop: '.4rem' }}>{hint}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={wide ? { maxWidth: 820 } : undefined} onClick={(e) => e.stopPropagation()}>
        <div className="spread" style={{ marginBottom: '.8rem' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="ghost" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Botón "ver ecuación" con popover modal (transparencia metodológica). */
export function EquationButton({ label, author, year, formula, note }: { label: string; author: string; year: number; formula: string; note?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="ghost" style={{ fontSize: '.74rem', padding: '.25rem .5rem' }} onClick={() => setOpen(true)} title="Ver ecuación">
        ƒ ver ecuación
      </button>
      {open && (
        <Modal title={`${label} · ${author} (${year})`} onClose={() => setOpen(false)}>
          <p className="muted" style={{ fontSize: '.82rem' }}>Fórmula utilizada:</p>
          <code className="formula" style={{ display: 'block', padding: '.8rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{formula}</code>
          {note && <p className="faint" style={{ fontSize: '.78rem', marginTop: '.7rem' }}>{note}</p>}
        </Modal>
      )}
    </>
  );
}

export function Gauge({ position, color, segments }: { position: number; color: string; segments?: { color: string; label: string; w: number }[] }) {
  return (
    <div>
      <div className="gauge-track" style={{ height: 14 }}>
        {segments ? (
          <div style={{ display: 'flex', height: '100%' }}>
            {segments.map((s, i) => (
              <div key={i} style={{ flex: s.w, background: s.color, opacity: 0.55 }} title={s.label} />
            ))}
          </div>
        ) : (
          <div className="gauge-fill" style={{ width: `${position * 100}%`, background: color }} />
        )}
        <div style={{ position: 'relative', height: 0 }}>
          <div style={{ position: 'absolute', left: `calc(${Math.max(0, Math.min(1, position)) * 100}% - 7px)`, top: -17, width: 14, height: 14, borderRadius: '50%', background: '#fff', border: `3px solid ${color}`, boxShadow: '0 2px 6px rgba(0,0,0,.4)' }} />
        </div>
      </div>
    </div>
  );
}
