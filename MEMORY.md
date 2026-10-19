# MEMORY.md — VIP Center Fit Dashboard
Memoria viva del proyecto entre sesiones. Máximo ~50 líneas: resumir o podar lo que deje de aportar.

## Estado actual
- **App Angular 21.2** en `src/`: standalone, zoneless, `@ngrx/signals`, Tailwind v4, Chart.js y Vitest.
  Página de Gerencia completa y verificada: `npm run build` limpio, `npm test` 9/9, Chrome sin errores.
- La UI de Savia vive en `src/`; los prototipos HTML se retiraron tras la migración a Angular.
- Backend en producción: `https://vip-center-fit-bi.lrydev.me/api/v1` (público, sin auth).
- Spec activa: `specs/001-gerencia-general/`. Etapa 2 completada.

## Decisiones (y por qué)
- **Angular 21, no 18**: Node 24 solo lo soportan Angular ≥ 20. Tailwind v4 por su `@theme` CSS-first.
- **Lógica en funciones puras** (`core/kpi.helpers.ts`): se prueba sin Angular y la comparte el store.
- **`signalStore`** para datos + filtros + derivados (`withState`/`withComputed`/`withMethods`).
- **Último periodo con actividad**: el DW proyecta años futuros vacíos; el año/mes por defecto salen
  de los periodos **con ingresos** (membresías llega más lejos y despista).
- **Filtros en cliente**: se traen las 3 fuentes una vez (~48 + ~216 filas) y se filtran/agregan.
- **El plan filtra la tabla**, no la retención: `DM_Gerencia_Membresias` no tiene dimensión de plan.
- **Verificación en Chrome (MCP)** obligatoria en cada cambio.

## Aprendizajes y errores a evitar
- `DM_Comercial_Plan` trae **varias filas por `tipo_plan`** (`DimPlan` = plan + operación + promoción):
  agrupar por `tipo_plan` antes de sumar o los planes salen repetidos y el total se infla.
- Chart.js v4 es **modular**: sin `Chart.register(CategoryScale, …)` falla con
  "category is not a registered scale".
- `NODE_ENV=production` hace que `npm install` **omita devDependencies** (sin `ng`): usar `--include=dev`.
- `ng serve` con watch sobre OneDrive se cuelga; para verificar, `npm run build` + servir `dist/…/browser`.
- El atributo `hidden` no basta si un estilo aplica `display`: usar `[hidden]{display:none!important}`.
- `IngresosPeriodoAnterior` es el **mes anterior de la serie** (LAG), no el mismo mes del año previo.
- Las tasas llegan con muchos decimales: redondear a 1 decimal en `core/format.ts`.

## Próximos pasos
- [ ] Pruebas de componente para la página de Gerencia.
- [ ] Extender el patrón a Comercial, Entrenamiento y Recepción.
