# 🧬 SUPER PROMPT — "Body Composition"
### Sistema integral de análisis de composición corporal por antropometría
**Desarrollado por: Data Science Analytics**

---

## 0. INSTRUCCIÓN MAESTRA PARA CLAUDE DESIGN

> Quiero que diseñes y desarrolles **"Body Composition"**, la aplicación de antropometría y análisis de composición corporal **más completa, precisa y visualmente innovadora del mundo**. Debe ser una plataforma de grado clínico-científico, usable por profesionales de la salud, ciencias del ejercicio y rendimiento deportivo. Estándar de mediciones: **protocolo ISAK (International Society for the Advancement of Kinanthropometry)**. La aplicación debe ser **rigurosa en lo matemático**, **impecable en lo visual** y **fluida en lo operativo**. Implementa TODO lo que se describe a continuación, sin omitir módulos, ecuaciones ni clasificaciones.

**Identidad de marca:**
- Nombre: **Body Composition**
- Desarrollador: **Data Science Analytics**
- Tono: científico, premium, confiable, futurista.
- Branding sutil de "Data Science Analytics" en header, footer y reportes exportados.

---

## 1. VISIÓN Y PRINCIPIOS DE PRODUCTO

1. **Precisión científica primero**: cada cálculo debe citar el autor/año de la ecuación y mostrar las unidades.
2. **Trazabilidad total**: toda evaluación queda asociada a un paciente, fecha, evaluador y protocolo usado.
3. **Comparabilidad**: el sistema debe permitir comparar evaluaciones de un mismo paciente en el tiempo y entre grupos.
4. **Transparencia metodológica**: el usuario puede ver la fórmula exacta usada en cada resultado (modo "ver ecuación").
5. **Diseño nunca antes visto**: dataviz interactiva, no plantillas genéricas.

---

## 2. ARQUITECTURA DE MÓDULOS (navegación principal)

1. **Dashboard** (resumen global, KPIs, últimas evaluaciones, agenda del día).
2. **Pacientes** (CRUD + agenda + historial).
3. **Nueva Evaluación** (ingreso de variables antropométricas).
4. **Motor de Cálculo / Resultados** (fraccionamiento, somatotipo, índices).
5. **Comparador** (intra-paciente longitudinal + entre grupos).
6. **Somatotipo vs Deportes** (referencia de literatura).
7. **Reportes** (PDF profesional exportable).
8. **Biblioteca de Métodos** (todas las ecuaciones documentadas).
9. **Configuración** (unidades, protocolo, perfil del evaluador).

---

## 3. MÓDULO DE PACIENTES Y AGENDA

- **Ficha del paciente**: nombre, RUT/ID, fecha de nacimiento (cálculo automático de edad decimal), sexo, etnia (para ecuaciones que lo requieren), deporte/disciplina, nivel competitivo, etiquetas/grupos personalizables (ej. "Selección Sub-17", "Rehabilitación", "Control 2026").
- **Agendamiento**: calendario con vista día/semana/mes; crear, mover y cancelar citas; recordatorios; estado de la cita (programada, realizada, no asistió).
- **Historial clínico-antropométrico**: línea de tiempo con todas las evaluaciones del paciente.
- **Asignación a grupos/cohortes** para comparaciones posteriores.

---

## 4. MÓDULO DE INGRESO DE EVALUACIÓN (variables ISAK)

Permitir registrar el **perfil completo ISAK** (con validación de rangos y unidades):

**Básicas:** peso (kg), talla (cm), talla sentado (cm), envergadura (cm).

**Pliegues cutáneos (mm):** tríceps, subescapular, bíceps, cresta ilíaca, supraespinal, abdominal, muslo anterior, pantorrilla medial.

**Perímetros (cm):** cabeza, cuello, brazo relajado, brazo flexionado en tensión, antebrazo, muñeca, tórax (mesoesternal), cintura (mínima), cadera (glútea máxima), muslo (1 cm subglúteo), muslo medio, pantorrilla máxima, tobillo.

**Diámetros óseos (cm):** biacromial, biiliocrestídeo (transverso del tórax), tórax anteroposterior, húmero (biepicondíleo), muñeca (biestiloideo), fémur (bicondíleo), tobillo (bimaleolar).

**Reglas:**
- Validación automática de plausibilidad y alerta de outliers.
- Permitir registrar el **error técnico de medida (ETM/TEM)** y promedio de 2–3 tomas.
- Selección del **protocolo de marcación de edad** (pediátrico vs adulto) que condiciona qué ecuaciones se ofrecen.

---

## 5. MOTOR DE CÁLCULO (NÚCLEO CIENTÍFICO)

### 5.1 Método de fraccionamiento de la masa corporal — **KERR (1988), 5 componentes**

Calcular las **5 masas** en **kg y %** mediante la estrategia del **Phantom (Ross & Wilson)** con puntuaciones Z:

1. **Masa adiposa (tejido adiposo)**
2. **Masa muscular (músculo esquelético)**
3. **Masa ósea (esquelética)**
4. **Masa residual** (órganos/vísceras)
5. **Masa de la piel**

**Procedimiento a implementar:**
- Z-score de cada variable: `Z = (1/s) · [ V · (170.18/Talla)^d − P ]`
  donde `V` = valor medido, `P` = valor Phantom, `s` = desviación Phantom, `d` = exponente dimensional (3 para masas).
- Masa del componente: `Masa = [ (Z · s) + P ] · (Talla/170.18)³`
- **Peso estructurado** = suma de las 5 masas fraccionadas.
- **Peso corregido / factor de corrección** = peso medido / peso estructurado, mostrando el residuo y el porcentaje de ajuste.
- Mostrar tabla de las 5 masas en **kg, % del peso medido y % del peso estructurado**, más un gráfico de barras/dona apilada.

### 5.2 **Somatotipo (Heath-Carter, antropométrico)**

Calcular los 3 componentes:

- **Endomorfia** = −0.7182 + 0.1451·X − 0.00068·X² + 0.0000014·X³
  donde `X = (Σ pliegues tríceps + subescapular + supraespinal) · (170.18 / talla)`
- **Mesomorfia** = (0.858·DiámHúmero + 0.601·DiámFémur + 0.188·PerímBrazoCorr + 0.161·PerímPantorrillaCorr) − (Talla·0.131) + 4.5
  - PerímBrazoCorr = perímetro brazo flexionado − (pliegue tríceps/10)
  - PerímPantorrillaCorr = perímetro pantorrilla − (pliegue pantorrilla/10)
- **Ectomorfia** basada en HWR = Talla / (Peso)^(1/3):
  - si HWR ≥ 40.75 → Ecto = 0.732·HWR − 28.58
  - si 38.25 ≤ HWR < 40.75 → Ecto = 0.463·HWR − 17.63
  - si HWR < 38.25 → Ecto = 0.1

**Somatocarta clásica (gráfica):**
- Coordenadas: `X = Ectomorfia − Endomorfia`; `Y = 2·Mesomorfia − (Endomorfia + Ectomorfia)`
- Dibujar el triángulo de Reuleaux clásico con las 13 categorías y graficar el punto del paciente (y el de un grupo, como nube + somatotipo medio ± SAM/SAD).
- **Clasificación de las 13 categorías**: mesomorfo balanceado, endomorfo balanceado, ectomorfo balanceado, mesomorfo-endomorfo, mesomorfo-ectomorfo, endomorfo-ectomorfo, endo-mesomorfo, ecto-mesomorfo, meso-endomorfo, ecto-endomorfo, meso-ectomorfo, endo-ectomorfo, central.
- Calcular **SAM (Somatotype Attitudinal Mean)** y **SDI** para comparaciones.

### 5.3 ECUACIONES DE **MASA MUSCULAR** (todas, por población)

> Implementar todas y permitir al usuario elegir/comparar. Indicar autor, año, población de validación y rango de edad recomendado.

**Adultos:**
- **Lee et al. (2000)** — masa muscular esquelética total (perímetros corregidos + talla + sexo + edad + etnia).
- **Doupe et al. (1997)**.
- **Martin et al. (1990)** — masa muscular esquelética (perímetros corregidos + diámetro fémur).
- **Heymsfield (1982)**.
- **Matiegka (1921)** — masa muscular antropométrica.
- **Drinkwater & Ross (1980)** / fraccionamiento Phantom (consistente con Kerr).
- **Kerr (1988)** — componente muscular del modelo de 5 fracciones.

**Niños y adolescentes:**
- **Poortmans et al. (2005)** — masa muscular esquelética en niños/adolescentes (adaptación de Lee).
- **Lee (2000)** con ajustes pediátricos.

Mostrar resultado en **kg y %**, comparativa lado a lado entre métodos y nota de la ecuación recomendada según edad/sexo.

### 5.4 ECUACIONES DE **MASA GRASA / TEJIDO ADIPOSO** (todas, por población)

**Niños y adolescentes:**
- **Slaughter et al. (1988)** — % grasa por pliegues (tríceps + subescapular ó tríceps + pantorrilla), con ajustes por sexo, maduración y etnia.

**Adultos (densidad → % grasa, vía Siri/Brozek):**
- **Durnin & Womersley (1974)** — densidad por 4 pliegues (bíceps, tríceps, subescapular, suprailíaco), logarítmica por sexo y edad.
- **Jackson & Pollock (1978, hombres)** — 3 y 7 pliegues.
- **Jackson, Pollock & Ward (1980, mujeres)** — 3 y 7 pliegues.
- **Withers et al. (1987)**.
- **Carter (1982)**.

**% grasa directo (antropométrico):**
- **Faulkner (1968)** — Σ 4 pliegues (tríceps + subescapular + supraespinal + abdominal)·0.153 + 5.783.
- **Yuhasz (1974)** — modificado por sexo.
- **Kerr (1988)** — masa adiposa del modelo de 5 fracciones.

**Conversión densidad → %grasa:**
- **Siri (1961)**: %G = (495/D) − 450
- **Brozek et al. (1963)**: %G = (4.57/D − 4.142)·100

Permitir elegir la ecuación de conversión y comparar resultados entre métodos en una tabla y gráfico.

### 5.5 **ÍNDICES ANTROPOMÉTRICOS** (todos los existentes)

Calcular y clasificar:
- **IMC / BMI** (kg/m²) + clasificación OMS.
- **Índice cintura-cadera (ICC / WHR)** + clasificación de riesgo por sexo.
- **Índice cintura-talla (ICT / WHtR)** (punto de corte 0.5).
- **Índice de masa grasa (FMI)** y **Índice de masa libre de grasa (FFMI)**.
- **Índice de conicidad (Conicity Index)**.
- **Índice de adiposidad corporal (BAI)**.
- **Índice braquial** (longitud antebrazo/longitud brazo) y **índice crural** (relaciones de segmentos).
- **Índice córmico** (talla sentado/talla) y **índice esquélico**.
- **Área muscular del brazo (AMB)** y **área grasa del brazo (AGB)**.
- **Índice de robustez / de Rohrer**.
- **Σ de pliegues** y **Σ corregido por talla**.
- **Relación músculo-óseo (M/O)** y **relación adiposo-muscular**.
- **WWI (Weight-adjusted Waist Index)**.

Cada índice debe mostrar **valor, fórmula, interpretación y rango de referencia por sexo y edad**.

---

## 6. CLASIFICACIONES INTELIGENTES

- **% de grasa por sexo**: tablas de clasificación diferenciadas hombre/mujer (ej. esencial, atlético, fitness, aceptable, obesidad), con código de color tipo semáforo y posición del paciente en una barra-gauge.
- **Somatotipo**: clasificación automática en una de las 13 categorías + descripción textual.
- **Masa muscular**: clasificación por percentiles/rangos según sexo y edad (bajo, normal, alto, muy alto).
- Mostrar todas las clasificaciones con **badges visuales** y explicación al pasar el cursor.

---

## 7. MÓDULO **SOMATOTIPO vs DEPORTES**

- Base de datos de **somatotipos de referencia por deporte y posición** reportados en la literatura (ej. Carter & Heath; estudios de élite por disciplina).
- Superponer en la somatocarta el punto del paciente vs el somatotipo medio del deporte seleccionado.
- Calcular la **distancia somatotípica (SAD)** entre el paciente y cada deporte, y entregar un ranking de "deportes más afines" al perfil del paciente.
- Filtros por sexo, nivel competitivo y disciplina.

---

## 8. COMPARADOR (longitudinal y entre grupos)

**Intra-paciente (evolución):**
- Seleccionar 2+ evaluaciones del mismo paciente.
- Gráficos de tendencia de peso, %grasa, masa muscular, las 5 fracciones, índices y desplazamiento del somatotipo en la somatocarta a lo largo del tiempo.
- Tabla de deltas (Δ kg, Δ %, Δ puntos) con flechas de mejora/empeoramiento.

**Entre grupos/cohortes:**
- Seleccionar 2+ grupos (ej. "Sub-15 vs Sub-17", "Pre vs Post temporada").
- Estadística descriptiva (media ± DE), boxplots, nubes de somatotipo y comparación de medias.
- Exportar comparativas.

---

## 9. REPORTES

- Reporte PDF profesional con marca **Body Composition · Data Science Analytics**.
- Incluye: datos del paciente, fecha, evaluador, perfil de mediciones, 5 fracciones (Kerr), peso estructurado/corregido, somatotipo + somatocarta, todas las ecuaciones de masa muscular y grasa seleccionadas, índices, clasificaciones y comparación con deportes.
- Exportación a PDF, CSV y Excel.

---

## 10. DISEÑO UX/UI (innovador, "nunca antes visto")

- **Estética premium científica**: modo oscuro y claro, glassmorphism sutil, microinteracciones, transiciones fluidas.
- **Somatocarta interactiva** (zoom, hover, animación del punto).
- **Visualización del cuerpo**: figura corporal con mapa de las 5 fracciones resaltadas por color al seleccionarlas.
- **Gauges y barras animadas** para clasificaciones.
- **Dashboard tipo cockpit** con KPIs vivos.
- Tipografía clara, jerarquía visual fuerte, diseño totalmente **responsive** (desktop y tablet de campo).
- Accesibilidad AA y soporte multilenguaje (Español/Inglés).

---

## 11. ENTREGABLES ESPERADOS

1. Aplicación funcional e interactiva con todos los módulos.
2. Motor de cálculo correcto y verificable (con "ver ecuación" en cada resultado).
3. Persistencia de pacientes, evaluaciones y grupos.
4. Somatocarta y visualizaciones interactivas.
5. Comparador longitudinal y por grupos.
6. Reportes exportables con la marca de Data Science Analytics.

---

## 12. CRITERIOS DE CALIDAD (no negociables)

- Edad calculada en **años decimales**.
- Unidades visibles en todo cálculo.
- Citar autor/año en cada ecuación.
- Validación de rangos y alertas de datos inconsistentes.
- Cero placeholders: todo debe calcular de verdad.

---

> **Objetivo final:** que "Body Composition" sea reconocida como la herramienta de antropometría y composición corporal de referencia mundial, combinando rigor científico (Kerr, Heath-Carter, ISAK) con un diseño que marque un antes y un después.
>
> **Body Composition — by Data Science Analytics.**
