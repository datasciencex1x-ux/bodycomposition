// ============================================================================
// 7.  SOMATOTIPO vs DEPORTES — referencias de literatura (Carter & Heath y col.)
//     Valores medios orientativos de atletas de élite. Citar en cada uso.
// ============================================================================

import { Sex } from './types';
import { somatotypeSAD, somatoXY } from './somatotype';

export interface SportSomatotype {
  sport: string;
  sex: Sex;
  endo: number;
  meso: number;
  ecto: number;
  level: 'élite' | 'competitivo';
}

export const SPORTS_DB: SportSomatotype[] = [
  // Masculino
  { sport: 'Fútbol', sex: 'M', endo: 2.5, meso: 5.0, ecto: 2.5, level: 'élite' },
  { sport: 'Baloncesto', sex: 'M', endo: 2.5, meso: 4.3, ecto: 3.3, level: 'élite' },
  { sport: 'Fondo (atletismo)', sex: 'M', endo: 1.6, meso: 4.2, ecto: 3.5, level: 'élite' },
  { sport: 'Velocidad (atletismo)', sex: 'M', endo: 2.3, meso: 5.0, ecto: 2.6, level: 'élite' },
  { sport: 'Natación', sex: 'M', endo: 2.2, meso: 5.0, ecto: 3.0, level: 'élite' },
  { sport: 'Gimnasia artística', sex: 'M', endo: 1.5, meso: 5.5, ecto: 2.5, level: 'élite' },
  { sport: 'Halterofilia', sex: 'M', endo: 2.3, meso: 6.8, ecto: 1.2, level: 'élite' },
  { sport: 'Rugby', sex: 'M', endo: 3.5, meso: 6.0, ecto: 1.8, level: 'élite' },
  { sport: 'Ciclismo', sex: 'M', endo: 2.2, meso: 4.8, ecto: 2.8, level: 'élite' },
  { sport: 'Remo', sex: 'M', endo: 2.5, meso: 5.5, ecto: 2.8, level: 'élite' },
  { sport: 'Voleibol', sex: 'M', endo: 2.3, meso: 4.4, ecto: 3.3, level: 'élite' },
  { sport: 'Boxeo', sex: 'M', endo: 2.0, meso: 5.0, ecto: 2.7, level: 'élite' },
  { sport: 'Tenis', sex: 'M', endo: 2.2, meso: 4.6, ecto: 2.9, level: 'élite' },
  { sport: 'Waterpolo', sex: 'M', endo: 3.0, meso: 5.2, ecto: 2.4, level: 'élite' },
  { sport: 'Judo', sex: 'M', endo: 3.0, meso: 5.8, ecto: 1.9, level: 'élite' },
  // Femenino
  { sport: 'Fútbol', sex: 'F', endo: 3.2, meso: 4.0, ecto: 2.6, level: 'élite' },
  { sport: 'Baloncesto', sex: 'F', endo: 3.5, meso: 3.7, ecto: 3.0, level: 'élite' },
  { sport: 'Fondo (atletismo)', sex: 'F', endo: 2.0, meso: 3.5, ecto: 3.7, level: 'élite' },
  { sport: 'Velocidad (atletismo)', sex: 'F', endo: 2.7, meso: 4.2, ecto: 2.9, level: 'élite' },
  { sport: 'Gimnasia artística', sex: 'F', endo: 2.0, meso: 4.0, ecto: 3.0, level: 'élite' },
  { sport: 'Natación', sex: 'F', endo: 3.0, meso: 4.0, ecto: 2.9, level: 'élite' },
  { sport: 'Voleibol', sex: 'F', endo: 3.2, meso: 3.6, ecto: 3.0, level: 'élite' },
  { sport: 'Tenis', sex: 'F', endo: 3.3, meso: 3.9, ecto: 2.7, level: 'élite' },
  { sport: 'Remo', sex: 'F', endo: 2.8, meso: 4.2, ecto: 2.8, level: 'élite' },
  { sport: 'Heptatlón', sex: 'F', endo: 2.5, meso: 4.0, ecto: 3.0, level: 'élite' },
];

export interface SportAffinity extends SportSomatotype {
  sad: number; // distancia somatotípica al sujeto
  x: number;
  y: number;
}

/** Ranking de deportes más afines al somatotipo del paciente (menor SAD primero). */
export function rankSports(
  patient: { endo: number; meso: number; ecto: number },
  sex: Sex,
): SportAffinity[] {
  return SPORTS_DB.filter((s) => s.sex === sex)
    .map((s) => {
      const { x, y } = somatoXY(s.endo, s.meso, s.ecto);
      return { ...s, sad: somatotypeSAD(patient, s), x, y };
    })
    .sort((a, b) => a.sad - b.sad);
}
