// ============================================================================
// Suplementos basados en evidencia (orientativo · no sustituye consejo médico).
// Niveles de evidencia según consenso (ISSN, IOC consensus 2018).
// ============================================================================

import { DietGoal } from './nutrition';

export type Evidence = 'A' | 'B' | 'C';

export interface Supplement {
  name: string;
  dose: string;
  timing: string;
  benefit: string;
  evidence: Evidence;
  goals: DietGoal[];        // objetivos donde es más relevante
  endurance?: boolean;      // relevante en resistencia
  strength?: boolean;       // relevante en fuerza/potencia
}

export const SUPPLEMENTS: Supplement[] = [
  { name: 'Creatina monohidrato', dose: '3-5 g/día', timing: 'Cualquier momento (constante)', benefit: 'Fuerza, potencia y masa magra', evidence: 'A', goals: ['leanbulk', 'bulk', 'maintain'], strength: true },
  { name: 'Proteína de suero (whey)', dose: '0.3 g/kg por toma', timing: 'Post-entreno / completar requerimiento', benefit: 'Síntesis proteica, recuperación', evidence: 'A', goals: ['cut', 'maintain', 'leanbulk', 'bulk'], strength: true },
  { name: 'Cafeína', dose: '3-6 mg/kg', timing: '45-60 min pre-entreno', benefit: 'Rendimiento, foco, reduce percepción de esfuerzo', evidence: 'A', goals: ['cut', 'maintain', 'leanbulk', 'bulk'], endurance: true, strength: true },
  { name: 'Beta-alanina', dose: '3-6 g/día', timing: 'Dividido en tomas', benefit: 'Capacidad anaeróbica (1-4 min)', evidence: 'A', goals: ['maintain', 'leanbulk', 'bulk'], strength: true },
  { name: 'Nitratos (jugo de remolacha)', dose: '300-600 mg nitrato', timing: '2-3 h pre-competición', benefit: 'Economía y resistencia aeróbica', evidence: 'B', goals: ['maintain'], endurance: true },
  { name: 'Bicarbonato de sodio', dose: '0.3 g/kg', timing: '60-90 min pre-esfuerzo', benefit: 'Tampón ácido en esfuerzos intensos', evidence: 'B', goals: ['maintain'], endurance: true, strength: true },
  { name: 'Omega-3 (EPA/DHA)', dose: '1-3 g/día', timing: 'Con comidas', benefit: 'Antiinflamatorio, salud cardiovascular', evidence: 'B', goals: ['cut', 'maintain', 'leanbulk', 'bulk'] },
  { name: 'Vitamina D3', dose: '1000-2000 UI/día', timing: 'Con grasa', benefit: 'Función muscular y ósea (si déficit)', evidence: 'B', goals: ['cut', 'maintain', 'leanbulk', 'bulk'] },
  { name: 'Cafeína + L-teanina', dose: '200 mg + 200 mg', timing: 'Pre-entreno', benefit: 'Foco sin nerviosismo', evidence: 'C', goals: ['cut', 'maintain'] },
  { name: 'Citrulina malato', dose: '6-8 g', timing: '60 min pre-entreno', benefit: 'Flujo sanguíneo, volumen de trabajo', evidence: 'C', goals: ['leanbulk', 'bulk'], strength: true },
];

export interface SuppFilter { goal?: DietGoal; type?: 'all' | 'endurance' | 'strength'; }

export function recommendSupplements(f: SuppFilter): Supplement[] {
  return SUPPLEMENTS.filter((s) => {
    if (f.goal && !s.goals.includes(f.goal)) return false;
    if (f.type === 'endurance' && !s.endurance) return false;
    if (f.type === 'strength' && !s.strength) return false;
    return true;
  }).sort((a, b) => a.evidence.localeCompare(b.evidence));
}
