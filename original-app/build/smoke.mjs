import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
const html = readFileSync(new URL('../../BodyComposition.html', import.meta.url), 'utf8');
const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/',
  beforeParse(window) {
    window.matchMedia = () => ({ matches: false, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} });
    const oe = window.console.error;
    window.console.error = (...a) => { errors.push(a.join(' ')); };
    window.addEventListener('error', e => errors.push('window.error: ' + (e.error?.stack || e.message)));
  },
});
await new Promise(r => setTimeout(r, 1000));
const root = dom.window.document.getElementById('root');
console.log('root children:', root ? root.children.length : 'NO ROOT');
console.log('innerHTML length:', root ? root.innerHTML.length : 0);
// detectar pantallas/sidebar
const sidebar = dom.window.document.querySelector('.sidebar, .brand-name');
console.log('sidebar/brand present:', !!sidebar);
const navItems = dom.window.document.querySelectorAll('.nav-item').length;
console.log('nav items:', navItems);
console.log('--- errores:', errors.length);
errors.slice(0,15).forEach(e => console.log('ERR>', String(e).slice(0,260)));
