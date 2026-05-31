// ============================================================================
// 5.1  Fraccionamiento de la masa corporal — KERR (1988), 5 componentes
//      vía estratagema del Phantom (Ross & Wilson) con puntuaciones Z.
//
// Procedimiento (tal y como exige el SUPER PROMPT, §5.1):
//   1. Z de cada variable lineal:  Z = (1/s)·[ V·(170.18/talla)^1 − p ]
//   2. Z proporcional del tejido = media de los Z de sus variables definitorias.
//   3. Masa del tejido = [ (Z̄·s_tejido) + p_tejido ] · (talla/170.18)^3
//   4. Peso estructurado = Σ de las 5 masas.
//   5. Factor de corrección = peso medido / peso estructurado.
//
// Conjuntos de variables por tejido (Drinkwater & Ross 1980; Kerr 1988):
//   · Adiposo:  6 pliegues (tríceps, subescapular, supraespinal, abdominal,
//               muslo anterior, pantorrilla medial).
//   · Muscular: perímetros brazo relajado, antebrazo, tórax, muslo, pantorrilla.
//   · Óseo:     diámetros biacromial, transverso del tórax, húmero, fémur,
//               muñeca, tobillo.
//   · Residual: diámetros biacromial, transverso del tórax, tórax A-P.
//   · Piel:     escalada con la talla (proxy de superficie corporal).
// ============================================================================

import { Anthropometry } from './types';
import { PHANTOM_STATURE, PHANTOM_TISSUE, phantomZ, PhantomValue } from './phantom';
import { AnthroKey } from './types';

export interface TissueMass {
  key: 'skin' | 'adipose' | 'muscle' | 'bone' | 'residual';
  label: string;
  kg: number;
  /** % respecto al peso medido. */
  pctMeasured: number;
  /** % respecto al peso estructurado. */
  pctStructured: number;
  z: number;
}

export interface KerrResult {
  tissues: TissueMass[];
  structuredWeight: number;   // suma de las 5 masas (kg)
  measuredWeight: number;     // peso ingresado (kg)
  correctionFactor: number;   // medido / estructurado
  residualKg: number;         // medido − estructurado
  adjustmentPct: number;      // (medido − estructurado)/medido · 100
  applicable: boolean;
  missing: AnthroKey[];
}

const TISSUE_VARS: Record<TissueMass['key'], { label: string; vars: AnthroKey[] }> = {
  skin: { label: 'Masa de la piel', vars: ['height'] },
  adipose: {
    label: 'Masa adiposa',
    vars: ['triceps', 'subscapular', 'supraspinale', 'abdominal', 'frontThigh', 'medialCalf'],
  },
  muscle: {
    label: 'Masa muscular',
    vars: ['armRelaxed', 'forearm', 'chestGirth', 'thighGirth', 'calfGirth'],
  },
  bone: {
    label: 'Masa ósea',
    vars: ['biacromial', 'transverseChest', 'humerus', 'femur', 'wristBreadth', 'ankleBreadth'],
  },
  residual: {
    label: 'Masa residual',
    vars: ['biacromial', 'transverseChest', 'apChest'],
  },
};

function tissueMassKg(
  a: Anthropometry,
  height: number,
  keys: AnthroKey[],
  phantom: PhantomValue,
): { kg: number; z: number } | { missing: AnthroKey[] } {
  const missing: AnthroKey[] = [];
  const zs: number[] = [];
  for (const k of keys) {
    const v = a[k];
    if (v === undefined || Number.isNaN(v)) {
      missing.push(k);
      continue;
    }
    zs.push(phantomZ(v, k, height));
  }
  if (missing.length) return { missing };
  const zMean = zs.reduce((s, z) => s + z, 0) / zs.length;
  const kg = (zMean * phantom.s + phantom.p) * Math.pow(height / PHANTOM_STATURE, 3);
  return { kg, z: zMean };
}

export function computeKerr(a: Anthropometry): KerrResult {
  const height = a.height;
  const weight = a.weight;
  const missingTop: AnthroKey[] = [];
  if (height === undefined) missingTop.push('height');
  if (weight === undefined) missingTop.push('weight');

  const tissues: TissueMass[] = [];
  let structured = 0;
  const allMissing = new Set<AnthroKey>(missingTop);

  if (height !== undefined) {
    (Object.keys(TISSUE_VARS) as TissueMass['key'][]).forEach((key) => {
      const def = TISSUE_VARS[key];
      const res = tissueMassKg(a, height, def.vars, PHANTOM_TISSUE[key]);
      if ('missing' in res) {
        res.missing.forEach((m) => allMissing.add(m));
        tissues.push({ key, label: def.label, kg: 0, pctMeasured: 0, pctStructured: 0, z: NaN });
      } else {
        structured += res.kg;
        tissues.push({ key, label: def.label, kg: res.kg, pctMeasured: 0, pctStructured: 0, z: res.z });
      }
    });
  }

  const applicable = allMissing.size === 0 && structured > 0;
  const measured = weight ?? 0;

  // Completar porcentajes una vez conocido el peso estructurado.
  for (const t of tissues) {
    t.pctStructured = structured > 0 ? (t.kg / structured) * 100 : 0;
    t.pctMeasured = measured > 0 ? (t.kg / measured) * 100 : 0;
  }

  const correctionFactor = structured > 0 ? measured / structured : 0;
  const residualKg = measured - structured;
  const adjustmentPct = measured > 0 ? (residualKg / measured) * 100 : 0;

  return {
    tissues,
    structuredWeight: structured,
    measuredWeight: measured,
    correctionFactor,
    residualKg,
    adjustmentPct,
    applicable,
    missing: Array.from(allMissing),
  };
}
