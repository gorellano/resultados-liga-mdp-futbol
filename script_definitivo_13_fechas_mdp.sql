-- =============================================================================
-- SCRIPT DEFINITIVO LIGA MARPLATENSE DE FÚTBOL (COSTA Y GOL)
-- INCLUYE: ESTRUCTURAS, TORNEOS, 30 EQUIPOS, FECHA 1 DE 1A, 5A Y 6A Y
-- LAS 13 FECHAS COMPLETAS (CAMPEONATO Y PROMOCIÓN) PARA 7MA A 16TA DIVISIÓN
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
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
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

-- ─── 2. RLS Y POLÍTICAS ──────────────────────────────────────────────────────

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

DROP POLICY IF EXISTS "Enable All Matches" ON public.matches;
CREATE POLICY "Enable All Matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);

-- ─── 3. INSERTAR ZONAS Y DIVISIONES ─────────────────────────────────────────

INSERT INTO public.zones (name)
SELECT name FROM (VALUES 
  ('Campeonato'), ('Promoción'),
  ('Zona 1 - Primera'), ('Zona 2 - Primera'), ('Zona 3 - Primera'), ('Eliminatoria - Primera'),
  ('Zona 1 - Quinta'), ('Zona 2 - Quinta'), ('Zona 3 - Quinta'), ('Eliminatoria - Quinta'),
  ('Zona 1 - Sexta'), ('Zona 2 - Sexta'), ('Zona 3 - Sexta'), ('Eliminatoria - Sexta')
) AS z(name)
WHERE NOT EXISTS (SELECT 1 FROM public.zones existing WHERE existing.name = z.name);

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

-- ─── 4. INSERTAR EQUIPOS ──────────────────────────────────────────────────────

INSERT INTO public.teams (name, display_name, logo_url)
SELECT name, display_name, logo_url
FROM (VALUES
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
) AS new_teams(name, display_name, logo_url)
WHERE NOT EXISTS (SELECT 1 FROM public.teams t WHERE t.name = new_teams.name);

-- ─── 5. GESTIÓN Y SEPARACIÓN DE TORNEOS ───────────────────────────────────────

DO $$
DECLARE
  v_clausura_juveniles_id uuid;
  v_cacho_mendez_id uuid;
BEGIN
  -- A. Torneo Clausura 2026 (Juveniles 7ma a 16ta)
  SELECT id INTO v_clausura_juveniles_id 
  FROM public.tournaments 
  WHERE name ILIKE '%clausura%' AND name NOT ILIKE '%cacho%' AND year = 2026
  LIMIT 1;

  IF v_clausura_juveniles_id IS NULL THEN
    INSERT INTO public.tournaments (name, year, is_current)
    VALUES ('Torneo Clausura 2026', 2026, true)
    RETURNING id INTO v_clausura_juveniles_id;
  ELSE
    UPDATE public.tournaments 
    SET name = 'Torneo Clausura 2026', is_current = true 
    WHERE id = v_clausura_juveniles_id;
  END IF;

  -- B. Clausura Joaquín Cacho Méndez (Primera, Quinta y Sexta)
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

  -- Reasignaciones de torneos
  UPDATE public.matches
  SET tournament_id = v_clausura_juveniles_id
  WHERE division_id IN (
    SELECT id FROM public.divisions 
    WHERE name NOT IN ('Primera División', 'Quinta División', 'Sexta División')
  );

  UPDATE public.matches
  SET tournament_id = v_cacho_mendez_id
  WHERE division_id IN (
    SELECT id FROM public.divisions 
    WHERE name IN ('Primera División', 'Quinta División', 'Sexta División')
  );
END $$;

-- ─── 6. CARGA DE FIXTURE COMPLETO (13 FECHAS CAMPEONATO Y PROMOCIÓN) ──────────

DO $$
DECLARE
  v_tourn_juv uuid;
  v_z_camp uuid;
  v_z_prom uuid;
  div_rec RECORD;

  t_talleres uuid; t_depnorte uuid; t_kimberLEY uuid; t_onceunidos uuid;
  t_aldosivi uuid; t_banfield uuid; t_mdp uuid; t_argsud uuid;
  t_indep uuid; t_river uuid; t_cadetes uuid; t_nacion uuid;
  t_alvarado uuid; t_quilmes uuid;

  t_boca uuid; t_libertad uuid; t_circulo uuid; t_sanlorenzo uuid;
  t_urquiza uuid; t_canon uuid; t_almagro uuid; t_alver uuid;
  t_colegia uuid; t_banco uuid; t_chap uuid; t_sanjose uuid;
  t_racing uuid; t_sanisidro uuid;
BEGIN
  SELECT id INTO v_tourn_juv FROM public.tournaments WHERE name ILIKE '%clausura%' AND name NOT ILIKE '%cacho%' AND year = 2026 LIMIT 1;
  SELECT id INTO v_z_camp FROM public.zones WHERE name = 'Campeonato' LIMIT 1;
  SELECT id INTO v_z_prom FROM public.zones WHERE name = 'Promoción' LIMIT 1;

  -- Equipos Campeonato (Búsqueda estricta para evitar colisión entre Atlético Mar del Plata y otros clubes)
  SELECT id INTO t_talleres   FROM public.teams WHERE name ILIKE '%Talleres%' LIMIT 1;
  SELECT id INTO t_depnorte   FROM public.teams WHERE name ILIKE '%Deportivo Norte%' OR name ILIKE '%Dvo%Norte%' LIMIT 1;
  SELECT id INTO t_kimberLEY  FROM public.teams WHERE name ILIKE '%Kimberley%' LIMIT 1;
  SELECT id INTO t_onceunidos FROM public.teams WHERE name ILIKE '%Once Unidos%' LIMIT 1;
  SELECT id INTO t_aldosivi   FROM public.teams WHERE name ILIKE '%Aldosivi%' LIMIT 1;
  SELECT id INTO t_banfield   FROM public.teams WHERE name ILIKE '%Banfield%' LIMIT 1;
  SELECT id INTO t_mdp        FROM public.teams WHERE name ILIKE '%Atl%tico Mar del Plata%' OR (name ILIKE '%Mar del Plata%' AND name NOT ILIKE '%Talleres%' AND name NOT ILIKE '%Banco%') LIMIT 1;
  SELECT id INTO t_argsud     FROM public.teams WHERE name ILIKE '%Argentinos%' LIMIT 1;
  SELECT id INTO t_indep      FROM public.teams WHERE name ILIKE '%Independiente%' LIMIT 1;
  SELECT id INTO t_river      FROM public.teams WHERE name ILIKE '%River%' LIMIT 1;
  SELECT id INTO t_cadetes    FROM public.teams WHERE name ILIKE '%Cadetes%' LIMIT 1;
  SELECT id INTO t_nacion     FROM public.teams WHERE name ILIKE '%nacio%' LIMIT 1;
  SELECT id INTO t_alvarado   FROM public.teams WHERE name ILIKE '%Alvarado%' LIMIT 1;
  SELECT id INTO t_quilmes    FROM public.teams WHERE name ILIKE '%Quilmes%' LIMIT 1;

  -- Equipos Promoción
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

  FOR div_rec IN 
    SELECT id FROM public.divisions 
    WHERE name NOT IN ('Primera División', 'Quinta División', 'Sexta División')
  LOOP
    DELETE FROM public.matches WHERE tournament_id = v_tourn_juv AND division_id = div_rec.id;

    -- ── ZONA CAMPEONATO (13 FECHAS EXACTAS SEGÚN FIXTURE OFICIAL) ─────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      -- Fecha 1
      (v_tourn_juv, div_rec.id, v_z_camp, 1, t_talleres, t_depnorte, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 1, t_kimberLEY, t_onceunidos, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 1, t_aldosivi, t_banfield, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 1, t_mdp, t_argsud, 'scheduled'), -- MAR DEL PLATA vs. ARG. DEL SUD
      (v_tourn_juv, div_rec.id, v_z_camp, 1, t_indep, t_river, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 1, t_cadetes, t_nacion, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 1, t_alvarado, t_quilmes, 'scheduled'),
      -- Fecha 2
      (v_tourn_juv, div_rec.id, v_z_camp, 2, t_alvarado, t_talleres, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 2, t_quilmes, t_cadetes, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 2, t_nacion, t_indep, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 2, t_river, t_mdp, 'scheduled'), -- RIVER PLATE vs. MAR DEL PLATA
      (v_tourn_juv, div_rec.id, v_z_camp, 2, t_argsud, t_aldosivi, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 2, t_banfield, t_kimberLEY, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 2, t_onceunidos, t_depnorte, 'scheduled'),
      -- Fecha 3
      (v_tourn_juv, div_rec.id, v_z_camp, 3, t_talleres, t_onceunidos, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 3, t_depnorte, t_banfield, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 3, t_kimberLEY, t_argsud, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 3, t_aldosivi, t_river, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 3, t_mdp, t_nacion, 'scheduled'), -- MAR DEL PLATA vs. NACION
      (v_tourn_juv, div_rec.id, v_z_camp, 3, t_indep, t_quilmes, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 3, t_cadetes, t_alvarado, 'scheduled'),
      -- Fecha 4
      (v_tourn_juv, div_rec.id, v_z_camp, 4, t_cadetes, t_talleres, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 4, t_alvarado, t_indep, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 4, t_quilmes, t_mdp, 'scheduled'), -- QUILMES vs. MAR DEL PLATA
      (v_tourn_juv, div_rec.id, v_z_camp, 4, t_nacion, t_aldosivi, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 4, t_river, t_kimberLEY, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 4, t_argsud, t_depnorte, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 4, t_banfield, t_onceunidos, 'scheduled'),
      -- Fecha 5
      (v_tourn_juv, div_rec.id, v_z_camp, 5, t_talleres, t_banfield, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 5, t_onceunidos, t_argsud, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 5, t_depnorte, t_river, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 5, t_kimberLEY, t_nacion, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 5, t_aldosivi, t_quilmes, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 5, t_mdp, t_alvarado, 'scheduled'), -- MAR DEL PLATA vs. ALVARADO
      (v_tourn_juv, div_rec.id, v_z_camp, 5, t_indep, t_cadetes, 'scheduled'),
      -- Fecha 6
      (v_tourn_juv, div_rec.id, v_z_camp, 6, t_indep, t_talleres, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 6, t_cadetes, t_mdp, 'scheduled'), -- CADETES vs. MAR DEL PLATA
      (v_tourn_juv, div_rec.id, v_z_camp, 6, t_alvarado, t_aldosivi, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 6, t_quilmes, t_kimberLEY, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 6, t_nacion, t_depnorte, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 6, t_river, t_onceunidos, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 6, t_argsud, t_banfield, 'scheduled'),
      -- Fecha 7
      (v_tourn_juv, div_rec.id, v_z_camp, 7, t_talleres, t_argsud, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 7, t_banfield, t_river, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 7, t_onceunidos, t_nacion, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 7, t_depnorte, t_quilmes, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 7, t_kimberLEY, t_alvarado, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 7, t_aldosivi, t_cadetes, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 7, t_mdp, t_indep, 'scheduled'), -- MAR DEL PLATA vs. INDEPENDIENTE
      -- Fecha 8
      (v_tourn_juv, div_rec.id, v_z_camp, 8, t_mdp, t_talleres, 'scheduled'), -- MAR DEL PLATA vs. TALLERES
      (v_tourn_juv, div_rec.id, v_z_camp, 8, t_indep, t_aldosivi, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 8, t_cadetes, t_kimberLEY, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 8, t_alvarado, t_depnorte, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 8, t_quilmes, t_onceunidos, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 8, t_nacion, t_banfield, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 8, t_river, t_argsud, 'scheduled'),
      -- Fecha 9
      (v_tourn_juv, div_rec.id, v_z_camp, 9, t_talleres, t_river, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 9, t_argsud, t_nacion, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 9, t_banfield, t_quilmes, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 9, t_onceunidos, t_alvarado, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 9, t_depnorte, t_cadetes, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 9, t_kimberLEY, t_indep, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 9, t_aldosivi, t_mdp, 'scheduled'), -- ALDOSIVI vs. MAR DEL PLATA
      -- Fecha 10
      (v_tourn_juv, div_rec.id, v_z_camp, 10, t_aldosivi, t_talleres, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 10, t_mdp, t_kimberLEY, 'scheduled'), -- MAR DEL PLATA vs. KIMBERLEY
      (v_tourn_juv, div_rec.id, v_z_camp, 10, t_indep, t_depnorte, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 10, t_cadetes, t_onceunidos, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 10, t_alvarado, t_banfield, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 10, t_quilmes, t_argsud, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 10, t_nacion, t_river, 'scheduled'),
      -- Fecha 11
      (v_tourn_juv, div_rec.id, v_z_camp, 11, t_talleres, t_nacion, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 11, t_river, t_quilmes, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 11, t_argsud, t_alvarado, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 11, t_banfield, t_cadetes, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 11, t_onceunidos, t_indep, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 11, t_depnorte, t_mdp, 'scheduled'), -- DVO NORTE vs. MAR DEL PLATA
      (v_tourn_juv, div_rec.id, v_z_camp, 11, t_kimberLEY, t_aldosivi, 'scheduled'),
      -- Fecha 12
      (v_tourn_juv, div_rec.id, v_z_camp, 12, t_kimberLEY, t_talleres, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 12, t_aldosivi, t_depnorte, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 12, t_mdp, t_onceunidos, 'scheduled'), -- MAR DEL PLATA vs. ONCE UNIDOS
      (v_tourn_juv, div_rec.id, v_z_camp, 12, t_indep, t_banfield, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 12, t_cadetes, t_argsud, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 12, t_alvarado, t_river, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 12, t_quilmes, t_nacion, 'scheduled'),
      -- Fecha 13
      (v_tourn_juv, div_rec.id, v_z_camp, 13, t_talleres, t_quilmes, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 13, t_nacion, t_alvarado, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 13, t_river, t_cadetes, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 13, t_argsud, t_indep, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 13, t_banfield, t_mdp, 'scheduled'), -- BANFIELD vs. MAR DEL PLATA
      (v_tourn_juv, div_rec.id, v_z_camp, 13, t_onceunidos, t_aldosivi, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_camp, 13, t_depnorte, t_kimberLEY, 'scheduled');

    -- ── ZONA PROMOCIÓN (13 FECHAS EXACTAS SEGÚN FIXTURE OFICIAL) ─────────────
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, status) VALUES
      -- Fecha 1
      (v_tourn_juv, div_rec.id, v_z_prom, 1, t_boca, t_libertad, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 1, t_circulo, t_sanlorenzo, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 1, t_urquiza, t_canon, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 1, t_almagro, t_alver, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 1, t_colegia, t_banco, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 1, t_chap, t_sanjose, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 1, t_racing, t_sanisidro, 'scheduled'),
      -- Fecha 2
      (v_tourn_juv, div_rec.id, v_z_prom, 2, t_racing, t_boca, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 2, t_sanisidro, t_chap, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 2, t_sanjose, t_colegia, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 2, t_banco, t_almagro, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 2, t_alver, t_urquiza, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 2, t_canon, t_circulo, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 2, t_sanlorenzo, t_libertad, 'scheduled'),
      -- Fecha 3
      (v_tourn_juv, div_rec.id, v_z_prom, 3, t_boca, t_sanlorenzo, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 3, t_libertad, t_canon, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 3, t_circulo, t_alver, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 3, t_urquiza, t_banco, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 3, t_almagro, t_sanjose, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 3, t_colegia, t_sanisidro, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 3, t_chap, t_racing, 'scheduled'),
      -- Fecha 4
      (v_tourn_juv, div_rec.id, v_z_prom, 4, t_chap, t_boca, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 4, t_racing, t_colegia, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 4, t_sanisidro, t_almagro, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 4, t_sanjose, t_urquiza, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 4, t_banco, t_circulo, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 4, t_alver, t_libertad, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 4, t_canon, t_sanlorenzo, 'scheduled'),
      -- Fecha 5
      (v_tourn_juv, div_rec.id, v_z_prom, 5, t_boca, t_canon, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 5, t_sanlorenzo, t_alver, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 5, t_libertad, t_banco, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 5, t_circulo, t_sanjose, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 5, t_urquiza, t_sanisidro, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 5, t_almagro, t_racing, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 5, t_colegia, t_chap, 'scheduled'),
      -- Fecha 6
      (v_tourn_juv, div_rec.id, v_z_prom, 6, t_colegia, t_boca, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 6, t_chap, t_almagro, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 6, t_racing, t_urquiza, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 6, t_sanisidro, t_circulo, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 6, t_sanjose, t_libertad, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 6, t_banco, t_sanlorenzo, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 6, t_alver, t_canon, 'scheduled'),
      -- Fecha 7
      (v_tourn_juv, div_rec.id, v_z_prom, 7, t_boca, t_alver, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 7, t_canon, t_banco, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 7, t_sanlorenzo, t_sanjose, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 7, t_libertad, t_sanisidro, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 7, t_circulo, t_racing, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 7, t_urquiza, t_chap, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 7, t_almagro, t_colegia, 'scheduled'),
      -- Fecha 8
      (v_tourn_juv, div_rec.id, v_z_prom, 8, t_almagro, t_boca, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 8, t_colegia, t_urquiza, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 8, t_chap, t_circulo, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 8, t_racing, t_libertad, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 8, t_sanisidro, t_sanlorenzo, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 8, t_sanjose, t_canon, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 8, t_banco, t_alver, 'scheduled'),
      -- Fecha 9
      (v_tourn_juv, div_rec.id, v_z_prom, 9, t_boca, t_banco, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 9, t_alver, t_sanjose, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 9, t_canon, t_sanisidro, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 9, t_sanlorenzo, t_racing, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 9, t_libertad, t_chap, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 9, t_circulo, t_colegia, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 9, t_urquiza, t_almagro, 'scheduled'),
      -- Fecha 10
      (v_tourn_juv, div_rec.id, v_z_prom, 10, t_urquiza, t_boca, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 10, t_almagro, t_circulo, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 10, t_colegia, t_libertad, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 10, t_chap, t_sanlorenzo, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 10, t_racing, t_canon, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 10, t_sanisidro, t_alver, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 10, t_sanjose, t_banco, 'scheduled'),
      -- Fecha 11
      (v_tourn_juv, div_rec.id, v_z_prom, 11, t_boca, t_sanjose, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 11, t_banco, t_sanisidro, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 11, t_alver, t_racing, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 11, t_canon, t_chap, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 11, t_sanlorenzo, t_colegia, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 11, t_libertad, t_almagro, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 11, t_circulo, t_urquiza, 'scheduled'),
      -- Fecha 12
      (v_tourn_juv, div_rec.id, v_z_prom, 12, t_circulo, t_boca, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 12, t_urquiza, t_libertad, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 12, t_almagro, t_sanlorenzo, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 12, t_colegia, t_canon, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 12, t_chap, t_alver, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 12, t_racing, t_banco, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 12, t_sanisidro, t_sanjose, 'scheduled'),
      -- Fecha 13
      (v_tourn_juv, div_rec.id, v_z_prom, 13, t_boca, t_sanisidro, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 13, t_sanjose, t_racing, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 13, t_banco, t_chap, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 13, t_alver, t_colegia, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 13, t_canon, t_almagro, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 13, t_sanlorenzo, t_urquiza, 'scheduled'),
      (v_tourn_juv, div_rec.id, v_z_prom, 13, t_libertad, t_circulo, 'scheduled');
  END LOOP;
END $$;
