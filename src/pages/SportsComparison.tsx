import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { computeFor, contextFor } from '../lib/compute';
import SomatoChart, { SomatoPoint } from '../components/SomatoChart';
import { rankSports, SPORTS_DB } from '../engine';
import { Empty, Badge } from '../components/ui';

export default function SportsComparison() {
  const { evalId } = useParams();
  const { patients, evaluations, settings } = useStore();

  // Permite elegir una evaluación si no viene por URL
  const withSoma = evaluations
    .map((e) => ({ e, p: patients.find((x) => x.id === e.patientId) }))
    .filter((x): x is { e: typeof evaluations[0]; p: NonNullable<typeof x.p> } => !!x.p);
  const [selId, setSelId] = useState(evalId ?? withSoma[0]?.e.id ?? '');
  const sel = withSoma.find((x) => x.e.id === selId);

  if (!sel) return <div className="card"><Empty title="Sin evaluaciones" hint="Cree una evaluación para comparar con deportes." /></div>;

  const c = computeFor(sel.p, sel.e, settings);
  const ctx = contextFor(sel.p, sel.e);
  const soma = c.somatotype;

  if (!soma.applicable) return (
    <div className="stack">
      <Picker withSoma={withSoma} selId={selId} setSelId={setSelId} />
      <div className="card"><Empty title="Somatotipo incompleto" hint={`Faltan datos: ${soma.missing.join(', ')}`} /></div>
    </div>
  );

  const ranking = rankSports({ endo: soma.endo, meso: soma.meso, ecto: soma.ecto }, ctx.sex);
  const [highlight, setHighlight] = useState<string | null>(null);

  const points: SomatoPoint[] = [
    ...SPORTS_DB.filter((s) => s.sex === ctx.sex).map((s) => {
      const r = ranking.find((x) => x.sport === s.sport)!;
      const on = highlight === s.sport;
      return { x: r.x, y: r.y, color: on ? 'var(--accent-2)' : 'var(--text-faint)', label: s.sport, size: on ? 8 : 4, ring: on };
    }),
    { x: soma.x, y: soma.y, color: 'var(--accent)', label: sel.p.name, size: 9, ring: true },
  ];

  return (
    <div className="stack">
      <Picker withSoma={withSoma} selId={selId} setSelId={setSelId} />
      <div className="grid cols-2">
        <SomatoChart title={`Somatocarta · ${sel.p.name} vs deportes (${ctx.sex === 'M' ? '♂' : '♀'})`} points={points} />
        <div className="card scroll-x">
          <h3>Deportes más afines (menor distancia somatotípica SAD)</h3>
          <table>
            <thead><tr><th>#</th><th>Deporte</th><th>Somatotipo</th><th className="num">SAD</th></tr></thead>
            <tbody>
              {ranking.map((s, i) => (
                <tr key={s.sport} onMouseEnter={() => setHighlight(s.sport)} onMouseLeave={() => setHighlight(null)}>
                  <td>{i === 0 ? <Badge kind="good">1</Badge> : i + 1}</td>
                  <td><strong>{s.sport}</strong> <span className="chip">{s.level}</span></td>
                  <td className="faint">{s.endo.toFixed(1)}-{s.meso.toFixed(1)}-{s.ecto.toFixed(1)}</td>
                  <td className="num">{s.sad.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="faint" style={{ fontSize: '.76rem', marginTop: '.6rem' }}>Referencias de literatura (Carter & Heath y col.). Valores medios orientativos de atletas de élite.</p>
        </div>
      </div>
    </div>
  );
}

function Picker({ withSoma, selId, setSelId }: { withSoma: any[]; selId: string; setSelId: (v: string) => void }) {
  return (
    <div className="card">
      <label>Evaluación</label>
      <select value={selId} onChange={(e) => setSelId(e.target.value)} style={{ maxWidth: 420 }}>
        {withSoma.map((x) => <option key={x.e.id} value={x.e.id}>{x.p.name} · {x.e.date.slice(0, 10)}</option>)}
      </select>
    </div>
  );
}
