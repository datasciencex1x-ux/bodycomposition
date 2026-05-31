/* screens_wearables.jsx — connect wearables, calories burned & daily expenditure. */
const { useState: useStateW } = React;

const DEVICES = [
  { key:"garmin", name:"Garmin",      metric_es:"Carrera · FC · VO₂",  metric_en:"Run · HR · VO₂" },
  { key:"apple",  name:"Apple Watch", metric_es:"Anillos · FC · SpO₂", metric_en:"Rings · HR · SpO₂" },
  { key:"polar",  name:"Polar",       metric_es:"FC · carga · sueño",  metric_en:"HR · load · sleep" },
  { key:"whoop",  name:"WHOOP",       metric_es:"Recuperación · HRV",  metric_en:"Recovery · HRV" },
  { key:"fitbit", name:"Fitbit",      metric_es:"Pasos · sueño",       metric_en:"Steps · sleep" },
  { key:"oura",   name:"Oura Ring",   metric_es:"Sueño · HRV · temp.", metric_en:"Sleep · HRV · temp" },
];

function WearablesScreen({ ctx }) {
  const { t, lang, subject, m } = ctx;
  const E = window.BC_ENGINE, N = window.BC_NUTRI, P = window.BC_PREFS;
  const age = E.ageDecimal(subject.dob, subject.assessedOn);
  const fr = E.fractionation(m);
  const bf = E.bodyFat(m, subject.sex, age);
  const rec = bf.rec;
  const ffm = m.weight - rec.fatKg;
  const B = E.bmr(m, subject.sex, age, ffm);
  const bmr = B.list.find(x => x.key === (age>=16?B.recommendedAthlete:B.recommended)).kcal;

  const [conn, setConn] = useStateW(() => P.get("devices", { garmin:true }));
  const [sessions, setSessions] = useStateW(() => P.get("sessions", [{ key:"football", min:90 }, { key:"strength", min:45 }]));
  const toggle = k => { const next = { ...conn, [k]: !conn[k] }; setConn(next); P.set("devices", next); };
  const anyConn = Object.values(conn).some(Boolean);

  const setMin = (i, min) => { const next = sessions.map((s,j)=> j===i?{...s,min}:s); setSessions(next); P.set("sessions", next); };
  const setAct = (i, key) => { const next = sessions.map((s,j)=> j===i?{...s,key}:s); setSessions(next); P.set("sessions", next); };
  const addSession = () => { const next = [...sessions, { key:"run", min:30 }]; setSessions(next); P.set("sessions", next); };
  const rmSession = i => { const next = sessions.filter((_,j)=>j!==i); setSessions(next); P.set("sessions", next); };

  const kcalFor = s => { const met = (N.METS.find(x=>x.key===s.key)||{met:5}).met; return met * m.weight * (s.min/60); };
  const activeKcal = sessions.reduce((a,s)=>a+kcalFor(s),0);
  const total = bmr + activeKcal;
  const f0 = x => Math.round(x);

  // simulated "today" telemetry (deterministic-ish from weight)
  const steps = anyConn ? 7200 + Math.round(activeKcal*3) : null;
  const rhr = anyConn ? 52 : null;
  const sleep = anyConn ? "7h 24m" : null;
  // energy availability EA = (intake - EEE)/FFM ; assume intake = total here for illustration
  const ea = activeKcal>0 ? (total - activeKcal) / ffm : null;

  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">{subject.name} · {m.weight} kg · {lang==="es"?"MLG":"FFM"} {ffm.toFixed(1)} kg</div>
        <div className="page-title">{t("wearables")}</div>
        <div className="page-desc">{lang==="es"
          ? "Instala wearables para incorporar telemetría al cálculo del estado nutricional. Estima las calorías gastadas por sesión (MET × peso × tiempo) y el gasto energético total del día."
          : "Install wearables to feed telemetry into the nutritional-status calculation. Estimates calories burned per session (MET × weight × time) and total daily expenditure."}</div>
      </div>

      {/* device grid */}
      <div className="card" style={{ marginBottom:18 }}>
        <div className="card-head"><div><h3>{lang==="es"?"Dispositivos":"Devices"}</h3><div className="sub">{lang==="es"?"Conecta para sincronizar métricas":"Connect to sync metrics"}</div></div>
          <div className="right"><Badge tone={anyConn?"good":"info"} dot={false}>{Object.values(conn).filter(Boolean).length} {lang==="es"?"conectados":"connected"}</Badge></div></div>
        <div className="card-pad">
          <div className="grid cols-3">
            {DEVICES.map(d => {
              const on = !!conn[d.key];
              return (
                <button key={d.key} onClick={()=>toggle(d.key)}
                  style={{ display:"flex", alignItems:"center", gap:12, textAlign:"left", padding:"13px 15px", borderRadius:12,
                    border:"1px solid "+(on?"var(--accent-line)":"var(--line)"), background:on?"var(--accent-soft)":"var(--surface-2)", color:"var(--text)" }}>
                  <div style={{ width:38, height:38, borderRadius:10, display:"grid", placeItems:"center", flex:"none",
                    background:on?"linear-gradient(140deg,var(--accent-2),var(--accent))":"var(--surface-3)", color:on?"var(--accent-ink)":"var(--text-faint)" }}>
                    <Icon n="watch" s={20} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>{d.name}</div>
                    <div style={{ fontSize:10.5, color:"var(--text-faint)" }}>{lang==="es"?d.metric_es:d.metric_en}</div>
                  </div>
                  <Badge tone={on?"good":""} dot={false}>{on?(lang==="es"?"Conectado":"Linked"):(lang==="es"?"Instalar":"Install")}</Badge>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* today telemetry */}
      <div className="grid cols-4" style={{ marginBottom:18 }}>
        <div className="stat"><div className="k">{lang==="es"?"Calorías activas":"Active calories"}</div><div className="v" style={{color:"var(--fr-muscle)"}}>{f0(activeKcal)}<small>kcal</small></div><div className="meta">{sessions.length} {lang==="es"?"sesiones":"sessions"}</div></div>
        <div className="stat"><div className="k">{lang==="es"?"Gasto total día":"Total daily"}</div><div className="v" style={{color:"var(--accent)"}}>{f0(total)}<small>kcal</small></div><div className="meta">{lang==="es"?"Basal":"Basal"} {f0(bmr)} + {lang==="es"?"activo":"active"} {f0(activeKcal)}</div></div>
        <div className="stat"><div className="k">{lang==="es"?"Pasos (hoy)":"Steps (today)"}</div><div className="v">{steps?steps.toLocaleString():"—"}</div><div className="meta">{anyConn?(lang==="es"?"sincronizado":"synced"):(lang==="es"?"sin dispositivo":"no device")}</div></div>
        <div className="stat"><div className="k">{lang==="es"?"FC reposo · sueño":"Rest HR · sleep"}</div><div className="v">{rhr?rhr:"—"}<small>{rhr?"bpm":""}</small></div><div className="meta">{sleep||"—"}</div></div>
      </div>

      <div className="grid" style={{ gridTemplateColumns:"1.3fr 1fr", alignItems:"start" }}>
        {/* session calculator */}
        <div className="card">
          <div className="card-head"><div><h3>{lang==="es"?"Calorías gastadas por sesión":"Calories burned per session"}</h3><div className="sub">MET × {m.weight} kg × {lang==="es"?"tiempo":"time"}</div></div>
            <div className="right"><button className="btn ghost" onClick={addSession}><Icon n="plus" s={15} /> {lang==="es"?"Sesión":"Session"}</button></div></div>
          <div className="card-pad">
            <table className="data">
              <thead><tr><th>{lang==="es"?"Actividad":"Activity"}</th><th className="n">MET</th><th className="n">{lang==="es"?"Min":"Min"}</th><th className="n">kcal</th><th></th></tr></thead>
              <tbody>
                {sessions.map((s,i) => {
                  const met = (N.METS.find(x=>x.key===s.key)||{met:5}).met;
                  return (
                    <tr key={i}>
                      <td><select className="sel-input" style={{ padding:"6px 9px", fontSize:12.5 }} value={s.key} onChange={e=>setAct(i,e.target.value)}>
                        {N.METS.map(o => <option key={o.key} value={o.key}>{lang==="es"?o.es:o.en}</option>)}
                      </select></td>
                      <td className="n" style={{ color:"var(--text-faint)" }}>{met}</td>
                      <td className="n"><input type="number" value={s.min} onChange={e=>setMin(i, parseFloat(e.target.value)||0)} style={{ width:64, background:"var(--surface-2)", border:"1px solid var(--line)", borderRadius:8, padding:"6px 8px", color:"var(--text)", fontFamily:"var(--font-mono)", textAlign:"right" }} /></td>
                      <td className="n" style={{ fontSize:14, color:"var(--accent)" }}>{f0(kcalFor(s))}</td>
                      <td><button className="icon-btn" style={{ width:28, height:28 }} onClick={()=>rmSession(i)}><Icon n="close" s={14} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p style={{ fontSize:11, color:"var(--text-faint)", marginTop:10 }}>{lang==="es"?"Compendio de Ainsworth (METs). El equivalente metabólico se multiplica por el peso y la duración.":"Ainsworth MET compendium × weight × duration."}</p>
          </div>
        </div>

        {/* nutritional integration */}
        <div className="card">
          <div className="card-head"><div><h3>{lang==="es"?"Integración nutricional":"Nutritional integration"}</h3><div className="sub">{lang==="es"?"Disponibilidad energética":"Energy availability"}</div></div></div>
          <div className="card-pad" style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div className="stackbar" style={{ height:26 }}>
              <div style={{ flexGrow:bmr, background:"var(--fr-bone)" }} title="BMR" />
              <div style={{ flexGrow:activeKcal||0.01, background:"var(--fr-muscle)" }} title="Active" />
            </div>
            <div style={{ display:"flex", gap:16, fontSize:11.5 }}>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{width:9,height:9,borderRadius:2,background:"var(--fr-bone)"}} />{lang==="es"?"Basal":"Basal"} {f0(bmr)}</span>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{width:9,height:9,borderRadius:2,background:"var(--fr-muscle)"}} />{lang==="es"?"Ejercicio":"Exercise"} {f0(activeKcal)}</span>
            </div>
            <div className="divider" style={{ margin:"4px 0" }} />
            <div className="kv"><span className="key">{lang==="es"?"Gasto energético total":"Total expenditure"}</span><span className="val" style={{ color:"var(--accent)", fontSize:15 }}>{f0(total)} kcal</span></div>
            <div className="kv"><span className="key">{lang==="es"?"Energía de ejercicio (EEE)":"Exercise energy (EEE)"}</span><span className="val">{f0(activeKcal)} kcal</span></div>
            <div className="kv"><span className="key">{lang==="es"?"Disp. energética (≈ aporte=GET)":"Energy availability"}</span><span className="val">{ea?ea.toFixed(0):"—"} kcal/kg MLG</span></div>
            <div style={{ padding:"11px 13px", borderRadius:10, background:"var(--surface-2)", border:"1px solid var(--line)", fontSize:11.5, color:"var(--text-dim)", lineHeight:1.55 }}>
              {lang==="es"
                ? "Una disponibilidad energética < 30 kcal/kg MLG indica riesgo de baja disponibilidad (RED-S). El objetivo saludable es ≥ 45 kcal/kg MLG."
                : "Energy availability < 30 kcal/kg FFM signals low-availability risk (RED-S). Healthy target ≥ 45 kcal/kg FFM."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.WearablesScreen = WearablesScreen;
