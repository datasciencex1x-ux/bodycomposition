// ============================================================================
// 8.  BIBLIOTECA DE MÉTODOS — registro documental de todas las ecuaciones.
//     Incluye las implementadas y las referenciadas (con su cita).
// ============================================================================

export interface MethodDoc {
  id: string;
  name: string;
  author: string;
  year: number;
  category: 'fraccionamiento' | 'somatotipo' | 'grasa' | 'músculo' | 'índice' | 'conversión';
  population: string;
  formula: string;
  notes: string;
  implemented: boolean;
}

export const METHOD_LIBRARY: MethodDoc[] = [
  {
    id: 'kerr-1988', name: 'Fraccionamiento 5 componentes', author: 'Kerr', year: 1988,
    category: 'fraccionamiento', population: 'Ambos sexos, 6–77 años',
    formula: 'Masa = [(Z̄·s)+p]·(talla/170.18)³ con Z phantom por tejido',
    notes: 'Piel, adiposo, músculo, hueso y residual mediante estratagema Phantom (Ross & Wilson).',
    implemented: true,
  },
  {
    id: 'drinkwater-ross-1980', name: 'Fraccionamiento Phantom', author: 'Drinkwater & Ross', year: 1980,
    category: 'fraccionamiento', population: 'Ambos sexos',
    formula: 'Puntuaciones Z phantom → masas tisulares', notes: 'Base del método de Kerr; componente muscular coherente.',
    implemented: true,
  },
  {
    id: 'heath-carter', name: 'Somatotipo antropométrico', author: 'Heath & Carter', year: 1967,
    category: 'somatotipo', population: 'General',
    formula: 'Endo/Meso/Ecto a partir de pliegues, diámetros, perímetros y talla',
    notes: 'Somatocarta, 13 categorías, SAM y SAD.', implemented: true,
  },
  {
    id: 'durnin-womersley', name: 'Densidad por 4 pliegues', author: 'Durnin & Womersley', year: 1974,
    category: 'grasa', population: 'Adultos 16–72 años',
    formula: 'D = c − m·log₁₀(Σ4); %G por Siri/Brozek', notes: 'Logarítmica por sexo y grupo etario.', implemented: true,
  },
  {
    id: 'jackson-pollock-1978', name: '3 y 7 pliegues (♂)', author: 'Jackson & Pollock', year: 1978,
    category: 'grasa', population: 'Hombres adultos',
    formula: 'D = 1.10938 − 0.0008267·Σ3 + 0.0000016·Σ3² − 0.0002574·edad',
    notes: 'Requiere pliegue pectoral (no ISAK restringido).', implemented: true,
  },
  {
    id: 'jackson-pollock-ward-1980', name: '3 y 7 pliegues (♀)', author: 'Jackson, Pollock & Ward', year: 1980,
    category: 'grasa', population: 'Mujeres adultas',
    formula: 'D = 1.0994921 − 0.0009929·Σ3 + 0.0000023·Σ3² − 0.0001392·edad', notes: 'Σ3: tríceps, suprailíaco, muslo.', implemented: true,
  },
  {
    id: 'withers-1987', name: 'Densidad en deportistas', author: 'Withers et al.', year: 1987,
    category: 'grasa', population: 'Deportistas',
    formula: '♂: D=1.0988−0.0004·Σ7 · ♀: D=1.20953−0.08294·log₁₀(Σ4)', notes: 'Coeficientes a verificar con fuente primaria.', implemented: true,
  },
  {
    id: 'carter-1982', name: 'Ecuación de Carter', author: 'Carter', year: 1982,
    category: 'grasa', population: 'Deportistas',
    formula: 'Densidad / % graso antropométrico', notes: 'Referenciada; usar Yuhasz mod. Carter como implementación práctica.', implemented: false,
  },
  {
    id: 'faulkner-1968', name: '%Grasa 4 pliegues', author: 'Faulkner', year: 1968,
    category: 'grasa', population: 'Adultos/deportistas',
    formula: '%G = Σ4·0.153 + 5.783', notes: 'Σ4: tríceps, subescapular, supraespinal, abdominal.', implemented: true,
  },
  {
    id: 'yuhasz-1974', name: '%Grasa 6 pliegues', author: 'Yuhasz', year: 1974,
    category: 'grasa', population: 'Adultos/deportistas',
    formula: '♂: Σ6·0.1051+2.585 · ♀: Σ6·0.1548+3.580', notes: 'Modificado por Carter.', implemented: true,
  },
  {
    id: 'slaughter-1988', name: '%Grasa niños/adolescentes', author: 'Slaughter et al.', year: 1988,
    category: 'grasa', population: 'Niños y adolescentes',
    formula: '♂: 0.735·(tri+pant)+1.0 · ♀: 0.610·(tri+pant)+5.1', notes: 'Versión tríceps+pantorrilla.', implemented: true,
  },
  {
    id: 'siri-1961', name: 'Conversión densidad→%grasa', author: 'Siri', year: 1961,
    category: 'conversión', population: 'General', formula: '%G = (495/D) − 450', notes: '', implemented: true,
  },
  {
    id: 'brozek-1963', name: 'Conversión densidad→%grasa', author: 'Brozek et al.', year: 1963,
    category: 'conversión', population: 'General', formula: '%G = (4.57/D − 4.142)·100', notes: '', implemented: true,
  },
  {
    id: 'lee-2000', name: 'Masa muscular esquelética', author: 'Lee et al.', year: 2000,
    category: 'músculo', population: 'Adultos multiétnicos',
    formula: 'SM = Talla·(0.00744·CAG²+0.00088·CTG²+0.00441·CCG²)+2.4·sexo−0.048·edad+etnia+7.8', notes: 'Perímetros corregidos.', implemented: true,
  },
  {
    id: 'martin-1990', name: 'Masa muscular (varones)', author: 'Martin et al.', year: 1990,
    category: 'músculo', population: 'Varones',
    formula: 'MM(g)=Talla·(0.0553·CMG²+0.0987·AnteBr²+0.0331·CPG²)−2445', notes: 'Validada en cadáveres masculinos.', implemented: true,
  },
  {
    id: 'matiegka-1921', name: 'Masa muscular antropométrica', author: 'Matiegka', year: 1921,
    category: 'músculo', population: 'General',
    formula: 'M = Talla·r²·6.5/1000', notes: 'r = radio medio de perímetros corregidos.', implemented: true,
  },
  {
    id: 'doupe-1997', name: 'Masa muscular', author: 'Doupe et al.', year: 1997,
    category: 'músculo', population: 'Adultos', formula: 'Perímetros corregidos + talla',
    notes: 'Referenciada; coeficientes a verificar con fuente primaria.', implemented: false,
  },
  {
    id: 'heymsfield-1982', name: 'Masa muscular (AMB)', author: 'Heymsfield', year: 1982,
    category: 'músculo', population: 'Adultos', formula: 'Área muscular del brazo corregida',
    notes: 'AMB implementada en el módulo de índices.', implemented: false,
  },
  {
    id: 'poortmans-2005', name: 'Masa muscular pediátrica', author: 'Poortmans et al.', year: 2005,
    category: 'músculo', population: 'Niños y adolescentes', formula: 'Adaptación pediátrica de Lee (2000)',
    notes: 'Aplicar Lee con cautela en <18; referenciada.', implemented: false,
  },
];
