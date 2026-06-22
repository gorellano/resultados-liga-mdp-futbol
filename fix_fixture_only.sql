-- =============================================================================
-- SQL SCRIPT: Corregir Fixture en Supabase (Solo Tabla matches - Dinámico)
-- Resetea los partidos e inserta el fixture oficial (Zona Campeonato y Promoción)
-- obteniendo los IDs de equipos, torneo, zonas y divisiones de forma dinámica
-- para evitar errores de clave foránea o diferencias de UUIDs.
--
-- Ejecuta este script en el SQL Editor de Supabase.
-- =============================================================================

-- 1. Limpiar partidos existentes para evitar duplicados/conflictos
DELETE FROM public.matches;

-- 2. Insertar fixture oficial para cada división dinámicamente
DO $$
DECLARE
  -- Variables para IDs de Zonas y Torneo
  v_tourn_id UUID;
  v_zone_camp UUID;
  v_zone_prom UUID;

  -- Variables para IDs de Equipos Campeonato
  e01 UUID; e02 UUID; e03 UUID; e04 UUID; e05 UUID; e06 UUID; e07 UUID;
  e08 UUID; e09 UUID; e10 UUID; e11 UUID; e12 UUID; e13 UUID; e14 UUID;

  -- Variables para IDs de Equipos Promoción
  p01 UUID; p02 UUID; p03 UUID; p04 UUID; p05 UUID; p06 UUID; p07 UUID;
  p08 UUID; p09 UUID; p10 UUID; p11 UUID; p12 UUID; p13 UUID; p14 UUID;

  -- Registro de división para el bucle
  div_record RECORD;

BEGIN
  -- Obtener ID del Torneo Anual 2026
  SELECT id INTO v_tourn_id FROM public.tournaments WHERE (name = 'Torneo Anual' OR name = 'Anual') AND year = 2026 LIMIT 1;
  IF v_tourn_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró el torneo "Torneo Anual" o "Anual" para el año 2026.';
  END IF;

  -- Obtener IDs de Zonas
  SELECT id INTO v_zone_camp FROM public.zones WHERE name = 'Campeonato' LIMIT 1;
  SELECT id INTO v_zone_prom FROM public.zones WHERE name = 'Promoción' LIMIT 1;
  IF v_zone_camp IS NULL OR v_zone_prom IS NULL THEN
    RAISE EXCEPTION 'No se encontraron las zonas "Campeonato" o "Promoción".';
  END IF;

  -- Obtener IDs de Equipos Campeonato por nombre exacto de la base de datos
  SELECT id INTO e01 FROM public.teams WHERE name = 'Talleres de Mar del Plata' LIMIT 1;
  SELECT id INTO e02 FROM public.teams WHERE name = 'Deportivo Norte' LIMIT 1;
  SELECT id INTO e03 FROM public.teams WHERE name = 'Kimberley' LIMIT 1;
  SELECT id INTO e04 FROM public.teams WHERE name = 'Once Unidos' LIMIT 1;
  SELECT id INTO e05 FROM public.teams WHERE name = 'Aldosivi' LIMIT 1;
  SELECT id INTO e06 FROM public.teams WHERE name = 'Banfield' LIMIT 1;
  SELECT id INTO e07 FROM public.teams WHERE name = 'Atlético Mar del Plata' LIMIT 1;
  SELECT id INTO e08 FROM public.teams WHERE name = 'Argentinos del Sud' LIMIT 1;
  SELECT id INTO e09 FROM public.teams WHERE name = 'Independiente' LIMIT 1;
  SELECT id INTO e10 FROM public.teams WHERE name = 'River Plate' LIMIT 1;
  SELECT id INTO e11 FROM public.teams WHERE name = 'Cadetes' LIMIT 1;
  SELECT id INTO e12 FROM public.teams WHERE name = 'Nacion' LIMIT 1;
  SELECT id INTO e13 FROM public.teams WHERE name = 'Alvarado' LIMIT 1;
  SELECT id INTO e14 FROM public.teams WHERE name = 'Quilmes' LIMIT 1;

  -- Verificar que se hayan encontrado todos los equipos de campeonato
  IF e01 IS NULL OR e02 IS NULL OR e03 IS NULL OR e04 IS NULL OR e05 IS NULL OR e06 IS NULL OR e07 IS NULL OR 
     e08 IS NULL OR e09 IS NULL OR e10 IS NULL OR e11 IS NULL OR e12 IS NULL OR e13 IS NULL OR e14 IS NULL THEN
    RAISE EXCEPTION 'No se encontraron todos los equipos de la Zona Campeonato en la tabla public.teams.';
  END IF;

  -- Obtener IDs de Equipos Promoción por nombre exacto de la base de datos
  SELECT id INTO p01 FROM public.teams WHERE name = 'Boca Juniors' LIMIT 1;
  SELECT id INTO p02 FROM public.teams WHERE name = 'Libertad' LIMIT 1;
  SELECT id INTO p03 FROM public.teams WHERE name = 'Circulo Deportivo' LIMIT 1;
  SELECT id INTO p04 FROM public.teams WHERE name = 'San Lorenzo' LIMIT 1;
  SELECT id INTO p05 FROM public.teams WHERE name = 'General Urquiza' LIMIT 1;
  SELECT id INTO p06 FROM public.teams WHERE name = 'El cañon' LIMIT 1;
  SELECT id INTO p07 FROM public.teams WHERE name = 'Almagro Florida' LIMIT 1;
  SELECT id INTO p08 FROM public.teams WHERE name = 'Al Ver Veras' LIMIT 1;
  SELECT id INTO p09 FROM public.teams WHERE name = 'Colegiales/Siciliano' LIMIT 1;
  SELECT id INTO p10 FROM public.teams WHERE name = 'Club Banco Provincia de Mar del Plata' LIMIT 1;
  SELECT id INTO p11 FROM public.teams WHERE name = 'Club Social y Deportivo Chapadmalal' LIMIT 1;
  SELECT id INTO p12 FROM public.teams WHERE name = 'San José' LIMIT 1;
  SELECT id INTO p13 FROM public.teams WHERE name = 'Racing' LIMIT 1;
  SELECT id INTO p14 FROM public.teams WHERE name = 'San Isidro' LIMIT 1;

  -- Verificar que se hayan encontrado todos los equipos de promoción
  IF p01 IS NULL OR p02 IS NULL OR p03 IS NULL OR p04 IS NULL OR p05 IS NULL OR p06 IS NULL OR p07 IS NULL OR 
     p08 IS NULL OR p09 IS NULL OR p10 IS NULL OR p11 IS NULL OR p12 IS NULL OR p13 IS NULL OR p14 IS NULL THEN
    RAISE EXCEPTION 'No se encontraron todos los equipos de la Zona Promoción en la tabla public.teams.';
  END IF;

  -- Iterar por todas las divisiones activas (exceptuando Primera, Quinta y Sexta que son "soon" / sin fixture cargado)
  FOR div_record IN 
    SELECT id, name FROM public.divisions 
    WHERE name NOT IN ('Primera División', 'Quinta División', 'Sexta División')
  LOOP

    -- =========================================================================
    -- ZONA CAMPEONATO
    -- =========================================================================
    
    -- FECHA 1
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_camp, 1, e01, e02), -- Talleres vs. Deportivo Norte
      (v_tourn_id, div_record.id, v_zone_camp, 1, e03, e04), -- Kimberley vs. Once Unidos
      (v_tourn_id, div_record.id, v_zone_camp, 1, e05, e06), -- Aldosivi vs. Banfield
      (v_tourn_id, div_record.id, v_zone_camp, 1, e07, e08), -- Mar del Plata vs. Argentinos del Sud
      (v_tourn_id, div_record.id, v_zone_camp, 1, e09, e10), -- Independiente vs. River Plate
      (v_tourn_id, div_record.id, v_zone_camp, 1, e11, e12), -- Cadetes vs. Nación
      (v_tourn_id, div_record.id, v_zone_camp, 1, e13, e14); -- Alvarado vs. Quilmes

    -- FECHA 2
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_camp, 2, e13, e01), -- Alvarado vs. Talleres
      (v_tourn_id, div_record.id, v_zone_camp, 2, e14, e11), -- Quilmes vs. Cadetes
      (v_tourn_id, div_record.id, v_zone_camp, 2, e12, e09), -- Nación vs. Independiente
      (v_tourn_id, div_record.id, v_zone_camp, 2, e10, e07), -- River Plate vs. Mar del Plata
      (v_tourn_id, div_record.id, v_zone_camp, 2, e08, e05), -- Argentinos del Sud vs. Aldosivi
      (v_tourn_id, div_record.id, v_zone_camp, 2, e06, e03), -- Banfield vs. Kimberley
      (v_tourn_id, div_record.id, v_zone_camp, 2, e04, e02); -- Once Unidos vs. Deportivo Norte

    -- FECHA 3
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_camp, 3, e01, e04), -- Talleres vs. Once Unidos
      (v_tourn_id, div_record.id, v_zone_camp, 3, e02, e06), -- Deportivo Norte vs. Banfield
      (v_tourn_id, div_record.id, v_zone_camp, 3, e03, e08), -- Kimberley vs. Argentinos del Sud
      (v_tourn_id, div_record.id, v_zone_camp, 3, e05, e10), -- Aldosivi vs. River Plate
      (v_tourn_id, div_record.id, v_zone_camp, 3, e07, e12), -- Mar del Plata vs. Nación
      (v_tourn_id, div_record.id, v_zone_camp, 3, e09, e14), -- Independiente vs. Quilmes
      (v_tourn_id, div_record.id, v_zone_camp, 3, e11, e13); -- Cadetes vs. Alvarado

    -- FECHA 4
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_camp, 4, e11, e01), -- Cadetes vs. Talleres
      (v_tourn_id, div_record.id, v_zone_camp, 4, e13, e09), -- Alvarado vs. Independiente
      (v_tourn_id, div_record.id, v_zone_camp, 4, e14, e07), -- Quilmes vs. Mar del Plata
      (v_tourn_id, div_record.id, v_zone_camp, 4, e12, e05), -- Nación vs. Aldosivi
      (v_tourn_id, div_record.id, v_zone_camp, 4, e10, e03), -- River Plate vs. Kimberley
      (v_tourn_id, div_record.id, v_zone_camp, 4, e08, e02), -- Argentinos del Sud vs. Deportivo Norte
      (v_tourn_id, div_record.id, v_zone_camp, 4, e06, e04); -- Banfield vs. Once Unidos

    -- FECHA 5
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_camp, 5, e01, e06), -- Talleres vs. Banfield
      (v_tourn_id, div_record.id, v_zone_camp, 5, e04, e08), -- Once Unidos vs. Argentinos del Sud
      (v_tourn_id, div_record.id, v_zone_camp, 5, e02, e10), -- Deportivo Norte vs. River Plate
      (v_tourn_id, div_record.id, v_zone_camp, 5, e03, e12), -- Kimberley vs. Nación
      (v_tourn_id, div_record.id, v_zone_camp, 5, e05, e14), -- Aldosivi vs. Quilmes
      (v_tourn_id, div_record.id, v_zone_camp, 5, e07, e13), -- Mar del Plata vs. Alvarado
      (v_tourn_id, div_record.id, v_zone_camp, 5, e09, e11); -- Independiente vs. Cadetes

    -- FECHA 6
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_camp, 6, e09, e01), -- Independiente vs. Talleres
      (v_tourn_id, div_record.id, v_zone_camp, 6, e11, e07), -- Cadetes vs. Mar del Plata
      (v_tourn_id, div_record.id, v_zone_camp, 6, e13, e05), -- Alvarado vs. Aldosivi
      (v_tourn_id, div_record.id, v_zone_camp, 6, e14, e03), -- Quilmes vs. Kimberley
      (v_tourn_id, div_record.id, v_zone_camp, 6, e12, e02), -- Nación vs. Deportivo Norte
      (v_tourn_id, div_record.id, v_zone_camp, 6, e10, e04), -- River Plate vs. Once Unidos
      (v_tourn_id, div_record.id, v_zone_camp, 6, e08, e06); -- Argentinos del Sud vs. Banfield

    -- FECHA 7
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_camp, 7, e01, e08), -- Talleres vs. Argentinos del Sud
      (v_tourn_id, div_record.id, v_zone_camp, 7, e06, e10), -- Banfield vs. River Plate
      (v_tourn_id, div_record.id, v_zone_camp, 7, e04, e12), -- Once Unidos vs. Nación
      (v_tourn_id, div_record.id, v_zone_camp, 7, e02, e14), -- Deportivo Norte vs. Quilmes
      (v_tourn_id, div_record.id, v_zone_camp, 7, e03, e13), -- Kimberley vs. Alvarado
      (v_tourn_id, div_record.id, v_zone_camp, 7, e05, e11), -- Aldosivi vs. Cadetes
      (v_tourn_id, div_record.id, v_zone_camp, 7, e07, e09); -- Mar del Plata vs. Independiente

    -- FECHA 8
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_camp, 8, e07, e01), -- Mar del Plata vs. Talleres
      (v_tourn_id, div_record.id, v_zone_camp, 8, e09, e05), -- Independiente vs. Aldosivi
      (v_tourn_id, div_record.id, v_zone_camp, 8, e11, e03), -- Cadetes vs. Kimberley
      (v_tourn_id, div_record.id, v_zone_camp, 8, e13, e02), -- Alvarado vs. Deportivo Norte
      (v_tourn_id, div_record.id, v_zone_camp, 8, e14, e04), -- Quilmes vs. Once Unidos
      (v_tourn_id, div_record.id, v_zone_camp, 8, e12, e06), -- Nación vs. Banfield
      (v_tourn_id, div_record.id, v_zone_camp, 8, e10, e08); -- River Plate vs. Argentinos del Sud

    -- FECHA 9
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_camp, 9, e01, e10), -- Talleres vs. River Plate
      (v_tourn_id, div_record.id, v_zone_camp, 9, e08, e12), -- Argentinos del Sud vs. Nación
      (v_tourn_id, div_record.id, v_zone_camp, 9, e06, e14), -- Banfield vs. Quilmes
      (v_tourn_id, div_record.id, v_zone_camp, 9, e04, e13), -- Once Unidos vs. Alvarado
      (v_tourn_id, div_record.id, v_zone_camp, 9, e02, e11), -- Deportivo Norte vs. Cadetes
      (v_tourn_id, div_record.id, v_zone_camp, 9, e03, e09), -- Kimberley vs. Independiente
      (v_tourn_id, div_record.id, v_zone_camp, 9, e05, e07); -- Aldosivi vs. Mar del Plata

    -- FECHA 10
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_camp, 10, e05, e01), -- Aldosivi vs. Talleres
      (v_tourn_id, div_record.id, v_zone_camp, 10, e07, e03), -- Mar del Plata vs. Kimberley
      (v_tourn_id, div_record.id, v_zone_camp, 10, e09, e02), -- Independiente vs. Deportivo Norte
      (v_tourn_id, div_record.id, v_zone_camp, 10, e11, e04), -- Cadetes vs. Once Unidos
      (v_tourn_id, div_record.id, v_zone_camp, 10, e13, e06), -- Alvarado vs. Banfield
      (v_tourn_id, div_record.id, v_zone_camp, 10, e14, e08), -- Quilmes vs. Argentinos del Sud
      (v_tourn_id, div_record.id, v_zone_camp, 10, e12, e10); -- Nación vs. River Plate

    -- FECHA 11
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_camp, 11, e01, e12), -- Talleres vs. Nación
      (v_tourn_id, div_record.id, v_zone_camp, 11, e10, e14), -- River Plate vs. Quilmes
      (v_tourn_id, div_record.id, v_zone_camp, 11, e08, e13), -- Argentinos del Sud vs. Alvarado
      (v_tourn_id, div_record.id, v_zone_camp, 11, e06, e11), -- Banfield vs. Cadetes
      (v_tourn_id, div_record.id, v_zone_camp, 11, e04, e09), -- Once Unidos vs. Independiente
      (v_tourn_id, div_record.id, v_zone_camp, 11, e02, e07), -- Deportivo Norte vs. Mar del Plata
      (v_tourn_id, div_record.id, v_zone_camp, 11, e03, e05); -- Kimberley vs. Aldosivi

    -- FECHA 12
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_camp, 12, e03, e01), -- Kimberley vs. Talleres
      (v_tourn_id, div_record.id, v_zone_camp, 12, e05, e02), -- Aldosivi vs. Deportivo Norte
      (v_tourn_id, div_record.id, v_zone_camp, 12, e07, e04), -- Mar del Plata vs. Once Unidos
      (v_tourn_id, div_record.id, v_zone_camp, 12, e09, e06), -- Independiente vs. Banfield
      (v_tourn_id, div_record.id, v_zone_camp, 12, e11, e08), -- Cadetes vs. Argentinos del Sud
      (v_tourn_id, div_record.id, v_zone_camp, 12, e13, e10), -- Alvarado vs. River Plate
      (v_tourn_id, div_record.id, v_zone_camp, 12, e14, e12); -- Quilmes vs. Nación

    -- FECHA 13
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_camp, 13, e01, e14), -- Talleres vs. Quilmes
      (v_tourn_id, div_record.id, v_zone_camp, 13, e12, e13), -- Nación vs. Alvarado
      (v_tourn_id, div_record.id, v_zone_camp, 13, e10, e11), -- River Plate vs. Cadetes
      (v_tourn_id, div_record.id, v_zone_camp, 13, e08, e09), -- Argentinos del Sud vs. Independiente
      (v_tourn_id, div_record.id, v_zone_camp, 13, e06, e07), -- Banfield vs. Mar del Plata
      (v_tourn_id, div_record.id, v_zone_camp, 13, e04, e05), -- Once Unidos vs. Aldosivi
      (v_tourn_id, div_record.id, v_zone_camp, 13, e02, e03); -- Deportivo Norte vs. Kimberley


    -- =========================================================================
    -- ZONA PROMOCIÓN
    -- =========================================================================

    -- FECHA 1
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_prom, 1, p01, p02), -- BOCA JUNIORS vs. LIBERTAD
      (v_tourn_id, div_record.id, v_zone_prom, 1, p03, p04), -- Circulo Deportivo vs. SAN LORENZO
      (v_tourn_id, div_record.id, v_zone_prom, 1, p05, p06), -- GRAL. URQUIZA vs. EL CAÑON
      (v_tourn_id, div_record.id, v_zone_prom, 1, p07, p08), -- ALMAGRO FLORIDA vs. AL VER VERAS
      (v_tourn_id, div_record.id, v_zone_prom, 1, p09, p10), -- Colegiales/Siciliano vs. BANCO PROVINCIA
      (v_tourn_id, div_record.id, v_zone_prom, 1, p11, p12), -- CHAPADMALAL vs. SAN JOSE
      (v_tourn_id, div_record.id, v_zone_prom, 1, p13, p14); -- RACING vs. SAN ISIDRO

    -- FECHA 2
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_prom, 2, p13, p01), -- RACING vs. BOCA JUNIORS
      (v_tourn_id, div_record.id, v_zone_prom, 2, p14, p11), -- SAN ISIDRO vs. CHAPADMALAL
      (v_tourn_id, div_record.id, v_zone_prom, 2, p12, p09), -- SAN JOSE vs. Colegiales/Siciliano
      (v_tourn_id, div_record.id, v_zone_prom, 2, p10, p07), -- BANCO PROVINCIA vs. ALMAGRO FLORIDA
      (v_tourn_id, div_record.id, v_zone_prom, 2, p08, p05), -- AL VER VERAS vs. GRAL. URQUIZA
      (v_tourn_id, div_record.id, v_zone_prom, 2, p06, p03), -- EL CAÑON vs. Circulo Deportivo
      (v_tourn_id, div_record.id, v_zone_prom, 2, p04, p02); -- SAN LORENZO vs. LIBERTAD

    -- FECHA 3
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_prom, 3, p01, p04), -- BOCA JUNIORS vs. SAN LORENZO
      (v_tourn_id, div_record.id, v_zone_prom, 3, p02, p06), -- LIBERTAD vs. EL CAÑON
      (v_tourn_id, div_record.id, v_zone_prom, 3, p03, p08), -- Circulo Deportivo vs. AL VER VERAS
      (v_tourn_id, div_record.id, v_zone_prom, 3, p05, p10), -- GRAL. URQUIZA vs. BANCO PROVINCIA
      (v_tourn_id, div_record.id, v_zone_prom, 3, p07, p12), -- ALMAGRO FLORIDA vs. SAN JOSE
      (v_tourn_id, div_record.id, v_zone_prom, 3, p09, p14), -- Colegiales/Siciliano vs. SAN ISIDRO
      (v_tourn_id, div_record.id, v_zone_prom, 3, p11, p13); -- CHAPADMALAL vs. RACING

    -- FECHA 4
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_prom, 4, p11, p01), -- CHAPADMALAL vs. BOCA JUNIORS
      (v_tourn_id, div_record.id, v_zone_prom, 4, p13, p09), -- RACING vs. Colegiales/Siciliano
      (v_tourn_id, div_record.id, v_zone_prom, 4, p14, p07), -- SAN ISIDRO vs. ALMAGRO FLORIDA
      (v_tourn_id, div_record.id, v_zone_prom, 4, p12, p05), -- SAN JOSE vs. GRAL. URQUIZA
      (v_tourn_id, div_record.id, v_zone_prom, 4, p10, p03), -- BANCO PROVINCIA vs. Circulo Deportivo
      (v_tourn_id, div_record.id, v_zone_prom, 4, p08, p02), -- AL VER VERAS vs. LIBERTAD
      (v_tourn_id, div_record.id, v_zone_prom, 4, p06, p04); -- EL CAÑON vs. SAN LORENZO

    -- FECHA 5
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_prom, 5, p01, p06), -- BOCA JUNIORS vs. EL CAÑON
      (v_tourn_id, div_record.id, v_zone_prom, 5, p04, p08), -- SAN LORENZO vs. AL VER VERAS
      (v_tourn_id, div_record.id, v_zone_prom, 5, p02, p10), -- LIBERTAD vs. BANCO PROVINCIA
      (v_tourn_id, div_record.id, v_zone_prom, 5, p03, p12), -- Circulo Deportivo vs. SAN JOSE
      (v_tourn_id, div_record.id, v_zone_prom, 5, p05, p14), -- GRAL. URQUIZA vs. SAN ISIDRO
      (v_tourn_id, div_record.id, v_zone_prom, 5, p07, p13), -- ALMAGRO FLORIDA vs. RACING
      (v_tourn_id, div_record.id, v_zone_prom, 5, p09, p11); -- Colegiales/Siciliano vs. CHAPADMALAL

    -- FECHA 6
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_prom, 6, p09, p01), -- Colegiales/Siciliano vs. BOCA JUNIORS
      (v_tourn_id, div_record.id, v_zone_prom, 6, p11, p07), -- CHAPADMALAL vs. ALMAGRO FLORIDA
      (v_tourn_id, div_record.id, v_zone_prom, 6, p13, p05), -- RACING vs. GRAL. URQUIZA
      (v_tourn_id, div_record.id, v_zone_prom, 6, p14, p03), -- SAN ISIDRO vs. Circulo Deportivo
      (v_tourn_id, div_record.id, v_zone_prom, 6, p12, p02), -- SAN JOSE vs. LIBERTAD
      (v_tourn_id, div_record.id, v_zone_prom, 6, p10, p04), -- BANCO PROVINCIA vs. SAN LORENZO
      (v_tourn_id, div_record.id, v_zone_prom, 6, p08, p06); -- AL VER VERAS vs. EL CAÑON

    -- FECHA 7
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_prom, 7, p01, p08), -- BOCA JUNIORS vs. AL VER VERAS
      (v_tourn_id, div_record.id, v_zone_prom, 7, p06, p10), -- EL CAÑON vs. BANCO PROVINCIA
      (v_tourn_id, div_record.id, v_zone_prom, 7, p04, p12), -- SAN LORENZO vs. SAN JOSE
      (v_tourn_id, div_record.id, v_zone_prom, 7, p02, p14), -- LIBERTAD vs. SAN ISIDRO
      (v_tourn_id, div_record.id, v_zone_prom, 7, p03, p13), -- Circulo Deportivo vs. RACING
      (v_tourn_id, div_record.id, v_zone_prom, 7, p05, p11), -- GRAL. URQUIZA vs. CHAPADMALAL
      (v_tourn_id, div_record.id, v_zone_prom, 7, p07, p09); -- ALMAGRO FLORIDA vs. Colegiales/Siciliano

    -- FECHA 8
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_prom, 8, p07, p01), -- ALMAGRO FLORIDA vs. BOCA JUNIORS
      (v_tourn_id, div_record.id, v_zone_prom, 8, p09, p05), -- Colegiales/Siciliano vs. GRAL. URQUIZA
      (v_tourn_id, div_record.id, v_zone_prom, 8, p11, p03), -- CHAPADMALAL vs. Circulo Deportivo
      (v_tourn_id, div_record.id, v_zone_prom, 8, p13, p02), -- RACING vs. LIBERTAD
      (v_tourn_id, div_record.id, v_zone_prom, 8, p14, p04), -- SAN ISIDRO vs. SAN LORENZO
      (v_tourn_id, div_record.id, v_zone_prom, 8, p12, p06), -- SAN JOSE vs. EL CAÑON
      (v_tourn_id, div_record.id, v_zone_prom, 8, p10, p08); -- BANCO PROVINCIA vs. AL VER VERAS

    -- FECHA 9
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_prom, 9, p01, p10), -- BOCA JUNIORS vs. BANCO PROVINCIA
      (v_tourn_id, div_record.id, v_zone_prom, 9, p08, p12), -- AL VER VERAS vs. SAN JOSE
      (v_tourn_id, div_record.id, v_zone_prom, 9, p06, p14), -- EL CAÑON vs. SAN ISIDRO
      (v_tourn_id, div_record.id, v_zone_prom, 9, p04, p13), -- SAN LORENZO vs. RACING
      (v_tourn_id, div_record.id, v_zone_prom, 9, p02, p11), -- LIBERTAD vs. CHAPADMALAL
      (v_tourn_id, div_record.id, v_zone_prom, 9, p03, p09), -- Circulo Deportivo vs. Colegiales/Siciliano
      (v_tourn_id, div_record.id, v_zone_prom, 9, p05, p07); -- GRAL. URQUIZA vs. ALMAGRO FLORIDA

    -- FECHA 10
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_prom, 10, p05, p01), -- GRAL. URQUIZA vs. BOCA JUNIORS
      (v_tourn_id, div_record.id, v_zone_prom, 10, p07, p03), -- ALMAGRO FLORIDA vs. Circulo Deportivo
      (v_tourn_id, div_record.id, v_zone_prom, 10, p09, p02), -- Colegiales/Siciliano vs. LIBERTAD
      (v_tourn_id, div_record.id, v_zone_prom, 10, p11, p04), -- CHAPADMALAL vs. SAN LORENZO
      (v_tourn_id, div_record.id, v_zone_prom, 10, p13, p06), -- RACING vs. EL CAÑON
      (v_tourn_id, div_record.id, v_zone_prom, 10, p14, p08), -- SAN ISIDRO vs. AL VER VERAS
      (v_tourn_id, div_record.id, v_zone_prom, 10, p12, p10); -- SAN JOSE vs. BANCO PROVINCIA

    -- FECHA 11
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_prom, 11, p01, p12), -- BOCA JUNIORS vs. SAN JOSE
      (v_tourn_id, div_record.id, v_zone_prom, 11, p10, p14), -- BANCO PROVINCIA vs. SAN ISIDRO
      (v_tourn_id, div_record.id, v_zone_prom, 11, p08, p13), -- AL VER VERAS vs. RACING
      (v_tourn_id, div_record.id, v_zone_prom, 11, p06, p11), -- EL CAÑON vs. CHAPADMALAL
      (v_tourn_id, div_record.id, v_zone_prom, 11, p04, p09), -- SAN LORENZO vs. Colegiales/Siciliano
      (v_tourn_id, div_record.id, v_zone_prom, 11, p02, p07), -- LIBERTAD vs. ALMAGRO FLORIDA
      (v_tourn_id, div_record.id, v_zone_prom, 11, p03, p05); -- Circulo Deportivo vs. GRAL. URQUIZA

    -- FECHA 12
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_prom, 12, p03, p01), -- Circulo Deportivo vs. BOCA JUNIORS
      (v_tourn_id, div_record.id, v_zone_prom, 12, p05, p02), -- GRAL. URQUIZA vs. LIBERTAD
      (v_tourn_id, div_record.id, v_zone_prom, 12, p07, p04), -- ALMAGRO FLORIDA vs. SAN LORENZO
      (v_tourn_id, div_record.id, v_zone_prom, 12, p09, p06), -- Colegiales/Siciliano vs. EL CAÑON
      (v_tourn_id, div_record.id, v_zone_prom, 12, p11, p08), -- CHAPADMALAL vs. AL VER VERAS
      (v_tourn_id, div_record.id, v_zone_prom, 12, p13, p10), -- RACING vs. BANCO PROVINCIA
      (v_tourn_id, div_record.id, v_zone_prom, 12, p14, p12); -- SAN ISIDRO vs. SAN JOSE

    -- FECHA 13
    INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) VALUES
      (v_tourn_id, div_record.id, v_zone_prom, 13, p01, p14), -- BOCA JUNIORS vs. SAN ISIDRO
      (v_tourn_id, div_record.id, v_zone_prom, 13, p12, p13), -- SAN JOSE vs. RACING
      (v_tourn_id, div_record.id, v_zone_prom, 13, p10, p11), -- BANCO PROVINCIA vs. CHAPADMALAL
      (v_tourn_id, div_record.id, v_zone_prom, 13, p08, p09), -- AL VER VERAS vs. Colegiales/Siciliano
      (v_tourn_id, div_record.id, v_zone_prom, 13, p06, p07), -- EL CAÑON vs. ALMAGRO FLORIDA
      (v_tourn_id, div_record.id, v_zone_prom, 13, p04, p05), -- SAN LORENZO vs. GRAL. URQUIZA
      (v_tourn_id, div_record.id, v_zone_prom, 13, p02, p03); -- LIBERTAD vs. Circulo Deportivo

  END LOOP;
END $$;
