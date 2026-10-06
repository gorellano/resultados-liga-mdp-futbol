# Multi-Temporadas y Transición Dinámica (2026 → 2027) Implementation Plan

> **Goal:** Desacoplar todas las dependencias estáticas de "2026" y del torneo "Clausura", permitiendo que la creación y activación de nuevos torneos y temporadas (ej. Apertura 2027) sea 100% autónoma y transparente desde el panel de administración sin necesidad de tocar código fuente.
>
> **Architecture:**  
> 1. Unificar la lógica de resolución del torneo activo en un único helper (`getActiveTournament(tournaments)`), eliminando el sesgo histórico hacia la palabra `'clausura'`.
> 2. Agregar soporte en `db.ts` y en `AdminDashboard.tsx` para alternar el torneo activo (`is_current = true`), con actualización atómica en Supabase.
> 3. Parametrizar nombres de finales y campeones de fase en `divisionConfig.ts` y `TournamentDivisionView.tsx` para que deriven del año del torneo activo.
> 4. Dinamizar fechas comodín en la carga de resultados (`AdminDashboard.tsx`).
>
> **Tech Stack:** React 19, TypeScript, Supabase JS, Framer Motion, Vitest. Cero dependencias adicionales.

---

### Verificación de Seguridad y Compatibilidad
- **¿Impacto en Base de Datos?** **0% de riesgo de datos**. No se borran tablas ni registros; la tabla `tournaments` ya cuenta con el campo `is_current: boolean` y `year: integer`.
- **¿Retrocompatibilidad?** **100% Retrocompatible**: Toda la información de la temporada 2026 se mantiene íntegra y accesible.

---

## Tareas Paso a Paso

### Fase 1: Unificación y Limpieza de la Resolución del Torneo Activo

#### Task 1: Crear función utilitaria `getActiveTournament` en `src/lib/tournamentUtils.ts`
- **Archivos:**
  - Crear: `src/lib/tournamentUtils.ts`
  - Test: `src/test/tournamentUtils.test.ts`
- **Lógica:**
  1. Filtra torneos de liga regular (excluyendo especiales si aplica).
  2. Busca el torneo con `is_current === true`.
  3. Si hay varios o ninguno, toma el del año más reciente (`year` descendente).
  4. Elimina la condición rígida `.includes('clausura')`.

#### Task 2: Aplicar `getActiveTournament` en las páginas públicas
- **Archivos:**
  - Modificar: `src/pages/HomePage.tsx`
  - Modificar: `src/pages/DivisionPage.tsx`
  - Modificar: `src/pages/TablaAnualPage.tsx`
  - Modificar: `src/pages/TournamentDivisionView.tsx`
- **Detalle:**
  Reemplazar las 4 implementaciones duplicadas con la llamada unificada a `getActiveTournament(tourns)`.

---

### Fase 2: Gestión de Torneo Activo en el Panel de Administración

#### Task 3: Soporte de activación de torneo en `src/lib/db.ts`
- **Archivos:**
  - Modificar: `src/lib/db.ts`
- **Funcionalidad:**
  - Crear `setTournamentCurrent(tournamentId: string): Promise<boolean>`:
    1. Ejecuta `UPDATE tournaments SET is_current = false WHERE id != tournamentId`.
    2. Ejecuta `UPDATE tournaments SET is_current = true WHERE id = tournamentId`.
  - Actualizar `createTournament(name, year, isCurrent?: boolean)` para aceptar opcionalmente el flag `is_current`.

#### Task 4: UI de activación de temporada en `AdminDashboard.tsx`
- **Archivos:**
  - Modificar: `src/pages/AdminDashboard.tsx`
- **Detalle:**
  - En la pestaña *Torneos y Temporadas*:
    - Mostrar un badge interactivo: `Activo Actual` o un botón `Activar Torneo`.
    - Modal de *Nuevo Torneo*: agregar checkbox `[x] Establecer como torneo activo actual`.
  - Reemplazar la fecha fija `2026-01-01T${matchTime}` por el año del torneo seleccionado:
    `${selectedTournYear}-01-01T${matchTime}`.

---

### Fase 3: Desacoplar Campeones y Finales por División

#### Task 5: Dinamizar Finales y Campeones en `divisionConfig.ts`
- **Archivos:**
  - Modificar: `src/lib/divisionConfig.ts`
- **Detalle:**
  - Convertir `finalName` en función generadora: `getFinalName(slug: string, year: number): string` (ej: ``Super Final ${year}`` / ``Final Anual ${year}``).
  - Evitar que el nombre de la final esté fijado con el año 2026.

#### Task 6: Actualizar visualización en `TournamentDivisionView.tsx`
- **Archivos:**
  - Modificar: `src/pages/TournamentDivisionView.tsx`
- **Detalle:**
  - Reemplazar el texto fijo `Campeón Apertura 2026:` por `Campeón Apertura ${tournYear}:`.
  - Consultar campeones del torneo previo desde la base de datos o fallback configurado.

---

### Fase 4: Parámetros Auxiliares (Encuestas)

#### Task 7: Desacoplar año de vencimiento en `src/lib/poll.ts` y `AdminPollSettings.tsx`
- **Archivos:**
  - Modificar: `src/lib/poll.ts`
  - Modificar: `src/components/AdminPollSettings.tsx`
- **Detalle:**
  - Permitir que las encuestas tengan fechas de expiración dinámicas y que el ID no esté fijo a `2026`.

---

### Fase 5: Validación Integral y Pruebas

#### Task 8: Pruebas automatizadas y build
- **Comandos:**
  ```bash
  npm run test:run
  npm run build
  ```
- **Criterios de éxito:**
  1. Todos los tests pasan (incluyendo cálculos de categorías juveniles como 7ma = 2010 en 2026 y 2011 en 2027).
  2. Compilación de TypeScript y Vite limpia.
  3. Al cambiar el torneo activo en la base de datos a uno de 2027, la Home, Divisiones y Tabla Anual se actualizan instantáneamente sin necesidad de modificar código.
