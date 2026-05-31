import { Patient, Evaluation, Settings } from '../store/types';
import { computeEvaluation, ComputedEvaluation, decimalAgeRounded, EvaluationContext } from '../engine';

export function contextFor(patient: Patient, ev: Evaluation): EvaluationContext {
  return {
    sex: patient.sex,
    ageYears: decimalAgeRounded(patient.birthDate, ev.date),
    ethnicity: patient.ethnicity,
    protocol: ev.protocol,
  };
}

export function computeFor(patient: Patient, ev: Evaluation, settings: Settings): ComputedEvaluation {
  return computeEvaluation(ev.anthro, contextFor(patient, ev), {
    conversion: settings.conversion,
    preferredFatMethodId: settings.preferredFatMethodId,
  });
}

export interface SubjectMetrics {
  weightKg?: number;
  heightCm?: number;
  ffmKg?: number;
  fatPct?: number;
  ageYears: number;
  sex: Patient['sex'];
}

/** Métricas derivadas de la evaluación más reciente de un paciente. */
export function subjectMetrics(patient: Patient, ev: Evaluation, settings: Settings): SubjectMetrics {
  const c = computeFor(patient, ev, settings);
  const ctx = contextFor(patient, ev);
  const weightKg = ev.anthro.weight;
  const fatPct = c.referenceFatPct ?? undefined;
  const ffmKg = weightKg && fatPct !== undefined ? weightKg * (1 - fatPct / 100) : undefined;
  return { weightKg, heightCm: ev.anthro.height, ffmKg, fatPct, ageYears: ctx.ageYears, sex: patient.sex };
}

export function latestEval(evaluations: Evaluation[], patientId: string): Evaluation | undefined {
  return evaluations.filter((e) => e.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function fmt(v: number | null | undefined, decimals = 1, unit = ''): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  return `${v.toFixed(decimals)}${unit ? ' ' + unit : ''}`;
}
