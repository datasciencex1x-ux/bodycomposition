// ============================================================================
// 4.  Validación de plausibilidad y alerta de outliers (rangos ISAK).
// ============================================================================

import { Anthropometry, AnthroKey } from './types';

interface Range {
  min: number;
  max: number;
  label: string;
  unit: string;
}

export const RANGES: Partial<Record<AnthroKey, Range>> = {
  weight: { min: 10, max: 250, label: 'Peso', unit: 'kg' },
  height: { min: 90, max: 230, label: 'Talla', unit: 'cm' },
  sittingHeight: { min: 50, max: 130, label: 'Talla sentado', unit: 'cm' },
  armSpan: { min: 90, max: 250, label: 'Envergadura', unit: 'cm' },
  triceps: { min: 2, max: 60, label: 'Pliegue tríceps', unit: 'mm' },
  subscapular: { min: 3, max: 60, label: 'Pliegue subescapular', unit: 'mm' },
  biceps: { min: 1, max: 40, label: 'Pliegue bíceps', unit: 'mm' },
  iliacCrest: { min: 2, max: 60, label: 'Pliegue cresta ilíaca', unit: 'mm' },
  supraspinale: { min: 2, max: 50, label: 'Pliegue supraespinal', unit: 'mm' },
  abdominal: { min: 3, max: 70, label: 'Pliegue abdominal', unit: 'mm' },
  frontThigh: { min: 3, max: 70, label: 'Pliegue muslo anterior', unit: 'mm' },
  medialCalf: { min: 2, max: 50, label: 'Pliegue pantorrilla', unit: 'mm' },
  headGirth: { min: 45, max: 65, label: 'Perímetro cabeza', unit: 'cm' },
  neckGirth: { min: 25, max: 55, label: 'Perímetro cuello', unit: 'cm' },
  armRelaxed: { min: 15, max: 55, label: 'Brazo relajado', unit: 'cm' },
  armFlexed: { min: 18, max: 60, label: 'Brazo flexionado', unit: 'cm' },
  forearm: { min: 15, max: 40, label: 'Antebrazo', unit: 'cm' },
  wristGirth: { min: 12, max: 24, label: 'Muñeca', unit: 'cm' },
  chestGirth: { min: 60, max: 140, label: 'Tórax', unit: 'cm' },
  waist: { min: 45, max: 160, label: 'Cintura', unit: 'cm' },
  hip: { min: 60, max: 170, label: 'Cadera', unit: 'cm' },
  thighGirth: { min: 30, max: 90, label: 'Muslo', unit: 'cm' },
  midThighGirth: { min: 28, max: 85, label: 'Muslo medio', unit: 'cm' },
  calfGirth: { min: 22, max: 60, label: 'Pantorrilla', unit: 'cm' },
  ankleGirth: { min: 15, max: 35, label: 'Tobillo', unit: 'cm' },
  biacromial: { min: 28, max: 50, label: 'Biacromial', unit: 'cm' },
  biiliocristal: { min: 18, max: 40, label: 'Biiliocrestídeo', unit: 'cm' },
  transverseChest: { min: 18, max: 40, label: 'Tórax transverso', unit: 'cm' },
  apChest: { min: 12, max: 30, label: 'Tórax A-P', unit: 'cm' },
  humerus: { min: 4, max: 9, label: 'Húmero', unit: 'cm' },
  wristBreadth: { min: 3.5, max: 8, label: 'Muñeca (diám.)', unit: 'cm' },
  femur: { min: 7, max: 13, label: 'Fémur', unit: 'cm' },
  ankleBreadth: { min: 4.5, max: 10, label: 'Tobillo (diám.)', unit: 'cm' },
};

export interface ValidationAlert {
  key: AnthroKey;
  value: number;
  severity: 'error' | 'warn';
  message: string;
}

export function validate(a: Anthropometry): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];
  (Object.keys(RANGES) as AnthroKey[]).forEach((k) => {
    const v = a[k];
    const r = RANGES[k];
    if (v === undefined || r === undefined || Number.isNaN(v)) return;
    if (v < r.min || v > r.max) {
      alerts.push({
        key: k,
        value: v,
        severity: 'error',
        message: `${r.label} = ${v} ${r.unit} fuera de rango plausible (${r.min}–${r.max} ${r.unit}).`,
      });
    }
  });
  // Coherencia cruzada
  if (a.height && a.weight) {
    const bmi = a.weight / (a.height / 100) ** 2;
    if (bmi < 10 || bmi > 60)
      alerts.push({ key: 'weight', value: a.weight, severity: 'warn', message: `IMC implausible (${bmi.toFixed(1)}). Revise peso/talla.` });
  }
  if (a.armFlexed && a.armRelaxed && a.armFlexed < a.armRelaxed) {
    alerts.push({ key: 'armFlexed', value: a.armFlexed, severity: 'warn', message: 'Brazo flexionado < brazo relajado: revisar medición.' });
  }
  return alerts;
}
