-- =============================================================================
-- SCRIPT MAESTRO COMPLETO Y DEFUTURO - LIGA MARPLATENSE DE FÚTBOL (COSTA Y GOL)
-- =============================================================================
-- Este script crea todas las tablas, relaciones, políticas RLS, torneos,
-- divisiones, zonas, equipos y la primera fecha del Torneo Clausura 2026.
-- Es 100% retrocompatible con las divisiones de 7ma a 16ta.
-- =============================================================================

-- ─── 1. TABLAS PRINCIPALES ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  year integer NOT NULL,
  is_current boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.divisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text,
  logo_url text,
  website_url text,
  instagram_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  division_id uuid NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  zone_id uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  round_number integer NOT NULL,
  home_team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  away_team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  home_goals integer,
  away_goals integer,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'finished', 'postponed')),
  match_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ─── 2. HABILITAR RLS Y POLÍTICAS DE ACCESO ─────────────────────────────────

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Tournaments" ON public.tournaments;
CREATE POLICY "Public Read Tournaments" ON public.tournaments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Divisions" ON public.divisions;
CREATE POLICY "Public Read Divisions" ON public.divisions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Zones" ON public.zones;
CREATE POLICY "Public Read Zones" ON public.zones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Teams" ON public.teams;
CREATE POLICY "Public Read Teams" ON public.teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Matches" ON public.matches;
CREATE POLICY "Public Read Matches" ON public.matches FOR SELECT USING (true);

-- Permisos de escritura anónima / autenticada para permitir edición desde admin dashboard
DROP POLICY IF EXISTS "Enable All Matches" ON public.matches;
CREATE POLICY "Enable All Matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);

-- ─── 3. INSERTAR / ASEGURAR ZONAS ──────────────────────────────────────────

INSERT INTO public.zones (name) VALUES ('Campeonato') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.zones (name) VALUES ('Promoción') ON CONFLICT (name) DO NOTHING;

-- Zonas Primera
INSERT INTO public.zones (name) VALUES ('Zona 1 - Primera') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.zones (name) VALUES ('Zona 2 - Primera') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.zones (name) VALUES ('Zona 3 - Primera') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.zones (name) VALUES ('Eliminatoria - Primera') ON CONFLICT (name) DO NOTHING;

-- Zonas Quinta
INSERT INTO public.zones (name) VALUES ('Zona 1 - Quinta') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.zones (name) VALUES ('Zona 2 - Quinta') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.zones (name) VALUES ('Zona 3 - Quinta') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.zones (name) VALUES ('Eliminatoria - Quinta') ON CONFLICT (name) DO NOTHING;

-- Zonas Sexta
INSERT INTO public.zones (name) VALUES ('Zona 1 - Sexta') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.zones (name) VALUES ('Zona 2 - Sexta') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.zones (name) VALUES ('Zona 3 - Sexta') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.zones (name) VALUES ('Eliminatoria - Sexta') ON CONFLICT (name) DO NOTHING;

-- ─── 4. INSERTAR / ASEGURAR DIVISIONES ─────────────────────────────────────

INSERT INTO public.divisions (name, sort_order, is_active) SELECT 'Primera División', 0, true WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Primera División');
INSERT INTO public.divisions (name, sort_order, is_active) SELECT 'Quinta División', 20, true WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Quinta División');
INSERT INTO public.divisions (name, sort_order, is_active) SELECT 'Sexta División', 25, true WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Sexta División');
INSERT INTO public.divisions (name, sort_order, is_active) SELECT 'Séptima División', 1, true WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Séptima División');
INSERT INTO public.divisions (name, sort_order, is_active) SELECT 'Octava División', 2, true WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Octava División');
INSERT INTO public.divisions (name, sort_order, is_active) SELECT 'Novena División', 3, true WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Novena División');
INSERT INTO public.divisions (name, sort_order, is_active) SELECT 'Décima División', 4, true WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Décima División');
INSERT INTO public.divisions (name, sort_order, is_active) SELECT 'Undécima División', 5, true WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Undécima División');
INSERT INTO public.divisions (name, sort_order, is_active) SELECT 'Duodécima División', 6, true WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Duodécima División');
INSERT INTO public.divisions (name, sort_order, is_active) SELECT 'Decimotercera División', 7, true WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Decimotercera División');
INSERT INTO public.divisions (name, sort_order, is_active) SELECT 'Decimocuarta División', 8, true WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Decimocuarta División');
INSERT INTO public.divisions (name, sort_order, is_active) SELECT 'Decimoquinta División', 9, true WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Decimoquinta División');
INSERT INTO public.divisions (name, sort_order, is_active) SELECT 'Decimosexta División', 10, true WHERE NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = 'Decimosexta División');

UPDATE public.divisions SET is_active = true;

-- ─── 5. INSERTAR / ASEGURAR EQUIPOS ───────────────────────────────────────

INSERT INTO public.teams (name, display_name, logo_url) VALUES
  ('Talleres de Mar del Plata', 'Talleres', '/logos/talleres.png'),
  ('Deportivo Norte', NULL, '/logos/deportivo_norte.png'),
  ('Kimberley', NULL, '/logos/kimberley.png'),
  ('Once Unidos', NULL, '/logos/once_unidos.png'),
  ('Aldosivi', NULL, '/logos/aldosivi.png'),
  ('Banfield', NULL, '/logos/banfield.png'),
  ('Atlético Mar del Plata', NULL, '/logos/atletico_mar_del_plata.png'),
  ('Argentinos del Sud', NULL, '/logos/argentinos_del_sud.png'),
  ('Independiente', NULL, '/logos/independiente.png'),
  ('River Plate', NULL, '/logos/river_plate.png'),
  ('Cadetes', NULL, '/logos/cadetes.png'),
  ('Nacion', NULL, '/logos/nacion.png'),
  ('Alvarado', NULL, '/logos/alvarado.png'),
  ('Quilmes', NULL, '/logos/quilmes.png'),
  ('Boca Juniors', NULL, '/logos/boca_juniors.png'),
  ('Libertad', NULL, '/logos/libertad.png'),
  ('Circulo Deportivo', NULL, '/logos/circulo_deportivo.png'),
  ('San Lorenzo', NULL, '/logos/san_lorenzo.png'),
  ('General Urquiza', NULL, '/logos/general_urquiza.png'),
  ('El cañon', 'El Cañón', '/logos/el_canon.png'),
  ('Almagro Florida', NULL, '/logos/almagro_florida.png'),
  ('Al Ver Veras', NULL, '/logos/al_ver_veras.png'),
  ('Colegiales/Siciliano', NULL, '/logos/colegiales_el_siciliano.png'),
  ('Club Banco Provincia de Mar del Plata', 'Banco Provincia', '/logos/banco_provincia.png'),
  ('Club Social y Deportivo Chapadmalal', 'Chapadmalal', '/logos/chapadmalal.png'),
  ('San José', NULL, '/logos/san_jose.png'),
  ('Racing', NULL, '/logos/racing.png'),
  ('San Isidro', NULL, '/logos/san_isidro.png'),
  ('General Mitre', 'Gral. Mitre', '/logos/general_mitre.svg'),
  ('Unión', NULL, '/logos/union.svg')
ON CONFLICT (name) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  logo_url = EXCLUDED.logo_url;

-- ─── 6. GESTIÓN DE TORNEOS (SEPARACIÓN EXACTA) ────────────────────────────────

DO $$
DECLARE
  v_clausura_juveniles_id uuid;
  v_cacho_mendez_id uuid;
BEGIN
  -- A. Crear / Buscar "Torneo Clausura 2026" para divisiones de 7ma a 16ta
  SELECT id INTO v_clausura_juveniles_id 
  FROM public.tournaments 
  WHERE name ILIKE '%clausura%' AND name NOT ILIKE '%cacho%' AND year = 2026
  LIMIT 1;

  IF v_clausura_juveniles_id IS NULL THEN
    -- Si no existe, se crea el torneo para juveniles
    INSERT INTO public.tournaments (name, year, is_current)
    VALUES ('Torneo Clausura 2026', 2026, true)
    RETURNING id INTO v_clausura_juveniles_id;
  ELSE
    UPDATE public.tournaments 
    SET name = 'Torneo Clausura 2026', is_current = true 
    WHERE id = v_clausura_juveniles_id;
  END IF;

  -- B. Crear / Buscar "Clausura Joaquín Cacho Méndez" para Primera, Quinta y Sexta
  SELECT id INTO v_cacho_mendez_id 
  FROM public.tournaments 
  WHERE name ILIKE '%cacho%' OR name ILIKE '%reyes%'
  LIMIT 1;

  IF v_cacho_mendez_id IS NULL THEN
    INSERT INTO public.tournaments (name, year, is_current)
    VALUES ('Clausura Joaquín "Cacho" Méndez', 2026, true)
    RETURNING id INTO v_cacho_mendez_id;
  ELSE
    UPDATE public.tournaments 
    SET name = 'Clausura Joaquín "Cacho" Méndez', is_current = true 
    WHERE id = v_cacho_mendez_id;
  END IF;

  -- C. REASIGNAR CUALQUIER PARTIDO PREEXISTENTE DE 7MA A 16TA AL "Torneo Clausura 2026"
  UPDATE public.matches
  SET tournament_id = v_clausura_juveniles_id
  WHERE division_id IN (
    SELECT id FROM public.divisions 
    WHERE name NOT IN ('Primera División', 'Quinta División', 'Sexta División')
  );

  -- D. REASIGNAR PARTIDOS DE PRIMERA, QUINTA Y SEXTA AL "Clausura Joaquín Cacho Méndez"
  UPDATE public.matches
  SET tournament_id = v_cacho_mendez_id
  WHERE division_id IN (
    SELECT id FROM public.divisions 
    WHERE name IN ('Primera División', 'Quinta División', 'Sexta División')
  );
END $$;

-- ─── 7. CARGA DE FIXTURE FECHA 1 (PRIMERA, QUINTA Y SEXTA) ────────────────────

DO $$
DECLARE
  v_tourn uuid;
  v_div_prim uuid; v_z1_prim uuid; v_z2_prim uuid; v_z3_prim uuid;
  v_div_qui  uuid; v_z1_qui  uuid; v_z2_qui  uuid; v_z3_qui  uuid;
  v_div_sex  uuid; v_z1_sex  uuid; v_z2_sex  uuid; v_z3_sex  uuid;

  t_almagro uuid; t_river uuid; t_argsud uuid; t_indep uuid; t_alvarado uuid;
  t_libertad uuid; t_quilmes uuid; t_alver uuid; t_talleres uuid; t_banco uuid;
  t_sanjose uuid; t_circulo uuid; t_mitre uuid; t_boca uuid; t_union uuid;
  t_racing uuid; t_sanisidro uuid; t_cadetes uuid; t_chap uuid; t_kimber uuid;
  t_sanlorenzo uuid; t_depnorte uuid; t_urquiza uuid; t_mdp uuid; t_canon uuid;
  t_colegia uuid; t_banfield uuid; t_nacion uuid;
BEGIN
  -- Obtener Torneo Cacho Mendez
  SELECT id INTO v_tourn FROM public.tournaments WHERE name ILIKE '%cacho%' LIMIT 1;

  -- Divisiones
  SELECT id INTO v_div_prim FROM public.divisions WHERE name = 'Primera División' LIMIT 1;
  SELECT id INTO v_div_qui  FROM public.divisions WHERE name = 'Quinta División' LIMIT 1;
  SELECT id INTO v_div_sex  FROM public.divisions WHERE name = 'Sexta División' LIMIT 1;

  -- Zonas
  SELECT id INTO v_z1_prim FROM public.zones WHERE name = 'Zona 1 - Primera' LIMIT 1;
  SELECT id INTO v_z2_prim FROM public.zones WHERE name = 'Zona 2 - Primera' LIMIT 1;
  SELECT id INTO v_z3_prim FROM public.zones WHERE name = 'Zona 3 - Primera' LIMIT 1;

  SELECT id INTO v_z1_qui  FROM public.zones WHERE name = 'Zona 1 - Quinta' LIMIT 1;
  SELECT id INTO v_z2_qui  FROM public.zones WHERE name = 'Zona 2 - Quinta' LIMIT 1;
  SELECT id INTO v_z3_qui  FROM public.zones WHERE name = 'Zona 3 - Quinta' LIMIT 1;

  SELECT id INTO v_z1_sex  FROM public.zones WHERE name = 'Zona 1 - Sexta' LIMIT 1;
  SELECT id INTO v_z2_sex  FROM public.zones WHERE name = 'Zona 2 - Sexta' LIMIT 1;
  SELECT id INTO v_z3_sex  FROM public.zones WHERE name = 'Zona 3 - Sexta' LIMIT 1;

  -- Búsqueda de Equipos
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

  -- ── A. PRIMERA DIVISIÓN (Sábado 01/08 - 15:30 hs) ───────────────────────────
  DELETE FROM public.matches WHERE tournament_id = v_tourn AND division_id = v_div_prim AND round_number = 1;

  -- Zona 1
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div_prim, v_z1_prim, 1, t_almagro, t_river, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div_prim, v_z1_prim, 1, t_argsud, t_indep, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div_prim, v_z1_prim, 1, t_alvarado, t_libertad, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div_prim, v_z1_prim, 1, t_quilmes, t_alver, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz);

  -- Zona 2
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div_prim, v_z2_prim, 1, t_sanjose, t_circulo, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div_prim, v_z2_prim, 1, t_mitre, t_boca, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div_prim, v_z2_prim, 1, t_union, t_racing, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div_prim, v_z2_prim, 1, t_sanisidro, t_cadetes, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div_prim, v_z2_prim, 1, t_chap, t_kimber, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz);

  -- Zona 3
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div_prim, v_z3_prim, 1, t_sanlorenzo, t_depnorte, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div_prim, v_z3_prim, 1, t_urquiza, t_mdp, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div_prim, v_z3_prim, 1, t_canon, t_colegia, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz),
    (v_tourn, v_div_prim, v_z3_prim, 1, t_banfield, t_nacion, 'scheduled', '2026-08-01T15:30:00-03:00'::timestamptz);

  -- ── B. QUINTA DIVISIÓN (Sábado 01/08 - 13:30 hs & Miércoles 05/08 - 15:30 hs) ───
  DELETE FROM public.matches WHERE tournament_id = v_tourn AND division_id = v_div_qui AND round_number = 1;

  -- Zona 1
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div_qui, v_z1_qui, 1, t_almagro, t_river, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div_qui, v_z1_qui, 1, t_argsud, t_indep, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div_qui, v_z1_qui, 1, t_alvarado, t_libertad, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div_qui, v_z1_qui, 1, t_quilmes, t_alver, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div_qui, v_z1_qui, 1, t_banco, t_talleres, 'scheduled', '2026-08-05T15:30:00-03:00'::timestamptz);

  -- Zona 2
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div_qui, v_z2_qui, 1, t_sanjose, t_circulo, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div_qui, v_z2_qui, 1, t_mitre, t_boca, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div_qui, v_z2_qui, 1, t_union, t_racing, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div_qui, v_z2_qui, 1, t_sanisidro, t_cadetes, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div_qui, v_z2_qui, 1, t_chap, t_kimber, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz);

  -- Zona 3
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div_qui, v_z3_qui, 1, t_sanlorenzo, t_depnorte, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div_qui, v_z3_qui, 1, t_urquiza, t_mdp, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div_qui, v_z3_qui, 1, t_canon, t_colegia, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz),
    (v_tourn, v_div_qui, v_z3_qui, 1, t_banfield, t_nacion, 'scheduled', '2026-08-01T13:30:00-03:00'::timestamptz);

  -- ── C. SEXTA DIVISIÓN (Sábado 01/08 - 12:00 hs & Miércoles 05/08 - 14:00 hs) ────
  DELETE FROM public.matches WHERE tournament_id = v_tourn AND division_id = v_div_sex AND round_number = 1;

  -- Zona 1
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div_sex, v_z1_sex, 1, t_argsud, t_indep, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div_sex, v_z1_sex, 1, t_alvarado, t_libertad, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div_sex, v_z1_sex, 1, t_quilmes, t_alver, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div_sex, v_z1_sex, 1, t_banco, t_talleres, 'scheduled', '2026-08-05T14:00:00-03:00'::timestamptz);

  -- Zona 2
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div_sex, v_z2_sex, 1, t_sanjose, t_circulo, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div_sex, v_z2_sex, 1, t_mitre, t_boca, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div_sex, v_z2_sex, 1, t_sanisidro, t_cadetes, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div_sex, v_z2_sex, 1, t_chap, t_kimber, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz);

  -- Zona 3
  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status, match_date) VALUES
    (v_tourn, v_div_sex, v_z3_sex, 1, t_sanlorenzo, t_depnorte, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div_sex, v_z3_sex, 1, t_urquiza, t_mdp, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div_sex, v_z3_sex, 1, t_canon, t_colegia, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz),
    (v_tourn, v_div_sex, v_z3_sex, 1, t_banfield, t_nacion, 'scheduled', '2026-08-01T12:00:00-03:00'::timestamptz);
END $$;
