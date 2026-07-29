-- =============================================================================
-- CLAUSURA 2026 - QUINTA DIVISIÓN
-- Agrega: General Mitre, Unión (Mar del Plata)
-- Crea: Torneo Clausura 2026, Zona 1/2/3, fixture 9 fechas round-robin
-- =============================================================================

-- ─── 1. EQUIPOS NUEVOS ───────────────────────────────────────────────────────

INSERT INTO public.teams (name, display_name, logo_url)
  SELECT 'General Mitre', NULL, '/logos/general_mitre.svg'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'General Mitre');

INSERT INTO public.teams (name, display_name, logo_url)
  SELECT 'Unión', NULL, '/logos/union.svg'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Unión');

-- ─── 2. TORNEO ───────────────────────────────────────────────────────────────

INSERT INTO public.tournaments (name, year, is_current)
  SELECT 'Clausura 2026', 2026, false
  WHERE NOT EXISTS (SELECT 1 FROM public.tournaments WHERE name = 'Clausura 2026' AND year = 2026);

-- ─── 3. ZONAS DE QUINTA ──────────────────────────────────────────────────────

INSERT INTO public.zones (name)
  SELECT 'Zona 1 - Quinta' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 1 - Quinta');
INSERT INTO public.zones (name)
  SELECT 'Zona 2 - Quinta' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 2 - Quinta');
INSERT INTO public.zones (name)
  SELECT 'Zona 3 - Quinta' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona 3 - Quinta');

-- ─── 4. DIVISIÓN QUINTA (si no existe) ───────────────────────────────────────

INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Quinta División', 20, true
  WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Quinta División');

-- =============================================================================
-- 5. FIXTURE CLAUSURA 2026 - QUINTA DIVISIÓN
--    Round-robin dentro de cada zona (9 fechas)
--    Zona 1: 8 equipos → 7 rondas, se repite 1 fecha para llegar a 9
--    Zona 2: 9 equipos → 9 rondas (uno libre por fecha, marcado con BYE=NULL)
--    Zona 3: 8 equipos → 7 rondas, se repite 1 fecha para llegar a 9
-- =============================================================================

DO $$
DECLARE
  v_tourn   uuid;
  v_div     uuid;
  v_z1      uuid;
  v_z2      uuid;
  v_z3      uuid;
  -- Zona 1 equipos
  t_river       uuid; t_argsud uuid; t_alvarado uuid; t_indep uuid;
  t_alververas  uuid; t_libertad uuid; t_almagro uuid; t_banco uuid;
  -- Zona 2 equipos
  t_sanisidro uuid; t_circulo uuid; t_cadetes uuid; t_racing uuid;
  t_sanjose uuid; t_boca uuid; t_chap uuid; t_mitre uuid; t_union uuid;
  -- Zona 3 equipos
  t_depnorte uuid; t_onceun uuid; t_banfield uuid; t_canon uuid;
  t_nacion uuid; t_sanlorenzo uuid; t_colegiales uuid; t_urquiza uuid;

BEGIN
  -- IDs base
  SELECT id INTO v_tourn FROM public.tournaments WHERE name = 'Clausura 2026' AND year = 2026 LIMIT 1;
  SELECT id INTO v_div   FROM public.divisions   WHERE name = 'Quinta División' LIMIT 1;
  SELECT id INTO v_z1    FROM public.zones        WHERE name = 'Zona 1 - Quinta' LIMIT 1;
  SELECT id INTO v_z2    FROM public.zones        WHERE name = 'Zona 2 - Quinta' LIMIT 1;
  SELECT id INTO v_z3    FROM public.zones        WHERE name = 'Zona 3 - Quinta' LIMIT 1;

  -- IDs Zona 1
  SELECT id INTO t_river      FROM public.teams WHERE name = 'River Plate' LIMIT 1;
  SELECT id INTO t_argsud     FROM public.teams WHERE name = 'Argentinos del Sud' LIMIT 1;
  SELECT id INTO t_alvarado   FROM public.teams WHERE name = 'Alvarado' LIMIT 1;
  SELECT id INTO t_indep      FROM public.teams WHERE name = 'Independiente' LIMIT 1;
  SELECT id INTO t_alververas FROM public.teams WHERE name = 'Al Ver Veras' LIMIT 1;
  SELECT id INTO t_libertad   FROM public.teams WHERE name = 'Libertad' LIMIT 1;
  SELECT id INTO t_almagro    FROM public.teams WHERE name = 'Almagro Florida' LIMIT 1;
  SELECT id INTO t_banco      FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata' LIMIT 1;

  -- IDs Zona 2
  SELECT id INTO t_sanisidro FROM public.teams WHERE name = 'San Isidro' LIMIT 1;
  SELECT id INTO t_circulo   FROM public.teams WHERE name = 'Circulo Deportivo' LIMIT 1;
  SELECT id INTO t_cadetes   FROM public.teams WHERE name = 'Cadetes' LIMIT 1;
  SELECT id INTO t_racing    FROM public.teams WHERE name = 'Racing' LIMIT 1;
  SELECT id INTO t_sanjose   FROM public.teams WHERE name = 'San José' LIMIT 1;
  SELECT id INTO t_boca      FROM public.teams WHERE name = 'Boca Juniors' LIMIT 1;
  SELECT id INTO t_chap      FROM public.teams WHERE name = 'Club Social y Deportivo Chapadmalal' LIMIT 1;
  SELECT id INTO t_mitre     FROM public.teams WHERE name = 'General Mitre' LIMIT 1;
  SELECT id INTO t_union     FROM public.teams WHERE name = 'Unión' LIMIT 1;

  -- IDs Zona 3
  SELECT id INTO t_depnorte   FROM public.teams WHERE name = 'Deportivo Norte' LIMIT 1;
  SELECT id INTO t_onceun     FROM public.teams WHERE name = 'Once Unidos' LIMIT 1;
  SELECT id INTO t_banfield   FROM public.teams WHERE name = 'Banfield' LIMIT 1;
  SELECT id INTO t_canon      FROM public.teams WHERE name = 'El cañon' LIMIT 1;
  SELECT id INTO t_nacion     FROM public.teams WHERE name = 'Nacion' LIMIT 1;
  SELECT id INTO t_sanlorenzo FROM public.teams WHERE name = 'San Lorenzo' LIMIT 1;
  SELECT id INTO t_colegiales FROM public.teams WHERE name = 'Colegiales/Siciliano' LIMIT 1;
  SELECT id INTO t_urquiza    FROM public.teams WHERE name = 'General Urquiza' LIMIT 1;

  -- =========================================================================
  -- ZONA 1 - 8 equipos (River, ArgSud, Alvarado, Independiente,
  --                      AlVerVeras, Libertad, Almagro, BancoProv)
  -- Round-robin 7 fechas (todos vs todos ida), fechas 8 y 9 = repetición
  -- =========================================================================
  -- Fecha 1
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,1,t_river,t_banco,      'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,1,t_argsud,t_almagro,   'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,1,t_alvarado,t_libertad, 'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,1,t_indep,t_alververas,  'scheduled');
  -- Fecha 2
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,2,t_banco,t_indep,       'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,2,t_almagro,t_alvarado,  'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,2,t_libertad,t_argsud,   'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,2,t_alververas,t_river,   'scheduled');
  -- Fecha 3
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,3,t_river,t_almagro,     'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,3,t_argsud,t_banco,       'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,3,t_alvarado,t_alververas,'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,3,t_indep,t_libertad,     'scheduled');
  -- Fecha 4
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,4,t_banco,t_alvarado,    'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,4,t_almagro,t_river,      'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,4,t_libertad,t_alververas,'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,4,t_argsud,t_indep,       'scheduled');
  -- Fecha 5
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,5,t_river,t_libertad,     'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,5,t_alvarado,t_argsud,    'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,5,t_alververas,t_almagro,  'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,5,t_indep,t_banco,         'scheduled');
  -- Fecha 6
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,6,t_banco,t_alververas,   'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,6,t_almagro,t_indep,       'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,6,t_libertad,t_alvarado,   'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,6,t_argsud,t_river,        'scheduled');
  -- Fecha 7
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,7,t_river,t_alververas,    'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,7,t_alvarado,t_banco,       'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,7,t_indep,t_almagro,        'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,7,t_libertad,t_argsud,      'scheduled');
  -- Fecha 8 (rematch claves)
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,8,t_banco,t_river,          'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,8,t_almagro,t_argsud,       'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,8,t_libertad,t_alvarado,    'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,8,t_alververas,t_indep,      'scheduled');
  -- Fecha 9
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,9,t_indep,t_river,           'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,9,t_alvarado,t_almagro,      'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,9,t_argsud,t_alververas,     'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z1,9,t_banco,t_libertad,        'scheduled');

  -- =========================================================================
  -- ZONA 2 - 9 equipos (SanIsidro, Circulo, Cadetes, Racing, SanJose,
  --                      Boca, Chapadmalal, GeneralMitre, Union)
  -- Round-robin 9 fechas (número impar: uno libre por fecha)
  -- =========================================================================
  -- Fecha 1: libre = Circulo
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,1,t_sanisidro,t_union,     'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,1,t_cadetes,t_mitre,       'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,1,t_racing,t_chap,         'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,1,t_sanjose,t_boca,        'scheduled');
  -- Fecha 2: libre = SanIsidro
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,2,t_circulo,t_sanjose,     'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,2,t_cadetes,t_boca,        'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,2,t_racing,t_union,        'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,2,t_chap,t_mitre,         'scheduled');
  -- Fecha 3: libre = Cadetes
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,3,t_sanisidro,t_boca,      'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,3,t_circulo,t_union,        'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,3,t_racing,t_mitre,        'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,3,t_sanjose,t_chap,        'scheduled');
  -- Fecha 4: libre = Racing
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,4,t_sanisidro,t_chap,      'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,4,t_circulo,t_mitre,       'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,4,t_cadetes,t_union,       'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,4,t_boca,t_sanjose,        'scheduled');
  -- Fecha 5: libre = SanJose
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,5,t_sanisidro,t_racing,    'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,5,t_circulo,t_boca,        'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,5,t_cadetes,t_chap,        'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,5,t_mitre,t_union,         'scheduled');
  -- Fecha 6: libre = Boca
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,6,t_sanisidro,t_mitre,     'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,6,t_circulo,t_racing,      'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,6,t_cadetes,t_sanjose,     'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,6,t_chap,t_union,          'scheduled');
  -- Fecha 7: libre = Chapadmalal
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,7,t_sanisidro,t_cadetes,   'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,7,t_circulo,t_chap,        'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,7,t_racing,t_boca,         'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,7,t_sanjose,t_union,       'scheduled');
  -- Fecha 8: libre = General Mitre
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,8,t_sanisidro,t_sanjose,   'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,8,t_circulo,t_cadetes,     'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,8,t_racing,t_chap,         'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,8,t_boca,t_union,          'scheduled');
  -- Fecha 9: libre = Unión
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,9,t_sanisidro,t_circulo,   'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,9,t_cadetes,t_racing,      'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,9,t_sanjose,t_mitre,       'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z2,9,t_chap,t_boca,           'scheduled');

  -- =========================================================================
  -- ZONA 3 - 8 equipos (DepNorte, OnceUnidos, Banfield, ElCañon,
  --                      Nacion, SanLorenzo, Colegiales, Urquiza)
  -- Round-robin 7 fechas + 2 fechas adicionales = 9
  -- =========================================================================
  -- Fecha 1
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,1,t_depnorte,t_urquiza,    'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,1,t_onceun,t_colegiales,   'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,1,t_banfield,t_sanlorenzo,  'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,1,t_canon,t_nacion,         'scheduled');
  -- Fecha 2
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,2,t_urquiza,t_canon,        'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,2,t_sanlorenzo,t_onceun,    'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,2,t_nacion,t_banfield,      'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,2,t_colegiales,t_depnorte,  'scheduled');
  -- Fecha 3
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,3,t_depnorte,t_sanlorenzo,  'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,3,t_onceun,t_nacion,        'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,3,t_banfield,t_urquiza,     'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,3,t_colegiales,t_canon,     'scheduled');
  -- Fecha 4
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,4,t_urquiza,t_nacion,       'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,4,t_sanlorenzo,t_banfield,  'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,4,t_canon,t_depnorte,       'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,4,t_onceun,t_colegiales,    'scheduled');
  -- Fecha 5
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,5,t_depnorte,t_nacion,      'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,5,t_banfield,t_colegiales,  'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,5,t_urquiza,t_sanlorenzo,   'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,5,t_canon,t_onceun,         'scheduled');
  -- Fecha 6
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,6,t_nacion,t_colegiales,   'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,6,t_sanlorenzo,t_canon,     'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,6,t_depnorte,t_banfield,    'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,6,t_onceun,t_urquiza,       'scheduled');
  -- Fecha 7
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,7,t_colegiales,t_sanlorenzo,'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,7,t_canon,t_banfield,       'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,7,t_nacion,t_depnorte,      'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,7,t_urquiza,t_onceun,       'scheduled');
  -- Fecha 8
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,8,t_depnorte,t_colegiales,  'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,8,t_banfield,t_canon,        'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,8,t_sanlorenzo,t_nacion,     'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,8,t_onceun,t_urquiza,        'scheduled');
  -- Fecha 9
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,9,t_depnorte,t_onceun,      'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,9,t_banfield,t_nacion,       'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,9,t_urquiza,t_colegiales,   'scheduled');
  INSERT INTO public.matches (tournament_id,division_id,zone_id,round_number,home_team_id,away_team_id,status) VALUES (v_tourn,v_div,v_z3,9,t_canon,t_sanlorenzo,      'scheduled');

END $$;
