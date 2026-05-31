// ============================================================================
// Rendimiento: 1RM estimado, VO2máx, frecuencias cardíacas, potencia relativa.
// ============================================================================

export interface Estimate { value: number | null; formula: string; }

/** 1RM — Epley (1985): 1RM = w·(1 + reps/30) */
export function epley(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}
/** 1RM — Brzycki (1993): 1RM = w · 36/(37 − reps) */
export function brzycki(weight: number, reps: number): number {
  return reps >= 37 ? NaN : (weight * 36) / (37 - reps);
}
export function oneRepMax(weight: number, reps: number): { epley: number; brzycki: number; mean: number } {
  const e = epley(weight, reps);
  const b = brzycki(weight, reps);
  return { epley: e, brzycki: b, mean: (e + b) / 2 };
}

/** Porcentajes de 1RM → cargas de entrenamiento. */
export function loadTable(oneRM: number): { pct: number; kg: number; reps: string }[] {
  const map: [number, string][] = [
    [100, '1'], [95, '2'], [90, '3-4'], [85, '5-6'], [80, '7-8'], [75, '9-10'], [70, '11-12'], [65, '13-15'], [60, '16-20'],
  ];
  return map.map(([pct, reps]) => ({ pct, kg: Math.round((oneRM * pct) / 100 * 10) / 10, reps }));
}

/** FC máxima — Tanaka et al. (2001): 208 − 0.7·edad */
export function hrMaxTanaka(age: number): number {
  return 208 - 0.7 * age;
}
/** FC máxima clásica: 220 − edad */
export function hrMaxClassic(age: number): number {
  return 220 - age;
}

/** Zonas de FC por método de Karvonen (reserva de FC). */
export function karvonenZones(hrMax: number, hrRest: number): { zone: string; lo: number; hi: number; desc: string }[] {
  const z = (loPct: number, hiPct: number) => ({
    lo: Math.round(hrRest + (hrMax - hrRest) * loPct),
    hi: Math.round(hrRest + (hrMax - hrRest) * hiPct),
  });
  return [
    { zone: 'Z1', ...z(0.5, 0.6), desc: 'Recuperación' },
    { zone: 'Z2', ...z(0.6, 0.7), desc: 'Aeróbico base' },
    { zone: 'Z3', ...z(0.7, 0.8), desc: 'Tempo / umbral aeróbico' },
    { zone: 'Z4', ...z(0.8, 0.9), desc: 'Umbral anaeróbico' },
    { zone: 'Z5', ...z(0.9, 1.0), desc: 'VO₂máx / potencia' },
  ];
}

/** VO2máx — test de Cooper (12 min): (distancia_m − 504.9)/44.73 */
export function vo2maxCooper(distanceM: number): number {
  return (distanceM - 504.9) / 44.73;
}
/** VO2máx — estimación por FC (Uth-Sørensen, 2004): 15.3·(FCmáx/FCreposo) */
export function vo2maxHR(hrMax: number, hrRest: number): number {
  return 15.3 * (hrMax / hrRest);
}

export function classifyVo2max(vo2: number, sex: 'M' | 'F', age: number): string {
  // Umbrales orientativos (ACSM) para adultos jóvenes-medios.
  const t = sex === 'M' ? [35, 42, 50, 57] : [29, 35, 42, 49];
  if (vo2 < t[0]) return 'Bajo';
  if (vo2 < t[1]) return 'Regular';
  if (vo2 < t[2]) return 'Bueno';
  if (vo2 < t[3]) return 'Muy bueno';
  return 'Excelente';
}
