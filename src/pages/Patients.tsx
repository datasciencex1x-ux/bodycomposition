import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Patient } from '../store/types';
import { Modal, Empty, Badge } from '../components/ui';
import { decimalAgeRounded, Ethnicity } from '../engine';

const ETHN: { v: Ethnicity; l: string }[] = [
  { v: 'caucasian', l: 'Caucásica' }, { v: 'african', l: 'Africana' },
  { v: 'asian', l: 'Asiática' }, { v: 'hispanic', l: 'Hispana' }, { v: 'other', l: 'Otra' },
];

const empty: Omit<Patient, 'id' | 'createdAt'> = {
  name: '', docId: '', birthDate: '2000-01-01', sex: 'M', ethnicity: 'caucasian',
  sport: '', level: '', tags: [], notes: '',
};

export default function Patients() {
  const { patients, evaluations, groups, addPatient, updatePatient, deletePatient, addGroup, updateGroup, deleteGroup } = useStore();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<(Omit<Patient, 'id' | 'createdAt'> & { id?: string }) | null>(null);
  const [showGroups, setShowGroups] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const filtered = patients.filter(
    (p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.docId.includes(q) || (p.sport ?? '').toLowerCase().includes(q.toLowerCase()),
  );

  function save() {
    if (!editing || !editing.name.trim()) return;
    const { id, ...data } = editing;
    if (id) updatePatient(id, data);
    else addPatient(data);
    setEditing(null);
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="spread">
          <div className="row" style={{ flex: 1 }}>
            <input placeholder="Buscar por nombre, ID o deporte…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 360 }} />
          </div>
          <div className="row">
            <button onClick={() => setShowGroups(true)}>Grupos / Cohortes ({groups.length})</button>
            <button className="primary" onClick={() => setEditing({ ...empty })}>＋ Nuevo paciente</button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><Empty title="Sin pacientes" hint="Cree el primer paciente para comenzar." /></div>
      ) : (
        <div className="card scroll-x">
          <table>
            <thead>
              <tr><th>Nombre</th><th>ID</th><th className="num">Edad</th><th>Sexo</th><th>Deporte</th><th className="num">Evals</th><th>Etiquetas</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const n = evaluations.filter((e) => e.patientId === p.id).length;
                return (
                  <tr key={p.id}>
                    <td><Link to={`/patients/${p.id}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>{p.name}</Link></td>
                    <td className="muted">{p.docId || '—'}</td>
                    <td className="num">{decimalAgeRounded(p.birthDate, new Date().toISOString())}</td>
                    <td>{p.sex === 'M' ? '♂' : '♀'}</td>
                    <td className="muted">{p.sport || '—'} {p.level && <span className="chip">{p.level}</span>}</td>
                    <td className="num">{n}</td>
                    <td>{p.tags.map((t) => <span key={t} className="chip" style={{ marginRight: 4 }}>{t}</span>)}</td>
                    <td className="num">
                      <div className="row" style={{ justifyContent: 'flex-end' }}>
                        <Link to={`/new/${p.id}`}><button className="ghost" title="Nueva evaluación">＋</button></Link>
                        <button className="ghost" onClick={() => setEditing({ ...p })}>✎</button>
                        <button className="ghost danger" onClick={() => confirm(`¿Eliminar a ${p.name} y sus evaluaciones?`) && deletePatient(p.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? 'Editar paciente' : 'Nuevo paciente'} onClose={() => setEditing(null)} wide>
          <div className="fields">
            <div style={{ gridColumn: 'span 2' }}>
              <label>Nombre completo *</label>
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div><label>RUT / ID</label><input value={editing.docId} onChange={(e) => setEditing({ ...editing, docId: e.target.value })} /></div>
            <div><label>Fecha de nacimiento</label><input type="date" value={editing.birthDate.slice(0, 10)} onChange={(e) => setEditing({ ...editing, birthDate: e.target.value })} /></div>
            <div>
              <label>Sexo</label>
              <select value={editing.sex} onChange={(e) => setEditing({ ...editing, sex: e.target.value as any })}>
                <option value="M">Masculino</option><option value="F">Femenino</option>
              </select>
            </div>
            <div>
              <label>Etnia</label>
              <select value={editing.ethnicity} onChange={(e) => setEditing({ ...editing, ethnicity: e.target.value as any })}>
                {ETHN.map((e) => <option key={e.v} value={e.v}>{e.l}</option>)}
              </select>
            </div>
            <div><label>Deporte / disciplina</label><input value={editing.sport} onChange={(e) => setEditing({ ...editing, sport: e.target.value })} /></div>
            <div><label>Nivel competitivo</label><input value={editing.level} onChange={(e) => setEditing({ ...editing, level: e.target.value })} /></div>
          </div>
          <div style={{ marginTop: '.8rem' }}>
            <label>Etiquetas / grupos</label>
            <div className="row">
              {editing.tags.map((t) => (
                <span key={t} className="chip">{t} <a onClick={() => setEditing({ ...editing, tags: editing.tags.filter((x) => x !== t) })} style={{ cursor: 'pointer' }}>✕</a></span>
              ))}
              <input style={{ width: 180 }} placeholder="Añadir etiqueta + Enter" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && tagInput.trim()) { setEditing({ ...editing, tags: [...new Set([...editing.tags, tagInput.trim()])] }); setTagInput(''); } }} />
            </div>
          </div>
          <div style={{ marginTop: '.8rem' }}>
            <label>Notas</label>
            <textarea rows={2} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="ghost" onClick={() => setEditing(null)}>Cancelar</button>
            <button className="primary" onClick={save} disabled={!editing.name.trim()}>Guardar</button>
          </div>
        </Modal>
      )}

      {showGroups && (
        <Modal title="Grupos / Cohortes" onClose={() => setShowGroups(false)} wide>
          <GroupManager />
        </Modal>
      )}
    </div>
  );
}

function GroupManager() {
  const { groups, patients, addGroup, updateGroup, deleteGroup } = useStore();
  const [name, setName] = useState('');
  return (
    <div className="stack">
      <div className="row">
        <input placeholder="Nombre del grupo (ej. Selección Sub-17)" value={name} onChange={(e) => setName(e.target.value)} style={{ maxWidth: 320 }} />
        <button className="primary" onClick={() => { if (name.trim()) { addGroup(name.trim()); setName(''); } }}>＋ Crear</button>
      </div>
      {groups.length === 0 && <p className="muted">Sin grupos. Cree cohortes para comparaciones entre grupos.</p>}
      {groups.map((g) => (
        <div key={g.id} className="card">
          <div className="spread">
            <strong>{g.name}</strong>
            <button className="ghost danger" onClick={() => deleteGroup(g.id)}>Eliminar</button>
          </div>
          <div className="row" style={{ marginTop: '.6rem' }}>
            {patients.map((p) => {
              const inG = g.patientIds.includes(p.id);
              return (
                <button key={p.id} className={inG ? '' : 'ghost'}
                  onClick={() => updateGroup(g.id, { patientIds: inG ? g.patientIds.filter((x) => x !== p.id) : [...g.patientIds, p.id] })}>
                  {inG ? '✓ ' : ''}{p.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
