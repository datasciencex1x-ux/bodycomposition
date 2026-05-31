import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { computeFor, contextFor, fmt } from '../lib/compute';
import { Empty } from '../components/ui';
import { Donut } from '../components/charts';
import SomatoChart from '../components/SomatoChart';

const TC: Record<string, string> = { skin: '#a78bfa', adipose: '#eab308', muscle: '#ef4444', bone: '#e2e8f0', residual: '#22d3ee' };

export default function Reports() {
  const { id } = useParams();
  const { patients, evaluations, settings } = useStore();
  const list = evaluations.map((e) => ({ e, p: patients.find((x) => x.id === e.patientId) })).filter((x) => x.p);
  const [selId, setSelId] = useState(id ?? list[0]?.e.id ?? '');
  const sel = list.find((x) => x.e.id === selId);

  if (!sel) return <div className="card"><Empty title="Sin evaluaciones para reportar" /></div>;
  const { e, p } = sel as { e: typeof evaluations[0]; p: NonNullable<typeof sel.p> };
  const c = computeFor(p, e, settings);
  const ctx = contextFor(p, e);

  function exportCSV() {
    const lines: string[] = [];
    lines.push('Body Composition - Data Science Analytics');
    lines.push(`Paciente,${p.name}`); lines.push(`Fecha,${e.date.slice(0, 10)}`); lines.push(`Edad,${ctx.ageYears}`); lines.push('');
    lines.push('FRACCIONAMIENTO KERR (kg,%)');
    c.kerr.tissues.forEach((t) => lines.push(`${t.label},${t.kg.toFixed(2)},${t.pctMeasured.toFixed(1)}`));
    lines.push(`Peso estructurado,${c.kerr.structuredWeight.toFixed(2)}`); lines.push('');
    lines.push('SOMATOTIPO'); lines.push(`Endo,${c.somatotype.endo.toFixed(1)}`); lines.push(`Meso,${c.somatotype.meso.toFixed(1)}`); lines.push(`Ecto,${c.somatotype.ecto.toFixed(1)}`); lines.push('');
    lines.push('MASA GRASA (metodo,%)'); c.fatMethods.filter((m) => m.applicable).forEach((m) => lines.push(`${m.label},${m.value}`)); lines.push('');
    lines.push('MASA MUSCULAR (metodo,kg)'); c.muscleMethods.filter((m) => m.applicable).forEach((m) => lines.push(`${m.label},${m.value}`)); lines.push('');
    lines.push('INDICES'); c.indices.forEach((i) => lines.push(`${i.label},${i.value ?? ''},${i.unit}`));
    download(lines.join('\n'), `reporte_${p.name.replace(/\s+/g, '_')}.csv`, 'text/csv');
  }

  function exportXLS() {
    const rows = (arr: (string | number)[][]) => arr.map((r) => '<tr>' + r.map((c2) => `<td>${c2}</td>`).join('') + '</tr>').join('');
    const html = `<html><head><meta charset="utf-8"></head><body><h2>Body Composition · ${p.name}</h2><table border="1">${rows([
      ['Fecha', e.date.slice(0, 10)], ['Edad', ctx.ageYears], ['% Grasa ref.', c.referenceFatPct ?? ''],
      ['Masa muscular (Kerr)', c.referenceMuscleKg ?? ''], ['Somatotipo', `${c.somatotype.endo.toFixed(1)}-${c.somatotype.meso.toFixed(1)}-${c.somatotype.ecto.toFixed(1)}`],
      ['Peso estructurado', c.kerr.structuredWeight.toFixed(2)],
    ])}</table></body></html>`;
    download(html, `reporte_${p.name.replace(/\s+/g, '_')}.xls`, 'application/vnd.ms-excel');
  }

  return (
    <div className="stack">
      <div className="card no-print">
        <div className="spread">
          <div className="row">
            <label style={{ margin: 0 }}>Evaluación:</label>
            <select value={selId} onChange={(ev) => setSelId(ev.target.value)} style={{ width: 360 }}>
              {list.map((x) => <option key={x.e.id} value={x.e.id}>{x.p!.name} · {x.e.date.slice(0, 10)}</option>)}
            </select>
          </div>
          <div className="row">
            <button onClick={exportCSV}>⤓ CSV</button>
            <button onClick={exportXLS}>⤓ Excel</button>
            <button className="primary" onClick={() => window.print()}>⎙ Imprimir / PDF</button>
          </div>
        </div>
      </div>

      {/* Documento de reporte */}
      <div className="card" id="report">
        <div className="spread" style={{ borderBottom: '2px solid var(--accent)', paddingBottom: '.8rem' }}>
          <div className="row" style={{ gap: '.7rem' }}>
            <div className="logo" style={{ width: 42, height: 42 }}>B</div>
            <div>
              <h2 style={{ margin: 0 }}>Body Composition</h2>
              <div className="faint" style={{ fontSize: '.72rem', letterSpacing: '.08em' }}>INFORME DE COMPOSICIÓN CORPORAL · DATA SCIENCE ANALYTICS</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '.8rem' }} className="muted">
            <div>Fecha: {e.date.slice(0, 10)}</div>
            <div>Evaluador: {e.evaluator || '—'}</div>
            <div>Protocolo: ISAK · {e.protocol === 'adult' ? 'Adulto' : 'Pediátrico'}</div>
          </div>
        </div>

        <div className="grid cols-3" style={{ marginTop: '1rem' }}>
          <div><label>Paciente</label><strong>{p.name}</strong></div>
          <div><label>ID</label>{p.docId || '—'}</div>
          <div><label>Edad decimal</label>{ctx.ageYears} años</div>
          <div><label>Sexo</label>{p.sex === 'M' ? 'Masculino' : 'Femenino'}</div>
          <div><label>Deporte</label>{p.sport || '—'} {p.level && `(${p.level})`}</div>
          <div><label>Etnia</label>{p.ethnicity}</div>
        </div>

        <hr />
        <h3>1 · Fraccionamiento (Kerr, 1988)</h3>
        {c.kerr.applicable ? (
          <div className="grid cols-2">
            <Donut data={c.kerr.tissues.map((t) => ({ label: t.label, value: t.kg, color: TC[t.key] }))} />
            <table>
              <thead><tr><th>Tejido</th><th className="num">kg</th><th className="num">%</th></tr></thead>
              <tbody>
                {c.kerr.tissues.map((t) => <tr key={t.key}><td>{t.label}</td><td className="num">{t.kg.toFixed(2)}</td><td className="num">{t.pctMeasured.toFixed(1)}%</td></tr>)}
                <tr style={{ fontWeight: 700 }}><td>Estructurado</td><td className="num">{c.kerr.structuredWeight.toFixed(2)}</td><td className="num">FC {c.kerr.correctionFactor.toFixed(3)}</td></tr>
              </tbody>
            </table>
          </div>
        ) : <p className="muted">Datos insuficientes.</p>}

        <hr />
        <h3>2 · Somatotipo (Heath-Carter)</h3>
        <div className="grid cols-2">
          <SomatoChart points={[{ x: c.somatotype.x, y: c.somatotype.y, color: 'var(--accent)', label: p.name, size: 8, ring: true }]} />
          <div>
            <p><strong>{c.somatotype.endo.toFixed(1)} – {c.somatotype.meso.toFixed(1)} – {c.somatotype.ecto.toFixed(1)}</strong> · {c.somatotype.categoryLabel}</p>
            <p className="muted">% grasa de referencia: <strong>{fmt(c.referenceFatPct, 1, '%')}</strong> ({c.referenceFatMethod?.label})</p>
            <p className="muted">Clasificación grasa: {c.fatClass?.label ?? '—'} · Masa muscular: {c.muscleClass?.label ?? '—'}</p>
          </div>
        </div>

        <hr />
        <h3>3 · Ecuaciones aplicadas</h3>
        <div className="grid cols-2">
          <div>
            <strong>Masa grasa (%)</strong>
            <table><tbody>{c.fatMethods.filter((m) => m.applicable).map((m) => <tr key={m.id}><td>{m.label} ({m.year})</td><td className="num">{m.value}%</td></tr>)}</tbody></table>
          </div>
          <div>
            <strong>Masa muscular (kg)</strong>
            <table><tbody>{c.muscleMethods.filter((m) => m.applicable).map((m) => <tr key={m.id}><td>{m.label} ({m.year})</td><td className="num">{m.value} kg</td></tr>)}</tbody></table>
          </div>
        </div>

        <hr />
        <h3>4 · Índices antropométricos</h3>
        <table>
          <thead><tr><th>Índice</th><th className="num">Valor</th><th>Interpretación</th></tr></thead>
          <tbody>{c.indices.map((i) => <tr key={i.id}><td>{i.label}</td><td className="num">{i.value === null ? '—' : `${i.value} ${i.unit}`}</td><td className="muted">{i.interpretation}</td></tr>)}</tbody>
        </table>

        <div className="footer" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <span>Generado por Body Composition · {new Date().toLocaleDateString()}</span>
          <span>by Data Science Analytics</span>
        </div>
      </div>
    </div>
  );
}

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
