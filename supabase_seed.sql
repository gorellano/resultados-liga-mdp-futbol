
-- =============================================================================
-- SEED DATA FOR LIGA MDP FUTBOL APP
-- This script safely inserts initial data, generating UUIDs and avoiding duplicates.
-- =============================================================================

-- 1. CREATE ADMIN USERS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'superadmin') THEN
        PERFORM public.create_user('superadmin', 'Admin.2026!', 'super_admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'editor') THEN
        PERFORM public.create_user('editor', 'Editor.2026!', 'editor');
    END IF;
END $$;

-- 2. SEED TOURNAMENTS
INSERT INTO public.tournaments (name, year, is_current)
SELECT 'Apertura', 2026, true
WHERE NOT EXISTS (SELECT 1 FROM public.tournaments WHERE name = 'Apertura' AND year = 2026);

-- 3. SEED ZONES
INSERT INTO public.zones (name) SELECT 'Campeonato' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Campeonato');
INSERT INTO public.zones (name) SELECT 'Promoción' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Promoción');

-- 4. SEED DIVISIONS
INSERT INTO public.divisions (name, sort_order) SELECT 'Séptima División', 1 WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Séptima División');
INSERT INTO public.divisions (name, sort_order) SELECT 'Octava División', 2 WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Octava División');
INSERT INTO public.divisions (name, sort_order) SELECT 'Novena División', 3 WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Novena División');

-- 5. SEED TEAMS (Both zones)
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Talleres de Mar del Plata', 'Talleres', '/logos/talleres.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Talleres de Mar del Plata');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Deportivo Norte', NULL, '/logos/deportivo_norte.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Deportivo Norte');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Kimberley', NULL, '/logos/kimberley.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Kimberley');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Once Unidos', NULL, '/logos/once_unidos.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Once Unidos');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Aldosivi', NULL, '/logos/aldosivi.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Aldosivi');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Banfield', NULL, '/logos/banfield.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Banfield');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Atlético Mar del Plata', NULL, '/logos/atletico_mar_del_plata.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Atlético Mar del Plata');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Argentinos del Sud', NULL, '/logos/argentinos_del_sud.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Argentinos del Sud');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Independiente', NULL, '/logos/independiente.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Independiente');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'River Plate', NULL, '/logos/river_plate.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'River Plate');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Cadetes', NULL, '/logos/cadetes.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Cadetes');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Nacion', NULL, '/logos/nacion.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Nacion');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Alvarado', NULL, '/logos/alvarado.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Alvarado');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Quilmes', NULL, '/logos/quilmes.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Quilmes');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Boca Juniors', NULL, '/logos/boca_juniors.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Boca Juniors');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Libertad', NULL, '/logos/libertad.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Libertad');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Circulo Deportivo', NULL, '/logos/circulo_deportivo.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Circulo Deportivo');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'San Lorenzo', NULL, '/logos/san_lorenzo.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'San Lorenzo');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'General Urquiza', NULL, '/logos/general_urquiza.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'General Urquiza');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'El cañon', 'El Cañón', '/logos/el_canon.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'El cañon');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Almagro Florida', NULL, '/logos/almagro_florida.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Almagro Florida');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Al Ver Veras', NULL, '/logos/al_ver_veras.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Al Ver Veras');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Colegiales/Siciliano', NULL, '/logos/colegiales_el_siciliano.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Colegiales/Siciliano');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Club Banco Provincia de Mar del Plata', 'Banco Provincia', '/logos/banco_provincia.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Club Social y Deportivo Chapadmalal', 'Chapadmalal', '/logos/chapadmalal.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Club Social y Deportivo Chapadmalal');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'San José', NULL, '/logos/san_jose.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'San José');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'Racing', NULL, '/logos/racing.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Racing');
INSERT INTO public.teams (name, display_name, logo_url) SELECT 'San Isidro', NULL, '/logos/san_isidro.png' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'San Isidro');


-- 6. SEED MATCHES (FIXTURE)
DO $$
DECLARE
    v_tourn_id uuid;
    v_div_id uuid;
    v_zone_camp uuid;
    v_zone_prom uuid;
    v_div_name text;
BEGIN
    SELECT id INTO v_tourn_id FROM public.tournaments WHERE name = 'Apertura' AND year = 2026 LIMIT 1;
    SELECT id INTO v_zone_camp FROM public.zones WHERE name = 'Campeonato' LIMIT 1;
    SELECT id INTO v_zone_prom FROM public.zones WHERE name = 'Promoción' LIMIT 1;

    -- ONLY PROCEED IF WE HAVEN'T SEEDED MATCHES FOR THIS TOURNAMENT YET
    IF NOT EXISTS (SELECT 1 FROM public.matches WHERE tournament_id = v_tourn_id) THEN

        FOREACH v_div_name IN ARRAY ARRAY['Séptima División', 'Octava División', 'Novena División'] LOOP
            SELECT id INTO v_div_id FROM public.divisions WHERE name = v_div_name LIMIT 1;

            -- INSERT CAMPEONATO
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 1, (SELECT id FROM public.teams WHERE name = 'Talleres de Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Deportivo Norte');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 1, (SELECT id FROM public.teams WHERE name = 'Kimberley'), (SELECT id FROM public.teams WHERE name = 'Once Unidos');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 1, (SELECT id FROM public.teams WHERE name = 'Aldosivi'), (SELECT id FROM public.teams WHERE name = 'Banfield');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 1, (SELECT id FROM public.teams WHERE name = 'Atlético Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Argentinos del Sud');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 1, (SELECT id FROM public.teams WHERE name = 'Independiente'), (SELECT id FROM public.teams WHERE name = 'River Plate');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 1, (SELECT id FROM public.teams WHERE name = 'Cadetes'), (SELECT id FROM public.teams WHERE name = 'Nacion');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 1, (SELECT id FROM public.teams WHERE name = 'Alvarado'), (SELECT id FROM public.teams WHERE name = 'Quilmes');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 2, (SELECT id FROM public.teams WHERE name = 'Alvarado'), (SELECT id FROM public.teams WHERE name = 'Talleres de Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 2, (SELECT id FROM public.teams WHERE name = 'Quilmes'), (SELECT id FROM public.teams WHERE name = 'Cadetes');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 2, (SELECT id FROM public.teams WHERE name = 'Nacion'), (SELECT id FROM public.teams WHERE name = 'Independiente');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 2, (SELECT id FROM public.teams WHERE name = 'River Plate'), (SELECT id FROM public.teams WHERE name = 'Atlético Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 2, (SELECT id FROM public.teams WHERE name = 'Argentinos del Sud'), (SELECT id FROM public.teams WHERE name = 'Aldosivi');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 2, (SELECT id FROM public.teams WHERE name = 'Banfield'), (SELECT id FROM public.teams WHERE name = 'Kimberley');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 2, (SELECT id FROM public.teams WHERE name = 'Once Unidos'), (SELECT id FROM public.teams WHERE name = 'Deportivo Norte');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 3, (SELECT id FROM public.teams WHERE name = 'Talleres de Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Once Unidos');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 3, (SELECT id FROM public.teams WHERE name = 'Deportivo Norte'), (SELECT id FROM public.teams WHERE name = 'Banfield');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 3, (SELECT id FROM public.teams WHERE name = 'Kimberley'), (SELECT id FROM public.teams WHERE name = 'Argentinos del Sud');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 3, (SELECT id FROM public.teams WHERE name = 'Aldosivi'), (SELECT id FROM public.teams WHERE name = 'River Plate');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 3, (SELECT id FROM public.teams WHERE name = 'Atlético Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Nacion');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 3, (SELECT id FROM public.teams WHERE name = 'Independiente'), (SELECT id FROM public.teams WHERE name = 'Quilmes');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 3, (SELECT id FROM public.teams WHERE name = 'Cadetes'), (SELECT id FROM public.teams WHERE name = 'Alvarado');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 4, (SELECT id FROM public.teams WHERE name = 'Cadetes'), (SELECT id FROM public.teams WHERE name = 'Talleres de Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 4, (SELECT id FROM public.teams WHERE name = 'Alvarado'), (SELECT id FROM public.teams WHERE name = 'Independiente');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 4, (SELECT id FROM public.teams WHERE name = 'Quilmes'), (SELECT id FROM public.teams WHERE name = 'Atlético Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 4, (SELECT id FROM public.teams WHERE name = 'Nacion'), (SELECT id FROM public.teams WHERE name = 'Aldosivi');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 4, (SELECT id FROM public.teams WHERE name = 'River Plate'), (SELECT id FROM public.teams WHERE name = 'Kimberley');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 4, (SELECT id FROM public.teams WHERE name = 'Argentinos del Sud'), (SELECT id FROM public.teams WHERE name = 'Deportivo Norte');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 4, (SELECT id FROM public.teams WHERE name = 'Banfield'), (SELECT id FROM public.teams WHERE name = 'Once Unidos');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 5, (SELECT id FROM public.teams WHERE name = 'Talleres de Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Banfield');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 5, (SELECT id FROM public.teams WHERE name = 'Once Unidos'), (SELECT id FROM public.teams WHERE name = 'Argentinos del Sud');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 5, (SELECT id FROM public.teams WHERE name = 'Deportivo Norte'), (SELECT id FROM public.teams WHERE name = 'River Plate');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 5, (SELECT id FROM public.teams WHERE name = 'Kimberley'), (SELECT id FROM public.teams WHERE name = 'Nacion');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 5, (SELECT id FROM public.teams WHERE name = 'Aldosivi'), (SELECT id FROM public.teams WHERE name = 'Quilmes');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 5, (SELECT id FROM public.teams WHERE name = 'Atlético Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Alvarado');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 5, (SELECT id FROM public.teams WHERE name = 'Independiente'), (SELECT id FROM public.teams WHERE name = 'Cadetes');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 6, (SELECT id FROM public.teams WHERE name = 'Independiente'), (SELECT id FROM public.teams WHERE name = 'Talleres de Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 6, (SELECT id FROM public.teams WHERE name = 'Cadetes'), (SELECT id FROM public.teams WHERE name = 'Atlético Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 6, (SELECT id FROM public.teams WHERE name = 'Alvarado'), (SELECT id FROM public.teams WHERE name = 'Aldosivi');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 6, (SELECT id FROM public.teams WHERE name = 'Quilmes'), (SELECT id FROM public.teams WHERE name = 'Kimberley');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 6, (SELECT id FROM public.teams WHERE name = 'Nacion'), (SELECT id FROM public.teams WHERE name = 'Deportivo Norte');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 6, (SELECT id FROM public.teams WHERE name = 'River Plate'), (SELECT id FROM public.teams WHERE name = 'Once Unidos');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 6, (SELECT id FROM public.teams WHERE name = 'Argentinos del Sud'), (SELECT id FROM public.teams WHERE name = 'Banfield');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 7, (SELECT id FROM public.teams WHERE name = 'Talleres de Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Argentinos del Sud');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 7, (SELECT id FROM public.teams WHERE name = 'Banfield'), (SELECT id FROM public.teams WHERE name = 'River Plate');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 7, (SELECT id FROM public.teams WHERE name = 'Once Unidos'), (SELECT id FROM public.teams WHERE name = 'Nacion');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 7, (SELECT id FROM public.teams WHERE name = 'Deportivo Norte'), (SELECT id FROM public.teams WHERE name = 'Quilmes');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 7, (SELECT id FROM public.teams WHERE name = 'Kimberley'), (SELECT id FROM public.teams WHERE name = 'Alvarado');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 7, (SELECT id FROM public.teams WHERE name = 'Aldosivi'), (SELECT id FROM public.teams WHERE name = 'Cadetes');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 7, (SELECT id FROM public.teams WHERE name = 'Atlético Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Independiente');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 8, (SELECT id FROM public.teams WHERE name = 'Atlético Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Talleres de Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 8, (SELECT id FROM public.teams WHERE name = 'Independiente'), (SELECT id FROM public.teams WHERE name = 'Aldosivi');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 8, (SELECT id FROM public.teams WHERE name = 'Cadetes'), (SELECT id FROM public.teams WHERE name = 'Kimberley');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 8, (SELECT id FROM public.teams WHERE name = 'Alvarado'), (SELECT id FROM public.teams WHERE name = 'Deportivo Norte');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 8, (SELECT id FROM public.teams WHERE name = 'Quilmes'), (SELECT id FROM public.teams WHERE name = 'Once Unidos');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 8, (SELECT id FROM public.teams WHERE name = 'Nacion'), (SELECT id FROM public.teams WHERE name = 'Banfield');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 8, (SELECT id FROM public.teams WHERE name = 'River Plate'), (SELECT id FROM public.teams WHERE name = 'Argentinos del Sud');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 9, (SELECT id FROM public.teams WHERE name = 'Talleres de Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'River Plate');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 9, (SELECT id FROM public.teams WHERE name = 'Argentinos del Sud'), (SELECT id FROM public.teams WHERE name = 'Nacion');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 9, (SELECT id FROM public.teams WHERE name = 'Banfield'), (SELECT id FROM public.teams WHERE name = 'Quilmes');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 9, (SELECT id FROM public.teams WHERE name = 'Once Unidos'), (SELECT id FROM public.teams WHERE name = 'Alvarado');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 9, (SELECT id FROM public.teams WHERE name = 'Deportivo Norte'), (SELECT id FROM public.teams WHERE name = 'Cadetes');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 9, (SELECT id FROM public.teams WHERE name = 'Kimberley'), (SELECT id FROM public.teams WHERE name = 'Independiente');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 9, (SELECT id FROM public.teams WHERE name = 'Aldosivi'), (SELECT id FROM public.teams WHERE name = 'Atlético Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 10, (SELECT id FROM public.teams WHERE name = 'Aldosivi'), (SELECT id FROM public.teams WHERE name = 'Talleres de Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 10, (SELECT id FROM public.teams WHERE name = 'Atlético Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Kimberley');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 10, (SELECT id FROM public.teams WHERE name = 'Independiente'), (SELECT id FROM public.teams WHERE name = 'Deportivo Norte');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 10, (SELECT id FROM public.teams WHERE name = 'Cadetes'), (SELECT id FROM public.teams WHERE name = 'Once Unidos');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 10, (SELECT id FROM public.teams WHERE name = 'Alvarado'), (SELECT id FROM public.teams WHERE name = 'Banfield');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 10, (SELECT id FROM public.teams WHERE name = 'Quilmes'), (SELECT id FROM public.teams WHERE name = 'Argentinos del Sud');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 10, (SELECT id FROM public.teams WHERE name = 'Nacion'), (SELECT id FROM public.teams WHERE name = 'River Plate');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 11, (SELECT id FROM public.teams WHERE name = 'Talleres de Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Nacion');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 11, (SELECT id FROM public.teams WHERE name = 'River Plate'), (SELECT id FROM public.teams WHERE name = 'Quilmes');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 11, (SELECT id FROM public.teams WHERE name = 'Argentinos del Sud'), (SELECT id FROM public.teams WHERE name = 'Alvarado');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 11, (SELECT id FROM public.teams WHERE name = 'Banfield'), (SELECT id FROM public.teams WHERE name = 'Cadetes');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 11, (SELECT id FROM public.teams WHERE name = 'Once Unidos'), (SELECT id FROM public.teams WHERE name = 'Independiente');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 11, (SELECT id FROM public.teams WHERE name = 'Deportivo Norte'), (SELECT id FROM public.teams WHERE name = 'Atlético Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 11, (SELECT id FROM public.teams WHERE name = 'Kimberley'), (SELECT id FROM public.teams WHERE name = 'Aldosivi');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 12, (SELECT id FROM public.teams WHERE name = 'Kimberley'), (SELECT id FROM public.teams WHERE name = 'Talleres de Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 12, (SELECT id FROM public.teams WHERE name = 'Aldosivi'), (SELECT id FROM public.teams WHERE name = 'Deportivo Norte');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 12, (SELECT id FROM public.teams WHERE name = 'Atlético Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Once Unidos');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 12, (SELECT id FROM public.teams WHERE name = 'Independiente'), (SELECT id FROM public.teams WHERE name = 'Banfield');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 12, (SELECT id FROM public.teams WHERE name = 'Cadetes'), (SELECT id FROM public.teams WHERE name = 'Argentinos del Sud');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 12, (SELECT id FROM public.teams WHERE name = 'Alvarado'), (SELECT id FROM public.teams WHERE name = 'River Plate');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 12, (SELECT id FROM public.teams WHERE name = 'Quilmes'), (SELECT id FROM public.teams WHERE name = 'Nacion');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 13, (SELECT id FROM public.teams WHERE name = 'Talleres de Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Quilmes');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 13, (SELECT id FROM public.teams WHERE name = 'Nacion'), (SELECT id FROM public.teams WHERE name = 'Alvarado');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 13, (SELECT id FROM public.teams WHERE name = 'River Plate'), (SELECT id FROM public.teams WHERE name = 'Cadetes');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 13, (SELECT id FROM public.teams WHERE name = 'Argentinos del Sud'), (SELECT id FROM public.teams WHERE name = 'Independiente');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 13, (SELECT id FROM public.teams WHERE name = 'Banfield'), (SELECT id FROM public.teams WHERE name = 'Atlético Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 13, (SELECT id FROM public.teams WHERE name = 'Once Unidos'), (SELECT id FROM public.teams WHERE name = 'Aldosivi');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_camp, 13, (SELECT id FROM public.teams WHERE name = 'Deportivo Norte'), (SELECT id FROM public.teams WHERE name = 'Kimberley');

            -- INSERT PROMOCION
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 1, (SELECT id FROM public.teams WHERE name = 'Boca Juniors'), (SELECT id FROM public.teams WHERE name = 'Libertad');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 1, (SELECT id FROM public.teams WHERE name = 'Circulo Deportivo'), (SELECT id FROM public.teams WHERE name = 'San Lorenzo');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 1, (SELECT id FROM public.teams WHERE name = 'General Urquiza'), (SELECT id FROM public.teams WHERE name = 'El cañon');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 1, (SELECT id FROM public.teams WHERE name = 'Almagro Florida'), (SELECT id FROM public.teams WHERE name = 'Al Ver Veras');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 1, (SELECT id FROM public.teams WHERE name = 'Colegiales/Siciliano'), (SELECT id FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 1, (SELECT id FROM public.teams WHERE name = 'Club Social y Deportivo Chapadmalal'), (SELECT id FROM public.teams WHERE name = 'San José');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 1, (SELECT id FROM public.teams WHERE name = 'Racing'), (SELECT id FROM public.teams WHERE name = 'San Isidro');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 2, (SELECT id FROM public.teams WHERE name = 'Racing'), (SELECT id FROM public.teams WHERE name = 'Boca Juniors');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 2, (SELECT id FROM public.teams WHERE name = 'San Isidro'), (SELECT id FROM public.teams WHERE name = 'Club Social y Deportivo Chapadmalal');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 2, (SELECT id FROM public.teams WHERE name = 'San José'), (SELECT id FROM public.teams WHERE name = 'Colegiales/Siciliano');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 2, (SELECT id FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Almagro Florida');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 2, (SELECT id FROM public.teams WHERE name = 'Al Ver Veras'), (SELECT id FROM public.teams WHERE name = 'General Urquiza');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 2, (SELECT id FROM public.teams WHERE name = 'El cañon'), (SELECT id FROM public.teams WHERE name = 'Circulo Deportivo');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 2, (SELECT id FROM public.teams WHERE name = 'San Lorenzo'), (SELECT id FROM public.teams WHERE name = 'Libertad');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 3, (SELECT id FROM public.teams WHERE name = 'Boca Juniors'), (SELECT id FROM public.teams WHERE name = 'San Lorenzo');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 3, (SELECT id FROM public.teams WHERE name = 'Libertad'), (SELECT id FROM public.teams WHERE name = 'El cañon');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 3, (SELECT id FROM public.teams WHERE name = 'Circulo Deportivo'), (SELECT id FROM public.teams WHERE name = 'Al Ver Veras');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 3, (SELECT id FROM public.teams WHERE name = 'General Urquiza'), (SELECT id FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 3, (SELECT id FROM public.teams WHERE name = 'Almagro Florida'), (SELECT id FROM public.teams WHERE name = 'San José');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 3, (SELECT id FROM public.teams WHERE name = 'Colegiales/Siciliano'), (SELECT id FROM public.teams WHERE name = 'San Isidro');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 3, (SELECT id FROM public.teams WHERE name = 'Club Social y Deportivo Chapadmalal'), (SELECT id FROM public.teams WHERE name = 'Racing');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 4, (SELECT id FROM public.teams WHERE name = 'Club Social y Deportivo Chapadmalal'), (SELECT id FROM public.teams WHERE name = 'Boca Juniors');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 4, (SELECT id FROM public.teams WHERE name = 'Racing'), (SELECT id FROM public.teams WHERE name = 'Colegiales/Siciliano');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 4, (SELECT id FROM public.teams WHERE name = 'San Isidro'), (SELECT id FROM public.teams WHERE name = 'Almagro Florida');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 4, (SELECT id FROM public.teams WHERE name = 'San José'), (SELECT id FROM public.teams WHERE name = 'General Urquiza');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 4, (SELECT id FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Circulo Deportivo');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 4, (SELECT id FROM public.teams WHERE name = 'Al Ver Veras'), (SELECT id FROM public.teams WHERE name = 'Libertad');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 4, (SELECT id FROM public.teams WHERE name = 'El cañon'), (SELECT id FROM public.teams WHERE name = 'San Lorenzo');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 5, (SELECT id FROM public.teams WHERE name = 'Boca Juniors'), (SELECT id FROM public.teams WHERE name = 'El cañon');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 5, (SELECT id FROM public.teams WHERE name = 'San Lorenzo'), (SELECT id FROM public.teams WHERE name = 'Al Ver Veras');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 5, (SELECT id FROM public.teams WHERE name = 'Libertad'), (SELECT id FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 5, (SELECT id FROM public.teams WHERE name = 'Circulo Deportivo'), (SELECT id FROM public.teams WHERE name = 'San José');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 5, (SELECT id FROM public.teams WHERE name = 'General Urquiza'), (SELECT id FROM public.teams WHERE name = 'San Isidro');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 5, (SELECT id FROM public.teams WHERE name = 'Almagro Florida'), (SELECT id FROM public.teams WHERE name = 'Racing');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 5, (SELECT id FROM public.teams WHERE name = 'Colegiales/Siciliano'), (SELECT id FROM public.teams WHERE name = 'Club Social y Deportivo Chapadmalal');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 6, (SELECT id FROM public.teams WHERE name = 'Colegiales/Siciliano'), (SELECT id FROM public.teams WHERE name = 'Boca Juniors');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 6, (SELECT id FROM public.teams WHERE name = 'Club Social y Deportivo Chapadmalal'), (SELECT id FROM public.teams WHERE name = 'Almagro Florida');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 6, (SELECT id FROM public.teams WHERE name = 'Racing'), (SELECT id FROM public.teams WHERE name = 'General Urquiza');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 6, (SELECT id FROM public.teams WHERE name = 'San Isidro'), (SELECT id FROM public.teams WHERE name = 'Circulo Deportivo');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 6, (SELECT id FROM public.teams WHERE name = 'San José'), (SELECT id FROM public.teams WHERE name = 'Libertad');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 6, (SELECT id FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'San Lorenzo');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 6, (SELECT id FROM public.teams WHERE name = 'Al Ver Veras'), (SELECT id FROM public.teams WHERE name = 'El cañon');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 7, (SELECT id FROM public.teams WHERE name = 'Boca Juniors'), (SELECT id FROM public.teams WHERE name = 'Al Ver Veras');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 7, (SELECT id FROM public.teams WHERE name = 'El cañon'), (SELECT id FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 7, (SELECT id FROM public.teams WHERE name = 'San Lorenzo'), (SELECT id FROM public.teams WHERE name = 'San José');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 7, (SELECT id FROM public.teams WHERE name = 'Libertad'), (SELECT id FROM public.teams WHERE name = 'San Isidro');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 7, (SELECT id FROM public.teams WHERE name = 'Circulo Deportivo'), (SELECT id FROM public.teams WHERE name = 'Racing');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 7, (SELECT id FROM public.teams WHERE name = 'General Urquiza'), (SELECT id FROM public.teams WHERE name = 'Club Social y Deportivo Chapadmalal');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 7, (SELECT id FROM public.teams WHERE name = 'Almagro Florida'), (SELECT id FROM public.teams WHERE name = 'Colegiales/Siciliano');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 8, (SELECT id FROM public.teams WHERE name = 'Almagro Florida'), (SELECT id FROM public.teams WHERE name = 'Boca Juniors');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 8, (SELECT id FROM public.teams WHERE name = 'Colegiales/Siciliano'), (SELECT id FROM public.teams WHERE name = 'General Urquiza');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 8, (SELECT id FROM public.teams WHERE name = 'Club Social y Deportivo Chapadmalal'), (SELECT id FROM public.teams WHERE name = 'Circulo Deportivo');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 8, (SELECT id FROM public.teams WHERE name = 'Racing'), (SELECT id FROM public.teams WHERE name = 'Libertad');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 8, (SELECT id FROM public.teams WHERE name = 'San Isidro'), (SELECT id FROM public.teams WHERE name = 'San Lorenzo');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 8, (SELECT id FROM public.teams WHERE name = 'San José'), (SELECT id FROM public.teams WHERE name = 'El cañon');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 8, (SELECT id FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Al Ver Veras');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 9, (SELECT id FROM public.teams WHERE name = 'Boca Juniors'), (SELECT id FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 9, (SELECT id FROM public.teams WHERE name = 'Al Ver Veras'), (SELECT id FROM public.teams WHERE name = 'San José');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 9, (SELECT id FROM public.teams WHERE name = 'El cañon'), (SELECT id FROM public.teams WHERE name = 'San Isidro');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 9, (SELECT id FROM public.teams WHERE name = 'San Lorenzo'), (SELECT id FROM public.teams WHERE name = 'Racing');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 9, (SELECT id FROM public.teams WHERE name = 'Libertad'), (SELECT id FROM public.teams WHERE name = 'Club Social y Deportivo Chapadmalal');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 9, (SELECT id FROM public.teams WHERE name = 'Circulo Deportivo'), (SELECT id FROM public.teams WHERE name = 'Colegiales/Siciliano');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 9, (SELECT id FROM public.teams WHERE name = 'General Urquiza'), (SELECT id FROM public.teams WHERE name = 'Almagro Florida');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 10, (SELECT id FROM public.teams WHERE name = 'General Urquiza'), (SELECT id FROM public.teams WHERE name = 'Boca Juniors');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 10, (SELECT id FROM public.teams WHERE name = 'Almagro Florida'), (SELECT id FROM public.teams WHERE name = 'Circulo Deportivo');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 10, (SELECT id FROM public.teams WHERE name = 'Colegiales/Siciliano'), (SELECT id FROM public.teams WHERE name = 'Libertad');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 10, (SELECT id FROM public.teams WHERE name = 'Club Social y Deportivo Chapadmalal'), (SELECT id FROM public.teams WHERE name = 'San Lorenzo');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 10, (SELECT id FROM public.teams WHERE name = 'Racing'), (SELECT id FROM public.teams WHERE name = 'El cañon');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 10, (SELECT id FROM public.teams WHERE name = 'San Isidro'), (SELECT id FROM public.teams WHERE name = 'Al Ver Veras');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 10, (SELECT id FROM public.teams WHERE name = 'San José'), (SELECT id FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 11, (SELECT id FROM public.teams WHERE name = 'Boca Juniors'), (SELECT id FROM public.teams WHERE name = 'San José');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 11, (SELECT id FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'San Isidro');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 11, (SELECT id FROM public.teams WHERE name = 'Al Ver Veras'), (SELECT id FROM public.teams WHERE name = 'Racing');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 11, (SELECT id FROM public.teams WHERE name = 'El cañon'), (SELECT id FROM public.teams WHERE name = 'Club Social y Deportivo Chapadmalal');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 11, (SELECT id FROM public.teams WHERE name = 'San Lorenzo'), (SELECT id FROM public.teams WHERE name = 'Colegiales/Siciliano');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 11, (SELECT id FROM public.teams WHERE name = 'Libertad'), (SELECT id FROM public.teams WHERE name = 'Almagro Florida');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 11, (SELECT id FROM public.teams WHERE name = 'Circulo Deportivo'), (SELECT id FROM public.teams WHERE name = 'General Urquiza');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 12, (SELECT id FROM public.teams WHERE name = 'Circulo Deportivo'), (SELECT id FROM public.teams WHERE name = 'Boca Juniors');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 12, (SELECT id FROM public.teams WHERE name = 'General Urquiza'), (SELECT id FROM public.teams WHERE name = 'Libertad');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 12, (SELECT id FROM public.teams WHERE name = 'Almagro Florida'), (SELECT id FROM public.teams WHERE name = 'San Lorenzo');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 12, (SELECT id FROM public.teams WHERE name = 'Colegiales/Siciliano'), (SELECT id FROM public.teams WHERE name = 'El cañon');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 12, (SELECT id FROM public.teams WHERE name = 'Club Social y Deportivo Chapadmalal'), (SELECT id FROM public.teams WHERE name = 'Al Ver Veras');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 12, (SELECT id FROM public.teams WHERE name = 'Racing'), (SELECT id FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 12, (SELECT id FROM public.teams WHERE name = 'San Isidro'), (SELECT id FROM public.teams WHERE name = 'San José');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 13, (SELECT id FROM public.teams WHERE name = 'Boca Juniors'), (SELECT id FROM public.teams WHERE name = 'San Isidro');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 13, (SELECT id FROM public.teams WHERE name = 'San José'), (SELECT id FROM public.teams WHERE name = 'Racing');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 13, (SELECT id FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata'), (SELECT id FROM public.teams WHERE name = 'Club Social y Deportivo Chapadmalal');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 13, (SELECT id FROM public.teams WHERE name = 'Al Ver Veras'), (SELECT id FROM public.teams WHERE name = 'Colegiales/Siciliano');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 13, (SELECT id FROM public.teams WHERE name = 'El cañon'), (SELECT id FROM public.teams WHERE name = 'Almagro Florida');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 13, (SELECT id FROM public.teams WHERE name = 'San Lorenzo'), (SELECT id FROM public.teams WHERE name = 'General Urquiza');
            INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id)
            SELECT v_tourn_id, v_div_id, v_zone_prom, 13, (SELECT id FROM public.teams WHERE name = 'Libertad'), (SELECT id FROM public.teams WHERE name = 'Circulo Deportivo');

        END LOOP;
    END IF;
END $$;
