// ============================================================================
// Edad decimal en años (criterio no negociable del proyecto).
// ============================================================================

const MS_PER_DAY = 86_400_000;

/** Días del año considerando años bisiestos (365.25 promedio juliano). */
export function decimalAge(birthISO: string, atISO: string): number {
  const birth = new Date(birthISO);
  const at = new Date(atISO);
  if (isNaN(birth.getTime()) || isNaN(at.getTime())) return NaN;
  const days = (at.getTime() - birth.getTime()) / MS_PER_DAY;
  return days / 365.25;
}

/** Edad decimal redondeada a 2 decimales. */
export function decimalAgeRounded(birthISO: string, atISO: string): number {
  return Math.round(decimalAge(birthISO, atISO) * 100) / 100;
}
