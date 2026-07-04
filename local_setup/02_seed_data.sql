-- =============================================================================
-- SCRIPT 02 — DATOS DE EJEMPLO (Seed Local)
-- Incluye: equipos, torneo, zonas, divisiones, fixture de 2 fechas y resultados
-- Ejecutar DESPUÉS de 01_schema.sql
-- =============================================================================

-- =============================================================================
-- 1. USUARIOS ADMIN (password: Admin.2026!)
-- =============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'superadmin') THEN
        PERFORM public.create_user('superadmin', 'Admin.2026!', 'super_admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'editor') THEN
        PERFORM public.create_user('editor', 'Editor.2026!', 'editor');
    END IF;
END $$;

-- =============================================================================
-- 2. TORNEO Y ZONAS
-- =============================================================================
INSERT INTO public.tournaments (name, year, is_current)
SELECT 'Apertura', 2026, true
WHERE NOT EXISTS (SELECT 1 FROM public.tournaments WHERE name = 'Apertura' AND year = 2026);

INSERT INTO public.zones (name)
SELECT 'Campeonato' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Campeonato');

INSERT INTO public.zones (name)
SELECT 'Promoción' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Promoción');

-- =============================================================================
-- 3. EQUIPOS DE EJEMPLO
-- =============================================================================
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Talleres de Mar del Plata', 'Talleres', '/logos/talleres.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Talleres de Mar del Plata');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Kimberley', NULL, '/logos/kimberley.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Kimberley');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Aldosivi', NULL, '/logos/aldosivi.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Aldosivi');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Argentinos del Sud', NULL, '/logos/argentinos_del_sud.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Argentinos del Sud');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Alvarado', NULL, '/logos/alvarado.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Alvarado');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Once Unidos', NULL, '/logos/once_unidos.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Once Unidos');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Deportivo Norte', NULL, '/logos/deportivo_norte.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Deportivo Norte');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'San Lorenzo', NULL, '/logos/san_lorenzo.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'San Lorenzo');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'River Plate', NULL, '/logos/river_plate.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'River Plate');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Independiente', NULL, '/logos/independiente.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Independiente');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Quilmes', NULL, '/logos/quilmes.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Quilmes');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Racing', NULL, '/logos/racing.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Racing');

-- =============================================================================
-- 4. DIVISIONES Y PARTIDOS
-- =============================================================================
DO $$
DECLARE
    v_tourn_id uuid;
    v_zone_camp uuid;
    v_zone_prom uuid;
    v_div_7ma uuid;
    v_div_8va uuid;
    v_div_9na uuid;
    -- equipos
    v_talleres uuid;
    v_kimberley uuid;
    v_aldosivi uuid;
    v_argentinos uuid;
    v_alvarado uuid;
    v_once_unidos uuid;
    v_dep_norte uuid;
    v_san_lorenzo uuid;
    v_river uuid;
    v_independiente uuid;
    v_quilmes uuid;
    v_racing uuid;
BEGIN
    -- IDs base
    SELECT id INTO v_tourn_id FROM public.tournaments WHERE name = 'Apertura' AND year = 2026 LIMIT 1;
    SELECT id INTO v_zone_camp FROM public.zones WHERE name = 'Campeonato' LIMIT 1;
    SELECT id INTO v_zone_prom FROM public.zones WHERE name = 'Promoción' LIMIT 1;

    -- IDs de equipos
    SELECT id INTO v_talleres FROM public.teams WHERE name = 'Talleres de Mar del Plata' LIMIT 1;
    SELECT id INTO v_kimberley FROM public.teams WHERE name = 'Kimberley' LIMIT 1;
    SELECT id INTO v_aldosivi FROM public.teams WHERE name = 'Aldosivi' LIMIT 1;
    SELECT id INTO v_argentinos FROM public.teams WHERE name = 'Argentinos del Sud' LIMIT 1;
    SELECT id INTO v_alvarado FROM public.teams WHERE name = 'Alvarado' LIMIT 1;
    SELECT id INTO v_once_unidos FROM public.teams WHERE name = 'Once Unidos' LIMIT 1;
    SELECT id INTO v_dep_norte FROM public.teams WHERE name = 'Deportivo Norte' LIMIT 1;
    SELECT id INTO v_san_lorenzo FROM public.teams WHERE name = 'San Lorenzo' LIMIT 1;
    SELECT id INTO v_river FROM public.teams WHERE name = 'River Plate' LIMIT 1;
    SELECT id INTO v_independiente FROM public.teams WHERE name = 'Independiente' LIMIT 1;
    SELECT id INTO v_quilmes FROM public.teams WHERE name = 'Quilmes' LIMIT 1;
    SELECT id INTO v_racing FROM public.teams WHERE name = 'Racing' LIMIT 1;

    -- -------------------------------------------------------------------------
    -- SÉPTIMA DIVISIÓN
    -- -------------------------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Séptima División') THEN
        INSERT INTO public.divisions (name, sort_order) VALUES ('Séptima División', 70) RETURNING id INTO v_div_7ma;
    ELSE
        SELECT id INTO v_div_7ma FROM public.divisions WHERE name = 'Séptima División' LIMIT 1;
    END IF;

    -- Fecha 1 — Campeonato (con resultados cargados)
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date)
    SELECT v_tourn_id, v_div_7ma, v_zone_camp, 1, v_talleres, v_kimberley, 2, 1, 'finished', '2026-04-06 15:30:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_7ma AND round_number = 1 AND home_team_id = v_talleres AND away_team_id = v_kimberley);

    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date)
    SELECT v_tourn_id, v_div_7ma, v_zone_camp, 1, v_aldosivi, v_argentinos, 0, 0, 'finished', '2026-04-06 15:30:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_7ma AND round_number = 1 AND home_team_id = v_aldosivi AND away_team_id = v_argentinos);

    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date)
    SELECT v_tourn_id, v_div_7ma, v_zone_camp, 1, v_alvarado, v_once_unidos, 3, 2, 'finished', '2026-04-06 15:30:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_7ma AND round_number = 1 AND home_team_id = v_alvarado AND away_team_id = v_once_unidos);

    -- Fecha 2 — Campeonato (con resultados cargados)
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date)
    SELECT v_tourn_id, v_div_7ma, v_zone_camp, 2, v_kimberley, v_alvarado, 1, 3, 'finished', '2026-04-13 15:30:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_7ma AND round_number = 2 AND home_team_id = v_kimberley AND away_team_id = v_alvarado);

    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date)
    SELECT v_tourn_id, v_div_7ma, v_zone_camp, 2, v_argentinos, v_talleres, 2, 2, 'finished', '2026-04-13 15:30:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_7ma AND round_number = 2 AND home_team_id = v_argentinos AND away_team_id = v_talleres);

    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date)
    SELECT v_tourn_id, v_div_7ma, v_zone_camp, 2, v_once_unidos, v_aldosivi, 1, 0, 'finished', '2026-04-13 15:30:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_7ma AND round_number = 2 AND home_team_id = v_once_unidos AND away_team_id = v_aldosivi);

    -- Fecha 3 — Campeonato (programados)
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
    SELECT v_tourn_id, v_div_7ma, v_zone_camp, 3, v_talleres, v_alvarado, 'scheduled', '2026-04-20 15:30:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_7ma AND round_number = 3 AND home_team_id = v_talleres AND away_team_id = v_alvarado);

    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
    SELECT v_tourn_id, v_div_7ma, v_zone_camp, 3, v_kimberley, v_argentinos, 'scheduled', '2026-04-20 15:30:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_7ma AND round_number = 3 AND home_team_id = v_kimberley AND away_team_id = v_argentinos);

    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
    SELECT v_tourn_id, v_div_7ma, v_zone_camp, 3, v_aldosivi, v_once_unidos, 'scheduled', '2026-04-20 15:30:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_7ma AND round_number = 3 AND home_team_id = v_aldosivi AND away_team_id = v_once_unidos);

    -- -------------------------------------------------------------------------
    -- OCTAVA DIVISIÓN
    -- -------------------------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Octava División') THEN
        INSERT INTO public.divisions (name, sort_order) VALUES ('Octava División', 80) RETURNING id INTO v_div_8va;
    ELSE
        SELECT id INTO v_div_8va FROM public.divisions WHERE name = 'Octava División' LIMIT 1;
    END IF;

    -- Fecha 1 (con resultados)
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date)
    SELECT v_tourn_id, v_div_8va, v_zone_camp, 1, v_dep_norte, v_san_lorenzo, 1, 2, 'finished', '2026-04-06 15:00:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_8va AND round_number = 1 AND home_team_id = v_dep_norte);

    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date)
    SELECT v_tourn_id, v_div_8va, v_zone_camp, 1, v_river, v_independiente, 0, 1, 'finished', '2026-04-06 15:00:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_8va AND round_number = 1 AND home_team_id = v_river);

    -- Fecha 2 (programados)
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
    SELECT v_tourn_id, v_div_8va, v_zone_camp, 2, v_san_lorenzo, v_river, 'scheduled', '2026-04-13 15:00:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_8va AND round_number = 2 AND home_team_id = v_san_lorenzo);

    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
    SELECT v_tourn_id, v_div_8va, v_zone_camp, 2, v_independiente, v_dep_norte, 'scheduled', '2026-04-13 15:00:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_8va AND round_number = 2 AND home_team_id = v_independiente);

    -- -------------------------------------------------------------------------
    -- NOVENA DIVISIÓN
    -- -------------------------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Novena División') THEN
        INSERT INTO public.divisions (name, sort_order) VALUES ('Novena División', 90) RETURNING id INTO v_div_9na;
    ELSE
        SELECT id INTO v_div_9na FROM public.divisions WHERE name = 'Novena División' LIMIT 1;
    END IF;

    -- Fecha 1 (con resultados)
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date)
    SELECT v_tourn_id, v_div_9na, v_zone_camp, 1, v_quilmes, v_racing, 2, 0, 'finished', '2026-04-06 14:30:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_9na AND round_number = 1 AND home_team_id = v_quilmes);

    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date)
    SELECT v_tourn_id, v_div_9na, v_zone_camp, 1, v_talleres, v_river, 1, 1, 'finished', '2026-04-06 14:30:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_9na AND round_number = 1 AND home_team_id = v_talleres);

    -- Fecha 2 (programados)
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
    SELECT v_tourn_id, v_div_9na, v_zone_camp, 2, v_racing, v_talleres, 'scheduled', '2026-04-13 14:30:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_9na AND round_number = 2 AND home_team_id = v_racing);

    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date)
    SELECT v_tourn_id, v_div_9na, v_zone_camp, 2, v_river, v_quilmes, 'scheduled', '2026-04-13 14:30:00-03'
    WHERE NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_9na AND round_number = 2 AND home_team_id = v_river);

END $$;

-- =============================================================================
-- 5. CONFIGURACIÓN DE APP (Feature Flags y textos por defecto)
-- =============================================================================
INSERT INTO public.app_settings (key, value) VALUES ('show_sponsors', 'false') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.app_settings (key, value) VALUES ('send_notifications', 'true') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.app_settings (key, value) VALUES ('notification_title_new', '¡Resultado Cargado!') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.app_settings (key, value) VALUES ('notification_title_edit', '¡Resultado Actualizado!') ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- 6. SPONSOR DE EJEMPLO
-- =============================================================================
INSERT INTO public.sponsors (name, image_url, link_url, display_order, is_active)
SELECT 'Sponsor Demo', 'https://placehold.co/300x100?text=Sponsor', 'https://example.com', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.sponsors WHERE name = 'Sponsor Demo');

-- =============================================================================
-- 7. MENSAJE DE CONTACTO DE EJEMPLO
-- =============================================================================
INSERT INTO public.contact_messages (email, title, body)
SELECT 'test@ejemplo.com', 'Consulta de prueba', 'Este es un mensaje de contacto generado para pruebas en entorno local.'
WHERE NOT EXISTS (SELECT 1 FROM public.contact_messages WHERE email = 'test@ejemplo.com');
