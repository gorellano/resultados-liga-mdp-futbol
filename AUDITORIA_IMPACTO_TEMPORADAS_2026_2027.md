# Auditoría de Impacto: Temporadas y Cambio de Año (2026 → 2027)
> **Proyecto:** Costa y Gol · Resultados Liga Marplatense de Fútbol  
> **Fecha de análisis:** Octubre 2026

---

## 1. Resumen Ejecutivo

En la pantalla principal (Home), el texto **"Temporada 2026"** y las etiquetas como **"Séptima División (Categoría 2010)"** **NO son textos fijos aislados**:
* El año de temporada se obtiene dinámicamente del campo `year` del torneo activo en la base de datos de Supabase (`tournaments.year`).
* Las categorías juveniles se calculan matemáticamente con la fórmula oficial de la Liga:  
  `Año Categoría = Número División + Año Torneo - 23`  
  *(En 2026: 7ma + 2026 - 23 = 2010. En 2027: 7ma + 2027 - 23 = 2011)*.

Sin embargo, **existen varios puntos en el código donde "2026" y el torneo "Clausura" quedaron fijos o acoplados**, lo que causará comportamientos inesperados cuando se cree el torneo del año próximo si no se dejan preparados.

---

## 2. Mapa Detallado: ¿Dinámico de BD o Hardcodeado?

| Ubicación | Elemento | ¿Es Dinámico o Hardcodeado? | Detalle / Origen |
| :--- | :--- | :--- | :--- |
| **Home (`HomePage.tsx`)** | `Temporada {seasonYear}` | **Dinámico (BD)** | Se lee de `activeTourn.year` desde Supabase. Si no hay torneos, cae a `new Date().getFullYear()`. |
| **Home (`HomePage.tsx`)** | `Categoría {getCategoryYear(...)}` | **Dinámico (Fórmula)** | Se calcula dinámicamente a partir del `seasonYear` del torneo activo. |
| **Home & Divisiones** | Selección de Torneo Activo | ⚠️ **Sesgo Semi-hardcodeado** | Filtra buscando explícitamente la palabra `'clausura'` antes de evaluar `is_current`: `tourns.find(t => t.name.includes('clausura') && t.is_current)`. En 2027 (Apertura) esto generará confusión. |
| **Config Divisiones (`divisionConfig.ts`)** | Campeones y Finales (`Super Final 2026`, `Campeón Apertura 2026`) | ❌ **100% Hardcodeado** | `finalName: 'Super Final 2026'`, `aperturaCampeon: 'Quilmes'`, etc. Están fijos en código TypeScript. |
| **Campeones (`CampeonesPage.tsx`)** | Selector de Años | **Dinámico con Base** | Genera un rango desde `2026` hasta `currentYear`: `Math.max(1, currentYear - 2026 + 1)`. En 2027 mostrará automáticamente `[2027, 2026]`. |
| **Admin (`AdminDashboard.tsx`)** | Fechas ficticias de partidos | ❌ **Hardcodeado** | Se usa `2026-01-01T${matchTime}` como fecha comodín para guardar horarios de partidos. |
| **Admin (`AdminDashboard.tsx`)** | Creación de Torneo | ⚠️ **Incompleto** | El modal permite crear `Nombre` y `Año`, pero **no permite marcar `is_current = true`** ni desmarcar el torneo previo. |
| **Encuesta (`poll.ts`)** | ID y Vencimiento | ❌ **Hardcodeado** | `poll-referente-equipo-2026` y fecha de expiración fija `2026-09-20T23:59:59.000Z`. |
| **Tabla Anual (`TablaAnualPage.tsx`)** | Filtro de Año y Torneos | **Dinámico (BD)** | Agrupa y suma puntos por `tournament_id` y año. Si hay torneos 2027, permite alternar entre temporadas. |

---

## 3. Impacto en Base de Datos y Datos Existentes

### ¿Se pisan los datos de 2026 al cargar 2027?
**No, la arquitectura de base de datos está bien aislada:**
1. **Relación por UUID:** La tabla `matches` almacena `tournament_id UUID REFERENCES tournaments(id)`. Los partidos de 2026 seguirán perteneciendo al UUID del torneo 2026.
2. **Tablas de Posiciones:** El cálculo de posiciones en memoria (`calculateStandings`) se ejecuta exclusivamente sobre los partidos del `tournament_id` consultado. El nuevo torneo 2027 empezará automáticamente con tabla en cero (0 PJ, 0 PTS).
3. **Equipos y Divisiones:** Los clubes (`teams`) y las divisiones (`divisions`) son entidades independientes que se reutilizan año tras año.

---

## 4. Puntos Críticos a Corregir para 2027

### 1. Eliminar la prioridad forzada a "Clausura"
En `HomePage.tsx`, `DivisionPage.tsx` y `TablaAnualPage.tsx`, el código actual hace:
```ts
// Código actual problemático:
const activeTourn = leagueTourns.find(t => t.name.toLowerCase().includes('clausura') && t.is_current) ||
                    leagueTourns.find(t => t.is_current) || 
                    leagueTourns[0];
```
* **Riesgo:** Cuando inicie el `Apertura 2027`, si el Clausura 2026 quedó en la BD, este condicional puede priorizar el torneo viejo o requerir parches manuales.
* **Solución limpia:** Priorizar estrictamente `t.is_current === true`, ordenado por año descendente.

### 2. Generalizar `divisionConfig.ts` para Finales y Campeones Apertura
Actualmente tiene fijos los campeones del Apertura 2026 (*Quilmes*, *Once Unidos*, *Kimberley*) y el nombre `Super Final 2026`.
* **Solución:** Hacer que el nombre de la final sea dinámico: ``Super Final ${tournamentYear}`` y que los campeones de fase se guarden en la base de datos (tabla `champions` que ya existe en el proyecto) en vez de un archivo estático.

### 3. Permitir activar torneos desde el Admin
En `AdminDashboard.tsx`:
* Al crear un torneo o editarlo, añadir un toggle: `[x] Marcar como Torneo Actual`.
* Al activarlo, una simple llamada o trigger en Supabase actualiza `is_current = false` a los demás y `true` al nuevo.

### 4. Fecha de partidos en el Admin
En lugar de `2026-01-01T${matchTime}`, construir la fecha con el año del torneo activo:
```ts
const tournYear = currentTournament?.year || new Date().getFullYear();
const matchDate = `${tournYear}-01-01T${matchTime}:00-03:00`;
```

---

## 5. Conclusión
El sistema está **a un 85% preparado** para soportar el cambio de año porque la base de datos y las tablas de posiciones ya están particionadas por `tournament_id` y `year`. 

El 15% restante son dependencias de texto (como la búsqueda de "clausura" y los campeones hardcodeados en `divisionConfig.ts`) que son muy fáciles de desacoplar para que la aplicación pase de año automáticamente sin tocar código fuente.
