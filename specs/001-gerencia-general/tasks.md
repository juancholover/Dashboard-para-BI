# tasks.md — 001 Gerencia General

Checklist ordenado. Marcar conforme avanza.

## Etapa 1 — Prototipos (retirados)

- [x] Definir la estructura de carpetas del proyecto (`docs/`, `specs/`, `tests/`, `src/`).
- [x] Crear la capa de datos compartida (prototipo `dw.js`).
- [x] Crear las fábricas de gráficos compartidas (prototipo `charts.js`).
- [x] Refactorizar la variante **Savia** (`index.html` + `style.css` + `app.js`).
- [x] Refactorizar la variante **Pulso** (`index.html` + `style.css` + `app.js`).
- [x] Refactorizar la variante **Clara** (`index.html` + `style.css` + `app.js`).
- [x] Crear el comparador de variantes (prototipo).
- [x] Verificar las tres variantes en Chrome (MCP): consola, red y render.
- [x] Elegir la variante definitiva: **Savia**.
- [x] Rediseñar Savia con el mockup de Figma (hero, tarjetas, tabla por plan, foco del periodo).
- [x] Implementar filtros funcionales (Año, Trimestre, Mes, Plan) contra el DW.
- [x] Ampliar la capa de datos: `cargarTodo`, agrupación por `tipo_plan` y agregación de cohortes.
- [x] Verificar el rediseño en Chrome (MCP): consola limpia, `200 OK` en los 3 endpoints y render.

## Etapa 2 — Angular 21

- [x] Inicializar el workspace de Angular 21 + Tailwind v4 + `@ngrx/signals`.
- [x] Modelar los DTOs de TypeScript (espejo de las vistas del DW).
- [x] Implementar la capa de datos como servicio (`core/`) con `HttpClient`.
- [x] Implementar los componentes compartidos (`shared/`): KPI card, barra, filtros y gráfico.
- [x] Implementar la vista y el `signalStore` de Gerencia (`features/gerencia/`).
- [x] Implementar los filtros Año / Trimestre / Mes / Plan y el clic en fila.
- [x] Verificar con `npm run build` (sin warnings), `npm test` (9 pruebas) y Chrome (MCP).
- [ ] Añadir pruebas de componente para la página de Gerencia.
