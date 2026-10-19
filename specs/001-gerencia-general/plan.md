# plan.md — 001 Gerencia General

Enfoque técnico y orden de construcción del dashboard de Gerencia General.

## Enfoque

Separar **datos** de **presentación**:

- **Capa de datos (única):** acceso a la API y normalización de los KPIs. Es la única que conoce
  la forma de las respuestas del DW y la regla del "último periodo con actividad".
- **Capa de presentación (por variante):** marcado y estilo, más un pequeño archivo que vincula
  los datos al DOM y define el tema de los gráficos.

Así, cambiar de variante visual no toca la lógica de datos, y arreglar un bug de datos se hace en
un solo lugar.

## Etapas

### Etapa 1 — Prototipos (retirados)
Los prototipos HTML/CSS/JS fueron la referencia visual para elegir **Savia**. Una vez migrado el
panel a Angular, se retiraron del repositorio; la implementación vive en `src/app/`.

### Etapa 2 — Angular 21 (implementada)
- Workspace en `src/app/` con Standalone Components, **zoneless** y control flow moderno.
- `core/` con `DwApiService` (`HttpClient` + `withFetch`), DTOs tipados y helpers puros.
- `shared/` con `kpi-card`, `progress-bar`, `filter-bar` y `chart` (Chart.js modular).
- `features/gerencia/` con `signalStore` (`@ngrx/signals`) y la página.
- Tailwind **v4** (`@theme`) con los tokens de Savia.
- Verificado con `npm run build`, `npm test` (Vitest) y Chrome vía el MCP.

## Archivos

| Archivo | Rol |
| --- | --- |
| `src/app/core/kpi.helpers.ts` | Reglas de negocio puras (agrupación, cohortes, periodos) |
| `src/app/core/api/dw-api.service.ts` | Acceso al DW con `HttpClient` |
| `src/app/features/gerencia/gerencia.store.ts` | Estado del panel (`signalStore`) |
| `src/app/features/gerencia/gerencia-page.*` | Vista del panel |

## Decisiones y por qué

- **Último periodo con actividad:** el DW proyecta periodos futuros vacíos (hasta 2027); se filtra
  por `> 0` para que los KPIs muestren datos reales.

## Riesgos

- **CORS / origen:** el fetch al DW necesita origen `http`/`https`; la verificación de datos se hace
  sobre un servidor local, no con `file://`.
- **Cambios de contrato DTO:** si el DW renombra campos, ajustar únicamente `dw.js`.
