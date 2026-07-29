-- =============================================================================
-- SCRIPT DE RESTAURACIÓN Y SEPARACIÓN DE TORNEOS EN SUPABASE
-- 1. Crea/recupera el "Torneo Oficial 2026" para divisiones de 7ma a 16ta
-- 2. Vincula los partidos de 7ma a 16ta a "Torneo Oficial 2026"
-- 3. Mantiene el "Clausura Joaquín "Cacho" Méndez" para Primera, Quinta y Sexta
-- =============================================================================

DO $$
DECLARE
  v_oficial_id uuid;
  v_clausura_id uuid;
BEGIN
  -- 1. Buscar o Crear "Torneo Oficial 2026"
  SELECT id INTO v_oficial_id 
  FROM public.tournaments 
  WHERE name ILIKE '%oficial%' OR name ILIKE '%apertura%' OR name ILIKE '%anual%'
  LIMIT 1;

  IF v_oficial_id IS NULL THEN
    INSERT INTO public.tournaments (name, year, is_current)
    VALUES ('Torneo Oficial 2026', 2026, false)
    RETURNING id INTO v_oficial_id;
  ELSE
    UPDATE public.tournaments SET name = 'Torneo Oficial 2026' WHERE id = v_oficial_id;
  END IF;

  -- 2. Buscar o Crear "Clausura Joaquín "Cacho" Méndez"
  SELECT id INTO v_clausura_id 
  FROM public.tournaments 
  WHERE name ILIKE '%cacho%' OR name ILIKE '%clausura%'
  LIMIT 1;

  IF v_clausura_id IS NULL THEN
    INSERT INTO public.tournaments (name, year, is_current)
    VALUES ('Clausura Joaquín "Cacho" Méndez', 2026, true)
    RETURNING id INTO v_clausura_id;
  ELSE
    UPDATE public.tournaments SET name = 'Clausura Joaquín "Cacho" Méndez', is_current = true WHERE id = v_clausura_id;
  END IF;

  -- 3. Reasignar partidos de 7ma a 16ta división al Torneo Oficial 2026
  UPDATE public.matches
  SET tournament_id = v_oficial_id
  WHERE division_id IN (
    SELECT id FROM public.divisions 
    WHERE name NOT IN ('Primera División', 'Quinta División', 'Sexta División')
  );

  -- 4. Reasignar partidos de Primera, Quinta y Sexta división al Clausura
  UPDATE public.matches
  SET tournament_id = v_clausura_id
  WHERE division_id IN (
    SELECT id FROM public.divisions 
    WHERE name IN ('Primera División', 'Quinta División', 'Sexta División')
  );
END $$;
