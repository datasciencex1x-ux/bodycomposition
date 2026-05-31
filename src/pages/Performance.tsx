import { useState } from 'react';
import { KPI, Badge, EquationButton } from '../components/ui';
import { oneRepMax, loadTable, hrMaxTanaka, hrMaxClassic, karvonenZones, vo2maxCooper, vo2maxHR, classifyVo2max } from '../engine';

export default function Performance() {
  const [tab, setTab] = useState<'rm' | 'hr' | 'vo2'>('rm');
  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Rendimiento</div>
        <div className="page-desc">Calculadoras de fuerza (1RM), zonas de frecuencia cardíaca y consumo de oxígeno (VO₂máx).</div>
      </div>
      <div className="tabs">
        <button className={tab === 'rm' ? 'active' : ''} onClick={() => setTab('rm')}>1RM y cargas</button>
        <button className={tab === 'hr' ? 'active' : ''} onClick={() => setTab('hr')}>Zonas de FC</button>
        <button className={tab === 'vo2' ? 'active' : ''} onClick={() => setTab('vo2')}>VO₂máx</button>
      </div>
      {tab === 'rm' && <OneRM />}
      {tab === 'hr' && <HRZones />}
      {tab === 'vo2' && <Vo2 />}
    </div>
  );
}

function OneRM() {
  const [w, setW] = useState(80);
  const [r, setR] = useState(5);
  const rm = oneRepMax(w, r);
  const table = loadTable(rm.mean);
  return (
    <>
      <div className="card">
        <div className="grid cols-2">
          <div><label>Peso levantado (kg)</label><input type="number" value={w} onChange={(e) => setW(+e.target.value)} /></div>
          <div><label>Repeticiones</label><input type="number" value={r} onChange={(e) => setR(+e.target.value)} /></div>
        </div>
      </div>
      <div className="grid cols-3">
        <KPI label="1RM (Epley)" value={isFinite(rm.epley) ? rm.epley.toFixed(1) : '—'} unit="kg" meta={<EquationButton label="Epley" author="Epley" year={1985} formula={'1RM = peso·(1 + reps/30)'} />} />
        <KPI label="1RM (Brzycki)" value={isFinite(rm.brzycki) ? rm.brzycki.toFixed(1) : '—'} unit="kg" meta={<EquationButton label="Brzycki" author="Brzycki" year={1993} formula={'1RM = peso·36/(37 − reps)'} />} />
        <KPI label="1RM (media)" value={isFinite(rm.mean) ? rm.mean.toFixed(1) : '—'} unit="kg" accent="var(--accent)" />
      </div>
      <div className="card">
        <h3>Tabla de cargas (% de 1RM)</h3>
        <table className="data">
          <thead><tr><th className="n">%1RM</th><th className="n">Carga</th><th>Reps aprox.</th></tr></thead>
          <tbody>{table.map((t) => <tr key={t.pct} className="row-hover"><td className="n">{t.pct}%</td><td className="n">{t.kg} kg</td><td className="muted">{t.reps}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

function HRZones() {
  const [age, setAge] = useState(25);
  const [rest, setRest] = useState(60);
  const hrMax = hrMaxTanaka(age);
  const zones = karvonenZones(hrMax, rest);
  return (
    <>
      <div className="card">
        <div className="grid cols-2">
          <div><label>Edad (años)</label><input type="number" value={age} onChange={(e) => setAge(+e.target.value)} /></div>
          <div><label>FC en reposo (lpm)</label><input type="number" value={rest} onChange={(e) => setRest(+e.target.value)} /></div>
        </div>
      </div>
      <div className="grid cols-3">
        <KPI label="FCmáx (Tanaka)" value={Math.round(hrMax)} unit="lpm" accent="var(--accent)" meta={<EquationButton label="FCmáx" author="Tanaka et al." year={2001} formula={'FCmáx = 208 − 0.7·edad'} />} />
        <KPI label="FCmáx (clásica)" value={Math.round(hrMaxClassic(age))} unit="lpm" meta="220 − edad" />
        <KPI label="Reserva de FC" value={Math.round(hrMax - rest)} unit="lpm" meta="método Karvonen" />
      </div>
      <div className="card">
        <h3>Zonas de entrenamiento (Karvonen)</h3>
        <table className="data">
          <thead><tr><th>Zona</th><th>Intensidad</th><th className="n">Rango FC (lpm)</th></tr></thead>
          <tbody>{zones.map((z) => <tr key={z.zone} className="row-hover"><td><strong>{z.zone}</strong></td><td className="muted">{z.desc}</td><td className="n">{z.lo} – {z.hi}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

function Vo2() {
  const [dist, setDist] = useState(2400);
  const [age, setAge] = useState(25);
  const [rest, setRest] = useState(60);
  const [sex, setSex] = useState<'M' | 'F'>('M');
  const cooper = vo2maxCooper(dist);
  const byHr = vo2maxHR(hrMaxTanaka(age), rest);
  return (
    <>
      <div className="card">
        <div className="grid cols-4">
          <div><label>Distancia 12 min (m)</label><input type="number" value={dist} onChange={(e) => setDist(+e.target.value)} /></div>
          <div><label>Edad</label><input type="number" value={age} onChange={(e) => setAge(+e.target.value)} /></div>
          <div><label>FC reposo</label><input type="number" value={rest} onChange={(e) => setRest(+e.target.value)} /></div>
          <div><label>Sexo</label><select value={sex} onChange={(e) => setSex(e.target.value as any)}><option value="M">Masculino</option><option value="F">Femenino</option></select></div>
        </div>
      </div>
      <div className="grid cols-2">
        <KPI label="VO₂máx (Cooper 12 min)" value={cooper.toFixed(1)} unit="ml/kg/min" accent="var(--accent)"
          meta={<><Badge kind="info">{classifyVo2max(cooper, sex, age)}</Badge> <EquationButton label="Cooper" author="Cooper" year={1968} formula={'VO₂máx = (distancia − 504.9)/44.73'} /></>} />
        <KPI label="VO₂máx (por FC)" value={byHr.toFixed(1)} unit="ml/kg/min"
          meta={<><Badge kind="info">{classifyVo2max(byHr, sex, age)}</Badge> <EquationButton label="VO₂máx por FC" author="Uth & Sørensen" year={2004} formula={'VO₂máx = 15.3·(FCmáx/FCreposo)'} /></>} />
      </div>
    </>
  );
}
