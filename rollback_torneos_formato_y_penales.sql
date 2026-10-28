-- ==============================================================================
-- Script de Rollback: Reversión de Formato de Torneo, Etapas y Penales
-- Proyecto: Resultados Liga Marplatense de Fútbol
-- Vuelve la base de datos exactamente a su estado anterior
-- ==============================================================================

-- 1. Eliminar columnas de penales y etapas de la tabla matches
ALTER TABLE public.matches DROP COLUMN IF EXISTS home_penalties;
ALTER TABLE public.matches DROP COLUMN IF EXISTS away_penalties;
ALTER TABLE public.matches DROP COLUMN IF EXISTS stage;

-- 2. Eliminar columna format de la tabla tournaments
ALTER TABLE public.tournaments DROP COLUMN IF EXISTS format;
