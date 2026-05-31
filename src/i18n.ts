import { useStore } from './store/useStore';

type Dict = Record<string, string>;

const ES: Dict = {
  dashboard: 'Dashboard',
  patients: 'Pacientes',
  newEval: 'Nueva Evaluación',
  results: 'Resultados',
  comparator: 'Comparador',
  sports: 'Somatotipo vs Deportes',
  reports: 'Reportes',
  methods: 'Biblioteca de Métodos',
  settings: 'Configuración',
  agenda: 'Agenda',
  save: 'Guardar',
  cancel: 'Cancelar',
  delete: 'Eliminar',
  edit: 'Editar',
  add: 'Agregar',
  search: 'Buscar',
  viewEquation: 'Ver ecuación',
  export: 'Exportar',
  tagline: 'Análisis de composición corporal por antropometría · ISAK',
};

const EN: Dict = {
  dashboard: 'Dashboard',
  patients: 'Patients',
  newEval: 'New Assessment',
  results: 'Results',
  comparator: 'Comparator',
  sports: 'Somatotype vs Sports',
  reports: 'Reports',
  methods: 'Methods Library',
  settings: 'Settings',
  agenda: 'Schedule',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  search: 'Search',
  viewEquation: 'View equation',
  export: 'Export',
  tagline: 'Anthropometric body composition analysis · ISAK',
};

export function useT() {
  const lang = useStore((s) => s.settings.lang);
  const dict = lang === 'en' ? EN : ES;
  return (key: string) => dict[key] ?? key;
}
