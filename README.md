# 🧬 Body Composition — by Data Science Analytics

> **Nota:** El repositorio contiene **dos** implementaciones:
> 1. **`original-app/`** — la app original de *Claude Designs* (React UMD + JSX en el navegador,
>    `styles.css` + `app/*.jsx`). Es la versión de referencia del diseño.
>    - Ver al instante: `npm run build:original` genera `BodyComposition.html` (un solo archivo, doble clic).
>    - Servir en desarrollo: `npm run serve:original` → http://localhost:5174
> 2. **App React + TypeScript + Vite** (`src/`) — reimplementación con motor de cálculo testeado.
>
> Lo descrito abajo corresponde a la versión Vite.

---


Sistema integral de **análisis de composición corporal por antropometría** (protocolo **ISAK**),
de grado clínico-científico, para profesionales de la salud, ciencias del ejercicio y rendimiento
deportivo.

> **Body Composition — by Data Science Analytics.**

## ✨ Características

- **Motor de cálculo científico y verificable** (con pruebas unitarias):
  - **Fraccionamiento de Kerr (1988)** en 5 componentes (piel, adiposo, músculo, óseo, residual) vía
    estratagema del **Phantom** (Ross & Wilson) con puntuaciones Z, peso estructurado y factor de corrección.
  - **Somatotipo de Heath-Carter**: endo/meso/ectomorfia, somatocarta, 13 categorías, SAM y SAD.
  - **Masa grasa**: Durnin & Womersley, Jackson-Pollock(-Ward), Withers, Faulkner, Yuhasz, Slaughter,
    con conversión densidad→%grasa por **Siri** y **Brozek**.
  - **Masa muscular**: Lee (2000), Martin (1990), Matiegka (1921), Kerr.
  - **Índices**: IMC, ICC, ICT, FMI, FFMI, conicidad, BAI, córmico/esquélico, AMB/AGB, Rohrer, Σ pliegues,
    M/O, adiposo-muscular, WWI — con valor, fórmula, interpretación y referencia.
- **Módulos**: Dashboard, Pacientes (CRUD + agenda + historial), Nueva Evaluación (ISAK con validación de
  rangos), Resultados, Comparador (longitudinal y entre grupos), Somatotipo vs Deportes, Reportes
  (PDF/CSV/Excel), Biblioteca de Métodos, Configuración.
- **UX premium**: modo oscuro/claro, glassmorphism, somatocarta interactiva (SVG), dona de fracciones,
  figura corporal, gauges, multilenguaje (ES/EN), responsive.
- **Trazabilidad total**: cada cálculo cita autor/año y permite "ver ecuación"; edad en **años decimales**;
  unidades visibles; alertas de datos inconsistentes; persistencia local (sin backend).

## 🚀 Uso

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de producción en dist/
npm test           # pruebas del motor de cálculo
```

En el primer arranque, el Dashboard ofrece **cargar datos de demostración**.

## 🧪 Calidad

- `npm test` — verifica la matemática del motor (edad decimal, Siri/Brozek, Faulkner, somatotipo, Kerr, índices).
- `npm run typecheck` — comprobación estricta de TypeScript.

## ⚠️ Nota de verificación científica

Las constantes del **Phantom para las masas tisulares** del fraccionamiento de Kerr (medias y
desviaciones de piel/adiposo/músculo/hueso/residual) y algunos coeficientes de ecuaciones para
deportistas (Withers) provienen de literatura secundaria de cineantropometría. Para uso clínico crítico
se recomienda cotejarlas con las fuentes primarias (Kerr, 1988; Ross & Marfell-Jones, 1991). Todos los
valores están centralizados y documentados en `src/engine/phantom.ts`.

## 🏗️ Arquitectura

```
src/
  engine/        Motor de cálculo (puro, sin UI, testeado)
    phantom.ts   Constantes Phantom (Ross & Wilson)
    kerr.ts      Fraccionamiento 5 componentes
    somatotype.ts Heath-Carter + somatocarta + SAM/SAD
    fat.ts       Ecuaciones de masa grasa + Siri/Brozek
    muscle.ts    Ecuaciones de masa muscular
    indices.ts   Índices antropométricos
    classifications.ts  Clasificaciones (% grasa, músculo)
    sports.ts    Somatotipos de referencia por deporte
    methods.ts   Biblioteca documental de métodos
    validation.ts  Rangos de plausibilidad
  store/         Persistencia (zustand + localStorage)
  components/    Layout, SomatoChart, charts, BodyMap, ui
  pages/         Dashboard, Patients, NewEvaluation, Results, …
```

Stack: **React 18 + TypeScript + Vite + Zustand**. Visualizaciones en **SVG propio** (sin dependencias de
gráficos). Reportes por impresión del navegador (PDF) y exportación CSV/Excel.
