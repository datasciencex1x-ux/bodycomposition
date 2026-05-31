// Utilidades numéricas compartidas por el motor.

export function round(x: number, decimals = 2): number {
  const f = Math.pow(10, decimals);
  return Math.round(x * f) / f;
}

/** Devuelve null si algún argumento es undefined/NaN; útil para encadenar. */
export function need(...vals: (number | undefined)[]): number[] | null {
  const out: number[] = [];
  for (const v of vals) {
    if (v === undefined || v === null || Number.isNaN(v)) return null;
    out.push(v);
  }
  return out;
}

export function sum(...vals: (number | undefined)[]): number | undefined {
  let total = 0;
  for (const v of vals) {
    if (v === undefined || Number.isNaN(v)) return undefined;
    total += v;
  }
  return total;
}

export function mean(vals: number[]): number {
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function stdev(vals: number[]): number {
  if (vals.length < 2) return 0;
  const m = mean(vals);
  const v = vals.reduce((a, b) => a + (b - m) ** 2, 0) / (vals.length - 1);
  return Math.sqrt(v);
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}
