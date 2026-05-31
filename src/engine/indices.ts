// ============================================================================
// 5.5  ÍNDICES ANTROPOMÉTRICOS
// ============================================================================

import { Anthropometry, EvaluationContext } from './types';

export type RiskLevel = 'low' | 'normal' | 'moderate' | 'high' | 'veryhigh' | 'na';

export interface IndexResult {
  id: string;
  label: string;
  value: number | null;
  unit: string;
  formula: string;
  interpretation: string;
  reference: string;
  level: RiskLevel;
}

export interface IndexInputs {
  fatPct?: number;       // % grasa de referencia (para FMI/FFMI)
  muscleKg?: number;     // masa muscular (Kerr) para relaciones
  boneKg?: number;       // masa ósea (Kerr)
  adiposeKg?: number;    // masa adiposa (Kerr)
}

const r2 = (x: number) => Math.round(x * 100) / 100;

function bmiLevel(bmi: number): { level: RiskLevel; txt: string } {
  if (bmi < 18.5) return { level: 'moderate', txt: 'Bajo peso' };
  if (bmi < 25) return { level: 'normal', txt: 'Normopeso' };
  if (bmi < 30) return { level: 'moderate', txt: 'Sobrepeso' };
  if (bmi < 35) return { level: 'high', txt: 'Obesidad grado I' };
  if (bmi < 40) return { level: 'high', txt: 'Obesidad grado II' };
  return { level: 'veryhigh', txt: 'Obesidad grado III' };
}

export function computeIndices(
  a: Anthropometry,
  ctx: EvaluationContext,
  io: IndexInputs = {},
): IndexResult[] {
  const out: IndexResult[] = [];
  const h = a.height;
  const hm = h ? h / 100 : undefined;
  const w = a.weight;

  // IMC / BMI
  if (hm && w) {
    const bmi = w / hm ** 2;
    const c = bmiLevel(bmi);
    out.push({
      id: 'bmi', label: 'IMC / BMI', value: r2(bmi), unit: 'kg/m²',
      formula: 'IMC = peso / talla²', interpretation: c.txt,
      reference: 'OMS: 18.5–24.9 normopeso', level: c.level,
    });
  }

  // ICC / WHR
  if (a.waist && a.hip) {
    const whr = a.waist / a.hip;
    let level: RiskLevel = 'normal';
    if (ctx.sex === 'M') level = whr >= 1.0 ? 'high' : whr >= 0.9 ? 'moderate' : 'low';
    else level = whr >= 0.85 ? 'high' : whr >= 0.8 ? 'moderate' : 'low';
    out.push({
      id: 'whr', label: 'Índice cintura-cadera (ICC)', value: r2(whr), unit: '',
      formula: 'ICC = cintura / cadera',
      interpretation: level === 'high' ? 'Riesgo cardiometabólico elevado' : level === 'moderate' ? 'Riesgo moderado' : 'Riesgo bajo',
      reference: ctx.sex === 'M' ? '♂ riesgo ≥0.90' : '♀ riesgo ≥0.85', level,
    });
  }

  // ICT / WHtR
  if (a.waist && h) {
    const whtr = a.waist / h;
    const level: RiskLevel = whtr >= 0.6 ? 'high' : whtr >= 0.5 ? 'moderate' : 'normal';
    out.push({
      id: 'whtr', label: 'Índice cintura-talla (ICT)', value: r2(whtr), unit: '',
      formula: 'ICT = cintura / talla',
      interpretation: whtr >= 0.5 ? 'Por encima del punto de corte (0.5)' : 'Saludable',
      reference: 'Punto de corte 0.5', level,
    });
  }

  // FMI / FFMI
  if (hm && w && io.fatPct !== undefined) {
    const fatMass = (w * io.fatPct) / 100;
    const ffm = w - fatMass;
    const fmi = fatMass / hm ** 2;
    const ffmi = ffm / hm ** 2;
    const ffmiNorm = ffmi + 6.1 * (1.8 - hm);
    out.push({
      id: 'fmi', label: 'Índice de masa grasa (FMI)', value: r2(fmi), unit: 'kg/m²',
      formula: 'FMI = masa grasa / talla²',
      interpretation: `Masa grasa ${r2(fatMass)} kg`,
      reference: ctx.sex === 'M' ? '♂ normal 3–6' : '♀ normal 5–9', level: 'na',
    });
    out.push({
      id: 'ffmi', label: 'Índice de masa libre de grasa (FFMI)', value: r2(ffmi), unit: 'kg/m²',
      formula: 'FFMI = masa libre de grasa / talla² (normalizado: ' + r2(ffmiNorm) + ')',
      interpretation: `MLG ${r2(ffm)} kg`,
      reference: ctx.sex === 'M' ? '♂ 18–22 (≈25 límite natural)' : '♀ 14–18', level: 'na',
    });
  }

  // Índice de conicidad
  if (a.waist && w && hm) {
    const ci = a.waist / 100 / (0.109 * Math.sqrt(w / hm));
    out.push({
      id: 'conicity', label: 'Índice de conicidad', value: r2(ci), unit: '',
      formula: 'C = cintura(m) / [0.109·√(peso/talla)]',
      interpretation: ci >= 1.25 ? 'Acumulación central elevada' : 'Dentro de rango',
      reference: 'Riesgo ≈ >1.25', level: ci >= 1.25 ? 'high' : 'normal',
    });
  }

  // BAI
  if (a.hip && hm) {
    const bai = a.hip / Math.pow(hm, 1.5) - 18;
    out.push({
      id: 'bai', label: 'Índice de adiposidad corporal (BAI)', value: r2(bai), unit: '%',
      formula: 'BAI = cadera / talla^1.5 − 18',
      interpretation: 'Estimación de % graso por perímetro de cadera',
      reference: ctx.sex === 'M' ? '♂ 8–21%' : '♀ 21–33%', level: 'na',
    });
  }

  // Índice córmico
  if (a.sittingHeight && h) {
    const cormic = (a.sittingHeight / h) * 100;
    const level: RiskLevel = 'na';
    const txt = cormic < 51.5 ? 'Macrosquélico (piernas largas)' : cormic <= 53.5 ? 'Mesosquélico' : 'Braquisquélico (tronco largo)';
    out.push({
      id: 'cormic', label: 'Índice córmico', value: r2(cormic), unit: '%',
      formula: 'Córmico = (talla sentado / talla)·100', interpretation: txt,
      reference: '51.5–53.5 mesosquélico', level,
    });
    // Índice esquélico
    const skelic = ((h - a.sittingHeight) / a.sittingHeight) * 100;
    out.push({
      id: 'skelic', label: 'Índice esquélico', value: r2(skelic), unit: '%',
      formula: 'Esquélico = (talla − talla sentado) / talla sentado ·100',
      interpretation: 'Proporción de longitud de extremidades inferiores',
      reference: 'Mayor = piernas relativamente más largas', level: 'na',
    });
  }

  // AMB y AGB (brazo)
  if (a.armRelaxed && a.triceps) {
    const tsfCm = a.triceps / 10;
    const muscleD = a.armRelaxed - Math.PI * tsfCm;
    let amb = muscleD ** 2 / (4 * Math.PI);
    amb -= ctx.sex === 'M' ? 10 : 6.5; // corrección ósea
    out.push({
      id: 'amb', label: 'Área muscular del brazo (AMB)', value: r2(Math.max(0, amb)), unit: 'cm²',
      formula: 'AMB = [perím.brazo − π·PliegueTri]² / 4π − (10♂/6.5♀)',
      interpretation: 'Reserva muscular del brazo', reference: 'Corregida por hueso', level: 'na',
    });
    const agb = (a.armRelaxed * tsfCm) / 2 - (Math.PI * tsfCm ** 2) / 4;
    out.push({
      id: 'agb', label: 'Área grasa del brazo (AGB)', value: r2(agb), unit: 'cm²',
      formula: 'AGB = (perím.brazo·PliegueTri/2) − (π·PliegueTri²/4)',
      interpretation: 'Reserva grasa del brazo', reference: '—', level: 'na',
    });
  }

  // Índice de robustez / Rohrer
  if (w && hm) {
    const rohrer = w / Math.pow(hm, 3);
    out.push({
      id: 'rohrer', label: 'Índice de robustez (Rohrer)', value: r2(rohrer), unit: 'kg/m³',
      formula: 'Rohrer = peso / talla³',
      interpretation: rohrer < 11 ? 'Constitución delgada' : rohrer <= 14 ? 'Constitución media' : 'Constitución robusta',
      reference: '11–14 medio', level: 'na',
    });
  }

  // Σ de pliegues y Σ corregido por talla
  const sfKeys: (keyof Anthropometry)[] = ['triceps', 'subscapular', 'supraspinale', 'abdominal', 'frontThigh', 'medialCalf'];
  const sfVals = sfKeys.map((k) => a[k]).filter((v): v is number => v !== undefined && !Number.isNaN(v));
  if (sfVals.length === sfKeys.length) {
    const s6 = sfVals.reduce((s, v) => s + v, 0);
    out.push({
      id: 'sum6', label: 'Σ 6 pliegues', value: r2(s6), unit: 'mm',
      formula: 'Σ = tríceps+subescapular+supraespinal+abdominal+muslo+pantorrilla',
      interpretation: 'Adiposidad subcutánea total', reference: '—', level: 'na',
    });
    if (h) {
      const s6c = s6 * (170.18 / h);
      out.push({
        id: 'sum6c', label: 'Σ 6 pliegues corregida por talla', value: r2(s6c), unit: 'mm',
        formula: 'Σc = Σ6 · (170.18 / talla)', interpretation: 'Permite comparar entre tallas',
        reference: 'Estandarizado a Phantom', level: 'na',
      });
    }
  }

  // WWI (Weight-adjusted Waist Index)
  if (a.waist && w) {
    const wwi = a.waist / Math.sqrt(w);
    out.push({
      id: 'wwi', label: 'WWI (Weight-adjusted Waist Index)', value: r2(wwi), unit: 'cm/√kg',
      formula: 'WWI = cintura / √peso',
      interpretation: 'Adiposidad central ajustada por peso (↑ = mayor riesgo)',
      reference: '≈ 10–11 referencia', level: 'na',
    });
  }

  // Relaciones de tejidos (Kerr)
  if (io.muscleKg && io.boneKg) {
    out.push({
      id: 'mo', label: 'Relación músculo-óseo (M/O)', value: r2(io.muscleKg / io.boneKg), unit: '',
      formula: 'M/O = masa muscular / masa ósea (Kerr)',
      interpretation: 'Mayor = mejor desarrollo muscular relativo', reference: '—', level: 'na',
    });
  }
  if (io.adiposeKg && io.muscleKg) {
    out.push({
      id: 'am', label: 'Relación adiposo-muscular', value: r2(io.adiposeKg / io.muscleKg), unit: '',
      formula: 'A/M = masa adiposa / masa muscular (Kerr)',
      interpretation: 'Menor = perfil más magro', reference: '—', level: 'na',
    });
  }

  return out;
}
