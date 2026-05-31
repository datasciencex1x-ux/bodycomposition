/* screens_performance.jsx — optional physical-condition variables + sport-profile match. */
const { useState: useStatePerf } = React;

const PERF_GROUPS = [
  { key:"aerobic",  es:"Aeróbico",  en:"Aerobic" },
  { key:"power",    es:"Potencia · saltos", en:"Power · jumps" },
  { key:"speed",    es:"Velocidad", en:"Speed" },
  { key:"strength", es:"Fuerza",    en:"Strength" },
];

function PerfField({ mt, val, onChange, lang }) {
  return (
    <div className="field">
      <label>{lang==="es"?mt.es:mt.en}</label>
      <div className="input-wrap">
        <input type="number" step="0.01" value={val ?? ""} placeholder="—"
          onChange={e => onChange(mt.key, e.target.value === "" ? "" : parseFloat(e.target.value))} />
        <span className="unit" style={{ fontSize:9.5 }}>{mt.u}</span>
      </div>
    </div>
  );
}

function PerformanceScreen({ ctx }) {
  const { t, lang, subject, evalObj, updatePerf } = ctx;
  const E = window.BC_ENGINE, P = window.BC_PERF;
  const perf = evalObj.perf || {};
  const setVal = (k, v) => updatePerf(prev => ({ ...prev, [k]: v }));
  const fillSample = () => updatePerf({ vo2:57.2, cmj:39.5, sj:36.1, abk:47.8, sprint30:4.06, rsa:3.8, grip:51.5, squat:1.85, bench:1.18 });
  const clearAll = () => updatePerf({});

  const prof = E.performanceProfile(perf, subject.sex, subject.sportKey);
  const ownLabel = P.PERF_SPORT_LABEL[E.perfSportKey(subject.sportKey)];

  return (
    <div className="fade-in">
      <div className="page-head" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div className="eyebrow">{subject.name} · {subject.sport} · {evalObj.date}</div>
          <div className="page-title">{t("performance")}</div>
          <div className="page-desc" style={{ maxWidth:"68ch" }}>{lang==="es"
            ? "Carga opcional de variables de condición física. El sistema las estandariza contra valores profesionales de la literatura y estima el perfil deportivo más afín y el nivel competitivo."
            : "Optionally upload physical-condition variables. The system standardises them against professional literature values and estimates the closest sport profile and competitive level."}</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn ghost" onClick={clearAll}>{lang==="es"?"Limpiar":"Clear"}</button>
          <button className="btn" onClick={fillSample}><Icon n="bolt" s={15} /> {lang==="es"?"Cargar ejemplo":"Load sample"}</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns:"1fr 1.25fr", alignItems:"start" }}>
        {/* inputs */}
        <div className="card">
          <div className="card-head"><div><h3>{lang==="es"?"Variables de condición física":"Physical-condition variables"}</h3><div className="sub">{lang==="es"?"Todas opcionales · se guardan en la evaluación":"All optional · saved to the assessment"}</div></div></div>
          <div className="card-pad" style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {PERF_GROUPS.map(g => (
              <div key={g.key}>
                <div className="eyebrow" style={{ marginBottom:10 }}>{lang==="es"?g.es:g.en}</div>
                <div className="grid" style={{ gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  {P.PERF_METRICS.filter(mt => mt.group===g.key).map(mt => (
                    <PerfField key={mt.key} mt={mt} val={perf[mt.key]} onChange={setVal} lang={lang} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* analysis */}
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          {prof.empty ? (
            <div className="card card-pad">
              <div className="bodymap-ph" style={{ minHeight:220 }}>
                <Icon n="target" s={30} />
                <div style={{ fontSize:12.5, maxWidth:"34ch", lineHeight:1.5 }}>{lang==="es"?"Introduce al menos una variable para comparar contra la literatura y estimar el perfil deportivo.":"Enter at least one variable to compare against literature and estimate the sport profile."}</div>
              </div>
            </div>
          ) : (
            <>
              {/* verdict */}
              <div className="card card-pad" style={{ background:"linear-gradient(120deg,var(--accent-soft),transparent)", borderColor:"var(--accent-line)" }}>
                <div className="eyebrow">{lang==="es"?"Perfil estimado":"Estimated profile"}</div>
                <div style={{ fontSize:20, fontFamily:"var(--font-display)", fontWeight:600, marginTop:8, lineHeight:1.35 }}>
                  {lang==="es"
                    ? <>El deportista presenta el perfil de <span style={{color:"var(--accent)"}}>{prof.ranking[0].label.noun_es}</span> a nivel <span style={{color:"var(--accent)"}}>{prof.levelVsOwn.es.toLowerCase()}</span>.</>
                    : <>Athlete shows the profile of <span style={{color:"var(--accent)"}}>{prof.ranking[0].label.noun_en}</span> at <span style={{color:"var(--accent)"}}>{prof.levelVsOwn.en.toLowerCase()}</span> level.</>}
                </div>
                <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
                  <Badge tone={prof.levelVsOwn.tone} dot={false}>{lang==="es"?"Nivel vs ":"Level vs "}{lang==="es"?ownLabel.es:ownLabel.en}: {lang==="es"?prof.levelVsOwn.es:prof.levelVsOwn.en}</Badge>
                  <Badge tone="good" dot={false}>{lang==="es"?"Afinidad":"Affinity"} {prof.ranking[0].affinity}%</Badge>
                  <Badge tone="info" dot={false}>z̄ {prof.meanZ>=0?"+":""}{prof.meanZ.toFixed(2)}</Badge>
                </div>
              </div>

              {/* per-metric vs reference */}
              <div className="card">
                <div className="card-head"><div><h3>{lang==="es"?"Comparación con referencia profesional":"Vs professional reference"}</h3><div className="sub">{lang==="es"?ownLabel.es:ownLabel.en} · {t(subject.sex)}</div></div></div>
                <div className="card-pad">
                  {prof.perMetric.map(pm => {
                    const pct = Math.max(6, Math.min(100, 50 + pm.z*22));
                    return (
                      <div key={pm.key} style={{ padding:"9px 0", borderBottom:"1px dashed var(--line)" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                          <span style={{ fontSize:12.5 }}>{lang==="es"?pm.es:pm.en}</span>
                          <span style={{ display:"flex", gap:10, alignItems:"center" }}>
                            <span className="mono" style={{ fontSize:12 }}>{pm.value} <span style={{color:"var(--text-faint)",fontSize:10}}>{pm.u}</span></span>
                            <span className="mono" style={{ fontSize:10.5, color:"var(--text-faint)" }}>ref {pm.ref.toFixed(pm.key==='squat'||pm.key==='bench'?2:1)}</span>
                            <Badge tone={pm.level.tone} dot={false}>{pm.z>=0?"+":""}{pm.z.toFixed(2)}</Badge>
                          </span>
                        </div>
                        <div className="aff-bar" style={{ position:"relative", height:7 }}>
                          <div style={{ width:pct+"%", background: pm.z>=0?"linear-gradient(90deg,var(--fr-muscle),var(--accent))":"var(--fr-residual)" }} />
                          <div style={{ position:"absolute", left:"50%", top:-2, width:2, height:11, background:"var(--text-faint)" }} />
                        </div>
                      </div>
                    );
                  })}
                  <p style={{ fontSize:10.5, color:"var(--text-faint)", marginTop:10 }}>{lang==="es"?"La línea central marca la media profesional (z = 0). A la derecha = por encima de referencia.":"Centre line = professional mean (z = 0). Right = above reference."}</p>
                </div>
              </div>

              {/* profile ranking */}
              <div className="card">
                <div className="card-head"><div><h3>{lang==="es"?"Afinidad de perfil por deporte":"Sport-profile affinity"}</h3><div className="sub">{lang==="es"?"Escala 1–100% (100% = perfil idéntico) · ajustado por sexo":"1–100% scale (100% = identical profile) · sex-adjusted"}</div></div></div>
                <div className="card-pad">
                  {prof.ranking.slice(0,6).map((rk, i) => (
                    <div key={rk.sport} className={"aff-row"+(i===0?" sel":"")}>
                      <span className="aff-rank">{i+1}</span>
                      <span style={{ fontSize:13, fontWeight:i===0?600:500 }}>{lang==="es"?rk.label.es:rk.label.en}</span>
                      <span className="aff-bar"><div style={{ width:Math.max(3,rk.affinity)+"%" }} /></span>
                      <span className="aff-sad">{rk.affinity}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
window.PerformanceScreen = PerformanceScreen;
