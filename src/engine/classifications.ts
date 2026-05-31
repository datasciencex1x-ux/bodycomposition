// ============================================================================
// 6.  CLASIFICACIONES INTELIGENTES (% grasa por sexo, masa muscular)
// ============================================================================

import { Sex } from './types';

export interface FatBand {
  label: string;
  min: number;
  max: number;
  color: string;
}

// Rangos de % graso (ACSM / ACE), diferenciados por sexo.
export const FAT_BANDS: Record<Sex, FatBand[]> = {
  M: [
    { label: 'Esencial', min: 2, max: 5, color: '#3b82f6' },
    { label: 'Atlético', min: 6, max: 13, color: '#22c55e' },
    { label: 'Fitness', min: 14, max: 17, color: '#84cc16' },
    { label: 'Aceptable', min: 18, max: 24, color: '#eab308' },
    { label: 'Obesidad', min: 25, max: 50, color: '#ef4444' },
  ],
  F: [
    { label: 'Esencial', min: 10, max: 13, color: '#3b82f6' },
    { label: 'Atlético', min: 14, max: 20, color: '#22c55e' },
    { label: 'Fitness', min: 21, max: 24, color: '#84cc16' },
    { label: 'Aceptable', min: 25, max: 31, color: '#eab308' },
    { label: 'Obesidad', min: 32, max: 55, color: '#ef4444' },
  ],
};

export interface ClassResult {
  label: string;
  color: string;
  /** posición 0..1 dentro del gauge para visualización. */
  position: number;
  description: string;
}

export function classifyFat(pct: number, sex: Sex): ClassResult {
  const bands = FAT_BANDS[sex];
  const band = bands.find((b) => pct >= b.min && pct <= b.max) ?? (pct < bands[0].min ? bands[0] : bands[bands.length - 1]);
  const lo = bands[0].min;
  const hi = bands[bands.length - 1].max;
  const position = Math.max(0, Math.min(1, (pct - lo) / (hi - lo)));
  return {
    label: band.label,
    color: band.color,
    position,
    description: `${pct.toFixed(1)}% — categoría "${band.label}" para ${sex === 'M' ? 'hombres' : 'mujeres'}.`,
  };
}

// Clasificación cualitativa de masa muscular por índice de masa muscular esquelética
// SMI = masa muscular (kg) / talla(m)²  (Janssen et al., umbrales orientativos).
export function classifyMuscle(muscleKg: number, heightM: number, sex: Sex): ClassResult {
  const smi = muscleKg / heightM ** 2;
  const cuts = sex === 'M' ? { low: 8.5, normal: 10.75 } : { low: 5.75, normal: 6.75 };
  let label = 'Alto';
  let color = '#22c55e';
  if (smi < cuts.low) {
    label = 'Bajo';
    color = '#ef4444';
  } else if (smi < cuts.normal) {
    label = 'Normal';
    color = '#eab308';
  } else if (smi < cuts.normal + 2) {
    label = 'Alto';
    color = '#22c55e';
  } else {
    label = 'Muy alto';
    color = '#3b82f6';
  }
  return {
    label,
    color,
    position: Math.max(0, Math.min(1, smi / (cuts.normal + 4))),
    description: `IMME (SMI) = ${smi.toFixed(2)} kg/m² — masa muscular "${label}".`,
  };
}
