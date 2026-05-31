/* screens_supplements.jsx — supplementation per kg body-mass + AI protocol assistant. */
const { useState: useStateSup } = React;

const SUPP_CAT_COLOR = { power:"var(--fr-bone)", endur:"var(--fr-muscle)", build:"var(--accent)", perf:"var(--info)", health:"var(--fr-skin)" };

function EvidencePill({ ev }) {
  const tone = ev === "A" ? "good" : ev === "B" ? "warn" : "info";
  return <Badge tone={tone} dot={false}>{ev}</Badge>;
}

function SupplementsScreen({ ctx }) {
  const { t, lang, subject, m } = ctx;
  const E = window.BC_ENGINE, N = window.BC_NUTRI;
  const age = E.ageDecimal(subject.dob, subject.assessedOn);
  const fr = E.fractionation(m);
  const bf = E.bodyFat(m, subject.sex, age);
  const rec = bf.rec;
  const ffm = m.weight - rec.fatKg;

  const [goals, setGoals] = useStateSup(["power","build"]);
  const [ai, setAi] = useStateSup({ state:"idle", text:"" });
  const toggle = g => setGoals(gs => gs.includes(g) ? gs.filter(x=>x!==g) : [...gs, g]);

  const list = E.supplementation(m.weight, goals);

  async function runAI() {
    setAi({ state:"loading", text:"" });
    const sel = list.map(s => `${lang==="es"?s.es:s.en}: ${s.dose} ${s.unit}`).join("; ");
    const goalNames = goals.map(g => { const o = N.SUPP_GOALS.find(x=>x.key===g); return o?(lang==="es"?o.es:o.en):g; }).join(", ");
    const prompt = lang === "es"
      ? `Eres un nutricionista deportivo. Diseña un protocolo de suplementación práctico y seguro para este deportista, basado SOLO en evidencia (ISSN/IOC). Atleta: ${subject.name}, ${subject.sex==="male"?"hombre":"mujer"}, ${age.toFixed(0)} años, ${m.weight} kg, ${rec.pct.toFixed(1)}% graso, masa libre de grasa ${ffm.toFixed(1)} kg, deporte ${subject.sport}. Objetivos: ${goalNames}. Dosis ya calculadas por kg: ${sel}. Devuelve: 1) timing diario (mañana/pre/post/noche), 2) prioridades, 3) advertencias. Máximo 200 palabras, en viñetas claras, sin markdown de encabezados.`
      : `You are a sports nutritionist. Design a practical, safe, evidence-based (ISSN/IOC) supplementation protocol. Athlete: ${subject.name}, ${subject.sex}, ${age.toFixed(0)} y, ${m.weight} kg, ${rec.pct.toFixed(1)}% fat, fat-free mass ${ffm.toFixed(1)} kg, sport ${subject.sport}. Goals: ${goalNames}. Per-kg doses: ${sel}. Return: 1) daily timing, 2) priorities, 3) cautions. Max 200 words, clear bullets, no markdown headers.`;
    try {
      const text = await window.claude.complete({ messages:[{ role:"user", content: prompt }] });
      setAi({ state:"done", text });
    } catch (e) {
      setAi({ state:"error", text: lang==="es"?"No se pudo generar el protocolo. Reintenta en unos segundos.":"Could not generate. Try again shortly." });
    }
  }

  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">{subject.name} · {m.weight} kg · {lang==="es"?"MLG":"FFM"} {ffm.toFixed(1)} kg</div>
        <div className="page-title">{t("supplements")}</div>
        <div className="page-desc">{lang==="es"
          ? "Dosis de ayudas ergogénicas calculadas por kilo de peso corporal según posiciones de la ISSN y el COI. Filtra por objetivo y genera un protocolo personalizado con IA."
          : "Ergogenic-aid doses computed per kilogram of body mass per ISSN/IOC position stands. Filter by goal and generate a personalised protocol with AI."}</div>
      </div>

      {/* goal selector */}
      <div className="filters" style={{ marginBottom:18 }}>
        <span className="eyebrow" style={{ alignSelf:"center" }}>{lang==="es"?"Objetivo":"Goal"}</span>
        {N.SUPP_GOALS.map(g => (
          <button key={g.key} className={"pill"+(goals.includes(g.key)?" on":"")} onClick={()=>toggle(g.key)}>{lang==="es"?g.es:g.en}</button>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns:"1.55fr 1fr", alignItems:"start" }}>
        <div className="card">
          <div className="card-head"><div><h3>{lang==="es"?"Dosificación por kg de peso":"Dosing per kg body-mass"}</h3><div className="sub">{m.weight} kg · {list.length} {lang==="es"?"ayudas":"aids"}</div></div></div>
          <div className="card-pad">
            <table className="data">
              <thead><tr><th>{lang==="es"?"Suplemento":"Supplement"}</th><th className="n">{lang==="es"?"Dosis/kg":"Per-kg"}</th><th className="n">{lang==="es"?"Total":"Total"}</th><th>Ev.</th><th></th></tr></thead>
              <tbody>
                {list.map(s => (
                  <tr key={s.key} className="row-hover">
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                        <span style={{ width:8, height:8, borderRadius:2, background:SUPP_CAT_COLOR[s.cat], flex:"none" }} />
                        <div>
                          <div style={{ fontWeight:600, fontSize:13 }}>{lang==="es"?s.es:s.en}</div>
                          <div style={{ fontSize:10.5, color:"var(--text-faint)" }}>{lang==="es"?s.goal_es:s.goal_en}</div>
                        </div>
                      </div>
                    </td>
                    <td className="n" style={{ fontSize:11, color:"var(--text-dim)" }}>{s.fixed ? "—" : `${s.perKg[0]}${s.perKg[1]!==s.perKg[0]?"–"+s.perKg[1]:""}`}</td>
                    <td className="n" style={{ fontSize:14, color:"var(--accent)" }}>{s.dose}<span style={{fontSize:9.5, color:"var(--text-faint)"}}> {s.unit.split(" ")[0].replace("/día","").replace("/hora","")}</span></td>
                    <td><EvidencePill ev={s.evidence} /></td>
                    <td><EqPopover lang={lang} align="right" title={lang==="es"?s.es:s.en} cite={s.cite} label="i"
                      formula={`${lang==="es"?"Unidad":"Unit"}: ${s.unit}\n${lang==="es"?s.note_es:s.note_en}\n\n${lang==="es"?"Evidencia":"Evidence"}: ${s.evidence} · ${s.cite}`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{fontSize:11, color:"var(--text-faint)", marginTop:12, lineHeight:1.5}}>
              {lang==="es"?"Evidencia: A = fuerte · B = moderada · C = emergente. Las dosis fijas (nitratos, vit. D, CHO intra-esfuerzo) no escalan con el peso.":"Evidence: A strong · B moderate · C emerging. Fixed doses do not scale with weight."}
            </p>
          </div>
        </div>

        {/* AI assistant */}
        <div className="card" style={{ position:"sticky", top:92 }}>
          <div className="card-head">
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <img src="assets/logo-mark.png" alt="" style={{ height:30, width:"auto" }} />
              <div><h3>{lang==="es"?"Asistente IA":"AI assistant"}</h3><div className="sub">{lang==="es"?"Protocolo personalizado":"Personalised protocol"}</div></div>
            </div>
          </div>
          <div className="card-pad">
            <button className="btn primary" style={{ width:"100%", justifyContent:"center" }} onClick={runAI} disabled={ai.state==="loading"}>
              <Icon n="spark" s={15} /> {ai.state==="loading" ? (lang==="es"?"Generando…":"Generating…") : (lang==="es"?"Generar protocolo":"Generate protocol")}
            </button>
            <div style={{ marginTop:14, minHeight:120 }}>
              {ai.state==="idle" && (
                <div className="bodymap-ph" style={{ minHeight:140 }}>
                  <Icon n="pill" s={26} />
                  <div style={{ fontSize:11.5, lineHeight:1.5, maxWidth:"32ch" }}>{lang==="es"?"La IA combina las dosis calculadas con el deporte y la composición corporal para sugerir timing y prioridades.":"The AI blends computed doses with sport and body composition to suggest timing and priorities."}</div>
                </div>
              )}
              {ai.state==="loading" && <div className="ai-skel"><div /><div /><div /><div /></div>}
              {(ai.state==="done"||ai.state==="error") && (
                <div style={{ fontSize:12.5, lineHeight:1.65, whiteSpace:"pre-wrap", color: ai.state==="error"?"var(--bad)":"var(--text)" }}>{ai.text}</div>
              )}
            </div>
            <div className="divider" />
            <p style={{ fontSize:10.5, color:"var(--text-faint)", lineHeight:1.5 }}>
              {lang==="es"?"Sugerencia orientativa. Validar con el equipo médico antes de prescribir. No sustituye criterio clínico.":"Orientative suggestion. Validate with the medical team before prescribing."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
window.SupplementsScreen = SupplementsScreen;
