# spec.md — 001 Gerencia General

- **Estado:** Implementado en Angular 21 (Gerencia General)
- **Fecha:** 2026-10-14
- **Rol:** Gerencia General

## Contexto

Gerencia General necesita una vista única para monitorear el desempeño del gimnasio:
ingresos, tamaño y salud de la base de membresías, y su evolución en el tiempo.
Los datos provienen del Data Warehouse vía la API pública de KPIs.

Esta funcionalidad es además la **plantilla base** para los demás roles
(Administración/Comercial, Entrenador, Recepción), que reutilizarán su estructura.

## Alcance

### KPIs principales
| Indicador | Origen | Formato |
| --- | --- | --- |
| Ingresos del periodo | último periodo con actividad (`ingresosPeriodoActual > 0`) | `S/` (es-PE) |
| Ingresos del periodo anterior | mismo registro (`ingresosPeriodoAnterior`) | `S/` (es-PE) |
| Variación vs. periodo anterior | `tasaCrecimientoIngresos` o cálculo `(actual - anterior) / anterior` | `+x.x%` / `-x.x%` |
| Membresías activas | último periodo con `membresiasActivas > 0` | entero |
| Membresías por vencer | `membresiasVencenPeriodo` | entero |
| Retención de clientes | `tasaRetencionClientes` | `%` |
| Renovación | `tasaRenovacionMembresias` | `%` |
| Renovaciones de cohorte | `membresiasCohorteRenovadas` | entero |

### Gráficos y bloques
1. **Hero de ingresos** — cifra del periodo, chip de variación y mini-serie de los últimos 6 meses.
2. **Evolución de ingresos** — serie de línea (`ingresosPeriodoActual` por periodo). *(Pulso y Clara)*
3. **Membresías activas y renovadas** — barras agrupadas. *(Pulso y Clara)*
4. **Tarjetas** — membresías activas, renovación y retención, con barra de progreso.
5. **Tabla por plan** — ingresos del periodo y del previo, vendidas, vencían, renovadas y tasa.
6. **Foco del periodo** — el plan con menor tasa de renovación entre los que tenían vencimientos.

### Filtros (funcionales)
Año, Trimestre, Mes y Plan. El **Plan** filtra la tabla; la retención y la renovación son de toda la
sede (el DW no las desglosa por plan). Por defecto, el último periodo con actividad del año.

Reglas de agregación de las vistas del DW:
- **Sumables**: ingresos, cantidad de ventas, `MembresiasVencenPeriodo` y `MembresiasCohorteRenovadas`.
- **Puntuales del mes** (no sumables): `MembresiasActivas` y la retención; se toma el último mes del rango.

### Endpoints consumidos
- `GET /kpis/gerencia/ingresos`
- `GET /kpis/gerencia/membresias`
- `GET /kpis/comercial/planes` *(tabla por plan)*

Devuelven **listas históricas**; no asumir un objeto único.

### Estados
- **Carga:** indicador "Conectando…" y números atenuados.
- **Éxito:** indicador "Conectado al DW", KPIs y gráficos poblados.
- **Error:** aviso visible con acción de reintento vía **Actualizar**.

## Criterios de aceptación

- [ ] Los KPIs reflejan el **último periodo con actividad real**, no periodos futuros vacíos.
- [ ] Valores en soles con formato local (`S/`) y miles separados.
- [ ] Los gráficos dibujan sus ejes temporales sin desfases ni nulos no controlados.
- [ ] La tabla por plan agrupa por `tipo_plan` y su total reconcilia con el hero.
- [ ] Los filtros Año / Trimestre / Mes / Plan cambian la vista sin errores de consola.
- [ ] El aviso de error permanece **oculto** en el estado normal.
- [ ] Verificado en Chrome (MCP `chrome-devtools`): consola sin errores y `200 OK` en ambos endpoints.
- [ ] Responsive hasta móvil.

## Fuera de alcance (por ahora)
- Autenticación (los endpoints son públicos).
- Filtro dimensional real por fecha (existe el control, pero es vista previa).
- Roles distintos a Gerencia General.
