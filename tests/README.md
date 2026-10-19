# tests/

Pruebas del proyecto con **Vitest** (builder `@angular/build:unit-test`).

## Dónde viven
Las pruebas unitarias van **junto al código**, como `<archivo>.spec.ts`
(p. ej. `src/app/core/kpi.helpers.spec.ts`), que es lo que incluye `tsconfig.spec.json`.
Este directorio queda reservado para pruebas de integración/E2E cuando se añadan.

## Qué se prueba
- `core/kpi.helpers.ts`: agrupación por `tipo_plan`, cohortes sumables vs puntuales, último periodo
  con actividad y series.
- `core/format.ts`: moneda `S/`, enteros y redondeo de porcentajes.
- `core/api/`: contrato del DW (cuando se añada un mock de `HttpClient`).

## Comandos
```bash
npm test                # una pasada
npm test -- --watch     # modo watch
```

> La verificación visual de cada cambio se hace en Chrome vía el MCP `chrome-devtools`
> (ver `docs/constitution.md`, sección 7).
