-- =============================================================================
-- TORNEO CLAUSURA JOAQUÍN "CACHO" MÉNDEZ - COPA "CARLOS DE LOS REYES"
-- Migración completa: Torneo + Divisiones + Zonas para Primera, Quinta y Sexta
-- Ejecutar en: Supabase → SQL Editor
-- =============================================================================

-- ─── 1. EQUIPOS NUEVOS (si no existen) ───────────────────────────────────────

INSERT INTO public.teams (name, display_name, logo_url)
  SELECT 'General Mitre', 'Gral. Mitre', '/logos/general_mitre.svg'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'General Mitre');

INSERT INTO public.teams (name, display_name, logo_url)
  SELECT 'Unión', NULL, '/logos/union.svg'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Unión');

-- ─── 2. TORNEO ───────────────────────────────────────────────────────────────
-- Nombre oficial: Clausura Joaquín "Cacho" Méndez - Copa "Carlos de los Reyes"

INSERT INTO public.tournaments (name, year, is_current)
  SELECT 'Clausura Joaquín "Cacho" Méndez', 2026, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.tournaments
    WHERE name = 'Clausura Joaquín "Cacho" Méndez' AND year = 2026
  );

-- Nota: Si ya existe "Clausura 2026" del seed anterior, podés renombrarlo:
-- UPDATE public.tournaments
--   SET name = 'Clausura Joaquín "Cacho" Méndez'
--   WHERE name = 'Clausura 2026' AND year = 2026;

-- ─── 3. ZONAS - PRIMERA DIVISIÓN ─────────────────────────────────────────────

INSERT INTO public.zones (name)
  SELECT 'Zona 1 - Primera'
  WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 1 - Primera');

INSERT INTO public.zones (name)
  SELECT 'Zona 2 - Primera'
  WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 2 - Primera');

INSERT INTO public.zones (name)
  SELECT 'Zona 3 - Primera'
  WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 3 - Primera');

-- Zona eliminatoria Primera (para los partidos de fase KO)
INSERT INTO public.zones (name)
  SELECT 'Eliminatoria - Primera'
  WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Eliminatoria - Primera');

-- ─── 4. ZONAS - QUINTA DIVISIÓN (si no existen del seed anterior) ─────────────

INSERT INTO public.zones (name)
  SELECT 'Zona 1 - Quinta'
  WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 1 - Quinta');

INSERT INTO public.zones (name)
  SELECT 'Zona 2 - Quinta'
  WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 2 - Quinta');

INSERT INTO public.zones (name)
  SELECT 'Zona 3 - Quinta'
  WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 3 - Quinta');

INSERT INTO public.zones (name)
  SELECT 'Eliminatoria - Quinta'
  WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Eliminatoria - Quinta');

-- ─── 5. ZONAS - SEXTA DIVISIÓN ───────────────────────────────────────────────

INSERT INTO public.zones (name)
  SELECT 'Zona 1 - Sexta'
  WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 1 - Sexta');

INSERT INTO public.zones (name)
  SELECT 'Zona 2 - Sexta'
  WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 2 - Sexta');

INSERT INTO public.zones (name)
  SELECT 'Zona 3 - Sexta'
  WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 3 - Sexta');

INSERT INTO public.zones (name)
  SELECT 'Eliminatoria - Sexta'
  WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Eliminatoria - Sexta');

-- ─── 6. DIVISIONES ───────────────────────────────────────────────────────────

-- Primera División (sort_order = 0 para que aparezca primero)
INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Primera División', 0, true
  WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Primera División');

-- Quinta División
INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Quinta División', 20, true
  WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Quinta División');

-- Sexta División
INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Sexta División', 25, true
  WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Sexta División');

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────
-- Ejecutar esto para confirmar que todo quedó bien:
--
-- SELECT name, year, is_current FROM public.tournaments WHERE year = 2026;
-- SELECT name FROM public.zones WHERE name LIKE '%Primera%' OR name LIKE '%Quinta%' OR name LIKE '%Sexta%';
-- SELECT name, sort_order, is_active FROM public.divisions ORDER BY sort_order;
-- SELECT name FROM public.teams WHERE name IN ('General Mitre', 'Unión');
