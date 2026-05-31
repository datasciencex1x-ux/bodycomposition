// ============================================================================
// Valores PHANTOM (estratagema de Ross & Wilson, 1974; Ross & Marfell-Jones, 1991)
// Referencia unisex: talla 170.18 cm, masa 64.58 kg.
//
// Cada variable tiene una media phantom (p) y una desviación phantom (s).
// La puntuación Z proporcional se calcula como:
//     Z = (1/s) · [ V · (170.18 / talla)^d − p ]
// donde d = exponente dimensional (1 para medidas lineales, 3 para masas).
//
// FUENTES:
//  - Ross WD, Wilson NC (1974). A stratagem for proportional growth assessment.
//  - Ross WD, Marfell-Jones MJ (1991). Kinanthropometry. In: Physiological
//    Testing of the High-Performance Athlete (2nd ed).
//  - Kerr DA (1988). An anthropometric method for fractionation of skin,
//    adipose, bone, muscle and residual tissue masses. MSc thesis, SFU.
//  - Drinkwater DT, Ross WD (1980). Anthropometric fractionation of body mass.
//
// NOTA DE VERIFICACIÓN: las medias/SD phantom de los TEJIDOS (skin/adipose/
// muscle/bone/residual) provienen de la literatura secundaria de cineantropometría
// (Norton & Olds, "Anthropometrica"). Se recomienda cotejarlas con la tesis
// primaria de Kerr (1988) antes de un uso clínico crítico.
// ============================================================================

export interface PhantomValue {
  p: number; // media phantom
  s: number; // desviación phantom
  d: number; // exponente dimensional (1 lineal, 3 masa)
}

export const PHANTOM_STATURE = 170.18;

/** Medidas lineales (d = 1). Pliegues en mm; perímetros y diámetros en cm. */
export const PHANTOM: Record<string, PhantomValue> = {
  // Básicas
  weight: { p: 64.58, s: 8.6, d: 3 },
  height: { p: 170.18, s: 6.29, d: 1 },
  sittingHeight: { p: 89.92, s: 4.5, d: 1 },

  // Pliegues (mm)
  triceps: { p: 15.4, s: 4.47, d: 1 },
  subscapular: { p: 17.2, s: 5.07, d: 1 },
  biceps: { p: 8.0, s: 2.0, d: 1 },
  iliacCrest: { p: 22.4, s: 6.8, d: 1 },
  supraspinale: { p: 15.4, s: 4.47, d: 1 },
  abdominal: { p: 25.4, s: 7.78, d: 1 },
  frontThigh: { p: 27.0, s: 8.33, d: 1 },
  medialCalf: { p: 16.0, s: 4.67, d: 1 },

  // Perímetros (cm)
  headGirth: { p: 56.0, s: 1.44, d: 1 },
  neckGirth: { p: 36.46, s: 1.92, d: 1 },
  armRelaxed: { p: 26.89, s: 2.33, d: 1 },
  armFlexed: { p: 29.41, s: 2.37, d: 1 },
  forearm: { p: 25.13, s: 1.41, d: 1 },
  wristGirth: { p: 16.35, s: 0.72, d: 1 },
  chestGirth: { p: 87.86, s: 5.18, d: 1 },
  waist: { p: 71.91, s: 4.45, d: 1 },
  hip: { p: 94.67, s: 5.58, d: 1 },
  thighGirth: { p: 55.82, s: 4.23, d: 1 },
  calfGirth: { p: 35.25, s: 2.3, d: 1 },
  ankleGirth: { p: 21.71, s: 1.33, d: 1 },

  // Diámetros óseos (cm)
  biacromial: { p: 38.04, s: 1.92, d: 1 },
  biiliocristal: { p: 28.84, s: 1.75, d: 1 },
  transverseChest: { p: 27.92, s: 1.74, d: 1 },
  apChest: { p: 17.5, s: 1.38, d: 1 },
  humerus: { p: 6.48, s: 0.35, d: 1 },
  wristBreadth: { p: 5.21, s: 0.28, d: 1 },
  femur: { p: 9.52, s: 0.48, d: 1 },
  ankleBreadth: { p: 6.68, s: 0.36, d: 1 },
};

/**
 * Masas phantom de los 5 tejidos (kg), d = 3.
 * Suma ≈ 64.58 kg (masa phantom total):
 *   piel 2.07 + adiposo 12.13 + músculo 25.55 + óseo 10.49 + residual 14.34 = 64.58
 */
export const PHANTOM_TISSUE: Record<
  'skin' | 'adipose' | 'muscle' | 'bone' | 'residual',
  PhantomValue
> = {
  skin: { p: 2.07, s: 0.25, d: 3 },
  adipose: { p: 12.13, s: 3.25, d: 3 },
  muscle: { p: 25.55, s: 2.99, d: 3 },
  bone: { p: 10.49, s: 1.57, d: 3 },
  residual: { p: 14.34, s: 3.84, d: 3 },
};

/**
 * Z-score proporcional phantom de una variable lineal cruda.
 * @param value valor medido (mm o cm según corresponda)
 * @param key   clave en la tabla PHANTOM
 * @param height talla del sujeto (cm)
 */
export function phantomZ(value: number, key: string, height: number): number {
  const ref = PHANTOM[key];
  if (!ref) throw new Error(`Phantom: variable desconocida "${key}"`);
  const scaled = value * Math.pow(PHANTOM_STATURE / height, ref.d);
  return (scaled - ref.p) / ref.s;
}
