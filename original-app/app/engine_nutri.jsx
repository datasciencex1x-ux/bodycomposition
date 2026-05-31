/* engine_nutri.jsx — augments window.BC_ENGINE with metabolism, nutrition,
   supplementation, performance profiling and the full Phantom Z profile. */
(function () {
  const E = window.BC_ENGINE, D = window.BC_DATA, N = window.BC_NUTRI, P = window.BC_PERF;
  const r = (x, n = 1) => Math.round(x * 10 ** n) / 10 ** n;

  /* ---------- Basal metabolic rate (several equations) ---------- */
  function bmr(m, sex, age, ffmKg) {
    const W = m.weight, H = m.height, A = age, male = sex === "male";
    const cunningham = 500 + 22 * ffmKg;
    const katch = 370 + 21.6 * ffmKg;

    // -------- pediatric / adolescent (< 18 y) --------
    if (age < 18) {
      let scho;
      if (male) scho = age < 3 ? 59.5 * W - 30.4 : age < 10 ? 22.7 * W + 505 : 17.7 * W + 658;
      else      scho = age < 3 ? 58.3 * W - 31.1 : age < 10 ? 20.3 * W + 486 : 13.4 * W + 693;
      let fao;
      if (male) fao = age < 3 ? 60.9 * W - 54 : age < 10 ? 22.7 * W + 495 : 17.5 * W + 651;
      else      fao = age < 3 ? 61.0 * W - 51 : age < 10 ? 22.5 * W + 499 : 12.2 * W + 746;
      let henry;
      if (male) henry = age < 3 ? 61.0 * W - 33.7 : age < 10 ? 23.3 * W + 514 : 18.4 * W + 581;
      else      henry = age < 3 ? 58.9 * W - 23.1 : age < 10 ? 20.1 * W + 507 : 11.1 * W + 761;
      const plist = [
        { key:"schofield", author:"Schofield 1985", kcal:scho, rec:true, pop:"Pediátrico · OMS",
          formula:`TMB pediátrica por banda edad/sexo (peso)\n  ${male?"♂":"♀"} ${age<3?"<3":age<10?"3–10":"10–18"} a → ${r(scho,0)} kcal` },
        { key:"faowho", author:"FAO/WHO/UNU 1985", kcal:fao, pop:"Pediátrico · referencia",
          formula:`TMB = coef·peso + const (banda edad/sexo)\n  peso ${r(W,1)} kg → ${r(fao,0)} kcal` },
        { key:"henry", author:"Henry / Oxford 2005", kcal:henry, pop:"Pediátrico · actualizada",
          formula:`Ecuaciones de Oxford (Henry) por banda edad/sexo (peso).` },
        { key:"cunningham", author:"Cunningham 1980", kcal:cunningham, recAthlete:true, pop:"Vía MLG",
          formula:`TMB = 500 + 22·MLG\n  MLG = ${r(ffmKg,1)} kg → ${r(cunningham,0)} kcal` },
      ];
      return { list: plist, recommended: "schofield", recommendedAthlete: "schofield", pediatric: true };
    }

    // -------- adult (≥ 18 y) --------
    const mifflin = 10 * W + 6.25 * H - 5 * A + (male ? 5 : -161);
    const harris = male
      ? 88.362 + 13.397 * W + 4.799 * H - 5.677 * A
      : 447.593 + 9.247 * W + 3.098 * H - 4.330 * A;
    const list = [
      { key:"mifflin",   author:"Mifflin-St Jeor 1990", kcal:mifflin,    rec:true,  pop:"General · validada",
        formula:`TMB = 10·peso + 6.25·talla − 5·edad ${male?"+ 5":"− 161"}\n  = 10·${r(W,1)} + 6.25·${H} − 5·${r(A,0)} ${male?"+5":"−161"}` },
      { key:"harris",    author:"Harris-Benedict 1984", kcal:harris,     pop:"General · revisada Roza",
        formula:male
          ? `TMB = 88.362 + 13.397·peso + 4.799·talla − 5.677·edad`
          : `TMB = 447.593 + 9.247·peso + 3.098·talla − 4.330·edad` },
      { key:"cunningham",author:"Cunningham 1980", kcal:cunningham, recAthlete:true, pop:"Deportistas · vía MLG",
        formula:`TMB = 500 + 22·MLG\n  MLG = ${r(ffmKg,1)} kg → ${r(cunningham,0)} kcal` },
      { key:"katch",     author:"Katch-McArdle", kcal:katch, pop:"Deportistas · vía MLG",
        formula:`TMB = 370 + 21.6·MLG\n  MLG = ${r(ffmKg,1)} kg` },
    ];
    return { list, recommended: "mifflin", recommendedAthlete: "cunningham", pediatric: false };
  }

  /* ---------- TDEE + macros ---------- */
  function tdee(bmrKcal, factor) { return bmrKcal * factor; }

  function macros(targetKcal, weightKg, split) {
    // split: [pro, cho, fat] fraction of energy
    let proKcal = targetKcal * split[0];
    // enforce protein floor of 1.8 g/kg for athletes
    const proFloorG = 1.8 * weightKg;
    let proG = proKcal / 4;
    if (proG < proFloorG) { proG = proFloorG; proKcal = proG * 4; }
    const restKcal = targetKcal - proKcal;
    const choFatRatio = split[1] / (split[1] + split[2]);
    const choKcal = restKcal * choFatRatio;
    const fatKcal = restKcal * (1 - choFatRatio);
    return {
      pro: { g: proG, kcal: proKcal, perKg: proG / weightKg },
      cho: { g: choKcal / 4, kcal: choKcal, perKg: (choKcal / 4) / weightKg },
      fat: { g: fatKcal / 9, kcal: fatKcal, perKg: (fatKcal / 9) / weightKg },
      kcal: targetKcal,
    };
  }

  function mealPlan(targetKcal, mac, nMeals) {
    const tmpl = N.MEAL_TEMPLATES[nMeals] || N.MEAL_TEMPLATES[4];
    return tmpl.map(slot => ({
      es: slot.es, en: slot.en, share: slot.p,
      kcal: targetKcal * slot.p,
      pro: mac.pro.g * slot.p,
      cho: mac.cho.g * slot.p,
      fat: mac.fat.g * slot.p,
    }));
  }

  /* ---------- Nutritional-status diagnosis ---------- */
  function nutritionStatus(bmi, fatPct, sex, age) {
    const band = N.BMI_BANDS.find(b => bmi <= b.max) || N.BMI_BANDS[N.BMI_BANDS.length - 1];
    const fatCls = E.classifyBF(fatPct, sex);
    // refine: athletic/muscular overweight vs adipose
    let refine_es = "", refine_en = "";
    if (bmi >= 25 && (fatCls.tone === "good" || fatCls.tone === "info")) {
      refine_es = "con predominio de masa magra (sobreestimación del IMC)";
      refine_en = "lean-mass dominant (BMI overestimates adiposity)";
    } else if (bmi < 25 && fatCls.tone === "bad") {
      refine_es = "con adiposidad elevada (peso normal, grasa alta)";
      refine_en = "normal-weight obesity (elevated body fat)";
    } else if (fatCls.tone === "good") {
      refine_es = "con composición atlética";
      refine_en = "athletic composition";
    }
    return { bmi, bmiBand: band, fatCls, refine_es, refine_en,
      label_es: band.es + (refine_es ? " · " + refine_es : ""),
      label_en: band.en + (refine_en ? " · " + refine_en : ""),
      tone: band.tone };
  }

  /* ---------- Supplementation dosing per kg ---------- */
  function supplementation(weightKg, goals) {
    return N.SUPPLEMENTS
      .filter(s => !goals || goals.length === 0 || goals.includes(s.cat))
      .map(s => {
        let lo, hi, dose;
        if (s.fixed) { lo = s.fixed[0]; hi = s.fixed[1]; dose = `${lo}–${hi}`; }
        else { lo = r(s.perKg[0] * weightKg, 1); hi = r(s.perKg[1] * weightKg, 1);
          dose = lo === hi ? `${lo}` : `${lo}–${hi}`; }
        return { ...s, doseLo: lo, doseHi: hi, dose };
      });
  }

  /* ---------- Performance profiling vs literature ---------- */
  function perfSportKey(sportKey) {
    if (!sportKey) return "football";
    if (P.PERF_REF[sportKey]) return sportKey;
    const base = sportKey.replace(/_f$/, "").replace(/_m$/, "");
    if (P.PERF_REF[base]) return base;
    if (P.PERF_REF[base + "_m"]) return base + "_m";
    return "football";
  }
  function refFor(sportKey, sex) {
    const ref = P.PERF_REF[sportKey];
    if (!ref) return null;
    if (sex === "female") {
      const out = {}; Object.keys(ref).forEach(k => out[k] = ref[k] * (P.PERF_FEMALE_SCALE[k] || 1));
      return out;
    }
    return ref;
  }
  // signed z where positive == better, accounting for metric direction
  function zMetric(val, ref, mt) {
    const raw = (val - ref) / mt.sd;
    return mt.higher ? raw : -raw;
  }
  function performanceProfile(perf, sex, subjectSportKey) {
    const provided = P.PERF_METRICS.filter(mt => perf[mt.key] != null && perf[mt.key] !== "");
    if (provided.length === 0) return { empty: true };
    const ownKey = perfSportKey(subjectSportKey);
    const ownRef = refFor(ownKey, sex);

    // per-metric z vs own-sport professional reference
    const perMetric = provided.map(mt => {
      const z = zMetric(perf[mt.key], ownRef[mt.key], mt);
      const lvl = P.PERF_LEVELS.find(l => z >= l.min);
      return { ...mt, value: perf[mt.key], ref: ownRef[mt.key], z, level: lvl };
    });
    const meanZ = perMetric.reduce((a, b) => a + b.z, 0) / perMetric.length;
    const levelVsOwn = P.PERF_LEVELS.find(l => meanZ >= l.min);

    // which sport profile do the values most resemble? (shape match by abs deviation)
    const ranking = P.PERF_SPORTS.map(sp => {
      const ref = refFor(sp, sex);
      let d = 0;
      provided.forEach(mt => { d += Math.abs((perf[mt.key] - ref[mt.key]) / mt.sd); });
      const dist = d / provided.length;
      // affinity on a 1–100% scale (100% = perfect profile match)
      const affinity = Math.max(1, Math.min(100, Math.round(100 * Math.exp(-dist))));
      return { sport: sp, dist, affinity, label: P.PERF_SPORT_LABEL[sp] };
    }).sort((a, b) => b.affinity - a.affinity);

    return { empty:false, perMetric, meanZ, levelVsOwn, ranking, ownKey, ownLabel: P.PERF_SPORT_LABEL[ownKey] };
  }

  /* ---------- full Phantom Z profile (every Kerr-model variable) ---------- */
  const PH_GROUPS = [
    { key:"skinfolds", es:"Pliegues", en:"Skinfolds", keys:["tricep","subscapular","bicep","iliacCrest","supraspinale","abdominal","thighSkin","calfSkin"] },
    { key:"girths",    es:"Perímetros", en:"Girths", keys:["armRelaxed","armFlexed","forearm","chestGirth","waist","hip","thighGirth","calfGirth"] },
    { key:"breadths",  es:"Diámetros", en:"Breadths", keys:["biacromial","biiliac","chestAP","humerus","wrist","femur","ankle"] },
  ];
  function labelFor(key) {
    for (const sec of Object.keys(D.SCHEMA)) {
      const f = D.SCHEMA[sec].find(x => x.k === key);
      if (f) return { es: f.es, en: f.en, u: f.u };
    }
    return { es: key, en: key, u: "" };
  }
  function phantomProfile(m) {
    const H = m.height;
    const groups = PH_GROUPS.map(g => ({
      ...g,
      rows: g.keys.filter(k => D.PH[k]).map(k => {
        const p = D.PH[k];
        const z = E.zP(m[k], k, H);
        const lab = labelFor(k);
        return { key:k, es:lab.es, en:lab.en, u:lab.u, value:m[k], P:p.P, s:p.s, d:p.d, z };
      }),
    }));
    const all = groups.flatMap(g => g.rows);
    const weightZ = E.zP(m.weight, "weight", H);
    return { groups, all, weightZ, H };
  }

  Object.assign(window.BC_ENGINE, {
    bmr, tdee, macros, mealPlan, nutritionStatus, supplementation,
    performanceProfile, perfSportKey, refFor, phantomProfile,
  });
})();
