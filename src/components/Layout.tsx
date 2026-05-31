import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useT } from '../i18n';

const NAV = [
  { to: '/', key: 'dashboard', ico: '◈' },
  { to: '/patients', key: 'patients', ico: '☰' },
  { to: '/new', key: 'newEval', ico: '＋' },
  { to: '/comparator', key: 'comparator', ico: '⇄' },
  { to: '/sports', key: 'sports', ico: '◎' },
  { to: '/reports', key: 'reports', ico: '⎙' },
  { to: '/methods', key: 'methods', ico: '𝑓' },
  { to: '/settings', key: 'settings', ico: '⚙' },
];

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/patients': 'Pacientes',
  '/new': 'Nueva Evaluación',
  '/comparator': 'Comparador',
  '/sports': 'Somatotipo vs Deportes',
  '/reports': 'Reportes',
  '/methods': 'Biblioteca de Métodos',
  '/settings': 'Configuración',
};

export default function Layout({ children }: { children: ReactNode }) {
  const t = useT();
  const loc = useLocation();
  const { settings, setSettings } = useStore();
  const title =
    TITLES[loc.pathname] ??
    (loc.pathname.startsWith('/results') ? 'Resultados'
      : loc.pathname.startsWith('/patients') ? 'Paciente'
      : 'Body Composition');

  return (
    <div className="app">
      <aside className="sidebar no-print">
        <div className="brand">
          <div className="logo">B</div>
          <div>
            <div className="name">Body Composition</div>
            <div className="sub">Data Science Analytics</div>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="ico">{n.ico}</span> {t(n.key)}
            </NavLink>
          ))}
        </nav>
        <div className="group-label">Sesión</div>
        <div style={{ padding: '0 .4rem', fontSize: '.78rem', color: 'var(--text-faint)' }}>
          {settings.evaluatorName || 'Evaluador sin nombre'}
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="title">{title}</div>
          <div className="actions">
            <button className="ghost" title="Idioma" onClick={() => setSettings({ lang: settings.lang === 'es' ? 'en' : 'es' })}>
              {settings.lang === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'}
            </button>
            <button className="ghost" title="Tema" onClick={() => setSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}>
              {settings.theme === 'dark' ? '☾' : '☀'}
            </button>
          </div>
        </header>

        <main className="content">{children}</main>

        <footer className="footer no-print">
          <span>Body Composition · {t('tagline')}</span>
          <span>by Data Science Analytics</span>
        </footer>
      </div>
    </div>
  );
}
