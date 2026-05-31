import { useState } from 'react';
import { useStore } from '../store/useStore';
import SubjectPicker from '../components/SubjectPicker';
import { KPI, Empty, EquationButton, Badge } from '../components/ui';
import { Bars } from '../components/charts';
import { subjectMetrics } from '../lib/compute';
import { allBmrMethods, tdee, ACTIVITY_FACTORS, ActivityLevel } from '../engine';

export default function Metabolism() {
  const { patients, evaluations, settings } = useStore();
  const [pid, setPid] = useState('');
  const [level, setLevel] = useState<ActivityLevel>('moderate');

  if (!patients.length) return <div className="card"><Empty title="Sin pacientes" hint="Cree un paciente y una evaluación." /></div>;

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Metabolismo energético</div>
        <div className="page-desc">Gasto basal (BMR/RMR) y total (TDEE) con cuatro ecuaciones; las basadas en MLG usan tu composición corporal.</div>
      </div>

      <SubjectPicker patientId={pid} onChange={setPid}>
        {(sel) => {
          if (!sel) return null;
          const m = subjectMetrics(sel.patient, sel.ev, settings);
          const methods = allBmrMethods({ sex: m.sex, ageYears: m.ageYears, weightKg: m.weightKg, heightCm: m.heightCm, ffmKg: m.ffmKg });
          const applicable = methods.filter((x) => x.kcal !== null);
          const reco = applicable.find((x) => x.id === (m.ffmKg ? 'cunningham' : 'mifflin')) ?? applicable[0];
          const bmr = reco?.kcal ?? null;

          return (
            <>
              <div className="grid cols-4">
                <KPI label="Peso" value={m.weightKg?.toFixed(1) ?? '—'} unit="kg" />
                <KPI label="Masa libre de grasa" value={m.ffmKg?.toFixed(1) ?? '—'} unit="kg" meta={m.fatPct ? `${m.fatPct.toFixed(1)}% grasa` : undefined} />
                <KPI label="BMR de referencia" value={bmr ? Math.round(bmr) : '—'} unit="kcal" accent="var(--accent)" meta={reco?.label} />
                <KPI label="TDEE" value={bmr ? Math.round(tdee(bmr, level)) : '—'} unit="kcal" accent="var(--good)" meta={ACTIVITY_FACTORS[level].label} />
              </div>

              <div className="card">
                <h3>Nivel de actividad física</h3>
                <div className="pill-row">
                  {(Object.keys(ACTIVITY_FACTORS) as ActivityLevel[]).map((l) => (
                    <button key={l} className={'pill' + (level === l ? ' on' : '')} onClick={() => setLevel(l)}>
                      {ACTIVITY_FACTORS[l].label} · ×{ACTIVITY_FACTORS[l].factor}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3>Comparativa de ecuaciones</h3>
                <table className="data">
                  <thead><tr><th>Ecuación</th><th>Autor (año)</th><th className="n">BMR</th><th className="n">TDEE</th><th></th></tr></thead>
                  <tbody>
                    {methods.map((x) => (
                      <tr key={x.id} className="row-hover" style={{ opacity: x.kcal === null ? 0.45 : 1 }}>
                        <td><strong>{x.label}</strong> {reco && x.id === reco.id && <Badge kind="good">recomendada</Badge>}</td>
                        <td className="muted">{x.author} ({x.year})</td>
                        <td className="n">{x.kcal === null ? '—' : `${Math.round(x.kcal)} kcal`}</td>
                        <td className="n">{x.kcal === null ? '—' : `${Math.round(tdee(x.kcal, level))} kcal`}</td>
                        <td className="n"><EquationButton label={x.label} author={x.author} year={x.year} formula={x.formula} note={x.note} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {applicable.length > 0 && (
                <div className="card">
                  <h3>BMR por método</h3>
                  <Bars data={applicable.map((x) => ({ label: x.label, value: Math.round(x.kcal!), color: 'var(--accent)' }))} unit="kcal" />
                </div>
              )}
            </>
          );
        }}
      </SubjectPicker>
    </div>
  );
}
