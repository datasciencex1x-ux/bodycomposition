// ============================================================================
// Body Composition — Tipos del dominio antropométrico (protocolo ISAK)
// by Data Science Analytics
// ============================================================================

export type Sex = 'M' | 'F';

/** Etnia para ecuaciones que la requieren (Lee 2000, Slaughter, etc.) */
export type Ethnicity = 'caucasian' | 'african' | 'asian' | 'hispanic' | 'other';

export type AgeProtocol = 'adult' | 'pediatric';

/**
 * Perfil antropométrico completo ISAK.
 * Todas las medidas son opcionales en el tipo (un perfil restringido ISAK 1
 * no incluye todos los pliegues/diámetros), pero el motor valida la
 * disponibilidad antes de aplicar cada ecuación.
 *
 * Unidades:  pesos en kg, longitudes/perímetros/diámetros en cm, pliegues en mm.
 */
export interface Anthropometry {
  // Básicas
  weight?: number;        // peso (kg)
  height?: number;        // talla (cm)
  sittingHeight?: number; // talla sentado (cm)
  armSpan?: number;       // envergadura (cm)

  // Pliegues cutáneos (mm)
  triceps?: number;
  subscapular?: number;
  biceps?: number;
  iliacCrest?: number;     // cresta ilíaca
  supraspinale?: number;   // supraespinal
  abdominal?: number;
  frontThigh?: number;     // muslo anterior
  medialCalf?: number;     // pantorrilla medial

  // Perímetros (cm)
  headGirth?: number;
  neckGirth?: number;
  armRelaxed?: number;     // brazo relajado
  armFlexed?: number;      // brazo flexionado en tensión
  forearm?: number;        // antebrazo
  wristGirth?: number;     // muñeca
  chestGirth?: number;     // tórax (mesoesternal)
  waist?: number;          // cintura (mínima)
  hip?: number;            // cadera (glútea máxima)
  thighGirth?: number;     // muslo (1 cm subglúteo)
  midThighGirth?: number;  // muslo medio
  calfGirth?: number;      // pantorrilla máxima
  ankleGirth?: number;     // tobillo

  // Diámetros óseos (cm)
  biacromial?: number;
  biiliocristal?: number;     // transverso del tórax / biiliocrestídeo
  transverseChest?: number;   // tórax transverso
  apChest?: number;           // tórax anteroposterior
  humerus?: number;           // húmero (biepicondíleo)
  wristBreadth?: number;      // muñeca (biestiloideo)
  femur?: number;             // fémur (bicondíleo)
  ankleBreadth?: number;      // tobillo (bimaleolar)
}

export type AnthroKey = keyof Anthropometry;

export interface EvaluationContext {
  sex: Sex;
  ageYears: number;        // edad decimal (años)
  ethnicity?: Ethnicity;
  protocol?: AgeProtocol;
}

/** Conversión densidad → % grasa. */
export type DensityConversion = 'siri' | 'brozek';

/** Resultado genérico de una ecuación, con trazabilidad metodológica. */
export interface MethodResult {
  id: string;
  label: string;
  author: string;
  year: number;
  value: number | null;
  unit: string;
  formula: string;
  population?: string;
  ageRange?: string;
  note?: string;
  applicable: boolean;     // ¿hay datos suficientes y el sujeto está en rango?
  missing?: AnthroKey[];   // variables faltantes que impidieron el cálculo
}
