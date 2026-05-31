import { describe, it, expect } from 'vitest';
import { decimalAge } from '../age';
import { siri, brozek, faulkner } from '../fat';
import { ectomorphy, endomorphy, mesomorphy, computeSomatotype, somatotypeSAD } from '../somatotype';
import { computeKerr } from '../kerr';
import { computeIndices } from '../indices';
import { Anthropometry, EvaluationContext } from '../types';

// Sujeto de referencia completo (varón, valores plausibles ISAK).
const subject: Anthropometry = {
  weight: 75, height: 178, sittingHeight: 92, armSpan: 180,
  triceps: 10, subscapular: 11, biceps: 5, iliacCrest: 12, supraspinale: 8,
  abdominal: 14, frontThigh: 12, medialCalf: 8,
  headGirth: 57, neckGirth: 38, armRelaxed: 31, armFlexed: 34, forearm: 27,
  wristGirth: 17, chestGirth: 98, waist: 80, hip: 96, thighGirth: 56,
  calfGirth: 37, ankleGirth: 22,
  biacromial: 40, biiliocristal: 28, transverseChest: 29, apChest: 19,
  humerus: 7, wristBreadth: 5.7, femur: 9.8, ankleBreadth: 7,
};
const ctx: EvaluationContext = { sex: 'M', ageYears: 25, ethnicity: 'caucasian', protocol: 'adult' };

describe('edad decimal', () => {
  it('20 años entre 2000 y 2020', () => {
    expect(decimalAge('2000-01-01', '2020-01-01')).toBeCloseTo(20.0, 1);
  });
});

describe('conversiones densidad→%grasa', () => {
  it('Siri', () => expect(siri(1.05)).toBeCloseTo(21.43, 1));
  it('Brozek', () => expect(brozek(1.05)).toBeCloseTo(21.04, 1));
});

describe('Faulkner', () => {
  it('Σ4=47 → %G', () => {
    // 10+11+8+14 = 43 → 43*0.153+5.783 = 12.362
    const r = faulkner(subject);
    expect(r.value).toBeCloseTo(12.36, 1);
  });
});

describe('somatotipo Heath-Carter', () => {
  it('ectomorfia HWR', () => {
    const e = ectomorphy({ height: 180, weight: 70 })!;
    expect(e).toBeCloseTo(3.39, 1);
  });
  it('componentes positivos', () => {
    const s = computeSomatotype(subject);
    expect(s.endo).toBeGreaterThan(0);
    expect(s.meso).toBeGreaterThan(0);
    expect(s.ecto).toBeGreaterThan(0);
    expect(s.applicable).toBe(true);
  });
  it('SAD a sí mismo es 0', () => {
    expect(somatotypeSAD({ endo: 3, meso: 4, ecto: 2 }, { endo: 3, meso: 4, ecto: 2 })).toBe(0);
  });
});

describe('fraccionamiento de Kerr', () => {
  it('peso estructurado positivo y suma coherente', () => {
    const k = computeKerr(subject);
    expect(k.applicable).toBe(true);
    expect(k.structuredWeight).toBeGreaterThan(0);
    const sum = k.tissues.reduce((s, t) => s + t.kg, 0);
    expect(sum).toBeCloseTo(k.structuredWeight, 3);
    expect(k.correctionFactor).toBeGreaterThan(0.5);
    expect(k.correctionFactor).toBeLessThan(2);
  });
  it('5 tejidos presentes', () => {
    const k = computeKerr(subject);
    expect(k.tissues.map((t) => t.key).sort()).toEqual(
      ['adipose', 'bone', 'muscle', 'residual', 'skin'],
    );
  });
});

describe('índices', () => {
  it('IMC correcto', () => {
    const idx = computeIndices(subject, ctx);
    const bmi = idx.find((i) => i.id === 'bmi')!;
    expect(bmi.value).toBeCloseTo(75 / 1.78 ** 2, 1);
  });
  it('ICC presente con cintura y cadera', () => {
    const idx = computeIndices(subject, ctx);
    expect(idx.find((i) => i.id === 'whr')!.value).toBeCloseTo(80 / 96, 2);
  });
});
