/* screens_diet.jsx — meal planning across 3/4/5/6 meals with personalised macros. */
const { useState: useStateDiet } = React;

const MACRO_COLOR = { pro:"var(--fr-muscle)", cho:"var(--accent)", fat:"var(--fr-residual)" };

function MacroBar({ pro, cho, fat }) {
  const tot = pro*4 + cho*4 + fat*9 || 1;
  const seg = [["pro",pro*4],["cho",cho*4],["fat",fat*9]];
  return (
    <div className="stackbar" style={{ height:8, marginTop:8 }}>
      {seg.map(([k,v]) => <div key={k} style={{ flexGrow:v/tot, background:MACRO_COLOR[k] }} />)}
    </div>
  );
}

function DietScreen({ ctx }) {
  const { t, lang, subject, m, setRoute } = ctx;
  const E = window.BC_ENGINE, N = window.BC_NUTRI;
  const age = E.ageDecimal(subject.dob, subject.assessedOn);
  const fr = E.fractionation(m);
  const bf = E.bodyFat(m, subject.sex, age);
  const rec = bf.rec;
  const ffm = m.weight - rec.fatKg;
  const B = E.bmr(m, subject.sex, age, ffm);
  const actKey = window.BC_PREFS.get("activity", "high");
  const act = N.ACTIVITY.find(a => a.key === actKey);
  const baseBmr = B.list.find(x => x.key === (age>=16?B.recommendedAthlete:B.recommended)).kcal;
  const tdee = E.tdee(baseBmr, act.factor);

  const [nMeals, setNMeals] = useStateDiet(() => window.BC_PREFS.get("nmeals", 4));
  const [presetKey, setPresetKey] = useStateDiet("recomp");
  const [variant, setVariant] = useStateDiet(0);
  const [ai, setAi] = useStateDiet({ state:"idle", text:"" });
  const setMeals = n => { setNMeals(n); window.BC_PREFS.set("nmeals", n); };

  const preset = N.MACRO_PRESETS.find(p => p.key === presetKey);
  const targetKcal = Math.round(tdee * (1 + preset.kcalDelta));
  const mac = E.macros(targetKcal, m.weight, preset.split);
  const plan = E.mealPlan(targetKcal, mac, nMeals);
  const f0 = x => Math.round(x);
  const goalCats = ({ recomp:["build","power"], cut:["health","perf"], bulk:["build","power"], endure:["endur","perf"], main:["health"] })[presetKey] || ["build"];
  const supps = E.supplementation(m.weight, goalCats).slice(0, 6);
  const suppTiming = { protein:lang==="es"?"Repartida en comidas":"Across meals", creatine_load:lang==="es"?"Cualquier hora":"Any time", creatine_maint:lang==="es"?"Post-entreno":"Post-workout", caffeine:lang==="es"?"30–60 min pre":"30–60 min pre", beta:lang==="es"?"Con comidas":"With meals", carb_load:lang==="es"?"Días previos":"Days before", carb_during:lang==="es"?"Intra-esfuerzo":"During effort", hmb:lang==="es"?"Con desayuno":"With breakfast", citrulline:lang==="es"?"60 min pre":"60 min pre", bicarb:lang==="es"?"60–150 min pre":"60–150 min pre", nitrate:lang==="es"?"2–3 h pre":"2–3 h pre", vitd:lang==="es"?"Con comida grasa":"With fat meal" };

  async function runAI() {
    setAi({ state:"loading", text:"" });
    const mealNames = plan.map(p => lang==="es"?p.es:p.en).join(", ");
    const prompt = lang === "es"
      ? `Eres nutricionista deportivo. Propón ejemplos concretos de alimentos para cada comida de este plan, respetando los gramos de macronutrientes. Atleta: ${subject.sport}, ${m.weight} kg, ${rec.pct.toFixed(1)}% graso. Meta: ${preset.es}. Energía diaria: ${targetKcal} kcal (${f0(mac.pro.g)} g proteína, ${f0(mac.cho.g)} g carbohidrato, ${f0(mac.fat.g)} g grasa) repartida en ${nMeals} comidas: ${mealNames}. Para cada comida da 1 ejemplo de menú realista con porciones. Máximo 200 palabras, sin encabezados markdown.`
      : `You are a sports nutritionist. Give concrete food examples for each meal of this plan respecting the macro grams. Athlete: ${subject.sport}, ${m.weight} kg, ${rec.pct.toFixed(1)}% fat. Goal: ${preset.en}. Daily energy: ${targetKcal} kcal (${f0(mac.pro.g)} g protein, ${f0(mac.cho.g)} g carb, ${f0(mac.fat.g)} g fat) over ${nMeals} meals: ${mealNames}. One realistic menu with portions per meal. Max 200 words, no markdown headers.`;
    try {
      const text = await window.claude.complete({ messages:[{ role:"user", content: prompt }] });
      setAi({ state:"done", text });
    } catch (e) { setAi({ state:"error", text: lang==="es"?"No se pudo generar. Reintenta.":"Could not generate. Retry." }); }
  }

  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">{subject.name} · GET {f0(tdee)} kcal · {lang==="es"?act.es:act.en}</div>
        <div className="page-title">{t("diet")}</div>
        <div className="page-desc">{lang==="es"
          ? "Planificación de la dieta en 3, 4, 5 o 6 comidas. Calcula el objetivo energético según la meta y reparte los macronutrientes por comida con recomendaciones personalizadas."
          : "Diet planning across 3, 4, 5 or 6 meals. Sets the energy target by goal and distributes macros per meal with personalised recommendations."}</div>
      </div>

      {/* controls */}
      <div className="grid" style={{ gridTemplateColumns:"1fr 1fr", marginBottom:18 }}>
        <div className="card card-pad">
          <div className="eyebrow" style={{ marginBottom:10 }}>{lang==="es"?"Meta nutricional":"Nutrition goal"}</div>
          <div className="pill-row">
            {N.MACRO_PRESETS.map(p => <button key={p.key} className={"pill"+(p.key===presetKey?" on":"")} onClick={()=>setPresetKey(p.key)}>{lang==="es"?p.es:p.en}</button>)}
          </div>
          <div className="divider" />
          <div className="eyebrow" style={{ marginBottom:10 }}>{lang==="es"?"Número de comidas":"Number of meals"}</div>
          <div className="seg" style={{ width:"fit-content" }}>
            {[3,4,5,6].map(n => <button key={n} className={n===nMeals?"on":""} onClick={()=>setMeals(n)}>{n}</button>)}
          </div>
          <div className="divider" />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom:10 }}>{lang==="es"?"Variante de menú":"Menu variant"}</div>
              <div className="seg" style={{ width:"fit-content" }}>
                {[0,1,2].map(v => <button key={v} className={v===variant?"on":""} onClick={()=>setVariant(v)}>{["A","B","C"][v]}</button>)}
              </div>
            </div>
            <button className="btn ghost" onClick={()=>setVariant(v=>(v+1)%3)}><Icon n="spark" s={14} /> {lang==="es"?"Otro menú":"Shuffle"}</button>
          </div>
        </div>

        <div className="card card-pad">
          <div className="eyebrow">{lang==="es"?"Objetivo diario":"Daily target"}</div>
          <div style={{ display:"flex", alignItems:"baseline", gap:8, margin:"8px 0 4px" }}>
            <span className="num" style={{ fontSize:38, color:"var(--accent)" }}>{targetKcal}</span>
            <span style={{ color:"var(--text-dim)" }}>kcal · {preset.kcalDelta>0?"+":""}{Math.round(preset.kcalDelta*100)}% {lang==="es"?"vs GET":"vs TDEE"}</span>
          </div>
          <MacroBar pro={mac.pro.g} cho={mac.cho.g} fat={mac.fat.g} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:14 }}>
            {[["pro",mac.pro,lang==="es"?"Proteína":"Protein"],["cho",mac.cho,lang==="es"?"Carbohidrato":"Carb"],["fat",mac.fat,lang==="es"?"Grasa":"Fat"]].map(([k,mm,label])=>(
              <div key={k} style={{ borderLeft:"3px solid "+MACRO_COLOR[k], paddingLeft:10 }}>
                <div className="num" style={{ fontSize:21 }}>{f0(mm.g)}<span style={{fontSize:10,color:"var(--text-faint)"}}> g</span></div>
                <div style={{ fontSize:11, color:"var(--text-dim)" }}>{label}</div>
                <div className="mono" style={{ fontSize:10, color:"var(--text-faint)" }}>{mm.perKg.toFixed(1)} g/kg · {f0(mm.kcal)} kcal</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* meal cards */}
      <div className="grid" style={{ gridTemplateColumns:`repeat(${nMeals<=4?nMeals:3}, 1fr)`, marginBottom:18 }}>
        {plan.map((meal, i) => {
          const det3 = M => M[0][0]*(M[1][1]*M[2][2]-M[1][2]*M[2][1]) - M[0][1]*(M[1][0]*M[2][2]-M[1][2]*M[2][0]) + M[0][2]*(M[1][0]*M[2][1]-M[1][1]*M[2][0]);
          const col = it => [it.p/100, it.c/100, it.f/100];
          const vegItem = N.FOODS.veg.items[(i + variant) % N.FOODS.veg.items.length];
          const vegG = 110, vv = col(vegItem);
          const solve = (pi, ci, fi) => {
            const tgt = [meal.pro - vv[0]*vegG, meal.cho - vv[1]*vegG, meal.fat - vv[2]*vegG];
            const A = col(pi), B = col(ci), C = col(fi);
            const M = [[A[0],B[0],C[0]],[A[1],B[1],C[1]],[A[2],B[2],C[2]]];
            const det = det3(M); if (Math.abs(det) < 1e-6) return null;
            const repl = (Mx, c, t) => Mx.map((row, ri) => row.map((val, ci2) => ci2===c ? t[ri] : val));
            return [det3(repl(M,0,tgt))/det, det3(repl(M,1,tgt))/det, det3(repl(M,2,tgt))/det];
          };
          // search a feasible food combo (exact macro + kcal match, sane portions)
          const PL = N.FOODS.pro.items, CL = N.FOODS.cho.items, FL = N.FOODS.fat.items;
          let best = null;
          for (let a = 0; a < PL.length && !best; a++) for (let b = 0; b < CL.length && !best; b++) for (let c = 0; c < FL.length && !best; c++) {
            const pi = PL[(i+variant+a)%PL.length], ci = CL[(i+variant+b)%CL.length], fi = FL[(i+variant+c)%FL.length];
            const g = solve(pi, ci, fi);
            if (g && g.every(x => x >= 8 && x <= 540)) best = { pi, ci, fi, g };
          }
          let foods, grams;
          if (best) {
            foods = [{ r:"pro", fdb:N.FOODS.pro, item:best.pi }, { r:"cho", fdb:N.FOODS.cho, item:best.ci }, { r:"fat", fdb:N.FOODS.fat, item:best.fi }, { r:"veg", fdb:N.FOODS.veg, item:vegItem }];
            grams = [Math.round(best.g[0]/5)*5, Math.round(best.g[1]/5)*5, Math.round(best.g[2]/5)*5, vegG];
          } else {
            // fallback: primary-macro grams scaled so total kcal == meal kcal
            const pi = PL[(i+variant)%PL.length], ci = CL[(i+variant)%CL.length], fi = FL[(i+variant)%FL.length];
            foods = [{ r:"pro", fdb:N.FOODS.pro, item:pi }, { r:"cho", fdb:N.FOODS.cho, item:ci }, { r:"fat", fdb:N.FOODS.fat, item:fi }, { r:"veg", fdb:N.FOODS.veg, item:vegItem }];
            let raw = [pi.p?meal.pro/(pi.p/100):0, ci.c?meal.cho/(ci.c/100):0, fi.f?meal.fat/(fi.f/100):0, vegG];
            const kc = foods.reduce((s,fo,idx)=>s+raw[idx]*(fo.item.p*4+fo.item.c*4+fo.item.f*9)/100,0);
            const sc = kc>0 ? meal.kcal/kc : 1;
            grams = raw.map(x=>Math.max(5,Math.round(x*sc/5)*5));
          }
          const kcalOf = (it, grm) => grm*(it.p*4 + it.c*4 + it.f*9)/100;
          const foodKcal = foods.map((fo, idx) => kcalOf(fo.item, grams[idx]));
          const foodTotal = foodKcal.reduce((a,b)=>a+b,0);
          const realPro = foods.reduce((s,fo,idx)=>s+grams[idx]*fo.item.p/100,0);
          const realCho = foods.reduce((s,fo,idx)=>s+grams[idx]*fo.item.c/100,0);
          const realFat = foods.reduce((s,fo,idx)=>s+grams[idx]*fo.item.f/100,0);
          return (
            <div key={i} className="card card-pad">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <div style={{ fontWeight:600, fontFamily:"var(--font-display)" }}>{lang==="es"?meal.es:meal.en}</div>
                <span className="mono" style={{ fontSize:11, color:"var(--text-faint)" }}>{Math.round(meal.share*100)}%</span>
              </div>
              <div className="num" style={{ fontSize:24, color:"var(--accent)" }}>{f0(foodTotal)}<span style={{fontSize:11,color:"var(--text-faint)"}}> kcal</span></div>
              <MacroBar pro={realPro} cho={realCho} fat={realFat} />
              <div style={{ display:"flex", gap:10, marginTop:8, fontSize:11 }}>
                <span className="mono" style={{ color:MACRO_COLOR.pro }}>P {f0(realPro)}g</span>
                <span className="mono" style={{ color:MACRO_COLOR.cho }}>C {f0(realCho)}g</span>
                <span className="mono" style={{ color:MACRO_COLOR.fat }}>G {f0(realFat)}g</span>
              </div>
              <div className="divider" style={{ margin:"12px 0" }} />
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {foods.map((fo, idx) => (
                  <div key={fo.r} style={{ display:"flex", alignItems:"center", gap:8, fontSize:11.5 }}>
                    <span style={{ width:6, height:6, borderRadius:2, background:MACRO_COLOR[fo.r]||"var(--fr-skin)", flex:"none" }} />
                    <span style={{ color:"var(--text-faint)", width:54, fontSize:10 }}>{lang==="es"?fo.fdb.es:fo.fdb.en}</span>
                    <span style={{ flex:1 }}>{lang==="es"?fo.item.es:fo.item.en}</span>
                    <span className="mono" style={{ fontSize:11, color:"var(--text)" }}>{grams[idx]} g</span>
                    <span className="mono" style={{ fontSize:9.5, color:"var(--text-faint)", width:44, textAlign:"right" }}>{f0(foodKcal[idx])} kcal</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, paddingTop:7, borderTop:"1px dashed var(--line)", fontSize:10.5, color:"var(--text-faint)" }}>
                  <span>{lang==="es"?"Total alimentos":"Food total"}</span>
                  <span className="mono">{f0(foodTotal)} kcal</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* integrated supplementation */}
      <div className="card" style={{ marginBottom:18 }}>
        <div className="card-head">
          <div><h3>{lang==="es"?"Suplementación integrada al plan":"Supplementation integrated in the plan"}</h3><div className="sub">{lang==="es"?"Según la meta · dosis por kg · timing":"By goal · per-kg dose · timing"}</div></div>
          <div className="right"><button className="btn ghost" onClick={()=>setRoute("supplements")}><Icon n="pill" s={15} /> {lang==="es"?"Ver detalle":"Details"}</button></div>
        </div>
        <div className="card-pad">
          <div className="grid cols-3">
            {supps.map(s => (
              <div key={s.key} style={{ border:"1px solid var(--line)", borderRadius:10, padding:"11px 13px", display:"flex", alignItems:"center", gap:11 }}>
                <div style={{ width:34, height:34, borderRadius:9, flex:"none", display:"grid", placeItems:"center", background:"var(--surface-2)", color:"var(--fr-bone)" }}><Icon n="pill" s={17} /></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{lang==="es"?s.es:s.en}</div>
                  <div style={{ fontSize:10.5, color:"var(--text-faint)" }}>{suppTiming[s.key] || "—"}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div className="num" style={{ fontSize:14, color:"var(--accent)" }}>{s.dose}</div>
                  <div style={{ fontSize:9, color:"var(--text-faint)" }}>{s.unit.split(" ")[0]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI personalised menu */}
      <div className="card">
        <div className="card-head">
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <BCLogo size={30} className="" />
            <div><h3>{lang==="es"?"Menú personalizado con IA":"AI personalised menu"}</h3><div className="sub">{lang==="es"?"Ejemplos de alimentos según los macros":"Food examples matching the macros"}</div></div>
          </div>
          <div className="right"><button className="btn primary" onClick={runAI} disabled={ai.state==="loading"}><Icon n="spark" s={15} /> {ai.state==="loading"?(lang==="es"?"Generando…":"Generating…"):(lang==="es"?"Generar menú":"Generate menu")}</button></div>
        </div>
        <div className="card-pad">
          {ai.state==="idle" && <p style={{ fontSize:12.5, color:"var(--text-faint)" }}>{lang==="es"?"Pulsa «Generar menú» para obtener ejemplos concretos de alimentos por comida, ajustados a los gramos de proteína, carbohidrato y grasa.":"Press “Generate menu” for concrete food examples per meal matching the macro grams."}</p>}
          {ai.state==="loading" && <div className="ai-skel"><div /><div /><div /><div /><div /></div>}
          {(ai.state==="done"||ai.state==="error") && <div style={{ fontSize:12.5, lineHeight:1.7, whiteSpace:"pre-wrap", columns: ai.state==="done"?"2":"1", color: ai.state==="error"?"var(--bad)":"var(--text)" }}>{ai.text}</div>}
        </div>
      </div>
    </div>
  );
}
window.DietScreen = DietScreen;
