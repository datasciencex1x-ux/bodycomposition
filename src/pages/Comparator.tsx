import { useState } from 'react';
import { useStore } from '../store/useStore';
import { computeFor } from '../lib/compute';
import { LineChart } from '../components/charts';
import SomatoChart, { SomatoPoint } from '../components/SomatoChart';
import { somatotypeSAM, mean, stdev } from '../engine';
import { Empty } from '../components/ui';

export default function Comparator() {
  const [mode, setMode] = useState<'long' | 'group'>('long');
  return (
    <div className="stack">
      <div className="tabs">
        <button className={mode === 'long' ? 'active' : ''} onClick={() => setMode('long')}>Intra-paciente (evolución)</button>
        <button className={mode === 'group' ? 'active' : ''} onClick={() => setMode('group')}>Entre grupos / cohortes</button>
      </div>
      {mode === 'long' ? <Longitudinal /> : <GroupCompare />}
    </div>
  );
}

function arrow(delta: number, goodDown = false) {
  if (Math.abs(delta) < 0.05) return <span className="faint">→</span>;
  const improving = goodDown ? delta < 0 : delta > 0;
  return <span style={{ color: improving ? 'var(--good)' : 'var(--bad)' }}>{delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(2)}</span>;
}

function Longitudinal() {
  const { patients, evaluations, settings } = useStore();
  const [pid, setPid] = useState('');
  const patient = patients.find((p) => p.id === pid);
  const evs = evaluations.filter((e) => e.patientId === pid).sort((a, b) => a.date.localeCompare(b.date));

  if (!patients.length) return <div className="card"><Empty title="Sin pacientes" /></div>;

  const rows = patient ? evs.map((e) => {
    const c = computeFor(patient, e, settings);
    return { date: e.date.slice(0, 10), weight: e.anthro.weight ?? null, fat: c.referenceFatPct, muscle: c.referenceMuscleKg, soma: c.somatotype };
  }) : [];

  const points: SomatoPoint[] = rows.filter((r) => r.soma.applicable).map((r, i, arr) => ({
    x: r.soma.x, y: r.soma.y, label: r.date, size: 6,
    color: `hsl(${210 + (i / Math.max(1, arr.length - 1)) * 80}, 80%, 60%)`, ring: i === arr.length - 1,
  }));

  return (
    <div className="stack">
      <div className="card">
        <label>Paciente</label>
        <select value={pid} onChange={(e) => setPid(e.target.value)} style={{ maxWidth: 360 }}>
          <option value="">— Seleccione —</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {patient && evs.length < 2 && <div className="card"><Empty title="Se requieren ≥2 evaluaciones" hint="Registre otra evaluación para comparar la evolución." /></div>}

      {patient && evs.length >= 2 && (
        <>
          <div className="grid cols-2">
            <div className="card">
              <h3>Tendencias</h3>
              <LineChart series={[
                { label: '% Grasa', color: 'var(--warn)', points: rows.filter((r) => r.fat !== null).map((r) => ({ x: r.date, y: r.fat! })) },
                { label: 'Músculo', color: 'var(--bad)', points: rows.filter((r) => r.muscle !== null).map((r) => ({ x: r.date, y: r.muscle! })) },
                { label: 'Peso', color: 'var(--accent)', points: rows.filter((r) => r.weight !== null).map((r) => ({ x: r.date, y: r.weight! })) },
              ]} />
            </div>
            <SomatoChart title="Desplazamiento del somatotipo" points={points} />
          </div>

          <div className="card scroll-x">
            <h3>Tabla de deltas (primera → última)</h3>
            <table>
              <thead><tr><th>Variable</th><th className="num">Inicial</th><th className="num">Final</th><th className="num">Δ</th></tr></thead>
              <tbody>
                {([
                  ['Peso (kg)', rows[0].weight, rows.at(-1)!.weight, false],
                  ['% Grasa', rows[0].fat, rows.at(-1)!.fat, true],
                  ['Músculo (kg)', rows[0].muscle, rows.at(-1)!.muscle, false],
                  ['Endomorfia', rows[0].soma.endo, rows.at(-1)!.soma.endo, true],
                  ['Mesomorfia', rows[0].soma.meso, rows.at(-1)!.soma.meso, false],
                  ['Ectomorfia', rows[0].soma.ecto, rows.at(-1)!.soma.ecto, false],
                ] as [string, number | null, number | null, boolean][]).map(([lbl, a, b, goodDown]) => (
                  <tr key={lbl}>
                    <td>{lbl}</td>
                    <td className="num">{a === null ? '—' : a.toFixed(2)}</td>
                    <td className="num">{b === null ? '—' : b.toFixed(2)}</td>
                    <td className="num">{a !== null && b !== null ? arrow(b - a, goodDown) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function GroupCompare() {
  const { groups, patients, evaluations, settings } = useStore();
  const [sel, setSel] = useState<string[]>([]);

  if (!groups.length) return <div className="card"><Empty title="Sin grupos" hint="Cree cohortes en Pacientes → Grupos." /></div>;

  function latestMetricsForPatient(pid: string) {
    const evs = evaluations.filter((e) => e.patientId === pid).sort((a, b) => b.date.localeCompare(a.date));
    const p = patients.find((x) => x.id === pid);
    if (!evs.length || !p) return null;
    const c = computeFor(p, evs[0], settings);
    return { fat: c.referenceFatPct, muscle: c.referenceMuscleKg, weight: evs[0].anthro.weight ?? null, soma: c.somatotype };
  }

  const colors = ['#4f8cff', '#22d3ee', '#a78bfa', '#eab308', '#ef4444'];
  const chosen = groups.filter((g) => sel.includes(g.id));

  const points: SomatoPoint[] = [];
  const stats = chosen.map((g, gi) => {
    const metrics = g.patientIds.map(latestMetricsForPatient).filter(Boolean) as NonNullable<ReturnType<typeof latestMetricsForPatient>>[];
    const fats = metrics.map((m) => m.fat).filter((v): v is number => v !== null);
    const muscles = metrics.map((m) => m.muscle).filter((v): v is number => v !== null);
    const somas = metrics.filter((m) => m.soma.applicable).map((m) => ({ endo: m.soma.endo, meso: m.soma.meso, ecto: m.soma.ecto }));
    somas.forEach((s) => { const m = metrics.find((mm) => mm.soma.endo === s.endo)!; points.push({ x: m.soma.x, y: m.soma.y, label: g.name, size: 5, color: colors[gi % colors.length] }); });
    let sam = null as null | { mean: any; sam: number };
    if (somas.length) { sam = somatotypeSAM(somas); points.push({ x: sam.mean.ecto - sam.mean.endo, y: 2 * sam.mean.meso - (sam.mean.endo + sam.mean.ecto), label: `${g.name} (medio)`, size: 9, color: colors[gi % colors.length], ring: true }); }
    return {
      name: g.name, color: colors[gi % colors.length], n: metrics.length,
      fatM: fats.length ? mean(fats) : null, fatSD: fats.length ? stdev(fats) : null,
      musM: muscles.length ? mean(muscles) : null, musSD: muscles.length ? stdev(muscles) : null,
      sam,
    };
  });

  function exportCSV() {
    const header = 'Grupo,n,Grasa media,Grasa DE,Musculo medio,Musculo DE,SAM\n';
    const body = stats.map((s) => `${s.name},${s.n},${s.fatM?.toFixed(2) ?? ''},${s.fatSD?.toFixed(2) ?? ''},${s.musM?.toFixed(2) ?? ''},${s.musSD?.toFixed(2) ?? ''},${s.sam?.sam.toFixed(2) ?? ''}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'comparativa_grupos.csv'; a.click();
  }

  return (
    <div className="stack">
      <div className="card">
        <label>Seleccione 2+ grupos</label>
        <div className="row">
          {groups.map((g) => (
            <button key={g.id} className={sel.includes(g.id) ? '' : 'ghost'}
              onClick={() => setSel(sel.includes(g.id) ? sel.filter((x) => x !== g.id) : [...sel, g.id])}>
              {sel.includes(g.id) ? '✓ ' : ''}{g.name} ({g.patientIds.length})
            </button>
          ))}
        </div>
      </div>

      {chosen.length >= 1 && (
        <div className="grid cols-2">
          <SomatoChart title="Nube de somatotipos por grupo" points={points} />
          <div className="card scroll-x">
            <div className="spread"><h3 style={{ margin: 0 }}>Estadística descriptiva (media ± DE)</h3><button className="ghost" onClick={exportCSV}>⤓ CSV</button></div>
            <table>
              <thead><tr><th>Grupo</th><th className="num">n</th><th className="num">% Grasa</th><th className="num">Músculo (kg)</th><th className="num">SAM</th></tr></thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.name}>
                    <td><span style={{ color: s.color }}>●</span> {s.name}</td>
                    <td className="num">{s.n}</td>
                    <td className="num">{s.fatM !== null ? `${s.fatM.toFixed(1)} ± ${s.fatSD!.toFixed(1)}` : '—'}</td>
                    <td className="num">{s.musM !== null ? `${s.musM.toFixed(1)} ± ${s.musSD!.toFixed(1)}` : '—'}</td>
                    <td className="num">{s.sam ? s.sam.sam.toFixed(2) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="faint" style={{ fontSize: '.76rem', marginTop: '.6rem' }}>SAM = Somatotype Attitudinal Mean (dispersión del grupo respecto a su somatotipo medio).</p>
          </div>
        </div>
      )}
    </div>
  );
}
