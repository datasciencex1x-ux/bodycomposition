/* screens_dashboard.jsx — cockpit overview.  window.DashboardScreen */
function patientSummary(p) {
  const E = window.BC_ENGINE, ST = window.BC_STORE;
  const e = ST.latestEval(p);
  const age = E.ageDecimal(p.dob, e.date);
  const fr = E.fractionation(e.m);
  const soma = E.somatotype(e.m, p.sex);
  const bf = E.bodyFat(e.m, p.sex, age);
  const rec = bf.rec;
  return { p, e, age, fr, soma, fatPct: rec.pct, fatCls: rec.cls, muscleKg: fr.tissues.muscle.kg, musclePct: fr.tissues.muscle.pctMeasured };
}

function DashboardScreen({ ctx }) {
  const { t, lang, patients, goPatient } = ctx;
  const ST = window.BC_STORE;
  const sums = patients.map(patientSummary);
  const totalEvals = patients.reduce((a, p) => a + p.evals.length, 0);
  const avgFat = sums.reduce((a, s) => a + s.fatPct, 0) / sums.length;
  const avgMuscle = sums.reduce((a, s) => a + s.muscleKg, 0) / sums.length;
  const cloud = sums.map(s => ({ s: [s.soma.endo, s.soma.meso, s.soma.ecto], sex: s.p.sex, name: s.p.name }));
  const latest = [...sums].sort((a, b) => b.e.date.localeCompare(a.e.date)).slice(0, 6);

  const statusMap = { done: ["var(--good)", t("done_st")], now: ["var(--accent)", t("now")], scheduled: ["var(--text-faint)", t("scheduled")] };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">Data Science Analytics · {new Date().toLocaleDateString(lang==="es"?"es-CL":"en-US",{weekday:"long",day:"numeric",month:"long"})}</div>
        <div className="page-title">{t("dashboard")}</div>
        <div className="page-desc">{t("dash_desc")}</div>
      </div>

      <div className="grid cols-4" style={{ marginBottom: 18 }}>
        <div className="stat"><div className="k">{t("active_patients")}</div><div className="v">{patients.length}</div><div className="meta">{patients.filter(p=>p.sex==="male").length}♂ · {patients.filter(p=>p.sex==="female").length}♀</div></div>
        <div className="stat"><div className="k">{t("evals_month")}</div><div className="v">{totalEvals}</div><div className="meta">{ST.GROUPS.length} {lang==="es"?"cohortes":"cohorts"}</div></div>
        <div className="stat"><div className="k">{t("avg_fat")}</div><div className="v" style={{color:"var(--accent)"}}>{avgFat.toFixed(1)}<small>%</small></div><div className="meta">Durnin → Siri</div></div>
        <div className="stat"><div className="k">{t("avg_muscle")}</div><div className="v">{avgMuscle.toFixed(1)}<small> kg</small></div><div className="meta">Kerr 1988</div></div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1.1fr", alignItems: "start" }}>
        {/* agenda */}
        <div className="card">
          <div className="card-head"><div><h3>{t("agenda_today")}</h3><div className="sub">{ST.AGENDA.length} {lang==="es"?"citas":"appointments"}</div></div></div>
          <div className="card-pad">
            {ST.AGENDA.map((a, i) => {
              const p = ST.patientById(patients, a.pid);
              const [color, label] = statusMap[a.status];
              return (
                <div key={i} className="agenda-row" onClick={() => goPatient(a.pid, null, "results")} style={{ cursor: "pointer" }}>
                  <span className="agenda-time">{a.time}</span>
                  <span>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{p ? p.name : "—"}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>{a.type}</div>
                  </span>
                  <span style={{ fontSize: 11, color: color, display: "flex", alignItems: "center" }}><span className="dot-status" style={{ background: color }} />{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* latest evaluations */}
        <div className="card">
          <div className="card-head"><div><h3>{t("latest_evals")}</h3><div className="sub">{lang==="es"?"Click para abrir resultados":"Click to open results"}</div></div></div>
          <div className="card-pad">
            {latest.map((s) => (
              <div key={s.p.id} className="list-row" onClick={() => goPatient(s.p.id, s.e.id, "results")}>
                <Avatar name={s.p.name} sex={s.p.sex} />
                <span style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{s.p.name}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--text-faint)" }}>{s.e.date} · {s.p.sport}</div>
                </span>
                <span style={{ textAlign: "right" }}>
                  <div className="num" style={{ fontSize: 14 }}>{s.fatPct.toFixed(1)}%</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--text-faint)" }}>{s.soma.endo.toFixed(1)}–{s.soma.meso.toFixed(1)}–{s.soma.ecto.toFixed(1)}</div>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* soma cloud */}
        <div className="card">
          <div className="card-head"><div><h3>{t("soma_cloud")}</h3><div className="sub">{lang==="es"?"Somatotipo de cada atleta":"Each athlete's somatotype"}</div></div>
            <div className="right" style={{ display:"flex", gap:12, fontSize:11, color:"var(--text-dim)" }}>
              <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:9,height:9,borderRadius:"50%",background:"var(--fr-muscle)"}}/>♂</span>
              <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:9,height:9,borderRadius:"50%",background:"var(--fr-residual)"}}/>♀</span>
            </div>
          </div>
          <div className="card-pad" style={{ display:"flex", justifyContent:"center" }}>
            <SomatoChart cloud={cloud} showMain={false} soma={{X:0,Y:0,endo:0,meso:0,ecto:0}} lang={lang} size={300} />
          </div>
        </div>
      </div>
    </div>
  );
}

window.DashboardScreen = DashboardScreen;
window.BC_SUMMARY = patientSummary;
