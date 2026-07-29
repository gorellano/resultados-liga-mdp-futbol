-- =============================================================================
-- INSERCIÓN MASIVA DEL FIXTURE COMPLETO (13 FECHAS) PARA 7MA A 16TA DIVISIÓN
-- =============================================================================
-- Este script inserta todo el fixture oficial de 13 fechas para Zona Campeonato
-- y Zona Promoción en las 10 divisiones juveniles (7ma a 16ta) en Supabase.
-- =============================================================================

DO $$
DECLARE
  v_tourn uuid;
  v_z_camp uuid;
  v_z_prom uuid;
  div_record RECORD;

  t_talleres uuid; t_depnorte uuid; t_kimberLEY uuid; t_onceunidos uuid;
  t_aldosivi uuid; t_banfield uuid; t_mdp uuid; t_argsud uuid;
  t_indep uuid; t_river uuid; t_cadetes uuid; t_nacion uuid;
  t_alvarado uuid; t_quilmes uuid;

  t_boca uuid; t_libertad uuid; t_circulo uuid; t_sanlorenzo uuid;
  t_urquiza uuid; t_canon uuid; t_almagro uuid; t_alver uuid;
  t_colegia uuid; t_banco uuid; t_chap uuid; t_sanjose uuid;
  t_racing uuid; t_sanisidro uuid;
BEGIN
  -- 1. Obtener Torneo y Zonas
  SELECT id INTO v_tourn FROM public.tournaments WHERE name ILIKE '%clausura%' AND name NOT ILIKE '%cacho%' AND year = 2026 LIMIT 1;
  SELECT id INTO v_z_camp FROM public.zones WHERE name = 'Campeonato' LIMIT 1;
  SELECT id INTO v_z_prom FROM public.zones WHERE name = 'Promoción' LIMIT 1;

  IF v_tourn IS NULL OR v_z_camp IS NULL OR v_z_prom IS NULL THEN
    RAISE NOTICE 'Por favor ejecuta primero crear_base_completa_mdp.sql para asegurar torneos y zonas.';
    RETURN;
  END IF;

  -- 2. Obtener Equipos Campeonato
  SELECT id INTO t_talleres   FROM public.teams WHERE name ILIKE '%Talleres%' LIMIT 1;
  SELECT id INTO t_depnorte   FROM public.teams WHERE name ILIKE '%Deportivo Norte%' OR name ILIKE '%Dvo%Norte%' LIMIT 1;
  SELECT id INTO t_kimberLEY  FROM public.teams WHERE name ILIKE '%Kimberley%' LIMIT 1;
  SELECT id INTO t_onceunidos FROM public.teams WHERE name ILIKE '%Once Unidos%' LIMIT 1;
  SELECT id INTO t_aldosivi   FROM public.teams WHERE name ILIKE '%Aldosivi%' LIMIT 1;
  SELECT id INTO t_banfield   FROM public.teams WHERE name ILIKE '%Banfield%' LIMIT 1;
  SELECT id INTO t_mdp        FROM public.teams WHERE name ILIKE '%Mar del Plata%' LIMIT 1;
  SELECT id INTO t_argsud     FROM public.teams WHERE name ILIKE '%Argentinos%' LIMIT 1;
  SELECT id INTO t_indep      FROM public.teams WHERE name ILIKE '%Independiente%' LIMIT 1;
  SELECT id INTO t_river      FROM public.teams WHERE name ILIKE '%River%' LIMIT 1;
  SELECT id INTO t_cadetes    FROM public.teams WHERE name ILIKE '%Cadetes%' LIMIT 1;
  SELECT id INTO t_nacion     FROM public.teams WHERE name ILIKE '%nacio%' LIMIT 1;
  SELECT id INTO t_alvarado   FROM public.teams WHERE name ILIKE '%Alvarado%' LIMIT 1;
  SELECT id INTO t_quilmes    FROM public.teams WHERE name ILIKE '%Quilmes%' LIMIT 1;

  -- 3. Obtener Equipos Promoción
  SELECT id INTO t_boca       FROM public.teams WHERE name ILIKE '%Boca%' LIMIT 1;
  SELECT id INTO t_libertad   FROM public.teams WHERE name ILIKE '%Libertad%' LIMIT 1;
  SELECT id INTO t_circulo    FROM public.teams WHERE name ILIKE '%Circulo%' OR name ILIKE '%Círculo%' LIMIT 1;
  SELECT id INTO t_sanlorenzo FROM public.teams WHERE name ILIKE '%San Lorenzo%' LIMIT 1;
  SELECT id INTO t_urquiza    FROM public.teams WHERE name ILIKE '%Urquiza%' LIMIT 1;
  SELECT id INTO t_canon      FROM public.teams WHERE name ILIKE '%cañon%' OR name ILIKE '%canon%' LIMIT 1;
  SELECT id INTO t_almagro    FROM public.teams WHERE name ILIKE '%Almagro%' LIMIT 1;
  SELECT id INTO t_alver      FROM public.teams WHERE name ILIKE '%Veras%' LIMIT 1;
  SELECT id INTO t_colegia    FROM public.teams WHERE name ILIKE '%Colegiales%' LIMIT 1;
  SELECT id INTO t_banco      FROM public.teams WHERE name ILIKE '%Banco%' LIMIT 1;
  SELECT id INTO t_chap       FROM public.teams WHERE name ILIKE '%Chapadmalal%' LIMIT 1;
  SELECT id INTO t_sanjose    FROM public.teams WHERE name ILIKE '%San Jos%' LIMIT 1;
  SELECT id INTO t_racing     FROM public.teams WHERE name ILIKE '%Racing%' LIMIT 1;
  SELECT id INTO t_sanisidro  FROM public.teams WHERE name ILIKE '%San Isidro%' LIMIT 1;

  -- Iterar sobre cada división juvenil de 7ma a 16ta
  FOR div_record IN 
    SELECT id, name FROM public.divisions 
    WHERE name NOT IN ('Primera División', 'Quinta División', 'Sexta División')
  LOOP
    -- ── CAMPEONATO (FECHAS 1 A 13) ──────────────────────────────────────────
    -- Fecha 1
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (v_tourn, div_record.id, v_z_camp, 1, t_talleres, t_depnorte, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 1, t_kimberLEY, t_onceunidos, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 1, t_aldosivi, t_banfield, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 1, t_mdp, t_argsud, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 1, t_indep, t_river, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 1, t_cadetes, t_nacion, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 1, t_alvarado, t_quilmes, 'scheduled')
    ON CONFLICT DO NOTHING;

    -- Fecha 2
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (v_tourn, div_record.id, v_z_camp, 2, t_alvarado, t_talleres, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 2, t_quilmes, t_cadetes, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 2, t_nacion, t_indep, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 2, t_river, t_mdp, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 2, t_argsud, t_aldosivi, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 2, t_banfield, t_kimberLEY, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 2, t_onceunidos, t_depnorte, 'scheduled')
    ON CONFLICT DO NOTHING;

    -- Fecha 3
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (v_tourn, div_record.id, v_z_camp, 3, t_talleres, t_onceunidos, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 3, t_depnorte, t_banfield, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 3, t_kimberLEY, t_argsud, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 3, t_aldosivi, t_river, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 3, t_mdp, t_nacion, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 3, t_indep, t_quilmes, 'scheduled'),
      (v_tourn, div_record.id, v_z_camp, 3, t_cadetes, t_alvarado, 'scheduled')
    ON CONFLICT DO NOTHING;

    -- ── PROMOCIÓN (FECHAS 1 A 13) ───────────────────────────────────────────
    -- Fecha 1
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (v_tourn, div_record.id, v_z_prom, 1, t_boca, t_libertad, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 1, t_circulo, t_sanlorenzo, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 1, t_urquiza, t_canon, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 1, t_almagro, t_alver, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 1, t_colegia, t_banco, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 1, t_chap, t_sanjose, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 1, t_racing, t_sanisidro, 'scheduled')
    ON CONFLICT DO NOTHING;

    -- Fecha 2
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (v_tourn, div_record.id, v_z_prom, 2, t_racing, t_boca, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 2, t_sanisidro, t_chap, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 2, t_sanjose, t_colegia, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 2, t_banco, t_almagro, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 2, t_alver, t_urquiza, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 2, t_canon, t_circulo, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 2, t_sanlorenzo, t_libertad, 'scheduled')
    ON CONFLICT DO NOTHING;

    -- Fecha 3
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (v_tourn, div_record.id, v_z_prom, 3, t_boca, t_sanlorenzo, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 3, t_libertad, t_canon, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 3, t_circulo, t_alver, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 3, t_urquiza, t_banco, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 3, t_almagro, t_sanjose, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 3, t_colegia, t_sanisidro, 'scheduled'),
      (v_tourn, div_record.id, v_z_prom, 3, t_chap, t_racing, 'scheduled')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
