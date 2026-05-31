/* data.jsx — constants, sample athlete, references.  Exposes window.BC_DATA */
(function () {

  /* ---- Phantom reference (Ross & Wilson 1974) : height 170.18 cm ---- */
  const PHANTOM_H = 170.18;

  /* Per-variable Phantom mean (P) and SD (s). Skinfolds mm, girths/breadths cm.
     Sources: Ross & Wilson / Norton & Olds Anthropometrica Phantom specifications. */
  const PH = {
    weight:        { P: 64.58, s: 8.60, d: 3 },
    // skinfolds (mm)
    tricep:        { P: 15.4, s: 4.47, d: 1 },
    subscapular:   { P: 17.2, s: 5.07, d: 1 },
    bicep:         { P: 8.0,  s: 2.00, d: 1 },
    iliacCrest:    { P: 22.4, s: 6.80, d: 1 },
    supraspinale:  { P: 15.4, s: 4.47, d: 1 },
    abdominal:     { P: 25.4, s: 7.78, d: 1 },
    thighSkin:     { P: 27.0, s: 8.33, d: 1 },
    calfSkin:      { P: 16.0, s: 4.67, d: 1 },
    // girths (cm)
    armRelaxed:    { P: 22.05, s: 1.91, d: 1 },
    armFlexed:     { P: 25.13, s: 1.91, d: 1 },
    forearm:       { P: 25.13, s: 1.41, d: 1 },
    chestGirth:    { P: 82.46, s: 4.86, d: 1 },
    waist:         { P: 71.91, s: 4.45, d: 1 },
    hip:           { P: 94.67, s: 5.58, d: 1 },
    thighGirth:    { P: 55.82, s: 4.23, d: 1 },
    calfGirth:     { P: 30.22, s: 1.97, d: 1 },
    // breadths (cm)
    biacromial:    { P: 38.04, s: 1.92, d: 1 },
    biiliac:       { P: 27.92, s: 1.74, d: 1 },
    humerus:       { P: 6.48, s: 0.35, d: 1 },
    femur:         { P: 9.52, s: 0.48, d: 1 },
    wrist:         { P: 5.21, s: 0.28, d: 1 },
    ankle:         { P: 6.68, s: 0.36, d: 1 },
    chestAP:       { P: 17.50, s: 1.38, d: 1 },
  };

  /* Phantom MASS values for the 5 tissues (kg), Kerr 1988. Σ ≈ 64.58 kg */
  const PH_MASS = {
    adipose:  { P: 25.60, s: 5.20 },
    muscle:   { P: 24.50, s: 5.40 },
    bone:     { P:  6.70, s: 1.40 },
    residual: { P:  6.10, s: 1.24 },
    skin:     { P:  1.78, s: 0.20 },
  };

  /* Variables that define each tissue's mean Z-score (Kerr site groups). 
     'corr' marks girths corrected by an associated skinfold (girth - skinfold/10). */
  const TISSUE = {
    adipose:  ["tricep","subscapular","supraspinale","abdominal","thighSkin","calfSkin","iliacCrest"],
    muscle:   [["armFlexed","tricep"],["forearm",null],["thighGirth","thighSkin"],["calfGirth","calfSkin"],["chestGirth","subscapular"]],
    bone:     ["humerus","femur","wrist","ankle","biacromial","biiliac"],
    residual: ["chestGirth","chestAP","biiliac","waist"],
    skin:     ["biacromial","biiliac"],
  };

  /* ---- ISAK measurement schema (field key, label es/en, unit, range) ---- */
  const SCHEMA = {
    basic: [
      { k:"weight",   es:"Peso",            en:"Weight",        u:"kg", min:30,  max:160 },
      { k:"height",   es:"Talla",           en:"Stature",       u:"cm", min:130, max:215 },
      { k:"sitHeight",es:"Talla sentado",   en:"Sitting height",u:"cm", min:70,  max:110 },
      { k:"armSpan",  es:"Envergadura",     en:"Arm span",      u:"cm", min:130, max:220 },
    ],
    skinfolds: [
      { k:"tricep",      es:"Tríceps",        en:"Triceps",       u:"mm", min:3, max:40 },
      { k:"subscapular", es:"Subescapular",   en:"Subscapular",   u:"mm", min:4, max:45 },
      { k:"bicep",       es:"Bíceps",         en:"Biceps",        u:"mm", min:2, max:25 },
      { k:"iliacCrest",  es:"Cresta ilíaca",  en:"Iliac crest",   u:"mm", min:4, max:50 },
      { k:"supraspinale",es:"Supraespinal",   en:"Supraspinale",  u:"mm", min:3, max:45 },
      { k:"abdominal",   es:"Abdominal",      en:"Abdominal",     u:"mm", min:4, max:55 },
      { k:"thighSkin",   es:"Muslo anterior", en:"Front thigh",   u:"mm", min:4, max:55 },
      { k:"calfSkin",    es:"Pantorrilla med.",en:"Medial calf",  u:"mm", min:3, max:40 },
    ],
    girths: [
      { k:"armRelaxed", es:"Brazo relajado",  en:"Arm relaxed",     u:"cm", min:20, max:50 },
      { k:"armFlexed",  es:"Brazo flexionado",en:"Arm flexed",      u:"cm", min:21, max:52 },
      { k:"forearm",    es:"Antebrazo",       en:"Forearm",         u:"cm", min:18, max:38 },
      { k:"chestGirth", es:"Tórax",           en:"Chest",           u:"cm", min:70, max:130 },
      { k:"waist",      es:"Cintura (mín.)",  en:"Waist (min.)",    u:"cm", min:55, max:130 },
      { k:"hip",        es:"Cadera",          en:"Hip (gluteal)",   u:"cm", min:75, max:140 },
      { k:"thighGirth", es:"Muslo medio",     en:"Mid-thigh",       u:"cm", min:38, max:75 },
      { k:"calfGirth",  es:"Pantorrilla máx.",en:"Calf (max.)",     u:"cm", min:26, max:48 },
      { k:"head",        es:"Cabeza",          en:"Head",           u:"cm", min:50, max:62, opt:true },
      { k:"neck",        es:"Cuello",          en:"Neck",           u:"cm", min:30, max:48, opt:true },
      { k:"wristGirth",  es:"Muñeca (perím.)",  en:"Wrist girth",    u:"cm", min:13, max:20, opt:true },
      { k:"thighGluteal",es:"Muslo (1cm glüt.)",en:"Thigh (1cm glut.)",u:"cm", min:40, max:78, opt:true },
      { k:"ankleGirth",  es:"Tobillo (perím.)", en:"Ankle girth",    u:"cm", min:18, max:30, opt:true },
    ],
    breadths: [
      { k:"biacromial", es:"Biacromial",      en:"Biacromial",      u:"cm", min:32, max:48 },
      { k:"biiliac",    es:"Biiliocrestídeo", en:"Bi-iliocristal",  u:"cm", min:22, max:36 },
      { k:"chestAP",    es:"Tórax A-P",       en:"Chest A-P",       u:"cm", min:13, max:26 },
      { k:"humerus",    es:"Húmero",          en:"Humerus",         u:"cm", min:5.5,max:8.5 },
      { k:"wrist",      es:"Muñeca",          en:"Wrist",           u:"cm", min:4.5,max:7 },
      { k:"femur",      es:"Fémur",           en:"Femur",           u:"cm", min:8,  max:12 },
      { k:"ankle",      es:"Tobillo",         en:"Ankle",           u:"cm", min:6,  max:9 },
      { k:"chestTransverse", es:"Tórax transverso", en:"Transverse chest", u:"cm", min:20, max:35, opt:true },
    ],
    lengths: [
      { k:"acromialeRadiale",    es:"Acromial-radial",      en:"Acromiale-radiale",     u:"cm", min:26, max:40, opt:true },
      { k:"radialeStylion",      es:"Radial-estilión",       en:"Radiale-stylion",       u:"cm", min:20, max:32, opt:true },
      { k:"midstylionDactylion", es:"Estilión-dactilión",    en:"Midstylion-dactylion",  u:"cm", min:15, max:24, opt:true },
      { k:"handLength",          es:"Longitud de la mano",   en:"Hand length",           u:"cm", min:15, max:23, opt:true },
      { k:"iliospinaleHeight",   es:"Altura iliospinal",     en:"Iliospinale height",     u:"cm", min:80, max:120, opt:true },
      { k:"trochanterionHeight", es:"Altura trocantérea",    en:"Trochanterion height",   u:"cm", min:78, max:112, opt:true },
      { k:"trochTibialeLat",     es:"Trocánter-tibial lat.", en:"Trochanterion–tibiale",  u:"cm", min:36, max:56, opt:true },
      { k:"tibialeLatHeight",    es:"Altura tibial lateral", en:"Tibiale laterale height",u:"cm", min:38, max:60, opt:true },
      { k:"tibialeMedSphyrion",  es:"Tibial med.–esfirión",  en:"Tibiale med.–sphyrion",  u:"cm", min:28, max:46, opt:true },
      { k:"footLength",          es:"Longitud del pie",      en:"Foot length",            u:"cm", min:21, max:33, opt:true },
    ],
  };

  /* ---- Sample athlete: elite male association-football player ---- */
  const SAMPLE = {
    id: "BC-2026-0418",
    name: "M. Arancibia",
    sex: "male",
    dob: "2001-02-18",
    assessedOn: "2026-05-20",
    sport: "Fútbol",
    sportKey: "football",
    level: "Élite · Primera División",
    evaluator: "Dr. L. Fuentes · ISAK Nivel 2",
    group: "Selección · Pretemporada 2026",
    m: {
      weight:74.5, height:178.0, sitHeight:92.0, armSpan:180.0,
      tricep:8.4, subscapular:9.6, bicep:4.0, iliacCrest:10.2, supraspinale:7.0,
      abdominal:12.5, thighSkin:11.0, calfSkin:6.5,
      armRelaxed:31.5, armFlexed:34.0, forearm:27.5, chestGirth:96.0, waist:78.0,
      hip:96.5, thighGirth:52.0, calfGirth:37.5,
      biacromial:41.0, biiliac:28.0, chestAP:19.5, humerus:7.0, wrist:5.6, femur:9.6, ankle:7.2,
    }
  };

  /* ---- Reference somatotypes by sport (literature means, Carter & Heath et al.) ---- */
  const SPORTS = [
    { key:"football",   es:"Fútbol",            en:"Football",          sex:"male",   s:[2.4,5.0,2.6] },
    { key:"sprint",     es:"Atletismo · veloc.",en:"Sprint",            sex:"male",   s:[1.7,5.0,2.9] },
    { key:"distance",   es:"Fondo",             en:"Distance running",  sex:"male",   s:[1.6,4.2,3.6] },
    { key:"basketball", es:"Baloncesto",        en:"Basketball",        sex:"male",   s:[2.4,4.3,3.2] },
    { key:"swim",       es:"Natación",          en:"Swimming",          sex:"male",   s:[2.2,4.8,2.9] },
    { key:"rugby",      es:"Rugby",             en:"Rugby",             sex:"male",   s:[3.4,6.0,1.6] },
    { key:"weightlift", es:"Halterofilia",      en:"Weightlifting",     sex:"male",   s:[3.3,7.2,1.0] },
    { key:"gym_m",      es:"Gimnasia",          en:"Gymnastics",        sex:"male",   s:[1.9,5.2,2.4] },
    { key:"cycling",    es:"Ciclismo",          en:"Cycling",           sex:"male",   s:[2.3,4.8,2.6] },
    { key:"rowing",     es:"Remo",              en:"Rowing",            sex:"male",   s:[2.5,5.3,2.6] },
    { key:"tennis_m",   es:"Tenis",             en:"Tennis",            sex:"male",   s:[2.2,4.7,2.8] },
    { key:"volley_m",   es:"Vóleibol",          en:"Volleyball",        sex:"male",   s:[2.3,4.0,3.2] },
    { key:"football_f", es:"Fútbol",            en:"Football",          sex:"female", s:[3.3,3.8,2.6] },
    { key:"gym_f",      es:"Gimnasia",          en:"Gymnastics",        sex:"female", s:[2.4,3.6,2.8] },
    { key:"distance_f", es:"Fondo",             en:"Distance running",  sex:"female", s:[2.0,3.3,3.4] },
    { key:"swim_f",     es:"Natación",          en:"Swimming",          sex:"female", s:[3.2,4.0,2.6] },
    { key:"basket_f",   es:"Baloncesto",        en:"Basketball",        sex:"female", s:[3.4,3.6,2.9] },
    { key:"volley_f",   es:"Vóleibol",          en:"Volleyball",        sex:"female", s:[3.4,3.5,2.9] },
    { key:"handball_m", es:"Balonmano",         en:"Handball",          sex:"male",   s:[2.8,5.0,2.4] },
    { key:"waterpolo_m",es:"Waterpolo",         en:"Water polo",        sex:"male",   s:[3.0,5.2,2.4] },
    { key:"judo_m",     es:"Judo",              en:"Judo",              sex:"male",   s:[2.7,5.6,1.9] },
    { key:"boxing_m",   es:"Boxeo",             en:"Boxing",            sex:"male",   s:[2.2,5.0,2.6] },
    { key:"taekwondo_m",es:"Taekwondo",         en:"Taekwondo",         sex:"male",   s:[2.0,4.6,3.0] },
    { key:"wrestling_m",es:"Lucha",             en:"Wrestling",         sex:"male",   s:[2.8,6.0,1.8] },
    { key:"triathlon_m",es:"Triatlón",          en:"Triathlon",         sex:"male",   s:[1.7,4.4,3.2] },
    { key:"canoe_m",    es:"Piragüismo",        en:"Canoe / kayak",     sex:"male",   s:[2.4,5.3,2.4] },
    { key:"baseball_m", es:"Béisbol",           en:"Baseball",          sex:"male",   s:[3.2,5.0,2.3] },
    { key:"tabletennis_m",es:"Tenis de mesa",   en:"Table tennis",      sex:"male",   s:[2.6,4.6,2.8] },
    { key:"badminton_m",es:"Bádminton",         en:"Badminton",         sex:"male",   s:[2.3,4.6,3.0] },
    { key:"hockey_m",   es:"Hockey césped",     en:"Field hockey",      sex:"male",   s:[2.6,4.9,2.6] },
    { key:"fencing_m",  es:"Esgrima",           en:"Fencing",           sex:"male",   s:[2.6,4.7,2.6] },
    { key:"decathlon_m",es:"Decatlón",          en:"Decathlon",         sex:"male",   s:[1.9,5.3,2.7] },
    { key:"climbing_m", es:"Escalada",          en:"Climbing",          sex:"male",   s:[1.8,4.8,3.3] },
    { key:"ski_m",      es:"Esquí alpino",      en:"Alpine skiing",     sex:"male",   s:[2.5,5.2,2.3] },
    { key:"handball_f", es:"Balonmano",         en:"Handball",          sex:"female", s:[3.6,3.9,2.5] },
    { key:"waterpolo_f",es:"Waterpolo",         en:"Water polo",        sex:"female", s:[3.8,4.0,2.4] },
    { key:"judo_f",     es:"Judo",              en:"Judo",              sex:"female", s:[3.4,4.6,2.1] },
    { key:"sprint_f",   es:"Atletismo · veloc.",en:"Sprint",            sex:"female", s:[2.4,3.9,2.9] },
    { key:"tennis_f",   es:"Tenis",             en:"Tennis",            sex:"female", s:[3.2,3.7,2.8] },
    { key:"rowing_f",   es:"Remo",              en:"Rowing",            sex:"female", s:[3.0,4.2,2.5] },
    { key:"triathlon_f",es:"Triatlón",          en:"Triathlon",         sex:"female", s:[2.2,3.5,3.3] },
    { key:"hockey_f",   es:"Hockey césped",     en:"Field hockey",      sex:"female", s:[3.4,3.7,2.6] },
    { key:"taekwondo_f",es:"Taekwondo",         en:"Taekwondo",         sex:"female", s:[2.6,3.8,3.0] },
    { key:"climbing_f", es:"Escalada",          en:"Climbing",          sex:"female", s:[2.4,4.0,3.2] },
    { key:"tennis_table_f",es:"Tenis de mesa",  en:"Table tennis",      sex:"female", s:[3.4,3.6,2.7] },
  ];

  /* ---- Comprehensive sport list for the patient form (es/en) ---- */
  const SPORT_OPTIONS = [
    { key:"football",   es:"Fútbol",            en:"Football" },
    { key:"futsal",     es:"Futsal",            en:"Futsal" },
    { key:"basketball", es:"Baloncesto",        en:"Basketball" },
    { key:"volley",     es:"Vóleibol",          en:"Volleyball" },
    { key:"beachvolley",es:"Vóley playa",       en:"Beach volleyball" },
    { key:"handball",   es:"Balonmano",         en:"Handball" },
    { key:"rugby",      es:"Rugby",             en:"Rugby" },
    { key:"hockey",     es:"Hockey césped",     en:"Field hockey" },
    { key:"icehockey",  es:"Hockey hielo",      en:"Ice hockey" },
    { key:"baseball",   es:"Béisbol",           en:"Baseball" },
    { key:"softball",   es:"Sóftbol",           en:"Softball" },
    { key:"americanfb", es:"Fútbol americano",  en:"American football" },
    { key:"tennis",     es:"Tenis",             en:"Tennis" },
    { key:"padel",      es:"Pádel",             en:"Padel" },
    { key:"badminton",  es:"Bádminton",         en:"Badminton" },
    { key:"tabletennis",es:"Tenis de mesa",     en:"Table tennis" },
    { key:"squash",     es:"Squash",            en:"Squash" },
    { key:"golf",       es:"Golf",              en:"Golf" },
    { key:"sprint",     es:"Atletismo · velocidad", en:"Athletics · sprint" },
    { key:"middist",    es:"Atletismo · medio fondo", en:"Athletics · mid-distance" },
    { key:"distance",   es:"Atletismo · fondo", en:"Athletics · distance" },
    { key:"marathon",   es:"Maratón",           en:"Marathon" },
    { key:"trail",      es:"Trail running",     en:"Trail running" },
    { key:"jumps",      es:"Saltos",            en:"Jumps" },
    { key:"throws",     es:"Lanzamientos",      en:"Throws" },
    { key:"racewalk",   es:"Marcha atlética",   en:"Race walking" },
    { key:"swim",       es:"Natación",          en:"Swimming" },
    { key:"openwater",  es:"Aguas abiertas",    en:"Open water" },
    { key:"waterpolo",  es:"Waterpolo",         en:"Water polo" },
    { key:"triathlon",  es:"Triatlón",          en:"Triathlon" },
    { key:"cycling",    es:"Ciclismo · ruta",   en:"Cycling · road" },
    { key:"trackcycle", es:"Ciclismo · pista",  en:"Cycling · track" },
    { key:"mtb",        es:"Ciclismo · MTB",    en:"Mountain bike" },
    { key:"rowing",     es:"Remo",              en:"Rowing" },
    { key:"canoe",      es:"Piragüismo",        en:"Canoe / kayak" },
    { key:"sailing",    es:"Vela",              en:"Sailing" },
    { key:"weightlift", es:"Halterofilia",      en:"Weightlifting" },
    { key:"powerlift",  es:"Powerlifting",      en:"Powerlifting" },
    { key:"crossfit",   es:"CrossFit",          en:"CrossFit" },
    { key:"bodybuild",  es:"Culturismo",        en:"Bodybuilding" },
    { key:"gym",        es:"Gimnasia artística",en:"Artistic gymnastics" },
    { key:"rhythmic",   es:"Gimnasia rítmica",  en:"Rhythmic gymnastics" },
    { key:"trampoline", es:"Trampolín",         en:"Trampoline" },
    { key:"boxing",     es:"Boxeo",             en:"Boxing" },
    { key:"judo",       es:"Judo",              en:"Judo" },
    { key:"karate",     es:"Kárate",            en:"Karate" },
    { key:"taekwondo",  es:"Taekwondo",         en:"Taekwondo" },
    { key:"wrestling",  es:"Lucha",             en:"Wrestling" },
    { key:"fencing",    es:"Esgrima",           en:"Fencing" },
    { key:"mma",        es:"MMA",               en:"MMA" },
    { key:"climbing",   es:"Escalada",          en:"Climbing" },
    { key:"surf",       es:"Surf",              en:"Surfing" },
    { key:"ski",        es:"Esquí",             en:"Skiing" },
    { key:"snowboard",  es:"Snowboard",         en:"Snowboard" },
    { key:"skating",    es:"Patinaje",          en:"Skating" },
    { key:"equestrian", es:"Equitación",        en:"Equestrian" },
    { key:"dance",      es:"Danza",             en:"Dance" },
    { key:"esports",    es:"eSports",           en:"eSports" },
    { key:"other",      es:"Otro (especificar)",en:"Other (specify)" },
  ];

  /* ---- Body-fat % classification (ACE-style), by sex ---- */
  const BF_CLASS = {
    male: [
      { max:5,  es:"Esencial",  en:"Essential",  tone:"info" },
      { max:13, es:"Atlético",  en:"Athletic",   tone:"good" },
      { max:17, es:"Fitness",   en:"Fitness",    tone:"good" },
      { max:24, es:"Aceptable", en:"Acceptable", tone:"warn" },
      { max:99, es:"Obesidad",  en:"Obesity",    tone:"bad" },
    ],
    female: [
      { max:13, es:"Esencial",  en:"Essential",  tone:"info" },
      { max:20, es:"Atlético",  en:"Athletic",   tone:"good" },
      { max:24, es:"Fitness",   en:"Fitness",    tone:"good" },
      { max:31, es:"Aceptable", en:"Acceptable", tone:"warn" },
      { max:99, es:"Obesidad",  en:"Obesity",    tone:"bad" },
    ],
  };

  /* 13 somatotype categories — used by engine to classify by X/Y or component dominance */
  const SOMA_CATS = {
    es: {
      balMeso:"Mesomorfo balanceado", balEndo:"Endomorfo balanceado", balEcto:"Ectomorfo balanceado",
      mesoEndo:"Mesomorfo-endomorfo", mesoEcto:"Mesomorfo-ectomorfo", endoEcto:"Endomorfo-ectomorfo",
      endoMeso:"Endo-mesomorfo", ectoMeso:"Ecto-mesomorfo", mesoEndo2:"Meso-endomorfo",
      ectoEndo:"Ecto-endomorfo", mesoEcto2:"Meso-ectomorfo", endoEcto2:"Endo-ectomorfo", central:"Central",
    },
    en: {
      balMeso:"Balanced mesomorph", balEndo:"Balanced endomorph", balEcto:"Balanced ectomorph",
      mesoEndo:"Mesomorph-endomorph", mesoEcto:"Mesomorph-ectomorph", endoEcto:"Endomorph-ectomorph",
      endoMeso:"Endomorphic mesomorph", ectoMeso:"Ectomorphic mesomorph", mesoEndo2:"Mesomorphic endomorph",
      ectoEndo:"Ectomorphic endomorph", mesoEcto2:"Mesomorphic ectomorph", endoEcto2:"Endomorphic ectomorph", central:"Central",
    }
  };

  window.BC_DATA = { PHANTOM_H, PH, PH_MASS, TISSUE, SCHEMA, SAMPLE, SPORTS, SPORT_OPTIONS, BF_CLASS, SOMA_CATS };
})();
