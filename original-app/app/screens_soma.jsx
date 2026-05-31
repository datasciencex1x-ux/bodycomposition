/* screens_soma.jsx — Somatotipo vs Deportes.  window.SomaScreen */
const { useState: useStateS } = React;

function SomaScreen({ m, lang, t, patient }) {
  const E = window.BC_ENGINE, D = window.BC_DATA;
  const soma = E.somatotype(m, patient.sex);
  const ps = [soma.endo, soma.meso, soma.ecto];
  const [sexFilter, setSexFilter] = useStateS(patient.sex);
  const [sel, setSel] = useStateS(null);

  const ranked = D.SPORTS
    .filter(s => s.sex === sexFilter)
    .map(s => ({ ...s, sad: E.sad(ps, s.s) }))
    .sort((a, b) => a.sad - b.sad);

  const selSport = sel ? ranked.find(s => s.key === sel) : ranked[0];
  const maxSad = Math.max(...ranked.map(r => r.sad));
  const catName = D.SOMA_CATS[lang][soma.category];

  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">{patient.name} · {[soma.endo,soma.meso,soma.ecto].map(v=>v.toFixed(1)).join("–")} · {catName}</div>
        <div className="page-title">{t("svd_title")}</div>
        <div className="page-desc">{t("svd_desc")}</div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.15fr 1fr", alignItems: "start" }}>
        {/* chart */}
        <div className="card">
          <div className="card-head">
            <div><h3>{lang==="es"?"Somatocarta":"Somatochart"}</h3><div className="sub">{lang==="es"?"13 categorías · triángulo de Reuleaux":"13 categories · Reuleaux triangle"}</div></div>
            <div className="right" style={{ display:"flex", gap:14, alignItems:"center" }}>
              <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:11.5, color:"var(--text-dim)" }}>
                <span style={{ width:10,height:10,borderRadius:"50%",background:"var(--accent)" }} /> {t("patient_pt")}
              </span>
              <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:11.5, color:"var(--text-dim)" }}>
                <span style={{ width:9,height:9,background:"var(--info)",transform:"rotate(45deg)" }} /> {t("sport_mean")}
              </span>
            </div>
          </div>
          <div className="card-pad" style={{ display:"flex", justifyContent:"center" }}>
            <SomatoChart soma={soma} overlay={selSport ? { label: (lang==="es"?selSport.es:selSport.en), s: selSport.s } : null} lang={lang} size={440} />
          </div>
          {selSport && (
            <div className="card-pad" style={{ borderTop:"1px solid var(--line)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div className="eyebrow">{t("overlay")}</div>
                <div style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:16, marginTop:2 }}>{lang==="es"?selSport.es:selSport.en} · {t(selSport.sex)}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div className="num" style={{ fontSize:26, color:"var(--info)" }}>{selSport.sad.toFixed(2)}</div>
                <div className="mono" style={{ fontSize:10, color:"var(--text-faint)" }}>{t("sad")} · {selSport.s.map(v=>v.toFixed(1)).join("–")}</div>
              </div>
            </div>
          )}
        </div>

        {/* affinity ranking */}
        <div className="card">
          <div className="card-head">
            <div><h3>{t("affinity")}</h3><div className="sub">{t("affinity_sub")}</div></div>
            <div className="right">
              <div className="seg">
                <button className={sexFilter==="male"?"on":""} onClick={()=>{setSexFilter("male");setSel(null);}}>♂</button>
                <button className={sexFilter==="female"?"on":""} onClick={()=>{setSexFilter("female");setSel(null);}}>♀</button>
              </div>
            </div>
          </div>
          <div className="card-pad">
            {ranked.map((s, i) => (
              <div key={s.key} className={"aff-row" + ((selSport && selSport.key===s.key)?" sel":"")} onClick={()=>setSel(s.key)}>
                <span className="aff-rank">{i===0 ? "★" : (i+1)}</span>
                <span>
                  <div style={{ fontSize:13.5, fontWeight:500 }}>{lang==="es"?s.es:s.en} {i===0 && <span style={{color:"var(--accent)",fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:".08em"}}>· {t("closest").toUpperCase()}</span>}</div>
                  <div className="mono" style={{ fontSize:10, color:"var(--text-faint)" }}>{s.s.map(v=>v.toFixed(1)).join("–")}</div>
                </span>
                <span className="aff-bar"><div style={{ width: (100 - s.sad/maxSad*88)+"%" }} /></span>
                <span className="aff-sad" style={{ color: i===0?"var(--accent)":"var(--text)" }}>{s.sad.toFixed(2)}</span>
              </div>
            ))}
            <p style={{ fontSize:11.5, color:"var(--text-faint)", marginTop:14, lineHeight:1.5, borderTop:"1px solid var(--line)", paddingTop:12 }}>
              {lang==="es"
                ? "SAD = distancia somatotípica (Heath-Carter). Menor distancia = mayor afinidad morfológica con el perfil medio reportado del deporte. Valores de literatura (Carter & Heath)."
                : "SAD = somatotype attitudinal distance (Heath-Carter). Lower = closer morphological fit to the sport's reported mean profile. Literature values (Carter & Heath)."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

window.SomaScreen = SomaScreen;
