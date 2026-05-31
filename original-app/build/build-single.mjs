// Genera un HTML autónomo (offline) de la app original (React UMD + JSX).
// Transpila cada .jsx con Babel y lo inlinea en su propio <script> para
// preservar el scope por archivo del montaje original.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import babel from '@babel/core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Orden exacto del index.html original.
const ORDER = [
  'i18n', 'data', 'data_nutri', 'engine', 'engine_nutri', 'store', 'ui', 'somatochart',
  'screens_eval', 'screens_results', 'screens_soma', 'screens_dashboard', 'screens_agenda',
  'screens_patients', 'screens_comparator', 'screens_methods', 'screens_settings', 'screens_report',
  'screens_metabolism', 'screens_supplements', 'screens_diet', 'screens_performance',
  'screens_wearables', 'screens_phantom', 'app',
];

const react = readFileSync(join(root, '../node_modules/react/umd/react.production.min.js'), 'utf8');
const reactDom = readFileSync(join(root, '../node_modules/react-dom/umd/react-dom.production.min.js'), 'utf8');
const styles = readFileSync(join(__dirname, '..', 'styles.css'), 'utf8');

const scripts = ORDER.map((name) => {
  const src = readFileSync(join(__dirname, '..', 'app', `${name}.jsx`), 'utf8');
  const out = babel.transformSync(src, {
    presets: [['@babel/preset-react', { runtime: 'classic' }]],
    filename: `${name}.jsx`,
    compact: false,
    comments: false,
  }).code;
  return `<script data-mod="${name}">\n${out}\n</script>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Body Composition · Data Science Analytics</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
${styles}
</style>
</head>
<body>
<div id="root"></div>
<script>${react}</script>
<script>${reactDom}</script>
${scripts}
</body>
</html>
`;

const dest = join(root, '..', 'BodyComposition.html');
writeFileSync(dest, html);
console.log('OK →', dest, (html.length / 1024).toFixed(0) + ' kB');
