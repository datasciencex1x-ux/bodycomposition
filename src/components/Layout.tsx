import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface NavItem { to: string; label: string; ico: string; tag?: string; }
const SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Evaluación',
    items: [
      { to: '/', label: 'Dashboard', ico: '◧' },
      { to: '/patients', label: 'Pacientes', ico: '⊞' },
      { to: '/agenda', label: 'Agenda', ico: '◷' },
      { to: '/new', label: 'Nueva Evaluación', ico: '＋' },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { to: '/comparator', label: 'Comparador', ico: '⇄' },
      { to: '/sports', label: 'Somatotipo · Deportes', ico: '◎' },
    ],
  },
  {
    label: 'Nutrición & Rendimiento',
    items: [
      { to: '/metabolism', label: 'Metabolismo', ico: '🔥', tag: 'kcal' },
      { to: '/diet', label: 'Plan nutricional', ico: '🍎' },
      { to: '/supplements', label: 'Suplementos', ico: '💊' },
      { to: '/performance', label: 'Rendimiento', ico: '⚡' },
      { to: '/wearables', label: 'Wearables', ico: '⌚' },
    ],
  },
  {
    label: 'Recursos',
    items: [
      { to: '/reports', label: 'Reportes', ico: '⎙' },
      { to: '/methods', label: 'Biblioteca de Métodos', ico: 'ƒ' },
      { to: '/settings', label: 'Configuración', ico: '⚙' },
    ],
  },
];

const TITLES: Record<string, { section: string; title: string }> = {
  '/': { section: 'Evaluación', title: 'Dashboard' },
  '/patients': { section: 'Evaluación', title: 'Pacientes' },
  '/agenda': { section: 'Evaluación', title: 'Agenda' },
  '/new': { section: 'Evaluación', title: 'Nueva Evaluación' },
  '/comparator': { section: 'Análisis', title: 'Comparador' },
  '/sports': { section: 'Análisis', title: 'Somatotipo vs Deportes' },
  '/metabolism': { section: 'Nutrición & Rendimiento', title: 'Metabolismo' },
  '/diet': { section: 'Nutrición & Rendimiento', title: 'Plan nutricional' },
  '/supplements': { section: 'Nutrición & Rendimiento', title: 'Suplementos' },
  '/performance': { section: 'Nutrición & Rendimiento', title: 'Rendimiento' },
  '/wearables': { section: 'Nutrición & Rendimiento', title: 'Wearables' },
  '/reports': { section: 'Recursos', title: 'Reportes' },
  '/methods': { section: 'Recursos', title: 'Biblioteca de Métodos' },
  '/settings': { section: 'Recursos', title: 'Configuración' },
};

export default function Layout({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const { settings, setSettings } = useStore();
  const meta =
    TITLES[loc.pathname] ??
    (loc.pathname.startsWith('/results') ? { section: 'Análisis', title: 'Resultados' }
      : loc.pathname.startsWith('/patients/') ? { section: 'Evaluación', title: 'Ficha del paciente' }
      : loc.pathname.startsWith('/sports') ? { section: 'Análisis', title: 'Somatotipo vs Deportes' }
      : loc.pathname.startsWith('/reports') ? { section: 'Recursos', title: 'Reportes' }
      : { section: '', title: 'Body Composition' });

  return (
    <div className="app">
      <aside className="sidebar no-print">
        <div className="brand">
          <div className="brand-mark" />
          <div>
            <div className="brand-name">Body Composition</div>
            <div className="brand-sub">Data Science Analytics</div>
          </div>
        </div>
        <nav className="nav">
          {SECTIONS.map((sec) => (
            <div key={sec.label}>
              <div className="nav-label eyebrow">{sec.label}</div>
              {sec.items.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.to === '/'}
                  className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
                  <span className="nav-ico" style={{ display: 'grid', placeItems: 'center' }}>{n.ico}</span>
                  <span>{n.label}</span>
                  {n.tag && <span className="nav-tag">{n.tag}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="eyebrow" style={{ marginBottom: 4 }}>Evaluador</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>{settings.evaluatorName || 'Sin nombre'}</div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar no-print">
          <div className="crumb">
            {meta.section && <><span>{meta.section}</span><span style={{ color: 'var(--text-faint)' }}>/</span></>}
            <b>{meta.title}</b>
          </div>
          <div className="topbar-actions">
            <div className="seg">
              <button className={settings.lang === 'es' ? 'on' : ''} onClick={() => setSettings({ lang: 'es' })}>ES</button>
              <button className={settings.lang === 'en' ? 'on' : ''} onClick={() => setSettings({ lang: 'en' })}>EN</button>
            </div>
            <button className="icon-btn" title="Tema" onClick={() => setSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}>
              {settings.theme === 'dark' ? '☾' : '☀'}
            </button>
          </div>
        </header>

        <main className="content">{children}</main>

        <footer className="report-foot no-print" style={{ borderTop: '1px solid var(--line)', marginTop: 12 }}>
          <span>Body Composition · Antropometría ISAK</span>
          <span>by Data Science Analytics</span>
        </footer>
      </div>
    </div>
  );
}
