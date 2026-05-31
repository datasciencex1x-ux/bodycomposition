import { useState } from 'react';
import { useStore } from '../store/useStore';
import SubjectPicker from '../components/SubjectPicker';
import { KPI, Empty } from '../components/ui';
import { Donut } from '../components/charts';
import { subjectMetrics } from '../lib/compute';
import { allBmrMethods, tdee, ACTIVITY_FACTORS, ActivityLevel, macroPlan, GOAL_LABELS, DietGoal } from '../engine';

export default function Diet() {
  const { patients, settings } = useStore();
  const [pid, setPid] = useState('');
  const [level, setLevel] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<DietGoal>('maintain');

  if (!patients.length) return <div className="card"><Empty title="Sin pacientes" hint="Cree un paciente y una evaluación." /></div>;

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Plan nutricional</div>
        <div className="page-desc">Objetivo calórico y reparto de macronutrientes a partir del gasto energético y la composición corporal.</div>
      </div>

      <SubjectPicker patientId={pid} onChange={setPid}>
        {(sel) => {
          if (!sel) return null;
          const m = subjectMetrics(sel.patient, sel.ev, settings);
          if (!m.weightKg) return <div className="card"><Empty title="Falta el peso" hint="La evaluación seleccionada no tiene peso." /></div>;
          const methods = allBmrMethods({ sex: m.sex, ageYears: m.ageYears, weightKg: m.weightKg, heightCm: m.heightCm, ffmKg: m.ffmKg });
          const reco = methods.find((x) => x.id === (m.ffmKg ? 'cunningham' : 'mifflin')) ?? methods.find((x) => x.kcal !== null);
          const bmr = reco?.kcal ?? null;
          const td = bmr ? tdee(bmr, level) : null;
          const plan = td ? macroPlan({ tdee: td, weightKg: m.weightKg, goal }) : null;

          return (
            <>
              <div className="card">
                <div className="grid cols-2">
                  <div>
                    <label>Nivel de actividad</label>
                    <select value={level} onChange={(e) => setLevel(e.target.value as ActivityLevel)}>
                      {(Object.keys(ACTIVITY_FACTORS) as ActivityLevel[]).map((l) => <option key={l} value={l}>{ACTIVITY_FACTORS[l].label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Objetivo</label>
                    <select value={goal} onChange={(e) => setGoal(e.target.value as DietGoal)}>
                      {(Object.keys(GOAL_LABELS) as DietGoal[]).map((g) => <option key={g} value={g}>{GOAL_LABELS[g].label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {plan && (
                <>
                  <div className="grid cols-4">
                    <KPI label="TDEE (mantenimiento)" value={Math.round(td!)} unit="kcal" />
                    <KPI label="Objetivo calórico" value={plan.targetKcal} unit="kcal" accent="var(--accent)" meta={GOAL_LABELS[goal].label} />
                    <KPI label="Proteína" value={plan.proteinG} unit="g" accent="var(--fr-muscle)" meta={`${plan.proteinPerKg.toFixed(1)} g/kg`} />
                    <KPI label="Hidratación" value={(plan.hydrationMl / 1000).toFixed(1)} unit="L" accent="var(--info)" meta="35 ml/kg" />
                  </div>

                  <div className="grid cols-2">
                    <div className="card">
                      <h3>Reparto de macronutrientes</h3>
                      <Donut unit="kcal" data={[
                        { label: `Proteína · ${plan.proteinG} g`, value: plan.proteinKcal, color: 'var(--fr-muscle)' },
                        { label: `Grasa · ${plan.fatG} g`, value: plan.fatKcal, color: 'var(--fr-adipose)' },
                        { label: `Carbohidratos · ${plan.carbG} g`, value: plan.carbKcal, color: 'var(--info)' },
                      ]} />
                    </div>
                    <div className="card">
                      <h3>Detalle</h3>
                      <table className="data">
                        <thead><tr><th>Macro</th><th className="n">Gramos</th><th className="n">kcal</th><th className="n">%</th></tr></thead>
                        <tbody>
                          <tr><td>Proteína</td><td className="n">{plan.proteinG} g</td><td className="n">{plan.proteinKcal}</td><td className="n">{Math.round((plan.proteinKcal / plan.targetKcal) * 100)}%</td></tr>
                          <tr><td>Grasa</td><td className="n">{plan.fatG} g</td><td className="n">{plan.fatKcal}</td><td className="n">{Math.round((plan.fatKcal / plan.targetKcal) * 100)}%</td></tr>
                          <tr><td>Carbohidratos</td><td className="n">{plan.carbG} g</td><td className="n">{plan.carbKcal}</td><td className="n">{Math.round((plan.carbKcal / plan.targetKcal) * 100)}%</td></tr>
                        </tbody>
                      </table>
                      <p className="faint" style={{ fontSize: 11.5, marginTop: 10 }}>Proteína 4 kcal/g · Grasa 9 kcal/g · Carbohidratos 4 kcal/g. Recomendaciones orientativas (ISSN); ajustar según tolerancia y adherencia.</p>
                    </div>
                  </div>
                </>
              )}
            </>
          );
        }}
      </SubjectPicker>
    </div>
  );
}
