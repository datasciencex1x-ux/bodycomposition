import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Anthropometry, AnthroKey } from '../engine/types';
import { validate, RANGES, decimalAgeRounded } from '../engine';
import { Empty } from '../components/ui';

interface FieldDef { key: AnthroKey; label: string; unit: string; }

const GROUPS: { title: string; icon: string; fields: FieldDef[] }[] = [
  {
    title: 'Básicas', icon: '⚖',
    fields: [
      { key: 'weight', label: 'Peso', unit: 'kg' }, { key: 'height', label: 'Talla', unit: 'cm' },
      { key: 'sittingHeight', label: 'Talla sentado', unit: 'cm' }, { key: 'armSpan', label: 'Envergadura', unit: 'cm' },
    ],
  },
  {
    title: 'Pliegues cutáneos', icon: '꜀', fields: [
      { key: 'triceps', label: 'Tríceps', unit: 'mm' }, { key: 'subscapular', label: 'Subescapular', unit: 'mm' },
      { key: 'biceps', label: 'Bíceps', unit: 'mm' }, { key: 'iliacCrest', label: 'Cresta ilíaca', unit: 'mm' },
      { key: 'supraspinale', label: 'Supraespinal', unit: 'mm' }, { key: 'abdominal', label: 'Abdominal', unit: 'mm' },
      { key: 'frontThigh', label: 'Muslo anterior', unit: 'mm' }, { key: 'medialCalf', label: 'Pantorrilla medial', unit: 'mm' },
    ],
  },
  {
    title: 'Perímetros', icon: '◯', fields: [
      { key: 'headGirth', label: 'Cabeza', unit: 'cm' }, { key: 'neckGirth', label: 'Cuello', unit: 'cm' },
      { key: 'armRelaxed', label: 'Brazo relajado', unit: 'cm' }, { key: 'armFlexed', label: 'Brazo flexionado', unit: 'cm' },
      { key: 'forearm', label: 'Antebrazo', unit: 'cm' }, { key: 'wristGirth', label: 'Muñeca', unit: 'cm' },
      { key: 'chestGirth', label: 'Tórax (mesoesternal)', unit: 'cm' }, { key: 'waist', label: 'Cintura (mínima)', unit: 'cm' },
      { key: 'hip', label: 'Cadera (glútea)', unit: 'cm' }, { key: 'thighGirth', label: 'Muslo (subglúteo)', unit: 'cm' },
      { key: 'midThighGirth', label: 'Muslo medio', unit: 'cm' }, { key: 'calfGirth', label: 'Pantorrilla máx.', unit: 'cm' },
      { key: 'ankleGirth', label: 'Tobillo', unit: 'cm' },
    ],
  },
  {
    title: 'Diámetros óseos', icon: '↔', fields: [
      { key: 'biacromial', label: 'Biacromial', unit: 'cm' }, { key: 'biiliocristal', label: 'Biiliocrestídeo', unit: 'cm' },
      { key: 'transverseChest', label: 'Tórax transverso', unit: 'cm' }, { key: 'apChest', label: 'Tórax A-P', unit: 'cm' },
      { key: 'humerus', label: 'Húmero (biepicondíleo)', unit: 'cm' }, { key: 'wristBreadth', label: 'Muñeca (biestiloideo)', unit: 'cm' },
      { key: 'femur', label: 'Fémur (bicondíleo)', unit: 'cm' }, { key: 'ankleBreadth', label: 'Tobillo (bimaleolar)', unit: 'cm' },
    ],
  },
];

export default function NewEvaluation() {
  const { patientId } = useParams();
  const nav = useNavigate();
  const { patients, settings, addEvaluation } = useStore();
  const [pid, setPid] = useState(patientId ?? '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [protocol, setProtocol] = useState(settings.defaultProtocol);
  const [evaluator, setEvaluator] = useState(settings.evaluatorName);
  const [anthro, setAnthro] = useState<Anthropometry>({});
  const [notes, setNotes] = useState('');

  const patient = patients.find((p) => p.id === pid);
  const alerts = validate(anthro);
  const alertKeys = new Set(alerts.map((a) => a.key));

  function set(key: AnthroKey, v: string) {
    const num = v === '' ? undefined : parseFloat(v);
    setAnthro((a) => ({ ...a, [key]: num }));
  }

  function save() {
    if (!patient) return;
    const id = addEvaluation({ patientId: pid, date: new Date(date).toISOString(), evaluator, protocol, anthro, notes });
    nav(`/results/${id}`);
  }

  if (!patients.length) {
    return <div className="card"><Empty title="Necesita un paciente" hint={<Link to="/patients"><button className="primary">Crear paciente</button></Link>} /></div>;
  }

  const age = patient ? decimalAgeRounded(patient.birthDate, new Date(date).toISOString()) : null;

  return (
    <div className="stack">
      <div className="card">
        <div className="fields">
          <div style={{ gridColumn: 'span 2' }}>
            <label>Paciente</label>
            <select value={pid} onChange={(e) => setPid(e.target.value)}>
              <option value="">— Seleccione —</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sex === 'M' ? '♂' : '♀'})</option>)}
            </select>
          </div>
          <div><label>Fecha de evaluación</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label>Edad decimal</label><input value={age ?? '—'} disabled /></div>
          <div>
            <label>Protocolo (marcación de edad)</label>
            <select value={protocol} onChange={(e) => setProtocol(e.target.value as any)}>
              <option value="adult">Adulto</option><option value="pediatric">Pediátrico</option>
            </select>
          </div>
          <div><label>Evaluador</label><input value={evaluator} onChange={(e) => setEvaluator(e.target.value)} /></div>
        </div>
      </div>

      {GROUPS.map((g) => (
        <div className="card" key={g.title}>
          <h3>{g.icon} {g.title}</h3>
          <div className="fields">
            {g.fields.map((f) => {
              const r = RANGES[f.key];
              const err = alertKeys.has(f.key);
              return (
                <div key={f.key} className={err ? 'field-error' : ''}>
                  <label>{f.label} <span className="faint">({f.unit})</span></label>
                  <input type="number" step="0.1" placeholder={r ? `${r.min}–${r.max}` : ''}
                    value={anthro[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {alerts.length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(239,68,68,.4)' }}>
          <h3 style={{ color: 'var(--bad)' }}>⚠ Alertas de plausibilidad ({alerts.length})</h3>
          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
            {alerts.map((a, i) => <li key={i} className="muted" style={{ fontSize: '.85rem' }}>{a.message}</li>)}
          </ul>
        </div>
      )}

      <div className="card">
        <label>Notas de la evaluación</label>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button onClick={() => nav(-1)} className="ghost">Cancelar</button>
          <button className="primary" onClick={save} disabled={!patient || !anthro.weight || !anthro.height}>
            Calcular y guardar →
          </button>
        </div>
        {(!anthro.weight || !anthro.height) && <p className="faint" style={{ textAlign: 'right', fontSize: '.78rem', marginTop: '.4rem' }}>Peso y talla son obligatorios para el motor de cálculo.</p>}
      </div>
    </div>
  );
}
