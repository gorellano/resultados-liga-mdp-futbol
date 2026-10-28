-- =============================================================================
-- CLAUSURA 2026 - QUINTA DIVISIÓN
-- Paso 1: Equipos nuevos + Torneo + Zonas (SIN fixture)
-- Ejecutar en: Supabase → SQL Editor
-- =============================================================================

-- 1. EQUIPOS NUEVOS
INSERT INTO public.teams (name, display_name, logo_url)
  SELECT 'General Mitre', 'Gral. Mitre', '/logos/general_mitre.svg'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'General Mitre');

INSERT INTO public.teams (name, display_name, logo_url)
  SELECT 'Unión', NULL, '/logos/union.svg'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Unión');

-- 2. TORNEO
INSERT INTO public.tournaments (name, year, is_current)
  SELECT 'Clausura 2026', 2026, false
  WHERE NOT EXISTS (SELECT 1 FROM public.tournaments WHERE name = 'Clausura 2026' AND year = 2026);

-- 3. ZONAS DE QUINTA
INSERT INTO public.zones (name)
  SELECT 'Zona 1 - Quinta' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 1 - Quinta');
INSERT INTO public.zones (name)
  SELECT 'Zona 2 - Quinta' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 2 - Quinta');
INSERT INTO public.zones (name)
  SELECT 'Zona 3 - Quinta' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 3 - Quinta');

-- 4. DIVISIÓN QUINTA (si no existe)
INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Quinta División', 20, true
  WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Quinta División');

-- =============================================================================
-- VERIFICACIÓN (ejecutar después para confirmar)
-- =============================================================================
-- SELECT name FROM public.teams WHERE name IN ('General Mitre', 'Unión');
-- SELECT name, year FROM public.tournaments WHERE name = 'Clausura 2026';
-- SELECT name FROM public.zones WHERE name LIKE '%Quinta%';
-- SELECT name FROM public.divisions WHERE name = 'Quinta División';
