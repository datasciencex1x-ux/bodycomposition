/* screens_agenda.jsx — clinical scheduler (week/day).  window.AgendaScreen */
const { useState: useStateAg } = React;

const H_START = 8, H_END = 19, SLOT = 60; // px per hour
const pad2 = n => String(n).padStart(2, "0");
function parseD(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function fmtD(dt) { return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`; }
function addDays(dt, n) { const x = new Date(dt); x.setDate(x.getDate() + n); return x; }
function mondayOf(dt) { const x = new Date(dt); const wd = (x.getDay() + 6) % 7; return addDays(x, -wd); }
const TIME_OPTS = []; for (let h = H_START; h <= H_END; h++) { TIME_OPTS.push(`${pad2(h)}:00`); if (h < H_END) TIME_OPTS.push(`${pad2(h)}:30`); }

function ApptModal({ appt, ctx, onClose, onSave, onDelete }) {
  const { t, lang, patients } = ctx;
  const ST = window.BC_STORE;
  const [draft, setDraft] = useStateAg(appt);
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  const isNew = !appt.id;
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-card fade-in" onMouseDown={e => e.stopPropagation()}>
        <div className="card-head"><div><h3>{isNew ? t("new_appt") : t("edit_appt")}</h3></div>
          <button className="icon-btn right" onClick={onClose}><Icon n="chevron" s={16} style={{ transform: "rotate(180deg)" }} /></button></div>
        <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="field"><label>{t("appt_patient")}</label>
            <select className="sel-input" value={draft.pid} onChange={e => set("pid", e.target.value)}>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} · {p.sport}</option>)}
            </select></div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field"><label>{t("appt_date")}</label>
              <div className="input-wrap"><input type="date" value={draft.date} onChange={e => set("date", e.target.value)} style={{ fontFamily: "var(--font-mono)", paddingRight: 11 }} /></div></div>
            <div className="field"><label>{t("appt_time")}</label>
              <select className="sel-input" value={draft.time} onChange={e => set("time", e.target.value)}>{TIME_OPTS.map(tm => <option key={tm} value={tm}>{tm}</option>)}</select></div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field"><label>{t("appt_type")}</label>
              <select className="sel-input" value={draft.type} onChange={e => set("type", e.target.value)}>{ST.APPT_TYPES.map(ty => <option key={ty.key} value={ty.key}>{ty[lang]}</option>)}</select></div>
            <div className="field"><label>{t("duration")}</label>
              <select className="sel-input" value={draft.dur} onChange={e => set("dur", +e.target.value)}>{[30, 45, 60, 90].map(d => <option key={d} value={d}>{d} min</option>)}</select></div>
          </div>
          <div className="field"><label>{t("appt_status")}</label>
            <div className="pill-row">
              {[["scheduled", t("scheduled")], ["done", t("done_st")], ["missed", t("missed")]].map(([k, lbl]) => (
                <button key={k} className={"pill" + (draft.status === k ? " on" : "")} onClick={() => set("status", k)}>{lbl}</button>
              ))}
            </div></div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => onSave(draft)}><Icon n="check" s={15} /> {t("save_appt")}</button>
            {!isNew && <button className="btn" onClick={() => onDelete(draft.id)} style={{ color: "var(--bad)" }}><Icon n="alert" s={15} /> {t("del")}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgendaScreen({ ctx }) {
  const { t, lang, patients, appts, setAppts, goPatient } = ctx;
  const ST = window.BC_STORE;
  const [cursor, setCursor] = useStateAg(() => parseD(ST.TODAY));
  const [view, setView] = useStateAg("week");
  const [modal, setModal] = useStateAg(null);

  const today = ST.TODAY;
  const days = view === "week"
    ? Array.from({ length: 7 }, (_, i) => addDays(mondayOf(cursor), i))
    : [cursor];
  const step = view === "week" ? 7 : 1;

  const apptsOn = (ds) => appts.filter(a => a.date === ds).sort((x, y) => x.time.localeCompare(y.time));
  const statusStyle = { scheduled: { op: 1, line: false }, done: { op: .62, line: false }, missed: { op: .5, line: true }, now: { op: 1, line: false } };

  function upsert(appt) {
    setAppts(prev => prev.find(a => a.id === appt.id) ? prev.map(a => a.id === appt.id ? appt : a) : [...prev, appt]);
    setModal(null);
  }
  function del(id) { setAppts(prev => prev.filter(a => a.id !== id)); setModal(null); }
  function newAt(ds, time) { setModal({ id: "", pid: patients[0].id, date: ds, time: time || "09:00", dur: 60, type: "full", status: "scheduled" }); }

  const hours = []; for (let h = H_START; h < H_END; h++) hours.push(h);
  const monthLabel = mondayOf(cursor).toLocaleDateString(lang === "es" ? "es-CL" : "en-US", { month: "long", year: "numeric" });

  return (
    <div className="fade-in">
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="eyebrow">{appts.length} {t("appts_count")} · {monthLabel}</div>
          <div className="page-title">{t("agenda")}</div>
          <div className="page-desc">{t("agenda_desc")}</div>
        </div>
        <button className="btn primary" onClick={() => newAt(today, "09:00")}><Icon n="eval" s={15} /> {t("new_appt")}</button>
      </div>

      <div className="filters" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="icon-btn" onClick={() => setCursor(addDays(cursor, -step))}><Icon n="chevron" s={16} style={{ transform: "rotate(180deg)" }} /></button>
          <button className="btn ghost" onClick={() => setCursor(parseD(today))}>{t("today")}</button>
          <button className="icon-btn" onClick={() => setCursor(addDays(cursor, step))}><Icon n="chevron" s={16} /></button>
          <span className="chip mono" style={{ marginLeft: 4 }}>{t("week_of")} {fmtD(mondayOf(cursor))}</span>
        </div>
        <div className="seg">
          <button className={view === "week" ? "on" : ""} onClick={() => setView("week")}>{t("week")}</button>
          <button className={view === "day" ? "on" : ""} onClick={() => setView("day")}>{t("day")}</button>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {/* day headers */}
        <div className="cal-head" style={{ gridTemplateColumns: `54px repeat(${days.length}, 1fr)` }}>
          <div></div>
          {days.map((d, i) => {
            const ds = fmtD(d), isToday = ds === today;
            return (
              <div key={i} className={"cal-dayhead" + (isToday ? " today" : "")}>
                <div className="cal-dow">{d.toLocaleDateString(lang === "es" ? "es-CL" : "en-US", { weekday: "short" })}</div>
                <div className="cal-dnum">{d.getDate()}</div>
              </div>
            );
          })}
        </div>
        {/* grid */}
        <div className="cal-body" style={{ gridTemplateColumns: `54px repeat(${days.length}, 1fr)`, height: (H_END - H_START) * SLOT }}>
          <div className="cal-gutter">
            {hours.map(h => <div key={h} className="cal-hour" style={{ height: SLOT }}><span>{pad2(h)}:00</span></div>)}
          </div>
          {days.map((d, di) => {
            const ds = fmtD(d);
            return (
              <div key={di} className="cal-col" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const h = H_START + Math.floor((e.clientY - rect.top) / SLOT);
                newAt(ds, `${pad2(Math.max(H_START, Math.min(H_END - 1, h)))}:00`);
              }}>
                {hours.map(h => <div key={h} className="cal-line" style={{ height: SLOT }} />)}
                {apptsOn(ds).map(a => {
                  const [hh, mm] = a.time.split(":").map(Number);
                  const top = (hh - H_START + mm / 60) * SLOT;
                  const ty = ST.apptType(a.type);
                  const st = statusStyle[a.status] || statusStyle.scheduled;
                  const p = ST.patientById(patients, a.pid);
                  return (
                    <div key={a.id} className={"cal-appt" + (a.status === "now" ? " now" : "")}
                      style={{ top: top + 1, height: a.dur / 60 * SLOT - 3, borderLeftColor: ty.color, opacity: st.op }}
                      onClick={(e) => { e.stopPropagation(); setModal(a); }}>
                      <div className="cal-appt-t mono">{a.time}{a.status === "now" && <span className="live-dot" />}</div>
                      <div className="cal-appt-n" style={{ textDecoration: st.line ? "line-through" : "none" }}>{p ? p.name : "—"}</div>
                      {a.dur >= 45 && <div className="cal-appt-y">{ty[lang]}</div>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
        {ST.APPT_TYPES.map(ty => <span key={ty.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--text-dim)" }}><span style={{ width: 10, height: 10, borderRadius: 3, background: ty.color }} />{ty[lang]}</span>)}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-faint)" }}>{lang === "es" ? "Click en un hueco para crear · click en una cita para editar/mover/cancelar" : "Click a slot to create · click an appointment to edit/move/cancel"}</span>
      </div>

      {modal && <ApptModal appt={modal} ctx={ctx} onClose={() => setModal(null)} onSave={upsert} onDelete={del} />}
    </div>
  );
}

window.AgendaScreen = AgendaScreen;
