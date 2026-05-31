import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { KPI, Empty, Badge } from '../components/ui';
import { computeFor, fmt } from '../lib/compute';
import { decimalAgeRounded } from '../engine';

export default function Dashboard() {
  const { patients, evaluations, appointments, settings, seedDemo } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const todays = appointments.filter((a) => a.date === today);

  const recent = [...evaluations].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  if (!patients.length) {
    return (
      <div className="card">
        <Empty
          icon="🧬"
          title="Bienvenido a Body Composition"
          hint={
            <div className="stack" style={{ alignItems: 'center', marginTop: '1rem' }}>
              <p style={{ maxWidth: 460 }}>
                Plataforma de antropometría y composición corporal de grado clínico-científico
                (protocolo ISAK). Comience creando un paciente o cargue datos de demostración.
              </p>
              <div className="row" style={{ justifyContent: 'center' }}>
                <button className="primary" onClick={seedDemo}>Cargar datos de demostración</button>
                <Link to="/patients"><button>Crear paciente</button></Link>
              </div>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="grid cols-4">
        <KPI label="Pacientes" value={patients.length} accent="var(--accent)" />
        <KPI label="Evaluaciones" value={evaluations.length} accent="var(--accent-2)" />
        <KPI label="Citas hoy" value={todays.length} accent="var(--accent-3)" />
        <KPI label="Protocolo" value={settings.conversion === 'siri' ? 'Siri' : 'Brozek'} accent="var(--good)" />
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>Últimas evaluaciones</h3>
          {recent.length === 0 ? (
            <p className="muted">Sin evaluaciones.</p>
          ) : (
            <div className="scroll-x">
              <table>
                <thead>
                  <tr><th>Paciente</th><th>Fecha</th><th className="num">% Grasa</th><th className="num">Músculo</th><th></th></tr>
                </thead>
                <tbody>
                  {recent.map((ev) => {
                    const p = patients.find((x) => x.id === ev.patientId);
                    if (!p) return null;
                    const c = computeFor(p, ev, settings);
                    return (
                      <tr key={ev.id}>
                        <td>{p.name}</td>
                        <td className="muted">{ev.date.slice(0, 10)}</td>
                        <td className="num">{fmt(c.referenceFatPct, 1, '%')}</td>
                        <td className="num">{fmt(c.referenceMuscleKg, 1, 'kg')}</td>
                        <td className="num"><Link to={`/results/${ev.id}`}><button className="ghost">Ver</button></Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Agenda de hoy · {today}</h3>
          {todays.length === 0 ? (
            <p className="muted">Sin citas programadas para hoy.</p>
          ) : (
            <table>
              <thead><tr><th>Hora</th><th>Paciente</th><th>Motivo</th><th>Estado</th></tr></thead>
              <tbody>
                {todays.sort((a, b) => a.time.localeCompare(b.time)).map((a) => {
                  const p = patients.find((x) => x.id === a.patientId);
                  const kind = a.status === 'done' ? 'good' : a.status === 'noshow' || a.status === 'cancelled' ? 'bad' : 'warn';
                  const txt = { scheduled: 'Programada', done: 'Realizada', noshow: 'No asistió', cancelled: 'Cancelada' }[a.status];
                  return (
                    <tr key={a.id}>
                      <td><strong>{a.time}</strong></td>
                      <td>{p?.name ?? '—'}</td>
                      <td className="muted">{a.reason}</td>
                      <td><Badge kind={kind as any}>{txt}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <div className="spread">
          <h3 style={{ margin: 0 }}>Accesos rápidos</h3>
        </div>
        <div className="row" style={{ marginTop: '.8rem' }}>
          <Link to="/new"><button className="primary">＋ Nueva evaluación</button></Link>
          <Link to="/comparator"><button>Comparador</button></Link>
          <Link to="/sports"><button>Somatotipo vs Deportes</button></Link>
          <Link to="/metabolism"><button>Metabolismo</button></Link>
          <Link to="/diet"><button>Plan nutricional</button></Link>
          <Link to="/supplements"><button>Suplementos</button></Link>
          <Link to="/performance"><button>Rendimiento</button></Link>
          <Link to="/wearables"><button>Wearables</button></Link>
        </div>
      </div>
    </div>
  );
}
