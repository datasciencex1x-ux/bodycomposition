/* app.jsx — shell: sidebar, topbar, subject switcher, routing, state. */
const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

const NAV = [
  { group: "nav_group_clinical" },
  { key: "dashboard", icon: "dashboard", route: "dashboard" },
  { key: "agenda", icon: "calendar", route: "agenda" },
  { key: "patients", icon: "patients", route: "patients" },
  { key: "new_eval", icon: "eval", route: "eval" },
  { key: "results", icon: "results", route: "results" },
  { group: "nav_group_nutrition" },
  { key: "metabolism", icon: "flame", route: "metabolism" },
  { key: "supplements", icon: "pill", route: "supplements" },
  { key: "diet", icon: "diet", route: "diet" },
  { key: "performance", icon: "bolt", route: "performance" },
  { key: "wearables", icon: "watch", route: "wearables" },
  { group: "nav_group_science" },
  { key: "somatotype", icon: "soma", route: "soma" },
  { key: "comparator", icon: "compare", route: "comparator" },
  { key: "phantom", icon: "target", route: "phantom" },
  { key: "reports", icon: "reports", route: "report" },
  { key: "methods", icon: "methods", route: "methods" },
  { key: "settings", icon: "settings", route: "settings" },
];

function SubjectSwitcher({ patients, subject, evalObj, lang, onPick }) {
  const [open, setOpen] = useStateA(false);
  const ref = React.useRef(null);
  useEffectA(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div className="subj" ref={ref}>
      <button className="subj-btn" onClick={() => setOpen(o => !o)}>
        <span className="subj-dot" />
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.2, alignItems: "flex-start" }}>
          <b style={{ fontSize: 13 }}>{subject.name}</b>
          <span className="mono" style={{ fontSize: 10, color: "var(--text-faint)" }}>{evalObj.date} · {lang==="es"?evalObj.phase_es:evalObj.phase_en}</span>
        </span>
        <Icon n="chevron" s={14} style={{ transform: "rotate(90deg)", color: "var(--text-faint)" }} />
      </button>
      {open && (
        <div className="subj-menu fade-in">
          {patients.map(p => (
            <div key={p.id} className="subj-group">
              <div className="subj-name" style={{ color: p.id === subject.id ? "var(--accent)" : null }}>{p.name} <span className="mono" style={{ fontSize: 9, color: "var(--text-faint)" }}>· {p.sport}</span></div>
              <div className="subj-evals">
                {p.evals.map(e => (
                  <button key={e.id} className={"subj-eval" + (p.id===subject.id && e.id===evalObj.id ? " on":"")}
                    onClick={() => { onPick(p.id, e.id); setOpen(false); }}>
                    {e.date} · {lang==="es"?e.phase_es:e.phase_en}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const ls = window.localStorage, ST = window.BC_STORE;
  const [lang, setLang] = useStateA(ls.getItem("bc_lang") || "es");
  const [theme, setTheme] = useStateA(ls.getItem("bc_theme") || "dark");
  const [route, setRoute] = useStateA(ls.getItem("bc_route") || "dashboard");
  const [proto, setProto] = useStateA("adult");
  const [patients, setPatients] = useStateA(() => ST.load());
  const [appts, setAppts] = useStateA(() => ST.loadAppts());
  const [groups, setGroups] = useStateA(() => ST.loadGroups());
  const [selPid, setSelPid] = useStateA(patients[0].id);
  const [selEid, setSelEid] = useStateA(ST.latestEval(patients[0]).id);
  const [evaluator, setEvaluator] = useStateA(() => ls.getItem("bc_evaluator") || "Dr. L. Fuentes · ISAK Nivel 2");
  const t = window.makeT(lang);

  useEffectA(() => { document.documentElement.setAttribute("data-theme", theme); ls.setItem("bc_theme", theme); }, [theme]);
  useEffectA(() => { ls.setItem("bc_lang", lang); }, [lang]);
  useEffectA(() => { ls.setItem("bc_route", route); }, [route]);
  useEffectA(() => { ST.save(patients); }, [patients]);
  useEffectA(() => { ST.saveAppts(appts); }, [appts]);
  useEffectA(() => { ST.saveGroups(groups); }, [groups]);
  useEffectA(() => { ls.setItem("bc_evaluator", evaluator); }, [evaluator]);

  const patient = ST.patientById(patients, selPid) || patients[0];
  const evalObj = patient.evals.find(e => e.id === selEid) || ST.latestEval(patient);
  const subject = useMemoA(() => ({ ...patient, assessedOn: evalObj.date, evaluator, phase: lang==="es"?evalObj.phase_es:evalObj.phase_en }), [patient, evalObj, evaluator, lang]);
  const m = evalObj.m;

  const updateM = (updater) => setPatients(ps => ps.map(p => p.id === selPid
    ? { ...p, evals: p.evals.map(e => e.id === selEid ? { ...e, m: typeof updater === "function" ? updater(e.m) : updater } : e) }
    : p));
  const updatePerf = (updater) => setPatients(ps => ps.map(p => p.id === selPid
    ? { ...p, evals: p.evals.map(e => e.id === selEid ? { ...e, perf: typeof updater === "function" ? updater(e.perf || {}) : updater } : e) }
    : p));
  const setSel = (pid, eid) => { setSelPid(pid); const pp = ST.patientById(patients, pid); setSelEid(eid || ST.latestEval(pp).id); };
  const goPatient = (pid, eid, r) => { setSel(pid, eid); if (r) setRoute(r); };
  const addGroup = (name) => {
    const base = ST.slug(name); let id = base, n = 2;
    while (groups.some(g => g.id === id)) id = base + "-" + (n++);
    const g = { id, es: name, en: name };
    setGroups(gs => [...gs, g]);
    return id;
  };
  const addPatient = (data) => {
    const p = ST.makePatient(patients, { ...data, evaluator });
    setPatients(ps => [...ps, p]);
    setSelPid(p.id); setSelEid(p.evals[0].id);
    return p;
  };
  const groupName = (id) => { const g = groups.find(x => x.id === id); return g ? (g[lang] || g.es) : id; };

  const ctx = { lang, t, theme, setTheme, setLang, patients, setPatients, appts, setAppts, selPid, selEid, setSel, goPatient,
    subject, evalObj, m, updateM, updatePerf, proto, setProto, evaluator, setEvaluator, route, setRoute,
    groups, setGroups, addGroup, addPatient, groupName };

  const routeTitle = { dashboard:t("dashboard"), agenda:t("agenda"), patients:t("patients"), eval:t("new_eval"), results:t("results"),
    metabolism:t("metabolism"), supplements:t("supplements"), diet:t("diet"), performance:t("performance"), wearables:t("wearables"),
    soma:t("somatotype"), comparator:t("comparator"), phantom:t("phantom"), report:t("reports"), methods:t("methods"), settings:t("settings") }[route];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <svg className="brand-logo" width="40" height="40" viewBox="0 0 40 40" role="img" aria-label="Body Composition">
            <defs>
              <linearGradient id="bcLogoGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffc25c" />
                <stop offset="100%" stopColor="#f7a823" />
              </linearGradient>
            </defs>
            <rect x="0.5" y="0.5" width="39" height="39" rx="10" fill="url(#bcLogoGrad)" />
            <g stroke="#0a0d12" strokeWidth="2.1" strokeLinecap="round" fill="none" opacity="0.92">
              <path d="M14 10 C 27 15, 13 25, 26 30" />
              <path d="M26 10 C 13 15, 27 25, 14 30" />
              <line x1="16.5" y1="13" x2="23.5" y2="13" />
              <line x1="14.5" y1="20" x2="25.5" y2="20" />
              <line x1="16.5" y1="27" x2="23.5" y2="27" />
            </g>
          </svg>
          <div>
            <div className="brand-name">Body Composition</div>
            <div className="brand-sub">Data Science Analytics</div>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((it, i) => it.group
            ? <div key={i} className="eyebrow nav-label">{t(it.group)}</div>
            : (
              <button key={it.key} className={"nav-item" + (route === it.route ? " active" : "")} onClick={() => setRoute(it.route)}>
                <Icon n={it.icon} className="nav-ico" />{t(it.key)}
              </button>
            ))}
        </nav>
        <div className="sidebar-foot">
          <div className="chip" style={{ width: "100%", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".1em" }}>
            ISAK · KERR · HEATH-CARTER
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="crumb"><span>Body Composition</span><Icon n="chevron" s={14} /><b>{routeTitle}</b></div>
          <div className="topbar-actions">
            <SubjectSwitcher patients={patients} subject={subject} evalObj={evalObj} lang={lang} onPick={setSel} />
            <div className="seg">
              <button className={lang === "es" ? "on" : ""} onClick={() => setLang("es")}>ES</button>
              <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
            </div>
            <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Theme">
              <Icon n={theme === "dark" ? "sun" : "moon"} s={17} />
            </button>
            <button className="btn ghost" onClick={() => setRoute("report")}>
              <Icon n="download" s={15} /> {t("print_report")}
            </button>
          </div>
        </header>

        <main className="content">
          {route === "dashboard" && <DashboardScreen ctx={ctx} />}
          {route === "agenda" && <AgendaScreen ctx={ctx} />}
          {route === "patients" && <PatientsScreen ctx={ctx} />}
          {route === "eval" && <EvalScreen m={m} setM={updateM} lang={lang} t={t} patient={subject} proto={proto} setProto={setProto} onRun={() => setRoute("results")} />}
          {route === "results" && <ResultsScreen m={m} lang={lang} t={t} patient={subject} />}
          {route === "metabolism" && <MetabolismScreen ctx={ctx} />}
          {route === "supplements" && <SupplementsScreen ctx={ctx} />}
          {route === "diet" && <DietScreen ctx={ctx} />}
          {route === "performance" && <PerformanceScreen ctx={ctx} />}
          {route === "wearables" && <WearablesScreen ctx={ctx} />}
          {route === "soma" && <SomaScreen m={m} lang={lang} t={t} patient={subject} />}
          {route === "comparator" && <ComparatorScreen ctx={ctx} />}
          {route === "phantom" && <PhantomScreen ctx={ctx} />}
          {route === "report" && <ReportScreen ctx={ctx} />}
          {route === "methods" && <MethodsScreen ctx={ctx} />}
          {route === "settings" && <SettingsScreen ctx={ctx} />}
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
