import { useStore } from '../store/useStore';
import { latestEval } from '../lib/compute';
import { Patient, Evaluation } from '../store/types';

/** Selector de paciente que devuelve su evaluación más reciente. */
export default function SubjectPicker({
  patientId, onChange, children,
}: {
  patientId: string;
  onChange: (id: string) => void;
  children?: (sel: { patient: Patient; ev: Evaluation } | null) => React.ReactNode;
}) {
  const { patients, evaluations } = useStore();
  const patient = patients.find((p) => p.id === patientId);
  const ev = patient ? latestEval(evaluations, patient.id) : undefined;
  const sel = patient && ev ? { patient, ev } : null;

  return (
    <>
      <div className="card">
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label>Paciente (usa su evaluación más reciente)</label>
            <select value={patientId} onChange={(e) => onChange(e.target.value)}>
              <option value="">— Seleccione —</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sex === 'M' ? '♂' : '♀'})</option>)}
            </select>
          </div>
          {sel && <span className="badge info"><span className="dot" />Eval. {sel.ev.date.slice(0, 10)}</span>}
          {patientId && !ev && <span className="badge warn"><span className="dot" />Sin evaluaciones</span>}
        </div>
      </div>
      {children?.(sel)}
    </>
  );
}
