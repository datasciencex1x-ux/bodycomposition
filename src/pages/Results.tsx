import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { computeFor, contextFor, fmt } from '../lib/compute';
import { KPI, Badge, EquationButton, Gauge, Empty } from '../components/ui';
import { Donut, Bars } from '../components/charts';
import SomatoChart from '../components/SomatoChart';
import BodyMap from '../components/BodyMap';
import { FAT_BANDS } from '../engine';

const TISSUE_COLORS: Record<string, string> = {
  skin: '#a78bfa', adipose: '#eab308', muscle: '#ef4444', bone: '#e2e8f0', residual: '#22d3ee',
};

export default function Results() {
  const { id } = useParams();
  const { evaluations, patients, settings } = useStore();
  const [tab, setTab] = useState<'frac' | 'soma' | 'fat' | 'muscle' | 'idx'>('frac');

  const ev = evaluations.find((e) => e.id === id);
  const patient = ev && patients.find((p) => p.id === ev.patientId);
  if (!ev || !patient) return <div className="card"><Empty title="Evaluación no encontrada" hint={<Link to="/">Volver al inicio</Link>} /></div>;

  const c = computeFor(patient, ev, settings);
  const ctx = contextFor(patient, ev);
  const k = c.kerr;

  return (
    <div className="stack">
      {/* Encabezado */}
      <div className="card">
        <div className="spread">
          <div>
            <h2 style={{ margin: 0 }}>{patient.name}</h2>
            <div className="muted" style={{ fontSize: '.85rem' }}>
              {patient.sex === 'M' ? '♂' : '♀'} · {ctx.ageYears} años · {patient.sport || 'Sin deporte'} · {ev.date.slice(0, 10)} · Protocolo {ev.protocol === 'adult' ? 'adulto' : 'pediátrico'}
            </div>
          </div>
          <div className="row">
            <Link to={`/sports/${ev.id}`}><button>◎ Deportes</button></Link>
            <Link to={`/reports/${ev.id}`}><button className="primary">⎙ Reporte</button></Link>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid cols-4">
        <KPI label="% Grasa de referencia" value={fmt(c.referenceFatPct, 1)} unit="%" accent="var(--warn)" />
        <KPI label="Masa muscular (Kerr)" value={fmt(c.referenceMuscleKg, 1)} unit="kg" accent="var(--bad)" />
        <KPI label="Somatotipo" value={`${c.somatotype.endo.toFixed(1)}-${c.somatotype.meso.toFixed(1)}-${c.somatotype.ecto.toFixed(1)}`} accent="var(--accent-2)" />
        <KPI label="Peso estructurado" value={fmt(k.structuredWeight, 1)} unit="kg" accent="var(--accent)" />
      </div>

      {/* Clasificaciones */}
      {(c.fatClass || c.muscleClass) && (
        <div className="grid cols-2">
          {c.fatClass && (
            <div className="card">
              <div className="spread"><h3 style={{ margin: 0 }}>Clasificación % grasa</h3><Badge>{c.fatClass.label}</Badge></div>
              <p className="muted" style={{ fontSize: '.82rem', margin: '.4rem 0 .8rem' }}>{c.fatClass.description}</p>
              <Gauge position={c.fatClass.position} color={c.fatClass.color}
                segments={FAT_BANDS[ctx.sex].map((b) => ({ color: b.color, label: b.label, w: b.max - b.min }))} />
              <div className="row" style={{ justifyContent: 'space-between', marginTop: '.5rem', fontSize: '.68rem' }}>
                {FAT_BANDS[ctx.sex].map((b) => <span key={b.label} className="faint">{b.label}</span>)}
              </div>
            </div>
          )}
          {c.muscleClass && (
            <div className="card">
              <div className="spread"><h3 style={{ margin: 0 }}>Clasificación masa muscular</h3><Badge>{c.muscleClass.label}</Badge></div>
              <p className="muted" style={{ fontSize: '.82rem', margin: '.4rem 0 .8rem' }}>{c.muscleClass.description}</p>
              <Gauge position={c.muscleClass.position} color={c.muscleClass.color} />
            </div>
          )}
        </div>
      )}

      {c.alerts.length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(234,179,8,.4)' }}>
          <h3 style={{ color: 'var(--warn)' }}>⚠ {c.alerts.length} alerta(s) de datos</h3>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '.84rem' }} className="muted">
            {c.alerts.map((a, i) => <li key={i}>{a.message}</li>)}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button className={tab === 'frac' ? 'active' : ''} onClick={() => setTab('frac')}>Fraccionamiento (Kerr)</button>
        <button className={tab === 'soma' ? 'active' : ''} onClick={() => setTab('soma')}>Somatotipo</button>
        <button className={tab === 'fat' ? 'active' : ''} onClick={() => setTab('fat')}>Masa grasa</button>
        <button className={tab === 'muscle' ? 'active' : ''} onClick={() => setTab('muscle')}>Masa muscular</button>
        <button className={tab === 'idx' ? 'active' : ''} onClick={() => setTab('idx')}>Índices</button>
      </div>

      {tab === 'frac' && (
        k.applicable ? (
          <div className="grid cols-2">
            <div className="card">
              <h3>5 fracciones · Kerr (1988) <EquationButton label="Fraccionamiento 5 componentes" author="Kerr" year={1988} formula={'Z = (1/s)·[V·(170.18/talla)^d − P]\nMasa = [(Z̄·s)+P]·(talla/170.18)³\nPeso estructurado = Σ 5 masas\nFactor corrección = peso medido / peso estructurado'} note="Estratagema del Phantom (Ross & Wilson). Constantes tisulares: literatura de cineantropometría." /></h3>
              <Donut data={k.tissues.map((t) => ({ label: t.label, value: t.kg, color: TISSUE_COLORS[t.key] }))} />
            </div>
            <BodyMap fractions={k.tissues.map((t) => ({ key: t.key, label: t.label, kg: t.kg, pct: t.pctMeasured, color: TISSUE_COLORS[t.key] }))} />
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <table>
                <thead><tr><th>Tejido</th><th className="num">kg</th><th className="num">% peso medido</th><th className="num">% peso estructurado</th><th className="num">Z</th></tr></thead>
                <tbody>
                  {k.tissues.map((t) => (
                    <tr key={t.key}>
                      <td><span style={{ color: TISSUE_COLORS[t.key] }}>●</span> {t.label}</td>
                      <td className="num">{t.kg.toFixed(2)}</td>
                      <td className="num">{t.pctMeasured.toFixed(1)}%</td>
                      <td className="num">{t.pctStructured.toFixed(1)}%</td>
                      <td className="num faint">{Number.isNaN(t.z) ? '—' : t.z.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700 }}>
                    <td>Peso estructurado</td><td className="num">{k.structuredWeight.toFixed(2)}</td><td className="num" colSpan={3}>Peso medido {k.measuredWeight.toFixed(2)} kg</td>
                  </tr>
                </tfoot>
              </table>
              <div className="row" style={{ marginTop: '.8rem' }}>
                <Badge kind={Math.abs(k.adjustmentPct) < 5 ? 'good' : 'warn'}>Factor de corrección {k.correctionFactor.toFixed(3)}</Badge>
                <span className="muted" style={{ fontSize: '.82rem' }}>Residuo {k.residualKg.toFixed(2)} kg ({k.adjustmentPct.toFixed(1)}% de ajuste)</span>
              </div>
            </div>
          </div>
        ) : <div className="card"><Empty title="Datos insuficientes para el fraccionamiento" hint={`Faltan: ${k.missing.join(', ')}`} /></div>
      )}

      {tab === 'soma' && (
        <div className="grid cols-2">
          <SomatoChart title="Somatocarta" points={[{ x: c.somatotype.x, y: c.somatotype.y, color: 'var(--accent)', label: patient.name, size: 8, ring: true }]} />
          <div className="card">
            <h3>Componentes <EquationButton label="Somatotipo Heath-Carter" author="Heath & Carter" year={1967} formula={'Endo = −0.7182 + 0.1451·X − 0.00068·X² + 0.0000014·X³\n  X = Σ(tri+sub+supra)·(170.18/talla)\nMeso = 0.858·Húmero + 0.601·Fémur + 0.188·BrazoCorr + 0.161·PantCorr − 0.131·Talla + 4.5\nEcto: según HWR = Talla/Peso^(1/3)'} /></h3>
            <div className="grid cols-3" style={{ marginTop: '.5rem' }}>
              <KPI label="Endomorfia" value={c.somatotype.endo.toFixed(1)} accent="var(--warn)" />
              <KPI label="Mesomorfia" value={c.somatotype.meso.toFixed(1)} accent="var(--bad)" />
              <KPI label="Ectomorfia" value={c.somatotype.ecto.toFixed(1)} accent="var(--accent-2)" />
            </div>
            <hr />
            <div className="spread"><span className="muted">Categoría</span><Badge>{c.somatotype.categoryLabel}</Badge></div>
            <div className="spread" style={{ marginTop: '.4rem' }}><span className="muted">Coordenadas (X, Y)</span><strong>{c.somatotype.x.toFixed(2)}, {c.somatotype.y.toFixed(2)}</strong></div>
            {!c.somatotype.applicable && <p className="faint" style={{ fontSize: '.78rem', marginTop: '.6rem' }}>Faltan datos: {c.somatotype.missing.join(' · ')}</p>}
          </div>
        </div>
      )}

      {tab === 'fat' && <MethodTable title="Ecuaciones de masa grasa" methods={c.fatMethods} extra={(m) => fatMassRow(m.value, ev.anthro.weight)} />}
      {tab === 'muscle' && <MethodTable title="Ecuaciones de masa muscular" methods={c.muscleMethods} />}

      {tab === 'idx' && (
        <div className="card scroll-x">
          <h3>Índices antropométricos</h3>
          <table>
            <thead><tr><th>Índice</th><th className="num">Valor</th><th>Interpretación</th><th>Fórmula</th><th>Referencia</th></tr></thead>
            <tbody>
              {c.indices.map((i) => (
                <tr key={i.id}>
                  <td><strong>{i.label}</strong></td>
                  <td className="num">{i.value === null ? '—' : `${i.value} ${i.unit}`}</td>
                  <td>{badgeFor(i.level)} {i.interpretation}</td>
                  <td className="faint" style={{ fontSize: '.76rem' }}>{i.formula}</td>
                  <td className="faint" style={{ fontSize: '.76rem' }}>{i.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function fatMassRow(pct: number | null, weight?: number) {
  if (pct === null || !weight) return '—';
  return `${((weight * pct) / 100).toFixed(2)} kg grasa`;
}

function badgeFor(level: string) {
  if (level === 'high' || level === 'veryhigh') return <Badge kind="bad">●</Badge>;
  if (level === 'moderate') return <Badge kind="warn">●</Badge>;
  if (level === 'low' || level === 'normal') return <Badge kind="good">●</Badge>;
  return null;
}

function MethodTable({ title, methods, extra }: { title: string; methods: any[]; extra?: (m: any) => string }) {
  const applicable = methods.filter((m) => m.applicable);
  const max = Math.max(...applicable.map((m) => m.value), 1);
  return (
    <div className="stack">
      <div className="card scroll-x">
        <h3>{title} · comparativa entre métodos</h3>
        <table>
          <thead><tr><th>Método</th><th>Autor (año)</th><th className="num">Resultado</th>{extra && <th className="num">Masa</th>}<th>Población</th><th></th></tr></thead>
          <tbody>
            {methods.map((m) => (
              <tr key={m.id} style={{ opacity: m.applicable ? 1 : 0.5 }}>
                <td><strong>{m.label}</strong></td>
                <td className="muted">{m.author} ({m.year})</td>
                <td className="num">{m.value === null ? '—' : `${m.value} ${m.unit}`}</td>
                {extra && <td className="num faint">{extra(m)}</td>}
                <td className="faint" style={{ fontSize: '.78rem' }}>{m.population}{m.ageRange ? ` · ${m.ageRange}` : ''}</td>
                <td className="num"><EquationButton label={m.label} author={m.author} year={m.year} formula={m.formula} note={m.applicable ? m.note : `No aplicable. ${m.missing?.length ? 'Faltan: ' + m.missing.join(', ') : m.note ?? ''}`} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {applicable.length > 0 && (
        <div className="card">
          <h3>Comparación visual</h3>
          <Bars data={applicable.map((m) => ({ label: `${m.label}`, value: m.value, color: 'var(--accent)' }))} unit={applicable[0].unit} max={max} />
        </div>
      )}
    </div>
  );
}
