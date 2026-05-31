/* data_nutri.jsx — nutrition, supplementation, performance & wearable references.
   Exposes window.BC_NUTRI and window.BC_PERF. Values cite literature consensus. */
(function () {

  /* ---------- Physical-activity factors (PAL) ---------- */
  const ACTIVITY = [
    { key:"sed",   factor:1.20, es:"Sedentario",        en:"Sedentary",        desc_es:"Sin ejercicio · trabajo de oficina",            desc_en:"No exercise · desk work" },
    { key:"light", factor:1.375,es:"Ligero",            en:"Light",            desc_es:"1–3 sesiones/sem · técnica suave",              desc_en:"1–3 sessions/wk · light" },
    { key:"mod",   factor:1.55, es:"Moderado",          en:"Moderate",         desc_es:"3–5 sesiones/sem",                              desc_en:"3–5 sessions/wk" },
    { key:"high",  factor:1.725,es:"Intenso",           en:"Vigorous",         desc_es:"6–7 sesiones/sem · competición",                desc_en:"6–7 sessions/wk · competing" },
    { key:"vhigh", factor:1.90, es:"Muy intenso",       en:"Very vigorous",    desc_es:"Doble sesión diaria",                           desc_en:"Twice-daily training" },
    { key:"elite", factor:2.20, es:"Élite / carga alta",en:"Elite / high load",desc_es:"Pretemporada · alto volumen",                  desc_en:"Pre-season · high volume" },
  ];

  /* Per-session activity METs for the wearable / expenditure estimator */
  const METS = [
    { key:"walk",     es:"Caminar",            en:"Walking",          met:3.5 },
    { key:"run",      es:"Carrera continua",   en:"Continuous run",   met:9.8 },
    { key:"interval", es:"Interválico HIIT",   en:"HIIT intervals",   met:11.0 },
    { key:"strength", es:"Fuerza · pesas",     en:"Resistance",       met:6.0 },
    { key:"football", es:"Fútbol",             en:"Football",         met:8.5 },
    { key:"swim",     es:"Natación",           en:"Swimming",         met:8.3 },
    { key:"cycle",    es:"Ciclismo",           en:"Cycling",          met:7.5 },
    { key:"mobility", es:"Movilidad / técnica",en:"Mobility / skill", met:3.0 },
  ];

  /* ---------- Nutritional-status classification (combines BMI band + %fat) ---------- */
  // BMI bands (OMS) — used as backbone of nutritional diagnosis
  const BMI_BANDS = [
    { max:16.0, es:"Delgadez severa",   en:"Severe thinness",  tone:"bad"  },
    { max:17.0, es:"Delgadez moderada", en:"Moderate thinness",tone:"warn" },
    { max:18.5, es:"Bajo peso",         en:"Underweight",      tone:"warn" },
    { max:25.0, es:"Normopeso",         en:"Normal weight",    tone:"good" },
    { max:30.0, es:"Sobrepeso",         en:"Overweight",       tone:"warn" },
    { max:35.0, es:"Obesidad I",        en:"Obesity I",        tone:"bad"  },
    { max:40.0, es:"Obesidad II",       en:"Obesity II",       tone:"bad"  },
    { max:1e9,  es:"Obesidad III",      en:"Obesity III",      tone:"bad"  },
  ];

  /* ---------- Supplement catalog (per-kg & evidence-based dosing) ---------- */
  // dose per kg body-mass; some are fixed-cap. ISSN / IOC consensus.
  const SUPPLEMENTS = [
    { key:"protein", es:"Proteína total (dieta+suplemento)", en:"Total protein", cat:"build", unit:"g/kg/día",
      perKg:[1.6,2.2], evidence:"A", cite:"ISSN 2017 · Morton 2018",
      goal_es:"Síntesis proteica · recuperación", goal_en:"Muscle protein synthesis · recovery",
      note_es:"Repartir en 4 tomas de 0.4 g/kg. Priorizar leucina ≥2.5 g/toma.", note_en:"Split into 4 doses of 0.4 g/kg." },
    { key:"creatine_load", es:"Creatina monohidrato · carga", en:"Creatine · loading", cat:"power", unit:"g/kg/día × 5–7 d",
      perKg:[0.3,0.3], evidence:"A", cite:"ISSN 2017 · Kreider 2017",
      goal_es:"Fosfágenos · fuerza máxima", goal_en:"Phosphagen system · strength",
      note_es:"Fase de carga 5–7 días, repartida en 4 dosis.", note_en:"5–7 day load split in 4 doses." },
    { key:"creatine_maint", es:"Creatina monohidrato · mantenimiento", en:"Creatine · maintenance", cat:"power", unit:"g/kg/día",
      perKg:[0.03,0.04], evidence:"A", cite:"ISSN 2017",
      goal_es:"Mantener saturación muscular", goal_en:"Maintain saturation",
      note_es:"Alternativa: 3–5 g fijos/día sin carga.", note_en:"Or fixed 3–5 g/day." },
    { key:"caffeine", es:"Cafeína", en:"Caffeine", cat:"perf", unit:"mg/kg pre-ejercicio",
      perKg:[3,6], evidence:"A", cite:"IOC 2018 · Guest 2021",
      goal_es:"Rendimiento · vigilancia", goal_en:"Performance · alertness",
      note_es:"30–60 min antes. Evitar >6 h previas al sueño.", note_en:"30–60 min before exercise." },
    { key:"beta", es:"Beta-alanina", en:"Beta-alanine", cat:"perf", unit:"mg/kg/día",
      perKg:[65,65], evidence:"A", cite:"ISSN 2015 · Trexler 2015",
      goal_es:"Tampón muscular · esfuerzos 1–4 min", goal_en:"Muscle buffering · 1–4 min efforts",
      note_es:"Repartir en dosis de ≤10 mg/kg para evitar parestesia.", note_en:"Split ≤10 mg/kg/dose." },
    { key:"bicarb", es:"Bicarbonato de sodio", en:"Sodium bicarbonate", cat:"perf", unit:"g/kg",
      perKg:[0.2,0.3], evidence:"A", cite:"IOC 2018",
      goal_es:"Tampón extracelular · alta intensidad", goal_en:"Extracellular buffer",
      note_es:"60–150 min antes; vigilar molestias GI.", note_en:"60–150 min before; GI caution." },
    { key:"nitrate", es:"Nitrato (jugo de remolacha)", en:"Nitrate (beetroot)", cat:"perf", unit:"mmol/día",
      perKg:[0,0], fixed:[6,12], evidence:"B", cite:"Jones 2018",
      goal_es:"Economía O₂ · resistencia", goal_en:"O₂ economy · endurance",
      note_es:"≈ 2–3 h antes; fijo 6–12 mmol (no escala con peso).", note_en:"Fixed 6–12 mmol, 2–3 h prior." },
    { key:"carb_load", es:"Carbohidratos · carga", en:"Carbohydrate · loading", cat:"endur", unit:"g/kg/día",
      perKg:[6,10], evidence:"A", cite:"Burke 2011",
      goal_es:"Reservas de glucógeno", goal_en:"Glycogen stores",
      note_es:"8–12 g/kg para eventos >90 min.", note_en:"8–12 g/kg for >90 min events." },
    { key:"carb_during", es:"Carbohidratos · intra-esfuerzo", en:"Carbohydrate · during", cat:"endur", unit:"g/hora",
      perKg:[0,0], fixed:[30,90], evidence:"A", cite:"Jeukendrup 2014",
      goal_es:"Sostén glucémico en eventos largos", goal_en:"Glycaemic support",
      note_es:"30–60 g/h; hasta 90 g/h (glucosa:fructosa 2:1).", note_en:"Up to 90 g/h (2:1 glu:fru)." },
    { key:"hmb", es:"HMB", en:"HMB", cat:"build", unit:"mg/kg/día",
      perKg:[38,38], evidence:"B", cite:"ISSN 2013",
      goal_es:"Anticatabólico · fases de déficit", goal_en:"Anti-catabolic",
      note_es:"≈ 3 g/día; útil en restricción energética.", note_en:"≈3 g/day in energy restriction." },
    { key:"citrulline", es:"Citrulina malato", en:"Citrulline malate", cat:"power", unit:"g/dosis",
      perKg:[0.1,0.14], evidence:"C", cite:"Pérez-Guisado 2010",
      goal_es:"Flujo sanguíneo · volumen de trabajo", goal_en:"Blood flow · work volume",
      note_es:"6–8 g, 60 min antes.", note_en:"6–8 g, 60 min prior." },
    { key:"vitd", es:"Vitamina D₃", en:"Vitamin D₃", cat:"health", unit:"UI/día",
      perKg:[0,0], fixed:[1000,4000], evidence:"B", cite:"Owens 2018",
      goal_es:"Salud ósea · función muscular", goal_en:"Bone & muscle function",
      note_es:"Ajustar a 25(OH)D sérica objetivo 75–100 nmol/L.", note_en:"Target serum 25(OH)D 75–100 nmol/L." },
  ];
  const SUPP_GOALS = [
    { key:"power",  es:"Fuerza / potencia", en:"Strength / power" },
    { key:"endur",  es:"Resistencia",       en:"Endurance" },
    { key:"build",  es:"Hipertrofia",       en:"Hypertrophy" },
    { key:"perf",   es:"Rendimiento agudo", en:"Acute performance" },
    { key:"health", es:"Salud / base",      en:"Health / base" },
  ];

  /* ---------- Meal distribution templates (share of daily energy) ---------- */
  const MEAL_TEMPLATES = {
    3: [ {es:"Desayuno",en:"Breakfast",p:0.30}, {es:"Almuerzo",en:"Lunch",p:0.40}, {es:"Cena",en:"Dinner",p:0.30} ],
    4: [ {es:"Desayuno",en:"Breakfast",p:0.25}, {es:"Almuerzo",en:"Lunch",p:0.35}, {es:"Merienda",en:"Snack",p:0.15}, {es:"Cena",en:"Dinner",p:0.25} ],
    5: [ {es:"Desayuno",en:"Breakfast",p:0.22}, {es:"Media mañana",en:"Mid-morning",p:0.13}, {es:"Almuerzo",en:"Lunch",p:0.30}, {es:"Merienda",en:"Snack",p:0.13}, {es:"Cena",en:"Dinner",p:0.22} ],
    6: [ {es:"Desayuno",en:"Breakfast",p:0.20}, {es:"Media mañana",en:"Mid-morning",p:0.12}, {es:"Almuerzo",en:"Lunch",p:0.26}, {es:"Pre-entreno",en:"Pre-workout",p:0.12}, {es:"Post-entreno",en:"Post-workout",p:0.12}, {es:"Cena",en:"Dinner",p:0.18} ],
  };

  /* Compact food suggestions by macro role — macros per 100 g (p protein, c carb, f fat) */
  const FOODS = {
    pro: { es:"Proteína", en:"Protein", macro:"pro", items:[
      { es:"Pechuga de pollo", en:"Chicken breast", p:31, c:0,  f:3.6 },
      { es:"Huevo entero",     en:"Whole egg",      p:13, c:1,  f:11 },
      { es:"Atún / pescado",   en:"Tuna / fish",    p:26, c:0,  f:1 },
      { es:"Yogur griego",     en:"Greek yoghurt",  p:10, c:4,  f:4 },
      { es:"Carne magra",      en:"Lean beef",      p:27, c:0,  f:10 },
      { es:"Tofu / legumbre",  en:"Tofu / legume",  p:12, c:6,  f:6 },
      { es:"Proteína whey",    en:"Whey protein",   p:80, c:8,  f:6 },
    ] },
    cho: { es:"Carbohidrato", en:"Carbohydrate", macro:"cho", items:[
      { es:"Avena (seca)",        en:"Oats (dry)",       p:13, c:60, f:7 },
      { es:"Arroz integral coc.", en:"Brown rice ckd",   p:3,  c:25, f:1 },
      { es:"Patata / boniato",    en:"Potato / sweet",   p:2,  c:20, f:0.1 },
      { es:"Pasta cocida",        en:"Pasta cooked",     p:5,  c:30, f:1 },
      { es:"Fruta",               en:"Fruit",            p:1,  c:15, f:0.2 },
      { es:"Pan integral",        en:"Wholegrain bread", p:9,  c:43, f:3 },
      { es:"Quinoa cocida",       en:"Quinoa cooked",    p:4,  c:21, f:2 },
    ] },
    fat: { es:"Grasa", en:"Fat", macro:"fat", items:[
      { es:"Aguacate",          en:"Avocado",       p:2,  c:9,  f:15 },
      { es:"Aceite de oliva",   en:"Olive oil",     p:0,  c:0,  f:100 },
      { es:"Frutos secos",      en:"Nuts",          p:20, c:20, f:50 },
      { es:"Semillas",          en:"Seeds",         p:18, c:20, f:45 },
      { es:"Mantequilla maní",  en:"Peanut butter", p:25, c:20, f:50 },
    ] },
    veg: { es:"Vegetales", en:"Vegetables", macro:"veg", items:[
      { es:"Ensalada verde",    en:"Green salad",   p:1, c:3, f:0 },
      { es:"Brócoli",           en:"Broccoli",      p:3, c:7, f:0 },
      { es:"Espinaca",          en:"Spinach",       p:3, c:4, f:0 },
      { es:"Verduras al vapor", en:"Steamed veg",   p:2, c:6, f:0 },
    ] },
  };

  /* Macro split presets per goal (% energy: pro/cho/fat) */
  const MACRO_PRESETS = [
    { key:"recomp",  es:"Recomposición", en:"Recomposition", split:[0.30,0.40,0.30], kcalDelta:0 },
    { key:"cut",     es:"Definición",    en:"Cut",           split:[0.35,0.35,0.30], kcalDelta:-0.18 },
    { key:"bulk",    es:"Volumen",       en:"Bulk",          split:[0.25,0.50,0.25], kcalDelta:0.12 },
    { key:"endure",  es:"Resistencia",   en:"Endurance",     split:[0.20,0.58,0.22], kcalDelta:0.05 },
    { key:"main",    es:"Mantenimiento", en:"Maintenance",   split:[0.25,0.45,0.30], kcalDelta:0 },
  ];

  window.BC_NUTRI = { ACTIVITY, METS, BMI_BANDS, SUPPLEMENTS, SUPP_GOALS, MEAL_TEMPLATES, FOODS, MACRO_PRESETS };

  /* ============================================================
     BC_PERF — physical-condition test norms (professional reference)
     Male professional means; female derived by documented scaling.
     ============================================================ */
  const PERF_METRICS = [
    { key:"vo2",     es:"VO₂máx",              en:"VO₂max",            u:"ml·kg⁻¹·min⁻¹", higher:true,  sd:5.5, group:"aerobic" },
    { key:"cmj",     es:"Salto CMJ",           en:"CMJ",               u:"cm",            higher:true,  sd:4.5, group:"power" },
    { key:"sj",      es:"Salto SJ",            en:"Squat jump (SJ)",   u:"cm",            higher:true,  sd:4.2, group:"power" },
    { key:"abk",     es:"Salto Abalakov (ABK)",en:"Abalakov (ABK)",    u:"cm",            higher:true,  sd:5.0, group:"power" },
    { key:"sprint30",es:"Sprint 30 m",         en:"30 m sprint",       u:"s",             higher:false, sd:0.18,group:"speed" },
    { key:"rsa",     es:"Sprints repetidos · decremento", en:"Repeated-sprint decrement", u:"%", higher:false, sd:1.3, group:"speed" },
    { key:"grip",    es:"Prensión manual",     en:"Handgrip",          u:"kg",            higher:true,  sd:6.5, group:"strength" },
    { key:"squat",   es:"Sentadilla 1RM rel.", en:"Back-squat 1RM rel.",u:"× peso",       higher:true,  sd:0.25,group:"strength" },
    { key:"bench",   es:"Press banca 1RM rel.",en:"Bench-press 1RM rel.",u:"× peso",      higher:true,  sd:0.20,group:"strength" },
  ];

  // professional male reference profile per sport (keys match BC_DATA.SPORTS where possible)
  const PERF_REF = {
    football:   { vo2:58, cmj:38, sj:35, abk:46, sprint30:4.10, rsa:4.0, grip:50, squat:1.8, bench:1.15 },
    sprint:     { vo2:55, cmj:46, sj:43, abk:56, sprint30:3.85, rsa:3.0, grip:55, squat:2.2, bench:1.40 },
    distance:   { vo2:75, cmj:32, sj:30, abk:38, sprint30:4.45, rsa:5.2, grip:45, squat:1.3, bench:0.90 },
    basketball: { vo2:55, cmj:43, sj:39, abk:51, sprint30:4.00, rsa:4.0, grip:52, squat:1.7, bench:1.20 },
    swim:       { vo2:60, cmj:40, sj:36, abk:48, sprint30:4.30, rsa:4.2, grip:55, squat:1.6, bench:1.30 },
    rugby:      { vo2:52, cmj:36, sj:33, abk:44, sprint30:4.00, rsa:4.5, grip:60, squat:2.0, bench:1.50 },
    weightlift: { vo2:45, cmj:50, sj:47, abk:59, sprint30:4.20, rsa:6.0, grip:65, squat:2.6, bench:1.60 },
    cycling:    { vo2:72, cmj:38, sj:35, abk:45, sprint30:4.30, rsa:4.0, grip:48, squat:1.6, bench:1.00 },
    rowing:     { vo2:66, cmj:42, sj:38, abk:50, sprint30:4.20, rsa:4.0, grip:58, squat:1.9, bench:1.25 },
    volley_m:   { vo2:53, cmj:46, sj:41, abk:54, sprint30:4.10, rsa:4.0, grip:50, squat:1.8, bench:1.20 },
    tennis_m:   { vo2:55, cmj:40, sj:36, abk:49, sprint30:4.10, rsa:4.0, grip:52, squat:1.6, bench:1.10 },
  };
  // female scaling factors per metric (applied to the male reference)
  const PERF_FEMALE_SCALE = { vo2:0.86, cmj:0.78, sj:0.78, abk:0.78, sprint30:1.09, rsa:1.05, grip:0.62, squat:0.72, bench:0.65 };

  const PERF_SPORTS = ["football","sprint","distance","basketball","swim","rugby","weightlift","cycling","rowing","volley_m","tennis_m"];
  const PERF_SPORT_LABEL = {
    football:{es:"Fútbol",en:"Football",noun_es:"un futbolista",noun_en:"a footballer"},
    sprint:{es:"Velocista",en:"Sprinter",noun_es:"un velocista",noun_en:"a sprinter"},
    distance:{es:"Fondista",en:"Distance",noun_es:"un fondista",noun_en:"a distance runner"},
    basketball:{es:"Baloncesto",en:"Basketball",noun_es:"un baloncestista",noun_en:"a basketball player"},
    swim:{es:"Natación",en:"Swimming",noun_es:"un nadador",noun_en:"a swimmer"},
    rugby:{es:"Rugby",en:"Rugby",noun_es:"un jugador de rugby",noun_en:"a rugby player"},
    weightlift:{es:"Halterofilia",en:"Weightlifting",noun_es:"un halterófilo",noun_en:"a weightlifter"},
    cycling:{es:"Ciclismo",en:"Cycling",noun_es:"un ciclista",noun_en:"a cyclist"},
    rowing:{es:"Remo",en:"Rowing",noun_es:"un remero",noun_en:"a rower"},
    volley_m:{es:"Vóleibol",en:"Volleyball",noun_es:"un voleibolista",noun_en:"a volleyball player"},
    tennis_m:{es:"Tenis",en:"Tennis",noun_es:"un tenista",noun_en:"a tennis player"},
  };
  // level bands by mean z vs professional reference
  const PERF_LEVELS = [
    { min: 0.75,  es:"Élite / internacional", en:"Elite / international", tone:"good" },
    { min:-0.25,  es:"Profesional",           en:"Professional",          tone:"good" },
    { min:-1.00,  es:"Semi-profesional",      en:"Semi-professional",     tone:"warn" },
    { min:-2.00,  es:"Amateur / formativo",   en:"Amateur / development", tone:"warn" },
    { min:-1e9,   es:"Iniciación",            en:"Beginner",              tone:"bad"  },
  ];

  window.BC_PERF = { PERF_METRICS, PERF_REF, PERF_FEMALE_SCALE, PERF_SPORTS, PERF_SPORT_LABEL, PERF_LEVELS };
})();
