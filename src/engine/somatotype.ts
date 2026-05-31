// ============================================================================
// 5.2  Somatotipo antropométrico de Heath-Carter (1967, rev. 1990)
// ============================================================================

import { Anthropometry } from './types';

export interface Somatotype {
  endo: number;
  meso: number;
  ecto: number;
  /** Coordenadas de la somatocarta. */
  x: number; // Ecto − Endo
  y: number; // 2·Meso − (Endo + Ecto)
  category: SomatoCategory;
  categoryLabel: string;
  applicable: boolean;
  missing: string[];
}

export type SomatoCategory =
  | 'central'
  | 'balanced-endomorph'
  | 'mesomorphic-endomorph'
  | 'mesomorph-endomorph'
  | 'endomorphic-mesomorph'
  | 'balanced-mesomorph'
  | 'ectomorphic-mesomorph'
  | 'mesomorph-ectomorph'
  | 'mesomorphic-ectomorph'
  | 'balanced-ectomorph'
  | 'endomorphic-ectomorph'
  | 'endomorph-ectomorph'
  | 'ectomorphic-endomorph';

export const SOMATO_LABELS: Record<SomatoCategory, string> = {
  central: 'Central',
  'balanced-endomorph': 'Endomorfo balanceado',
  'mesomorphic-endomorph': 'Endomorfo mesomórfico',
  'mesomorph-endomorph': 'Mesomorfo-endomorfo',
  'endomorphic-mesomorph': 'Mesomorfo endomórfico',
  'balanced-mesomorph': 'Mesomorfo balanceado',
  'ectomorphic-mesomorph': 'Mesomorfo ectomórfico',
  'mesomorph-ectomorph': 'Mesomorfo-ectomorfo',
  'mesomorphic-ectomorph': 'Ectomorfo mesomórfico',
  'balanced-ectomorph': 'Ectomorfo balanceado',
  'endomorphic-ectomorph': 'Ectomorfo endomórfico',
  'endomorph-ectomorph': 'Endomorfo-ectomorfo',
  'ectomorphic-endomorph': 'Endomorfo ectomórfico',
};

/** Endomorfia corregida por talla (Carter). */
export function endomorphy(a: Anthropometry): number | null {
  const { triceps, subscapular, supraspinale, height } = a;
  if ([triceps, subscapular, supraspinale, height].some((v) => v === undefined)) return null;
  const x = (triceps! + subscapular! + supraspinale!) * (170.18 / height!);
  return -0.7182 + 0.1451 * x - 0.00068 * x ** 2 + 0.0000014 * x ** 3;
}

export function mesomorphy(a: Anthropometry): number | null {
  const { humerus, femur, armFlexed, calfGirth, triceps, medialCalf, height } = a;
  if ([humerus, femur, armFlexed, calfGirth, triceps, medialCalf, height].some((v) => v === undefined))
    return null;
  const armCorr = armFlexed! - triceps! / 10;
  const calfCorr = calfGirth! - medialCalf! / 10;
  return (
    0.858 * humerus! + 0.601 * femur! + 0.188 * armCorr + 0.161 * calfCorr - height! * 0.131 + 4.5
  );
}

export function ectomorphy(a: Anthropometry): number | null {
  const { height, weight } = a;
  if (height === undefined || weight === undefined || weight <= 0) return null;
  const hwr = height / Math.cbrt(weight);
  if (hwr >= 40.75) return 0.732 * hwr - 28.58;
  if (hwr >= 38.25) return 0.463 * hwr - 17.63;
  return 0.1;
}

/** Clasificación en una de las 13 categorías de la somatocarta. */
export function classifySomatotype(endo: number, meso: number, ecto: number): SomatoCategory {
  const within = (a: number, b: number) => Math.abs(a - b) <= 1;
  // Central: las tres componentes no difieren en más de 1 unidad y ninguna > ~ 4.
  if (within(endo, meso) && within(meso, ecto) && within(endo, ecto)) return 'central';

  const max = Math.max(endo, meso, ecto);
  if (max === endo) {
    if (meso > ecto) return within(meso, endo) ? 'mesomorph-endomorph' : 'mesomorphic-endomorph';
    if (ecto > meso) return within(ecto, endo) ? 'endomorph-ectomorph' : 'ectomorphic-endomorph';
    return 'balanced-endomorph';
  }
  if (max === meso) {
    if (endo > ecto) return within(endo, meso) ? 'mesomorph-endomorph' : 'endomorphic-mesomorph';
    if (ecto > endo) return within(ecto, meso) ? 'mesomorph-ectomorph' : 'ectomorphic-mesomorph';
    return 'balanced-mesomorph';
  }
  // max === ecto
  if (endo > meso) return within(endo, ecto) ? 'endomorph-ectomorph' : 'endomorphic-ectomorph';
  if (meso > endo) return within(meso, ecto) ? 'mesomorph-ectomorph' : 'mesomorphic-ectomorph';
  return 'balanced-ectomorph';
}

export function computeSomatotype(a: Anthropometry): Somatotype {
  const endoV = endomorphy(a);
  const mesoV = mesomorphy(a);
  const ectoV = ectomorphy(a);
  const missing: string[] = [];
  if (endoV === null) missing.push('endomorfia (tríceps, subescapular, supraespinal, talla)');
  if (mesoV === null) missing.push('mesomorfia (húmero, fémur, brazo flexionado, pantorrilla, talla)');
  if (ectoV === null) missing.push('ectomorfia (talla, peso)');

  const endo = Math.max(0.1, endoV ?? 0);
  const meso = Math.max(0.1, mesoV ?? 0);
  const ecto = Math.max(0.1, ectoV ?? 0);
  const x = ecto - endo;
  const y = 2 * meso - (endo + ecto);
  const category = classifySomatotype(endo, meso, ecto);

  return {
    endo,
    meso,
    ecto,
    x,
    y,
    category,
    categoryLabel: SOMATO_LABELS[category],
    applicable: missing.length === 0,
    missing,
  };
}

/** Distancia de dispersión somatotípica (SAD) entre dos somatotipos. */
export function somatotypeSAD(
  a: { endo: number; meso: number; ecto: number },
  b: { endo: number; meso: number; ecto: number },
): number {
  return Math.sqrt((a.endo - b.endo) ** 2 + (a.meso - b.meso) ** 2 + (a.ecto - b.ecto) ** 2);
}

/** SAM (Somatotype Attitudinal Mean): media de las SAD de cada punto al somatotipo medio. */
export function somatotypeSAM(points: { endo: number; meso: number; ecto: number }[]): {
  mean: { endo: number; meso: number; ecto: number };
  sam: number;
} {
  const n = points.length;
  const mean = {
    endo: points.reduce((s, p) => s + p.endo, 0) / n,
    meso: points.reduce((s, p) => s + p.meso, 0) / n,
    ecto: points.reduce((s, p) => s + p.ecto, 0) / n,
  };
  const sam = points.reduce((s, p) => s + somatotypeSAD(p, mean), 0) / n;
  return { mean, sam };
}

/** Coordenadas X,Y de la somatocarta a partir de las 3 componentes. */
export function somatoXY(endo: number, meso: number, ecto: number): { x: number; y: number } {
  return { x: ecto - endo, y: 2 * meso - (endo + ecto) };
}
