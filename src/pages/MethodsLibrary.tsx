import { useState } from 'react';
import { METHOD_LIBRARY, MethodDoc } from '../engine';
import { Badge } from '../components/ui';

const CATS: { v: MethodDoc['category'] | 'all'; l: string }[] = [
  { v: 'all', l: 'Todas' }, { v: 'fraccionamiento', l: 'Fraccionamiento' }, { v: 'somatotipo', l: 'Somatotipo' },
  { v: 'grasa', l: 'Masa grasa' }, { v: 'músculo', l: 'Masa muscular' }, { v: 'índice', l: 'Índices' }, { v: 'conversión', l: 'Conversión' },
];

export default function MethodsLibrary() {
  const [cat, setCat] = useState<MethodDoc['category'] | 'all'>('all');
  const items = METHOD_LIBRARY.filter((m) => cat === 'all' || m.category === cat);

  return (
    <div className="stack">
      <div className="card">
        <h3>Biblioteca de Métodos · transparencia metodológica</h3>
        <p className="muted" style={{ fontSize: '.85rem' }}>
          Todas las ecuaciones del motor con su autor, año, población de validación y fórmula exacta.
          Las marcadas como <Badge kind="good">implementada</Badge> calculan en la aplicación; las
          <Badge>referenciada</Badge> se documentan para trazabilidad (coeficientes a verificar con fuente primaria).
        </p>
        <div className="tabs" style={{ marginTop: '.6rem' }}>
          {CATS.map((c) => <button key={c.v} className={cat === c.v ? 'active' : ''} onClick={() => setCat(c.v as any)}>{c.l}</button>)}
        </div>
      </div>

      <div className="grid cols-2">
        {items.map((m) => (
          <div className="card" key={m.id}>
            <div className="spread">
              <h3 style={{ margin: 0 }}>{m.name}</h3>
              <Badge kind={m.implemented ? 'good' : undefined}>{m.implemented ? 'implementada' : 'referenciada'}</Badge>
            </div>
            <div className="muted" style={{ fontSize: '.82rem', marginBottom: '.5rem' }}>{m.author} ({m.year}) · {m.population}</div>
            <code className="formula" style={{ display: 'block', padding: '.6rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{m.formula}</code>
            {m.notes && <p className="faint" style={{ fontSize: '.78rem', marginTop: '.5rem' }}>{m.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
