-- ==============================================================================
-- SCRIPT DE ROLLBACK: REVERSIÓN TOTAL DEL TORNEO ARMANDO "CHAMACO" ADARO 2026
-- Liga Marplatense de Fútbol
-- ==============================================================================
-- Este script revierte por completo los cambios aplicados por:
--   adaro2026_completo_fixture_supabase.sql
--
-- Acciones que realiza:
--  1. Elimina todos los partidos cargados del Torneo Adaro (fase de grupos y playoffs).
--  2. Elimina el registro del Torneo Armando "Chamaco" Adaro.
--  3. Elimina las 7 zonas creadas (Zona A a Zona G), si no tienen otros partidos asociados.
--  4. Reactiva el "Torneo Clausura 2026" como torneo actual (is_current = true).
--  5. (Opcional) Elimina las columnas añadidas para soporte de formato y penales.
-- ==============================================================================

BEGIN;

-- ─── 1. ELIMINAR PARTIDOS DEL TORNEO ADARO ───────────────────────────────────
DELETE FROM public.matches 
WHERE tournament_id IN (
  SELECT id FROM public.tournaments 
  WHERE name ILIKE '%adaro%' OR name ILIKE '%chamaco%'
);

-- ─── 2. ELIMINAR EL TORNEO ADARO ─────────────────────────────────────────────
DELETE FROM public.tournaments 
WHERE name ILIKE '%adaro%' OR name ILIKE '%chamaco%';

-- ─── 3. ELIMINAR LAS 7 ZONAS ESPECÍFICAS DE ADARO (SI NO TIENEN OTROS PARTIDOS)
DELETE FROM public.zones 
WHERE name IN ('Zona A', 'Zona B', 'Zona C', 'Zona D', 'Zona E', 'Zona F', 'Zona G')
  AND id NOT IN (
    SELECT DISTINCT zone_id 
    FROM public.matches 
    WHERE zone_id IS NOT NULL
  );

-- ─── 4. REACTIVAR EL TORNEO CLAUSURA 2026 COMO ACTUAL ─────────────────────────
UPDATE public.tournaments 
SET is_current = true 
WHERE name ILIKE '%clausura%' 
  AND name NOT ILIKE '%cacho%' 
  AND year = 2026;

-- Si por alguna razón no encontró el Clausura, reactiva el torneo más reciente
UPDATE public.tournaments 
SET is_current = true 
WHERE id = (
  SELECT id FROM public.tournaments 
  ORDER BY year DESC, created_at DESC 
  LIMIT 1
)
AND NOT EXISTS (
  SELECT 1 FROM public.tournaments WHERE is_current = true
);

-- ─── 5. REVERSIÓN DE COLUMNAS DE ESQUEMA (OPCIONAL) ──────────────────────────
-- Nota: Estas columnas son 100% retrocompatibles y no molestan si quedan en la BD.
-- Si deseas removerlas por completo, descomenta las siguientes líneas:
--
-- ALTER TABLE public.matches DROP COLUMN IF EXISTS home_penalties;
-- ALTER TABLE public.matches DROP COLUMN IF EXISTS away_penalties;
-- ALTER TABLE public.matches DROP COLUMN IF EXISTS stage;
-- ALTER TABLE public.tournaments DROP COLUMN IF EXISTS format;

COMMIT;

-- Verificación del estado actual:
SELECT id, name, year, is_current, format FROM public.tournaments;
