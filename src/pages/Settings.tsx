import { useStore } from '../store/useStore';

// IDs en tiempo de ejecución que emite el motor (engine/fat.ts).
const FAT_METHOD_OPTIONS = [
  { id: 'durnin-womersley', label: 'Durnin & Womersley (1974)' },
  { id: 'jpw-women-3', label: 'Jackson, Pollock & Ward ♀ (1980)' },
  { id: 'withers', label: 'Withers et al. (1987)' },
  { id: 'faulkner', label: 'Faulkner (1968)' },
  { id: 'yuhasz', label: 'Yuhasz / Carter (1974)' },
  { id: 'slaughter', label: 'Slaughter et al. (1988)' },
];

export default function SettingsPage() {
  const { settings, setSettings, patients, evaluations } = useStore();

  function wipe() {
    if (confirm('¿Borrar TODOS los datos locales (pacientes, evaluaciones, grupos)?')) {
      localStorage.removeItem('body-composition-store');
      location.reload();
    }
  }

  return (
    <div className="stack">
      <div className="grid cols-2">
        <div className="card">
          <h3>Perfil del evaluador</h3>
          <label>Nombre / institución</label>
          <input value={settings.evaluatorName} onChange={(e) => setSettings({ evaluatorName: e.target.value })} placeholder="Aparecerá en evaluaciones y reportes" />
        </div>

        <div className="card">
          <h3>Protocolo y unidades</h3>
          <div className="fields">
            <div>
              <label>Conversión densidad → % grasa</label>
              <select value={settings.conversion} onChange={(e) => setSettings({ conversion: e.target.value as any })}>
                <option value="siri">Siri (1961)</option>
                <option value="brozek">Brozek (1963)</option>
              </select>
            </div>
            <div>
              <label>Protocolo por defecto</label>
              <select value={settings.defaultProtocol} onChange={(e) => setSettings({ defaultProtocol: e.target.value as any })}>
                <option value="adult">Adulto</option>
                <option value="pediatric">Pediátrico</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '.8rem' }}>
            <label>Método de % grasa preferido (referencia)</label>
            <select value={settings.preferredFatMethodId ?? ''} onChange={(e) => setSettings({ preferredFatMethodId: e.target.value || undefined })}>
              <option value="">Automático (primer aplicable)</option>
              {FAT_METHOD_OPTIONS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
            <p className="faint" style={{ fontSize: '.74rem', marginTop: '.3rem' }}>Si el método elegido no es aplicable al sujeto, se usa el primero disponible.</p>
          </div>
        </div>

        <div className="card">
          <h3>Apariencia</h3>
          <div className="fields">
            <div>
              <label>Tema</label>
              <select value={settings.theme} onChange={(e) => setSettings({ theme: e.target.value as any })}>
                <option value="dark">Oscuro</option><option value="light">Claro</option>
              </select>
            </div>
            <div>
              <label>Idioma</label>
              <select value={settings.lang} onChange={(e) => setSettings({ lang: e.target.value as any })}>
                <option value="es">Español</option><option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Datos</h3>
          <p className="muted" style={{ fontSize: '.84rem' }}>{patients.length} pacientes · {evaluations.length} evaluaciones (almacenamiento local del navegador).</p>
          <button className="danger" onClick={wipe}>Borrar todos los datos</button>
        </div>
      </div>

      <div className="card">
        <h3>Acerca de</h3>
        <p className="muted" style={{ fontSize: '.85rem' }}>
          <strong>Body Composition</strong> — sistema integral de análisis de composición corporal por antropometría
          (protocolo ISAK). Motor científico: fraccionamiento de Kerr (1988) vía estratagema Phantom, somatotipo de
          Heath-Carter, ecuaciones de masa grasa y muscular por población, e índices antropométricos. Edad en años
          decimales; cada cálculo cita autor/año y permite ver la ecuación. <strong>by Data Science Analytics.</strong>
        </p>
      </div>
    </div>
  );
}
