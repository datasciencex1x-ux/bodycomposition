// ============================================================================
// 5.3  Ecuaciones de MASA MUSCULAR (por población)
// ============================================================================

import { Anthropometry, EvaluationContext, MethodResult, AnthroKey } from './types';

/** Perímetro corregido por pliegue: G − π·(pliegue_mm / 10)  → cm. */
function corrected(girth: number, skinfoldMm: number): number {
  return girth - Math.PI * (skinfoldMm / 10);
}

function req(a: Anthropometry, keys: AnthroKey[]): AnthroKey[] {
  return keys.filter((k) => a[k] === undefined || Number.isNaN(a[k] as number));
}

function mk(
  base: Omit<MethodResult, 'value' | 'applicable' | 'missing' | 'unit'>,
  value: number | null,
  missing: AnthroKey[],
): MethodResult {
  return {
    unit: 'kg',
    ...base,
    value: value === null || Number.isNaN(value) ? null : Math.round(value * 100) / 100,
    applicable: value !== null && !Number.isNaN(value) && missing.length === 0,
    missing,
  };
}

// ---- Lee et al. (2000) — masa muscular esquelética total -------------------

export function lee2000(a: Anthropometry, ctx: EvaluationContext): MethodResult {
  const base = {
    id: 'lee-2000',
    label: 'Lee et al.',
    author: 'Lee et al.',
    year: 2000,
    formula:
      'SM = Talla·(0.00744·CAG² + 0.00088·CTG² + 0.00441·CCG²) + 2.4·sexo − 0.048·edad + etnia + 7.8',
    population: 'Adultos (multiétnico)',
    ageRange: '18-86',
    note: 'CAG/CTG/CCG = perímetros corregidos de brazo/muslo/pantorrilla; sexo ♂=1 ♀=0',
  };
  const missing = req(a, ['height', 'armRelaxed', 'triceps', 'thighGirth', 'frontThigh', 'calfGirth', 'medialCalf']);
  if (missing.length) return mk(base, null, missing);
  const htM = a.height! / 100;
  const cag = corrected(a.armRelaxed!, a.triceps!);
  const ctg = corrected(a.thighGirth!, a.frontThigh!);
  const ccg = corrected(a.calfGirth!, a.medialCalf!);
  const sexTerm = ctx.sex === 'M' ? 1 : 0;
  const eth =
    ctx.ethnicity === 'asian' ? -2.0 : ctx.ethnicity === 'african' ? 1.1 : 0;
  const sm =
    htM * (0.00744 * cag ** 2 + 0.00088 * ctg ** 2 + 0.00441 * ccg ** 2) +
    2.4 * sexTerm -
    0.048 * ctx.ageYears +
    eth +
    7.8;
  return mk(base, sm, missing);
}

// ---- Martin et al. (1990) — masa muscular esquelética (varones) ------------

export function martin1990(a: Anthropometry, ctx: EvaluationContext): MethodResult {
  const base = {
    id: 'martin-1990',
    label: 'Martin et al.',
    author: 'Martin et al.',
    year: 1990,
    formula: 'MM(g) = Talla·(0.0553·CMG² + 0.0987·AnteBr² + 0.0331·CPG²) − 2445',
    population: 'Varones (validada en cadáveres masculinos)',
    ageRange: 'adulto ♂',
    note: 'CMG/CPG = muslo/pantorrilla corregidos; antebrazo sin corregir',
  };
  if (ctx.sex !== 'M') return mk({ ...base, note: 'Validada solo en varones.' }, null, []);
  const missing = req(a, ['height', 'thighGirth', 'frontThigh', 'forearm', 'calfGirth', 'medialCalf']);
  if (missing.length) return mk(base, null, missing);
  const cmg = corrected(a.thighGirth!, a.frontThigh!);
  const cpg = corrected(a.calfGirth!, a.medialCalf!);
  const grams = a.height! * (0.0553 * cmg ** 2 + 0.0987 * a.forearm! ** 2 + 0.0331 * cpg ** 2) - 2445;
  return mk(base, grams / 1000, missing);
}

// ---- Matiegka (1921) — masa muscular antropométrica ------------------------

export function matiegka1921(a: Anthropometry): MethodResult {
  const base = {
    id: 'matiegka-1921',
    label: 'Matiegka',
    author: 'Matiegka',
    year: 1921,
    formula: 'M = Talla·r²·6.5/1000, r = radio medio de perímetros corregidos (brazo, antebrazo, muslo, pantorrilla)',
    population: 'General',
    ageRange: 'adulto',
  };
  const missing = req(a, ['height', 'armRelaxed', 'triceps', 'forearm', 'thighGirth', 'frontThigh', 'calfGirth', 'medialCalf']);
  if (missing.length) return mk(base, null, missing);
  const armC = corrected(a.armRelaxed!, a.triceps!);
  const thighC = corrected(a.thighGirth!, a.frontThigh!);
  const calfC = corrected(a.calfGirth!, a.medialCalf!);
  const meanGirth = (armC + a.forearm! + thighC + calfC) / 4;
  const r = meanGirth / (2 * Math.PI);
  const kg = (a.height! * r ** 2 * 6.5) / 1000;
  return mk(base, kg, missing);
}

/** Envuelve el componente muscular de Kerr (calculado en el fraccionamiento). */
export function kerrMuscle(kg: number | null): MethodResult {
  return mk(
    {
      id: 'kerr-muscle',
      label: 'Kerr (fraccionamiento)',
      author: 'Kerr',
      year: 1988,
      formula: 'Componente muscular del modelo Phantom de 5 fracciones',
      population: 'General (6-77 años)',
      ageRange: '6-77',
      note: 'Coherente con Drinkwater & Ross (1980)',
    },
    kg,
    kg === null ? (['armRelaxed'] as AnthroKey[]) : [],
  );
}

export function allMuscleMethods(
  a: Anthropometry,
  ctx: EvaluationContext,
  kerrMuscleKg: number | null,
): MethodResult[] {
  return [lee2000(a, ctx), martin1990(a, ctx), matiegka1921(a), kerrMuscle(kerrMuscleKg)];
}
