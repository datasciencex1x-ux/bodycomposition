/* screens_settings.jsx — settings.  window.SettingsScreen */
function SettingsScreen({ ctx }) {
  const { t, lang, setLang, theme, setTheme, proto, setProto, evaluator, setEvaluator, setPatients } = ctx;
  const ST = window.BC_STORE;
  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">{lang==="es"?"Preferencias del sistema":"System preferences"}</div>
        <div className="page-title">{t("settings")}</div>
        <div className="page-desc">{t("set_desc")}</div>
      </div>
      <div className="grid cols-2" style={{ maxWidth: 880 }}>
        <div className="card">
          <div className="card-head"><div><h3>{t("appearance")}</h3></div></div>
          <div className="card-pad" style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div className="kv" style={{ borderBottom:0, alignItems:"center" }}>
              <span className="key">{lang==="es"?"Tema":"Theme"}</span>
              <div className="seg"><button className={theme==="dark"?"on":""} onClick={()=>setTheme("dark")}>{t("dark")}</button><button className={theme==="light"?"on":""} onClick={()=>setTheme("light")}>{t("light")}</button></div>
            </div>
            <div className="kv" style={{ borderBottom:0, alignItems:"center" }}>
              <span className="key">{lang==="es"?"Idioma":"Language"}</span>
              <div className="seg"><button className={lang==="es"?"on":""} onClick={()=>setLang("es")}>ES</button><button className={lang==="en"?"on":""} onClick={()=>setLang("en")}>EN</button></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div><h3>{t("units")} & {t("protocol")}</h3></div></div>
          <div className="card-pad" style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div className="kv" style={{ borderBottom:0, alignItems:"center" }}>
              <span className="key">{t("units")}</span>
              <span className="chip mono">{t("metric")}</span>
            </div>
            <div className="kv" style={{ borderBottom:0, alignItems:"center" }}>
              <span className="key">{t("protocol_default")}</span>
              <div className="pill-row"><button className={"pill"+(proto==="adult"?" on":"")} onClick={()=>setProto("adult")}>{lang==="es"?"Adulto":"Adult"}</button><button className={"pill"+(proto==="ped"?" on":"")} onClick={()=>setProto("ped")}>{lang==="es"?"Pediátrico":"Pediatric"}</button></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div><h3>{t("evaluator_profile")}</h3></div></div>
          <div className="card-pad">
            <div className="field">
              <label>{t("evaluator_name")}</label>
              <div className="input-wrap"><input type="text" value={evaluator} onChange={e=>setEvaluator(e.target.value)} style={{ fontFamily:"var(--font-body)", paddingRight:11 }} /></div>
            </div>
            <p style={{ fontSize:11.5, color:"var(--text-faint)", marginTop:12 }}>{lang==="es"?"Aparece en el header y en los reportes exportados.":"Shown in the header and exported reports."}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div><h3>{lang==="es"?"Datos":"Data"}</h3></div></div>
          <div className="card-pad">
            <p style={{ fontSize:12.5, color:"var(--text-dim)", marginBottom:14 }}>{lang==="es"?"Los pacientes y evaluaciones se guardan localmente en este navegador.":"Patients and assessments are stored locally in this browser."}</p>
            <button className="btn" onClick={()=>{ ST.reset(); setPatients(ST.defaults.map(p=>({...p}))); }}>
              <Icon n="alert" s={15} /> {t("reset_data")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
window.SettingsScreen = SettingsScreen;
