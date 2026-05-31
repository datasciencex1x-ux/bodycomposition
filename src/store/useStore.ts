import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Patient, Evaluation, Group, Appointment, Settings } from './types';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

interface State {
  patients: Patient[];
  evaluations: Evaluation[];
  groups: Group[];
  appointments: Appointment[];
  settings: Settings;

  // Patients
  addPatient: (p: Omit<Patient, 'id' | 'createdAt'>) => string;
  updatePatient: (id: string, p: Partial<Patient>) => void;
  deletePatient: (id: string) => void;

  // Evaluations
  addEvaluation: (e: Omit<Evaluation, 'id' | 'createdAt'>) => string;
  updateEvaluation: (id: string, e: Partial<Evaluation>) => void;
  deleteEvaluation: (id: string) => void;

  // Groups
  addGroup: (name: string) => string;
  updateGroup: (id: string, g: Partial<Group>) => void;
  deleteGroup: (id: string) => void;

  // Appointments
  addAppointment: (a: Omit<Appointment, 'id'>) => string;
  updateAppointment: (id: string, a: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  setSettings: (s: Partial<Settings>) => void;
  seedDemo: () => void;
}

const defaultSettings: Settings = {
  theme: 'dark',
  lang: 'es',
  conversion: 'siri',
  evaluatorName: '',
  defaultProtocol: 'adult',
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      patients: [],
      evaluations: [],
      groups: [],
      appointments: [],
      settings: defaultSettings,

      addPatient: (p) => {
        const id = uid();
        set((s) => ({ patients: [...s.patients, { ...p, id, createdAt: new Date().toISOString() }] }));
        return id;
      },
      updatePatient: (id, p) =>
        set((s) => ({ patients: s.patients.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
      deletePatient: (id) =>
        set((s) => ({
          patients: s.patients.filter((x) => x.id !== id),
          evaluations: s.evaluations.filter((e) => e.patientId !== id),
          appointments: s.appointments.filter((a) => a.patientId !== id),
          groups: s.groups.map((g) => ({ ...g, patientIds: g.patientIds.filter((pid) => pid !== id) })),
        })),

      addEvaluation: (e) => {
        const id = uid();
        set((s) => ({ evaluations: [...s.evaluations, { ...e, id, createdAt: new Date().toISOString() }] }));
        return id;
      },
      updateEvaluation: (id, e) =>
        set((s) => ({ evaluations: s.evaluations.map((x) => (x.id === id ? { ...x, ...e } : x)) })),
      deleteEvaluation: (id) =>
        set((s) => ({ evaluations: s.evaluations.filter((x) => x.id !== id) })),

      addGroup: (name) => {
        const id = uid();
        set((s) => ({ groups: [...s.groups, { id, name, patientIds: [] }] }));
        return id;
      },
      updateGroup: (id, g) =>
        set((s) => ({ groups: s.groups.map((x) => (x.id === id ? { ...x, ...g } : x)) })),
      deleteGroup: (id) => set((s) => ({ groups: s.groups.filter((x) => x.id !== id) })),

      addAppointment: (a) => {
        const id = uid();
        set((s) => ({ appointments: [...s.appointments, { ...a, id }] }));
        return id;
      },
      updateAppointment: (id, a) =>
        set((s) => ({ appointments: s.appointments.map((x) => (x.id === id ? { ...x, ...a } : x)) })),
      deleteAppointment: (id) =>
        set((s) => ({ appointments: s.appointments.filter((x) => x.id !== id) })),

      setSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),

      seedDemo: () => {
        if (get().patients.length) return;
        const now = new Date();
        const iso = (d: Date) => d.toISOString();
        const mk = (over: Partial<Patient>): Patient => ({
          id: uid(), name: '', docId: '', birthDate: '2000-01-01', sex: 'M',
          ethnicity: 'caucasian', tags: [], createdAt: iso(now), ...over,
        });
        const p1 = mk({ name: 'Diego Fuentes', docId: '18.456.789-0', birthDate: '2007-03-12', sex: 'M', sport: 'Fútbol', level: 'Sub-17', tags: ['Selección Sub-17'] });
        const p2 = mk({ name: 'Camila Rojas', docId: '20.111.222-3', birthDate: '1998-08-05', sex: 'F', sport: 'Atletismo (fondo)', level: 'Élite', tags: ['Control 2026'] });
        const baseAnthro = {
          weight: 68, height: 176, sittingHeight: 91, armSpan: 178,
          triceps: 9, subscapular: 10, biceps: 4, iliacCrest: 11, supraspinale: 7,
          abdominal: 12, frontThigh: 11, medialCalf: 7,
          headGirth: 57, neckGirth: 37, armRelaxed: 30, armFlexed: 33, forearm: 26.5,
          wristGirth: 16.8, chestGirth: 95, waist: 78, hip: 94, thighGirth: 55,
          calfGirth: 36, ankleGirth: 22,
          biacromial: 40, biiliocristal: 27.5, transverseChest: 28.5, apChest: 19,
          humerus: 6.9, wristBreadth: 5.6, femur: 9.6, ankleBreadth: 6.9,
        };
        const e1: Evaluation = {
          id: uid(), patientId: p1.id, date: iso(new Date(now.getTime() - 90 * 864e5)),
          evaluator: 'Data Science Analytics', protocol: 'pediatric', anthro: baseAnthro, createdAt: iso(now),
        };
        const e2: Evaluation = {
          id: uid(), patientId: p1.id, date: iso(now), evaluator: 'Data Science Analytics', protocol: 'pediatric',
          anthro: { ...baseAnthro, weight: 70, triceps: 8, abdominal: 10, armFlexed: 34, calfGirth: 37 }, createdAt: iso(now),
        };
        const e3: Evaluation = {
          id: uid(), patientId: p2.id, date: iso(now), evaluator: 'Data Science Analytics', protocol: 'adult',
          anthro: { ...baseAnthro, weight: 56, height: 168, triceps: 12, subscapular: 11, abdominal: 13, armRelaxed: 26, thighGirth: 52, calfGirth: 33, hip: 92, waist: 68 }, createdAt: iso(now),
        };
        set({
          patients: [p1, p2],
          evaluations: [e1, e2, e3],
          groups: [{ id: uid(), name: 'Selección Sub-17', patientIds: [p1.id] }],
          appointments: [
            { id: uid(), patientId: p1.id, date: now.toISOString().slice(0, 10), time: '09:30', status: 'scheduled', reason: 'Control composición corporal' },
            { id: uid(), patientId: p2.id, date: now.toISOString().slice(0, 10), time: '11:00', status: 'done', reason: 'Evaluación inicial' },
          ],
        });
      },
    }),
    { name: 'body-composition-store' },
  ),
);
