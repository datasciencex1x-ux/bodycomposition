// ============================================================================
// Plan nutricional: objetivo calórico y reparto de macronutrientes.
// ============================================================================

export type DietGoal = 'cut' | 'maintain' | 'leanbulk' | 'bulk';

export const GOAL_LABELS: Record<DietGoal, { label: string; deltaPct: number }> = {
  cut: { label: 'Definición (déficit)', deltaPct: -0.18 },
  maintain: { label: 'Mantenimiento', deltaPct: 0 },
  leanbulk: { label: 'Volumen limpio', deltaPct: 0.1 },
  bulk: { label: 'Volumen', deltaPct: 0.18 },
};

export interface MacroPlan {
  targetKcal: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  proteinKcal: number;
  fatKcal: number;
  carbKcal: number;
  proteinPerKg: number;
  hydrationMl: number;
}

export interface MacroInput {
  tdee: number;
  weightKg: number;
  goal: DietGoal;
  proteinPerKg?: number; // por defecto según objetivo
  fatPerKg?: number;     // por defecto 0.9
}

export function macroPlan(i: MacroInput): MacroPlan {
  const targetKcal = Math.round(i.tdee * (1 + GOAL_LABELS[i.goal].deltaPct));
  const proteinPerKg = i.proteinPerKg ?? (i.goal === 'cut' ? 2.2 : i.goal === 'maintain' ? 1.8 : 2.0);
  const fatPerKg = i.fatPerKg ?? (i.goal === 'cut' ? 0.8 : 1.0);
  const proteinG = Math.round(proteinPerKg * i.weightKg);
  const fatG = Math.round(fatPerKg * i.weightKg);
  const proteinKcal = proteinG * 4;
  const fatKcal = fatG * 9;
  const carbKcal = Math.max(0, targetKcal - proteinKcal - fatKcal);
  const carbG = Math.round(carbKcal / 4);
  return {
    targetKcal, proteinG, fatG, carbG,
    proteinKcal, fatKcal, carbKcal: carbG * 4,
    proteinPerKg, hydrationMl: Math.round(i.weightKg * 35),
  };
}
