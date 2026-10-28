-- =============================================================================
-- FECHA 1 - SEXTA DIVISIÓN
-- Torneo: Clausura Joaquín "Cacho" Méndez
-- Sábado 1 de Agosto de 2026 - Horario: 12:00 hs
-- Miércoles 5 de Agosto de 2026 - Horario: 14:00 hs (BCO.PROVINCIA vs TALLERES)
--
-- DIFERENCIAS respecto a Primera/Quinta:
--   ZONA 1: Sin Alm.Florida (no presenta). River Plate tiene LIBRE el Sábado.
--           BCO.PROVINCIA vs TALLERES juegan el Miércoles.
--   ZONA 2: Sin Unión (no presenta). Racing tiene LIBRE.
--   ZONA 3: Igual que Primera y Quinta (9 equipos, Once Unidos LIBRE)
--
-- Zona 1 (9 equipos): RIVER PLATE, ARG.DEL SUD, INDEPENDIENTE, ALVARADO,
--                     LIBERTAD, QUILMES, AL VER VERAS, TALLERES, BCO.PROVINCIA
-- Zona 2 (9 equipos): SAN JOSÉ, CÍRCULO DVO, GRAL.MITRE, BOCA JRS, RACING,
--                     SAN ISIDRO, CADETES, CHAPADMALAL, KIMBERLEY
-- Zona 3 (9 equipos): SAN LORENZO, DVO.NORTE, GRAL.URQUIZA, MAR DEL PLATA,
--                     EL CAÑÓN, COLEGIALES, BANFIELD, NACIÓN, ONCE UNIDOS
-- =============================================================================

DO $$
DECLARE
  v_tourn   uuid;
  v_div     uuid;
  v_z1      uuid;
  v_z2      uuid;
  v_z3      uuid;
  -- Zona 1 (sin Alm.Florida)
  t_river    uuid;  t_argsud    uuid;
  t_indep    uuid;  t_alvarado  uuid;
  t_libertad uuid;  t_quilmes   uuid;
  t_alver    uuid;  t_talleres  uuid;
  t_banco    uuid;
  -- Zona 2 (sin Unión)
  t_sanjose   uuid;  t_circulo  uuid;
  t_mitre     uuid;  t_boca     uuid;
  t_racing    uuid;
  t_sanisidro uuid;  t_cadetes  uuid;
  t_chap      uuid;  t_kimber   uuid;
  -- Zona 3
  t_sanlorenzo uuid;  t_depnorte uuid;
  t_urquiza    uuid;  t_mdp      uuid;
  t_canon      uuid;  t_colegia  uuid;
  t_banfield   uuid;  t_nacion   uuid;
  t_onceun     uuid;

BEGIN
  SELECT id INTO v_tourn FROM public.tournaments
    WHERE name = 'Clausura Joaquín "Cacho" Méndez' AND year = 2026 LIMIT 1;
  SELECT id INTO v_div   FROM public.divisions WHERE name = 'Sexta División' LIMIT 1;
  SELECT id INTO v_z1    FROM public.zones WHERE name = 'Zona 1 - Sexta' LIMIT 1;
  SELECT id INTO v_z2    FROM public.zones WHERE name = 'Zona 2 - Sexta' LIMIT 1;
  SELECT id INTO v_z3    FROM public.zones WHERE name = 'Zona 3 - Sexta' LIMIT 1;

  -- Zona 1
  SELECT id INTO t_river     FROM public.teams WHERE name = 'River Plate'                LIMIT 1;
  SELECT id INTO t_argsud    FROM public.teams WHERE name = 'Argentinos del Sud'         LIMIT 1;
  SELECT id INTO t_indep     FROM public.teams WHERE name = 'Independiente'              LIMIT 1;
  SELECT id INTO t_alvarado  FROM public.teams WHERE name = 'Alvarado'                   LIMIT 1;
  SELECT id INTO t_libertad  FROM public.teams WHERE name = 'Libertad'                   LIMIT 1;
  SELECT id INTO t_quilmes   FROM public.teams WHERE name = 'Quilmes'                    LIMIT 1;
  SELECT id INTO t_alver     FROM public.teams WHERE name = 'Al Ver Veras'               LIMIT 1;
  SELECT id INTO t_talleres  FROM public.teams WHERE name = 'Talleres'                   LIMIT 1;
  SELECT id INTO t_banco     FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata' LIMIT 1;

  -- Zona 2
  SELECT id INTO t_sanjose   FROM public.teams WHERE name = 'San José'                   LIMIT 1;
  SELECT id INTO t_circulo   FROM public.teams WHERE name = 'Círculo Deportivo'          LIMIT 1;
  SELECT id INTO t_mitre     FROM public.teams WHERE name = 'General Mitre'              LIMIT 1;
  SELECT id INTO t_boca      FROM public.teams WHERE name = 'Boca Juniors'               LIMIT 1;
  SELECT id INTO t_racing    FROM public.teams WHERE name = 'Racing'                     LIMIT 1;
  SELECT id INTO t_sanisidro FROM public.teams WHERE name = 'San Isidro'                 LIMIT 1;
  SELECT id INTO t_cadetes   FROM public.teams WHERE name = 'Cadetes'                    LIMIT 1;
  SELECT id INTO t_chap      FROM public.teams WHERE name = 'Chapadmalal'                LIMIT 1;
  SELECT id INTO t_kimber    FROM public.teams WHERE name = 'Kimberley'                  LIMIT 1;

  -- Zona 3
  SELECT id INTO t_sanlorenzo FROM public.teams WHERE name = 'San Lorenzo'               LIMIT 1;
  SELECT id INTO t_depnorte   FROM public.teams WHERE name = 'Deportivo Norte'           LIMIT 1;
  SELECT id INTO t_urquiza    FROM public.teams WHERE name = 'General Urquiza'           LIMIT 1;
  SELECT id INTO t_mdp        FROM public.teams WHERE name = 'Atlético Mar del Plata'    LIMIT 1;
  SELECT id INTO t_canon      FROM public.teams WHERE name = 'El Cañon'                  LIMIT 1;
  SELECT id INTO t_colegia    FROM public.teams WHERE name = 'Colegiales/Siciliano'      LIMIT 1;
  SELECT id INTO t_banfield   FROM public.teams WHERE name = 'Banfield'                  LIMIT 1;
  SELECT id INTO t_nacion     FROM public.teams WHERE name = 'Nación'                    LIMIT 1;
  SELECT id INTO t_onceun     FROM public.teams WHERE name = 'Once Unidos'               LIMIT 1;

  -- ══ FECHA 1 - ZONA 1 - SÁBADO 01/08/2026 12:00 ════════════════════════════
  -- River Plate tiene LIBRE (sin Alm.Florida en Sexta)
  -- Los 3 partidos del Sábado:
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status,match_date)
  SELECT v_tourn,v_div,v_z1,1,t_argsud,t_indep,'scheduled','2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_argsud AND away_team_id=t_indep);

  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status,match_date)
  SELECT v_tourn,v_div,v_z1,1,t_alvarado,t_libertad,'scheduled','2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_alvarado AND away_team_id=t_libertad);

  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status,match_date)
  SELECT v_tourn,v_div,v_z1,1,t_quilmes,t_alver,'scheduled','2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_quilmes AND away_team_id=t_alver);

  -- ══ FECHA 1 - ZONA 1 - MIÉRCOLES 05/08/2026 14:00 ═════════════════════════
  -- Banco Provincia vs Talleres (ambos sin partido el Sábado)
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status,match_date)
  SELECT v_tourn,v_div,v_z1,1,t_banco,t_talleres,'scheduled','2026-08-05T14:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z1 AND round_number=1 AND home_team_id=t_banco AND away_team_id=t_talleres);

  -- ══ FECHA 1 - ZONA 2 - SÁBADO 01/08/2026 12:00 ════════════════════════════
  -- Racing tiene LIBRE (sin Unión en Sexta)
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status,match_date)
  SELECT v_tourn,v_div,v_z2,1,t_sanjose,t_circulo,'scheduled','2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_sanjose AND away_team_id=t_circulo);

  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status,match_date)
  SELECT v_tourn,v_div,v_z2,1,t_mitre,t_boca,'scheduled','2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_mitre AND away_team_id=t_boca);

  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status,match_date)
  SELECT v_tourn,v_div,v_z2,1,t_sanisidro,t_cadetes,'scheduled','2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_sanisidro AND away_team_id=t_cadetes);

  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status,match_date)
  SELECT v_tourn,v_div,v_z2,1,t_chap,t_kimber,'scheduled','2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z2 AND round_number=1 AND home_team_id=t_chap AND away_team_id=t_kimber);

  -- ══ FECHA 1 - ZONA 3 - SÁBADO 01/08/2026 12:00 ════════════════════════════
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status,match_date)
  SELECT v_tourn,v_div,v_z3,1,t_sanlorenzo,t_depnorte,'scheduled','2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z3 AND round_number=1 AND home_team_id=t_sanlorenzo AND away_team_id=t_depnorte);

  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status,match_date)
  SELECT v_tourn,v_div,v_z3,1,t_urquiza,t_mdp,'scheduled','2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z3 AND round_number=1 AND home_team_id=t_urquiza AND away_team_id=t_mdp);

  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status,match_date)
  SELECT v_tourn,v_div,v_z3,1,t_canon,t_colegia,'scheduled','2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z3 AND round_number=1 AND home_team_id=t_canon AND away_team_id=t_colegia);

  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status,match_date)
  SELECT v_tourn,v_div,v_z3,1,t_banfield,t_nacion,'scheduled','2026-08-01T12:00:00-03:00'::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id=v_tourn AND division_id=v_div AND zone_id=v_z3 AND round_number=1 AND home_team_id=t_banfield AND away_team_id=t_nacion);
  -- Once Unidos LIBRE en Zona 3

END $$;

-- Verificación: esperar 12 partidos (3+1 zona1 + 4 zona2 + 4 zona3)
-- SELECT count(*) FROM public.matches m
--   JOIN public.divisions d ON d.id=m.division_id
--   WHERE d.name='Sexta División' AND m.round_number=1;
