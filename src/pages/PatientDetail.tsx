import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { computeFor, fmt } from '../lib/compute';
import { KPI, Badge, Empty } from '../components/ui';
import { decimalAgeRounded } from '../engine';
import { LineChart } from '../components/charts';

export default function PatientDetail() {
  const { id } = useParams();
  const { patients, evaluations, appointments, settings, addAppointment, updateAppointment, deleteAppointment } = useStore();
  const patient = patients.find((p) => p.id === id);
  const [apptDate, setApptDate] = useState(new Date().toISOString().slice(0, 10));
  const [apptTime, setApptTime] = useState('09:00');
  const [apptReason, setApptReason] = useState('');

  if (!patient) return <div className="card"><Empty title="Paciente no encontrado" hint={<Link to="/patients">Volver</Link>} /></div>;

  const evs = evaluations.filter((e) => e.patientId === patient.id).sort((a, b) => a.date.localeCompare(b.date));
  const appts = appointments.filter((a) => a.patientId === patient.id).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const series = evs.map((e) => {
    const c = computeFor(patient, e, settings);
    return { date: e.date.slice(0, 10), fat: c.referenceFatPct, muscle: c.referenceMuscleKg, weight: e.anthro.weight ?? null };
  });

  return (
    <div className="stack">
      <div className="card">
        <div className="spread">
          <div>
            <h2 style={{ margin: 0 }}>{patient.name}</h2>
            <div className="muted" style={{ fontSize: '.86rem' }}>
              {patient.docId || 'Sin ID'} · {patient.sex === 'M' ? '♂ Masculino' : '♀ Femenino'} · {decimalAgeRounded(patient.birthDate, new Date().toISOString())} años
            </div>
            <div className="row" style={{ marginTop: '.5rem' }}>
              {patient.sport && <span className="chip">{patient.sport}</span>}
              {patient.level && <span className="chip">{patient.level}</span>}
              {patient.tags.map((t) => <span key={t} className="chip">{t}</span>)}
            </div>
          </div>
          <div className="row">
            <Link to={`/new/${patient.id}`}><button className="primary">＋ Nueva evaluación</button></Link>
            {evs.length >= 2 && <Link to="/comparator"><button>⇄ Comparar</button></Link>}
          </div>
        </div>
        {patient.notes && <p className="muted" style={{ fontSize: '.85rem', marginTop: '.6rem' }}>{patient.notes}</p>}
      </div>

      {series.length >= 2 && (
        <div className="grid cols-2">
          <div className="card">
            <h3>Evolución · % grasa y peso</h3>
            <LineChart series={[
              { label: '% Grasa', color: 'var(--warn)', points: series.filter((s) => s.fat !== null).map((s) => ({ x: s.date, y: s.fat! })) },
              { label: 'Peso', color: 'var(--accent)', points: series.filter((s) => s.weight !== null).map((s) => ({ x: s.date, y: s.weight! })) },
            ]} />
          </div>
          <div className="card">
            <h3>Evolución · masa muscular (kg)</h3>
            <LineChart series={[
              { label: 'Músculo', color: 'var(--bad)', points: series.filter((s) => s.muscle !== null).map((s) => ({ x: s.date, y: s.muscle! })) },
            ]} unit="kg" />
          </div>
        </div>
      )}

      <div className="card">
        <h3>Historial antropométrico ({evs.length})</h3>
        {evs.length === 0 ? <p className="muted">Sin evaluaciones registradas.</p> : (
          <div className="scroll-x">
            <table>
              <thead><tr><th>Fecha</th><th className="num">Peso</th><th className="num">IMC</th><th className="num">% Grasa</th><th className="num">Músculo</th><th>Somatotipo</th><th></th></tr></thead>
              <tbody>
                {[...evs].reverse().map((e) => {
                  const c = computeFor(patient, e, settings);
                  const bmi = e.anthro.weight && e.anthro.height ? e.anthro.weight / (e.anthro.height / 100) ** 2 : null;
                  return (
                    <tr key={e.id}>
                      <td>{e.date.slice(0, 10)}</td>
                      <td className="num">{fmt(e.anthro.weight, 1, 'kg')}</td>
                      <td className="num">{fmt(bmi, 1)}</td>
                      <td className="num">{fmt(c.referenceFatPct, 1, '%')}</td>
                      <td className="num">{fmt(c.referenceMuscleKg, 1, 'kg')}</td>
                      <td>{c.somatotype.applicable ? `${c.somatotype.endo.toFixed(1)}-${c.somatotype.meso.toFixed(1)}-${c.somatotype.ecto.toFixed(1)}` : '—'}</td>
                      <td className="num">
                        <div className="row" style={{ justifyContent: 'flex-end' }}>
                          <Link to={`/results/${e.id}`}><button className="ghost">Ver</button></Link>
                          <button className="ghost danger" onClick={() => confirm('¿Eliminar evaluación?') && deleteEvaluation(e.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Agendamiento</h3>
        <div className="row" style={{ marginBottom: '.8rem' }}>
          <input type="date" value={apptDate} onChange={(e) => setApptDate(e.target.value)} style={{ width: 160 }} />
          <input type="time" value={apptTime} onChange={(e) => setApptTime(e.target.value)} style={{ width: 120 }} />
          <input placeholder="Motivo" value={apptReason} onChange={(e) => setApptReason(e.target.value)} style={{ width: 240 }} />
          <button className="primary" onClick={() => { addAppointment({ patientId: patient.id, date: apptDate, time: apptTime, status: 'scheduled', reason: apptReason }); setApptReason(''); }}>＋ Agendar</button>
        </div>
        {appts.length === 0 ? <p className="muted">Sin citas.</p> : (
          <table>
            <thead><tr><th>Fecha</th><th>Hora</th><th>Motivo</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {appts.map((a) => (
                <tr key={a.id}>
                  <td>{a.date}</td><td>{a.time}</td><td className="muted">{a.reason}</td>
                  <td>
                    <select value={a.status} onChange={(e) => updateAppointment(a.id, { status: e.target.value as any })} style={{ width: 140 }}>
                      <option value="scheduled">Programada</option><option value="done">Realizada</option>
                      <option value="noshow">No asistió</option><option value="cancelled">Cancelada</option>
                    </select>
                  </td>
                  <td className="num"><button className="ghost danger" onClick={() => deleteAppointment(a.id)}>🗑</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// helper para borrar evaluación dentro del componente
function deleteEvaluation(id: string) {
  useStore.getState().deleteEvaluation(id);
}
