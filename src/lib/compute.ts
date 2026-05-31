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

export function fmt(v: number | null | undefined, decimals = 1, unit = ''): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  return `${v.toFixed(decimals)}${unit ? ' ' + unit : ''}`;
}
