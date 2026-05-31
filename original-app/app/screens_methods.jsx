/* screens_methods.jsx — documented equation library.  window.MethodsScreen */
const { useState: useStateM } = React;

const METHODS = [
  { cat:"cat_fraction", name:"Kerr — 5 fracciones", author:"Kerr & Ross", year:1988, pop:"6–77 años · Phantom", age:"6–77",
    f:"Z = (1/s)·[V·(170.18/talla)^d − P] · Masa = [(Z·s)+P]·(talla/170.18)³" },
  { cat:"cat_fraction", name:"Fraccionamiento Drinkwater-Ross", author:"Drinkwater & Ross", year:1980, pop:"General", age:"adultos",
    f:"Estrategia Phantom de proporcionalidad (4 masas + piel)." },
  { cat:"cat_soma", name:"Somatotipo Heath-Carter", author:"Carter & Heath", year:1990, pop:"General", age:"todas",
    f:"Endo = −0.7182 + 0.1451·X − 0.00068·X² + 1.4e⁻⁶·X³ · Meso = (0.858·húmero+0.601·fémur+0.188·brazoC+0.161·pantC) − 0.131·talla + 4.5 · Ecto via HWR" },
  { cat:"cat_fat", name:"Durnin & Womersley → Siri", author:"Durnin & Womersley / Siri", year:1974, pop:"Adultos ♂♀", age:"17–72",
    f:"D = c₁ − c₂·log₁₀(Σ4) · %G = (495/D) − 450" },
  { cat:"cat_fat", name:"Brožek (conversión densidad)", author:"Brožek et al.", year:1963, pop:"Adultos", age:"adultos",
    f:"%G = (4.57/D − 4.142)·100" },
  { cat:"cat_fat", name:"Faulkner", author:"Faulkner", year:1968, pop:"General", age:"adultos",
    f:"%G = 0.153·(tríceps+subesc+supraesp+abdominal) + 5.783" },
  { cat:"cat_fat", name:"Yuhasz", author:"Yuhasz", year:1974, pop:"Deportistas ♂♀", age:"adultos",
    f:"♂ %G = 3.64 + 0.097·Σ6 · ♀ %G = 4.56 + 0.143·Σ6" },
  { cat:"cat_fat", name:"Withers", author:"Withers et al.", year:1987, pop:"Deportistas ♂", age:"adultos",
    f:"D = 1.0988 − 0.0004·Σ7 → Siri" },
  { cat:"cat_fat", name:"Slaughter", author:"Slaughter et al.", year:1988, pop:"Niños/adolescentes", age:"8–18",
    f:"♂ %G = 0.735·(tríceps+pantorrilla) + 1.0 · ♀ %G = 0.610·(…) + 5.1" },
  { cat:"cat_fat", name:"Jackson & Pollock 3/7", author:"Jackson & Pollock", year:1978, pop:"Adultos ♂", age:"18–61",
    f:"Densidad por 3 ó 7 pliegues (requiere pectoral/axilar) → Siri" },
  { cat:"cat_muscle", name:"Lee et al. (MME)", author:"Lee et al.", year:2000, pop:"Adultos · DXA", age:"≥18",
    f:"MME = talla·(0.00744·PBc²+0.00088·PMc²+0.00441·PPc²) + 2.4·sexo − 0.048·edad + etnia + 7.8" },
  { cat:"cat_muscle", name:"Martin et al.", author:"Martin et al.", year:1990, pop:"Adultos ♂ · cadáver", age:"adultos",
    f:"MM(g) = talla·(0.0553·PMc²+0.0987·antebrazo²+0.0331·PPc²) − 2445" },
  { cat:"cat_muscle", name:"Matiegka", author:"Matiegka", year:1921, pop:"General", age:"adultos",
    f:"MM = talla·r²·6.5/1000, r = (Σ perím. corregidos /4)/2π" },
  { cat:"cat_muscle", name:"Poortmans (pediátrico)", author:"Poortmans et al.", year:2005, pop:"Niños/adolescentes", age:"7–17",
    f:"Adaptación de Lee 2000 validada en población pediátrica." },
  { cat:"cat_muscle", name:"Heymsfield (AMA)", author:"Heymsfield et al.", year:1982, pop:"Adultos", age:"adultos",
    f:"Estimación vía área muscular del brazo corregida." },
  { cat:"cat_muscle", name:"Doupe et al.", author:"Doupe et al.", year:1997, pop:"Adultos", age:"adultos",
    f:"Predicción antropométrica de masa magra." },
  { cat:"cat_index", name:"IMC / OMS", author:"Quetelet / OMS", year:1972, pop:"General", age:"todas", f:"IMC = peso / talla² (kg·m⁻²)" },
  { cat:"cat_index", name:"Índice cintura-cadera", author:"OMS", year:2008, pop:"General", age:"adultos", f:"ICC = cintura / cadera" },
  { cat:"cat_index", name:"Índice cintura-talla", author:"Ashwell", year:1996, pop:"General", age:"todas", f:"ICT = cintura / talla · corte 0.5" },
  { cat:"cat_index", name:"FMI / FFMI", author:"VanItallie / Kelly", year:2009, pop:"General", age:"adultos", f:"FMI = grasa/talla² · FFMI = (peso−grasa)/talla²" },
  { cat:"cat_index", name:"Índice de conicidad", author:"Valdez", year:1991, pop:"General", age:"adultos", f:"C = cintura / (0.109·√(peso/talla))" },
  { cat:"cat_index", name:"Índice de adiposidad corporal", author:"Bergman et al.", year:2011, pop:"General", age:"adultos", f:"BAI = cadera/talla^1.5 − 18" },
  { cat:"cat_index", name:"WWI", author:"Park et al.", year:2018, pop:"General", age:"adultos", f:"WWI = cintura / √peso" },
  { cat:"cat_index", name:"Índice esquélico (Manouvrier)", author:"Manouvrier", year:1902, pop:"General", age:"todas", f:"IE = (talla − talla sentado) / talla sentado × 100" },
  { cat:"cat_index", name:"Envergadura relativa", author:"Kinantropometría", year:1996, pop:"General", age:"todas", f:"ER = envergadura / talla × 100 (corte ≈ 100)" },
  { cat:"cat_index", name:"Índice acromio-ilíaco", author:"Proporcionalidad", year:1980, pop:"General", age:"adultos", f:"IAI = biiliocrestídeo / biacromial × 100" },
  { cat:"cat_index", name:"Estatura relativa (Phantom)", author:"Ross & Wilson", year:1974, pop:"General", age:"todas", f:"talla / 170.18 × 100" },
  { cat:"cat_index", name:"Índice masa muscular esq. (SMMI)", author:"Janssen et al.", year:2002, pop:"General", age:"adultos", f:"SMMI = masa muscular / talla²" },
  { cat:"cat_metab", name:"Mifflin-St Jeor", author:"Mifflin et al.", year:1990, pop:"General · validada", age:"≥18", f:"TMB = 10·peso + 6.25·talla − 5·edad + (♂ 5 / ♀ −161)" },
  { cat:"cat_metab", name:"Harris-Benedict (rev.)", author:"Roza & Shizgal", year:1984, pop:"General", age:"adultos", f:"♂ 88.36 + 13.40·peso + 4.80·talla − 5.68·edad" },
  { cat:"cat_metab", name:"Cunningham", author:"Cunningham", year:1980, pop:"Deportistas · MLG", age:"adultos", f:"TMB = 500 + 22·MLG" },
  { cat:"cat_metab", name:"Katch-McArdle", author:"Katch & McArdle", year:1996, pop:"Deportistas · MLG", age:"adultos", f:"TMB = 370 + 21.6·MLG" },
  { cat:"cat_metab", name:"Gasto energético total (GET)", author:"FAO/OMS · PAL", year:2001, pop:"General", age:"todas", f:"GET = TMB × factor de actividad física (PAL 1.2–2.2)" },
];

function MethodsScreen({ ctx }) {
  const { t, lang } = ctx;
  const [q, setQ] = useStateM("");
  const [cat, setCat] = useStateM("");
  const cats = ["cat_fraction","cat_soma","cat_fat","cat_muscle","cat_index","cat_metab"];
  const filtered = METHODS.filter(m =>
    (!cat || m.cat === cat) &&
    (!q || (m.name + m.author).toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">{METHODS.length} {lang==="es"?"ecuaciones documentadas":"documented equations"}</div>
        <div className="page-title">{t("methods")}</div>
        <div className="page-desc">{t("meth_desc")}</div>
      </div>
      <div className="filters">
        <div className="search-box"><Icon n="methods" s={16} className="nav-ico" /><input value={q} onChange={e=>setQ(e.target.value)} placeholder={t("search_methods")} /></div>
        <div className="seg">
          <button className={cat===""?"on":""} onClick={()=>setCat("")}>{lang==="es"?"Todas":"All"}</button>
          {cats.map(c => <button key={c} className={cat===c?"on":""} onClick={()=>setCat(c)}>{t(c)}</button>)}
        </div>
      </div>
      <div className="card">
        <div className="card-pad">
          <div className="meth-row" style={{ borderBottom:"1px solid var(--line-strong)" }}>
            <span className="fr-cite">{lang==="es"?"Método":"Method"}</span>
            <span className="fr-cite">{t("author")}</span>
            <span className="fr-cite">{t("year")}</span>
            <span className="fr-cite">{lang==="es"?"Fórmula / Población":"Formula / Population"}</span>
          </div>
          {filtered.map((m, i) => (
            <div key={i} className="meth-row">
              <span>
                <div style={{ fontWeight:600, fontSize:13.5 }}>{m.name}</div>
                <span className="meth-tag" style={{ marginTop:4, display:"inline-block" }}>{t(m.cat)}</span>
              </span>
              <span style={{ fontSize:12.5, color:"var(--text-dim)" }}>{m.author}</span>
              <span className="mono" style={{ fontSize:13 }}>{m.year}</span>
              <span>
                <div className="formula" style={{ margin:0, fontSize:11 }}>{m.f}</div>
                <div style={{ fontSize:10.5, color:"var(--text-faint)", marginTop:4 }}>{m.pop} · {t("range_age")}: {m.age}</div>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.MethodsScreen = MethodsScreen;
