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

-- Comentarios explicativos en las columnas
COMMENT ON COLUMN public.tournaments.format IS 'Formato del torneo: liga_clasica, copas_multinivel, etc.';
COMMENT ON COLUMN public.matches.home_penalties IS 'Goles en tanda de penales del equipo local (solo eliminatorias en caso de empate)';
COMMENT ON COLUMN public.matches.away_penalties IS 'Goles en tanda de penales del equipo visitante (solo eliminatorias en caso de empate)';
COMMENT ON COLUMN public.matches.stage IS 'Etapa de disputa: regular, cuartos, semifinal, final';
