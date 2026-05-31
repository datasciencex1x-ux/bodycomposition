/* screens_eval.jsx — Nueva Evaluación (ISAK input).  window.EvalScreen */
const { useState: useStateEv } = React;

function NumField({ field, val, onChange, lang }) {
  const flagged = val !== "" && val != null && (val < field.min || val > field.max);
  return (
    <div className="field">
      <label>{field[lang]}</label>
      <div className={"input-wrap" + (flagged ? " flag" : "")}>
        <input type="number" step="0.1" value={val ?? ""} 
          onChange={e => onChange(field.k, e.target.value === "" ? "" : parseFloat(e.target.value))} />
        <span className="unit">{flagged ? "!" : field.u}</span>
      </div>
    </div>
  );
}

function EvalSection({ title, tag, items, m, setM, lang, cols = 4 }) {
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>{title}</h3>
        </div>
        <div className="right"><span className="chip mono">{tag}</span></div>
      </div>
      <div className="card-pad">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14 }}>
          {items.map(f => (
            <NumField key={f.k} field={f} val={m[f.k]} lang={lang}
              onChange={(k, v) => setM(prev => ({ ...prev, [k]: v }))} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EvalScreen({ m, setM, lang, t, onRun, patient, proto, setProto }) {
  const S = window.BC_DATA.SCHEMA;
  const E = window.BC_ENGINE;
  const allKeys = [...S.basic, ...S.skinfolds, ...S.girths, ...S.breadths, ...(S.lengths||[])];
  const reqKeys = allKeys.filter(f => !f.opt);
  const optKeys = allKeys.filter(f => f.opt);
  const filled = reqKeys.filter(f => m[f.k] !== "" && m[f.k] != null).length;
  const flagged = reqKeys.filter(f => { const v = m[f.k]; return v !== "" && v != null && (v < f.min || v > f.max); }).length;
  const total = reqKeys.length;
  const optFilled = optKeys.filter(f => m[f.k] !== "" && m[f.k] != null).length;
  const age = E.ageDecimal(patient.dob, patient.assessedOn);
  const s6 = (m.tricep + m.subscapular + m.supraspinale + m.abdominal + m.thighSkin + m.calfSkin);
  const s8 = s6 + m.bicep + m.iliacCrest;

  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">ISAK · {t("protocol")} · {proto === "adult" ? (lang==="es"?"Adulto":"Adult") : (lang==="es"?"Pediátrico":"Pediatric")}</div>
        <div className="page-title">{t("eval_title")}</div>
        <div className="page-desc">{t("eval_desc")}</div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 312px", alignItems: "start" }}>
        <div className="grid" style={{ gap: 18 }}>
          <EvalSection title={t("basic")} tag="kg · cm" items={S.basic} m={m} setM={setM} lang={lang} />
          <EvalSection title={t("skinfolds")} tag="mm" items={S.skinfolds} m={m} setM={setM} lang={lang} />
          <EvalSection title={t("girths")} tag="cm" items={S.girths} m={m} setM={setM} lang={lang} />
          <EvalSection title={t("breadths")} tag="cm" items={S.breadths} m={m} setM={setM} lang={lang} />
          {S.lengths && <EvalSection title={lang==="es"?"Longitudes y alturas · opcional":"Lengths & heights · optional"} tag="cm" items={S.lengths} m={m} setM={setM} lang={lang} />}
        </div>

        {/* summary rail */}
        <div style={{ position: "sticky", top: 92, display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card card-pad">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="assets/logo-mark.png" alt="" style={{ height: 40, width: "auto" }} />
              <div>
                <div style={{ fontWeight: 600, fontFamily: "var(--font-display)" }}>{patient.name}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>{patient.id}</div>
              </div>
            </div>
            <div className="divider" />
            <div className="kv"><span className="key">{t("sex")}</span><span className="val">{t(patient.sex)}</span></div>
            <div className="kv"><span className="key">{t("age")}</span><span className="val">{age.toFixed(2)} {t("years")}</span></div>
            <div className="kv"><span className="key">{t("sport")}</span><span className="val">{patient.sport}</span></div>
            <div className="kv"><span className="key">{t("level")}</span><span className="val" style={{ fontSize: 11 }}>{patient.level}</span></div>
            <div className="kv"><span className="key">{lang==="es"?"Evaluador":"Evaluator"}</span><span className="val" style={{ fontSize: 11 }}>{patient.evaluator}</span></div>
          </div>

          <div className="card card-pad">
            <div className="eyebrow">{lang==="es"?"Estado del perfil":"Profile status"}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "12px 0 6px" }}>
              <span className="num" style={{ fontSize: 34 }}>{filled}</span>
              <span style={{ color: "var(--text-dim)" }}>/ {total} {lang==="es"?"sitios":"sites"}</span>
            </div>
            <div className="gauge" style={{ marginBottom: 14 }}>
              <div className="seg" style={{ left: 0, width: (filled/total*100)+"%", background: "linear-gradient(90deg,var(--accent),var(--accent-2))" }} />
            </div>
            <div className="kv" style={{ borderBottom:0, paddingTop:0 }}><span className="key">{lang==="es"?"ISAK opcional (43)":"ISAK optional (43)"}</span><span className="val">{optFilled}/{optKeys.length}</span></div>
            <p style={{ fontSize: 11, color: "var(--text-faint)", margin: "2px 0 12px", lineHeight: 1.45 }}>
              {lang==="es"?"No es necesario completar todo: el motor analiza con las medidas disponibles.":"You don't need to fill everything — the engine analyses with whatever is available."}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {flagged === 0
                ? <Badge tone="good"><Icon n="check" s={12}/> {t("profile_complete")}</Badge>
                : <Badge tone="bad"><Icon n="alert" s={12}/> {flagged} {t("flagged")}</Badge>}
              <Badge tone="info" dot={false}>TEM ✓</Badge>
            </div>
            <div className="divider" />
            <div className="kv"><span className="key">{t("sum6")}</span><span className="val">{s6.toFixed(1)} mm</span></div>
            <div className="kv"><span className="key">{t("sum8")}</span><span className="val">{s8.toFixed(1)} mm</span></div>
          </div>

          <div className="card card-pad">
            <div className="eyebrow" style={{ marginBottom: 10 }}>{t("protocol")}</div>
            <div className="pill-row">
              <button className={"pill" + (proto==="adult"?" on":"")} onClick={()=>setProto("adult")}>{lang==="es"?"Adulto":"Adult"}</button>
              <button className={"pill" + (proto==="ped"?" on":"")} onClick={()=>setProto("ped")}>{lang==="es"?"Pediátrico":"Pediatric"}</button>
            </div>
            <p style={{ fontSize: 11.5, color: "var(--text-faint)", margin: "12px 0 0", lineHeight: 1.5 }}>
              {lang==="es"
                ? "El protocolo condiciona qué ecuaciones de masa muscular y grasa se ofrecen (p. ej. Slaughter/Poortmans en pediátrico)."
                : "Protocol conditions which muscle/fat equations are offered (e.g. Slaughter/Poortmans in pediatric)."}
            </p>
          </div>

          <button className="btn primary" style={{ justifyContent: "center" }} onClick={onRun}>
            <Icon n="results" s={16} /> {t("run_engine")}
          </button>
        </div>
      </div>
    </div>
  );
}

window.EvalScreen = EvalScreen;
