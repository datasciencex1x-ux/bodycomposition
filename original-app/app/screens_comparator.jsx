/* screens_comparator.jsx — longitudinal + between-group comparison.  window.ComparatorScreen */
const { useState: useStateC } = React;

function mean(a) { return a.reduce((x, y) => x + y, 0) / a.length; }
function sd(a) { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) ** 2))); }

function evalMetrics(p, e) {
  const E = window.BC_ENGINE;
  const age = E.ageDecimal(p.dob, e.date);
  const fr = E.fractionation(e.m);
  const soma = E.somatotype(e.m, p.sex);
  const bf = E.bodyFat(e.m, p.sex, age);
  const rec = bf.rec;
  return { weight: e.m.weight, fat: rec.pct, muscle: fr.tissues.muscle.kg, adipose: fr.tissues.adipose.kg,
    bone: fr.tissues.bone.kg, soma, somaArr: [soma.endo, soma.meso, soma.ecto] };
}

function Delta({ from, to, unit, better = "down", dec = 1 }) {
  const d = to - from;
  const improved = better === "down" ? d < 0 : d > 0;
  const cls = Math.abs(d) < 0.05 ? "delta-flat" : improved ? "delta-up" : "delta-down";
  const arrow = Math.abs(d) < 0.05 ? "→" : d < 0 ? "▼" : "▲";
  return <span className={"num " + cls} style={{ fontSize: 13 }}>{arrow} {d > 0 ? "+" : ""}{d.toFixed(dec)}{unit}</span>;
}

function IntraView({ ctx }) {
  const { t, lang, patients } = ctx;
  const multi = patients.filter(p => p.evals.length >= 2);
  const [pid, setPid] = useStateC(multi[0] ? multi[0].id : patients[0].id);
  const p = window.BC_STORE.patientById(patients, pid);
  const evs = [...p.evals].sort((a, b) => a.date.localeCompare(b.date));
  const metrics = evs.map(e => evalMetrics(p, e));
  const labels = evs.map(e => e.date.slice(5));
  const first = metrics[0], last = metrics[metrics.length - 1];

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="filters" style={{ marginBottom: 0 }}>
        <select className="sel-input" value={pid} onChange={e => setPid(e.target.value)}>
          {patients.map(pp => <option key={pp.id} value={pp.id} disabled={pp.evals.length < 2}>{pp.name} · {pp.sport} ({pp.evals.length})</option>)}
        </select>
        <span className="chip">{evs.length} {t("evals_count")} · {evs[0].date} → {evs[evs.length-1].date}</span>
      </div>

      <div className="grid cols-3">
        <div className="card">
          <div className="card-head"><div><h3>{lang==="es"?"Peso & masa grasa":"Weight & fat"}</h3></div></div>
          <div className="card-pad">
            <LineChart labels={labels} yfmt={v=>v.toFixed(0)} series={[
              { name:"Peso", color:"var(--text-dim)", data: metrics.map(m=>m.weight) },
              { name:"Grasa%", color:"var(--accent)", data: metrics.map(m=>m.fat) },
            ]} />
            <div style={{ display:"flex", gap:14, fontSize:11, marginTop:8, color:"var(--text-dim)" }}>
              <span><span style={{color:"var(--text-dim)"}}>━</span> {lang==="es"?"Peso (kg)":"Weight (kg)"}</span>
              <span><span style={{color:"var(--accent)"}}>━</span> {lang==="es"?"Grasa (%)":"Fat (%)"}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><div><h3>{lang==="es"?"Masa muscular & ósea":"Muscle & bone"}</h3></div></div>
          <div className="card-pad">
            <LineChart labels={labels} yfmt={v=>v.toFixed(0)} series={[
              { name:"Músculo", color:"var(--fr-muscle)", data: metrics.map(m=>m.muscle) },
              { name:"Adiposa", color:"var(--fr-adipose)", data: metrics.map(m=>m.adipose) },
            ]} />
            <div style={{ display:"flex", gap:14, fontSize:11, marginTop:8, color:"var(--text-dim)" }}>
              <span><span style={{color:"var(--fr-muscle)"}}>━</span> {lang==="es"?"Muscular (kg)":"Muscle (kg)"}</span>
              <span><span style={{color:"var(--fr-adipose)"}}>━</span> {lang==="es"?"Adiposa (kg)":"Adipose (kg)"}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><div><h3>{t("displacement")}</h3><div className="sub">{evs[0].date} → {evs[evs.length-1].date}</div></div></div>
          <div className="card-pad" style={{ display:"flex", justifyContent:"center" }}>
            <SomatoChart soma={last.soma} overlay={{ label: evs[0].date, s: first.somaArr }} lang={lang} size={260} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div><h3>{lang==="es"?"Tabla de deltas":"Delta table"}</h3><div className="sub">{evs[0].date} vs {evs[evs.length-1].date}</div></div></div>
        <div className="card-pad">
          <table className="data">
            <thead><tr><th>{lang==="es"?"Variable":"Variable"}</th><th className="n">{evs[0].date}</th><th className="n">{evs[evs.length-1].date}</th><th className="n">{t("delta")}</th><th>{t("trend")}</th></tr></thead>
            <tbody>
              {[
                ["Peso / Weight","weight"," kg","down"],
                ["% Grasa / Fat","fat"," %","down"],
                ["Masa muscular / Muscle","muscle"," kg","up"],
                ["Masa adiposa / Adipose","adipose"," kg","down"],
                ["Masa ósea / Bone","bone"," kg","up"],
              ].map(([lbl,k,u,better]) => (
                <tr key={k} className="row-hover">
                  <td>{lang==="es"?lbl.split("/")[0].trim():lbl.split("/")[1].trim()}</td>
                  <td className="n">{first[k].toFixed(1)}</td>
                  <td className="n">{last[k].toFixed(1)}</td>
                  <td className="n"><Delta from={first[k]} to={last[k]} unit={u} better={better} /></td>
                  <td><Badge tone={(better==="down"? last[k]<first[k] : last[k]>first[k])?"good":"warn"} dot={false}>{(better==="down"? last[k]<first[k] : last[k]>first[k])?t("improve"):t("worsen")}</Badge></td>
                </tr>
              ))}
              <tr className="row-hover">
                <td>{lang==="es"?"Somatotipo":"Somatotype"}</td>
                <td className="n mono" style={{fontSize:11}}>{first.somaArr.map(v=>v.toFixed(1)).join("–")}</td>
                <td className="n mono" style={{fontSize:11}}>{last.somaArr.map(v=>v.toFixed(1)).join("–")}</td>
                <td className="n">{window.BC_ENGINE.sad(first.somaArr,last.somaArr).toFixed(2)}</td>
                <td><span className="mono" style={{fontSize:11,color:"var(--text-faint)"}}>SAD</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BetweenView({ ctx }) {
  const { t, lang, patients, groups, groupName } = ctx;
  const ST = window.BC_STORE;
  const [gA, setGA] = useStateC("primera");
  const [gB, setGB] = useStateC("fem");

  function groupData(gid) {
    const ps = patients.filter(p => p.groups.includes(gid));
    const mets = ps.map(p => ({ p, ...evalMetrics(p, ST.latestEval(p)) }));
    return { gid, ps, mets };
  }
  const A = groupData(gA), B = groupData(gB);
  const metricDefs = [["fat"," %"],["muscle"," kg"],["weight"," kg"]];
  const somaStat = (mets, i) => { const arr = mets.map(m=>m.somaArr[i]); return mets.length? `${mean(arr).toFixed(1)}` : "—"; };

  const cloudA = A.mets.map(m => ({ s: m.somaArr, sex:"male", name: m.p.name }));
  const cloudB = B.mets.map(m => ({ s: m.somaArr, sex:"female", name: m.p.name }));

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="filters" style={{ marginBottom: 0 }}>
        <select className="sel-input" value={gA} onChange={e=>setGA(e.target.value)}>{groups.map(g=><option key={g.id} value={g.id}>{g[lang]||g.es}</option>)}</select>
        <span style={{ color:"var(--text-faint)", fontFamily:"var(--font-mono)" }}>vs</span>
        <select className="sel-input" value={gB} onChange={e=>setGB(e.target.value)}>{groups.map(g=><option key={g.id} value={g.id}>{g[lang]||g.es}</option>)}</select>
      </div>
      <div className="grid" style={{ gridTemplateColumns:"1fr 1fr" }}>
        <div className="card">
          <div className="card-head"><div><h3>{t("group_stats")}</h3><div className="sub">{t("mean_sd")} · {lang==="es"?"última evaluación":"latest assessment"}</div></div></div>
          <div className="card-pad">
            <table className="data">
              <thead><tr><th></th><th className="n">{groupName(gA)} (n={A.ps.length})</th><th className="n">{groupName(gB)} (n={B.ps.length})</th></tr></thead>
              <tbody>
                {metricDefs.map(([k,u]) => (
                  <tr key={k} className="row-hover">
                    <td>{k==="fat"?(lang==="es"?"% Grasa":"Fat %"):k==="muscle"?(lang==="es"?"Masa muscular":"Muscle mass"):(lang==="es"?"Peso":"Weight")}</td>
                    <td className="n">{A.mets.length?`${mean(A.mets.map(m=>m[k])).toFixed(1)} ± ${sd(A.mets.map(m=>m[k])).toFixed(1)}`:"—"}<span style={{color:"var(--text-faint)",fontSize:10}}>{u}</span></td>
                    <td className="n">{B.mets.length?`${mean(B.mets.map(m=>m[k])).toFixed(1)} ± ${sd(B.mets.map(m=>m[k])).toFixed(1)}`:"—"}<span style={{color:"var(--text-faint)",fontSize:10}}>{u}</span></td>
                  </tr>
                ))}
                <tr className="row-hover"><td>{lang==="es"?"Somatotipo medio":"Mean somatotype"}</td>
                  <td className="n mono" style={{fontSize:11}}>{[0,1,2].map(i=>somaStat(A.mets,i)).join("–")}</td>
                  <td className="n mono" style={{fontSize:11}}>{[0,1,2].map(i=>somaStat(B.mets,i)).join("–")}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><div><h3>{lang==="es"?"Nubes de somatotipo":"Somatotype clouds"}</h3></div>
            <div className="right" style={{display:"flex",gap:12,fontSize:11,color:"var(--text-dim)"}}>
              <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:9,height:9,borderRadius:"50%",background:"var(--fr-muscle)"}}/>{groupName(gA)}</span>
              <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:9,height:9,borderRadius:"50%",background:"var(--fr-residual)"}}/>{groupName(gB)}</span>
            </div>
          </div>
          <div className="card-pad" style={{ display:"flex", justifyContent:"center" }}>
            <SomatoChart cloud={[...cloudA, ...cloudB]} showMain={false} soma={{X:0,Y:0,endo:0,meso:0,ecto:0}} lang={lang} size={300} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AthletesView({ ctx }) {
  const { t, lang, patients } = ctx;
  const ST = window.BC_STORE;
  const [selected, setSelected] = useStateC(() => patients.slice(0, 3).map(p => p.id));
  const [pick, setPick] = useStateC("");
  const add = () => { const id = pick || (patients.find(p => !selected.includes(p.id)) || {}).id; if (id && !selected.includes(id)) { setSelected(s => [...s, id]); setPick(""); } };
  const remove = id => setSelected(s => s.filter(x => x !== id));
  const rows = selected.map(id => { const p = ST.patientById(patients, id); if (!p) return null; return { p, ...evalMetrics(p, ST.latestEval(p)) }; }).filter(Boolean);
  const avail = patients.filter(p => !selected.includes(p.id));
  const cloud = rows.map(r => ({ s: r.somaArr, sex: r.p.sex, name: r.p.name }));
  const colorFor = i => ["var(--accent)","var(--fr-muscle)","var(--fr-bone)","var(--info)","var(--fr-residual)","var(--fr-skin)","var(--accent-2)","#e07b39"][i % 8];

  const BarGroup = ({ title, k, unit, fmt = (v)=>v.toFixed(1) }) => {
    const max = Math.max(...rows.map(r => r[k]), 0.001);
    return (
      <div style={{ marginBottom: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>{title}</div>
        {rows.map((r, i) => (
          <div key={r.p.id} className="aff-row" style={{ gridTemplateColumns: "130px 1fr 66px", cursor: "default" }}>
            <span style={{ fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.p.name}</span>
            <span className="aff-bar"><div style={{ width: Math.max(4, r[k]/max*100) + "%", background: colorFor(i) }} /></span>
            <span className="aff-sad">{fmt(r[k])}<span style={{ color:"var(--text-faint)", fontSize:10 }}>{unit}</span></span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card card-pad">
        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <select className="sel-input" value={pick} onChange={e=>setPick(e.target.value)} style={{ minWidth: 220 }}>
            <option value="">{lang==="es"?"Selecciona un atleta…":"Pick an athlete…"}</option>
            {avail.map(p => <option key={p.id} value={p.id}>{p.name} · {p.sport}</option>)}
          </select>
          <button className="btn" onClick={add} disabled={!avail.length}><Icon n="plus" s={15} /> {lang==="es"?"Agregar":"Add"}</button>
          <span style={{ flex:1 }} />
          <span className="chip">{rows.length} {lang==="es"?"atletas":"athletes"}</span>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:14 }}>
          {rows.map((r, i) => (
            <span key={r.p.id} className="chip" style={{ paddingRight:6, borderColor:"var(--line-strong)" }}>
              <span style={{ width:9, height:9, borderRadius:3, background:colorFor(i) }} />
              {r.p.name}
              <button className="icon-btn" style={{ width:20, height:20, border:0, background:"transparent", color:"var(--text-faint)" }} onClick={()=>remove(r.p.id)}><Icon n="close" s={12} /></button>
            </span>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card card-pad"><div className="bodymap-ph" style={{ minHeight:160 }}><Icon n="patients" s={28} /><div style={{ fontSize:12.5 }}>{lang==="es"?"Agrega atletas para comparar su composición y somatotipo.":"Add athletes to compare composition and somatotype."}</div></div></div>
      ) : (
        <>
          <div className="grid" style={{ gridTemplateColumns:"1fr 1fr", alignItems:"start" }}>
            <div className="card">
              <div className="card-head"><div><h3>{lang==="es"?"Comparativa de composición":"Composition comparison"}</h3><div className="sub">{lang==="es"?"última evaluación de cada atleta":"each athlete's latest assessment"}</div></div></div>
              <div className="card-pad">
                <BarGroup title={lang==="es"?"% Grasa corporal":"Body fat %"} k="fat" unit=" %" />
                <BarGroup title={lang==="es"?"Masa muscular":"Muscle mass"} k="muscle" unit=" kg" />
                <BarGroup title={lang==="es"?"Peso":"Weight"} k="weight" unit=" kg" fmt={v=>v.toFixed(0)} />
              </div>
            </div>
            <div className="card">
              <div className="card-head"><div><h3>{lang==="es"?"Somatotipos superpuestos":"Overlaid somatotypes"}</h3><div className="sub">{lang==="es"?"nube de los atletas seleccionados":"cloud of selected athletes"}</div></div></div>
              <div className="card-pad" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
                <SomatoChart cloud={cloud} showMain={false} soma={{X:0,Y:0,endo:0,meso:0,ecto:0}} lang={lang} size={300} />
                <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
                  {rows.map(r => <span key={r.p.id} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"var(--text-dim)" }}><span style={{ width:8, height:8, borderRadius:"50%", background: r.p.sex==="female"?"var(--fr-residual)":"var(--fr-muscle)" }} />{r.p.name} · {r.somaArr.map(v=>v.toFixed(1)).join("–")}</span>)}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div><h3>{lang==="es"?"Tabla comparativa":"Comparison table"}</h3></div></div>
            <div className="card-pad">
              <table className="data">
                <thead><tr><th>{lang==="es"?"Atleta":"Athlete"}</th><th>{t("sport")}</th><th className="n">{lang==="es"?"Peso":"Weight"}</th><th className="n">% {lang==="es"?"graso":"fat"}</th><th className="n">{lang==="es"?"Músculo":"Muscle"}</th><th className="n">{lang==="es"?"Adiposa":"Adipose"}</th><th>{lang==="es"?"Somatotipo":"Somatotype"}</th></tr></thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.p.id} className="row-hover">
                      <td><span style={{ display:"inline-block", width:8, height:8, borderRadius:2, background:colorFor(i), marginRight:8 }} />{r.p.name}</td>
                      <td style={{ color:"var(--text-dim)" }}>{r.p.sport}</td>
                      <td className="n">{r.weight.toFixed(1)}</td>
                      <td className="n" style={{ color:"var(--accent)" }}>{r.fat.toFixed(1)}</td>
                      <td className="n">{r.muscle.toFixed(1)}</td>
                      <td className="n">{r.adipose.toFixed(1)}</td>
                      <td className="mono" style={{ fontSize:11.5 }}>{r.somaArr.map(v=>v.toFixed(1)).join("–")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ComparatorScreen({ ctx }) {
  const { t, lang } = ctx;
  const [tab, setTab] = useStateC("intra");
  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">{lang==="es"?"Análisis comparativo":"Comparative analysis"}</div>
        <div className="page-title">{t("comparator")}</div>
        <div className="page-desc">{t("cmp_desc")}</div>
      </div>
      <div className="seg" style={{ marginBottom: 18 }}>
        <button className={tab==="intra"?"on":""} onClick={()=>setTab("intra")}>{t("intra")}</button>
        <button className={tab==="athletes"?"on":""} onClick={()=>setTab("athletes")}>{lang==="es"?"Entre atletas":"Between athletes"}</button>
        <button className={tab==="between"?"on":""} onClick={()=>setTab("between")}>{t("between")}</button>
      </div>
      {tab === "intra" ? <IntraView ctx={ctx} /> : tab === "athletes" ? <AthletesView ctx={ctx} /> : <BetweenView ctx={ctx} />}
    </div>
  );
}

window.ComparatorScreen = ComparatorScreen;
