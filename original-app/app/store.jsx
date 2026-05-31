/* store.jsx — patients, longitudinal evaluations, cohorts, agenda. Persisted.
   Exposes window.BC_STORE */
(function () {
  const S = window.BC_DATA.SAMPLE;

  /* base ISAK profiles (current/most-recent assessment) */
  const BASE = {
    arancibia: S.m,
    soto:    { weight:68.2, height:174.0, sitHeight:90.0, armSpan:175.0, tricep:7.0, subscapular:8.4, bicep:3.6, iliacCrest:8.5, supraspinale:6.2, abdominal:9.8, thighSkin:9.5, calfSkin:5.6, armRelaxed:29.8, armFlexed:32.0, forearm:26.2, chestGirth:91.0, waist:74.5, hip:92.0, thighGirth:50.5, calfGirth:35.8, biacromial:39.5, biiliac:26.8, chestAP:18.2, humerus:6.7, wrist:5.3, femur:9.2, ankle:6.9 },
    reyes:   { weight:98.5, height:185.0, sitHeight:96.0, armSpan:189.0, tricep:11.5, subscapular:14.2, bicep:6.0, iliacCrest:16.5, supraspinale:12.0, abdominal:19.5, thighSkin:14.0, calfSkin:9.0, armRelaxed:36.5, armFlexed:39.5, forearm:30.5, chestGirth:108.0, waist:90.0, hip:104.0, thighGirth:62.0, calfGirth:41.5, biacromial:44.5, biiliac:30.5, chestAP:22.0, humerus:7.6, wrist:6.2, femur:10.4, ankle:7.8 },
    mansilla:{ weight:60.5, height:177.0, sitHeight:91.0, armSpan:178.0, tricep:6.0, subscapular:7.2, bicep:3.0, iliacCrest:6.5, supraspinale:5.0, abdominal:7.5, thighSkin:7.0, calfSkin:4.5, armRelaxed:27.0, armFlexed:28.8, forearm:24.5, chestGirth:88.0, waist:71.0, hip:88.0, thighGirth:48.0, calfGirth:34.0, biacromial:38.5, biiliac:25.5, chestAP:17.0, humerus:6.4, wrist:5.1, femur:8.9, ankle:6.7 },
    tapia:   { weight:67.0, height:179.0, sitHeight:93.0, armSpan:180.0, tricep:14.0, subscapular:11.5, bicep:7.0, iliacCrest:13.0, supraspinale:10.5, abdominal:16.0, thighSkin:20.0, calfSkin:11.0, armRelaxed:27.5, armFlexed:29.0, forearm:24.0, chestGirth:86.0, waist:71.0, hip:96.0, thighGirth:54.0, calfGirth:35.5, biacromial:38.5, biiliac:27.0, chestAP:17.5, humerus:6.3, wrist:5.0, femur:9.0, ankle:6.8 },
    nunez:   { weight:62.5, height:171.0, sitHeight:89.0, armSpan:174.0, tricep:13.0, subscapular:11.0, bicep:6.5, iliacCrest:12.0, supraspinale:9.5, abdominal:14.5, thighSkin:18.5, calfSkin:10.0, armRelaxed:28.0, armFlexed:30.0, forearm:24.5, chestGirth:88.0, waist:70.0, hip:94.0, thighGirth:53.0, calfGirth:34.5, biacromial:38.0, biiliac:26.5, chestAP:17.8, humerus:6.4, wrist:5.1, femur:9.0, ankle:6.7 },
    rojas:   { weight:58.0, height:165.0, sitHeight:86.0, armSpan:166.0, tricep:12.5, subscapular:10.5, bicep:6.0, iliacCrest:11.5, supraspinale:9.0, abdominal:13.5, thighSkin:17.0, calfSkin:9.5, armRelaxed:27.0, armFlexed:28.5, forearm:23.5, chestGirth:84.0, waist:69.0, hip:92.0, thighGirth:51.0, calfGirth:33.5, biacromial:36.5, biiliac:26.0, chestAP:17.0, humerus:6.1, wrist:4.9, femur:8.7, ankle:6.5 },
    herrera: { weight:49.5, height:156.0, sitHeight:82.0, armSpan:156.0, tricep:8.5, subscapular:7.5, bicep:4.0, iliacCrest:7.0, supraspinale:5.5, abdominal:8.0, thighSkin:11.0, calfSkin:6.0, armRelaxed:25.0, armFlexed:26.8, forearm:22.0, chestGirth:80.0, waist:64.0, hip:84.0, thighGirth:47.0, calfGirth:31.5, biacromial:35.0, biiliac:24.0, chestAP:16.0, humerus:5.8, wrist:4.6, femur:8.3, ankle:6.2 },
  };

  /* evolve a base profile: scale skinfolds, muscle girths, weight */
  function evolve(base, sk, gi, wt) {
    const SF = ["tricep","subscapular","bicep","iliacCrest","supraspinale","abdominal","thighSkin","calfSkin"];
    const GI = ["armRelaxed","armFlexed","forearm","chestGirth","thighGirth","calfGirth"];
    const out = { ...base };
    SF.forEach(k => out[k] = Math.round(base[k] * sk * 10) / 10);
    GI.forEach(k => out[k] = Math.round(base[k] * gi * 10) / 10);
    out.weight = Math.round(base[ "weight"] * wt * 10) / 10;
    return out;
  }
  const ev = (id, date, es, en, m) => ({ id, date, phase_es: es, phase_en: en, m });

  const GROUPS = [
    { id:"primera",  es:"Primera División",  en:"First Division" },
    { id:"sub20",    es:"Selección Sub-20",  en:"U-20 Squad" },
    { id:"sub17",    es:"Selección Sub-17",  en:"U-17 Squad" },
    { id:"fem",      es:"Plantel Femenino",  en:"Women's Squad" },
    { id:"pre2026",  es:"Pretemporada 2026", en:"Pre-season 2026" },
  ];
  const GKEY = "bc_groups_v1";
  function loadGroups() { try { const s = localStorage.getItem(GKEY); if (s) return JSON.parse(s); } catch (e) {} return GROUPS; }
  function saveGroups(g) { try { localStorage.setItem(GKEY, JSON.stringify(g)); } catch (e) {} }
  function slug(name) { return (name||"grupo").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"").slice(0,24) || ("g"+Date.now()); }

  const PATIENTS = [
    { id:"BC-2026-0418", name:"M. Arancibia", sex:"male", dob:"2001-02-18", sport:"Fútbol", sportKey:"football", level:"Élite · Primera División", evaluator:S.evaluator, groups:["primera","pre2026"],
      evals:[
        ev("e1","2025-11-12","Pretemporada","Pre-season", evolve(BASE.arancibia,1.42,0.975,1.035)),
        ev("e2","2026-02-20","Competición","In-season",  evolve(BASE.arancibia,1.15,0.992,1.008)),
        ev("e3","2026-05-20","Control","Mid-season",     BASE.arancibia),
      ] },
    { id:"BC-2026-0419", name:"J. Soto", sex:"male", dob:"2005-06-30", sport:"Fútbol", sportKey:"football", level:"Sub-20", evaluator:S.evaluator, groups:["sub20","pre2026"],
      evals:[
        ev("e1","2025-11-14","Pretemporada","Pre-season", evolve(BASE.soto,1.30,0.98,1.02)),
        ev("e2","2026-05-18","Control","Mid-season",      BASE.soto),
      ] },
    { id:"BC-2026-0420", name:"D. Reyes", sex:"male", dob:"1998-09-05", sport:"Rugby", sportKey:"rugby", level:"Élite · Primera División", evaluator:S.evaluator, groups:["primera"],
      evals:[
        ev("e1","2025-11-10","Pretemporada","Pre-season", evolve(BASE.reyes,1.18,0.985,1.02)),
        ev("e2","2026-05-16","Control","Mid-season",      BASE.reyes),
      ] },
    { id:"BC-2026-0421", name:"P. Mansilla", sex:"male", dob:"2000-03-22", sport:"Fondo", sportKey:"distance", level:"Élite", evaluator:S.evaluator, groups:["primera"],
      evals:[ ev("e1","2026-05-15","Control","Mid-season", BASE.mansilla) ] },
    { id:"BC-2026-0422", name:"C. Tapia", sex:"female", dob:"2002-07-11", sport:"Vóleibol", sportKey:"volley_f", level:"Élite", evaluator:S.evaluator, groups:["fem"],
      evals:[
        ev("e1","2025-11-20","Pretemporada","Pre-season", evolve(BASE.tapia,1.20,0.985,1.02)),
        ev("e2","2026-05-19","Control","Mid-season",      BASE.tapia),
      ] },
    { id:"BC-2026-0423", name:"F. Núñez", sex:"female", dob:"2003-01-09", sport:"Natación", sportKey:"swim_f", level:"Élite", evaluator:S.evaluator, groups:["fem"],
      evals:[ ev("e1","2026-05-17","Control","Mid-season", BASE.nunez) ] },
    { id:"BC-2026-0424", name:"V. Rojas", sex:"female", dob:"2009-04-02", sport:"Fútbol", sportKey:"football_f", level:"Sub-17", evaluator:S.evaluator, groups:["sub17","fem"],
      evals:[ ev("e1","2026-05-21","Control","Mid-season", BASE.rojas) ] },
    { id:"BC-2026-0425", name:"A. Herrera", sex:"female", dob:"2007-10-28", sport:"Gimnasia", sportKey:"gym_f", level:"Élite", evaluator:S.evaluator, groups:["fem"],
      evals:[ ev("e1","2026-05-14","Control","Mid-season", BASE.herrera) ] },
  ];

  const AGENDA = [
    { time:"08:30", pid:"BC-2026-0419", type:"Evaluación completa", status:"done" },
    { time:"09:15", pid:"BC-2026-0424", type:"Control de pliegues", status:"done" },
    { time:"10:00", pid:"BC-2026-0420", type:"Evaluación completa", status:"now" },
    { time:"11:30", pid:"BC-2026-0423", type:"Seguimiento", status:"scheduled" },
    { time:"12:15", pid:"BC-2026-0425", type:"Evaluación completa", status:"scheduled" },
    { time:"15:00", pid:"BC-2026-0421", type:"Control de pliegues", status:"scheduled" },
  ];

  /* build a fresh patient (measurements default to the sample template so the engine runs) */
  function newPatientId(list) {
    const year = new Date(TODAY_STR).getFullYear();
    const nums = list.map(p => parseInt((p.id.split("-")[2]||"0"),10)).filter(n=>!isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 417) + 1;
    return `BC-${year}-${String(next).padStart(4,"0")}`;
  }
  function makePatient(list, { name, sex, dob, sport, sportKey, level, groups, evaluator }) {
    const id = newPatientId(list);
    return {
      id, name: name||"Nuevo paciente", sex: sex||"male", dob: dob||"2000-01-01",
      sport: sport||"—", sportKey: sportKey||"football", level: level||"", evaluator: evaluator||S.evaluator,
      groups: groups||[],
      evals: [ ev("e1", TODAY_STR, "Evaluación inicial", "Baseline", { ...S.m }) ],
    };
  }
  const TODAY_STR = "2026-05-29";
  const KEY = "bc_patients_v1";
  function load() {
    try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) {}
    return PATIENTS;
  }
  function save(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }
  function reset() { localStorage.removeItem(KEY); }

  /* ---------- appointments / agenda ---------- */
  const APPT_TYPES = [
    { key:"full",      es:"Evaluación completa", en:"Full assessment",  color:"var(--fr-muscle)" },
    { key:"skinfold",  es:"Control de pliegues", en:"Skinfold check",   color:"var(--fr-adipose)" },
    { key:"followup",  es:"Seguimiento",         en:"Follow-up",        color:"var(--fr-bone)" },
    { key:"first",     es:"Primera consulta",    en:"First visit",      color:"var(--info)" },
  ];
  // seeded around the week of 2026-05-25 (Mon) … 2026-05-31
  const APPTS = [
    { id:"a1", date:"2026-05-25", time:"09:00", dur:60, pid:"BC-2026-0419", type:"full",     status:"done" },
    { id:"a2", date:"2026-05-25", time:"11:00", dur:30, pid:"BC-2026-0424", type:"skinfold", status:"done" },
    { id:"a3", date:"2026-05-26", time:"08:30", dur:60, pid:"BC-2026-0420", type:"full",     status:"done" },
    { id:"a4", date:"2026-05-26", time:"15:00", dur:45, pid:"BC-2026-0423", type:"followup", status:"done" },
    { id:"a5", date:"2026-05-27", time:"10:00", dur:60, pid:"BC-2026-0422", type:"full",     status:"missed" },
    { id:"a6", date:"2026-05-28", time:"09:30", dur:30, pid:"BC-2026-0421", type:"skinfold", status:"done" },
    { id:"a7", date:"2026-05-28", time:"12:00", dur:60, pid:"BC-2026-0425", type:"first",    status:"done" },
    { id:"a8", date:"2026-05-29", time:"08:30", dur:30, pid:"BC-2026-0419", type:"skinfold", status:"done" },
    { id:"a9", date:"2026-05-29", time:"10:00", dur:60, pid:"BC-2026-0420", type:"full",     status:"now" },
    { id:"a10", date:"2026-05-29", time:"11:30", dur:45, pid:"BC-2026-0423", type:"followup", status:"scheduled" },
    { id:"a11", date:"2026-05-29", time:"15:00", dur:30, pid:"BC-2026-0421", type:"skinfold", status:"scheduled" },
    { id:"a12", date:"2026-05-30", time:"09:00", dur:60, pid:"BC-2026-0418", type:"full",     status:"scheduled" },
    { id:"a13", date:"2026-05-30", time:"11:00", dur:45, pid:"BC-2026-0422", type:"followup", status:"scheduled" },
    { id:"a14", date:"2026-06-01", time:"08:30", dur:60, pid:"BC-2026-0425", type:"full",     status:"scheduled" },
    { id:"a15", date:"2026-06-02", time:"10:30", dur:30, pid:"BC-2026-0424", type:"skinfold", status:"scheduled" },
  ];
  const AKEY = "bc_appts_v1";
  function loadAppts() { try { const s = localStorage.getItem(AKEY); if (s) return JSON.parse(s); } catch (e) {} return APPTS; }
  function saveAppts(a) { try { localStorage.setItem(AKEY, JSON.stringify(a)); } catch (e) {} }
  function resetAppts() { localStorage.removeItem(AKEY); }

  window.BC_STORE = {
    GROUPS, AGENDA, APPT_TYPES, defaults: PATIENTS, defaultAppts: APPTS, TODAY: "2026-05-29",
    load, save, reset, loadAppts, saveAppts, resetAppts, loadGroups, saveGroups, slug, makePatient, newPatientId,
    apptType: (k) => APPT_TYPES.find(t => t.key === k) || APPT_TYPES[0],
    latestEval: (p) => p.evals[p.evals.length - 1],
    patientById: (list, id) => list.find(p => p.id === id),
    groupName: (id, lang) => { const g = GROUPS.find(x => x.id === id); return g ? g[lang] : id; },
    groupNameIn: (groups, id, lang) => { const g = (groups||GROUPS).find(x => x.id === id); return g ? g[lang] : id; },
  };
})();
