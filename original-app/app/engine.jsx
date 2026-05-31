/* engine.jsx — calculation engine.  Exposes window.BC_ENGINE
   All formulas cite author/year. Units are explicit. */
(function () {
  const D = window.BC_DATA;
  const H0 = D.PHANTOM_H;            // 170.18
  const r = (x, n = 1) => Math.round(x * 10 ** n) / 10 ** n;
  const _n = v => (v === "" || v == null || (typeof v === "number" && isNaN(v))) ? null : +v;
  const _has = (m, ks) => ks.every(k => _n(m[k]) != null);

  /* ---------- decimal age ---------- */
  function ageDecimal(dob, on) {
    const a = new Date(dob), b = new Date(on);
    return (b - a) / (365.25 * 24 * 3600 * 1000);
  }

  /* ---------- Phantom Z-score (Ross & Wilson) ----------
     Z = (1/s) · [ V·(170.18/H)^d − P ]                       */
  function zP(value, key, H) {
    const p = D.PH[key];
    return (1 / p.s) * (value * Math.pow(H0 / H, p.d) - p.P);
  }

  /* ---------- 5-way fractionation (Kerr 1988 / Phantom) ---------- */
  function fractionation(m) {
    const H = m.height;
    const k3 = Math.pow(H / H0, 3);
    const out = {};
    Object.keys(D.TISSUE).forEach(t => {
      const vars = D.TISSUE[t];
      let zs = [];
      vars.forEach(v => {
        if (Array.isArray(v)) {                 // corrected girth [girth, skinfold]
          const [g, sf] = v;
          const corrected = sf ? m[g] - m[sf] / 10 : m[g];
          zs.push((1 / D.PH[g].s) * (corrected * Math.pow(H0 / H, D.PH[g].d) - D.PH[g].P));
        } else {
          zs.push(zP(m[v], v, H));
        }
      });
      const zMean = zs.reduce((a, b) => a + b, 0) / zs.length;
      const pm = D.PH_MASS[t];
      out[t] = { z: zMean, kg: ((zMean * pm.s) + pm.P) * k3 };
    });
    const structured = Object.values(out).reduce((a, b) => a + b.kg, 0);
    const measured = m.weight;
    const correction = measured / structured;
    Object.keys(out).forEach(t => {
      out[t].pctMeasured = out[t].kg / measured * 100;
      out[t].pctStruct = out[t].kg / structured * 100;
      out[t].corrected = out[t].kg * correction;
    });
    return { tissues: out, structured, measured, correction, residual: measured - structured };
  }

  /* ---------- Heath-Carter somatotype ---------- */
  function somatotype(m, sex) {
    const H = m.height;
    const X = (m.tricep + m.subscapular + m.supraspinale) * (H0 / H);
    let endo = -0.7182 + 0.1451 * X - 0.00068 * X * X + 0.0000014 * X * X * X;
    endo = Math.max(0.1, endo);
    const corrArm = m.armFlexed - m.tricep / 10;
    const corrCalf = m.calfGirth - m.calfSkin / 10;
    let meso = (0.858 * m.humerus + 0.601 * m.femur + 0.188 * corrArm + 0.161 * corrCalf)
      - (H * 0.131) + 4.5;
    meso = Math.max(0.1, meso);
    const hwr = H / Math.cbrt(m.weight);
    let ecto;
    if (hwr >= 40.75) ecto = 0.732 * hwr - 28.58;
    else if (hwr >= 38.25) ecto = 0.463 * hwr - 17.63;
    else ecto = 0.1;
    ecto = Math.max(0.1, ecto);

    const sx = ecto - endo;
    const sy = 2 * meso - (endo + ecto);
    return { endo, meso, ecto, X: sx, Y: sy, hwr, category: classifySoma(endo, meso, ecto) };
  }

  function classifySoma(e, m, c) {
    const arr = [["endo", e], ["meso", m], ["ecto", c]].sort((a, b) => b[1] - a[1]);
    const [top, mid, low] = arr;
    if (top[1] - low[1] <= 1.0) return "central";
    const topMid = top[1] - mid[1];
    const pair = top[0] + "|" + mid[0];
    if (topMid <= 0.5) {            // co-dominant pair
      if (pair.includes("meso") && pair.includes("endo")) return "mesoEndo";
      if (pair.includes("meso") && pair.includes("ecto")) return "mesoEcto";
      return "endoEcto";
    }
    const midLow = mid[1] - low[1];
    if (midLow <= 0.5) {            // balanced dominant
      return top[0] === "meso" ? "balMeso" : top[0] === "endo" ? "balEndo" : "balEcto";
    }
    // dominant + clear second  →  "Ymorphic Xmorph"
    const map = {
      "meso|endo": "endoMeso", "meso|ecto": "ectoMeso",
      "endo|meso": "mesoEndo2", "endo|ecto": "ectoEndo",
      "ecto|meso": "mesoEcto2", "ecto|endo": "endoEcto2",
    };
    return map[pair] || "central";
  }

  /* ---------- body fat % equations (skip any equation whose sites are missing) ---------- */
  function bodyFat(m, sex, age) {
    const g = k => _n(m[k]);
    const W = g("weight");
    const dwTab = {
      male:   [[16.99,1.1620,0.0630],[19.99,1.1631,0.0632],[29.99,1.1631,0.0632],[39.99,1.1422,0.0544],[49.99,1.1620,0.0700],[99,1.1715,0.0779]],
      female: [[16.99,1.1549,0.0678],[19.99,1.1599,0.0717],[29.99,1.1423,0.0632],[39.99,1.1333,0.0612],[49.99,1.1339,0.0645],[99,1.1339,0.0691]],
    };
    const list = [];
    let density = null;

    if (_has(m, ["bicep","tricep","subscapular","iliacCrest"])) {
      const s4DW = g("bicep") + g("tricep") + g("subscapular") + g("iliacCrest");
      const logS = Math.log10(s4DW);
      const band = dwTab[sex].find(b => age <= b[0]) || dwTab[sex][dwTab[sex].length - 1];
      density = band[1] - band[2] * logS;
      const siri = (495 / density) - 450;
      const brozek = (4.57 / density - 4.142) * 100;
      list.push({ key: "durnin_siri", author: "Durnin & Womersley 1974 → Siri 1961", pop: sex === "male" ? "Adultos ♂" : "Adultos ♀", pct: siri,
        formula: `D = ${r(band[1],4)} − ${r(band[2],4)}·log₁₀(Σ4)\nΣ4 = bíceps+tríceps+subesc+suprail = ${r(s4DW,1)} mm\n%G = (495 / D) − 450` });
      list.push({ key: "durnin_brozek", author: "Durnin & Womersley 1974 → Brožek 1963", pop: sex === "male" ? "Adultos ♂" : "Adultos ♀", pct: brozek,
        formula: `%G = (4.57 / D − 4.142) · 100\nD = ${r(density,4)} g·cm⁻³` });
    }
    if (_has(m, ["tricep","subscapular","supraspinale","abdominal"])) {
      const faulkner = 0.153 * (g("tricep") + g("subscapular") + g("supraspinale") + g("abdominal")) + 5.783;
      list.push({ key: "faulkner", author: "Faulkner 1968", pop: "General", pct: faulkner,
        formula: `%G = 0.153·(tríceps+subesc+supraesp+abdominal) + 5.783\nΣ4 = ${r(g("tricep")+g("subscapular")+g("supraspinale")+g("abdominal"),1)} mm` });
    }
    if (_has(m, ["tricep","subscapular","supraspinale","abdominal","thighSkin","calfSkin"])) {
      const s6 = g("tricep") + g("subscapular") + g("supraspinale") + g("abdominal") + g("thighSkin") + g("calfSkin");
      const yuhasz = sex === "male" ? 3.64 + 0.097 * s6 : 4.56 + 0.143 * s6;
      list.push({ key: "yuhasz", author: "Yuhasz 1974", pop: sex === "male" ? "Deportistas ♂" : "Deportistas ♀", pct: yuhasz,
        formula: `%G = ${sex==="male"?"3.64 + 0.097":"4.56 + 0.143"}·Σ6\nΣ6 = ${r(s6,1)} mm` });
    }
    if (sex === "male" && _has(m, ["tricep","subscapular","bicep","iliacCrest","abdominal","thighSkin","calfSkin"])) {
      const s7 = g("tricep") + g("subscapular") + g("bicep") + g("iliacCrest") + g("abdominal") + g("thighSkin") + g("calfSkin");
      const withers = (495 / (1.0988 - 0.0004 * s7)) - 450;
      list.push({ key: "withers", author: "Withers et al. 1987", pop: "Deportistas ♂", pct: withers,
        formula: `D = 1.0988 − 0.0004·Σ7\nΣ7 = ${r(s7,1)} mm → %G = (495/D) − 450` });
    }
    if (_has(m, ["tricep","calfSkin"])) {
      const tc = g("tricep") + g("calfSkin");
      const slaughter = sex === "male" ? 0.735 * tc + 1.0 : 0.610 * tc + 5.1;
      list.push({ key: "slaughter", author: "Slaughter et al. 1988", pop: "Niños/adolesc.", pct: slaughter, pediatric: true,
        formula: `%G = ${sex==="male"?"0.735":"0.610"}·(tríceps+pantorrilla) ${sex==="male"?"+ 1.0":"+ 5.1"}\nΣ = ${r(tc,1)} mm` });
    }
    list.forEach(x => { x.fatKg = (W || 0) * x.pct / 100; x.cls = classifyBF(x.pct, sex); });
    // recommend Slaughter for children, otherwise Durnin→Siri; fall back to first available
    const prefer = age < 18 ? ["slaughter","durnin_siri","yuhasz","faulkner"] : ["durnin_siri","yuhasz","faulkner","durnin_brozek","withers","slaughter"];
    const recommended = (prefer.find(k => list.some(x => x.key === k))) || (list[0] && list[0].key) || null;
    const safe = list.find(x => x.key === recommended) || { key:null, pct:0, fatKg:0, author:"—", pop:"—", formula:"", cls: classifyBF(0, sex) };
    return { list, recommended, rec: safe, safe, density, available: list.length > 0 };
  }

  function classifyBF(pct, sex) {
    return D.BF_CLASS[sex].find(c => pct <= c.max) || D.BF_CLASS[sex][D.BF_CLASS[sex].length - 1];
  }

  /* ---------- skinfold sums + classification (orientative kinanthropometric bands) ---------- */
  const SF_BANDS = {
    s4: { male:   [[30,"Muy bajo","Very low","info"],[45,"Atlético","Athletic","good"],[65,"Moderado","Moderate","warn"],[90,"Alto","High","bad"],[1e9,"Muy alto","Very high","bad"]],
          female: [[40,"Muy bajo","Very low","info"],[55,"Atlético","Athletic","good"],[80,"Moderado","Moderate","warn"],[110,"Alto","High","bad"],[1e9,"Muy alto","Very high","bad"]] },
    s6: { male:   [[45,"Muy bajo","Very low","info"],[65,"Atlético","Athletic","good"],[95,"Moderado","Moderate","warn"],[130,"Alto","High","bad"],[1e9,"Muy alto","Very high","bad"]],
          female: [[60,"Muy bajo","Very low","info"],[85,"Atlético","Athletic","good"],[120,"Moderado","Moderate","warn"],[160,"Alto","High","bad"],[1e9,"Muy alto","Very high","bad"]] },
    s8: { male:   [[55,"Muy bajo","Very low","info"],[80,"Atlético","Athletic","good"],[115,"Moderado","Moderate","warn"],[155,"Alto","High","bad"],[1e9,"Muy alto","Very high","bad"]],
          female: [[75,"Muy bajo","Very low","info"],[105,"Atlético","Athletic","good"],[145,"Moderado","Moderate","warn"],[190,"Alto","High","bad"],[1e9,"Muy alto","Very high","bad"]] },
  };
  function skinfoldSums(m, sex) {
    const s4 = m.bicep + m.tricep + m.subscapular + m.iliacCrest;          // Durnin-Womersley 4
    const s6 = m.tricep + m.subscapular + m.supraspinale + m.abdominal + m.thighSkin + m.calfSkin;
    const s8 = s6 + m.bicep + m.iliacCrest;
    const mk = (key, sum, sitesEs, sitesEn) => {
      const b = SF_BANDS[key][sex].find(x => sum <= x[0]);
      return { key, sum, sites_es: sitesEs, sites_en: sitesEn, es: b[1], en: b[2], tone: b[3] };
    };
    return [
      mk("s4", s4, "bíceps · tríceps · subesc · cresta", "biceps · triceps · subscap · iliac"),
      mk("s6", s6, "trí · sub · supraesp · abd · muslo · pant", "tri · sub · supra · abd · thigh · calf"),
      mk("s8", s8, "Σ6 + bíceps + cresta ilíaca", "Σ6 + biceps + iliac crest"),
    ];
  }

  /* ---------- anthropometric indices ---------- */
  function indices(m, sex, fr, fatPct) {
    const Hm = m.height / 100;
    const bmi = m.weight / (Hm * Hm);
    const whr = m.waist / m.hip;
    const whtr = m.waist / m.height;
    const fatKg = m.weight * fatPct / 100;
    const ffm = m.weight - fatKg;
    const fmi = fatKg / (Hm * Hm);
    const ffmi = ffm / (Hm * Hm);
    const cormic = m.sitHeight / m.height * 100;
    const bai = m.hip / Math.pow(Hm, 1.5) - 18;
    const conicity = (m.waist / 100) / (0.109 * Math.sqrt(m.weight / Hm));
    const wwi = m.waist / Math.sqrt(m.weight);
    const rohrer = m.weight / Math.pow(Hm, 3);
    const armSpanIdx = m.armSpan / m.height * 100;                 // relative arm span
    const skelic = (m.height - m.sitHeight) / m.sitHeight * 100;   // Manouvrier skelic index
    const acromIliac = m.biiliac / m.biacromial * 100;            // pelvi-shoulder proportionality
    const statRel = m.height / 170.18 * 100;                       // relative stature (Phantom)
    const smmi = fr.tissues.muscle.kg / (Hm * Hm);                 // skeletal-muscle mass index
    const boneIdx = fr.tissues.bone.kg / (Hm * Hm);                // bone mass index
    const armArea = (m.armRelaxed ** 2) / (4 * Math.PI);
    const amb = ((m.armRelaxed - Math.PI * m.tricep / 10) ** 2) / (4 * Math.PI);
    const agb = armArea - amb;
    const s6 = m.tricep + m.subscapular + m.supraspinale + m.abdominal + m.thighSkin + m.calfSkin;
    const s8 = s6 + m.bicep + m.iliacCrest;
    const moRatio = fr.tissues.muscle.kg / fr.tissues.bone.kg;
    const amRatio = fr.tissues.adipose.kg / fr.tissues.muscle.kg;

    const whoCls = (v) => v < 18.5 ? ["Bajo peso","Underweight","warn"] : v < 25 ? ["Normopeso","Normal","good"] : v < 30 ? ["Sobrepeso","Overweight","warn"] : ["Obesidad","Obesity","bad"];
    const tone = (ok) => ok ? "good" : "warn";

    return [
      { k:"BMI", es:"IMC", en:"BMI", v:bmi, u:"kg/m²", f:"peso / talla²",
        i_es:whoCls(bmi)[0], i_en:whoCls(bmi)[1], tone:whoCls(bmi)[2], ref:"18.5–24.9 (OMS)", cite:"OMS" },
      { k:"WHR", es:"Índice cintura-cadera", en:"Waist-to-hip", v:whr, u:"", f:"cintura / cadera", dec:3,
        i_es: whr < (sex==="male"?0.90:0.80) ? "Riesgo bajo":"Riesgo elevado", i_en: whr < (sex==="male"?0.90:0.80)?"Low risk":"High risk",
        tone: tone(whr < (sex==="male"?0.90:0.80)), ref: sex==="male"?"< 0.90 ♂":"< 0.80 ♀", cite:"OMS" },
      { k:"WHtR", es:"Índice cintura-talla", en:"Waist-to-height", v:whtr, u:"", dec:3, f:"cintura / talla",
        i_es: whtr < 0.5 ? "Saludable":"Elevado", i_en: whtr < 0.5?"Healthy":"Elevated", tone:tone(whtr<0.5), ref:"< 0.50", cite:"Ashwell" },
      { k:"FMI", es:"Índice de masa grasa", en:"Fat mass index", v:fmi, u:"kg/m²", f:"masa grasa / talla²",
        i_es: fmi < (sex==="male"?6:9)?"Bajo/atlético":"Normal", i_en: fmi<(sex==="male"?6:9)?"Low/athletic":"Normal", tone:"good", ref: sex==="male"?"3–6 ♂":"5–9 ♀", cite:"Kelly 2009" },
      { k:"FFMI", es:"Índice masa libre de grasa", en:"Fat-free mass index", v:ffmi, u:"kg/m²", f:"(peso − grasa) / talla²",
        i_es: ffmi >= 20 ? "Muscular":"Normal", i_en: ffmi>=20?"Muscular":"Normal", tone:"good", ref: sex==="male"?"18–22 ♂":"15–18 ♀", cite:"VanItallie" },
      { k:"CI", es:"Índice de conicidad", en:"Conicity index", v:conicity, u:"", dec:3, f:"cintura / (0.109·√(peso/talla))",
        i_es: conicity < 1.25 ? "Bajo riesgo":"Elevado", i_en: conicity<1.25?"Low risk":"Elevated", tone:tone(conicity<1.25), ref:"< 1.25", cite:"Valdez 1991" },
      { k:"BAI", es:"Índice de adiposidad corporal", en:"Body adiposity index", v:bai, u:"%", f:"cadera / talla^1.5 − 18",
        i_es:"Adiposidad", i_en:"Adiposity", tone:"good", ref: sex==="male"?"8–21 ♂":"21–33 ♀", cite:"Bergman 2011" },
      { k:"WWI", es:"Índice cintura ajustado", en:"Weight-adj. waist", v:wwi, u:"cm/√kg", dec:2, f:"cintura / √peso",
        i_es:"Adiposidad central", i_en:"Central adiposity", tone:"good", ref:"≈ 10–11", cite:"Park 2018" },
      { k:"CORMIC", es:"Índice córmico", en:"Cormic index", v:cormic, u:"%", f:"talla sentado / talla × 100",
        i_es: cormic < 52 ? "Braquicórmico":"Metricórmico", i_en: cormic<52?"Short-trunked":"Medium", tone:"info", ref:"51–53", cite:"" },
      { k:"SKELIC", es:"Índice esquélico", en:"Skelic index", v:skelic, u:"%", f:"(talla − talla sentado) / talla sentado × 100",
        i_es: skelic < 85 ? "Braquiesquélico":"Macroesquélico", i_en: skelic<85?"Short-legged":"Long-legged", tone:"info", ref:"≈ 85–90", cite:"Manouvrier 1902" },
      { k:"ARMSPAN", es:"Envergadura relativa", en:"Relative arm span", v:armSpanIdx, u:"%", f:"envergadura / talla × 100",
        i_es: armSpanIdx >= 100 ? "Braquitipo (+)":"Proporcionado", i_en: armSpanIdx>=100?"Long-armed":"Proportionate", tone:"info", ref:"97–103", cite:"" },
      { k:"ESTREL", es:"Estatura relativa (Phantom)", en:"Relative stature (Phantom)", v:statRel, u:"%", f:"talla / 170.18 × 100",
        i_es: statRel >= 103 ? "Alta": statRel < 97 ? "Baja":"Media", i_en: statRel>=103?"Tall": statRel<97?"Short":"Average", tone:"info", ref:"= 100 (ref.)", cite:"Ross & Wilson" },
      { k:"ACROMIL", es:"Índice acromio-ilíaco", en:"Acromio-iliac index", v:acromIliac, u:"%", f:"biiliocrestídeo / biacromial × 100",
        i_es: acromIliac < 70 ? "Hombros amplios":"Pelvis amplia", i_en: acromIliac<70?"Broad shoulders":"Broad pelvis", tone:"info", ref:"♂ 68–72 · ♀ 73–78", cite:"" },
      { k:"SMMI", es:"Índice masa muscular esq.", en:"Skeletal-muscle mass index", v:smmi, u:"kg/m²", f:"masa muscular (Kerr) / talla²",
        i_es: smmi >= 10.5 ? "Muscular":"Normal", i_en: smmi>=10.5?"Muscular":"Normal", tone:"good", ref:"♂ ≥ 10.7 · ♀ ≥ 6.8", cite:"Janssen 2002" },
      { k:"BONEIDX", es:"Índice de masa ósea", en:"Bone mass index", v:boneIdx, u:"kg/m²", f:"masa ósea (Kerr) / talla²",
        i_es:"Robustez esquelética", i_en:"Skeletal robustness", tone:"info", ref:"—", cite:"" },
      { k:"ROHRER", es:"Índice de Rohrer", en:"Rohrer index", v:rohrer, u:"kg/m³", dec:1, f:"peso / talla³",
        i_es:"Robustez", i_en:"Robustness", tone:"info", ref:"11–14", cite:"Rohrer" },
      { k:"AMB", es:"Área muscular del brazo", en:"Arm muscle area", v:amb, u:"cm²", f:"(perím − π·pliegue/10)² / 4π",
        i_es:"Músculo braquial", i_en:"Brachial muscle", tone:"good", ref:"—", cite:"Heymsfield" },
      { k:"AGB", es:"Área grasa del brazo", en:"Arm fat area", v:agb, u:"cm²", f:"área total − AMB",
        i_es:"Grasa braquial", i_en:"Brachial fat", tone:"info", ref:"—", cite:"" },
      { k:"MO", es:"Relación músculo-óseo", en:"Muscle-to-bone", v:moRatio, u:"", dec:2, f:"masa muscular / masa ósea",
        i_es: moRatio >= 4 ? "Alto":"Normal", i_en: moRatio>=4?"High":"Normal", tone:"good", ref:"3.5–5.0", cite:"" },
      { k:"AM", es:"Relación adiposo-muscular", en:"Adipose-to-muscle", v:amRatio, u:"", dec:2, f:"masa adiposa / masa muscular",
        i_es:"Balance tisular", i_en:"Tissue balance", tone:"good", ref:"—", cite:"" },
      { k:"S6", es:"Σ 6 pliegues", en:"Σ 6 skinfolds", v:s6, u:"mm", f:"trí+sub+sup+abd+mus+pan",
        i_es:"Adiposidad subcutánea", i_en:"Subcutaneous", tone:"good", ref:"—", cite:"ISAK" },
      { k:"S8", es:"Σ 8 pliegues", en:"Σ 8 skinfolds", v:s8, u:"mm", f:"Σ6 + bíceps + cresta ilíaca",
        i_es:"Adiposidad subcutánea", i_en:"Subcutaneous", tone:"good", ref:"—", cite:"ISAK" },
    ];
  }

  /* ---------- skeletal muscle mass equations ---------- */
  function muscleMass(m, sex, age, frMuscleKg) {
    const sexM = sex === "male" ? 1 : 0;
    const Hm = m.height / 100, Hc = m.height;
    const g = k => _n(m[k]);
    const W = g("weight");
    const list = [
      { key:"kerr", author:"Kerr 1988", pop:"6–77 a · Phantom", kg: frMuscleKg,
        formula:"Componente muscular del fraccionamiento de 5 masas (Phantom Z)." },
    ];
    const limbsOk = _has(m, ["armRelaxed","tricep","thighGirth","thighSkin","calfGirth","calfSkin","height"]);
    let CAG, CTG, CCG;
    if (limbsOk) {
      CAG = g("armRelaxed") - Math.PI * g("tricep") / 10;
      CTG = g("thighGirth") - Math.PI * g("thighSkin") / 10;
      CCG = g("calfGirth") - Math.PI * g("calfSkin") / 10;
      const lee = Hm * (0.00744 * CAG ** 2 + 0.00088 * CTG ** 2 + 0.00441 * CCG ** 2) + 2.4 * sexM - 0.048 * age + 7.8;
      list.push({ key:"lee", author:"Lee et al. 2000", pop:"Adultos · DXA", kg: lee, rec: age>=18,
        formula:`MME = talla·(0.00744·PBc² + 0.00088·PMc² + 0.00441·PPc²)\n  + 2.4·sexo − 0.048·edad + etnia + 7.8\nPBc ${r(CAG,1)} · PMc ${r(CTG,1)} · PPc ${r(CCG,1)} cm` });
      if (sex === "male" && _has(m, ["forearm"])) {
        const martin = (Hc * (0.0553 * CTG ** 2 + 0.0987 * g("forearm") ** 2 + 0.0331 * CCG ** 2) - 2445) / 1000;
        list.push({ key:"martin", author:"Martin et al. 1990", pop:"Adultos ♂ · cadáver", kg: martin, maleOnly:true,
          formula:`MM(g) = talla·(0.0553·PMc² + 0.0987·antebrazo² + 0.0331·PPc²) − 2445` });
      }
      if (_has(m, ["forearm"])) {
        const meanCorr = (CAG + g("forearm") + CTG + CCG) / 4;
        const rad = meanCorr / (2 * Math.PI);
        const matiegka = Hc * rad * rad * 6.5 / 1000;
        list.push({ key:"matiegka", author:"Matiegka 1921", pop:"General", kg: matiegka,
          formula:`MM = talla·r²·6.5 / 1000\nr = (Σ perím. corregidos /4) / 2π = ${r(rad,2)} cm` });
      }
    }
    list.forEach(x => { x.pct = W ? x.kg / W * 100 : 0; });
    const recommended = (age >= 18 && list.some(x => x.key === "lee")) ? "lee" : "kerr";
    return { list, recommended };
  }

  function sad(a, b) {
    return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
  }
  function somaToXY(s) {
    return { x: s[2] - s[0], y: 2*s[1] - (s[0]+s[2]) };
  }

  window.BC_ENGINE = { ageDecimal, fractionation, somatotype, bodyFat, classifyBF, skinfoldSums, indices, muscleMass, sad, somaToXY, zP, r };
})();
