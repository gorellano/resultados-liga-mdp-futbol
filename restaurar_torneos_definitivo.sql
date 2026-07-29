-- =============================================================================
-- RESTRUCTURACIÓN DE TORNEOS EN SUPABASE Y RECUPERACIÓN DE DATOS JUVENILES
-- 1. Torneo Clausura 2026 (7ma a 16ta División): Mantiene todas las fechas 1, 2 y 3 cargadas.
-- 2. Clausura Joaquín "Cacho" Méndez (Primera, Quinta y Sexta): Torneo de 3 Zonas.
-- =============================================================================

DO $$
DECLARE
  v_clausura_juveniles_id uuid;
  v_cacho_mendez_id uuid;
BEGIN
  -- 1. Buscar o Crear "Torneo Clausura 2026" para divisiones de 7ma a 16ta
  SELECT id INTO v_clausura_juveniles_id 
  FROM public.tournaments 
  WHERE name ILIKE '%clausura%' AND name NOT ILIKE '%cacho%' AND year = 2026
  LIMIT 1;

  IF v_clausura_juveniles_id IS NULL THEN
    -- Si no existe con ese nombre, buscar el torneo genérico o antiguo
    SELECT id INTO v_clausura_juveniles_id 
    FROM public.tournaments 
    WHERE (name ILIKE '%oficial%' OR name ILIKE '%apertura%' OR name ILIKE '%anual%') AND name NOT ILIKE '%cacho%'
    LIMIT 1;
  END IF;

  IF v_clausura_juveniles_id IS NULL THEN
    INSERT INTO public.tournaments (name, year, is_current)
    VALUES ('Torneo Clausura 2026', 2026, true)
    RETURNING id INTO v_clausura_juveniles_id;
  ELSE
    UPDATE public.tournaments 
    SET name = 'Torneo Clausura 2026', is_current = true 
    WHERE id = v_clausura_juveniles_id;
  END IF;

  -- 2. Buscar o Crear "Clausura Joaquín Cacho Méndez" para Primera, Quinta y Sexta
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

  -- 3. REASIGNAR PARTIDOS DE 7MA A 16TA AL "Torneo Clausura 2026"
  UPDATE public.matches
  SET tournament_id = v_clausura_juveniles_id
  WHERE division_id IN (
    SELECT id FROM public.divisions 
    WHERE name NOT IN ('Primera División', 'Quinta División', 'Sexta División')
  );

  -- 4. REASIGNAR PARTIDOS DE PRIMERA, QUINTA Y SEXTA AL "Clausura Joaquín Cacho Méndez"
  UPDATE public.matches
  SET tournament_id = v_cacho_mendez_id
  WHERE division_id IN (
    SELECT id FROM public.divisions 
    WHERE name IN ('Primera División', 'Quinta División', 'Sexta División')
  );
END $$;
