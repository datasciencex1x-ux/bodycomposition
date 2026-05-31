/* screens_metabolism.jsx — BMR equations, activity factor & total daily expenditure. */
const { useState: useStateMet, useEffect: useEffectMet } = React;

/* shared activity-factor persistence (used by Metabolism & Diet) */
window.BC_PREFS = window.BC_PREFS || {
  get(k, def) { try { const v = localStorage.getItem("bc_pref_" + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
  set(k, v) { try { localStorage.setItem("bc_pref_" + k, JSON.stringify(v)); } catch (e) {} },
};

function MetabolismScreen({ ctx }) {
  const { t, lang, subject, m } = ctx;
  const E = window.BC_ENGINE, N = window.BC_NUTRI;
  const age = E.ageDecimal(subject.dob, subject.assessedOn);
  const fr = E.fractionation(m);
  const bf = E.bodyFat(m, subject.sex, age);
  const rec = bf.rec;
  const ffm = m.weight - rec.fatKg;
  const B = E.bmr(m, subject.sex, age, ffm);

  const [actKey, setActKey] = useStateMet(() => window.BC_PREFS.get("activity", "high"));
  const [eqKey, setEqKey] = useStateMet(() => age >= 16 ? B.recommendedAthlete : B.recommended);
  useEffectMet(() => window.BC_PREFS.set("activity", actKey), [actKey]);

  const act = N.ACTIVITY.find(a => a.key === actKey);
  const eq = B.list.find(x => x.key === eqKey) || B.list[0];
  const tdee = E.tdee(eq.kcal, act.factor);
  const f0 = x => Math.round(x);
  const maxK = Math.max(...B.list.map(x => x.kcal));

  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">{subject.name} · {subject.id} · {age.toFixed(1)} {t("years")} · {t(subject.sex)}</div>
        <div className="page-title">{t("metabolism")}</div>
        <div className="page-desc">{lang==="es"
          ? "Tasa metabólica basal por varias ecuaciones, factor de actividad física y gasto energético total diario (GET). La masa libre de grasa (MLG) procede del fraccionamiento Kerr."
          : "Basal metabolic rate across equations, physical-activity factor and total daily energy expenditure (TDEE). Fat-free mass comes from the Kerr fractionation."}</div>
      </div>

      <div className="grid cols-4" style={{ marginBottom: 18 }}>
        <div className="stat"><div className="k">TMB · {eq.author.split(" ")[0]}</div><div className="v" style={{color:"var(--accent)"}}>{f0(eq.kcal)}<small>kcal</small></div><div className="meta">{lang==="es"?"Metabolismo basal":"Basal rate"}</div></div>
        <div className="stat"><div className="k">{lang==="es"?"Factor actividad":"Activity factor"}</div><div className="v">×{act.factor}</div><div className="meta">{lang==="es"?act.es:act.en}</div></div>
        <div className="stat"><div className="k">{lang==="es"?"Gasto total (GET)":"Total expenditure"}</div><div className="v" style={{color:"var(--fr-muscle)"}}>{f0(tdee)}<small>kcal</small></div><div className="meta">TMB × {act.factor}</div></div>
        <div className="stat"><div className="k">{lang==="es"?"Masa libre de grasa":"Fat-free mass"}</div><div className="v">{ffm.toFixed(1)}<small>kg</small></div><div className="meta">{lang==="es"?"Kerr · % graso":"Kerr · body fat"} {rec.pct.toFixed(1)}%</div></div>
      </div>

      <div className="grid" style={{ gridTemplateColumns:"1.3fr 1fr", marginBottom: 18 }}>
        {/* BMR equation comparison */}
        <div className="card">
          <div className="card-head"><div><h3>{lang==="es"?"Tasa metabólica basal — ecuaciones":"Basal metabolic rate — equations"}</h3><div className="sub">{lang==="es"?"Selecciona la ecuación base para el cálculo del GET":"Pick the base equation for TDEE"}</div></div></div>
          <div className="card-pad">
            <table className="data">
              <thead><tr><th>{t("method")}</th><th>{t("population")}</th><th className="n">kcal/día</th><th style={{width:"26%"}}></th><th></th></tr></thead>
              <tbody>
                {B.list.map(x => {
                  const on = x.key === eqKey;
                  return (
                    <tr key={x.key} className="row-hover" onClick={()=>setEqKey(x.key)} style={{cursor:"pointer", background: on?"var(--accent-soft)":null}}>
                      <td style={{fontWeight:600}}>{x.author}{(x.recAthlete || x.rec) && <Badge tone="good" dot={false} style={{marginLeft:6}}>{x.recAthlete?(lang==="es"?"deportistas":"athletes"):t("recommended")}</Badge>}</td>
                      <td style={{color:"var(--text-dim)"}}>{x.pop}</td>
                      <td className="n" style={{fontSize:15, color:on?"var(--accent)":"var(--text)"}}>{f0(x.kcal)}</td>
                      <td><div className="aff-bar"><div style={{width:(x.kcal/maxK*100)+"%", background:on?"linear-gradient(90deg,var(--accent),var(--accent-2))":"var(--fr-bone)"}} /></div></td>
                      <td><EqPopover lang={lang} align="right" title={x.author} cite={x.pop} label="ƒ" formula={x.formula} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p style={{fontSize:11.5, color:"var(--text-faint)", marginTop:14, lineHeight:1.55}}>
              {lang==="es"
                ? "Cunningham y Katch-McArdle usan la masa libre de grasa, por lo que son preferibles en deportistas con composición muscular elevada."
                : "Cunningham and Katch-McArdle use fat-free mass, preferable for athletes with high muscle composition."}
            </p>
          </div>
        </div>

        {/* Activity factor selector + TDEE */}
        <div className="card">
          <div className="card-head"><div><h3>{lang==="es"?"Factor de actividad física":"Physical-activity factor"}</h3><div className="sub">PAL · {lang==="es"?"nivel de actividad":"activity level"}</div></div></div>
          <div className="card-pad" style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {N.ACTIVITY.map(a => {
              const on = a.key === actKey;
              return (
                <button key={a.key} onClick={()=>setActKey(a.key)}
                  style={{ display:"flex", alignItems:"center", gap:12, textAlign:"left", padding:"10px 12px", borderRadius:10,
                    border:"1px solid "+(on?"var(--accent-line)":"var(--line)"), background:on?"var(--accent-soft)":"var(--surface-2)", color:"var(--text)" }}>
                  <span className="num" style={{ fontSize:16, minWidth:58, flex:"none", whiteSpace:"nowrap", color:on?"var(--accent)":"var(--text-dim)" }}>×{a.factor}</span>
                  <span style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600 }}>{lang==="es"?a.es:a.en}</div>
                    <div style={{ fontSize:11, color:"var(--text-faint)" }}>{lang==="es"?a.desc_es:a.desc_en}</div>
                  </span>
                  <span className="num" style={{ fontSize:13, color:"var(--text-dim)" }}>{f0(eq.kcal*a.factor)}</span>
                </button>
              );
            })}
            <div style={{ marginTop:8, padding:"16px 18px", borderRadius:12, background:"linear-gradient(120deg,var(--accent-soft),transparent)", border:"1px solid var(--accent-line)" }}>
              <div className="eyebrow">{lang==="es"?"Gasto energético total":"Total energy expenditure"}</div>
              <div className="num" style={{ fontSize:38, marginTop:6, color:"var(--accent)" }}>{f0(tdee)} <span style={{fontSize:15, color:"var(--text-dim)"}}>kcal/día</span></div>
              <div style={{ fontSize:11.5, color:"var(--text-dim)", marginTop:4 }}>{eq.author} · ×{act.factor} ({lang==="es"?act.es:act.en})</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div><h3>{lang==="es"?"Objetivo energético según meta":"Energy target by goal"}</h3><div className="sub">{lang==="es"?"Ajuste del GET para definición, mantenimiento o volumen":"TDEE adjustment for cut, maintenance or bulk"}</div></div></div>
        <div className="card-pad">
          <div className="grid cols-3">
            {[["cut",-0.18,lang==="es"?"Definición":"Cut","var(--fr-residual)"],["main",0,lang==="es"?"Mantenimiento":"Maintenance","var(--fr-muscle)"],["bulk",0.12,lang==="es"?"Volumen":"Bulk","var(--accent)"]].map(([k,d,label,c])=>(
              <div key={k} style={{ border:"1px solid var(--line)", borderRadius:12, padding:"14px 16px", background:"var(--surface-2)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{label}</span>
                  <span className="mono" style={{ fontSize:11, color:"var(--text-faint)" }}>{d>0?"+":""}{Math.round(d*100)}%</span>
                </div>
                <div className="num" style={{ fontSize:26, marginTop:8, color:c }}>{f0(tdee*(1+d))}<span style={{fontSize:12,color:"var(--text-faint)"}}> kcal</span></div>
                <div style={{ fontSize:11, color:"var(--text-faint)", marginTop:3 }}>{d>0?"+":""}{f0(tdee*d)} kcal {lang==="es"?"vs GET":"vs TDEE"}</div>
              </div>
            ))}
          </div>
          <p style={{fontSize:11.5, color:"var(--text-faint)", marginTop:14}}>
            {lang==="es"?"Pasa al ":"Go to "}<b style={{color:"var(--accent)"}}>{t("diet")}</b>{lang==="es"?" para repartir estas calorías en 3–6 comidas con macronutrientes personalizados.":" to split these calories into 3–6 meals with personalised macros."}
          </p>
        </div>
      </div>
    </div>
  );
}
window.MetabolismScreen = MetabolismScreen;
