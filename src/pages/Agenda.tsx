import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Modal, Badge, Empty } from '../components/ui';
import { AppointmentStatus } from '../store/types';

const DOW = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const STATUS: Record<AppointmentStatus, { label: string; kind: 'good' | 'warn' | 'bad' | 'info' }> = {
  scheduled: { label: 'Programada', kind: 'warn' },
  done: { label: 'Realizada', kind: 'good' },
  noshow: { label: 'No asistió', kind: 'bad' },
  cancelled: { label: 'Cancelada', kind: 'bad' },
};

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // lunes = 0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function Agenda() {
  const { patients, appointments, addAppointment, updateAppointment, deleteAppointment } = useStore();
  const [ref, setRef] = useState(startOfWeek(new Date()));
  const [view, setView] = useState<'week' | 'day'>('week');
  const [dayRef, setDayRef] = useState(new Date().toISOString().slice(0, 10));
  const [modal, setModal] = useState<{ date: string } | null>(null);
  const [form, setForm] = useState({ patientId: '', time: '09:00', reason: '' });
  const todayISO = new Date().toISOString().slice(0, 10);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ref); d.setDate(d.getDate() + i); return d;
  });

  function apptsOn(iso: string) {
    return appointments.filter((a) => a.date === iso).sort((a, b) => a.time.localeCompare(b.time));
  }

  function save() {
    if (!modal || !form.patientId) return;
    addAppointment({ patientId: form.patientId, date: modal.date, time: form.time, status: 'scheduled', reason: form.reason });
    setModal(null); setForm({ patientId: '', time: '09:00', reason: '' });
  }

  if (!patients.length) return <div className="card"><Empty title="Sin pacientes" hint="Cree pacientes para agendar citas." /></div>;

  return (
    <div className="stack">
      <div className="page-head spread">
        <div>
          <div className="page-title">Agenda</div>
          <div className="page-desc">Calendario de citas con estado (programada, realizada, no asistió, cancelada).</div>
        </div>
        <div className="row">
          <div className="seg">
            <button className={view === 'week' ? 'on' : ''} onClick={() => setView('week')}>SEMANA</button>
            <button className={view === 'day' ? 'on' : ''} onClick={() => setView('day')}>DÍA</button>
          </div>
          {view === 'week' ? (
            <div className="row">
              <button className="icon-btn" onClick={() => { const d = new Date(ref); d.setDate(d.getDate() - 7); setRef(d); }}>‹</button>
              <button onClick={() => setRef(startOfWeek(new Date()))}>Hoy</button>
              <button className="icon-btn" onClick={() => { const d = new Date(ref); d.setDate(d.getDate() + 7); setRef(d); }}>›</button>
            </div>
          ) : (
            <input type="date" value={dayRef} onChange={(e) => setDayRef(e.target.value)} style={{ width: 170 }} />
          )}
        </div>
      </div>

      {view === 'week' ? (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
          {days.map((d, i) => {
            const iso = d.toISOString().slice(0, 10);
            const list = apptsOn(iso);
            const isToday = iso === todayISO;
            return (
              <div key={iso} className="card" style={{ padding: 0, borderColor: isToday ? 'var(--accent-line)' : undefined }}>
                <div className="cal-dayhead" style={{ borderLeft: 0, background: isToday ? 'var(--accent-soft)' : undefined, borderBottom: '1px solid var(--line)' }}>
                  <div className="cal-dow">{DOW[i]}</div>
                  <div className="cal-dnum" style={{ color: isToday ? 'var(--accent)' : undefined }}>{d.getDate()}</div>
                </div>
                <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 90 }}>
                  {list.map((a) => {
                    const p = patients.find((x) => x.id === a.patientId);
                    return (
                      <div key={a.id} className="cal-appt" style={{ position: 'static' }} onClick={() => updateAppointment(a.id, { status: a.status === 'scheduled' ? 'done' : 'scheduled' })} title="Clic: alternar realizada/programada">
                        <div className="cal-appt-t">{a.time} · <span style={{ color: `var(--${STATUS[a.status].kind === 'good' ? 'good' : STATUS[a.status].kind === 'bad' ? 'bad' : 'warn'})` }}>{STATUS[a.status].label}</span></div>
                        <div className="cal-appt-n">{p?.name ?? '—'}</div>
                        {a.reason && <div className="cal-appt-y">{a.reason}</div>}
                      </div>
                    );
                  })}
                  <button className="ghost" style={{ fontSize: 11, padding: '4px 6px' }} onClick={() => setModal({ date: iso })}>＋</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <h3>{dayRef}</h3>
          {apptsOn(dayRef).length === 0 ? <p className="muted">Sin citas este día.</p> : apptsOn(dayRef).map((a) => {
            const p = patients.find((x) => x.id === a.patientId);
            return (
              <div key={a.id} className="agenda-row">
                <span className="agenda-time">{a.time}</span>
                <div><strong>{p?.name}</strong><div className="faint" style={{ fontSize: 12 }}>{a.reason}</div></div>
                <div className="row">
                  <select value={a.status} onChange={(e) => updateAppointment(a.id, { status: e.target.value as AppointmentStatus })} style={{ width: 150 }}>
                    {(Object.keys(STATUS) as AppointmentStatus[]).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
                  </select>
                  <button className="danger" onClick={() => deleteAppointment(a.id)}>🗑</button>
                </div>
              </div>
            );
          })}
          <div className="row" style={{ marginTop: 12 }}><button className="primary" onClick={() => setModal({ date: dayRef })}>＋ Nueva cita</button></div>
        </div>
      )}

      {modal && (
        <Modal title={`Nueva cita · ${modal.date}`} onClose={() => setModal(null)}>
          <div className="stack" style={{ gap: 12 }}>
            <div><label>Paciente</label>
              <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
                <option value="">— Seleccione —</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="row">
              <div style={{ flex: 1 }}><label>Hora</label><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            </div>
            <div><label>Motivo</label><input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="primary" onClick={save} disabled={!form.patientId}>Agendar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
