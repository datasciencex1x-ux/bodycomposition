/* screens_results.jsx — Motor de Cálculo / Resultados.  window.ResultsScreen */
const { useState: useStateR } = React;

const FR_META = [
  { key:"adipose",  color:"var(--fr-adipose)",  cite:"Kerr 1988 · Phantom Z", zone_es:"Tejido subcutáneo + profundo", zone_en:"Subcutaneous + deep" },
  { key:"muscle",   color:"var(--fr-muscle)",   cite:"Kerr 1988 · perímetros corr.", zone_es:"Músculo esquelético", zone_en:"Skeletal muscle" },
  { key:"bone",     color:"var(--fr-bone)",     cite:"Kerr 1988 · diámetros óseos", zone_es:"Esqueleto", zone_en:"Skeleton" },
  { key:"residual", color:"var(--fr-residual)", cite:"Kerr 1988 · tórax", zone_es:"Órganos / vísceras", zone_en:"Organs / viscera" },
  { key:"skin",     color:"var(--fr-skin)",     cite:"Kerr 1988 · superficie", zone_es:"Tegumento", zone_en:"Integument" },
];

function KPI({ k, v, unit, meta, accent }) {
  return (
    <div className="stat">
      <div className="k">{k}</div>
      <div className="v" style={accent ? { color: "var(--accent)" } : null}>{v}{unit && <small>{unit}</small>}</div>
      {meta && <div className="meta">{meta}</div>}
    </div>
  );
}

function ResultsScreen({ m, lang, t, patient }) {
  const E = window.BC_ENGINE, D = window.BC_DATA;
  const [selFr, setSelFr] = useStateR(null);
  const age = E.ageDecimal(patient.dob, patient.assessedOn);
  const fr = E.fractionation(m);
  const soma = E.somatotype(m, patient.sex);
  const bf = E.bodyFat(m, patient.sex, age);
  const rec = bf.rec;
  const idx = E.indices(m, patient.sex, fr, rec.pct);
  const catName = D.SOMA_CATS[lang][soma.category];

  const fmt = (x, d = 1) => x.toFixed(d);

  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">{patient.name} · {patient.id} · {age.toFixed(2)} {t("years")} · {t(patient.sex)}</div>
        <div className="page-title">{t("results_title")}</div>
        <div className="page-desc">{t("results_desc")}</div>
      </div>

      {/* KPI row */}
      <div className="grid cols-4" style={{ marginBottom: 18 }}>
        <KPI k={t("measured_w")} v={fmt(fr.measured)} unit=" kg" meta={`${lang==="es"?"Talla":"Stature"} ${m.height} cm · IMC ${(m.weight/((m.height/100)**2)).toFixed(1)}`} />
        <KPI k={t("structured_w")} v={fmt(fr.structured)} unit=" kg" accent meta={`${t("correction")} ×${fr.correction.toFixed(3)} · ${t("residual_w")} ${fr.residual>0?"+":""}${fmt(fr.residual)} kg`} />
        <KPI k={t("soma_title")} v={`${fmt(soma.endo)}–${fmt(soma.meso)}–${fmt(soma.ecto)}`} meta={catName} />
        <KPI k={`${lang==="es"?"Grasa":"Body fat"} · Durnin→Siri`} v={fmt(rec.pct)} unit=" %" meta={`${(lang==="es"?rec.cls.es:rec.cls.en)} · ${fmt(rec.fatKg)} kg`} />
      </div>

      {/* Fractionation + Somatotype */}
      <div className="grid" style={{ gridTemplateColumns: "1.25fr 1fr", marginBottom: 18 }}>
        {/* FRACTIONATION */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>{t("fractionation")}</h3>
              <div className="sub">{t("kerr_sub")}</div>
            </div>
            <div className="right">
              <EqPopover lang={lang} title="Kerr 1988 — 5 componentes" cite="Phantom · Ross & Wilson 1974"
                label={t("see_eq")}
                formula={`Z = (1/s)·[ V·(170.18/talla)^d − P ]\nMasa = [ (Z·s) + P ]·(talla/170.18)³\n\nPeso estructurado = Σ 5 masas\nFactor corrección = peso medido / estructurado\n  = ${fr.measured.toFixed(1)} / ${fr.structured.toFixed(1)} = ${fr.correction.toFixed(3)}`} />
            </div>
          </div>
          <div className="card-pad">
            <div className="grid" style={{ gridTemplateColumns: "1fr 150px", gap: 20, alignItems: "start" }}>
              <div>
                {/* stacked bar */}
                <div className="stackbar" style={{ marginBottom: 16 }}>
                  {FR_META.map(f => {
                    const seg = fr.tissues[f.key];
                    const dim = selFr && selFr !== f.key;
                    return <div key={f.key} title={t(f.key)} onMouseEnter={()=>setSelFr(f.key)} onMouseLeave={()=>setSelFr(null)}
                      style={{ flexGrow: seg.pctStruct, background: f.color, opacity: dim ? 0.25 : 1 }} />;
                  })}
                </div>
                {/* legend rows */}
                <div>
                  <div className="fr-row" style={{ borderBottom: "1px solid var(--line)", cursor: "default" }}>
                    <span></span>
                    <span className="fr-cite">{lang==="es"?"Componente":"Component"}</span>
                    <span className="fr-cite" style={{textAlign:"right"}}>{t("mass")}</span>
                    <span className="fr-pct">{t("pct_measured")}</span>
                    <span className="fr-pct">{t("pct_struct")}</span>
                  </div>
                  {FR_META.map(f => {
                    const seg = fr.tissues[f.key];
                    return (
                      <div key={f.key} className={"fr-row" + (selFr===f.key?" active":"")}
                        onMouseEnter={()=>setSelFr(f.key)} onMouseLeave={()=>setSelFr(null)}>
                        <span className="fr-swatch" style={{ background: f.color }} />
                        <span>
                          <div className="fr-name">{t(f.key)}</div>
                          <div className="fr-cite">Z = {seg.z.toFixed(2)} · {f.cite}</div>
                        </span>
                        <span className="fr-kg">{fmt(seg.kg)} <span style={{color:"var(--text-faint)",fontSize:11}}>kg</span></span>
                        <span className="fr-pct">{fmt(seg.pctMeasured)}%</span>
                        <span className="fr-pct" style={{color:"var(--text)"}}>{fmt(seg.pctStruct)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* body map placeholder */}
              <div className="bodymap-ph" style={{ minHeight: 280 }}>
                <Icon n="user" s={34} />
                <div className="mono">{lang==="es"?"Figura corporal":"Body figure"}</div>
                <div style={{ fontSize: 11, lineHeight: 1.5 }}>
                  {selFr
                    ? <span style={{ color: FR_META.find(f=>f.key===selFr).color, fontWeight:600 }}>{t(selFr)} → {lang==="es"?FR_META.find(f=>f.key===selFr).zone_es:FR_META.find(f=>f.key===selFr).zone_en}</span>
                    : (lang==="es"?"Mapa de 5 fracciones — ilustración a integrar":"5-fraction map — illustration to drop in")}
                </div>
                <div className="mono" style={{ opacity:.6 }}>SVG / PNG · 1:2</div>
              </div>
            </div>
          </div>
        </div>

        {/* SOMATOTYPE */}
        <div className="card">
          <div className="card-head">
            <div><h3>{t("soma_title")}</h3><div className="sub">{t("soma_sub")} · Carter & Heath 1990</div></div>
            <div className="right"><Badge tone="info" dot={false}>{catName}</Badge></div>
          </div>
          <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SomatoChart soma={soma} lang={lang} size={300} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {[["endo",soma.endo,"var(--fr-adipose)"],["meso",soma.meso,"var(--fr-muscle)"],["ecto",soma.ecto,"var(--fr-bone)"]].map(([k,v,c]) => (
                <div key={k} style={{ textAlign:"center", padding:"10px 4px", border:"1px solid var(--line)", borderRadius:10, background:"var(--surface-2)" }}>
                  <div className="num" style={{ fontSize:24, color:c }}>{fmt(v)}</div>
                  <div style={{ fontSize:11, color:"var(--text-dim)", marginTop:2 }}>{t(k)}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span className="mono" style={{ fontSize:11, color:"var(--text-faint)" }}>X {soma.X.toFixed(2)} · Y {soma.Y.toFixed(2)} · HWR {soma.hwr.toFixed(1)}</span>
              <EqPopover lang={lang} align="right" title="Heath-Carter" cite="antropométrico" label={t("see_eq")}
                formula={`Endo = −0.7182 + 0.1451·X − 0.00068·X² + 1.4e⁻⁶·X³\n  X = (Σ trí+sub+supraesp)·(170.18/talla)\nMeso = (0.858·húmero + 0.601·fémur\n  + 0.188·brazoC + 0.161·pantC) − 0.131·talla + 4.5\nEcto: HWR = talla/∛peso = ${soma.hwr.toFixed(2)}\n  HWR≥40.75 → 0.732·HWR − 28.58`} />
            </div>
          </div>
        </div>
      </div>

      {/* BODY FAT equation comparison */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head">
          <div><h3>{t("bodyfat_eq")}</h3><div className="sub">{t("bodyfat_sub")}</div></div>
        </div>
        <div className="card-pad">
          <table className="data">
            <thead><tr>
              <th>{t("method")}</th><th>{t("population")}</th>
              <th className="n">% {lang==="es"?"graso":"fat"}</th>
              <th style={{width:"30%"}}></th>
              <th className="n">{lang==="es"?"Grasa":"Fat"} (kg)</th>
              <th>{t("classification")}</th><th></th>
            </tr></thead>
            <tbody>
              {bf.list.map(x => {
                const isRec = x.key === bf.recommended;
                const maxPct = Math.max(...bf.list.map(b=>b.pct));
                return (
                  <tr key={x.key} className="row-hover">
                    <td style={{fontWeight:600}}>{x.author.split("→")[0].trim()}{x.author.includes("→") && <span style={{color:"var(--text-faint)"}}> → {x.author.split("→")[1].trim()}</span>}
                      {isRec && <Badge tone="good" dot={false}>{t("recommended")}</Badge>}</td>
                    <td style={{color:"var(--text-dim)"}}>{x.pop}</td>
                    <td className="n" style={{fontSize:15, color: isRec?"var(--accent)":"var(--text)"}}>{fmt(x.pct)}</td>
                    <td><div className="aff-bar"><div style={{width:(x.pct/maxPct*100)+"%", background: isRec?"linear-gradient(90deg,var(--accent),var(--accent-2))":"var(--fr-muscle)"}} /></div></td>
                    <td className="n">{fmt(x.fatKg)}</td>
                    <td><Badge tone={x.cls.tone}>{lang==="es"?x.cls.es:x.cls.en}</Badge></td>
                    <td><EqPopover lang={lang} align="right" title={x.author} cite={x.pop} label={t("see_eq")} formula={x.formula} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* INDICES */}
      <div className="card">
        <div className="card-head"><div><h3>{t("indices")}</h3><div className="sub">{lang==="es"?"Valor · fórmula · interpretación · rango de referencia":"Value · formula · interpretation · reference range"}</div></div></div>
        <div className="card-pad">
          <div className="grid cols-4">
            {idx.map(ix => (
              <div key={ix.k} className="stat" style={{ padding: "14px 15px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div className="k">{lang==="es"?ix.es:ix.en}</div>
                  <EqPopover lang={lang} align="right" title={lang==="es"?ix.es:ix.en} cite={ix.cite} label="ƒ"
                    formula={`${ix.f}\n\n= ${ix.v.toFixed(ix.dec||1)} ${ix.u}\n${t("ref_range")}: ${ix.ref}`} />
                </div>
                <div className="v" style={{ fontSize: 23, marginTop: 6 }}>{ix.v.toFixed(ix.dec||1)}<small>{ix.u}</small></div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop: 8 }}>
                  <Badge tone={ix.tone} dot={false}>{lang==="es"?ix.i_es:ix.i_en}</Badge>
                  <span className="mono" style={{ fontSize:10, color:"var(--text-faint)" }}>{ix.ref}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.ResultsScreen = ResultsScreen;
