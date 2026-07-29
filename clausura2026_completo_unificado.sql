-- =============================================================================
-- TORNEO CLAUSURA JOAQUÍN "CACHO" MÉNDEZ - COPA "CARLOS DE LOS REYES"
-- SCRIPT COMPLETO UNIFICADO: MIGRACIÓN + FIXTURE FECHA 1 (PRIMERA, QUINTA Y SEXTA)
-- Ejecutar todo este script junto en Supabase -> SQL Editor
-- =============================================================================

-- ─── 1. EQUIPOS NUEVOS ───────────────────────────────────────────────────────

INSERT INTO public.teams (name, display_name, logo_url)
  SELECT 'General Mitre', 'Gral. Mitre', '/logos/general_mitre.svg'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'General Mitre');

INSERT INTO public.teams (name, display_name, logo_url)
  SELECT 'Unión', NULL, '/logos/union.svg'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Unión');

-- Borrar partidos y torneos de prueba ("Torneo Anual", "Anual", "Torneo Anual 2026", etc.)
DELETE FROM public.matches 
WHERE tournament_id IN (SELECT id FROM public.tournaments WHERE name ILIKE '%anual%');

DELETE FROM public.tournaments 
WHERE name ILIKE '%anual%';

-- ─── 2. TORNEO OFICIAL ───────────────────────────────────────────────────────

INSERT INTO public.tournaments (name, year, is_current)
  SELECT 'Clausura Joaquín "Cacho" Méndez', 2026, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.tournaments
    WHERE name = 'Clausura Joaquín "Cacho" Méndez' AND year = 2026
  );

-- Si existía un torneo con nombre genérico "Clausura 2026", lo actualizamos:
UPDATE public.tournaments
  SET name = 'Clausura Joaquín "Cacho" Méndez', is_current = true
  WHERE name = 'Clausura 2026' AND year = 2026;

-- ─── 3. ZONAS DE PRIMERA, QUINTA Y SEXTA ─────────────────────────────────────

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

-- ─── 4. DIVISIONES ───────────────────────────────────────────────────────────

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
-- 5. FIXTURE FECHA 1 - PRIMERA DIVISIÓN (Sábado 01/08 - 15:30 hs)
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

  SELECT id INTO t_almagro FROM public.teams WHERE name = 'Almagro Florida' LIMIT 1;
  SELECT id INTO t_river FROM public.teams WHERE name = 'River Plate' LIMIT 1;
  SELECT id INTO t_argsud FROM public.teams WHERE name = 'Argentinos del Sud' LIMIT 1;
  SELECT id INTO t_indep FROM public.teams WHERE name = 'Independiente' LIMIT 1;
  SELECT id INTO t_alvarado FROM public.teams WHERE name = 'Alvarado' LIMIT 1;
  SELECT id INTO t_libertad FROM public.teams WHERE name = 'Libertad' LIMIT 1;
  SELECT id INTO t_quilmes FROM public.teams WHERE name = 'Quilmes' LIMIT 1;
  SELECT id INTO t_alver FROM public.teams WHERE name = 'Al Ver Veras' LIMIT 1;
  SELECT id INTO t_talleres FROM public.teams WHERE name = 'Talleres' LIMIT 1;

  SELECT id INTO t_sanjose FROM public.teams WHERE name = 'San José' LIMIT 1;
  SELECT id INTO t_circulo FROM public.teams WHERE name = 'Círculo Deportivo' LIMIT 1;
  SELECT id INTO t_mitre FROM public.teams WHERE name = 'General Mitre' LIMIT 1;
  SELECT id INTO t_boca FROM public.teams WHERE name = 'Boca Juniors' LIMIT 1;
  SELECT id INTO t_union FROM public.teams WHERE name = 'Unión' LIMIT 1;
  SELECT id INTO t_racing FROM public.teams WHERE name = 'Racing' LIMIT 1;
  SELECT id INTO t_sanisidro FROM public.teams WHERE name = 'San Isidro' LIMIT 1;
  SELECT id INTO t_cadetes FROM public.teams WHERE name = 'Cadetes' LIMIT 1;
  SELECT id INTO t_chap FROM public.teams WHERE name = 'Chapadmalal' LIMIT 1;
  SELECT id INTO t_kimber FROM public.teams WHERE name = 'Kimberley' LIMIT 1;

  SELECT id INTO t_sanlorenzo FROM public.teams WHERE name = 'San Lorenzo' LIMIT 1;
  SELECT id INTO t_depnorte FROM public.teams WHERE name = 'Deportivo Norte' LIMIT 1;
  SELECT id INTO t_urquiza FROM public.teams WHERE name = 'General Urquiza' LIMIT 1;
  SELECT id INTO t_mdp FROM public.teams WHERE name = 'Atlético Mar del Plata' LIMIT 1;
  SELECT id INTO t_canon FROM public.teams WHERE name = 'El Cañon' LIMIT 1;
  SELECT id INTO t_colegia FROM public.teams WHERE name = 'Colegiales/Siciliano' LIMIT 1;
  SELECT id INTO t_banfield FROM public.teams WHERE name = 'Banfield' LIMIT 1;
  SELECT id INTO t_nacion FROM public.teams WHERE name = 'Nación' LIMIT 1;

  -- Zona 1
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z1, 1, t_almagro, t_river, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_almagro AND away_team_id=t_river);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z1, 1, t_argsud, t_indep, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_argsud AND away_team_id=t_indep);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z1, 1, t_alvarado, t_libertad, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_alvarado AND away_team_id=t_libertad);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z1, 1, t_quilmes, t_alver, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_quilmes AND away_team_id=t_alver);

  -- Zona 2
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z2, 1, t_sanjose, t_circulo, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_sanjose AND away_team_id=t_circulo);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z2, 1, t_mitre, t_boca, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_mitre AND away_team_id=t_boca);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z2, 1, t_union, t_racing, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_union AND away_team_id=t_racing);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z2, 1, t_sanisidro, t_cadetes, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_sanisidro AND away_team_id=t_cadetes);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z2, 1, t_chap, t_kimber, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_chap AND away_team_id=t_kimber);

  -- Zona 3
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z3, 1, t_sanlorenzo, t_depnorte, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z3 AND round_number=1 AND home_team_id=t_sanlorenzo AND away_team_id=t_depnorte);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z3, 1, t_urquiza, t_mdp, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z3 AND round_number=1 AND home_team_id=t_urquiza AND away_team_id=t_mdp);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z3, 1, t_canon, t_colegia, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z3 AND round_number=1 AND home_team_id=t_canon AND away_team_id=t_colegia);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z3, 1, t_banfield, t_nacion, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z3 AND round_number=1 AND home_team_id=t_banfield AND away_team_id=t_nacion);
END $$;

-- =============================================================================
-- 6. FIXTURE FECHA 1 - QUINTA DIVISIÓN (Sábado 01/08 - 13:30 hs & Miércoles 05/08 - 15:30 hs)
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

  SELECT id INTO t_almagro FROM public.teams WHERE name = 'Almagro Florida' LIMIT 1;
  SELECT id INTO t_river FROM public.teams WHERE name = 'River Plate' LIMIT 1;
  SELECT id INTO t_argsud FROM public.teams WHERE name = 'Argentinos del Sud' LIMIT 1;
  SELECT id INTO t_indep FROM public.teams WHERE name = 'Independiente' LIMIT 1;
  SELECT id INTO t_alvarado FROM public.teams WHERE name = 'Alvarado' LIMIT 1;
  SELECT id INTO t_libertad FROM public.teams WHERE name = 'Libertad' LIMIT 1;
  SELECT id INTO t_quilmes FROM public.teams WHERE name = 'Quilmes' LIMIT 1;
  SELECT id INTO t_alver FROM public.teams WHERE name = 'Al Ver Veras' LIMIT 1;
  SELECT id INTO t_talleres FROM public.teams WHERE name = 'Talleres' LIMIT 1;
  SELECT id INTO t_banco FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata' LIMIT 1;

  SELECT id INTO t_sanjose FROM public.teams WHERE name = 'San José' LIMIT 1;
  SELECT id INTO t_circulo FROM public.teams WHERE name = 'Círculo Deportivo' LIMIT 1;
  SELECT id INTO t_mitre FROM public.teams WHERE name = 'General Mitre' LIMIT 1;
  SELECT id INTO t_boca FROM public.teams WHERE name = 'Boca Juniors' LIMIT 1;
  SELECT id INTO t_union FROM public.teams WHERE name = 'Unión' LIMIT 1;
  SELECT id INTO t_racing FROM public.teams WHERE name = 'Racing' LIMIT 1;
  SELECT id INTO t_sanisidro FROM public.teams WHERE name = 'San Isidro' LIMIT 1;
  SELECT id INTO t_cadetes FROM public.teams WHERE name = 'Cadetes' LIMIT 1;
  SELECT id INTO t_chap FROM public.teams WHERE name = 'Chapadmalal' LIMIT 1;
  SELECT id INTO t_kimber FROM public.teams WHERE name = 'Kimberley' LIMIT 1;

  SELECT id INTO t_sanlorenzo FROM public.teams WHERE name = 'San Lorenzo' LIMIT 1;
  SELECT id INTO t_depnorte FROM public.teams WHERE name = 'Deportivo Norte' LIMIT 1;
  SELECT id INTO t_urquiza FROM public.teams WHERE name = 'General Urquiza' LIMIT 1;
  SELECT id INTO t_mdp FROM public.teams WHERE name = 'Atlético Mar del Plata' LIMIT 1;
  SELECT id INTO t_canon FROM public.teams WHERE name = 'El Cañon' LIMIT 1;
  SELECT id INTO t_colegia FROM public.teams WHERE name = 'Colegiales/Siciliano' LIMIT 1;
  SELECT id INTO t_banfield FROM public.teams WHERE name = 'Banfield' LIMIT 1;
  SELECT id INTO t_nacion FROM public.teams WHERE name = 'Nación' LIMIT 1;

  -- Zona 1
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z1, 1, t_almagro, t_river, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_almagro AND away_team_id=t_river);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z1, 1, t_argsud, t_indep, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_argsud AND away_team_id=t_indep);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z1, 1, t_alvarado, t_libertad, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_alvarado AND away_team_id=t_libertad);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z1, 1, t_quilmes, t_alver, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_quilmes AND away_team_id=t_alver);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z1, 1, t_banco, t_talleres, 'scheduled', '2026-08-05T15:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_banco AND away_team_id=t_talleres);

  -- Zona 2
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z2, 1, t_sanjose, t_circulo, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_sanjose AND away_team_id=t_circulo);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z2, 1, t_mitre, t_boca, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_mitre AND away_team_id=t_boca);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z2, 1, t_union, t_racing, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_union AND away_team_id=t_racing);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z2, 1, t_sanisidro, t_cadetes, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_sanisidro AND away_team_id=t_cadetes);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z2, 1, t_chap, t_kimber, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_chap AND away_team_id=t_kimber);

  -- Zona 3
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z3, 1, t_sanlorenzo, t_depnorte, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z3 AND round_number=1 AND home_team_id=t_sanlorenzo AND away_team_id=t_depnorte);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z3, 1, t_urquiza, t_mdp, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z3 AND round_number=1 AND home_team_id=t_urquiza AND away_team_id=t_mdp);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z3, 1, t_canon, t_colegia, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z3 AND round_number=1 AND home_team_id=t_canon AND away_team_id=t_colegia);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z3, 1, t_banfield, t_nacion, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z3 AND round_number=1 AND home_team_id=t_banfield AND away_team_id=t_nacion);
END $$;

-- =============================================================================
-- 7. FIXTURE FECHA 1 - SEXTA DIVISIÓN (Sábado 01/08 - 12:00 hs & Miércoles 05/08 - 14:00 hs)
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

  SELECT id INTO t_river FROM public.teams WHERE name = 'River Plate' LIMIT 1;
  SELECT id INTO t_argsud FROM public.teams WHERE name = 'Argentinos del Sud' LIMIT 1;
  SELECT id INTO t_indep FROM public.teams WHERE name = 'Independiente' LIMIT 1;
  SELECT id INTO t_alvarado FROM public.teams WHERE name = 'Alvarado' LIMIT 1;
  SELECT id INTO t_libertad FROM public.teams WHERE name = 'Libertad' LIMIT 1;
  SELECT id INTO t_quilmes FROM public.teams WHERE name = 'Quilmes' LIMIT 1;
  SELECT id INTO t_alver FROM public.teams WHERE name = 'Al Ver Veras' LIMIT 1;
  SELECT id INTO t_talleres FROM public.teams WHERE name = 'Talleres' LIMIT 1;
  SELECT id INTO t_banco FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata' LIMIT 1;

  SELECT id INTO t_sanjose FROM public.teams WHERE name = 'San José' LIMIT 1;
  SELECT id INTO t_circulo FROM public.teams WHERE name = 'Círculo Deportivo' LIMIT 1;
  SELECT id INTO t_mitre FROM public.teams WHERE name = 'General Mitre' LIMIT 1;
  SELECT id INTO t_boca FROM public.teams WHERE name = 'Boca Juniors' LIMIT 1;
  SELECT id INTO t_sanisidro FROM public.teams WHERE name = 'San Isidro' LIMIT 1;
  SELECT id INTO t_cadetes FROM public.teams WHERE name = 'Cadetes' LIMIT 1;
  SELECT id INTO t_chap FROM public.teams WHERE name = 'Chapadmalal' LIMIT 1;
  SELECT id INTO t_kimber FROM public.teams WHERE name = 'Kimberley' LIMIT 1;

  SELECT id INTO t_sanlorenzo FROM public.teams WHERE name = 'San Lorenzo' LIMIT 1;
  SELECT id INTO t_depnorte FROM public.teams WHERE name = 'Deportivo Norte' LIMIT 1;
  SELECT id INTO t_urquiza FROM public.teams WHERE name = 'General Urquiza' LIMIT 1;
  SELECT id INTO t_mdp FROM public.teams WHERE name = 'Atlético Mar del Plata' LIMIT 1;
  SELECT id INTO t_canon FROM public.teams WHERE name = 'El Cañon' LIMIT 1;
  SELECT id INTO t_colegia FROM public.teams WHERE name = 'Colegiales/Siciliano' LIMIT 1;
  SELECT id INTO t_banfield FROM public.teams WHERE name = 'Banfield' LIMIT 1;
  SELECT id INTO t_nacion FROM public.teams WHERE name = 'Nación' LIMIT 1;

  -- Zona 1
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z1, 1, t_argsud, t_indep, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_argsud AND away_team_id=t_indep);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z1, 1, t_alvarado, t_libertad, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_alvarado AND away_team_id=t_libertad);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z1, 1, t_quilmes, t_alver, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_quilmes AND away_team_id=t_alver);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z1, 1, t_banco, t_talleres, 'scheduled', '2026-08-05T14:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_banco AND away_team_id=t_talleres);

  -- Zona 2
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z2, 1, t_sanjose, t_circulo, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_sanjose AND away_team_id=t_circulo);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z2, 1, t_mitre, t_boca, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_mitre AND away_team_id=t_boca);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z2, 1, t_sanisidro, t_cadetes, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_sanisidro AND away_team_id=t_cadetes);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z2, 1, t_chap, t_kimber, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_chap AND away_team_id=t_kimber);

  -- Zona 3
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z3, 1, t_sanlorenzo, t_depnorte, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z3 AND round_number=1 AND home_team_id=t_sanlorenzo AND away_team_id=t_depnorte);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z3, 1, t_urquiza, t_mdp, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z3 AND round_number=1 AND home_team_id=t_urquiza AND away_team_id=t_mdp);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z3, 1, t_canon, t_colegia, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z3 AND round_number=1 AND home_team_id=t_canon AND away_team_id=t_colegia);

  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
  SELECT v_tourn, v_div, v_z3, 1, t_banfield, t_nacion, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z3 AND round_number=1 AND home_team_id=t_banfield AND away_team_id=t_nacion);
END $$;
