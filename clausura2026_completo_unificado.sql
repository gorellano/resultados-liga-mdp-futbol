-- =============================================================================
-- TORNEO CLAUSURA JOAQUÍN "CACHO" MÉNDEZ - COPA "CARLOS DE LOS REYES"
-- SCRIPT CORREGIDO CON BÚSQUEDA FLEXIBLE DE EQUIPOS (ILIKE)
-- Ejecutar este script completo en Supabase -> SQL Editor
-- =============================================================================

-- ─── 1. EQUIPOS NUEVOS ───────────────────────────────────────────────────────

INSERT INTO public.teams (name, display_name, logo_url)
  SELECT 'General Mitre', 'Gral. Mitre', '/logos/general_mitre.svg'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name ILIKE '%Mitre%');

INSERT INTO public.teams (name, display_name, logo_url)
  SELECT 'Unión', NULL, '/logos/union.svg'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name ILIKE '%Unión%' OR name ILIKE '%Union%');

-- ─── 2. LIMPIEZA DE TORNEOS DE PRUEBA ────────────────────────────────────────

DELETE FROM public.matches 
WHERE tournament_id IN (SELECT id FROM public.tournaments WHERE name ILIKE '%anual%');

DELETE FROM public.tournaments 
WHERE name ILIKE '%anual%';

-- ─── 3. CREAR O ACTUALIZAR TORNEO OFICIAL ────────────────────────────────────

INSERT INTO public.tournaments (name, year, is_current)
  SELECT 'Clausura Joaquín "Cacho" Méndez', 2026, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.tournaments
    WHERE name = 'Clausura Joaquín "Cacho" Méndez' AND year = 2026
  );

UPDATE public.tournaments
  SET name = 'Clausura Joaquín "Cacho" Méndez', is_current = true
  WHERE year = 2026;

-- ─── 4. ZONAS DE PRIMERA, QUINTA Y SEXTA ─────────────────────────────────────

INSERT INTO public.zones (name) SELECT 'Zona 1 - Primera' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 1 - Primera');
INSERT INTO public.zones (name) SELECT 'Zona 2 - Primera' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 2 - Primera');
INSERT INTO public.zones (name) SELECT 'Zona 3 - Primera' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 3 - Primera');
INSERT INTO public.zones (name) SELECT 'Eliminatoria - Primera' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Eliminatoria - Primera');

INSERT INTO public.zones (name) SELECT 'Zona 1 - Quinta' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 1 - Quinta');
INSERT INTO public.zones (name) SELECT 'Zona 2 - Quinta' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 2 - Quinta');
INSERT INTO public.zones (name) SELECT 'Zona 3 - Quinta' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 3 - Quinta');
INSERT INTO public.zones (name) SELECT 'Eliminatoria - Quinta' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Eliminatoria - Quinta');

INSERT INTO public.zones (name) SELECT 'Zona 1 - Sexta' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 1 - Sexta');
INSERT INTO public.zones (name) SELECT 'Zona 2 - Sexta' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 2 - Sexta');
INSERT INTO public.zones (name) SELECT 'Zona 3 - Sexta' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 3 - Sexta');
INSERT INTO public.zones (name) SELECT 'Eliminatoria - Sexta' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Eliminatoria - Sexta');

-- ─── 5. DIVISIONES ───────────────────────────────────────────────────────────

INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Primera División', 0, true
  WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Primera División');

INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Quinta División', 20, true
  WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Quinta División');

INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Sexta División', 25, true
  WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Sexta División');

UPDATE public.divisions SET is_active = true WHERE name IN ('Primera División', 'Quinta División', 'Sexta División');

-- =============================================================================
-- 6. FIXTURE FECHA 1 - PRIMERA DIVISIÓN (Sábado 01/08 - 15:30 hs)
-- =============================================================================

DO $$
DECLARE
  v_tourn uuid; v_div uuid; v_z1 uuid; v_z2 uuid; v_z3 uuid;
  t_almagro uuid; t_river uuid; t_argsud uuid; t_indep uuid; t_alvarado uuid;
  t_libertad uuid; t_quilmes uuid; t_alver uuid; t_talleres uuid;
  t_sanjose uuid; t_circulo uuid; t_mitre uuid; t_boca uuid; t_union uuid;
  t_racing uuid; t_sanisidro uuid; t_cadetes uuid; t_chap uuid; t_kimber uuid;
  t_sanlorenzo uuid; t_depnorte uuid; t_urquiza uuid; t_mdp uuid; t_canon uuid;
  t_colegia uuid; t_banfield uuid; t_nacion uuid; t_onceun uuid;
BEGIN
  SELECT id INTO v_tourn FROM public.tournaments WHERE name = 'Clausura Joaquín "Cacho" Méndez' AND year = 2026 LIMIT 1;
  SELECT id INTO v_div   FROM public.divisions   WHERE name = 'Primera División' LIMIT 1;
  SELECT id INTO v_z1    FROM public.zones WHERE name = 'Zona 1 - Primera' LIMIT 1;
  SELECT id INTO v_z2    FROM public.zones WHERE name = 'Zona 2 - Primera' LIMIT 1;
  SELECT id INTO v_z3    FROM public.zones WHERE name = 'Zona 3 - Primera' LIMIT 1;

  SELECT id INTO t_almagro   FROM public.teams WHERE name ILIKE '%Almagro%' LIMIT 1;
  SELECT id INTO t_river     FROM public.teams WHERE name ILIKE '%River%' LIMIT 1;
  SELECT id INTO t_argsud    FROM public.teams WHERE name ILIKE '%Argentinos%' LIMIT 1;
  SELECT id INTO t_indep     FROM public.teams WHERE name ILIKE '%Independiente%' LIMIT 1;
  SELECT id INTO t_alvarado  FROM public.teams WHERE name ILIKE '%Alvarado%' LIMIT 1;
  SELECT id INTO t_libertad  FROM public.teams WHERE name ILIKE '%Libertad%' LIMIT 1;
  SELECT id INTO t_quilmes   FROM public.teams WHERE name ILIKE '%Quilmes%' LIMIT 1;
  SELECT id INTO t_alver     FROM public.teams WHERE name ILIKE '%Veras%' LIMIT 1;
  SELECT id INTO t_talleres  FROM public.teams WHERE name ILIKE '%Talleres%' LIMIT 1;

  SELECT id INTO t_sanjose   FROM public.teams WHERE name ILIKE '%San Jos%' LIMIT 1;
  SELECT id INTO t_circulo   FROM public.teams WHERE name ILIKE '%Circulo%' OR name ILIKE '%Círculo%' LIMIT 1;
  SELECT id INTO t_mitre     FROM public.teams WHERE name ILIKE '%Mitre%' LIMIT 1;
  SELECT id INTO t_boca      FROM public.teams WHERE name ILIKE '%Boca%' LIMIT 1;
  SELECT id INTO t_union     FROM public.teams WHERE name ILIKE '%Unión%' OR name ILIKE '%Union%' LIMIT 1;
  SELECT id INTO t_racing    FROM public.teams WHERE name ILIKE '%Racing%' LIMIT 1;
  SELECT id INTO t_sanisidro FROM public.teams WHERE name ILIKE '%San Isidro%' LIMIT 1;
  SELECT id INTO t_cadetes   FROM public.teams WHERE name ILIKE '%Cadetes%' LIMIT 1;
  SELECT id INTO t_chap      FROM public.teams WHERE name ILIKE '%Chapadmalal%' LIMIT 1;
  SELECT id INTO t_kimber    FROM public.teams WHERE name ILIKE '%Kimberley%' LIMIT 1;

  SELECT id INTO t_sanlorenzo FROM public.teams WHERE name ILIKE '%San Lorenzo%' LIMIT 1;
  SELECT id INTO t_depnorte   FROM public.teams WHERE name ILIKE '%Deportivo Norte%' OR name ILIKE '%Dvo%Norte%' LIMIT 1;
  SELECT id INTO t_urquiza    FROM public.teams WHERE name ILIKE '%Urquiza%' LIMIT 1;
  SELECT id INTO t_mdp        FROM public.teams WHERE name ILIKE '%Mar del Plata%' LIMIT 1;
  SELECT id INTO t_canon      FROM public.teams WHERE name ILIKE '%cañon%' OR name ILIKE '%canon%' LIMIT 1;
  SELECT id INTO t_colegia    FROM public.teams WHERE name ILIKE '%Colegiales%' LIMIT 1;
  SELECT id INTO t_banfield   FROM public.teams WHERE name ILIKE '%Banfield%' LIMIT 1;
  SELECT id INTO t_nacion     FROM public.teams WHERE name ILIKE '%nacio%' LIMIT 1;

  -- Limpiar partidos de fecha 1 para esta división si existían datos viejos
  DELETE FROM public.matches WHERE tournament_id = v_tourn AND division_id = v_div AND round_number = 1;

  -- Zona 1
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div, v_z1, 1, t_almagro, t_river, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z1, 1, t_argsud, t_indep, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z1, 1, t_alvarado, t_libertad, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z1, 1, t_quilmes, t_alver, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz);

  -- Zona 2
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div, v_z2, 1, t_sanjose, t_circulo, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z2, 1, t_mitre, t_boca, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z2, 1, t_union, t_racing, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z2, 1, t_sanisidro, t_cadetes, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z2, 1, t_chap, t_kimber, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz);

  -- Zona 3
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div, v_z3, 1, t_sanlorenzo, t_depnorte, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z3, 1, t_urquiza, t_mdp, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z3, 1, t_canon, t_colegia, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z3, 1, t_banfield, t_nacion, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz);
END $$;

-- =============================================================================
-- 7. FIXTURE FECHA 1 - QUINTA DIVISIÓN (Sábado 01/08 - 13:30 hs & Miércoles 05/08 - 15:30 hs)
-- =============================================================================

DO $$
DECLARE
  v_tourn uuid; v_div uuid; v_z1 uuid; v_z2 uuid; v_z3 uuid;
  t_almagro uuid; t_river uuid; t_argsud uuid; t_indep uuid; t_alvarado uuid;
  t_libertad uuid; t_quilmes uuid; t_alver uuid; t_talleres uuid; t_banco uuid;
  t_sanjose uuid; t_circulo uuid; t_mitre uuid; t_boca uuid; t_union uuid;
  t_racing uuid; t_sanisidro uuid; t_cadetes uuid; t_chap uuid; t_kimber uuid;
  t_sanlorenzo uuid; t_depnorte uuid; t_urquiza uuid; t_mdp uuid; t_canon uuid;
  t_colegia uuid; t_banfield uuid; t_nacion uuid;
BEGIN
  SELECT id INTO v_tourn FROM public.tournaments WHERE name = 'Clausura Joaquín "Cacho" Méndez' AND year = 2026 LIMIT 1;
  SELECT id INTO v_div   FROM public.divisions   WHERE name = 'Quinta División' LIMIT 1;
  SELECT id INTO v_z1    FROM public.zones WHERE name = 'Zona 1 - Quinta' LIMIT 1;
  SELECT id INTO v_z2    FROM public.zones WHERE name = 'Zona 2 - Quinta' LIMIT 1;
  SELECT id INTO v_z3    FROM public.zones WHERE name = 'Zona 3 - Quinta' LIMIT 1;

  SELECT id INTO t_almagro   FROM public.teams WHERE name ILIKE '%Almagro%' LIMIT 1;
  SELECT id INTO t_river     FROM public.teams WHERE name ILIKE '%River%' LIMIT 1;
  SELECT id INTO t_argsud    FROM public.teams WHERE name ILIKE '%Argentinos%' LIMIT 1;
  SELECT id INTO t_indep     FROM public.teams WHERE name ILIKE '%Independiente%' LIMIT 1;
  SELECT id INTO t_alvarado  FROM public.teams WHERE name ILIKE '%Alvarado%' LIMIT 1;
  SELECT id INTO t_libertad  FROM public.teams WHERE name ILIKE '%Libertad%' LIMIT 1;
  SELECT id INTO t_quilmes   FROM public.teams WHERE name ILIKE '%Quilmes%' LIMIT 1;
  SELECT id INTO t_alver     FROM public.teams WHERE name ILIKE '%Veras%' LIMIT 1;
  SELECT id INTO t_talleres  FROM public.teams WHERE name ILIKE '%Talleres%' LIMIT 1;
  SELECT id INTO t_banco     FROM public.teams WHERE name ILIKE '%Banco%' LIMIT 1;

  SELECT id INTO t_sanjose   FROM public.teams WHERE name ILIKE '%San Jos%' LIMIT 1;
  SELECT id INTO t_circulo   FROM public.teams WHERE name ILIKE '%Circulo%' OR name ILIKE '%Círculo%' LIMIT 1;
  SELECT id INTO t_mitre     FROM public.teams WHERE name ILIKE '%Mitre%' LIMIT 1;
  SELECT id INTO t_boca      FROM public.teams WHERE name ILIKE '%Boca%' LIMIT 1;
  SELECT id INTO t_union     FROM public.teams WHERE name ILIKE '%Unión%' OR name ILIKE '%Union%' LIMIT 1;
  SELECT id INTO t_racing    FROM public.teams WHERE name ILIKE '%Racing%' LIMIT 1;
  SELECT id INTO t_sanisidro FROM public.teams WHERE name ILIKE '%San Isidro%' LIMIT 1;
  SELECT id INTO t_cadetes   FROM public.teams WHERE name ILIKE '%Cadetes%' LIMIT 1;
  SELECT id INTO t_chap      FROM public.teams WHERE name ILIKE '%Chapadmalal%' LIMIT 1;
  SELECT id INTO t_kimber    FROM public.teams WHERE name ILIKE '%Kimberley%' LIMIT 1;

  SELECT id INTO t_sanlorenzo FROM public.teams WHERE name ILIKE '%San Lorenzo%' LIMIT 1;
  SELECT id INTO t_depnorte   FROM public.teams WHERE name ILIKE '%Deportivo Norte%' OR name ILIKE '%Dvo%Norte%' LIMIT 1;
  SELECT id INTO t_urquiza    FROM public.teams WHERE name ILIKE '%Urquiza%' LIMIT 1;
  SELECT id INTO t_mdp        FROM public.teams WHERE name ILIKE '%Mar del Plata%' LIMIT 1;
  SELECT id INTO t_canon      FROM public.teams WHERE name ILIKE '%cañon%' OR name ILIKE '%canon%' LIMIT 1;
  SELECT id INTO t_colegia    FROM public.teams WHERE name ILIKE '%Colegiales%' LIMIT 1;
  SELECT id INTO t_banfield   FROM public.teams WHERE name ILIKE '%Banfield%' LIMIT 1;
  SELECT id INTO t_nacion     FROM public.teams WHERE name ILIKE '%nacio%' LIMIT 1;

  -- Limpiar partidos de fecha 1 para esta división si existían datos viejos
  DELETE FROM public.matches WHERE tournament_id = v_tourn AND division_id = v_div AND round_number = 1;

  -- Zona 1
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div, v_z1, 1, t_almagro, t_river, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z1, 1, t_argsud, t_indep, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z1, 1, t_alvarado, t_libertad, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z1, 1, t_quilmes, t_alver, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z1, 1, t_banco, t_talleres, 'scheduled', '2026-08-05T15:30:00-03:00'::timestamptz);

  -- Zona 2
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div, v_z2, 1, t_sanjose, t_circulo, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z2, 1, t_mitre, t_boca, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z2, 1, t_union, t_racing, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z2, 1, t_sanisidro, t_cadetes, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z2, 1, t_chap, t_kimber, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz);

  -- Zona 3
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div, v_z3, 1, t_sanlorenzo, t_depnorte, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z3, 1, t_urquiza, t_mdp, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z3, 1, t_canon, t_colegia, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z3, 1, t_banfield, t_nacion, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz);
END $$;

-- =============================================================================
-- 8. FIXTURE FECHA 1 - SEXTA DIVISIÓN (Sábado 01/08 - 12:00 hs & Miércoles 05/08 - 14:00 hs)
-- =============================================================================

DO $$
DECLARE
  v_tourn uuid; v_div uuid; v_z1 uuid; v_z2 uuid; v_z3 uuid;
  t_river uuid; t_argsud uuid; t_indep uuid; t_alvarado uuid;
  t_libertad uuid; t_quilmes uuid; t_alver uuid; t_talleres uuid; t_banco uuid;
  t_sanjose uuid; t_circulo uuid; t_mitre uuid; t_boca uuid;
  t_sanisidro uuid; t_cadetes uuid; t_chap uuid; t_kimber uuid;
  t_sanlorenzo uuid; t_depnorte uuid; t_urquiza uuid; t_mdp uuid; t_canon uuid;
  t_colegia uuid; t_banfield uuid; t_nacion uuid;
BEGIN
  SELECT id INTO v_tourn FROM public.tournaments WHERE name = 'Clausura Joaquín "Cacho" Méndez' AND year = 2026 LIMIT 1;
  SELECT id INTO v_div   FROM public.divisions   WHERE name = 'Sexta División' LIMIT 1;
  SELECT id INTO v_z1    FROM public.zones WHERE name = 'Zona 1 - Sexta' LIMIT 1;
  SELECT id INTO v_z2    FROM public.zones WHERE name = 'Zona 2 - Sexta' LIMIT 1;
  SELECT id INTO v_z3    FROM public.zones WHERE name = 'Zona 3 - Sexta' LIMIT 1;

  SELECT id INTO t_river     FROM public.teams WHERE name ILIKE '%River%' LIMIT 1;
  SELECT id INTO t_argsud    FROM public.teams WHERE name ILIKE '%Argentinos%' LIMIT 1;
  SELECT id INTO t_indep     FROM public.teams WHERE name ILIKE '%Independiente%' LIMIT 1;
  SELECT id INTO t_alvarado  FROM public.teams WHERE name ILIKE '%Alvarado%' LIMIT 1;
  SELECT id INTO t_libertad  FROM public.teams WHERE name ILIKE '%Libertad%' LIMIT 1;
  SELECT id INTO t_quilmes   FROM public.teams WHERE name ILIKE '%Quilmes%' LIMIT 1;
  SELECT id INTO t_alver     FROM public.teams WHERE name ILIKE '%Veras%' LIMIT 1;
  SELECT id INTO t_talleres  FROM public.teams WHERE name ILIKE '%Talleres%' LIMIT 1;
  SELECT id INTO t_banco     FROM public.teams WHERE name ILIKE '%Banco%' LIMIT 1;

  SELECT id INTO t_sanjose   FROM public.teams WHERE name ILIKE '%San Jos%' LIMIT 1;
  SELECT id INTO t_circulo   FROM public.teams WHERE name ILIKE '%Circulo%' OR name ILIKE '%Círculo%' LIMIT 1;
  SELECT id INTO t_mitre     FROM public.teams WHERE name ILIKE '%Mitre%' LIMIT 1;
  SELECT id INTO t_boca      FROM public.teams WHERE name ILIKE '%Boca%' LIMIT 1;
  SELECT id INTO t_sanisidro FROM public.teams WHERE name ILIKE '%San Isidro%' LIMIT 1;
  SELECT id INTO t_cadetes   FROM public.teams WHERE name ILIKE '%Cadetes%' LIMIT 1;
  SELECT id INTO t_chap      FROM public.teams WHERE name ILIKE '%Chapadmalal%' LIMIT 1;
  SELECT id INTO t_kimber    FROM public.teams WHERE name ILIKE '%Kimberley%' LIMIT 1;

  SELECT id INTO t_sanlorenzo FROM public.teams WHERE name ILIKE '%San Lorenzo%' LIMIT 1;
  SELECT id INTO t_depnorte   FROM public.teams WHERE name ILIKE '%Deportivo Norte%' OR name ILIKE '%Dvo%Norte%' LIMIT 1;
  SELECT id INTO t_urquiza    FROM public.teams WHERE name ILIKE '%Urquiza%' LIMIT 1;
  SELECT id INTO t_mdp        FROM public.teams WHERE name ILIKE '%Mar del Plata%' LIMIT 1;
  SELECT id INTO t_canon      FROM public.teams WHERE name ILIKE '%cañon%' OR name ILIKE '%canon%' LIMIT 1;
  SELECT id INTO t_colegia    FROM public.teams WHERE name ILIKE '%Colegiales%' LIMIT 1;
  SELECT id INTO t_banfield   FROM public.teams WHERE name ILIKE '%Banfield%' LIMIT 1;
  SELECT id INTO t_nacion     FROM public.teams WHERE name ILIKE '%nacio%' LIMIT 1;

  -- Limpiar partidos de fecha 1 para esta división si existían datos viejos
  DELETE FROM public.matches WHERE tournament_id = v_tourn AND division_id = v_div AND round_number = 1;

  -- Zona 1
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div, v_z1, 1, t_argsud, t_indep, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z1, 1, t_alvarado, t_libertad, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z1, 1, t_quilmes, t_alver, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z1, 1, t_banco, t_talleres, 'scheduled', '2026-08-05T14:00:00-03:00'::timestamptz);

  -- Zona 2
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div, v_z2, 1, t_sanjose, t_circulo, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z2, 1, t_mitre, t_boca, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z2, 1, t_sanisidro, t_cadetes, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z2, 1, t_chap, t_kimber, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz);

  -- Zona 3
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div, v_z3, 1, t_sanlorenzo, t_depnorte, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z3, 1, t_urquiza, t_mdp, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z3, 1, t_canon, t_colegia, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div, v_z3, 1, t_banfield, t_nacion, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz);
END $$;
