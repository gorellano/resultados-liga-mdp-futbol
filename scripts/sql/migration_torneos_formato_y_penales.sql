-- ==============================================================================
-- Migración: Soporte de Formato de Torneo, Etapas y Penales para Playoffs
-- Proyecto: Resultados Liga Marplatense de Fútbol
-- Retrocompatible: No altera los torneos, partidos ni tablas de posiciones existentes
-- ==============================================================================

-- 1. Agregar columna format a tournaments
ALTER TABLE public.tournaments 
  ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'liga_clasica';

-- 2. Asignar el formato de copas multinivel al Torneo Chamaco Adaro (si existe en BD)
UPDATE public.tournaments 
  SET format = 'copas_multinivel' 
  WHERE name ILIKE '%adaro%' 
     OR name ILIKE '%chamaco%';

-- 3. Agregar columnas para penales y etapas eliminatorias en matches
ALTER TABLE public.matches 
  ADD COLUMN IF NOT EXISTS home_penalties INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS away_penalties INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'regular';

-- 4. Permitir que zone_id sea NULL en partidos de Playoffs (Cuartos, Semifinal, Final)
ALTER TABLE public.matches
  ALTER COLUMN zone_id DROP NOT NULL;

-- 5. Asegurar el orden correcto de divisiones (Séptima = 1 ... Decimoséptima = 11) en la BD
UPDATE public.divisions SET sort_order = 1  WHERE name ILIKE 's_ptima%' OR name ILIKE '7%';
UPDATE public.divisions SET sort_order = 2  WHERE name ILIKE 'octava%' OR name ILIKE '8%';
UPDATE public.divisions SET sort_order = 3  WHERE name ILIKE 'novena%' OR name ILIKE '9%';
UPDATE public.divisions SET sort_order = 4  WHERE name ILIKE 'd_cima%' OR name ILIKE '10%';
UPDATE public.divisions SET sort_order = 5  WHERE name ILIKE 'und_cima%' OR name ILIKE 'decimoprimera%' OR name ILIKE '11%';
UPDATE public.divisions SET sort_order = 6  WHERE name ILIKE 'duod_cima%' OR name ILIKE 'decimosegunda%' OR name ILIKE '12%';
UPDATE public.divisions SET sort_order = 7  WHERE name ILIKE 'decimotercera%' OR name ILIKE '13%';
UPDATE public.divisions SET sort_order = 8  WHERE name ILIKE 'decimocuarta%' OR name ILIKE '14%';
UPDATE public.divisions SET sort_order = 9  WHERE name ILIKE 'decimoquinta%' OR name ILIKE '15%';
UPDATE public.divisions SET sort_order = 10 WHERE name ILIKE 'decimosexta%' OR name ILIKE '16%';
UPDATE public.divisions SET sort_order = 11 WHERE name ILIKE '%decimos_ptima%' OR name ILIKE '17%';

-- Comentarios explicativos en las columnas
COMMENT ON COLUMN public.tournaments.format IS 'Formato del torneo: liga_clasica, copas_multinivel, etc.';
COMMENT ON COLUMN public.matches.home_penalties IS 'Goles en tanda de penales del equipo local (solo eliminatorias en caso de empate)';
COMMENT ON COLUMN public.matches.away_penalties IS 'Goles en tanda de penales del equipo visitante (solo eliminatorias en caso de empate)';
COMMENT ON COLUMN public.matches.stage IS 'Etapa de disputa: regular, cuartos, semifinal, final';
