// ============================================================================
// Metabolismo: gasto energético basal (BMR/RMR) y total (TDEE).
// ============================================================================

import { Sex } from './types';

export interface BmrResult {
  id: string;
  label: string;
  author: string;
  year: number;
  kcal: number | null;
  formula: string;
  note?: string;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryactive';

export const ACTIVITY_FACTORS: Record<ActivityLevel, { factor: number; label: string }> = {
  sedentary: { factor: 1.2, label: 'Sedentario (poco o nada)' },
  light: { factor: 1.375, label: 'Ligero (1-3 días/sem)' },
  moderate: { factor: 1.55, label: 'Moderado (3-5 días/sem)' },
  active: { factor: 1.725, label: 'Activo (6-7 días/sem)' },
  veryactive: { factor: 1.9, label: 'Muy activo (2x/día, físico)' },
};

export interface MetabolismInput {
  sex: Sex;
  ageYears: number;
  weightKg?: number;
  heightCm?: number;
  ffmKg?: number; // masa libre de grasa (para Cunningham / Katch-McArdle)
}

/** Harris-Benedict revisada (Roza & Shizgal, 1984). */
export function harrisBenedict(i: MetabolismInput): BmrResult {
  const base = { id: 'harris-benedict', label: 'Harris-Benedict', author: 'Roza & Shizgal', year: 1984 };
  if (!i.weightKg || !i.heightCm) return { ...base, kcal: null, formula: 'Requiere peso y talla' };
  const kcal = i.sex === 'M'
    ? 88.362 + 13.397 * i.weightKg + 4.799 * i.heightCm - 5.677 * i.ageYears
    : 447.593 + 9.247 * i.weightKg + 3.098 * i.heightCm - 4.33 * i.ageYears;
  return { ...base, kcal, formula: i.sex === 'M'
    ? 'BMR = 88.362 + 13.397·peso + 4.799·talla − 5.677·edad'
    : 'BMR = 447.593 + 9.247·peso + 3.098·talla − 4.330·edad' };
}

/** Mifflin-St Jeor (1990) — recomendada para población general. */
export function mifflinStJeor(i: MetabolismInput): BmrResult {
  const base = { id: 'mifflin', label: 'Mifflin-St Jeor', author: 'Mifflin et al.', year: 1990 };
  if (!i.weightKg || !i.heightCm) return { ...base, kcal: null, formula: 'Requiere peso y talla' };
  const kcal = 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.ageYears + (i.sex === 'M' ? 5 : -161);
  return { ...base, kcal, formula: 'BMR = 10·peso + 6.25·talla − 5·edad + (5 ♂ / −161 ♀)', note: 'Preferida en población general' };
}

/** Cunningham (1980) — basada en masa libre de grasa (deportistas). */
export function cunningham(i: MetabolismInput): BmrResult {
  const base = { id: 'cunningham', label: 'Cunningham', author: 'Cunningham', year: 1980 };
  if (!i.ffmKg) return { ...base, kcal: null, formula: 'RMR = 500 + 22·MLG (requiere composición corporal)' };
  return { ...base, kcal: 500 + 22 * i.ffmKg, formula: 'RMR = 500 + 22·MLG', note: 'Ideal en deportistas (usa MLG)' };
}

/** Katch-McArdle — basada en masa libre de grasa. */
export function katchMcArdle(i: MetabolismInput): BmrResult {
  const base = { id: 'katch', label: 'Katch-McArdle', author: 'Katch & McArdle', year: 1996 };
  if (!i.ffmKg) return { ...base, kcal: null, formula: 'RMR = 370 + 21.6·MLG (requiere composición corporal)' };
  return { ...base, kcal: 370 + 21.6 * i.ffmKg, formula: 'RMR = 370 + 21.6·MLG' };
}

export function allBmrMethods(i: MetabolismInput): BmrResult[] {
  return [mifflinStJeor(i), harrisBenedict(i), cunningham(i), katchMcArdle(i)];
}

export function tdee(bmr: number, level: ActivityLevel): number {
  return bmr * ACTIVITY_FACTORS[level].factor;
}
