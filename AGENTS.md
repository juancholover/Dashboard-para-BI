# AGENTS.md — vip-center-fit-dashboard

Panel analítico y de Business Intelligence para la gestión integral de VIP Center Fit. Permite a
Gerencia General monitorear ingresos, retención y evolución de membresías desde el Data Warehouse,
sirviendo además como arquitectura base para los roles de Administración/Comercial, Entrenador y
Recepción.

> La estructura, el flujo de trabajo y las reglas completas están en **`docs/constitution.md`**.
> Este archivo es el resumen operativo; si hay conflicto, manda la constitución.

## Stack
- **App (actual)**: Angular **21.2** (Standalone Components, control flow `@if`/`@for`, Signals,
  **zoneless** por defecto). Node 24 exige Angular ≥ 20; por eso 21 y no 18.
- **Estado**: `@ngrx/signals` 21 (`signalStore` con `withState`/`withComputed`/`withMethods`).
- **Estilos**: Tailwind CSS **v4** (`@tailwindcss/postcss` + `@theme` con los tokens de Savia).
- **Gráficos**: Chart.js 4 (build modular: hay que **registrar** escalas y elementos).
- **HTTP**: `HttpClient` con `provideHttpClient(withFetch())`.
- **Pruebas**: Vitest con el builder `@angular/build:unit-test` (`npm test`).
- **Idioma**: documentación y textos de interfaz en español (es-PE).

## Estructura del Proyecto
```text
DASHBOARD/
├── AGENTS.md
├── MEMORY.md
├── angular.json · package.json · tsconfig*.json · .postcssrc.json
├── docs/
│   └── constitution.md
├── specs/
│   └── 001-gerencia-general/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
├── tests/
│   └── README.md
└── src/
    ├── index.html · main.ts · styles.css
    ├── environments/{environment.ts, environment.development.ts}
    └── app/
        ├── app.ts · app.config.ts · app.routes.ts
        ├── core/
        │   ├── kpi.models.ts             # DTOs del DW + modelos de vista
        │   ├── dw-api.service.ts         # único acceso a la API
        │   ├── kpi.helpers.ts            # lógica pura (probada)
        │   ├── catalogs.ts
        │   └── format.ts
        ├── shared/
        │   ├── kpi-card.ts · progress-bar.ts · filter-bar.ts · chart.ts
        └── features/gerencia/
            ├── gerencia.store.ts         # signalStore
            ├── gerencia-page.ts / .html
            └── tabla-planes.ts
```

## Memoria
Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.

Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores
a evitar.

Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.

No guardes nunca datos sensibles (claves, tokens, datos personales).

## Forma de trabajar
**Planificación modular**: cada funcionalidad se respalda en `specs/XXX-nombre/` con
`spec.md`, `plan.md` y `tasks.md` antes de escribir código.

**Cambios atómicos**: modificar componentes y stores en pasos aislados y funcionales.

**Entrega explicativa**: al concluir una tarea, documentar qué archivo cambió, qué endpoint
consumió y el estado de la verificación visual.

## Límites
✅ **Siempre**
- Actualizar `MEMORY.md` al terminar cada tarea.
- Usar Signals nativos y `@ngrx/signals` para la reactividad.
- Implementar estados de carga (`loading`) y error (`error`) en cada llamada de API.
- Aplicar formato de moneda local en soles (`S/`) para métricas financieras.
- Poner la lógica de negocio en funciones puras (`core/`) y cubrirla con pruebas.

⚠️ **Pregunta antes de**
- Instalar librerías UI de terceros o cambiar Chart.js.
- Crear endpoints o alterar contratos DTO no presentes en Swagger.
- Modificar variables globales o la configuración base de Tailwind.

🚫 **Nunca**
- Usar `NgModule`, `CommonModule` obsoleto o sintaxis antigua (`*ngIf`, `*ngFor`).
- Utilizar el tipo `any`; todo payload debe tener su `interface`/DTO tipado.

## Verificación
- **Cada cambio se revisa en Chrome** vía el MCP `chrome-devtools` (ya configurado), antes de darlo
  por terminado: consola sin errores, red y render.
- **Build**: `npm run build` compila sin errores ni warnings de tipos (`strict: true`).
- **Pruebas**: `npm test` (Vitest) en verde.
- **Consumo de API**: `200 OK` en `https://vip-center-fit-bi.lrydev.me/api/v1/...`.
- **Render**: los KPIs coinciden con el último periodo con actividad y la tabla por plan reconcilia
  con el hero.
