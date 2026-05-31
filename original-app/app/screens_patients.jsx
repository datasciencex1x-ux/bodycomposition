/* screens_patients.jsx — squad list + patient detail/history + new-patient flow. */
const { useState: useStateP } = React;

function PatientDetail({ p, ctx, onBack }) {
  const { t, lang, goPatient, groupName } = ctx;
  const E = window.BC_ENGINE, ST = window.BC_STORE;
  const evs = [...p.evals].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="fade-in">
      <button className="btn ghost" onClick={onBack} style={{ marginBottom: 16 }}><Icon n="chevron" s={14} style={{transform:"rotate(180deg)"}} /> {t("patients")}</button>
      <div className="grid" style={{ gridTemplateColumns: "320px 1fr", alignItems: "start" }}>
        <div className="card card-pad">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <Avatar name={p.name} sex={p.sex} />
            <div><div style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:18 }}>{p.name}</div>
            <div className="mono" style={{ fontSize:11, color:"var(--text-faint)" }}>{p.id}</div></div>
          </div>
          <div className="divider" />
          <div className="kv"><span className="key">{t("sex")}</span><span className="val">{t(p.sex)}</span></div>
          <div className="kv"><span className="key">{t("age")}</span><span className="val">{E.ageDecimal(p.dob, ST.latestEval(p).date).toFixed(2)} {t("years")}</span></div>
          <div className="kv"><span className="key">{lang==="es"?"Nacimiento":"DOB"}</span><span className="val">{p.dob}</span></div>
          <div className="kv"><span className="key">{t("sport")}</span><span className="val">{p.sport}</span></div>
          <div className="kv"><span className="key">{t("level")}</span><span className="val" style={{fontSize:11}}>{p.level}</span></div>
          <div className="divider" />
          <div className="eyebrow" style={{ marginBottom: 8 }}>{t("group_label")}</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {p.groups.length ? p.groups.map(g => <span key={g} className="chip">{groupName(g)}</span>) : <span style={{fontSize:12,color:"var(--text-faint)"}}>—</span>}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div><h3>{t("history")}</h3><div className="sub">{p.evals.length} {t("evals_count")} · {lang==="es"?"protocolo ISAK":"ISAK protocol"}</div></div>
            <div className="right"><button className="btn" onClick={()=>goPatient(p.id, ST.latestEval(p).id, "eval")}><Icon n="eval" s={15} /> {lang==="es"?"Nueva medición":"New measurement"}</button></div></div>
          <div className="card-pad">
            <table className="data">
              <thead><tr>
                <th>{lang==="es"?"Fecha":"Date"}</th><th>{lang==="es"?"Fase":"Phase"}</th>
                <th className="n">{lang==="es"?"Peso":"Weight"}</th><th className="n">% {lang==="es"?"graso":"fat"}</th>
                <th className="n">{lang==="es"?"Músculo":"Muscle"}</th><th>{lang==="es"?"Somatotipo":"Somatotype"}</th><th></th>
              </tr></thead>
              <tbody>
                {evs.map(e => {
                  const age = E.ageDecimal(p.dob, e.date);
                  const fr = E.fractionation(e.m);
                  const soma = E.somatotype(e.m, p.sex);
                  const bf = E.bodyFat(e.m, p.sex, age);
                  const rec = bf.rec;
                  return (
                    <tr key={e.id} className="row-hover">
                      <td className="mono" style={{fontSize:12}}>{e.date}</td>
                      <td>{lang==="es"?e.phase_es:e.phase_en}</td>
                      <td className="n">{e.m.weight.toFixed(1)}</td>
                      <td className="n" style={{color:"var(--accent)"}}>{rec.pct.toFixed(1)}</td>
                      <td className="n">{fr.tissues.muscle.kg.toFixed(1)}</td>
                      <td className="mono" style={{fontSize:12}}>{soma.endo.toFixed(1)}–{soma.meso.toFixed(1)}–{soma.ecto.toFixed(1)}</td>
                      <td><button className="eq-btn" onClick={() => goPatient(p.id, e.id, "results")}>{t("open_results")}</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewPatientModal({ ctx, onClose }) {
  const { lang, groups, addGroup, addPatient, setRoute } = ctx;
  const D = window.BC_DATA;
  const [name, setName] = useStateP("");
  const [sex, setSex] = useStateP("male");
  const [dob, setDob] = useStateP("2002-01-01");
  const [sportKey, setSportKey] = useStateP("football");
  const [customSport, setCustomSport] = useStateP("");
  const [level, setLevel] = useStateP("");
  const [picked, setPicked] = useStateP([]);
  const [newGroup, setNewGroup] = useStateP("");
  const sportList = D.SPORT_OPTIONS;

  const toggleG = id => setPicked(ps => ps.includes(id) ? ps.filter(x=>x!==id) : [...ps, id]);
  const createGroup = () => { const nm = newGroup.trim(); if (!nm) return; const id = addGroup(nm); setPicked(ps=>[...ps,id]); setNewGroup(""); };
  const save = () => {
    let sport, key;
    if (sportKey === "other") { sport = customSport.trim() || (lang==="es"?"Otro":"Other"); key = "other"; }
    else { const sp = sportList.find(s => s.key === sportKey) || sportList[0]; sport = lang==="es"?sp.es:sp.en; key = sp.key; }
    addPatient({ name: name.trim() || (lang==="es"?"Nuevo paciente":"New patient"), sex, dob,
      sport, sportKey: key, level, groups: picked });
    onClose(); setRoute("eval");
  };

  return (
    <div className="modal-overlay" onMouseDown={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div className="modal-card" style={{ width: 520 }}>
        <div className="card-head">
          <div><h3>{lang==="es"?"Nuevo paciente":"New patient"}</h3><div className="sub">{lang==="es"?"Crea la ficha y asígnala a una o varias cohortes":"Create the profile and assign cohorts"}</div></div>
          <button className="icon-btn right" onClick={onClose}><Icon n="close" s={16} /></button>
        </div>
        <div className="card-pad" style={{ display:"flex", flexDirection:"column", gap:16, maxHeight:"70vh", overflowY:"auto" }}>
          <div className="field">
            <label>{lang==="es"?"Nombre completo":"Full name"}</label>
            <div className="input-wrap"><input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder={lang==="es"?"p. ej. M. Arancibia":"e.g. M. Arancibia"} style={{ fontFamily:"var(--font-body)", paddingRight:11 }} /></div>
          </div>
          <div className="grid" style={{ gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div className="field">
              <label>{lang==="es"?"Sexo":"Sex"}</label>
              <div className="seg" style={{ width:"fit-content" }}>
                <button className={sex==="male"?"on":""} onClick={()=>setSex("male")}>{lang==="es"?"Masc.":"Male"}</button>
                <button className={sex==="female"?"on":""} onClick={()=>setSex("female")}>{lang==="es"?"Fem.":"Female"}</button>
              </div>
            </div>
            <div className="field">
              <label>{lang==="es"?"Fecha de nacimiento":"Date of birth"}</label>
              <div className="input-wrap"><input type="date" value={dob} onChange={e=>setDob(e.target.value)} style={{ fontFamily:"var(--font-mono)", paddingRight:11 }} /></div>
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div className="field">
              <label>{lang==="es"?"Deporte":"Sport"}</label>
              <select className="sel-input" value={sportKey} onChange={e=>setSportKey(e.target.value)}>
                {sportList.map(s => <option key={s.key} value={s.key}>{lang==="es"?s.es:s.en}</option>)}
              </select>
              {sportKey==="other" && <input type="text" value={customSport} onChange={e=>setCustomSport(e.target.value)} placeholder={lang==="es"?"Escribe el deporte…":"Type the sport…"} style={{ marginTop:8, width:"100%", background:"var(--surface-2)", border:"1px solid var(--line)", borderRadius:9, padding:"9px 11px", color:"var(--text)", fontFamily:"var(--font-body)", fontSize:14 }} />}
            </div>
            <div className="field">
              <label>{lang==="es"?"Nivel":"Level"}</label>
              <div className="input-wrap"><input type="text" value={level} onChange={e=>setLevel(e.target.value)} placeholder={lang==="es"?"Élite · Primera":"Elite · First"} style={{ fontFamily:"var(--font-body)", paddingRight:11 }} /></div>
            </div>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom:9 }}>{lang==="es"?"Cohortes / grupos":"Cohorts / groups"}</div>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:10 }}>
              {groups.map(g => (
                <button key={g.id} className={"pill"+(picked.includes(g.id)?" on":"")} onClick={()=>toggleG(g.id)}>{lang==="es"?g.es:g.en}</button>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <div className="input-wrap" style={{ flex:1 }}>
                <input type="text" value={newGroup} onChange={e=>setNewGroup(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") createGroup(); }}
                  placeholder={lang==="es"?"Crear grupo nuevo (natación, fútbol…)":"Create new group (swimming, football…)"} style={{ fontFamily:"var(--font-body)", paddingRight:11 }} />
              </div>
              <button className="btn" onClick={createGroup}><Icon n="plus" s={15} /> {lang==="es"?"Crear":"Add"}</button>
            </div>
          </div>
        </div>
        <div className="card-head" style={{ borderBottom:0, borderTop:"1px solid var(--line)", justifyContent:"flex-end", gap:10 }}>
          <button className="btn ghost" onClick={onClose}>{lang==="es"?"Cancelar":"Cancel"}</button>
          <button className="btn primary" onClick={save}><Icon n="check" s={15} /> {lang==="es"?"Crear y medir":"Create & measure"}</button>
        </div>
      </div>
    </div>
  );
}

function PatientsScreen({ ctx }) {
  const { t, lang, patients, groups, groupName } = ctx;
  const ST = window.BC_STORE, E = window.BC_ENGINE;
  const [q, setQ] = useStateP("");
  const [sport, setSport] = useStateP("");
  const [group, setGroup] = useStateP("");
  const [detail, setDetail] = useStateP(null);
  const [adding, setAdding] = useStateP(false);

  if (detail) {
    const p = ST.patientById(patients, detail);
    if (p) return <PatientDetail p={p} ctx={ctx} onBack={() => setDetail(null)} />;
  }

  const sports = [...new Set(patients.map(p => p.sport))];
  const filtered = patients.filter(p =>
    (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase())) &&
    (!sport || p.sport === sport) &&
    (!group || p.groups.includes(group)));

  return (
    <div className="fade-in">
      {adding && <NewPatientModal ctx={ctx} onClose={()=>setAdding(false)} />}
      <div className="page-head" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div className="eyebrow">{patients.length} {lang==="es"?"pacientes en el plantel":"patients in squad"} · {groups.length} {lang==="es"?"cohortes":"cohorts"}</div>
          <div className="page-title">{t("patients")}</div>
          <div className="page-desc">{t("pat_desc")}</div>
        </div>
        <button className="btn primary" onClick={()=>setAdding(true)}><Icon n="plus" s={16} /> {lang==="es"?"Nuevo paciente":"New patient"}</button>
      </div>

      <div className="filters">
        <div className="search-box"><Icon n="patients" s={16} className="nav-ico" /><input value={q} onChange={e=>setQ(e.target.value)} placeholder={t("search")} /></div>
        <select className="sel-input" value={sport} onChange={e=>setSport(e.target.value)}>
          <option value="">{t("all_sports")}</option>
          {sports.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="sel-input" value={group} onChange={e=>setGroup(e.target.value)}>
          <option value="">{t("all_groups")}</option>
          {groups.map(g => <option key={g.id} value={g.id}>{lang==="es"?g.es:g.en}</option>)}
        </select>
      </div>

      <div className="grid cols-3">
        {filtered.map(p => {
          const e = ST.latestEval(p);
          const age = E.ageDecimal(p.dob, e.date);
          const fr = E.fractionation(e.m);
          const soma = E.somatotype(e.m, p.sex);
          const bf = E.bodyFat(e.m, p.sex, age);
          const rec = bf.rec;
          return (
            <div key={p.id} className="card card-pad pat-card" onClick={() => setDetail(p.id)}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <Avatar name={p.name} sex={p.sex} />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:15 }}>{p.name}</div>
                  <div className="mono" style={{ fontSize:10.5, color:"var(--text-faint)" }}>{p.sport} · {age.toFixed(1)} {t("years")}</div>
                </div>
                <Icon n="chevron" s={16} style={{ color:"var(--text-faint)" }} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:12 }}>
                <div><div className="mono" style={{fontSize:18}}>{rec.pct.toFixed(1)}<span style={{fontSize:10,color:"var(--text-faint)"}}>%</span></div><div style={{fontSize:9.5,color:"var(--text-faint)"}}>{lang==="es"?"GRASA":"FAT"}</div></div>
                <div><div className="mono" style={{fontSize:18}}>{fr.tissues.muscle.kg.toFixed(0)}<span style={{fontSize:10,color:"var(--text-faint)"}}> kg</span></div><div style={{fontSize:9.5,color:"var(--text-faint)"}}>{lang==="es"?"MÚSCULO":"MUSCLE"}</div></div>
                <div><div className="mono" style={{fontSize:18}}>{e.m.weight.toFixed(0)}<span style={{fontSize:10,color:"var(--text-faint)"}}> kg</span></div><div style={{fontSize:9.5,color:"var(--text-faint)"}}>{lang==="es"?"PESO":"WEIGHT"}</div></div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span className="mono" style={{ fontSize:11, color:"var(--text-dim)" }}>{soma.endo.toFixed(1)}–{soma.meso.toFixed(1)}–{soma.ecto.toFixed(1)}</span>
                <div style={{ display:"flex", gap:5 }}>
                  {p.groups.slice(0,2).map(g => <span key={g} className="chip" style={{ fontSize:9.5, padding:"2px 7px" }}>{groupName(g)}</span>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.PatientsScreen = PatientsScreen;
