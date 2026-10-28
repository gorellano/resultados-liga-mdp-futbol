-- =============================================================================
-- TORNEO ARMANDO "CHAMACO" ADARO 2026 - FIXTURE COMPLETO Y RESULTADOS OFICIALES
-- Liga Marplatense de Fútbol - Formato Copas Multinivel (Platino, Oro, Plata, Bronce)
-- =============================================================================
-- Script integral para ejecutar en: Supabase Dashboard -> SQL Editor
-- Incluye:
--  1. Migración de columnas de soporte (format, penales y etapas)
--  2. Torneo Adaro 2026 oficial (marcado como is_current = true)
--  3. Las 7 Zonas oficiales (Zona A a Zona G)
--  4. Las 11 Divisiones oficiales (7ma a 17ma inclusive)
--  5. Verificación de los 28 clubes
--  6. Fixture completo de 6 fechas ida y vuelta (924 partidos)
--  7. Carga de resultados oficiales ya disputados en Fecha 1
-- =============================================================================

-- ─── 1. MIGRACIÓN DE ESQUEMA (RETROCOMPATIBLE) ────────────────────────────────

ALTER TABLE public.tournaments 
  ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'liga_clasica';

ALTER TABLE public.matches 
  ADD COLUMN IF NOT EXISTS home_penalties INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS away_penalties INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'regular';

-- ─── 2. TORNEO ARMANDO "CHAMACO" ADARO 2026 ──────────────────────────────────

-- Desactivar bandera is_current de torneos anteriores para que Adaro sea el actual
UPDATE public.tournaments SET is_current = false WHERE is_current = true;

-- Insertar o actualizar Torneo Adaro
INSERT INTO public.tournaments (name, year, is_current, format)
  SELECT 'Torneo Armando "Chamaco" Adaro', 2026, true, 'copas_multinivel'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.tournaments 
    WHERE name ILIKE '%adaro%' OR name ILIKE '%chamaco%'
  );

UPDATE public.tournaments
  SET is_current = true, format = 'copas_multinivel'
  WHERE name ILIKE '%adaro%' OR name ILIKE '%chamaco%';

-- ─── 3. LAS 7 ZONAS OFICIALES ─────────────────────────────────────────────────

INSERT INTO public.zones (name) SELECT 'Zona A' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona A');
INSERT INTO public.zones (name) SELECT 'Zona B' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona B');
INSERT INTO public.zones (name) SELECT 'Zona C' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona C');
INSERT INTO public.zones (name) SELECT 'Zona D' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona D');
INSERT INTO public.zones (name) SELECT 'Zona E' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona E');
INSERT INTO public.zones (name) SELECT 'Zona F' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona F');
INSERT INTO public.zones (name) SELECT 'Zona G' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona G');

-- ─── 4. LAS 11 DIVISIONES (7ma a 17ma inclusive) ──────────────────────────────

INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Séptima División', 1, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.divisions 
    WHERE name ILIKE '%Séptima División%' OR name ILIKE '%7ma%'
  );
INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Octava División', 2, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.divisions 
    WHERE name ILIKE '%Octava División%' OR name ILIKE '%8va%'
  );
INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Novena División', 3, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.divisions 
    WHERE name ILIKE '%Novena División%' OR name ILIKE '%9na%'
  );
INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Décima División', 4, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.divisions 
    WHERE name ILIKE '%Décima División%' OR name ILIKE '%10ma%'
  );
INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Undécima División', 5, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.divisions 
    WHERE name ILIKE '%Undécima División%' OR name ILIKE '%11ma%'
  );
INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Duodécima División', 6, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.divisions 
    WHERE name ILIKE '%Duodécima División%' OR name ILIKE '%12ma%'
  );
INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Decimotercera División', 7, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.divisions 
    WHERE name ILIKE '%Decimotercera División%' OR name ILIKE '%13ra%'
  );
INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Decimocuarta División', 8, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.divisions 
    WHERE name ILIKE '%Decimocuarta División%' OR name ILIKE '%14ta%'
  );
INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Decimoquinta División', 9, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.divisions 
    WHERE name ILIKE '%Decimoquinta División%' OR name ILIKE '%15ta%'
  );
INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Decimosexta División', 10, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.divisions 
    WHERE name ILIKE '%Decimosexta División%' OR name ILIKE '%16ta%'
  );
INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT 'Decimoséptima División', 11, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.divisions 
    WHERE name ILIKE '%Decimoséptima División%' OR name ILIKE '%17ma%'
  );

-- Asegurar que todas las 11 divisiones estén activas
UPDATE public.divisions 
  SET is_active = true 
  WHERE name ILIKE '%séptima%' OR name ILIKE '%octava%' OR name ILIKE '%novena%' 
     OR name ILIKE '%décima%' OR name ILIKE '%undécima%' OR name ILIKE '%duodécima%' 
     OR name ILIKE '%decimotercera%' OR name ILIKE '%decimocuarta%' 
     OR name ILIKE '%decimoquinta%' OR name ILIKE '%decimosexta%' 
     OR name ILIKE '%decimoséptima%' OR name ILIKE '%17ma%';

-- ─── 5. VERIFICACIÓN / ALTA DE LOS 28 CLUBES ──────────────────────────────────
INSERT INTO public.teams (name, logo_url)
  SELECT 'Aldosivi', '/logos/aldosivi.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Aldosivi' OR name ILIKE '%Aldosivi%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Argentinos del Sud', '/logos/argentinos_del_sud.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Argentinos del Sud' OR name ILIKE '%Argentinos%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Libertad', '/logos/libertad.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Libertad' OR name ILIKE '%Libertad%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'San Lorenzo', '/logos/san_lorenzo.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'San Lorenzo' OR name ILIKE '%San Lorenzo%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Kimberley', '/logos/kimberley.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Kimberley' OR name ILIKE '%Kimberley%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Talleres', '/logos/talleres.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Talleres' OR name ILIKE 'Talleres%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Boca Juniors', '/logos/boca_juniors.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Boca Juniors' OR name ILIKE '%Boca%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Chapadmalal', '/logos/chapadmalal.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Chapadmalal' OR name ILIKE '%Chapadmalal%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'San Isidro', '/logos/san_isidro.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'San Isidro' OR name ILIKE '%San Isidro%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Alvarado', '/logos/alvarado.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Alvarado' OR name ILIKE '%Alvarado%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Atlético Mar del Plata', '/logos/atletico_mar_del_plata.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Atlético Mar del Plata' OR ((name ILIKE '%Atlético Mar del Plata%' OR name ILIKE '%Atletico Mar del Plata%' OR name ILIKE '%Mar del Plata%') AND name NOT ILIKE '%Talleres%' AND name NOT ILIKE '%Banco%'));
INSERT INTO public.teams (name, logo_url)
  SELECT 'Al Ver Veras', '/logos/al_ver_veras.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Al Ver Veras' OR name ILIKE '%Veras%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Quilmes', '/logos/quilmes.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Quilmes' OR name ILIKE '%Quilmes%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Independiente', '/logos/independiente.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Independiente' OR name ILIKE '%Independiente%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'El cañon', '/logos/el_canon.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'El cañon' OR name ILIKE '%cañon%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Racing', '/logos/racing.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Racing' OR name ILIKE '%Racing%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Nacion', '/logos/nacion.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Nacion' OR name ILIKE '%nacio%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Deportivo Norte', '/logos/deportivo_norte.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Deportivo Norte' OR name ILIKE '%Deportivo Norte%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Almagro', '/logos/almagro_florida.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Almagro' OR name ILIKE '%Almagro%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Circulo', '/logos/circulo_deportivo.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Circulo' OR name ILIKE '%Circulo%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'River Plate', '/logos/river_plate.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'River Plate' OR name ILIKE '%River%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Colegiales', '/logos/colegiales_el_siciliano.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Colegiales' OR name ILIKE '%Colegiales%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'San José', '/logos/san_jose.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'San José' OR name ILIKE '%San Jos%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Cadetes', '/logos/cadetes.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Cadetes' OR name ILIKE '%Cadetes%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Banfield', '/logos/banfield.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Banfield' OR name ILIKE '%Banfield%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Once Unidos', '/logos/once_unidos.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Once Unidos' OR name ILIKE '%Once Unidos%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'General Urquiza', '/logos/general_urquiza.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'General Urquiza' OR name ILIKE '%Urquiza%');
INSERT INTO public.teams (name, logo_url)
  SELECT 'Banco Provincia', '/logos/banco_provincia.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Banco Provincia' OR name ILIKE '%Banco Provincia%' OR name ILIKE '%Banco%');

-- ─── 6. FIXTURE COMPLETO (6 FECHAS x 7 ZONAS x 11 DIVISIONES) ─────────────────

DO $$
DECLARE
  v_tourn uuid;
  v_za uuid; v_zb uuid; v_zc uuid; v_zd uuid; v_ze uuid; v_zf uuid; v_zg uuid;
  
  -- 11 divisiones
  v_d7 uuid; v_d8 uuid; v_d9 uuid; v_d10 uuid; v_d11 uuid; v_d12 uuid;
  v_d13 uuid; v_d14 uuid; v_d15 uuid; v_d16 uuid; v_d17 uuid;

  -- 28 equipos
  t_aldosivi uuid;
  t_argsud uuid;
  t_libertad uuid;
  t_sanlorenzo uuid;
  t_kimberley uuid;
  t_talleres uuid;
  t_boca uuid;
  t_chap uuid;
  t_sanisidro uuid;
  t_alvarado uuid;
  t_mdp uuid;
  t_alver uuid;
  t_quilmes uuid;
  t_indep uuid;
  t_canon uuid;
  t_racing uuid;
  t_nacion uuid;
  t_depnorte uuid;
  t_almagro uuid;
  t_circulo uuid;
  t_river uuid;
  t_colegia uuid;
  t_sanjose uuid;
  t_cadetes uuid;
  t_banfield uuid;
  t_onceunidos uuid;
  t_urquiza uuid;
  t_banco uuid;
BEGIN
  -- Obtener ID del Torneo
  SELECT id INTO v_tourn FROM public.tournaments WHERE name ILIKE '%adaro%' OR name ILIKE '%chamaco%' LIMIT 1;

  -- Obtener IDs de las 7 Zonas
  SELECT id INTO v_za FROM public.zones WHERE name = 'Zona A' LIMIT 1;
  SELECT id INTO v_zb FROM public.zones WHERE name = 'Zona B' LIMIT 1;
  SELECT id INTO v_zc FROM public.zones WHERE name = 'Zona C' LIMIT 1;
  SELECT id INTO v_zd FROM public.zones WHERE name = 'Zona D' LIMIT 1;
  SELECT id INTO v_ze FROM public.zones WHERE name = 'Zona E' LIMIT 1;
  SELECT id INTO v_zf FROM public.zones WHERE name = 'Zona F' LIMIT 1;
  SELECT id INTO v_zg FROM public.zones WHERE name = 'Zona G' LIMIT 1;

  -- Obtener IDs de las 11 Divisiones (con coincidencia exacta primero para evitar colisiones)
  SELECT id INTO v_d7  FROM public.divisions WHERE name = 'Séptima División' OR ((name ILIKE '%séptima%' OR name ILIKE '%septima%' OR name ILIKE '%7ma%') AND name NOT ILIKE '%decimo%') LIMIT 1;
  SELECT id INTO v_d8  FROM public.divisions WHERE name = 'Octava División' OR name ILIKE '%octava%' OR name ILIKE '%8va%' LIMIT 1;
  SELECT id INTO v_d9  FROM public.divisions WHERE name = 'Novena División' OR name ILIKE '%novena%' OR name ILIKE '%9na%' LIMIT 1;
  SELECT id INTO v_d10 FROM public.divisions WHERE name = 'Décima División' OR ((name ILIKE '%décima%' OR name ILIKE '%decima%' OR name ILIKE '%10ma%') AND name NOT ILIKE '%un%' AND name NOT ILIKE '%duo%' AND name NOT ILIKE '%ter%' AND name NOT ILIKE '%cuar%' AND name NOT ILIKE '%quin%' AND name NOT ILIKE '%sex%' AND name NOT ILIKE '%sep%') LIMIT 1;
  SELECT id INTO v_d11 FROM public.divisions WHERE name = 'Undécima División' OR name ILIKE '%undécima%' OR name ILIKE '%undecima%' OR name ILIKE '%11ma%' LIMIT 1;
  SELECT id INTO v_d12 FROM public.divisions WHERE name = 'Duodécima División' OR name ILIKE '%duodécima%' OR name ILIKE '%duodecima%' OR name ILIKE '%12ma%' LIMIT 1;
  SELECT id INTO v_d13 FROM public.divisions WHERE name = 'Decimotercera División' OR name ILIKE '%decimotercera%' OR name ILIKE '%13ra%' LIMIT 1;
  SELECT id INTO v_d14 FROM public.divisions WHERE name = 'Decimocuarta División' OR name ILIKE '%decimocuarta%' OR name ILIKE '%14ta%' LIMIT 1;
  SELECT id INTO v_d15 FROM public.divisions WHERE name = 'Decimoquinta División' OR name ILIKE '%decimoquinta%' OR name ILIKE '%15ta%' LIMIT 1;
  SELECT id INTO v_d16 FROM public.divisions WHERE name = 'Decimosexta División' OR name ILIKE '%decimosexta%' OR name ILIKE '%16ta%' LIMIT 1;
  SELECT id INTO v_d17 FROM public.divisions WHERE name = 'Decimoséptima División' OR name ILIKE '%decimoséptima%' OR name ILIKE '%decimoseptima%' OR name ILIKE '%17ma%' LIMIT 1;

  -- Obtener IDs de los 28 Equipos
  SELECT id INTO t_aldosivi FROM public.teams WHERE name = 'Aldosivi' OR name ILIKE '%Aldosivi%' LIMIT 1;
  SELECT id INTO t_argsud FROM public.teams WHERE name = 'Argentinos del Sud' OR name ILIKE '%Argentinos%' LIMIT 1;
  SELECT id INTO t_libertad FROM public.teams WHERE name = 'Libertad' OR name ILIKE '%Libertad%' LIMIT 1;
  SELECT id INTO t_sanlorenzo FROM public.teams WHERE name = 'San Lorenzo' OR name ILIKE '%San Lorenzo%' LIMIT 1;
  SELECT id INTO t_kimberley FROM public.teams WHERE name = 'Kimberley' OR name ILIKE '%Kimberley%' LIMIT 1;
  SELECT id INTO t_talleres FROM public.teams WHERE name = 'Talleres' OR name ILIKE 'Talleres%' LIMIT 1;
  SELECT id INTO t_boca FROM public.teams WHERE name = 'Boca Juniors' OR name ILIKE '%Boca%' LIMIT 1;
  SELECT id INTO t_chap FROM public.teams WHERE name = 'Chapadmalal' OR name ILIKE '%Chapadmalal%' LIMIT 1;
  SELECT id INTO t_sanisidro FROM public.teams WHERE name = 'San Isidro' OR name ILIKE '%San Isidro%' LIMIT 1;
  SELECT id INTO t_alvarado FROM public.teams WHERE name = 'Alvarado' OR name ILIKE '%Alvarado%' LIMIT 1;
  SELECT id INTO t_mdp FROM public.teams WHERE name = 'Atlético Mar del Plata' OR ((name ILIKE '%Atlético Mar del Plata%' OR name ILIKE '%Atletico Mar del Plata%' OR name ILIKE '%Mar del Plata%') AND name NOT ILIKE '%Talleres%' AND name NOT ILIKE '%Banco%') LIMIT 1;
  SELECT id INTO t_alver FROM public.teams WHERE name = 'Al Ver Veras' OR name ILIKE '%Veras%' LIMIT 1;
  SELECT id INTO t_quilmes FROM public.teams WHERE name = 'Quilmes' OR name ILIKE '%Quilmes%' LIMIT 1;
  SELECT id INTO t_indep FROM public.teams WHERE name = 'Independiente' OR name ILIKE '%Independiente%' LIMIT 1;
  SELECT id INTO t_canon FROM public.teams WHERE name = 'El cañon' OR name ILIKE '%cañon%' LIMIT 1;
  SELECT id INTO t_racing FROM public.teams WHERE name = 'Racing' OR name ILIKE '%Racing%' LIMIT 1;
  SELECT id INTO t_nacion FROM public.teams WHERE name = 'Nacion' OR name ILIKE '%nacio%' LIMIT 1;
  SELECT id INTO t_depnorte FROM public.teams WHERE name = 'Deportivo Norte' OR name ILIKE '%Deportivo Norte%' LIMIT 1;
  SELECT id INTO t_almagro FROM public.teams WHERE name = 'Almagro' OR name ILIKE '%Almagro%' LIMIT 1;
  SELECT id INTO t_circulo FROM public.teams WHERE name = 'Circulo' OR name ILIKE '%Circulo%' LIMIT 1;
  SELECT id INTO t_river FROM public.teams WHERE name = 'River Plate' OR name ILIKE '%River%' LIMIT 1;
  SELECT id INTO t_colegia FROM public.teams WHERE name = 'Colegiales' OR name ILIKE '%Colegiales%' LIMIT 1;
  SELECT id INTO t_sanjose FROM public.teams WHERE name = 'San José' OR name ILIKE '%San Jos%' LIMIT 1;
  SELECT id INTO t_cadetes FROM public.teams WHERE name = 'Cadetes' OR name ILIKE '%Cadetes%' LIMIT 1;
  SELECT id INTO t_banfield FROM public.teams WHERE name = 'Banfield' OR name ILIKE '%Banfield%' LIMIT 1;
  SELECT id INTO t_onceunidos FROM public.teams WHERE name = 'Once Unidos' OR name ILIKE '%Once Unidos%' LIMIT 1;
  SELECT id INTO t_urquiza FROM public.teams WHERE name = 'General Urquiza' OR name ILIKE '%Urquiza%' LIMIT 1;
  SELECT id INTO t_banco FROM public.teams WHERE name = 'Banco Provincia' OR name ILIKE '%Banco Provincia%' OR name ILIKE '%Banco%' LIMIT 1;

  -- Limpiar partidos previos de este torneo para evitar duplicaciones
  DELETE FROM public.matches WHERE tournament_id = v_tourn;

  -- ── INSERCIÓN DE PARTIDOS ──

  -- Zona A - Fecha 1: Libertad vs Argentinos del Sud
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_za, 1, t_libertad, t_argsud, 0, 2, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_za, 1, t_libertad, t_argsud, 1, 2, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_za, 1, t_libertad, t_argsud, 0, 4, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_za, 1, t_libertad, t_argsud, 0, 5, 'finished', '2026-10-17T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_za, 1, t_libertad, t_argsud, 0, 2, 'finished', '2026-10-17T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_za, 1, t_libertad, t_argsud, 0, 6, 'finished', '2026-10-17T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_za, 1, t_libertad, t_argsud, 0, 3, 'finished', '2026-10-17T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_za, 1, t_libertad, t_argsud, 1, 5, 'finished', '2026-10-17T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_za, 1, t_libertad, t_argsud, 1, 4, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_za, 1, t_libertad, t_argsud, 0, 4, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_za, 1, t_libertad, t_argsud, 0, 3, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona A - Fecha 1: San Lorenzo vs Aldosivi
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_za, 1, t_sanlorenzo, t_aldosivi, 0, 8, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_za, 1, t_sanlorenzo, t_aldosivi, 0, 3, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_za, 1, t_sanlorenzo, t_aldosivi, 0, 2, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_za, 1, t_sanlorenzo, t_aldosivi, 0, 2, 'finished', '2026-10-17T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_za, 1, t_sanlorenzo, t_aldosivi, 1, 2, 'finished', '2026-10-17T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_za, 1, t_sanlorenzo, t_aldosivi, 0, 2, 'finished', '2026-10-17T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_za, 1, t_sanlorenzo, t_aldosivi, 0, 4, 'finished', '2026-10-17T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_za, 1, t_sanlorenzo, t_aldosivi, 0, 8, 'finished', '2026-10-17T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_za, 1, t_sanlorenzo, t_aldosivi, 0, 4, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_za, 1, t_sanlorenzo, t_aldosivi, 1, 4, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_za, 1, t_sanlorenzo, t_aldosivi, 1, 0, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona A - Fecha 2: Aldosivi vs Libertad
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_za, 2, t_aldosivi, t_libertad, NULL, NULL, 'scheduled', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_za, 2, t_aldosivi, t_libertad, NULL, NULL, 'scheduled', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_za, 2, t_aldosivi, t_libertad, NULL, NULL, 'scheduled', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_za, 2, t_aldosivi, t_libertad, 9, 0, 'finished', '2026-10-25T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_za, 2, t_aldosivi, t_libertad, 9, 1, 'finished', '2026-10-25T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_za, 2, t_aldosivi, t_libertad, 9, 0, 'finished', '2026-10-25T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_za, 2, t_aldosivi, t_libertad, 7, 1, 'finished', '2026-10-25T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_za, 2, t_aldosivi, t_libertad, 8, 0, 'finished', '2026-10-25T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_za, 2, t_aldosivi, t_libertad, 6, 0, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_za, 2, t_aldosivi, t_libertad, 12, 0, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_za, 2, t_aldosivi, t_libertad, 11, 0, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona A - Fecha 2: Argentinos del Sud vs San Lorenzo
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_za, 2, t_argsud, t_sanlorenzo, 1, 1, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_za, 2, t_argsud, t_sanlorenzo, 4, 1, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_za, 2, t_argsud, t_sanlorenzo, 0, 1, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_za, 2, t_argsud, t_sanlorenzo, 0, 1, 'finished', '2026-10-25T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_za, 2, t_argsud, t_sanlorenzo, 0, 1, 'finished', '2026-10-25T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_za, 2, t_argsud, t_sanlorenzo, 2, 1, 'finished', '2026-10-25T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_za, 2, t_argsud, t_sanlorenzo, 1, 0, 'finished', '2026-10-25T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_za, 2, t_argsud, t_sanlorenzo, 5, 0, 'finished', '2026-10-25T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_za, 2, t_argsud, t_sanlorenzo, 2, 0, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_za, 2, t_argsud, t_sanlorenzo, 0, 0, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_za, 2, t_argsud, t_sanlorenzo, 2, 3, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona A - Fecha 3: Libertad vs San Lorenzo
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_za, 3, t_libertad, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_za, 3, t_libertad, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_za, 3, t_libertad, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_za, 3, t_libertad, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-01T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_za, 3, t_libertad, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-01T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_za, 3, t_libertad, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-01T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_za, 3, t_libertad, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-01T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_za, 3, t_libertad, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-01T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_za, 3, t_libertad, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_za, 3, t_libertad, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_za, 3, t_libertad, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona A - Fecha 3: Aldosivi vs Argentinos del Sud
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_za, 3, t_aldosivi, t_argsud, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_za, 3, t_aldosivi, t_argsud, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_za, 3, t_aldosivi, t_argsud, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_za, 3, t_aldosivi, t_argsud, NULL, NULL, 'scheduled', '2026-11-01T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_za, 3, t_aldosivi, t_argsud, NULL, NULL, 'scheduled', '2026-11-01T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_za, 3, t_aldosivi, t_argsud, NULL, NULL, 'scheduled', '2026-11-01T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_za, 3, t_aldosivi, t_argsud, NULL, NULL, 'scheduled', '2026-11-01T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_za, 3, t_aldosivi, t_argsud, NULL, NULL, 'scheduled', '2026-11-01T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_za, 3, t_aldosivi, t_argsud, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_za, 3, t_aldosivi, t_argsud, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_za, 3, t_aldosivi, t_argsud, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona A - Fecha 4: Argentinos del Sud vs Libertad
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_za, 4, t_argsud, t_libertad, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_za, 4, t_argsud, t_libertad, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_za, 4, t_argsud, t_libertad, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_za, 4, t_argsud, t_libertad, NULL, NULL, 'scheduled', '2026-11-08T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_za, 4, t_argsud, t_libertad, NULL, NULL, 'scheduled', '2026-11-08T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_za, 4, t_argsud, t_libertad, NULL, NULL, 'scheduled', '2026-11-08T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_za, 4, t_argsud, t_libertad, NULL, NULL, 'scheduled', '2026-11-08T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_za, 4, t_argsud, t_libertad, NULL, NULL, 'scheduled', '2026-11-08T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_za, 4, t_argsud, t_libertad, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_za, 4, t_argsud, t_libertad, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_za, 4, t_argsud, t_libertad, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona A - Fecha 4: Aldosivi vs San Lorenzo
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_za, 4, t_aldosivi, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_za, 4, t_aldosivi, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_za, 4, t_aldosivi, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_za, 4, t_aldosivi, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-08T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_za, 4, t_aldosivi, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-08T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_za, 4, t_aldosivi, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-08T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_za, 4, t_aldosivi, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-08T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_za, 4, t_aldosivi, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-08T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_za, 4, t_aldosivi, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_za, 4, t_aldosivi, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_za, 4, t_aldosivi, t_sanlorenzo, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona A - Fecha 5: Libertad vs Aldosivi
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_za, 5, t_libertad, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_za, 5, t_libertad, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_za, 5, t_libertad, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_za, 5, t_libertad, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-15T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_za, 5, t_libertad, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-15T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_za, 5, t_libertad, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-15T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_za, 5, t_libertad, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-15T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_za, 5, t_libertad, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-15T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_za, 5, t_libertad, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_za, 5, t_libertad, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_za, 5, t_libertad, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona A - Fecha 5: San Lorenzo vs Argentinos del Sud
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_za, 5, t_sanlorenzo, t_argsud, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_za, 5, t_sanlorenzo, t_argsud, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_za, 5, t_sanlorenzo, t_argsud, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_za, 5, t_sanlorenzo, t_argsud, NULL, NULL, 'scheduled', '2026-11-15T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_za, 5, t_sanlorenzo, t_argsud, NULL, NULL, 'scheduled', '2026-11-15T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_za, 5, t_sanlorenzo, t_argsud, NULL, NULL, 'scheduled', '2026-11-15T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_za, 5, t_sanlorenzo, t_argsud, NULL, NULL, 'scheduled', '2026-11-15T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_za, 5, t_sanlorenzo, t_argsud, NULL, NULL, 'scheduled', '2026-11-15T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_za, 5, t_sanlorenzo, t_argsud, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_za, 5, t_sanlorenzo, t_argsud, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_za, 5, t_sanlorenzo, t_argsud, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona A - Fecha 6: San Lorenzo vs Libertad
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_za, 6, t_sanlorenzo, t_libertad, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_za, 6, t_sanlorenzo, t_libertad, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_za, 6, t_sanlorenzo, t_libertad, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_za, 6, t_sanlorenzo, t_libertad, NULL, NULL, 'scheduled', '2026-11-22T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_za, 6, t_sanlorenzo, t_libertad, NULL, NULL, 'scheduled', '2026-11-22T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_za, 6, t_sanlorenzo, t_libertad, NULL, NULL, 'scheduled', '2026-11-22T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_za, 6, t_sanlorenzo, t_libertad, NULL, NULL, 'scheduled', '2026-11-22T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_za, 6, t_sanlorenzo, t_libertad, NULL, NULL, 'scheduled', '2026-11-22T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_za, 6, t_sanlorenzo, t_libertad, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_za, 6, t_sanlorenzo, t_libertad, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_za, 6, t_sanlorenzo, t_libertad, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona A - Fecha 6: Argentinos del Sud vs Aldosivi
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_za, 6, t_argsud, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_za, 6, t_argsud, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_za, 6, t_argsud, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_za, 6, t_argsud, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-22T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_za, 6, t_argsud, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-22T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_za, 6, t_argsud, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-22T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_za, 6, t_argsud, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-22T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_za, 6, t_argsud, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-22T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_za, 6, t_argsud, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_za, 6, t_argsud, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_za, 6, t_argsud, t_aldosivi, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona B - Fecha 1: Chapadmalal vs Kimberley
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zb, 1, t_chap, t_kimberley, 1, 3, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zb, 1, t_chap, t_kimberley, 0, 5, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zb, 1, t_chap, t_kimberley, 0, 7, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zb, 1, t_chap, t_kimberley, 1, 2, 'finished', '2026-10-17T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zb, 1, t_chap, t_kimberley, 0, 6, 'finished', '2026-10-17T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zb, 1, t_chap, t_kimberley, 0, 7, 'finished', '2026-10-17T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zb, 1, t_chap, t_kimberley, 1, 4, 'finished', '2026-10-17T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zb, 1, t_chap, t_kimberley, 1, 2, 'finished', '2026-10-17T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zb, 1, t_chap, t_kimberley, 1, 7, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zb, 1, t_chap, t_kimberley, 0, 7, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zb, 1, t_chap, t_kimberley, 0, 1, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona B - Fecha 1: Boca Juniors vs Talleres
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zb, 1, t_boca, t_talleres, 1, 2, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zb, 1, t_boca, t_talleres, 1, 3, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zb, 1, t_boca, t_talleres, 0, 2, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zb, 1, t_boca, t_talleres, 0, 4, 'finished', '2026-10-17T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zb, 1, t_boca, t_talleres, 1, 1, 'finished', '2026-10-17T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zb, 1, t_boca, t_talleres, 1, 6, 'finished', '2026-10-17T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zb, 1, t_boca, t_talleres, 0, 1, 'finished', '2026-10-17T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zb, 1, t_boca, t_talleres, 0, 5, 'finished', '2026-10-17T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zb, 1, t_boca, t_talleres, 0, 3, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zb, 1, t_boca, t_talleres, 0, 4, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zb, 1, t_boca, t_talleres, 0, 1, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona B - Fecha 2: Talleres vs Chapadmalal
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zb, 2, t_talleres, t_chap, 1, 0, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zb, 2, t_talleres, t_chap, 4, 1, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zb, 2, t_talleres, t_chap, 4, 0, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zb, 2, t_talleres, t_chap, 5, 1, 'finished', '2026-10-25T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zb, 2, t_talleres, t_chap, 0, 0, 'finished', '2026-10-25T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zb, 2, t_talleres, t_chap, 2, 0, 'finished', '2026-10-25T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zb, 2, t_talleres, t_chap, 1, 2, 'finished', '2026-10-25T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zb, 2, t_talleres, t_chap, 0, 1, 'finished', '2026-10-25T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zb, 2, t_talleres, t_chap, 3, 0, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zb, 2, t_talleres, t_chap, 2, 0, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zb, 2, t_talleres, t_chap, 1, 0, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona B - Fecha 2: Kimberley vs Boca Juniors
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zb, 2, t_kimberley, t_boca, 3, 2, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zb, 2, t_kimberley, t_boca, 3, 0, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zb, 2, t_kimberley, t_boca, 8, 1, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zb, 2, t_kimberley, t_boca, 8, 0, 'finished', '2026-10-25T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zb, 2, t_kimberley, t_boca, 1, 0, 'finished', '2026-10-25T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zb, 2, t_kimberley, t_boca, 7, 0, 'finished', '2026-10-25T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zb, 2, t_kimberley, t_boca, 1, 0, 'finished', '2026-10-25T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zb, 2, t_kimberley, t_boca, 6, 0, 'finished', '2026-10-25T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zb, 2, t_kimberley, t_boca, 3, 1, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zb, 2, t_kimberley, t_boca, 8, 0, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zb, 2, t_kimberley, t_boca, 1, 0, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona B - Fecha 3: Chapadmalal vs Boca Juniors
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zb, 3, t_chap, t_boca, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zb, 3, t_chap, t_boca, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zb, 3, t_chap, t_boca, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zb, 3, t_chap, t_boca, NULL, NULL, 'scheduled', '2026-11-01T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zb, 3, t_chap, t_boca, NULL, NULL, 'scheduled', '2026-11-01T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zb, 3, t_chap, t_boca, NULL, NULL, 'scheduled', '2026-11-01T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zb, 3, t_chap, t_boca, NULL, NULL, 'scheduled', '2026-11-01T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zb, 3, t_chap, t_boca, NULL, NULL, 'scheduled', '2026-11-01T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zb, 3, t_chap, t_boca, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zb, 3, t_chap, t_boca, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zb, 3, t_chap, t_boca, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona B - Fecha 3: Talleres vs Kimberley
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zb, 3, t_talleres, t_kimberley, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zb, 3, t_talleres, t_kimberley, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zb, 3, t_talleres, t_kimberley, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zb, 3, t_talleres, t_kimberley, NULL, NULL, 'scheduled', '2026-11-01T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zb, 3, t_talleres, t_kimberley, NULL, NULL, 'scheduled', '2026-11-01T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zb, 3, t_talleres, t_kimberley, NULL, NULL, 'scheduled', '2026-11-01T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zb, 3, t_talleres, t_kimberley, NULL, NULL, 'scheduled', '2026-11-01T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zb, 3, t_talleres, t_kimberley, NULL, NULL, 'scheduled', '2026-11-01T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zb, 3, t_talleres, t_kimberley, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zb, 3, t_talleres, t_kimberley, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zb, 3, t_talleres, t_kimberley, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona B - Fecha 4: Kimberley vs Chapadmalal
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zb, 4, t_kimberley, t_chap, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zb, 4, t_kimberley, t_chap, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zb, 4, t_kimberley, t_chap, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zb, 4, t_kimberley, t_chap, NULL, NULL, 'scheduled', '2026-11-08T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zb, 4, t_kimberley, t_chap, NULL, NULL, 'scheduled', '2026-11-08T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zb, 4, t_kimberley, t_chap, NULL, NULL, 'scheduled', '2026-11-08T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zb, 4, t_kimberley, t_chap, NULL, NULL, 'scheduled', '2026-11-08T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zb, 4, t_kimberley, t_chap, NULL, NULL, 'scheduled', '2026-11-08T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zb, 4, t_kimberley, t_chap, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zb, 4, t_kimberley, t_chap, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zb, 4, t_kimberley, t_chap, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona B - Fecha 4: Talleres vs Boca Juniors
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zb, 4, t_talleres, t_boca, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zb, 4, t_talleres, t_boca, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zb, 4, t_talleres, t_boca, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zb, 4, t_talleres, t_boca, NULL, NULL, 'scheduled', '2026-11-08T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zb, 4, t_talleres, t_boca, NULL, NULL, 'scheduled', '2026-11-08T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zb, 4, t_talleres, t_boca, NULL, NULL, 'scheduled', '2026-11-08T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zb, 4, t_talleres, t_boca, NULL, NULL, 'scheduled', '2026-11-08T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zb, 4, t_talleres, t_boca, NULL, NULL, 'scheduled', '2026-11-08T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zb, 4, t_talleres, t_boca, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zb, 4, t_talleres, t_boca, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zb, 4, t_talleres, t_boca, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona B - Fecha 5: Chapadmalal vs Talleres
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zb, 5, t_chap, t_talleres, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zb, 5, t_chap, t_talleres, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zb, 5, t_chap, t_talleres, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zb, 5, t_chap, t_talleres, NULL, NULL, 'scheduled', '2026-11-15T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zb, 5, t_chap, t_talleres, NULL, NULL, 'scheduled', '2026-11-15T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zb, 5, t_chap, t_talleres, NULL, NULL, 'scheduled', '2026-11-15T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zb, 5, t_chap, t_talleres, NULL, NULL, 'scheduled', '2026-11-15T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zb, 5, t_chap, t_talleres, NULL, NULL, 'scheduled', '2026-11-15T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zb, 5, t_chap, t_talleres, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zb, 5, t_chap, t_talleres, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zb, 5, t_chap, t_talleres, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona B - Fecha 5: Boca Juniors vs Kimberley
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zb, 5, t_boca, t_kimberley, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zb, 5, t_boca, t_kimberley, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zb, 5, t_boca, t_kimberley, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zb, 5, t_boca, t_kimberley, NULL, NULL, 'scheduled', '2026-11-15T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zb, 5, t_boca, t_kimberley, NULL, NULL, 'scheduled', '2026-11-15T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zb, 5, t_boca, t_kimberley, NULL, NULL, 'scheduled', '2026-11-15T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zb, 5, t_boca, t_kimberley, NULL, NULL, 'scheduled', '2026-11-15T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zb, 5, t_boca, t_kimberley, NULL, NULL, 'scheduled', '2026-11-15T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zb, 5, t_boca, t_kimberley, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zb, 5, t_boca, t_kimberley, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zb, 5, t_boca, t_kimberley, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona B - Fecha 6: Boca Juniors vs Chapadmalal
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zb, 6, t_boca, t_chap, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zb, 6, t_boca, t_chap, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zb, 6, t_boca, t_chap, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zb, 6, t_boca, t_chap, NULL, NULL, 'scheduled', '2026-11-22T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zb, 6, t_boca, t_chap, NULL, NULL, 'scheduled', '2026-11-22T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zb, 6, t_boca, t_chap, NULL, NULL, 'scheduled', '2026-11-22T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zb, 6, t_boca, t_chap, NULL, NULL, 'scheduled', '2026-11-22T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zb, 6, t_boca, t_chap, NULL, NULL, 'scheduled', '2026-11-22T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zb, 6, t_boca, t_chap, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zb, 6, t_boca, t_chap, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zb, 6, t_boca, t_chap, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona B - Fecha 6: Kimberley vs Talleres
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zb, 6, t_kimberley, t_talleres, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zb, 6, t_kimberley, t_talleres, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zb, 6, t_kimberley, t_talleres, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zb, 6, t_kimberley, t_talleres, NULL, NULL, 'scheduled', '2026-11-22T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zb, 6, t_kimberley, t_talleres, NULL, NULL, 'scheduled', '2026-11-22T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zb, 6, t_kimberley, t_talleres, NULL, NULL, 'scheduled', '2026-11-22T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zb, 6, t_kimberley, t_talleres, NULL, NULL, 'scheduled', '2026-11-22T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zb, 6, t_kimberley, t_talleres, NULL, NULL, 'scheduled', '2026-11-22T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zb, 6, t_kimberley, t_talleres, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zb, 6, t_kimberley, t_talleres, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zb, 6, t_kimberley, t_talleres, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona C - Fecha 1: Atlético Mar del Plata vs Alvarado
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zc, 1, t_mdp, t_alvarado, 0, 3, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zc, 1, t_mdp, t_alvarado, 1, 1, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zc, 1, t_mdp, t_alvarado, 0, 1, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zc, 1, t_mdp, t_alvarado, 4, 1, 'finished', '2026-10-17T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zc, 1, t_mdp, t_alvarado, 1, 1, 'finished', '2026-10-17T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zc, 1, t_mdp, t_alvarado, 0, 2, 'finished', '2026-10-17T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zc, 1, t_mdp, t_alvarado, 0, 4, 'finished', '2026-10-17T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zc, 1, t_mdp, t_alvarado, 1, 2, 'finished', '2026-10-17T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zc, 1, t_mdp, t_alvarado, 2, 3, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zc, 1, t_mdp, t_alvarado, 0, 2, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zc, 1, t_mdp, t_alvarado, 0, 0, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona C - Fecha 1: Al Ver Veras vs San Isidro
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zc, 1, t_alver, t_sanisidro, 1, 4, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zc, 1, t_alver, t_sanisidro, 0, 1, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zc, 1, t_alver, t_sanisidro, 0, 5, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zc, 1, t_alver, t_sanisidro, 0, 1, 'finished', '2026-10-17T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zc, 1, t_alver, t_sanisidro, 0, 2, 'finished', '2026-10-17T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zc, 1, t_alver, t_sanisidro, 0, 3, 'finished', '2026-10-17T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zc, 1, t_alver, t_sanisidro, 1, 0, 'finished', '2026-10-17T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zc, 1, t_alver, t_sanisidro, 4, 5, 'finished', '2026-10-17T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zc, 1, t_alver, t_sanisidro, 0, 0, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zc, 1, t_alver, t_sanisidro, 6, 1, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zc, 1, t_alver, t_sanisidro, 4, 0, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona C - Fecha 2: San Isidro vs Atlético Mar del Plata
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zc, 2, t_sanisidro, t_mdp, 0, 3, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zc, 2, t_sanisidro, t_mdp, 2, 2, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zc, 2, t_sanisidro, t_mdp, 0, 2, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zc, 2, t_sanisidro, t_mdp, 0, 0, 'finished', '2026-10-25T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zc, 2, t_sanisidro, t_mdp, 1, 0, 'finished', '2026-10-25T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zc, 2, t_sanisidro, t_mdp, 0, 0, 'finished', '2026-10-25T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zc, 2, t_sanisidro, t_mdp, 0, 0, 'finished', '2026-10-25T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zc, 2, t_sanisidro, t_mdp, 1, 2, 'finished', '2026-10-25T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zc, 2, t_sanisidro, t_mdp, 6, 0, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zc, 2, t_sanisidro, t_mdp, 1, 1, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zc, 2, t_sanisidro, t_mdp, 0, 3, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona C - Fecha 2: Alvarado vs Al Ver Veras
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zc, 2, t_alvarado, t_alver, 4, 0, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zc, 2, t_alvarado, t_alver, 1, 0, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zc, 2, t_alvarado, t_alver, 11, 0, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zc, 2, t_alvarado, t_alver, 8, 0, 'finished', '2026-10-25T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zc, 2, t_alvarado, t_alver, 1, 2, 'finished', '2026-10-25T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zc, 2, t_alvarado, t_alver, 3, 0, 'finished', '2026-10-25T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zc, 2, t_alvarado, t_alver, 8, 0, 'finished', '2026-10-25T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zc, 2, t_alvarado, t_alver, 6, 1, 'finished', '2026-10-25T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zc, 2, t_alvarado, t_alver, 1, 2, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zc, 2, t_alvarado, t_alver, 7, 0, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zc, 2, t_alvarado, t_alver, 0, 1, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona C - Fecha 3: Atlético Mar del Plata vs Al Ver Veras
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zc, 3, t_mdp, t_alver, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zc, 3, t_mdp, t_alver, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zc, 3, t_mdp, t_alver, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zc, 3, t_mdp, t_alver, NULL, NULL, 'scheduled', '2026-11-01T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zc, 3, t_mdp, t_alver, NULL, NULL, 'scheduled', '2026-11-01T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zc, 3, t_mdp, t_alver, NULL, NULL, 'scheduled', '2026-11-01T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zc, 3, t_mdp, t_alver, NULL, NULL, 'scheduled', '2026-11-01T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zc, 3, t_mdp, t_alver, NULL, NULL, 'scheduled', '2026-11-01T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zc, 3, t_mdp, t_alver, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zc, 3, t_mdp, t_alver, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zc, 3, t_mdp, t_alver, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona C - Fecha 3: San Isidro vs Alvarado
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zc, 3, t_sanisidro, t_alvarado, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zc, 3, t_sanisidro, t_alvarado, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zc, 3, t_sanisidro, t_alvarado, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zc, 3, t_sanisidro, t_alvarado, NULL, NULL, 'scheduled', '2026-11-01T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zc, 3, t_sanisidro, t_alvarado, NULL, NULL, 'scheduled', '2026-11-01T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zc, 3, t_sanisidro, t_alvarado, NULL, NULL, 'scheduled', '2026-11-01T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zc, 3, t_sanisidro, t_alvarado, NULL, NULL, 'scheduled', '2026-11-01T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zc, 3, t_sanisidro, t_alvarado, NULL, NULL, 'scheduled', '2026-11-01T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zc, 3, t_sanisidro, t_alvarado, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zc, 3, t_sanisidro, t_alvarado, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zc, 3, t_sanisidro, t_alvarado, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona C - Fecha 4: Alvarado vs Atlético Mar del Plata
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zc, 4, t_alvarado, t_mdp, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zc, 4, t_alvarado, t_mdp, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zc, 4, t_alvarado, t_mdp, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zc, 4, t_alvarado, t_mdp, NULL, NULL, 'scheduled', '2026-11-08T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zc, 4, t_alvarado, t_mdp, NULL, NULL, 'scheduled', '2026-11-08T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zc, 4, t_alvarado, t_mdp, NULL, NULL, 'scheduled', '2026-11-08T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zc, 4, t_alvarado, t_mdp, NULL, NULL, 'scheduled', '2026-11-08T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zc, 4, t_alvarado, t_mdp, NULL, NULL, 'scheduled', '2026-11-08T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zc, 4, t_alvarado, t_mdp, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zc, 4, t_alvarado, t_mdp, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zc, 4, t_alvarado, t_mdp, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona C - Fecha 4: San Isidro vs Al Ver Veras
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zc, 4, t_sanisidro, t_alver, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zc, 4, t_sanisidro, t_alver, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zc, 4, t_sanisidro, t_alver, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zc, 4, t_sanisidro, t_alver, NULL, NULL, 'scheduled', '2026-11-08T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zc, 4, t_sanisidro, t_alver, NULL, NULL, 'scheduled', '2026-11-08T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zc, 4, t_sanisidro, t_alver, NULL, NULL, 'scheduled', '2026-11-08T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zc, 4, t_sanisidro, t_alver, NULL, NULL, 'scheduled', '2026-11-08T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zc, 4, t_sanisidro, t_alver, NULL, NULL, 'scheduled', '2026-11-08T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zc, 4, t_sanisidro, t_alver, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zc, 4, t_sanisidro, t_alver, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zc, 4, t_sanisidro, t_alver, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona C - Fecha 5: Atlético Mar del Plata vs San Isidro
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zc, 5, t_mdp, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zc, 5, t_mdp, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zc, 5, t_mdp, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zc, 5, t_mdp, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-15T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zc, 5, t_mdp, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-15T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zc, 5, t_mdp, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-15T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zc, 5, t_mdp, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-15T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zc, 5, t_mdp, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-15T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zc, 5, t_mdp, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zc, 5, t_mdp, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zc, 5, t_mdp, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona C - Fecha 5: Al Ver Veras vs Alvarado
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zc, 5, t_alver, t_alvarado, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zc, 5, t_alver, t_alvarado, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zc, 5, t_alver, t_alvarado, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zc, 5, t_alver, t_alvarado, NULL, NULL, 'scheduled', '2026-11-15T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zc, 5, t_alver, t_alvarado, NULL, NULL, 'scheduled', '2026-11-15T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zc, 5, t_alver, t_alvarado, NULL, NULL, 'scheduled', '2026-11-15T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zc, 5, t_alver, t_alvarado, NULL, NULL, 'scheduled', '2026-11-15T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zc, 5, t_alver, t_alvarado, NULL, NULL, 'scheduled', '2026-11-15T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zc, 5, t_alver, t_alvarado, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zc, 5, t_alver, t_alvarado, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zc, 5, t_alver, t_alvarado, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona C - Fecha 6: Al Ver Veras vs Atlético Mar del Plata
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zc, 6, t_alver, t_mdp, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zc, 6, t_alver, t_mdp, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zc, 6, t_alver, t_mdp, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zc, 6, t_alver, t_mdp, NULL, NULL, 'scheduled', '2026-11-22T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zc, 6, t_alver, t_mdp, NULL, NULL, 'scheduled', '2026-11-22T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zc, 6, t_alver, t_mdp, NULL, NULL, 'scheduled', '2026-11-22T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zc, 6, t_alver, t_mdp, NULL, NULL, 'scheduled', '2026-11-22T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zc, 6, t_alver, t_mdp, NULL, NULL, 'scheduled', '2026-11-22T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zc, 6, t_alver, t_mdp, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zc, 6, t_alver, t_mdp, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zc, 6, t_alver, t_mdp, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona C - Fecha 6: Alvarado vs San Isidro
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zc, 6, t_alvarado, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zc, 6, t_alvarado, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zc, 6, t_alvarado, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zc, 6, t_alvarado, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-22T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zc, 6, t_alvarado, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-22T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zc, 6, t_alvarado, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-22T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zc, 6, t_alvarado, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-22T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zc, 6, t_alvarado, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-22T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zc, 6, t_alvarado, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zc, 6, t_alvarado, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zc, 6, t_alvarado, t_sanisidro, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona D - Fecha 1: Independiente vs El cañon
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zd, 1, t_indep, t_canon, 2, 2, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zd, 1, t_indep, t_canon, 1, 0, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zd, 1, t_indep, t_canon, 0, 0, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zd, 1, t_indep, t_canon, 1, 1, 'finished', '2026-10-17T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zd, 1, t_indep, t_canon, 6, 0, 'finished', '2026-10-17T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zd, 1, t_indep, t_canon, 2, 1, 'finished', '2026-10-17T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zd, 1, t_indep, t_canon, 1, 0, 'finished', '2026-10-17T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zd, 1, t_indep, t_canon, 2, 3, 'finished', '2026-10-17T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zd, 1, t_indep, t_canon, 0, 2, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zd, 1, t_indep, t_canon, 1, 1, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zd, 1, t_indep, t_canon, 2, 2, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona D - Fecha 1: Racing vs Quilmes
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zd, 1, t_racing, t_quilmes, 2, 3, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zd, 1, t_racing, t_quilmes, 1, 3, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zd, 1, t_racing, t_quilmes, 1, 1, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zd, 1, t_racing, t_quilmes, 0, 0, 'finished', '2026-10-17T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zd, 1, t_racing, t_quilmes, 0, 5, 'finished', '2026-10-17T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zd, 1, t_racing, t_quilmes, 1, 4, 'finished', '2026-10-17T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zd, 1, t_racing, t_quilmes, 0, 11, 'finished', '2026-10-17T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zd, 1, t_racing, t_quilmes, 0, 1, 'finished', '2026-10-17T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zd, 1, t_racing, t_quilmes, 1, 4, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zd, 1, t_racing, t_quilmes, 0, 1, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zd, 1, t_racing, t_quilmes, 0, 0, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona D - Fecha 2: Quilmes vs Independiente
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zd, 2, t_quilmes, t_indep, NULL, NULL, 'scheduled', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zd, 2, t_quilmes, t_indep, NULL, NULL, 'scheduled', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zd, 2, t_quilmes, t_indep, 0, 1, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zd, 2, t_quilmes, t_indep, 1, 3, 'finished', '2026-10-25T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zd, 2, t_quilmes, t_indep, 0, 2, 'finished', '2026-10-25T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zd, 2, t_quilmes, t_indep, 0, 3, 'finished', '2026-10-25T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zd, 2, t_quilmes, t_indep, 1, 0, 'finished', '2026-10-25T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zd, 2, t_quilmes, t_indep, 1, 2, 'finished', '2026-10-25T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zd, 2, t_quilmes, t_indep, 0, 3, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zd, 2, t_quilmes, t_indep, 1, 0, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zd, 2, t_quilmes, t_indep, 0, 1, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona D - Fecha 2: El cañon vs Racing
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zd, 2, t_canon, t_racing, 5, 1, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zd, 2, t_canon, t_racing, 1, 1, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zd, 2, t_canon, t_racing, 4, 0, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zd, 2, t_canon, t_racing, 5, 0, 'finished', '2026-10-25T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zd, 2, t_canon, t_racing, 5, 0, 'finished', '2026-10-25T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zd, 2, t_canon, t_racing, 15, 0, 'finished', '2026-10-25T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zd, 2, t_canon, t_racing, 5, 0, 'finished', '2026-10-25T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zd, 2, t_canon, t_racing, 0, 3, 'finished', '2026-10-25T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zd, 2, t_canon, t_racing, 5, 2, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zd, 2, t_canon, t_racing, 1, 0, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zd, 2, t_canon, t_racing, 1, 0, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona D - Fecha 3: Independiente vs Racing
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zd, 3, t_indep, t_racing, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zd, 3, t_indep, t_racing, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zd, 3, t_indep, t_racing, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zd, 3, t_indep, t_racing, NULL, NULL, 'scheduled', '2026-11-01T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zd, 3, t_indep, t_racing, NULL, NULL, 'scheduled', '2026-11-01T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zd, 3, t_indep, t_racing, NULL, NULL, 'scheduled', '2026-11-01T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zd, 3, t_indep, t_racing, NULL, NULL, 'scheduled', '2026-11-01T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zd, 3, t_indep, t_racing, NULL, NULL, 'scheduled', '2026-11-01T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zd, 3, t_indep, t_racing, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zd, 3, t_indep, t_racing, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zd, 3, t_indep, t_racing, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona D - Fecha 3: Quilmes vs El cañon
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zd, 3, t_quilmes, t_canon, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zd, 3, t_quilmes, t_canon, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zd, 3, t_quilmes, t_canon, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zd, 3, t_quilmes, t_canon, NULL, NULL, 'scheduled', '2026-11-01T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zd, 3, t_quilmes, t_canon, NULL, NULL, 'scheduled', '2026-11-01T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zd, 3, t_quilmes, t_canon, NULL, NULL, 'scheduled', '2026-11-01T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zd, 3, t_quilmes, t_canon, NULL, NULL, 'scheduled', '2026-11-01T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zd, 3, t_quilmes, t_canon, NULL, NULL, 'scheduled', '2026-11-01T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zd, 3, t_quilmes, t_canon, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zd, 3, t_quilmes, t_canon, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zd, 3, t_quilmes, t_canon, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona D - Fecha 4: El cañon vs Independiente
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zd, 4, t_canon, t_indep, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zd, 4, t_canon, t_indep, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zd, 4, t_canon, t_indep, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zd, 4, t_canon, t_indep, NULL, NULL, 'scheduled', '2026-11-08T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zd, 4, t_canon, t_indep, NULL, NULL, 'scheduled', '2026-11-08T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zd, 4, t_canon, t_indep, NULL, NULL, 'scheduled', '2026-11-08T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zd, 4, t_canon, t_indep, NULL, NULL, 'scheduled', '2026-11-08T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zd, 4, t_canon, t_indep, NULL, NULL, 'scheduled', '2026-11-08T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zd, 4, t_canon, t_indep, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zd, 4, t_canon, t_indep, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zd, 4, t_canon, t_indep, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona D - Fecha 4: Quilmes vs Racing
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zd, 4, t_quilmes, t_racing, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zd, 4, t_quilmes, t_racing, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zd, 4, t_quilmes, t_racing, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zd, 4, t_quilmes, t_racing, NULL, NULL, 'scheduled', '2026-11-08T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zd, 4, t_quilmes, t_racing, NULL, NULL, 'scheduled', '2026-11-08T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zd, 4, t_quilmes, t_racing, NULL, NULL, 'scheduled', '2026-11-08T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zd, 4, t_quilmes, t_racing, NULL, NULL, 'scheduled', '2026-11-08T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zd, 4, t_quilmes, t_racing, NULL, NULL, 'scheduled', '2026-11-08T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zd, 4, t_quilmes, t_racing, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zd, 4, t_quilmes, t_racing, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zd, 4, t_quilmes, t_racing, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona D - Fecha 5: Independiente vs Quilmes
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zd, 5, t_indep, t_quilmes, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zd, 5, t_indep, t_quilmes, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zd, 5, t_indep, t_quilmes, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zd, 5, t_indep, t_quilmes, NULL, NULL, 'scheduled', '2026-11-15T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zd, 5, t_indep, t_quilmes, NULL, NULL, 'scheduled', '2026-11-15T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zd, 5, t_indep, t_quilmes, NULL, NULL, 'scheduled', '2026-11-15T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zd, 5, t_indep, t_quilmes, NULL, NULL, 'scheduled', '2026-11-15T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zd, 5, t_indep, t_quilmes, NULL, NULL, 'scheduled', '2026-11-15T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zd, 5, t_indep, t_quilmes, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zd, 5, t_indep, t_quilmes, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zd, 5, t_indep, t_quilmes, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona D - Fecha 5: Racing vs El cañon
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zd, 5, t_racing, t_canon, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zd, 5, t_racing, t_canon, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zd, 5, t_racing, t_canon, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zd, 5, t_racing, t_canon, NULL, NULL, 'scheduled', '2026-11-15T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zd, 5, t_racing, t_canon, NULL, NULL, 'scheduled', '2026-11-15T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zd, 5, t_racing, t_canon, NULL, NULL, 'scheduled', '2026-11-15T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zd, 5, t_racing, t_canon, NULL, NULL, 'scheduled', '2026-11-15T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zd, 5, t_racing, t_canon, NULL, NULL, 'scheduled', '2026-11-15T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zd, 5, t_racing, t_canon, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zd, 5, t_racing, t_canon, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zd, 5, t_racing, t_canon, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona D - Fecha 6: Racing vs Independiente
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zd, 6, t_racing, t_indep, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zd, 6, t_racing, t_indep, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zd, 6, t_racing, t_indep, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zd, 6, t_racing, t_indep, NULL, NULL, 'scheduled', '2026-11-22T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zd, 6, t_racing, t_indep, NULL, NULL, 'scheduled', '2026-11-22T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zd, 6, t_racing, t_indep, NULL, NULL, 'scheduled', '2026-11-22T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zd, 6, t_racing, t_indep, NULL, NULL, 'scheduled', '2026-11-22T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zd, 6, t_racing, t_indep, NULL, NULL, 'scheduled', '2026-11-22T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zd, 6, t_racing, t_indep, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zd, 6, t_racing, t_indep, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zd, 6, t_racing, t_indep, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona D - Fecha 6: El cañon vs Quilmes
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zd, 6, t_canon, t_quilmes, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zd, 6, t_canon, t_quilmes, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zd, 6, t_canon, t_quilmes, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zd, 6, t_canon, t_quilmes, NULL, NULL, 'scheduled', '2026-11-22T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zd, 6, t_canon, t_quilmes, NULL, NULL, 'scheduled', '2026-11-22T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zd, 6, t_canon, t_quilmes, NULL, NULL, 'scheduled', '2026-11-22T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zd, 6, t_canon, t_quilmes, NULL, NULL, 'scheduled', '2026-11-22T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zd, 6, t_canon, t_quilmes, NULL, NULL, 'scheduled', '2026-11-22T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zd, 6, t_canon, t_quilmes, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zd, 6, t_canon, t_quilmes, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zd, 6, t_canon, t_quilmes, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona E - Fecha 1: Deportivo Norte vs Circulo
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_ze, 1, t_depnorte, t_circulo, 1, 0, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_ze, 1, t_depnorte, t_circulo, 1, 0, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_ze, 1, t_depnorte, t_circulo, 0, 0, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_ze, 1, t_depnorte, t_circulo, 0, 0, 'finished', '2026-10-17T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_ze, 1, t_depnorte, t_circulo, 3, 0, 'finished', '2026-10-17T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_ze, 1, t_depnorte, t_circulo, 2, 0, 'finished', '2026-10-17T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_ze, 1, t_depnorte, t_circulo, 1, 2, 'finished', '2026-10-17T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_ze, 1, t_depnorte, t_circulo, 1, 2, 'finished', '2026-10-17T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_ze, 1, t_depnorte, t_circulo, 6, 0, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_ze, 1, t_depnorte, t_circulo, 7, 0, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_ze, 1, t_depnorte, t_circulo, 1, 1, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona E - Fecha 1: Almagro vs Nacion
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_ze, 1, t_almagro, t_nacion, 2, 1, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_ze, 1, t_almagro, t_nacion, 1, 3, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_ze, 1, t_almagro, t_nacion, 1, 7, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_ze, 1, t_almagro, t_nacion, 0, 8, 'finished', '2026-10-17T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_ze, 1, t_almagro, t_nacion, 0, 3, 'finished', '2026-10-17T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_ze, 1, t_almagro, t_nacion, 0, 2, 'finished', '2026-10-17T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_ze, 1, t_almagro, t_nacion, 3, 1, 'finished', '2026-10-17T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_ze, 1, t_almagro, t_nacion, 2, 1, 'finished', '2026-10-17T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_ze, 1, t_almagro, t_nacion, 1, 5, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_ze, 1, t_almagro, t_nacion, 0, 0, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_ze, 1, t_almagro, t_nacion, 0, 0, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona E - Fecha 2: Nacion vs Deportivo Norte
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_ze, 2, t_nacion, t_depnorte, 0, 3, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_ze, 2, t_nacion, t_depnorte, 0, 1, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_ze, 2, t_nacion, t_depnorte, 4, 3, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_ze, 2, t_nacion, t_depnorte, 5, 0, 'finished', '2026-10-25T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_ze, 2, t_nacion, t_depnorte, 1, 2, 'finished', '2026-10-25T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_ze, 2, t_nacion, t_depnorte, 0, 0, 'finished', '2026-10-25T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_ze, 2, t_nacion, t_depnorte, 1, 1, 'finished', '2026-10-25T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_ze, 2, t_nacion, t_depnorte, 2, 3, 'finished', '2026-10-25T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_ze, 2, t_nacion, t_depnorte, 2, 3, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_ze, 2, t_nacion, t_depnorte, 0, 3, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_ze, 2, t_nacion, t_depnorte, 0, 1, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona E - Fecha 2: Circulo vs Almagro
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_ze, 2, t_circulo, t_almagro, 5, 1, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_ze, 2, t_circulo, t_almagro, 4, 2, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_ze, 2, t_circulo, t_almagro, 3, 1, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_ze, 2, t_circulo, t_almagro, 3, 1, 'finished', '2026-10-25T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_ze, 2, t_circulo, t_almagro, 2, 0, 'finished', '2026-10-25T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_ze, 2, t_circulo, t_almagro, 3, 0, 'finished', '2026-10-25T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_ze, 2, t_circulo, t_almagro, 1, 3, 'finished', '2026-10-25T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_ze, 2, t_circulo, t_almagro, 9, 0, 'finished', '2026-10-25T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_ze, 2, t_circulo, t_almagro, 3, 1, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_ze, 2, t_circulo, t_almagro, 3, 2, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_ze, 2, t_circulo, t_almagro, 1, 0, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona E - Fecha 3: Deportivo Norte vs Almagro
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_ze, 3, t_depnorte, t_almagro, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_ze, 3, t_depnorte, t_almagro, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_ze, 3, t_depnorte, t_almagro, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_ze, 3, t_depnorte, t_almagro, NULL, NULL, 'scheduled', '2026-11-01T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_ze, 3, t_depnorte, t_almagro, NULL, NULL, 'scheduled', '2026-11-01T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_ze, 3, t_depnorte, t_almagro, NULL, NULL, 'scheduled', '2026-11-01T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_ze, 3, t_depnorte, t_almagro, NULL, NULL, 'scheduled', '2026-11-01T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_ze, 3, t_depnorte, t_almagro, NULL, NULL, 'scheduled', '2026-11-01T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_ze, 3, t_depnorte, t_almagro, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_ze, 3, t_depnorte, t_almagro, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_ze, 3, t_depnorte, t_almagro, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona E - Fecha 3: Nacion vs Circulo
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_ze, 3, t_nacion, t_circulo, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_ze, 3, t_nacion, t_circulo, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_ze, 3, t_nacion, t_circulo, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_ze, 3, t_nacion, t_circulo, NULL, NULL, 'scheduled', '2026-11-01T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_ze, 3, t_nacion, t_circulo, NULL, NULL, 'scheduled', '2026-11-01T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_ze, 3, t_nacion, t_circulo, NULL, NULL, 'scheduled', '2026-11-01T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_ze, 3, t_nacion, t_circulo, NULL, NULL, 'scheduled', '2026-11-01T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_ze, 3, t_nacion, t_circulo, NULL, NULL, 'scheduled', '2026-11-01T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_ze, 3, t_nacion, t_circulo, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_ze, 3, t_nacion, t_circulo, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_ze, 3, t_nacion, t_circulo, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona E - Fecha 4: Circulo vs Deportivo Norte
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_ze, 4, t_circulo, t_depnorte, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_ze, 4, t_circulo, t_depnorte, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_ze, 4, t_circulo, t_depnorte, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_ze, 4, t_circulo, t_depnorte, NULL, NULL, 'scheduled', '2026-11-08T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_ze, 4, t_circulo, t_depnorte, NULL, NULL, 'scheduled', '2026-11-08T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_ze, 4, t_circulo, t_depnorte, NULL, NULL, 'scheduled', '2026-11-08T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_ze, 4, t_circulo, t_depnorte, NULL, NULL, 'scheduled', '2026-11-08T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_ze, 4, t_circulo, t_depnorte, NULL, NULL, 'scheduled', '2026-11-08T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_ze, 4, t_circulo, t_depnorte, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_ze, 4, t_circulo, t_depnorte, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_ze, 4, t_circulo, t_depnorte, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona E - Fecha 4: Nacion vs Almagro
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_ze, 4, t_nacion, t_almagro, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_ze, 4, t_nacion, t_almagro, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_ze, 4, t_nacion, t_almagro, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_ze, 4, t_nacion, t_almagro, NULL, NULL, 'scheduled', '2026-11-08T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_ze, 4, t_nacion, t_almagro, NULL, NULL, 'scheduled', '2026-11-08T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_ze, 4, t_nacion, t_almagro, NULL, NULL, 'scheduled', '2026-11-08T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_ze, 4, t_nacion, t_almagro, NULL, NULL, 'scheduled', '2026-11-08T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_ze, 4, t_nacion, t_almagro, NULL, NULL, 'scheduled', '2026-11-08T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_ze, 4, t_nacion, t_almagro, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_ze, 4, t_nacion, t_almagro, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_ze, 4, t_nacion, t_almagro, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona E - Fecha 5: Deportivo Norte vs Nacion
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_ze, 5, t_depnorte, t_nacion, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_ze, 5, t_depnorte, t_nacion, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_ze, 5, t_depnorte, t_nacion, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_ze, 5, t_depnorte, t_nacion, NULL, NULL, 'scheduled', '2026-11-15T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_ze, 5, t_depnorte, t_nacion, NULL, NULL, 'scheduled', '2026-11-15T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_ze, 5, t_depnorte, t_nacion, NULL, NULL, 'scheduled', '2026-11-15T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_ze, 5, t_depnorte, t_nacion, NULL, NULL, 'scheduled', '2026-11-15T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_ze, 5, t_depnorte, t_nacion, NULL, NULL, 'scheduled', '2026-11-15T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_ze, 5, t_depnorte, t_nacion, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_ze, 5, t_depnorte, t_nacion, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_ze, 5, t_depnorte, t_nacion, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona E - Fecha 5: Almagro vs Circulo
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_ze, 5, t_almagro, t_circulo, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_ze, 5, t_almagro, t_circulo, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_ze, 5, t_almagro, t_circulo, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_ze, 5, t_almagro, t_circulo, NULL, NULL, 'scheduled', '2026-11-15T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_ze, 5, t_almagro, t_circulo, NULL, NULL, 'scheduled', '2026-11-15T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_ze, 5, t_almagro, t_circulo, NULL, NULL, 'scheduled', '2026-11-15T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_ze, 5, t_almagro, t_circulo, NULL, NULL, 'scheduled', '2026-11-15T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_ze, 5, t_almagro, t_circulo, NULL, NULL, 'scheduled', '2026-11-15T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_ze, 5, t_almagro, t_circulo, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_ze, 5, t_almagro, t_circulo, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_ze, 5, t_almagro, t_circulo, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona E - Fecha 6: Almagro vs Deportivo Norte
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_ze, 6, t_almagro, t_depnorte, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_ze, 6, t_almagro, t_depnorte, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_ze, 6, t_almagro, t_depnorte, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_ze, 6, t_almagro, t_depnorte, NULL, NULL, 'scheduled', '2026-11-22T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_ze, 6, t_almagro, t_depnorte, NULL, NULL, 'scheduled', '2026-11-22T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_ze, 6, t_almagro, t_depnorte, NULL, NULL, 'scheduled', '2026-11-22T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_ze, 6, t_almagro, t_depnorte, NULL, NULL, 'scheduled', '2026-11-22T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_ze, 6, t_almagro, t_depnorte, NULL, NULL, 'scheduled', '2026-11-22T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_ze, 6, t_almagro, t_depnorte, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_ze, 6, t_almagro, t_depnorte, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_ze, 6, t_almagro, t_depnorte, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona E - Fecha 6: Circulo vs Nacion
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_ze, 6, t_circulo, t_nacion, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_ze, 6, t_circulo, t_nacion, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_ze, 6, t_circulo, t_nacion, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_ze, 6, t_circulo, t_nacion, NULL, NULL, 'scheduled', '2026-11-22T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_ze, 6, t_circulo, t_nacion, NULL, NULL, 'scheduled', '2026-11-22T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_ze, 6, t_circulo, t_nacion, NULL, NULL, 'scheduled', '2026-11-22T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_ze, 6, t_circulo, t_nacion, NULL, NULL, 'scheduled', '2026-11-22T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_ze, 6, t_circulo, t_nacion, NULL, NULL, 'scheduled', '2026-11-22T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_ze, 6, t_circulo, t_nacion, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_ze, 6, t_circulo, t_nacion, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_ze, 6, t_circulo, t_nacion, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona F - Fecha 1: Colegiales vs San José
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zf, 1, t_colegia, t_sanjose, 0, 0, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zf, 1, t_colegia, t_sanjose, 0, 1, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zf, 1, t_colegia, t_sanjose, 6, 0, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zf, 1, t_colegia, t_sanjose, 0, 5, 'finished', '2026-10-17T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zf, 1, t_colegia, t_sanjose, 4, 0, 'finished', '2026-10-17T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zf, 1, t_colegia, t_sanjose, 1, 3, 'finished', '2026-10-17T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zf, 1, t_colegia, t_sanjose, 2, 0, 'finished', '2026-10-17T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zf, 1, t_colegia, t_sanjose, 2, 1, 'finished', '2026-10-17T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zf, 1, t_colegia, t_sanjose, 2, 0, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zf, 1, t_colegia, t_sanjose, 9, 0, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zf, 1, t_colegia, t_sanjose, 7, 0, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona F - Fecha 1: River Plate vs Cadetes
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zf, 1, t_river, t_cadetes, 2, 1, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zf, 1, t_river, t_cadetes, 0, 1, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zf, 1, t_river, t_cadetes, 2, 0, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zf, 1, t_river, t_cadetes, 0, 2, 'finished', '2026-10-17T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zf, 1, t_river, t_cadetes, 3, 1, 'finished', '2026-10-17T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zf, 1, t_river, t_cadetes, 2, 1, 'finished', '2026-10-17T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zf, 1, t_river, t_cadetes, 0, 0, 'finished', '2026-10-17T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zf, 1, t_river, t_cadetes, 5, 2, 'finished', '2026-10-17T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zf, 1, t_river, t_cadetes, 1, 1, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zf, 1, t_river, t_cadetes, 4, 0, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zf, 1, t_river, t_cadetes, 0, 4, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona F - Fecha 2: Cadetes vs Colegiales
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zf, 2, t_cadetes, t_colegia, 5, 1, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zf, 2, t_cadetes, t_colegia, 1, 0, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zf, 2, t_cadetes, t_colegia, 2, 1, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zf, 2, t_cadetes, t_colegia, 8, 0, 'finished', '2026-10-25T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zf, 2, t_cadetes, t_colegia, 1, 2, 'finished', '2026-10-25T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zf, 2, t_cadetes, t_colegia, 4, 0, 'finished', '2026-10-25T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zf, 2, t_cadetes, t_colegia, 2, 0, 'finished', '2026-10-25T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zf, 2, t_cadetes, t_colegia, 5, 0, 'finished', '2026-10-25T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zf, 2, t_cadetes, t_colegia, 3, 1, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zf, 2, t_cadetes, t_colegia, NULL, NULL, 'scheduled', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zf, 2, t_cadetes, t_colegia, 0, 2, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona F - Fecha 2: San José vs River Plate
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zf, 2, t_sanjose, t_river, 0, 7, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zf, 2, t_sanjose, t_river, 0, 2, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zf, 2, t_sanjose, t_river, 1, 4, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zf, 2, t_sanjose, t_river, 1, 2, 'finished', '2026-10-25T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zf, 2, t_sanjose, t_river, 0, 6, 'finished', '2026-10-25T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zf, 2, t_sanjose, t_river, 0, 2, 'finished', '2026-10-25T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zf, 2, t_sanjose, t_river, 0, 0, 'finished', '2026-10-25T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zf, 2, t_sanjose, t_river, 0, 0, 'finished', '2026-10-25T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zf, 2, t_sanjose, t_river, 0, 4, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zf, 2, t_sanjose, t_river, 0, 7, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zf, 2, t_sanjose, t_river, 0, 5, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona F - Fecha 3: Colegiales vs River Plate
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zf, 3, t_colegia, t_river, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zf, 3, t_colegia, t_river, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zf, 3, t_colegia, t_river, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zf, 3, t_colegia, t_river, NULL, NULL, 'scheduled', '2026-11-01T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zf, 3, t_colegia, t_river, NULL, NULL, 'scheduled', '2026-11-01T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zf, 3, t_colegia, t_river, NULL, NULL, 'scheduled', '2026-11-01T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zf, 3, t_colegia, t_river, NULL, NULL, 'scheduled', '2026-11-01T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zf, 3, t_colegia, t_river, NULL, NULL, 'scheduled', '2026-11-01T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zf, 3, t_colegia, t_river, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zf, 3, t_colegia, t_river, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zf, 3, t_colegia, t_river, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona F - Fecha 3: Cadetes vs San José
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zf, 3, t_cadetes, t_sanjose, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zf, 3, t_cadetes, t_sanjose, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zf, 3, t_cadetes, t_sanjose, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zf, 3, t_cadetes, t_sanjose, NULL, NULL, 'scheduled', '2026-11-01T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zf, 3, t_cadetes, t_sanjose, NULL, NULL, 'scheduled', '2026-11-01T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zf, 3, t_cadetes, t_sanjose, NULL, NULL, 'scheduled', '2026-11-01T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zf, 3, t_cadetes, t_sanjose, NULL, NULL, 'scheduled', '2026-11-01T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zf, 3, t_cadetes, t_sanjose, NULL, NULL, 'scheduled', '2026-11-01T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zf, 3, t_cadetes, t_sanjose, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zf, 3, t_cadetes, t_sanjose, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zf, 3, t_cadetes, t_sanjose, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona F - Fecha 4: San José vs Colegiales
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zf, 4, t_sanjose, t_colegia, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zf, 4, t_sanjose, t_colegia, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zf, 4, t_sanjose, t_colegia, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zf, 4, t_sanjose, t_colegia, NULL, NULL, 'scheduled', '2026-11-08T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zf, 4, t_sanjose, t_colegia, NULL, NULL, 'scheduled', '2026-11-08T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zf, 4, t_sanjose, t_colegia, NULL, NULL, 'scheduled', '2026-11-08T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zf, 4, t_sanjose, t_colegia, NULL, NULL, 'scheduled', '2026-11-08T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zf, 4, t_sanjose, t_colegia, NULL, NULL, 'scheduled', '2026-11-08T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zf, 4, t_sanjose, t_colegia, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zf, 4, t_sanjose, t_colegia, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zf, 4, t_sanjose, t_colegia, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona F - Fecha 4: Cadetes vs River Plate
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zf, 4, t_cadetes, t_river, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zf, 4, t_cadetes, t_river, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zf, 4, t_cadetes, t_river, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zf, 4, t_cadetes, t_river, NULL, NULL, 'scheduled', '2026-11-08T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zf, 4, t_cadetes, t_river, NULL, NULL, 'scheduled', '2026-11-08T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zf, 4, t_cadetes, t_river, NULL, NULL, 'scheduled', '2026-11-08T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zf, 4, t_cadetes, t_river, NULL, NULL, 'scheduled', '2026-11-08T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zf, 4, t_cadetes, t_river, NULL, NULL, 'scheduled', '2026-11-08T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zf, 4, t_cadetes, t_river, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zf, 4, t_cadetes, t_river, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zf, 4, t_cadetes, t_river, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona F - Fecha 5: Colegiales vs Cadetes
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zf, 5, t_colegia, t_cadetes, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zf, 5, t_colegia, t_cadetes, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zf, 5, t_colegia, t_cadetes, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zf, 5, t_colegia, t_cadetes, NULL, NULL, 'scheduled', '2026-11-15T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zf, 5, t_colegia, t_cadetes, NULL, NULL, 'scheduled', '2026-11-15T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zf, 5, t_colegia, t_cadetes, NULL, NULL, 'scheduled', '2026-11-15T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zf, 5, t_colegia, t_cadetes, NULL, NULL, 'scheduled', '2026-11-15T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zf, 5, t_colegia, t_cadetes, NULL, NULL, 'scheduled', '2026-11-15T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zf, 5, t_colegia, t_cadetes, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zf, 5, t_colegia, t_cadetes, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zf, 5, t_colegia, t_cadetes, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona F - Fecha 5: River Plate vs San José
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zf, 5, t_river, t_sanjose, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zf, 5, t_river, t_sanjose, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zf, 5, t_river, t_sanjose, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zf, 5, t_river, t_sanjose, NULL, NULL, 'scheduled', '2026-11-15T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zf, 5, t_river, t_sanjose, NULL, NULL, 'scheduled', '2026-11-15T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zf, 5, t_river, t_sanjose, NULL, NULL, 'scheduled', '2026-11-15T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zf, 5, t_river, t_sanjose, NULL, NULL, 'scheduled', '2026-11-15T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zf, 5, t_river, t_sanjose, NULL, NULL, 'scheduled', '2026-11-15T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zf, 5, t_river, t_sanjose, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zf, 5, t_river, t_sanjose, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zf, 5, t_river, t_sanjose, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona F - Fecha 6: River Plate vs Colegiales
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zf, 6, t_river, t_colegia, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zf, 6, t_river, t_colegia, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zf, 6, t_river, t_colegia, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zf, 6, t_river, t_colegia, NULL, NULL, 'scheduled', '2026-11-22T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zf, 6, t_river, t_colegia, NULL, NULL, 'scheduled', '2026-11-22T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zf, 6, t_river, t_colegia, NULL, NULL, 'scheduled', '2026-11-22T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zf, 6, t_river, t_colegia, NULL, NULL, 'scheduled', '2026-11-22T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zf, 6, t_river, t_colegia, NULL, NULL, 'scheduled', '2026-11-22T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zf, 6, t_river, t_colegia, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zf, 6, t_river, t_colegia, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zf, 6, t_river, t_colegia, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona F - Fecha 6: San José vs Cadetes
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zf, 6, t_sanjose, t_cadetes, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zf, 6, t_sanjose, t_cadetes, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zf, 6, t_sanjose, t_cadetes, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zf, 6, t_sanjose, t_cadetes, NULL, NULL, 'scheduled', '2026-11-22T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zf, 6, t_sanjose, t_cadetes, NULL, NULL, 'scheduled', '2026-11-22T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zf, 6, t_sanjose, t_cadetes, NULL, NULL, 'scheduled', '2026-11-22T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zf, 6, t_sanjose, t_cadetes, NULL, NULL, 'scheduled', '2026-11-22T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zf, 6, t_sanjose, t_cadetes, NULL, NULL, 'scheduled', '2026-11-22T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zf, 6, t_sanjose, t_cadetes, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zf, 6, t_sanjose, t_cadetes, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zf, 6, t_sanjose, t_cadetes, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona G - Fecha 1: Banco Provincia vs Banfield
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zg, 1, t_banco, t_banfield, 1, 3, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zg, 1, t_banco, t_banfield, 1, 9, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zg, 1, t_banco, t_banfield, 0, 10, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zg, 1, t_banco, t_banfield, 0, 5, 'finished', '2026-10-17T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zg, 1, t_banco, t_banfield, 1, 7, 'finished', '2026-10-17T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zg, 1, t_banco, t_banfield, 0, 2, 'finished', '2026-10-17T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zg, 1, t_banco, t_banfield, 0, 9, 'finished', '2026-10-17T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zg, 1, t_banco, t_banfield, 2, 3, 'finished', '2026-10-17T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zg, 1, t_banco, t_banfield, 0, 2, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zg, 1, t_banco, t_banfield, 0, 1, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zg, 1, t_banco, t_banfield, 0, 1, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona G - Fecha 1: General Urquiza vs Once Unidos
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zg, 1, t_urquiza, t_onceunidos, 2, 0, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zg, 1, t_urquiza, t_onceunidos, 0, 2, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zg, 1, t_urquiza, t_onceunidos, 1, 0, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zg, 1, t_urquiza, t_onceunidos, 2, 4, 'finished', '2026-10-17T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zg, 1, t_urquiza, t_onceunidos, 0, 1, 'finished', '2026-10-17T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zg, 1, t_urquiza, t_onceunidos, 0, 3, 'finished', '2026-10-17T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zg, 1, t_urquiza, t_onceunidos, 0, 5, 'finished', '2026-10-17T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zg, 1, t_urquiza, t_onceunidos, 3, 2, 'finished', '2026-10-17T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zg, 1, t_urquiza, t_onceunidos, 1, 0, 'finished', '2026-10-17T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zg, 1, t_urquiza, t_onceunidos, 1, 1, 'finished', '2026-10-17T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zg, 1, t_urquiza, t_onceunidos, 1, 4, 'finished', '2026-10-17T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona G - Fecha 2: Once Unidos vs Banco Provincia
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zg, 2, t_onceunidos, t_banco, 2, 5, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zg, 2, t_onceunidos, t_banco, 3, 1, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zg, 2, t_onceunidos, t_banco, 3, 0, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zg, 2, t_onceunidos, t_banco, 3, 1, 'finished', '2026-10-25T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zg, 2, t_onceunidos, t_banco, 4, 0, 'finished', '2026-10-25T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zg, 2, t_onceunidos, t_banco, 10, 2, 'finished', '2026-10-25T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zg, 2, t_onceunidos, t_banco, 5, 1, 'finished', '2026-10-25T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zg, 2, t_onceunidos, t_banco, 6, 1, 'finished', '2026-10-25T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zg, 2, t_onceunidos, t_banco, 3, 1, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zg, 2, t_onceunidos, t_banco, 1, 0, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zg, 2, t_onceunidos, t_banco, 1, 0, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona G - Fecha 2: Banfield vs General Urquiza
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zg, 2, t_banfield, t_urquiza, 0, 3, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zg, 2, t_banfield, t_urquiza, 8, 0, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zg, 2, t_banfield, t_urquiza, 0, 1, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zg, 2, t_banfield, t_urquiza, 2, 0, 'finished', '2026-10-25T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zg, 2, t_banfield, t_urquiza, 5, 0, 'finished', '2026-10-25T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zg, 2, t_banfield, t_urquiza, 4, 0, 'finished', '2026-10-25T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zg, 2, t_banfield, t_urquiza, 5, 0, 'finished', '2026-10-25T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zg, 2, t_banfield, t_urquiza, 8, 0, 'finished', '2026-10-25T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zg, 2, t_banfield, t_urquiza, 9, 1, 'finished', '2026-10-25T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zg, 2, t_banfield, t_urquiza, 4, 0, 'finished', '2026-10-25T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zg, 2, t_banfield, t_urquiza, 2, 2, 'finished', '2026-10-25T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona G - Fecha 3: Banco Provincia vs General Urquiza
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zg, 3, t_banco, t_urquiza, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zg, 3, t_banco, t_urquiza, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zg, 3, t_banco, t_urquiza, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zg, 3, t_banco, t_urquiza, NULL, NULL, 'scheduled', '2026-11-01T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zg, 3, t_banco, t_urquiza, NULL, NULL, 'scheduled', '2026-11-01T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zg, 3, t_banco, t_urquiza, NULL, NULL, 'scheduled', '2026-11-01T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zg, 3, t_banco, t_urquiza, NULL, NULL, 'scheduled', '2026-11-01T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zg, 3, t_banco, t_urquiza, NULL, NULL, 'scheduled', '2026-11-01T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zg, 3, t_banco, t_urquiza, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zg, 3, t_banco, t_urquiza, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zg, 3, t_banco, t_urquiza, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona G - Fecha 3: Once Unidos vs Banfield
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zg, 3, t_onceunidos, t_banfield, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zg, 3, t_onceunidos, t_banfield, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zg, 3, t_onceunidos, t_banfield, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zg, 3, t_onceunidos, t_banfield, NULL, NULL, 'scheduled', '2026-11-01T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zg, 3, t_onceunidos, t_banfield, NULL, NULL, 'scheduled', '2026-11-01T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zg, 3, t_onceunidos, t_banfield, NULL, NULL, 'scheduled', '2026-11-01T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zg, 3, t_onceunidos, t_banfield, NULL, NULL, 'scheduled', '2026-11-01T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zg, 3, t_onceunidos, t_banfield, NULL, NULL, 'scheduled', '2026-11-01T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zg, 3, t_onceunidos, t_banfield, NULL, NULL, 'scheduled', '2026-11-01T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zg, 3, t_onceunidos, t_banfield, NULL, NULL, 'scheduled', '2026-11-01T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zg, 3, t_onceunidos, t_banfield, NULL, NULL, 'scheduled', '2026-11-01T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona G - Fecha 4: Banfield vs Banco Provincia
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zg, 4, t_banfield, t_banco, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zg, 4, t_banfield, t_banco, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zg, 4, t_banfield, t_banco, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zg, 4, t_banfield, t_banco, NULL, NULL, 'scheduled', '2026-11-08T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zg, 4, t_banfield, t_banco, NULL, NULL, 'scheduled', '2026-11-08T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zg, 4, t_banfield, t_banco, NULL, NULL, 'scheduled', '2026-11-08T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zg, 4, t_banfield, t_banco, NULL, NULL, 'scheduled', '2026-11-08T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zg, 4, t_banfield, t_banco, NULL, NULL, 'scheduled', '2026-11-08T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zg, 4, t_banfield, t_banco, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zg, 4, t_banfield, t_banco, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zg, 4, t_banfield, t_banco, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona G - Fecha 4: Once Unidos vs General Urquiza
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zg, 4, t_onceunidos, t_urquiza, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zg, 4, t_onceunidos, t_urquiza, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zg, 4, t_onceunidos, t_urquiza, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zg, 4, t_onceunidos, t_urquiza, NULL, NULL, 'scheduled', '2026-11-08T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zg, 4, t_onceunidos, t_urquiza, NULL, NULL, 'scheduled', '2026-11-08T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zg, 4, t_onceunidos, t_urquiza, NULL, NULL, 'scheduled', '2026-11-08T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zg, 4, t_onceunidos, t_urquiza, NULL, NULL, 'scheduled', '2026-11-08T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zg, 4, t_onceunidos, t_urquiza, NULL, NULL, 'scheduled', '2026-11-08T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zg, 4, t_onceunidos, t_urquiza, NULL, NULL, 'scheduled', '2026-11-08T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zg, 4, t_onceunidos, t_urquiza, NULL, NULL, 'scheduled', '2026-11-08T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zg, 4, t_onceunidos, t_urquiza, NULL, NULL, 'scheduled', '2026-11-08T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona G - Fecha 5: Banco Provincia vs Once Unidos
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zg, 5, t_banco, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zg, 5, t_banco, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zg, 5, t_banco, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zg, 5, t_banco, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-15T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zg, 5, t_banco, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-15T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zg, 5, t_banco, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-15T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zg, 5, t_banco, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-15T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zg, 5, t_banco, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-15T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zg, 5, t_banco, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zg, 5, t_banco, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zg, 5, t_banco, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona G - Fecha 5: General Urquiza vs Banfield
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zg, 5, t_urquiza, t_banfield, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zg, 5, t_urquiza, t_banfield, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zg, 5, t_urquiza, t_banfield, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zg, 5, t_urquiza, t_banfield, NULL, NULL, 'scheduled', '2026-11-15T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zg, 5, t_urquiza, t_banfield, NULL, NULL, 'scheduled', '2026-11-15T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zg, 5, t_urquiza, t_banfield, NULL, NULL, 'scheduled', '2026-11-15T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zg, 5, t_urquiza, t_banfield, NULL, NULL, 'scheduled', '2026-11-15T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zg, 5, t_urquiza, t_banfield, NULL, NULL, 'scheduled', '2026-11-15T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zg, 5, t_urquiza, t_banfield, NULL, NULL, 'scheduled', '2026-11-15T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zg, 5, t_urquiza, t_banfield, NULL, NULL, 'scheduled', '2026-11-15T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zg, 5, t_urquiza, t_banfield, NULL, NULL, 'scheduled', '2026-11-15T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona G - Fecha 6: General Urquiza vs Banco Provincia
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zg, 6, t_urquiza, t_banco, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zg, 6, t_urquiza, t_banco, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zg, 6, t_urquiza, t_banco, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zg, 6, t_urquiza, t_banco, NULL, NULL, 'scheduled', '2026-11-22T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zg, 6, t_urquiza, t_banco, NULL, NULL, 'scheduled', '2026-11-22T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zg, 6, t_urquiza, t_banco, NULL, NULL, 'scheduled', '2026-11-22T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zg, 6, t_urquiza, t_banco, NULL, NULL, 'scheduled', '2026-11-22T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zg, 6, t_urquiza, t_banco, NULL, NULL, 'scheduled', '2026-11-22T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zg, 6, t_urquiza, t_banco, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zg, 6, t_urquiza, t_banco, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zg, 6, t_urquiza, t_banco, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');

  -- Zona G - Fecha 6: Banfield vs Once Unidos
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d7, v_zg, 6, t_banfield, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d8, v_zg, 6, t_banfield, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d9, v_zg, 6, t_banfield, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d10, v_zg, 6, t_banfield, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-22T12:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d11, v_zg, 6, t_banfield, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-22T13:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d12, v_zg, 6, t_banfield, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-22T14:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d13, v_zg, 6, t_banfield, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-22T15:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d14, v_zg, 6, t_banfield, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-22T16:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d15, v_zg, 6, t_banfield, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-22T09:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d16, v_zg, 6, t_banfield, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-22T10:00:00-03:00'::timestamptz, 'regular');
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, v_d17, v_zg, 6, t_banfield, t_onceunidos, NULL, NULL, 'scheduled', '2026-11-22T11:00:00-03:00'::timestamptz, 'regular');

  RAISE NOTICE '¡Fixture de Torneo Adaro cargado exitosamente en Supabase!';
END $$;

-- =============================================================================
-- VERIFICACIÓN FINAL TRAS EJECUCIÓN
-- =============================================================================
-- SELECT COUNT(*) AS total_partidos FROM public.matches WHERE tournament_id IN (SELECT id FROM public.tournaments WHERE name ILIKE '%adaro%');
-- SELECT round_number, status, count(*) FROM public.matches WHERE tournament_id IN (SELECT id FROM public.tournaments WHERE name ILIKE '%adaro%') GROUP BY round_number, status ORDER BY round_number;
