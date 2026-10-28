-- =============================================================================
-- SEED: Fixture Zona Campeonato - Apertura 2026
-- Aplica a todas las categorías: 7ma División → 16ta División
-- =============================================================================

-- Limpiar datos previos (orden inverso por FKs)
DELETE FROM public.matches;
DELETE FROM public.tournaments;
DELETE FROM public.zones;
DELETE FROM public.teams;
DELETE FROM public.divisions;

-- =============================================================================
-- 1. DIVISIONES (7ma a 16ta)
-- =============================================================================
INSERT INTO public.divisions (id, name, sort_order, is_active) VALUES
  ('11111111-0001-0001-0001-000000000001', '7ma División',   1,  true),
  ('11111111-0001-0001-0001-000000000002', '8va División',   2,  true),
  ('11111111-0001-0001-0001-000000000003', '9na División',   3,  true),
  ('11111111-0001-0001-0001-000000000004', '10ma División',  4,  true),
  ('11111111-0001-0001-0001-000000000005', '11ma División',  5,  true),
  ('11111111-0001-0001-0001-000000000006', '12ma División',  6,  true),
  ('11111111-0001-0001-0001-000000000007', '13ra División',  7,  true),
  ('11111111-0001-0001-0001-000000000008', '14ta División',  8,  true),
  ('11111111-0001-0001-0001-000000000009', '15ta División',  9,  true),
  ('11111111-0001-0001-0001-000000000010', '16ta División',  10, true);

-- =============================================================================
-- 2. ZONAS
-- =============================================================================
INSERT INTO public.zones (id, name) VALUES
  ('22222222-0001-0001-0001-000000000001', 'Campeonato'),
  ('22222222-0001-0001-0001-000000000002', 'Promoción');

-- =============================================================================
-- 3. TORNEOS
-- =============================================================================
INSERT INTO public.tournaments (id, name, year, is_current) VALUES
  ('33333333-0001-0001-0001-000000000001', 'Anual', 2026, true),
  ('33333333-0001-0001-0001-000000000002', 'Anual', 2025, false);

-- =============================================================================
-- 4. EQUIPOS - ZONA CAMPEONATO
-- =============================================================================
INSERT INTO public.teams (id, name, display_name, logo_url) VALUES
  ('44444444-0001-0001-0001-000000000001', 'Talleres de Mar del Plata', 'Talleres', '/logos/talleres.png'),
  ('44444444-0001-0001-0001-000000000002', 'Deportivo Norte', NULL, '/logos/deportivo_norte.png'),
  ('44444444-0001-0001-0001-000000000003', 'Kimberley', NULL, '/logos/kimberley.png'),
  ('44444444-0001-0001-0001-000000000004', 'Once Unidos', NULL, '/logos/once_unidos.png'),
  ('44444444-0001-0001-0001-000000000005', 'Aldosivi', NULL, '/logos/aldosivi.png'),
  ('44444444-0001-0001-0001-000000000006', 'Banfield', NULL, '/logos/banfield.png'),
  ('44444444-0001-0001-0001-000000000007', 'Atlético Mar del Plata', NULL, '/logos/atletico_mar_del_plata.png'),
  ('44444444-0001-0001-0001-000000000008', 'Argentinos del Sud', NULL, '/logos/argentinos_del_sud.png'),
  ('44444444-0001-0001-0001-000000000009', 'Independiente', NULL, '/logos/independiente.png'),
  ('44444444-0001-0001-0001-000000000010', 'River Plate', NULL, '/logos/river_plate.png'),
  ('44444444-0001-0001-0001-000000000011', 'Cadetes', NULL, '/logos/cadetes.png'),
  ('44444444-0001-0001-0001-000000000012', 'Nacion', NULL, '/logos/nacion.png'),
  ('44444444-0001-0001-0001-000000000013', 'Alvarado', NULL, '/logos/alvarado.png'),
  ('44444444-0001-0001-0001-000000000014', 'Quilmes', NULL, '/logos/quilmes.png');

-- =============================================================================
-- 5. EQUIPOS - ZONA PROMOCIÓN
-- =============================================================================
INSERT INTO public.teams (id, name, display_name, logo_url) VALUES
  ('55555555-0001-0001-0001-000000000001', 'Boca Juniors', NULL, '/logos/boca_juniors.png'),
  ('55555555-0001-0001-0001-000000000002', 'Libertad', NULL, '/logos/libertad.png'),
  ('55555555-0001-0001-0001-000000000003', 'Circulo Deportivo', NULL, '/logos/circulo_deportivo.png'),
  ('55555555-0001-0001-0001-000000000004', 'San Lorenzo', NULL, '/logos/san_lorenzo.png'),
  ('55555555-0001-0001-0001-000000000005', 'General Urquiza', NULL, '/logos/general_urquiza.png'),
  ('55555555-0001-0001-0001-000000000006', 'El cañon', 'El Cañón', '/logos/el_canon.png'),
  ('55555555-0001-0001-0001-000000000007', 'Almagro Florida', NULL, '/logos/almagro_florida.png'),
  ('55555555-0001-0001-0001-000000000008', 'Al Ver Veras', NULL, '/logos/al_ver_veras.png'),
  ('55555555-0001-0001-0001-000000000009', 'Colegiales/Siciliano', NULL, '/logos/colegiales_el_siciliano.png'),
  ('55555555-0001-0001-0001-000000000010', 'Club Banco Provincia de Mar del Plata', 'Banco Provincia', '/logos/banco_provincia.png'),
  ('55555555-0001-0001-0001-000000000011', 'Club Social y Deportivo Chapadmalal', 'Chapadmalal', '/logos/chapadmalal.png'),
  ('55555555-0001-0001-0001-000000000012', 'San José', NULL, '/logos/san_jose.png'),
  ('55555555-0001-0001-0001-000000000013', 'Racing', NULL, '/logos/racing.png'),
  ('55555555-0001-0001-0001-000000000014', 'San Isidro', NULL, '/logos/san_isidro.png');

-- =============================================================================
-- 6. USUARIOS
-- =============================================================================
DELETE FROM public.users;
SELECT public.create_user('superadmin', 'SuperSecret123!', 'super_admin');
SELECT public.create_user('editor', 'Editor123!', 'editor');

-- =============================================================================
-- 6. FIXTURE ZONA CAMPEONATO - APERTURA 2026
-- Se inserta el mismo fixture para cada división (7ma → 16ta)
-- Abreviación → UUID:
--   TALLERES      = 44444444-...-01
--   DVO NORTE     = 44444444-...-02
--   KIMBERLEY     = 44444444-...-03
--   ONCE UNIDOS   = 44444444-...-04
--   ALDOSIVI      = 44444444-...-05
--   BANFIELD      = 44444444-...-06
--   MAR DEL PLATA = 44444444-...-07
--   ARG. DEL SUD  = 44444444-...-08
--   INDEPENDIENTE = 44444444-...-09
--   RIVER PLATE   = 44444444-...-10
--   CADETES       = 44444444-...-11
--   NACION        = 44444444-...-12
--   ALVARADO      = 44444444-...-13
--   QUILMES       = 44444444-...-14
-- =============================================================================

-- Shorthand para claridad
DO $$
DECLARE
  -- Zona Campeonato
  z_camp UUID := '22222222-0001-0001-0001-000000000001';
  -- Torneo Apertura 2026
  t_ap UUID   := '33333333-0001-0001-0001-000000000001';

  -- Equipos campeonato
  e01 UUID := '44444444-0001-0001-0001-000000000001'; -- Talleres
  e02 UUID := '44444444-0001-0001-0001-000000000002'; -- Deportivo Norte
  e03 UUID := '44444444-0001-0001-0001-000000000003'; -- Kimberley
  e04 UUID := '44444444-0001-0001-0001-000000000004'; -- Once Unidos
  e05 UUID := '44444444-0001-0001-0001-000000000005'; -- Aldosivi
  e06 UUID := '44444444-0001-0001-0001-000000000006'; -- Banfield
  e07 UUID := '44444444-0001-0001-0001-000000000007'; -- Atlético MdP
  e08 UUID := '44444444-0001-0001-0001-000000000008'; -- Argentinos del Sud
  e09 UUID := '44444444-0001-0001-0001-000000000009'; -- Independiente
  e10 UUID := '44444444-0001-0001-0001-000000000010'; -- River Plate
  e11 UUID := '44444444-0001-0001-0001-000000000011'; -- Cadetes
  e12 UUID := '44444444-0001-0001-0001-000000000012'; -- Nacion
  e13 UUID := '44444444-0001-0001-0001-000000000013'; -- Alvarado
  e14 UUID := '44444444-0001-0001-0001-000000000014'; -- Quilmes

  -- Divisiones
  div UUID;
  divs UUID[] := ARRAY[
    '11111111-0001-0001-0001-000000000001'::UUID,
    '11111111-0001-0001-0001-000000000002'::UUID,
    '11111111-0001-0001-0001-000000000003'::UUID,
    '11111111-0001-0001-0001-000000000004'::UUID,
    '11111111-0001-0001-0001-000000000005'::UUID,
    '11111111-0001-0001-0001-000000000006'::UUID,
    '11111111-0001-0001-0001-000000000007'::UUID,
    '11111111-0001-0001-0001-000000000008'::UUID,
    '11111111-0001-0001-0001-000000000009'::UUID,
    '11111111-0001-0001-0001-000000000010'::UUID
  ];

BEGIN
  FOREACH div IN ARRAY divs LOOP

    -- ── PRIMERA FECHA ───────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_camp, 1, e01, e02, 'scheduled'),  -- TALLERES vs DVO NORTE
      (t_ap, div, z_camp, 1, e03, e04, 'scheduled'),  -- KIMBERLEY vs ONCE UNIDOS
      (t_ap, div, z_camp, 1, e05, e06, 'scheduled'),  -- ALDOSIVI vs BANFIELD
      (t_ap, div, z_camp, 1, e07, e08, 'scheduled'),  -- MAR DEL PLATA vs ARG. DEL SUD
      (t_ap, div, z_camp, 1, e09, e10, 'scheduled'),  -- INDEPENDIENTE vs RIVER PLATE
      (t_ap, div, z_camp, 1, e11, e12, 'scheduled'),  -- CADETES vs NACION
      (t_ap, div, z_camp, 1, e13, e14, 'scheduled');  -- ALVARADO vs QUILMES

    -- ── SEGUNDA FECHA ──────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_camp, 2, e13, e01, 'scheduled'),  -- ALVARADO vs TALLERES
      (t_ap, div, z_camp, 2, e14, e11, 'scheduled'),  -- QUILMES vs CADETES
      (t_ap, div, z_camp, 2, e12, e09, 'scheduled'),  -- NACION vs INDEPENDIENTE
      (t_ap, div, z_camp, 2, e10, e07, 'scheduled'),  -- RIVER PLATE vs MAR DEL PLATA
      (t_ap, div, z_camp, 2, e08, e05, 'scheduled'),  -- ARG. DEL SUD vs ALDOSIVI
      (t_ap, div, z_camp, 2, e06, e03, 'scheduled'),  -- BANFIELD vs KIMBERLEY
      (t_ap, div, z_camp, 2, e04, e02, 'scheduled');  -- ONCE UNIDOS vs DVO NORTE

    -- ── TERCERA FECHA ──────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_camp, 3, e01, e04, 'scheduled'),  -- TALLERES vs ONCE UNIDOS
      (t_ap, div, z_camp, 3, e02, e06, 'scheduled'),  -- DVO NORTE vs BANFIELD
      (t_ap, div, z_camp, 3, e03, e08, 'scheduled'),  -- KIMBERLEY vs ARG. DEL SUD
      (t_ap, div, z_camp, 3, e05, e10, 'scheduled'),  -- ALDOSIVI vs RIVER PLATE
      (t_ap, div, z_camp, 3, e07, e12, 'scheduled'),  -- MAR DEL PLATA vs NACION
      (t_ap, div, z_camp, 3, e09, e14, 'scheduled'),  -- INDEPENDIENTE vs QUILMES
      (t_ap, div, z_camp, 3, e11, e13, 'scheduled');  -- CADETES vs ALVARADO

    -- ── CUARTA FECHA ───────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_camp, 4, e11, e01, 'scheduled'),  -- CADETES vs TALLERES
      (t_ap, div, z_camp, 4, e13, e09, 'scheduled'),  -- ALVARADO vs INDEPENDIENTE
      (t_ap, div, z_camp, 4, e14, e07, 'scheduled'),  -- QUILMES vs MAR DEL PLATA
      (t_ap, div, z_camp, 4, e12, e05, 'scheduled'),  -- NACION vs ALDOSIVI
      (t_ap, div, z_camp, 4, e10, e03, 'scheduled'),  -- RIVER PLATE vs KIMBERLEY
      (t_ap, div, z_camp, 4, e08, e02, 'scheduled'),  -- ARG. DEL SUD vs DVO NORTE
      (t_ap, div, z_camp, 4, e06, e04, 'scheduled');  -- BANFIELD vs ONCE UNIDOS

    -- ── QUINTA FECHA ───────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_camp, 5, e01, e06, 'scheduled'),  -- TALLERES vs BANFIELD
      (t_ap, div, z_camp, 5, e04, e08, 'scheduled'),  -- ONCE UNIDOS vs ARG. DEL SUD
      (t_ap, div, z_camp, 5, e02, e10, 'scheduled'),  -- DVO NORTE vs RIVER PLATE
      (t_ap, div, z_camp, 5, e03, e12, 'scheduled'),  -- KIMBERLEY vs NACION
      (t_ap, div, z_camp, 5, e05, e14, 'scheduled'),  -- ALDOSIVI vs QUILMES
      (t_ap, div, z_camp, 5, e07, e13, 'scheduled'),  -- MAR DEL PLATA vs ALVARADO
      (t_ap, div, z_camp, 5, e09, e11, 'scheduled');  -- INDEPENDIENTE vs CADETES

    -- ── SEXTA FECHA ────────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_camp, 6, e09, e01, 'scheduled'),  -- INDEPENDIENTE vs TALLERES
      (t_ap, div, z_camp, 6, e11, e07, 'scheduled'),  -- CADETES vs MAR DEL PLATA
      (t_ap, div, z_camp, 6, e13, e05, 'scheduled'),  -- ALVARADO vs ALDOSIVI
      (t_ap, div, z_camp, 6, e14, e03, 'scheduled'),  -- QUILMES vs KIMBERLEY
      (t_ap, div, z_camp, 6, e12, e02, 'scheduled'),  -- NACION vs DVO NORTE
      (t_ap, div, z_camp, 6, e10, e04, 'scheduled'),  -- RIVER PLATE vs ONCE UNIDOS
      (t_ap, div, z_camp, 6, e08, e06, 'scheduled');  -- ARG. DEL SUD vs BANFIELD

    -- ── SÉPTIMA FECHA ──────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_camp, 7, e01, e08, 'scheduled'),  -- TALLERES vs ARG. DEL SUD
      (t_ap, div, z_camp, 7, e06, e10, 'scheduled'),  -- BANFIELD vs RIVER PLATE
      (t_ap, div, z_camp, 7, e04, e12, 'scheduled'),  -- ONCE UNIDOS vs NACION
      (t_ap, div, z_camp, 7, e02, e14, 'scheduled'),  -- DVO NORTE vs QUILMES
      (t_ap, div, z_camp, 7, e03, e13, 'scheduled'),  -- KIMBERLEY vs ALVARADO
      (t_ap, div, z_camp, 7, e05, e11, 'scheduled'),  -- ALDOSIVI vs CADETES
      (t_ap, div, z_camp, 7, e07, e09, 'scheduled');  -- MAR DEL PLATA vs INDEPENDIENTE

    -- ── OCTAVA FECHA ───────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_camp, 8, e07, e01, 'scheduled'),  -- MAR DEL PLATA vs TALLERES
      (t_ap, div, z_camp, 8, e09, e05, 'scheduled'),  -- INDEPENDIENTE vs ALDOSIVI
      (t_ap, div, z_camp, 8, e11, e03, 'scheduled'),  -- CADETES vs KIMBERLEY
      (t_ap, div, z_camp, 8, e13, e02, 'scheduled'),  -- ALVARADO vs DVO NORTE
      (t_ap, div, z_camp, 8, e14, e04, 'scheduled'),  -- QUILMES vs ONCE UNIDOS
      (t_ap, div, z_camp, 8, e12, e06, 'scheduled'),  -- NACION vs BANFIELD
      (t_ap, div, z_camp, 8, e10, e08, 'scheduled');  -- RIVER PLATE vs ARG. DEL SUD

    -- ── NOVENA FECHA ───────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_camp, 9, e01, e10, 'scheduled'),  -- TALLERES vs RIVER PLATE
      (t_ap, div, z_camp, 9, e08, e12, 'scheduled'),  -- ARG. DEL SUD vs NACION
      (t_ap, div, z_camp, 9, e06, e14, 'scheduled'),  -- BANFIELD vs QUILMES
      (t_ap, div, z_camp, 9, e04, e13, 'scheduled'),  -- ONCE UNIDOS vs ALVARADO
      (t_ap, div, z_camp, 9, e02, e11, 'scheduled'),  -- DVO NORTE vs CADETES
      (t_ap, div, z_camp, 9, e03, e09, 'scheduled'),  -- KIMBERLEY vs INDEPENDIENTE
      (t_ap, div, z_camp, 9, e05, e07, 'scheduled');  -- ALDOSIVI vs MAR DEL PLATA

    -- ── DÉCIMA FECHA ───────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_camp, 10, e05, e01, 'scheduled'), -- ALDOSIVI vs TALLERES
      (t_ap, div, z_camp, 10, e07, e03, 'scheduled'), -- MAR DEL PLATA vs KIMBERLEY
      (t_ap, div, z_camp, 10, e09, e02, 'scheduled'), -- INDEPENDIENTE vs DVO NORTE
      (t_ap, div, z_camp, 10, e11, e04, 'scheduled'), -- CADETES vs ONCE UNIDOS
      (t_ap, div, z_camp, 10, e13, e06, 'scheduled'), -- ALVARADO vs BANFIELD
      (t_ap, div, z_camp, 10, e14, e08, 'scheduled'), -- QUILMES vs ARG. DEL SUD
      (t_ap, div, z_camp, 10, e12, e10, 'scheduled'); -- NACION vs RIVER PLATE

    -- ── DECIMOPRIMERA FECHA ────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_camp, 11, e01, e12, 'scheduled'), -- TALLERES vs NACION
      (t_ap, div, z_camp, 11, e10, e14, 'scheduled'), -- RIVER PLATE vs QUILMES
      (t_ap, div, z_camp, 11, e08, e13, 'scheduled'), -- ARG. DEL SUD vs ALVARADO
      (t_ap, div, z_camp, 11, e06, e11, 'scheduled'), -- BANFIELD vs CADETES
      (t_ap, div, z_camp, 11, e04, e09, 'scheduled'), -- ONCE UNIDOS vs INDEPENDIENTE
      (t_ap, div, z_camp, 11, e02, e07, 'scheduled'), -- DVO NORTE vs MAR DEL PLATA
      (t_ap, div, z_camp, 11, e03, e05, 'scheduled'); -- KIMBERLEY vs ALDOSIVI

    -- ── DECIMOSEGUNDA FECHA ────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_camp, 12, e03, e01, 'scheduled'), -- KIMBERLEY vs TALLERES
      (t_ap, div, z_camp, 12, e05, e02, 'scheduled'), -- ALDOSIVI vs DVO NORTE
      (t_ap, div, z_camp, 12, e07, e04, 'scheduled'), -- MAR DEL PLATA vs ONCE UNIDOS
      (t_ap, div, z_camp, 12, e09, e06, 'scheduled'), -- INDEPENDIENTE vs BANFIELD
      (t_ap, div, z_camp, 12, e11, e08, 'scheduled'), -- CADETES vs ARG. DEL SUD
      (t_ap, div, z_camp, 12, e13, e10, 'scheduled'), -- ALVARADO vs RIVER PLATE
      (t_ap, div, z_camp, 12, e14, e12, 'scheduled'); -- QUILMES vs NACION

    -- ── DECIMOTERCERA FECHA ────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_camp, 13, e01, e14, 'scheduled'), -- TALLERES vs QUILMES
      (t_ap, div, z_camp, 13, e12, e13, 'scheduled'), -- NACION vs ALVARADO
      (t_ap, div, z_camp, 13, e10, e11, 'scheduled'), -- RIVER PLATE vs CADETES
      (t_ap, div, z_camp, 13, e08, e09, 'scheduled'), -- ARG. DEL SUD vs INDEPENDIENTE
      (t_ap, div, z_camp, 13, e06, e07, 'scheduled'), -- BANFIELD vs MAR DEL PLATA
      (t_ap, div, z_camp, 13, e04, e05, 'scheduled'), -- ONCE UNIDOS vs ALDOSIVI
      (t_ap, div, z_camp, 13, e02, e03, 'scheduled'); -- DVO NORTE vs KIMBERLEY

  END LOOP;
END $$;

-- =============================================================================
-- 7. FIXTURE ZONA PROMOCIÓN - APERTURA 2026
-- Se inserta el mismo fixture para cada división (7ma → 16ta)
-- =============================================================================
DO $$
DECLARE
  -- Zona Promoción
  z_prom UUID := '22222222-0001-0001-0001-000000000002';
  -- Torneo Apertura 2026
  t_ap UUID   := '33333333-0001-0001-0001-000000000001';

  -- Equipos promoción
  p01 UUID := '55555555-0001-0001-0001-000000000001'; -- Boca Juniors
  p02 UUID := '55555555-0001-0001-0001-000000000002'; -- Libertad
  p03 UUID := '55555555-0001-0001-0001-000000000003'; -- Circulo Deportivo
  p04 UUID := '55555555-0001-0001-0001-000000000004'; -- San Lorenzo
  p05 UUID := '55555555-0001-0001-0001-000000000005'; -- General Urquiza
  p06 UUID := '55555555-0001-0001-0001-000000000006'; -- El cañon
  p07 UUID := '55555555-0001-0001-0001-000000000007'; -- Almagro Florida
  p08 UUID := '55555555-0001-0001-0001-000000000008'; -- Al Ver Veras
  p09 UUID := '55555555-0001-0001-0001-000000000009'; -- Colegiales/Siciliano
  p10 UUID := '55555555-0001-0001-0001-000000000010'; -- Club Banco Provincia de Mar del Plata
  p11 UUID := '55555555-0001-0001-0001-000000000011'; -- Club Social y Deportivo Chapadmalal
  p12 UUID := '55555555-0001-0001-0001-000000000012'; -- San José
  p13 UUID := '55555555-0001-0001-0001-000000000013'; -- Racing
  p14 UUID := '55555555-0001-0001-0001-000000000014'; -- San Isidro

  -- Divisiones
  div UUID;
  divs UUID[] := ARRAY[
    '11111111-0001-0001-0001-000000000001'::UUID,
    '11111111-0001-0001-0001-000000000002'::UUID,
    '11111111-0001-0001-0001-000000000003'::UUID,
    '11111111-0001-0001-0001-000000000004'::UUID,
    '11111111-0001-0001-0001-000000000005'::UUID,
    '11111111-0001-0001-0001-000000000006'::UUID,
    '11111111-0001-0001-0001-000000000007'::UUID,
    '11111111-0001-0001-0001-000000000008'::UUID,
    '11111111-0001-0001-0001-000000000009'::UUID,
    '11111111-0001-0001-0001-000000000010'::UUID
  ];

BEGIN
  FOREACH div IN ARRAY divs LOOP

    -- ── PRIMERA FECHA ───────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_prom, 1, p01, p02, 'scheduled'),  -- BOCA JRS vs LIBERTAD
      (t_ap, div, z_prom, 1, p03, p04, 'scheduled'),  -- CIRCULO DVO vs SAN LORENZO
      (t_ap, div, z_prom, 1, p05, p06, 'scheduled'),  -- GRAL. URQUIZA vs EL CAÑON
      (t_ap, div, z_prom, 1, p07, p08, 'scheduled'),  -- ALM. FLORIDA vs AL VER VERAS
      (t_ap, div, z_prom, 1, p09, p10, 'scheduled'),  -- COLEGIALES vs BANCO PROVINCIA
      (t_ap, div, z_prom, 1, p11, p12, 'scheduled'),  -- CHAPADMALAL vs SAN JOSE
      (t_ap, div, z_prom, 1, p13, p14, 'scheduled');  -- RACING vs SAN ISIDRO

    -- ── SEGUNDA FECHA ──────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_prom, 2, p13, p01, 'scheduled'),  -- RACING vs BOCA JRS
      (t_ap, div, z_prom, 2, p14, p11, 'scheduled'),  -- SAN ISIDRO vs CHAPADMALAL
      (t_ap, div, z_prom, 2, p12, p09, 'scheduled'),  -- SAN JOSE vs COLEGIALES
      (t_ap, div, z_prom, 2, p10, p07, 'scheduled'),  -- BANCO PROVINCIA vs ALM. FLORIDA
      (t_ap, div, z_prom, 2, p08, p05, 'scheduled'),  -- AL VER VERAS vs GRAL. URQUIZA
      (t_ap, div, z_prom, 2, p06, p03, 'scheduled'),  -- EL CAÑON vs CIRCULO DVO
      (t_ap, div, z_prom, 2, p04, p02, 'scheduled');  -- SAN LORENZO vs LIBERTAD

    -- ── TERCERA FECHA ──────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_prom, 3, p01, p04, 'scheduled'),  -- BOCA JRS vs SAN LORENZO
      (t_ap, div, z_prom, 3, p02, p06, 'scheduled'),  -- LIBERTAD vs EL CAÑON
      (t_ap, div, z_prom, 3, p03, p08, 'scheduled'),  -- CIRCULO DVO vs AL VER VERAS
      (t_ap, div, z_prom, 3, p05, p10, 'scheduled'),  -- GRAL. URQUIZA vs BANCO PROVINCIA
      (t_ap, div, z_prom, 3, p07, p12, 'scheduled'),  -- ALM. FLORIDA vs SAN JOSE
      (t_ap, div, z_prom, 3, p09, p14, 'scheduled'),  -- COLEGIALES vs SAN ISIDRO
      (t_ap, div, z_prom, 3, p11, p13, 'scheduled');  -- CHAPADMALAL vs RACING

    -- ── CUARTA FECHA ───────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_prom, 4, p11, p01, 'scheduled'),  -- CHAPADMALAL vs BOCA JRS
      (t_ap, div, z_prom, 4, p13, p09, 'scheduled'),  -- RACING vs COLEGIALES
      (t_ap, div, z_prom, 4, p14, p07, 'scheduled'),  -- SAN ISIDRO vs ALM. FLORIDA
      (t_ap, div, z_prom, 4, p12, p05, 'scheduled'),  -- SAN JOSE vs GRAL. URQUIZA
      (t_ap, div, z_prom, 4, p10, p03, 'scheduled'),  -- BANCO PROVINCIA vs CIRCULO DVO
      (t_ap, div, z_prom, 4, p08, p02, 'scheduled'),  -- AL VER VERAS vs LIBERTAD
      (t_ap, div, z_prom, 4, p06, p04, 'scheduled');  -- EL CAÑON vs SAN LORENZO

    -- ── QUINTA FECHA ───────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_prom, 5, p01, p06, 'scheduled'),  -- BOCA JRS vs EL CAÑON
      (t_ap, div, z_prom, 5, p04, p08, 'scheduled'),  -- SAN LORENZO vs AL VER VERAS
      (t_ap, div, z_prom, 5, p02, p10, 'scheduled'),  -- LIBERTAD vs BANCO PROVINCIA
      (t_ap, div, z_prom, 5, p03, p12, 'scheduled'),  -- CIRCULO DVO vs SAN JOSE
      (t_ap, div, z_prom, 5, p05, p14, 'scheduled'),  -- GRAL. URQUIZA vs SAN ISIDRO
      (t_ap, div, z_prom, 5, p07, p13, 'scheduled'),  -- ALM. FLORIDA vs RACING
      (t_ap, div, z_prom, 5, p09, p11, 'scheduled');  -- COLEGIALES vs CHAPADMALAL

    -- ── SEXTA FECHA ────────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_prom, 6, p09, p01, 'scheduled'),  -- COLEGIALES vs BOCA JRS
      (t_ap, div, z_prom, 6, p11, p07, 'scheduled'),  -- CHAPADMALAL vs ALM. FLORIDA
      (t_ap, div, z_prom, 6, p13, p05, 'scheduled'),  -- RACING vs GRAL. URQUIZA
      (t_ap, div, z_prom, 6, p14, p03, 'scheduled'),  -- SAN ISIDRO vs CIRCULO DVO
      (t_ap, div, z_prom, 6, p12, p02, 'scheduled'),  -- SAN JOSE vs LIBERTAD
      (t_ap, div, z_prom, 6, p10, p04, 'scheduled'),  -- BANCO PROVINCIA vs SAN LORENZO
      (t_ap, div, z_prom, 6, p08, p06, 'scheduled');  -- AL VER VERAS vs EL CAÑON

    -- ── SÉPTIMA FECHA ──────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_prom, 7, p01, p08, 'scheduled'),  -- BOCA JRS vs AL VER VERAS
      (t_ap, div, z_prom, 7, p06, p10, 'scheduled'),  -- EL CAÑON vs BANCO PROVINCIA
      (t_ap, div, z_prom, 7, p04, p12, 'scheduled'),  -- SAN LORENZO vs SAN JOSE
      (t_ap, div, z_prom, 7, p02, p14, 'scheduled'),  -- LIBERTAD vs SAN ISIDRO
      (t_ap, div, z_prom, 7, p03, p13, 'scheduled'),  -- CIRCULO DVO vs RACING
      (t_ap, div, z_prom, 7, p05, p11, 'scheduled'),  -- GRAL. URQUIZA vs CHAPADMALAL
      (t_ap, div, z_prom, 7, p07, p09, 'scheduled');  -- ALM. FLORIDA vs COLEGIALES

    -- ── OCTAVA FECHA ───────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_prom, 8, p07, p01, 'scheduled'),  -- ALM. FLORIDA vs BOCA JRS
      (t_ap, div, z_prom, 8, p09, p05, 'scheduled'),  -- COLEGIALES vs GRAL. URQUIZA
      (t_ap, div, z_prom, 8, p11, p03, 'scheduled'),  -- CHAPADMALAL vs CIRCULO DVO
      (t_ap, div, z_prom, 8, p13, p02, 'scheduled'),  -- RACING vs LIBERTAD
      (t_ap, div, z_prom, 8, p14, p04, 'scheduled'),  -- SAN ISIDRO vs SAN LORENZO
      (t_ap, div, z_prom, 8, p12, p06, 'scheduled'),  -- SAN JOSE vs EL CAÑON
      (t_ap, div, z_prom, 8, p10, p08, 'scheduled');  -- BANCO PROVINCIA vs AL VER VERAS

    -- ── NOVENA FECHA ───────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_prom, 9, p01, p10, 'scheduled'),  -- BOCA JRS vs BANCO PROVINCIA
      (t_ap, div, z_prom, 9, p08, p12, 'scheduled'),  -- AL VER VERAS vs SAN JOSE
      (t_ap, div, z_prom, 9, p06, p14, 'scheduled'),  -- EL CAÑON vs SAN ISIDRO
      (t_ap, div, z_prom, 9, p04, p13, 'scheduled'),  -- SAN LORENZO vs RACING
      (t_ap, div, z_prom, 9, p02, p11, 'scheduled'),  -- LIBERTAD vs CHAPADMALAL
      (t_ap, div, z_prom, 9, p03, p09, 'scheduled'),  -- CIRCULO DVO vs COLEGIALES
      (t_ap, div, z_prom, 9, p05, p07, 'scheduled');  -- GRAL. URQUIZA vs ALM. FLORIDA

    -- ── DÉCIMA FECHA ───────────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_prom, 10, p05, p01, 'scheduled'), -- GRAL. URQUIZA vs BOCA JRS
      (t_ap, div, z_prom, 10, p07, p03, 'scheduled'), -- ALM. FLORIDA vs CIRCULO DVO
      (t_ap, div, z_prom, 10, p09, p02, 'scheduled'), -- COLEGIALES vs LIBERTAD
      (t_ap, div, z_prom, 10, p11, p04, 'scheduled'), -- CHAPADMALAL vs SAN LORENZO
      (t_ap, div, z_prom, 10, p13, p06, 'scheduled'), -- RACING vs EL CAÑON
      (t_ap, div, z_prom, 10, p14, p08, 'scheduled'), -- SAN ISIDRO vs AL VER VERAS
      (t_ap, div, z_prom, 10, p12, p10, 'scheduled'); -- SAN JOSE vs BANCO PROVINCIA

    -- ── DECIMOPRIMERA FECHA ────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_prom, 11, p01, p12, 'scheduled'), -- BOCA JRS vs SAN JOSE
      (t_ap, div, z_prom, 11, p10, p14, 'scheduled'), -- BANCO PROVINCIA vs SAN ISIDRO
      (t_ap, div, z_prom, 11, p08, p13, 'scheduled'), -- AL VER VERAS vs RACING
      (t_ap, div, z_prom, 11, p06, p11, 'scheduled'), -- EL CAÑON vs CHAPADMALAL
      (t_ap, div, z_prom, 11, p04, p09, 'scheduled'), -- SAN LORENZO vs COLEGIALES
      (t_ap, div, z_prom, 11, p02, p07, 'scheduled'), -- LIBERTAD vs ALM. FLORIDA
      (t_ap, div, z_prom, 11, p03, p05, 'scheduled'); -- CIRCULO DVO vs GRAL. URQUIZA

    -- ── DECIMOSEGUNDA FECHA ────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_prom, 12, p03, p01, 'scheduled'), -- CIRCULO DVO vs BOCA JRS
      (t_ap, div, z_prom, 12, p05, p02, 'scheduled'), -- GRAL. URQUIZA vs LIBERTAD
      (t_ap, div, z_prom, 12, p07, p04, 'scheduled'), -- ALM. FLORIDA vs SAN LORENZO
      (t_ap, div, z_prom, 12, p09, p06, 'scheduled'), -- COLEGIALES vs EL CAÑON
      (t_ap, div, z_prom, 12, p11, p08, 'scheduled'), -- CHAPADMALAL vs AL VER VERAS
      (t_ap, div, z_prom, 12, p13, p10, 'scheduled'), -- RACING vs BANCO PROVINCIA
      (t_ap, div, z_prom, 12, p14, p12, 'scheduled'); -- SAN ISIDRO vs SAN JOSE

    -- ── DECIMOTERCERA FECHA ────────────────────────────────────────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      (t_ap, div, z_prom, 13, p01, p14, 'scheduled'), -- BOCA JRS vs SAN ISIDRO
      (t_ap, div, z_prom, 13, p12, p13, 'scheduled'), -- SAN JOSE vs RACING
      (t_ap, div, z_prom, 13, p10, p11, 'scheduled'), -- BANCO PROVINCIA vs CHAPADMALAL
      (t_ap, div, z_prom, 13, p08, p09, 'scheduled'), -- AL VER VERAS vs COLEGIALES
      (t_ap, div, z_prom, 13, p06, p07, 'scheduled'), -- EL CAÑON vs ALM. FLORIDA
      (t_ap, div, z_prom, 13, p04, p05, 'scheduled'), -- SAN LORENZO vs GRAL. URQUIZA
      (t_ap, div, z_prom, 13, p02, p03, 'scheduled'); -- LIBERTAD vs CIRCULO DVO

  END LOOP;
END $$;

-- =============================================================================
-- RESULTADOS GENERALES DEL SEED
-- =============================================================================
SELECT 'Fixture de Zona Campeonato y Zona Promoción insertado correctamente.' AS resultado;
SELECT COUNT(*) AS total_partidos_campeonato FROM public.matches WHERE zone_id = '22222222-0001-0001-0001-000000000001';
SELECT COUNT(*) AS total_partidos_promocion FROM public.matches WHERE zone_id = '22222222-0001-0001-0001-000000000002';
SELECT COUNT(*) AS total_partidos_totales FROM public.matches;

