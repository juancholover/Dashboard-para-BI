# Constitución — VIP Center Fit Dashboard

Documento rector del proyecto. Define **cómo se organiza**, **cómo se trabaja** y **qué reglas
son innegociables**. Si algo contradice este documento, gana este documento (y `AGENTS.md`, que
es su resumen operativo para agentes).

---

## 1. Propósito

Panel analítico y de Business Intelligence para la gestión integral de **VIP Center Fit**.
Permite a Gerencia General monitorear ingresos, membresías y retención desde el Data Warehouse,
y sirve como arquitectura base para los roles de Administración/Comercial, Entrenador y Recepción.

---

## 2. Mapa de carpetas canónico

```text
DASHBOARD/
├── AGENTS.md                  # Resumen operativo para agentes (stack, límites, estructura)
├── MEMORY.md                  # Memoria viva entre sesiones (estado, decisiones, errores)
├── angular.json · package.json · tsconfig*.json · .postcssrc.json
├── docs/
│   └── constitution.md        # Este documento: estructura, flujo y reglas
├── specs/
│   └── 001-<nombre>/          # Una carpeta por funcionalidad, numerada
│       ├── spec.md            # QUÉ se construye y criterios de aceptación
│       ├── plan.md            # CÓMO se construye (enfoque técnico)
│       └── tasks.md           # Checklist ordenado de tareas
├── tests/
│   └── README.md              # Convención de pruebas
└── src/                       # Aplicación Angular 21
    ├── index.html · main.ts · styles.css
    ├── environments/          # environment.ts / environment.development.ts
    └── app/
        ├── app.ts · app.config.ts · app.routes.ts
        ├── core/              # DTOs, helpers puros, formatters, DwApiService
        ├── shared/            # UI reutilizable (kpi-card, progress-bar, filter-bar, chart)
        └── features/          # Una carpeta por rol (gerencia/)
```

### Rol de cada carpeta
| Carpeta | Qué va aquí | Qué **no** va aquí |
| --- | --- | --- |
| `docs/` | Documentación rectora y del backend | Código, datos temporales |
| `specs/` | Especificación/plan/tareas por funcionalidad | Código ejecutable |
| `tests/` | Convención y pruebas de integración | Prototipos, assets de diseño |
| `src/core/` | Modelos, helpers puros, formatters y acceso HTTP | Componentes de UI |
| `src/shared/` | Componentes reutilizables sin lógica de negocio | Estado de una feature |
| `src/features/` | Store, página y bloques de cada rol | Utilidades transversales |

> **Arquitectura de la app.** `core/` concentra la lógica (datos y reglas), `shared/` la UI
> reutilizable y `features/` cada rol. La lógica de negocio vive en **funciones puras** para poder
> probarla sin Angular.

---

## 3. Flujo de trabajo

Cada funcionalidad nace en `specs/` antes de escribir código:

1. **`specs/XXX-nombre/spec.md`** — alcance, endpoints, estados y criterios de aceptación.
2. **`specs/XXX-nombre/plan.md`** — enfoque técnico y archivos que se tocarán.
3. **`specs/XXX-nombre/tasks.md`** — checklist ordenado; se marca conforme avanza.
4. **Código** — cambios **atómicos**: un paso aislado y funcional a la vez.
5. **Memoria** — al terminar, actualizar `MEMORY.md` (estado, decisiones, errores a evitar).

---

## 4. Stack

- **App:** Angular **21.2** (Standalone Components, control flow `@if`/`@for`, Signals,
  **zoneless** por defecto). Node 24 exige Angular ≥ 20.
- **Estado:** `@ngrx/signals` 21 (`signalStore`).
- **Estilos:** Tailwind CSS **v4** (`@tailwindcss/postcss` + `@theme` con los tokens de Savia).
- **Gráficos:** Chart.js 4 (build modular: registrar escalas y elementos que se usen).
- **HTTP:** `HttpClient` con `provideHttpClient(withFetch())`.
- **Pruebas:** Vitest con el builder `@angular/build:unit-test`.
- **Idioma:** documentación, comentarios y textos de interfaz en **español** (es-PE).

---

## 5. Convenciones de código

- **Nombres:** `kebab-case` para archivos y carpetas (`kpi.helpers.ts`, `tabla-planes.ts`).
- **Sin `any`:** todo payload debe tener su `interface`/DTO tipado.
- **Sin sintaxis antigua:** prohibido `NgModule`, `CommonModule` y `*ngIf`/`*ngFor`.
- **Reactividad:** Signals nativos y `@ngrx/signals`.
- **Estados de API:** toda llamada implementa estado de **carga** y de **error**.
- **Moneda:** métricas financieras en soles con formato local (`S/`, `es-PE`).
- **Lógica pura:** las reglas de negocio van en `core/` y se cubren con pruebas (`.spec.ts` junto
  al archivo, como marca la convención de Angular + Vitest).
- **Prototipos:** scripts clásicos con namespace en `window` (no ES modules) para que sigan
  funcionando abriéndolos por `file://`.

---

## 6. Datos y API

- **Base URL:** `https://vip-center-fit-bi.lrydev.me/api/v1` (endpoints de KPIs públicos, sin auth).
- **Endpoints usados:** `/kpis/gerencia/ingresos`, `/kpis/gerencia/membresias` y
  `/kpis/comercial/planes` (tabla por plan).
- Los endpoints devuelven **listas históricas** (`Array`), no un objeto único.
- El DW proyecta periodos futuros vacíos: se toma el **último registro con actividad (`> 0`)** y el
  año por defecto se deriva de los periodos **con ingresos**.
- Campos numéricos pueden llegar en `null`: se normalizan a `0`.
- **Agregación:** los flujos y cohortes se suman; `membresiasActivas` y la retención son puntuales
  del mes (se toma el último).
- **`DM_Comercial_Plan` trae varias filas por `tipo_plan`** (`DimPlan` unifica plan + operación +
  promoción): hay que **agrupar por `tipo_plan`** antes de sumar.
- La capa de datos vive en `src/app/core/` (`DwApiService` + `kpi.helpers.ts`); las vistas solo consumen.

---

## 7. Verificación (obligatoria)

**Ningún cambio se da por terminado sin revisarlo en Chrome.** El MCP `chrome-devtools` ya está
configurado; no requiere instalar nada.

Por cada cambio:
1. **Build:** `npm run build` sin errores ni warnings de tipos (`strict: true`).
2. **Pruebas:** `npm test` (Vitest) en verde.
3. Servir la app (dev en `:4200` o el build de producción con un servidor estático en `:4201`).
4. **Consola:** sin errores ni warnings relevantes.
5. **Red:** `200 OK` en los tres endpoints de KPIs.
6. **Render:** KPIs con datos, tabla por plan que reconcilia con el hero y filtros funcionales.
7. Si algo falla, corregir y **volver a revisar antes de continuar**.

---

## 8. Límites

**Siempre**
- Actualizar `MEMORY.md` al terminar cada tarea.
- Usar Signals y `@ngrx/signals` para la reactividad.
- Implementar estados de carga y error en cada llamada de API.
- Aplicar formato `S/` en métricas financieras.
- Poner la lógica de negocio en funciones puras y cubrirla con pruebas.
- Verificar cada cambio en Chrome (MCP) y con `npm run build`.

**Preguntar antes de**
- Instalar librerías UI de terceros o cambiar Chart.js.
- Crear endpoints o alterar contratos DTO ausentes en Swagger.
- Modificar variables globales o la configuración base de Tailwind.

**Nunca**
- Usar `NgModule`, `CommonModule` o sintaxis antigua (`*ngIf`, `*ngFor`).
- Usar el tipo `any`.
- Guardar datos sensibles (claves, tokens, datos personales) en el repo.
