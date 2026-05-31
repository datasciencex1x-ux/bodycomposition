import { Anthropometry, Sex, Ethnicity, AgeProtocol, DensityConversion } from '../engine/types';

export interface Patient {
  id: string;
  name: string;
  docId: string;          // RUT / ID
  birthDate: string;      // ISO
  sex: Sex;
  ethnicity: Ethnicity;
  sport?: string;
  level?: string;         // nivel competitivo
  tags: string[];         // etiquetas / grupos
  notes?: string;
  createdAt: string;
}

export interface Evaluation {
  id: string;
  patientId: string;
  date: string;           // ISO (fecha de evaluación)
  evaluator: string;
  protocol: AgeProtocol;
  anthro: Anthropometry;
  notes?: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  patientIds: string[];
}

export type AppointmentStatus = 'scheduled' | 'done' | 'noshow' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  date: string;           // ISO date (YYYY-MM-DD)
  time: string;           // HH:mm
  status: AppointmentStatus;
  reason?: string;
}

export interface Settings {
  theme: 'dark' | 'light';
  lang: 'es' | 'en';
  conversion: DensityConversion;
  preferredFatMethodId?: string;
  evaluatorName: string;
  defaultProtocol: AgeProtocol;
}
