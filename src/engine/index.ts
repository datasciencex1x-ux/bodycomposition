// ============================================================================
// Orquestador del motor de cálculo: compone una evaluación completa.
// ============================================================================

import { Anthropometry, EvaluationContext, DensityConversion, MethodResult } from './types';
import { computeKerr, KerrResult } from './kerr';
import { computeSomatotype, Somatotype } from './somatotype';
import { allFatMethods } from './fat';
import { allMuscleMethods } from './muscle';
import { computeIndices, IndexResult } from './indices';
import { classifyFat, classifyMuscle, ClassResult } from './classifications';
import { validate, ValidationAlert } from './validation';

export * from './types';
export * from './phantom';
export * from './kerr';
export * from './somatotype';
export * from './fat';
export * from './muscle';
export * from './indices';
export * from './classifications';
export * from './sports';
export * from './methods';
export * from './validation';
export * from './age';
export { mean, stdev, sum, round, clamp } from './util';
export * from './metabolism';
export * from './nutrition';
export * from './supplements';
export * from './performance';

export interface EngineSettings {
  conversion: DensityConversion;
  preferredFatMethodId?: string;
}

export interface ComputedEvaluation {
  kerr: KerrResult;
  somatotype: Somatotype;
  fatMethods: MethodResult[];
  muscleMethods: MethodResult[];
  indices: IndexResult[];
  fatClass: ClassResult | null;
  muscleClass: ClassResult | null;
  /** % grasa de referencia (método preferido o el primero aplicable). */
  referenceFatPct: number | null;
  referenceFatMethod: MethodResult | null;
  /** masa muscular de referencia (Kerr). */
  referenceMuscleKg: number | null;
  alerts: ValidationAlert[];
}

export function computeEvaluation(
  a: Anthropometry,
  ctx: EvaluationContext,
  settings: EngineSettings,
): ComputedEvaluation {
  const kerr = computeKerr(a);
  const somatotype = computeSomatotype(a);
  const fatMethods = allFatMethods(a, ctx, settings.conversion);

  const muscleKerr = kerr.tissues.find((t) => t.key === 'muscle');
  const muscleKg = muscleKerr && kerr.applicable ? muscleKerr.kg : null;
  const muscleMethods = allMuscleMethods(a, ctx, muscleKg);

  // % grasa de referencia
  const applicableFat = fatMethods.filter((m) => m.applicable && m.value !== null);
  const preferred = settings.preferredFatMethodId
    ? applicableFat.find((m) => m.id === settings.preferredFatMethodId)
    : undefined;
  const referenceFatMethod = preferred ?? applicableFat[0] ?? null;
  const referenceFatPct = referenceFatMethod?.value ?? null;

  const adipose = kerr.tissues.find((t) => t.key === 'adipose');
  const bone = kerr.tissues.find((t) => t.key === 'bone');

  const indices = computeIndices(a, ctx, {
    fatPct: referenceFatPct ?? undefined,
    muscleKg: muscleKg ?? undefined,
    boneKg: bone && kerr.applicable ? bone.kg : undefined,
    adiposeKg: adipose && kerr.applicable ? adipose.kg : undefined,
  });

  const fatClass = referenceFatPct !== null ? classifyFat(referenceFatPct, ctx.sex) : null;
  const muscleClass =
    muscleKg !== null && a.height ? classifyMuscle(muscleKg, a.height / 100, ctx.sex) : null;

  return {
    kerr,
    somatotype,
    fatMethods,
    muscleMethods,
    indices,
    fatClass,
    muscleClass,
    referenceFatPct,
    referenceFatMethod,
    referenceMuscleKg: muscleKg,
    alerts: validate(a),
  };
}
