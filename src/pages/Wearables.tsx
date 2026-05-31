import { useState } from 'react';
import { useStore } from '../store/useStore';
import { KPI, Empty } from '../components/ui';
import { LineChart } from '../components/charts';
import { mean } from '../engine';

export default function Wearables() {
  const { patients, wearables, addWearable, deleteWearable } = useStore();
  const [pid, setPid] = useState('');
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), steps: '', restingHR: '', sleepHours: '', weightKg: '', activeKcal: '' });

  if (!patients.length) return <div className="card"><Empty title="Sin pacientes" hint="Cree un paciente primero." /></div>;

  const entries = wearables.filter((w) => w.patientId === pid).sort((a, b) => a.date.localeCompare(b.date));
  const num = (v: string) => (v === '' ? undefined : parseFloat(v));

  function add() {
    if (!pid) return;
    addWearable({ patientId: pid, date: form.date, steps: num(form.steps), restingHR: num(form.restingHR), sleepHours: num(form.sleepHours), weightKg: num(form.weightKg), activeKcal: num(form.activeKcal) });
    setForm({ ...form, steps: '', restingHR: '', sleepHours: '', weightKg: '', activeKcal: '' });
  }

  const avg = (k: 'steps' | 'restingHR' | 'sleepHours') => {
    const vals = entries.map((e) => e[k]).filter((v): v is number => v !== undefined);
    return vals.length ? mean(vals) : null;
  };

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Wearables</div>
        <div className="page-desc">Registro manual de datos de dispositivos (pasos, FC en reposo, sueño, peso) y sus tendencias.</div>
      </div>

      <div className="card">
        <label>Paciente</label>
        <select value={pid} onChange={(e) => setPid(e.target.value)} style={{ maxWidth: 360 }}>
          <option value="">— Seleccione —</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {pid && (
        <>
          <div className="card">
            <h3>Nuevo registro</h3>
            <div className="fields">
              <div><label>Fecha</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div><label>Pasos</label><input type="number" value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} /></div>
              <div><label>FC reposo (lpm)</label><input type="number" value={form.restingHR} onChange={(e) => setForm({ ...form, restingHR: e.target.value })} /></div>
              <div><label>Sueño (h)</label><input type="number" step="0.1" value={form.sleepHours} onChange={(e) => setForm({ ...form, sleepHours: e.target.value })} /></div>
              <div><label>Peso (kg)</label><input type="number" step="0.1" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} /></div>
              <div><label>kcal activas</label><input type="number" value={form.activeKcal} onChange={(e) => setForm({ ...form, activeKcal: e.target.value })} /></div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}><button className="primary" onClick={add}>＋ Registrar</button></div>
          </div>

          {entries.length === 0 ? <div className="card"><Empty title="Sin registros" hint="Añade tu primer registro." /></div> : (
            <>
              <div className="grid cols-3">
                <KPI label="Pasos (media)" value={avg('steps')?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '—'} accent="var(--accent)" />
                <KPI label="FC reposo (media)" value={avg('restingHR')?.toFixed(0) ?? '—'} unit="lpm" accent="var(--fr-residual)" />
                <KPI label="Sueño (media)" value={avg('sleepHours')?.toFixed(1) ?? '—'} unit="h" accent="var(--info)" />
              </div>
              <div className="grid cols-2">
                <div className="card">
                  <h3>Pasos y kcal activas</h3>
                  <LineChart series={[
                    { label: 'Pasos', color: 'var(--accent)', points: entries.filter((e) => e.steps !== undefined).map((e) => ({ x: e.date.slice(5), y: e.steps! })) },
                    { label: 'kcal activas', color: 'var(--good)', points: entries.filter((e) => e.activeKcal !== undefined).map((e) => ({ x: e.date.slice(5), y: e.activeKcal! })) },
                  ]} />
                </div>
                <div className="card">
                  <h3>FC reposo, sueño y peso</h3>
                  <LineChart series={[
                    { label: 'FC reposo', color: 'var(--fr-residual)', points: entries.filter((e) => e.restingHR !== undefined).map((e) => ({ x: e.date.slice(5), y: e.restingHR! })) },
                    { label: 'Sueño', color: 'var(--info)', points: entries.filter((e) => e.sleepHours !== undefined).map((e) => ({ x: e.date.slice(5), y: e.sleepHours! })) },
                    { label: 'Peso', color: 'var(--accent-2)', points: entries.filter((e) => e.weightKg !== undefined).map((e) => ({ x: e.date.slice(5), y: e.weightKg! })) },
                  ]} />
                </div>
              </div>
              <div className="card scroll-x">
                <h3>Histórico</h3>
                <table className="data">
                  <thead><tr><th>Fecha</th><th className="n">Pasos</th><th className="n">FC reposo</th><th className="n">Sueño</th><th className="n">Peso</th><th className="n">kcal</th><th></th></tr></thead>
                  <tbody>
                    {[...entries].reverse().map((e) => (
                      <tr key={e.id} className="row-hover">
                        <td>{e.date}</td>
                        <td className="n">{e.steps?.toLocaleString() ?? '—'}</td>
                        <td className="n">{e.restingHR ?? '—'}</td>
                        <td className="n">{e.sleepHours ?? '—'}</td>
                        <td className="n">{e.weightKg ?? '—'}</td>
                        <td className="n">{e.activeKcal ?? '—'}</td>
                        <td className="n"><button className="danger" onClick={() => deleteWearable(e.id)}>🗑</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
