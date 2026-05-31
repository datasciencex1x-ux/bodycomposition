/* screens_phantom.jsx — Phantom reference & Z-scores for every Kerr-model variable. */
function ZBar({ z }) {
  const clamp = Math.max(-3.2, Math.min(3.2, z));
  const pct = (clamp + 3.2) / 6.4 * 100;
  const pos = z >= 0;
  return (
    <div style={{ position:"relative", height:9, borderRadius:999, background:"var(--surface-3)", overflow:"hidden" }}>
      {/* center to marker fill */}
      <div style={{ position:"absolute", top:0, bottom:0,
        left: pos ? "50%" : pct+"%", width: Math.abs(pct-50)+"%",
        background: pos ? "linear-gradient(90deg,var(--fr-muscle),var(--accent))" : "var(--fr-residual)" }} />
      <div style={{ position:"absolute", left:"50%", top:-2, width:2, height:13, background:"var(--text-faint)", transform:"translateX(-50%)" }} />
      <div style={{ position:"absolute", left:pct+"%", top:-3, width:3, height:15, background:"var(--text)", borderRadius:2, transform:"translateX(-50%)", boxShadow:"0 0 0 2px var(--surface)" }} />
    </div>
  );
}

function PhantomScreen({ ctx }) {
  const { t, lang, subject, m } = ctx;
  const E = window.BC_ENGINE, D = window.BC_DATA;
  const ph = E.phantomProfile(m);
  const fr = E.fractionation(m);
  const meanAbsZ = ph.all.reduce((a,r)=>a+Math.abs(r.z),0)/ph.all.length;
  const TISS = [["adipose","var(--fr-adipose)"],["muscle","var(--fr-muscle)"],["bone","var(--fr-bone)"],["residual","var(--fr-residual)"],["skin","var(--fr-skin)"]];
  const f2 = x => (x>=0?"+":"")+x.toFixed(2);

  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">{subject.name} · {subject.id} · {lang==="es"?"Talla":"Stature"} {m.height} cm</div>
        <div className="page-title">{t("phantom")}</div>
        <div className="page-desc">{lang==="es"
          ? "El Phantom (Ross & Wilson 1974) es un referente unisex de 170.18 cm. La puntuación Z expresa cuántas desviaciones se aleja cada variable del Phantom tras escalar proporcionalmente por la talla. Es la base del fraccionamiento de Kerr."
          : "The Phantom (Ross & Wilson 1974) is a unisex 170.18 cm reference. The Z-score expresses how many SDs each variable departs from the Phantom after proportional scaling by stature — the backbone of Kerr's fractionation."}</div>
      </div>

      <div className="grid cols-4" style={{ marginBottom:18 }}>
        <div className="stat"><div className="k">{lang==="es"?"Talla":"Stature"}</div><div className="v">{m.height}<small>cm</small></div><div className="meta">Phantom 170.18 cm</div></div>
        <div className="stat"><div className="k">Z {lang==="es"?"peso":"weight"}</div><div className="v" style={{color:"var(--accent)"}}>{f2(ph.weightZ)}</div><div className="meta">{m.weight} kg</div></div>
        <div className="stat"><div className="k">|Z| {lang==="es"?"medio":"mean"}</div><div className="v">{meanAbsZ.toFixed(2)}</div><div className="meta">{ph.all.length} {lang==="es"?"variables":"variables"}</div></div>
        <div className="stat"><div className="k">{lang==="es"?"Escalado":"Scaling"}</div><div className="v" style={{fontSize:20}}>(170.18/{m.height})<small>ᵈ</small></div><div className="meta">d = 1 ({lang==="es"?"lineal":"linear"}) · 3 ({lang==="es"?"masa":"mass"})</div></div>
      </div>

      {/* tissue Z */}
      <div className="card" style={{ marginBottom:18 }}>
        <div className="card-head"><div><h3>{lang==="es"?"Z de las 5 masas (Kerr)":"Five-mass Z (Kerr)"}</h3><div className="sub">{lang==="es"?"Media de las Z de los sitios de cada tejido":"Mean site-Z per tissue"}</div></div>
          <div className="right"><EqPopover lang={lang} align="right" title="Kerr 1988" cite="Phantom · Ross & Wilson"
            formula={`Z_tejido = media de Z de sus sitios\nMasa = [(Z·s) + P]·(talla/170.18)³`} /></div></div>
        <div className="card-pad">
          <div className="grid cols-5" style={{ gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
            {TISS.map(([k,c]) => (
              <div key={k} style={{ border:"1px solid var(--line)", borderRadius:12, padding:"13px 14px", background:"var(--surface-2)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}><span style={{width:9,height:9,borderRadius:2,background:c}} /><span style={{ fontSize:11.5, color:"var(--text-dim)" }}>{t(k)}</span></div>
                <div className="num" style={{ fontSize:22, color:c }}>{f2(fr.tissues[k].z)}</div>
                <div className="mono" style={{ fontSize:10.5, color:"var(--text-faint)", marginTop:2 }}>{fr.tissues[k].kg.toFixed(1)} kg · {fr.tissues[k].pctMeasured.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* per-variable Z table */}
      <div className="grid" style={{ gridTemplateColumns:"1fr 1fr 1fr", alignItems:"start" }}>
        {ph.groups.map(g => (
          <div key={g.key} className="card">
            <div className="card-head"><div><h3 style={{ fontSize:14 }}>{lang==="es"?g.es:g.en}</h3><div className="sub">{g.rows.length} {lang==="es"?"variables":"variables"}</div></div></div>
            <div className="card-pad" style={{ paddingTop:8 }}>
              {g.rows.map(rw => (
                <div key={rw.key} style={{ padding:"9px 0", borderBottom:"1px dashed var(--line)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
                    <span style={{ fontSize:12.5 }}>{lang==="es"?rw.es:rw.en}</span>
                    <span style={{ display:"flex", gap:9, alignItems:"baseline" }}>
                      <span className="mono" style={{ fontSize:12 }}>{rw.value}<span style={{color:"var(--text-faint)",fontSize:9.5}}> {rw.u}</span></span>
                      <span className="mono" style={{ fontSize:12.5, fontWeight:600, color: rw.z>=0?"var(--fr-muscle)":"var(--fr-residual)", width:46, textAlign:"right" }}>{f2(rw.z)}</span>
                    </span>
                  </div>
                  <ZBar z={rw.z} />
                  <div className="mono" style={{ fontSize:9.5, color:"var(--text-faint)", marginTop:4 }}>P {rw.P} · s {rw.s}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize:11, color:"var(--text-faint)", marginTop:14, textAlign:"center" }}>
        {lang==="es"?"Línea central = Phantom (Z = 0). Escala visible −3 … +3 DE. Verde = por encima del Phantom · rosa = por debajo.":"Centre line = Phantom (Z = 0). Visible scale −3 … +3 SD. Green above · pink below."}
      </p>
    </div>
  );
}
window.PhantomScreen = PhantomScreen;
