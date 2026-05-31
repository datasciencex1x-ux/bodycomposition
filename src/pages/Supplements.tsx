import { useState } from 'react';
import { Badge } from '../components/ui';
import { recommendSupplements, GOAL_LABELS, DietGoal } from '../engine';

export default function Supplements() {
  const [goal, setGoal] = useState<DietGoal | ''>('');
  const [type, setType] = useState<'all' | 'endurance' | 'strength'>('all');
  const list = recommendSupplements({ goal: goal || undefined, type });

  const evColor = (e: string) => (e === 'A' ? 'good' : e === 'B' ? 'warn' : 'info') as 'good' | 'warn' | 'info';

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Suplementos basados en evidencia</div>
        <div className="page-desc">Recomendaciones orientativas según objetivo y modalidad (consenso ISSN / COI 2018). No sustituye consejo médico.</div>
      </div>

      <div className="card">
        <div className="row">
          <div className="seg">
            <button className={goal === '' ? 'on' : ''} onClick={() => setGoal('')}>TODOS</button>
            {(Object.keys(GOAL_LABELS) as DietGoal[]).map((g) => (
              <button key={g} className={goal === g ? 'on' : ''} onClick={() => setGoal(g)}>{GOAL_LABELS[g].label.split(' ')[0].toUpperCase()}</button>
            ))}
          </div>
          <div className="seg">
            <button className={type === 'all' ? 'on' : ''} onClick={() => setType('all')}>GENERAL</button>
            <button className={type === 'strength' ? 'on' : ''} onClick={() => setType('strength')}>FUERZA</button>
            <button className={type === 'endurance' ? 'on' : ''} onClick={() => setType('endurance')}>RESISTENCIA</button>
          </div>
        </div>
      </div>

      <div className="grid cols-2">
        {list.map((s) => (
          <div className="card" key={s.name}>
            <div className="spread">
              <h3 style={{ margin: 0, fontSize: 15 }}>{s.name}</h3>
              <Badge kind={evColor(s.evidence)}>Evidencia {s.evidence}</Badge>
            </div>
            <div className="kv"><span className="key">Dosis</span><span className="val">{s.dose}</span></div>
            <div className="kv"><span className="key">Momento</span><span className="val" style={{ fontFamily: 'var(--font-body)' }}>{s.timing}</span></div>
            <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>{s.benefit}</p>
            <div className="row" style={{ marginTop: 8 }}>
              {s.strength && <span className="chip">Fuerza/Potencia</span>}
              {s.endurance && <span className="chip">Resistencia</span>}
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="card"><p className="muted">Sin coincidencias para los filtros.</p></div>}
      </div>

      <p className="faint" style={{ fontSize: 11.5 }}>
        Evidencia A: fuerte respaldo científico · B: respaldo moderado/contextual · C: emergente o individual.
        Verificar interacciones, normativa antidopaje (AMA/WADA) y estado de salud antes de suplementar.
      </p>
    </div>
  );
}
