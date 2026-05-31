// ============================================================================
// 5.4  Ecuaciones de MASA GRASA / TEJIDO ADIPOSO  (+ conversión densidad→%grasa)
// ============================================================================

import { Anthropometry, EvaluationContext, MethodResult, DensityConversion, AnthroKey } from './types';
import { sum } from './util';

// ---- Conversión densidad corporal → % grasa --------------------------------

/** Siri (1961): %G = (495/D) − 450 */
export function siri(density: number): number {
  return 495 / density - 450;
}
/** Brozek et al. (1963): %G = (4.57/D − 4.142)·100 */
export function brozek(density: number): number {
  return (4.57 / density - 4.142) * 100;
}
export function densityToFat(density: number, conv: DensityConversion): number {
  return conv === 'brozek' ? brozek(density) : siri(density);
}

function result(
  base: Omit<MethodResult, 'value' | 'applicable' | 'missing' | 'unit'> & { unit?: string },
  value: number | null,
  missing: AnthroKey[],
): MethodResult {
  return {
    unit: '% grasa',
    ...base,
    value: value === null || Number.isNaN(value) ? null : Math.round(value * 100) / 100,
    applicable: value !== null && !Number.isNaN(value) && missing.length === 0,
    missing,
  };
}

function req(a: Anthropometry, keys: AnthroKey[]): AnthroKey[] {
  return keys.filter((k) => a[k] === undefined || Number.isNaN(a[k] as number));
}

// ---- Durnin & Womersley (1974) — densidad por 4 pliegues (log10) -----------

const DW: Record<'M' | 'F', { lo: number; c: number; m: number }[]> = {
  M: [
    { lo: 0, c: 1.162, m: 0.063 },
    { lo: 20, c: 1.1631, m: 0.0632 },
    { lo: 30, c: 1.1422, m: 0.0544 },
    { lo: 40, c: 1.162, m: 0.07 },
    { lo: 50, c: 1.1715, m: 0.0779 },
  ],
  F: [
    { lo: 0, c: 1.1549, m: 0.0678 },
    { lo: 20, c: 1.1599, m: 0.0717 },
    { lo: 30, c: 1.1423, m: 0.0632 },
    { lo: 40, c: 1.1333, m: 0.0612 },
    { lo: 50, c: 1.1339, m: 0.0645 },
  ],
};

export function durninWomersley(
  a: Anthropometry,
  ctx: EvaluationContext,
  conv: DensityConversion,
): MethodResult {
  const keys: AnthroKey[] = ['biceps', 'triceps', 'subscapular', 'iliacCrest'];
  const missing = req(a, keys);
  const base = {
    id: 'durnin-womersley',
    label: 'Durnin & Womersley',
    author: 'Durnin & Womersley',
    year: 1974,
    formula: 'D = c − m·log₁₀(Σ4 pliegues: bíceps+tríceps+subescapular+suprailíaco); %G por Siri/Brozek',
    population: 'Adultos 16-72 años',
    ageRange: '16-72',
    note: `Conversión: ${conv === 'brozek' ? 'Brozek' : 'Siri'}`,
  };
  if (missing.length) return result(base, null, missing);
  const s4 = sum(a.biceps, a.triceps, a.subscapular, a.iliacCrest)!;
  const table = DW[ctx.sex];
  const row = [...table].reverse().find((r) => ctx.ageYears >= r.lo) ?? table[0];
  const density = row.c - row.m * Math.log10(s4);
  return result(base, densityToFat(density, conv), missing);
}

// ---- Jackson & Pollock (1978, hombres) -------------------------------------
// 3 sitios (pecho, abdomen, muslo) y 7 sitios. El protocolo ISAK no incluye el
// pliegue pectoral ni axilar medio; se marcan como faltantes si no existen.

export function jacksonPollockMen3(a: Anthropometry, ctx: EvaluationContext, conv: DensityConversion): MethodResult {
  const base = {
    id: 'jp-men-3',
    label: 'Jackson & Pollock 3 pliegues (♂)',
    author: 'Jackson & Pollock',
    year: 1978,
    formula: 'D = 1.10938 − 0.0008267·Σ3 + 0.0000016·Σ3² − 0.0002574·edad (pecho+abdomen+muslo)',
    population: 'Hombres adultos',
    ageRange: '18-61',
  };
  if (ctx.sex !== 'M') return result(base, null, []);
  // pliegue pectoral no capturado en ISAK restringido
  const missing = req(a, ['abdominal', 'frontThigh']);
  if (missing.length) return result(base, null, missing);
  return result({ ...base, note: 'Requiere pliegue pectoral (no ISAK); no calculable con perfil estándar.' }, null, ['triceps']);
}

export function jacksonPollockWomen3(a: Anthropometry, ctx: EvaluationContext, conv: DensityConversion): MethodResult {
  const base = {
    id: 'jpw-women-3',
    label: 'Jackson, Pollock & Ward 3 pliegues (♀)',
    author: 'Jackson, Pollock & Ward',
    year: 1980,
    formula: 'D = 1.0994921 − 0.0009929·Σ3 + 0.0000023·Σ3² − 0.0001392·edad (tríceps+suprailíaco+muslo)',
    population: 'Mujeres adultas',
    ageRange: '18-55',
    note: `Suprailíaco≈cresta ilíaca · ${conv === 'brozek' ? 'Brozek' : 'Siri'}`,
  };
  if (ctx.sex !== 'F') return result(base, null, []);
  const missing = req(a, ['triceps', 'iliacCrest', 'frontThigh']);
  if (missing.length) return result(base, null, missing);
  const s3 = a.triceps! + a.iliacCrest! + a.frontThigh!;
  const d = 1.0994921 - 0.0009929 * s3 + 0.0000023 * s3 ** 2 - 0.0001392 * ctx.ageYears;
  return result(base, densityToFat(d, conv), missing);
}

// ---- Faulkner (1968) — %grasa directo --------------------------------------

export function faulkner(a: Anthropometry): MethodResult {
  const base = {
    id: 'faulkner',
    label: 'Faulkner',
    author: 'Faulkner',
    year: 1968,
    formula: '%G = (tríceps+subescapular+supraespinal+abdominal)·0.153 + 5.783',
    population: 'Adultos / deportistas',
    ageRange: 'adulto',
  };
  const missing = req(a, ['triceps', 'subscapular', 'supraspinale', 'abdominal']);
  if (missing.length) return result(base, null, missing);
  const s4 = a.triceps! + a.subscapular! + a.supraspinale! + a.abdominal!;
  return result(base, s4 * 0.153 + 5.783, missing);
}

// ---- Yuhasz (1974), modificado por Carter — %grasa directo, por sexo -------

export function yuhasz(a: Anthropometry, ctx: EvaluationContext): MethodResult {
  const base = {
    id: 'yuhasz',
    label: 'Yuhasz (mod. Carter)',
    author: 'Yuhasz',
    year: 1974,
    formula:
      ctx.sex === 'M'
        ? '%G = Σ6 pliegues·0.1051 + 2.585'
        : '%G = Σ6 pliegues·0.1548 + 3.580',
    population: 'Adultos / deportistas',
    ageRange: 'adulto',
    note: 'Σ6: tríceps, subescapular, supraespinal, abdominal, muslo, pantorrilla',
  };
  const missing = req(a, ['triceps', 'subscapular', 'supraspinale', 'abdominal', 'frontThigh', 'medialCalf']);
  if (missing.length) return result(base, null, missing);
  const s6 = a.triceps! + a.subscapular! + a.supraspinale! + a.abdominal! + a.frontThigh! + a.medialCalf!;
  const val = ctx.sex === 'M' ? s6 * 0.1051 + 2.585 : s6 * 0.1548 + 3.58;
  return result(base, val, missing);
}

// ---- Withers et al. (1987) — densidad en deportistas -----------------------
// Coeficientes a verificar con la fuente primaria para uso clínico crítico.

export function withers(a: Anthropometry, ctx: EvaluationContext, conv: DensityConversion): MethodResult {
  const base = {
    id: 'withers',
    label: 'Withers et al.',
    author: 'Withers et al.',
    year: 1987,
    formula:
      ctx.sex === 'M'
        ? 'D = 1.0988 − 0.0004·Σ7 (tri+sub+bi+supra+abd+muslo+pant)'
        : 'D = 1.20953 − 0.08294·log₁₀(Σ4: tri+sub+supra+muslo)',
    population: 'Deportistas',
    ageRange: 'adulto',
    note: `Validada en deportistas · ${conv === 'brozek' ? 'Brozek' : 'Siri'}`,
  };
  if (ctx.sex === 'M') {
    const missing = req(a, ['triceps', 'subscapular', 'biceps', 'supraspinale', 'abdominal', 'frontThigh', 'medialCalf']);
    if (missing.length) return result(base, null, missing);
    const s7 = a.triceps! + a.subscapular! + a.biceps! + a.supraspinale! + a.abdominal! + a.frontThigh! + a.medialCalf!;
    return result(base, densityToFat(1.0988 - 0.0004 * s7, conv), missing);
  }
  const missing = req(a, ['triceps', 'subscapular', 'supraspinale', 'frontThigh']);
  if (missing.length) return result(base, null, missing);
  const s4 = a.triceps! + a.subscapular! + a.supraspinale! + a.frontThigh!;
  return result(base, densityToFat(1.20953 - 0.08294 * Math.log10(s4), conv), missing);
}

// ---- Slaughter et al. (1988) — niños y adolescentes ------------------------
// Usa tríceps + pantorrilla medial (versión sin maduración).

export function slaughter(a: Anthropometry, ctx: EvaluationContext): MethodResult {
  const base = {
    id: 'slaughter',
    label: 'Slaughter et al.',
    author: 'Slaughter et al.',
    year: 1988,
    formula:
      ctx.sex === 'M'
        ? '%G = 0.735·(tríceps+pantorrilla) + 1.0'
        : '%G = 0.610·(tríceps+pantorrilla) + 5.1',
    population: 'Niños y adolescentes',
    ageRange: '8-18',
    note: 'Versión tríceps+pantorrilla medial',
  };
  const missing = req(a, ['triceps', 'medialCalf']);
  if (missing.length) return result(base, null, missing);
  const s2 = a.triceps! + a.medialCalf!;
  const val = ctx.sex === 'M' ? 0.735 * s2 + 1.0 : 0.61 * s2 + 5.1;
  return result(base, val, missing);
}

export function allFatMethods(
  a: Anthropometry,
  ctx: EvaluationContext,
  conv: DensityConversion,
): MethodResult[] {
  const adult = (ctx.protocol ?? (ctx.ageYears >= 18 ? 'adult' : 'pediatric')) === 'adult';
  const methods: MethodResult[] = [];
  if (adult) {
    methods.push(
      durninWomersley(a, ctx, conv),
      ctx.sex === 'M' ? jacksonPollockMen3(a, ctx, conv) : jacksonPollockWomen3(a, ctx, conv),
      withers(a, ctx, conv),
      faulkner(a),
      yuhasz(a, ctx),
    );
  } else {
    methods.push(slaughter(a, ctx), faulkner(a), yuhasz(a, ctx));
  }
  return methods;
}
