/* screens_report.jsx — branded, printable report + CSV export.  window.ReportScreen */
function ReportScreen({ ctx }) {
  const { t, lang, subject, m } = ctx;
  const E = window.BC_ENGINE, D = window.BC_DATA;
  const age = E.ageDecimal(subject.dob, subject.assessedOn);
  const fr = E.fractionation(m);
  const soma = E.somatotype(m, subject.sex);
  const bf = E.bodyFat(m, subject.sex, age);
  const rec = bf.rec;
  const idx = E.indices(m, subject.sex, fr, rec.pct);
  const mm = E.muscleMass(m, subject.sex, age, fr.tissues.muscle.kg);
  const catName = D.SOMA_CATS[lang][soma.category];
  const FR = [["adipose","var(--fr-adipose)"],["muscle","var(--fr-muscle)"],["bone","var(--fr-bone)"],["residual","var(--fr-residual)"],["skin","var(--fr-skin)"]];
  const f = (x,d=1)=>x.toFixed(d);
  const sums = E.skinfoldSums(m, subject.sex);
  const bmi = m.weight / ((m.height/100)**2);
  const ns = E.nutritionStatus(bmi, rec.pct, subject.sex, age);
  const ffm = m.weight - rec.fatKg;
  const B = E.bmr(m, subject.sex, age, ffm);
  const bmrK = B.list.find(x => x.key === (age>=16?B.recommendedAthlete:B.recommended)).kcal;
  const actKey = (window.BC_PREFS && window.BC_PREFS.get("activity","high")) || "high";
  const act = window.BC_NUTRI.ACTIVITY.find(a => a.key === actKey) || window.BC_NUTRI.ACTIVITY[3];
  const tdeeK = bmrK * act.factor;
  const perf = ctx.evalObj.perf || {};
  const prof = E.performanceProfile(perf, subject.sex, subject.sportKey);
  const profilePhrase = !prof.empty
    ? (lang==="es" ? `perfil de ${prof.ranking[0].label.noun_es} (${prof.levelVsOwn.es.toLowerCase()})`
                   : `profile of ${prof.ranking[0].label.noun_en} (${prof.levelVsOwn.en.toLowerCase()})`)
    : null;
  const macP = E.macros(Math.round(tdeeK), m.weight, [0.25,0.45,0.30]);
  const suppList = E.supplementation(m.weight, []).filter(s => ["protein","creatine_maint","caffeine","beta","carb_load","vitd"].includes(s.key));

  // longitudinal history for evolution charts
  const patientObj = window.BC_STORE.patientById(ctx.patients, ctx.selPid) || { evals: [], dob: subject.dob };
  const evs = [...patientObj.evals].sort((a, b) => a.date.localeCompare(b.date));
  const histLabels = evs.map(e => e.date.slice(5));
  const hist = evs.map(e => {
    const a = E.ageDecimal(patientObj.dob, e.date);
    const ff = E.fractionation(e.m);
    const b = E.bodyFat(e.m, subject.sex, a);
    return { weight: e.m.weight, fat: b.rec.pct, muscle: ff.tissues.muscle.kg, adipose: ff.tissues.adipose.kg };
  });
  const hasHistory = evs.length >= 2;

  async function downloadPatientReport() {
    const L = lang === "es";
    let logoData = "";
    try { const rr = await fetch("assets/logo-mark.png"); const bb = await rr.blob(); logoData = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(bb); }); } catch (e) {}
    const css = "body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,sans-serif;color:#14202e;margin:0;background:#eef1f5}"
      + ".wrap{max-width:760px;margin:0 auto;background:#fff}"
      + ".band{background:linear-gradient(120deg,#0b1320,#16212f 70%,#1a2738);color:#eef3f8;padding:24px 30px;border-bottom:3px solid #2bb6a0}"
      + ".band .dsa{font-family:monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;opacity:.8}"
      + ".band h1{margin:4px 0 2px;font-size:25px}.band .id{font-family:monospace;font-size:12px;opacity:.85}"
      + ".sec{padding:20px 30px;border-top:1px solid #eef1f5}h2{font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#8a98ac;margin:0 0 12px}"
      + ".kpis{display:flex;gap:10px;flex-wrap:wrap}.kpi{flex:1;min-width:110px;border:1px solid #e6e9ee;border-radius:9px;padding:10px 12px}"
      + ".kpi .v{font-size:20px;font-weight:600;font-family:monospace}.kpi .l{font-size:9.5px;color:#8a98ac;text-transform:uppercase;letter-spacing:.1em}"
      + ".status{font-size:19px;font-weight:600}.prof{font-size:14px;color:#1a1205;margin-top:6px}.muted{color:#56657a;font-size:12px;margin-top:5px}"
      + "table{width:100%;border-collapse:collapse;font-size:13px}td{padding:7px 2px;border-bottom:1px solid #eef1f5}td.n{text-align:right;font-family:monospace}"
      + ".pill{display:inline-block;background:#fff5e3;color:#a8650a;border:1px solid #f3d6a3;border-radius:999px;padding:2px 10px;font-size:11px;font-weight:600}"
      + ".foot{color:#8a98ac;font-size:11px;padding:16px 30px;text-align:center;border-top:1px solid #eef1f5}";
    const kpi = (l,v) => `<div class="kpi"><div class="l">${l}</div><div class="v">${v}</div></div>`;
    const suppRows = suppList.map(s => `<tr><td>${L?s.es:s.en}</td><td class="n">${s.dose} ${s.unit.split(" ")[0]}</td></tr>`).join("");
    const html = '<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
      + '<title>'+(L?'Reporte · ':'Report · ')+subject.name+'</title><style>'+css+'</style></head><body><div class="wrap">'
      + '<div class="band">'+(logoData?'<img src="'+logoData+'" alt="" style="height:56px;width:auto;margin-bottom:10px">':'')+'<div class="dsa">Data Science Analytics</div><h1>Body Composition</h1>'
      + '<div class="id">'+subject.name+' · '+subject.id+' · '+(L?t(subject.sex):t(subject.sex))+' · '+age.toFixed(1)+' '+t("years")+' · '+subject.sport+'</div>'
      + '<div class="id">'+subject.assessedOn+' · '+subject.phase+'</div></div>'
      + '<div class="sec"><h2>'+(L?'Resumen':'Summary')+'</h2><div class="kpis">'
      + kpi(L?'Peso':'Weight', f(fr.measured)+' kg') + kpi(L?'Grasa':'Body fat', f(rec.pct)+' %')
      + kpi(L?'Músculo':'Muscle', f(fr.tissues.muscle.kg)+' kg') + kpi('Somatotipo', f(soma.endo)+'–'+f(soma.meso)+'–'+f(soma.ecto))
      + '</div></div>'
      + '<div class="sec"><h2>'+(L?'Estado nutricional':'Nutritional status')+'</h2>'
      + '<div class="status">'+(L?ns.label_es:ns.label_en)+'</div>'
      + '<div class="prof">'+(L?'Grasa corporal ':'Body fat ')+'<b>'+(L?rec.cls.es:rec.cls.en)+'</b>'+(profilePhrase?' · '+profilePhrase:'')+'</div>'
      + '<div class="muted">'+(L?'IMC':'BMI')+' '+f(bmi)+' kg/m² · '+(L?'Grasa':'Fat')+' '+f(rec.pct)+'% · OMS + composición</div></div>'
      + '<div class="sec"><h2>'+(L?'Metabolismo y objetivo energético':'Metabolism & energy target')+'</h2><div class="kpis">'
      + kpi(L?'Metabolismo basal':'Basal', Math.round(bmrK)+' kcal') + kpi(L?'Factor':'Factor', '×'+act.factor)
      + kpi(L?'Gasto total':'Total', Math.round(tdeeK)+' kcal') + '</div>'
      + '<table style="margin-top:12px"><tr><td>'+(L?'Proteína':'Protein')+'</td><td class="n">'+Math.round(macP.pro.g)+' g ('+macP.pro.perKg.toFixed(1)+' g/kg)</td></tr>'
      + '<tr><td>'+(L?'Carbohidrato':'Carbohydrate')+'</td><td class="n">'+Math.round(macP.cho.g)+' g</td></tr>'
      + '<tr><td>'+(L?'Grasa':'Fat')+'</td><td class="n">'+Math.round(macP.fat.g)+' g</td></tr></table></div>'
      + '<div class="sec"><h2>'+(L?'Suplementación sugerida (por kg)':'Suggested supplementation (per kg)')+'</h2><table>'+suppRows+'</table>'
      + '<div class="muted" style="margin-top:10px">'+(L?'Orientativo. Validar con el equipo médico antes de prescribir.':'Orientative. Validate with the medical team before prescribing.')+'</div></div>'
      + '<div class="foot">Body Composition · Data Science Analytics · '+(L?'Evaluador':'Evaluator')+': '+subject.evaluator+'</div>'
      + '</div></body></html>';
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `Reporte_${subject.name.replace(/\s+/g,"_")}_${subject.assessedOn}.html`; a.click();
  }

  function exportCSV() {
    const rows = [["Body Composition · Data Science Analytics"],["Paciente", subject.name, subject.id],["Fecha", subject.assessedOn],["Edad", age.toFixed(2)],["Sexo", subject.sex],[],["Variable","Valor","Unidad"]];
    Object.keys(D.SCHEMA).forEach(sec => D.SCHEMA[sec].forEach(fld => rows.push([fld.es, m[fld.k], fld.u])));
    rows.push([],["Fracción (Kerr)","kg","% peso"]);
    FR.forEach(([k]) => rows.push([k, f(fr.tissues[k].kg), f(fr.tissues[k].pctMeasured)]));
    rows.push(["Peso estructurado", f(fr.structured),""],["Factor corrección", f(fr.correction,3),""]);
    rows.push([],["Somatotipo", `${f(soma.endo)}-${f(soma.meso)}-${f(soma.ecto)}`, catName]);
    rows.push(["Estado nutricional", lang==="es"?ns.label_es:ns.label_en, `IMC ${f(bmi)}`]);
    rows.push(["Perfil deportivo", profilePhrase || "—", ""]);
    rows.push(["Metabolismo basal (kcal)", Math.round(bmrK), `Factor ${act.factor}`],["Gasto total GET (kcal)", Math.round(tdeeK), ""]);
    rows.push([],["Sumatoria de pliegues","mm","Clasificación"]);
    sums.forEach(s => rows.push([t("sum"+s.key.slice(1)), f(s.sum), lang==="es"?s.es:s.en]));
    rows.push([],["% Graso (método)","%","kg"]);
    bf.list.forEach(x => rows.push([x.author, f(x.pct), f(x.fatKg)]));
    rows.push([],["Índice","Valor","Unidad"]);
    idx.forEach(ix => rows.push([lang==="es"?ix.es:ix.en, f(ix.v, ix.dec||1), ix.u]));
    const csv = rows.map(r => r.map(c => `"${c ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `BodyComposition_${subject.id}_${subject.assessedOn}.csv`; a.click();
  }

  return (
    <div className="fade-in">
      <div className="page-head no-print" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div className="eyebrow">{t("report_for")} {subject.name} · {subject.assessedOn}</div>
          <div className="page-title">{t("reports")}</div>
          <div className="page-desc">{t("rep_desc")}</div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn" onClick={exportCSV}><Icon n="download" s={15} /> {t("export_csv")}</button>
          <button className="btn" onClick={downloadPatientReport}><Icon n="user" s={15} /> {lang==="es"?"Descargar (paciente)":"Download (patient)"}</button>
          <button className="btn primary" onClick={()=>window.print()}><Icon n="reports" s={15} /> {t("generate_pdf")}</button>
        </div>
      </div>

      <div className="report-sheet">
        <div className="report-band">
          <div className="report-lh">
            <div className="report-lh-logo">
              <img src="assets/logo-mark.png" alt="Body Composition" />
              <div>
                <div className="report-lh-name">Body Composition</div>
                <div className="report-lh-sub">Data Science Analytics · {lang==="es"?"Antropometría ISAK":"ISAK anthropometry"}</div>
              </div>
            </div>
            <div className="report-lh-pt">
              <div className="nm">{subject.name}</div>
              <div className="mono" style={{ fontSize:11, opacity:.8 }}>{subject.id}</div>
              <div>{t(subject.sex)} · {age.toFixed(1)} {t("years")} · {subject.sport}</div>
              <div style={{ opacity:.8 }}>{subject.assessedOn} · {subject.phase}</div>
            </div>
          </div>
        </div>
        <div className="report-accent-rule" />

        <div className="report-body">
          {/* headline metrics */}
          <div className="grid cols-4" style={{ marginBottom:22 }}>
            {[[t("measured_w"),`${f(fr.measured)} kg`],[t("structured_w"),`${f(fr.structured)} kg`],[t("soma_title"),`${f(soma.endo)}–${f(soma.meso)}–${f(soma.ecto)}`],[`${lang==="es"?"Grasa":"Fat"}`,`${f(rec.pct)} %`]].map((kv,i)=>(
              <div key={i} style={{ border:"1px solid var(--line)", borderRadius:10, padding:"12px 14px" }}>
                <div className="k" style={{ fontFamily:"var(--font-mono)", fontSize:9.5, letterSpacing:".14em", textTransform:"uppercase", color:"var(--text-faint)" }}>{kv[0]}</div>
                <div className="num" style={{ fontSize:20, marginTop:5 }}>{kv[1]}</div>
              </div>
            ))}
          </div>

          {/* nutritional status diagnosis */}
          <div style={{ border:"1px solid var(--line)", borderRadius:12, padding:"16px 18px", marginBottom:22, display:"flex", alignItems:"center", gap:18, background:"var(--surface-2)" }}>
            <div style={{ flex:1 }}>
              <div className="eyebrow">{lang==="es"?"Clasificación del estado nutricional":"Nutritional-status classification"}</div>
              <div style={{ fontSize:19, fontFamily:"var(--font-display)", fontWeight:600, marginTop:6 }}>{lang==="es"?ns.label_es:ns.label_en}</div>
              <div style={{ fontSize:13.5, marginTop:6, color:"var(--text-dim)" }}>{lang==="es"?"Grasa corporal ":"Body fat "}<b style={{color:"var(--text)"}}>{lang==="es"?rec.cls.es:rec.cls.en}</b>{profilePhrase?<>{" · "}<b style={{color:"var(--accent)"}}>{profilePhrase}</b></>:""}</div>
              <div style={{ fontSize:11.5, color:"var(--text-faint)", marginTop:5 }}>{lang==="es"?"IMC":"BMI"} {f(bmi)} kg/m² · {lang==="es"?"Grasa":"Fat"} {f(rec.pct)}% ({lang==="es"?rec.cls.es:rec.cls.en}) · OMS + composición</div>
            </div>
            <Badge tone={ns.tone} dot={false}>{lang==="es"?ns.bmiBand.es:ns.bmiBand.en}</Badge>
          </div>

          {/* metabolism summary */}
          <div className="grid cols-4" style={{ gap:10, marginBottom:22 }}>
            {[[lang==="es"?"Metabolismo basal":"Basal metabolism",`${Math.round(bmrK)} kcal`,B.list.find(x=>x.key===(age>=16?B.recommendedAthlete:B.recommended)).author.split(" ")[0]],
              [lang==="es"?"Factor actividad":"Activity factor",`×${act.factor}`,lang==="es"?act.es:act.en],
              [lang==="es"?"Gasto total (GET)":"Total expenditure",`${Math.round(tdeeK)} kcal`,lang==="es"?"basal × factor":"basal × factor"],
              [lang==="es"?"Masa libre de grasa":"Fat-free mass",`${f(ffm)} kg`,lang==="es"?"Kerr":"Kerr"]].map((kv,i)=>(
              <div key={i} style={{ border:"1px solid var(--line)", borderRadius:10, padding:"11px 13px" }}>
                <div className="k" style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:".13em", textTransform:"uppercase", color:"var(--text-faint)" }}>{kv[0]}</div>
                <div className="num" style={{ fontSize:17, marginTop:4 }}>{kv[1]}</div>
                <div style={{ fontSize:9.5, color:"var(--text-faint)", marginTop:2 }}>{kv[2]}</div>
              </div>
            ))}
          </div>

          {/* nutrition plan + supplementation summary */}
          <div className="grid cols-2" style={{ gap:16, marginBottom:22 }}>
            <div style={{ border:"1px solid var(--line)", borderRadius:12, padding:"14px 16px" }}>
              <h4 style={{ marginBottom:10, fontSize:13 }}>{lang==="es"?"Plan nutricional · resumen":"Nutrition plan · summary"}</h4>
              <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:10 }}>
                <span className="num" style={{ fontSize:24, color:"var(--accent)" }}>{Math.round(tdeeK)}</span>
                <span style={{ fontSize:11.5, color:"var(--text-faint)" }}>kcal/{lang==="es"?"día (mantenimiento)":"day (maintenance)"}</span>
              </div>
              <table className="data" style={{ fontSize:12 }}><tbody>
                <tr><td>{lang==="es"?"Proteína":"Protein"}</td><td className="n">{Math.round(macP.pro.g)} g</td><td className="n">{macP.pro.perKg.toFixed(1)} g/kg</td></tr>
                <tr><td>{lang==="es"?"Carbohidrato":"Carbohydrate"}</td><td className="n">{Math.round(macP.cho.g)} g</td><td className="n">{macP.cho.perKg.toFixed(1)} g/kg</td></tr>
                <tr><td>{lang==="es"?"Grasa":"Fat"}</td><td className="n">{Math.round(macP.fat.g)} g</td><td className="n">{macP.fat.perKg.toFixed(1)} g/kg</td></tr>
              </tbody></table>
            </div>
            <div style={{ border:"1px solid var(--line)", borderRadius:12, padding:"14px 16px" }}>
              <h4 style={{ marginBottom:10, fontSize:13 }}>{lang==="es"?"Suplementación · por kg":"Supplementation · per kg"}</h4>
              <table className="data" style={{ fontSize:12 }}><tbody>
                {suppList.map(s => (
                  <tr key={s.key}><td>{lang==="es"?s.es:s.en}</td><td className="n">{s.dose} {s.unit.split(" ")[0]}</td></tr>
                ))}
              </tbody></table>
            </div>
          </div>

          {/* skinfold sums + classification */}
          <div className="grid cols-3" style={{ gap:10, marginBottom:22 }}>
            {sums.map(s => (
              <div key={s.key} style={{ border:"1px solid var(--line)", borderRadius:10, padding:"11px 13px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div className="k" style={{ fontFamily:"var(--font-mono)", fontSize:9.5, letterSpacing:".12em", textTransform:"uppercase", color:"var(--text-faint)" }}>{t("sum"+s.key.slice(1))}</div>
                  <div className="num" style={{ fontSize:18, marginTop:3 }}>{f(s.sum)}<span style={{ fontSize:10, color:"var(--text-faint)" }}> mm</span></div>
                  <div style={{ fontSize:9.5, color:"var(--text-faint)", marginTop:2 }}>{lang==="es"?s.sites_es:s.sites_en}</div>
                </div>
                <Badge tone={s.tone} dot={false}>{lang==="es"?s.es:s.en}</Badge>
              </div>
            ))}
          </div>

          <div className="grid" style={{ gridTemplateColumns:"1fr 300px", gap:24, marginBottom:22 }}>
            <div>
              <h4 style={{ marginBottom:10, fontSize:13 }}>{t("fractionation")} · Kerr 1988</h4>
              <div className="stackbar" style={{ marginBottom:12 }}>{FR.map(([k,c])=><div key={k} style={{ flexGrow: fr.tissues[k].pctStruct, background:c }} />)}</div>
              <table className="data" style={{ fontSize:12 }}>
                <tbody>
                  {FR.map(([k,c])=>(
                    <tr key={k}><td><span style={{display:"inline-block",width:9,height:9,borderRadius:2,background:c,marginRight:8}}/>{t(k)}</td>
                    <td className="n">{f(fr.tissues[k].kg)} kg</td><td className="n">{f(fr.tissues[k].pctMeasured)}%</td></tr>
                  ))}
                  <tr><td style={{fontWeight:600}}>{t("correction")}</td><td className="n" colSpan="2">×{f(fr.correction,3)} · {t("residual_w")} {fr.residual>0?"+":""}{f(fr.residual)} kg</td></tr>
                </tbody>
              </table>
            </div>
            <div>
              <h4 style={{ marginBottom:6, fontSize:13 }}>{t("soma_title")} · {catName}</h4>
              <SomatoChart soma={soma} lang={lang} size={260} />
            </div>
          </div>

          {/* longitudinal evolution — high-quality area charts */}
          {hasHistory && (
            <div style={{ marginBottom:22 }}>
              <div className="report-section-title">{lang==="es"?"Evolución longitudinal":"Longitudinal evolution"} · {evs.length} {lang==="es"?"evaluaciones":"assessments"}</div>
              <div className="grid cols-2" style={{ gap:14 }}>
                <div className="report-chart">
                  <h5>{lang==="es"?"Peso y masa grasa":"Weight & body fat"}</h5>
                  <div className="lg"><span><i style={{background:"#9aa7ba"}} />{lang==="es"?"Peso (kg)":"Weight (kg)"}</span><span><i style={{background:"var(--accent)"}} />{lang==="es"?"Grasa (%)":"Fat (%)"}</span></div>
                  <AreaChart labels={histLabels} series={[{name:"w",color:"#9aa7ba",data:hist.map(h=>h.weight)},{name:"f",color:"var(--accent)",data:hist.map(h=>h.fat)}]} />
                </div>
                <div className="report-chart">
                  <h5>{lang==="es"?"Masa muscular y adiposa":"Muscle & adipose mass"}</h5>
                  <div className="lg"><span><i style={{background:"var(--fr-muscle)"}} />{lang==="es"?"Muscular (kg)":"Muscle (kg)"}</span><span><i style={{background:"var(--fr-adipose)"}} />{lang==="es"?"Adiposa (kg)":"Adipose (kg)"}</span></div>
                  <AreaChart labels={histLabels} series={[{name:"mu",color:"var(--fr-muscle)",data:hist.map(h=>h.muscle)},{name:"ad",color:"var(--fr-adipose)",data:hist.map(h=>h.adipose)}]} />
                </div>
              </div>
            </div>
          )}

          {/* fat + muscle equations */}
          <div className="grid cols-2" style={{ marginBottom:22 }}>
            <div>
              <h4 style={{ marginBottom:10, fontSize:13 }}>{t("bodyfat_eq")}</h4>
              <table className="data" style={{ fontSize:12 }}><tbody>
                {bf.list.map(x=><tr key={x.key}><td>{x.author.split("→")[0].split("(")[0].trim()}</td><td className="n">{f(x.pct)}%</td><td className="n">{f(x.fatKg)} kg</td></tr>)}
              </tbody></table>
            </div>
            <div>
              <h4 style={{ marginBottom:10, fontSize:13 }}>{t("muscle_eq")}</h4>
              <table className="data" style={{ fontSize:12 }}><tbody>
                {mm.list.map(x=><tr key={x.key}><td>{x.author}</td><td className="n">{f(x.kg)} kg</td><td className="n">{f(x.pct)}%</td></tr>)}
              </tbody></table>
            </div>
          </div>

          {/* indices */}
          <h4 style={{ marginBottom:10, fontSize:13 }}>{t("indices")}</h4>
          <div className="grid cols-4" style={{ gap:10 }}>
            {idx.slice(0,12).map(ix=>(
              <div key={ix.k} style={{ border:"1px solid var(--line)", borderRadius:8, padding:"9px 11px" }}>
                <div style={{ fontSize:10, color:"var(--text-faint)" }}>{lang==="es"?ix.es:ix.en}</div>
                <div className="num" style={{ fontSize:15 }}>{ix.v.toFixed(ix.dec||1)}<span style={{fontSize:9,color:"var(--text-faint)"}}> {ix.u}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-foot">
          <span>Body Composition · Data Science Analytics</span>
          <span>{lang==="es"?"Evaluador":"Evaluator"}: {subject.evaluator} · {subject.assessedOn}</span>
        </div>
      </div>
    </div>
  );
}
window.ReportScreen = ReportScreen;
