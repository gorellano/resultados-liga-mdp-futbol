-- Schema, tabla y funciones para la Encuesta Comunitaria en Supabase (Idempotente)

-- 1. Registro inicial en la tabla app_settings
INSERT INTO public.app_settings (key, value)
VALUES (
    'active_poll',
    '{
        "id": "poll-referente-equipo-2026",
        "title": "¿Están interesados en tener un referente por equipo para subir los resultados al finalizar cada encuentro?",
        "description": "La idea es subir las alineaciones, tener los goleadores y estadísticas al instante.",
        "option_yes_label": "SÍ",
        "option_no_label": "NO",
        "yes_votes": 0,
        "no_votes": 0,
        "expires_at": "2026-09-20T23:59:59.000Z",
        "is_active": true
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- 2. Tabla para registrar cada voto individual de forma anónima
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id TEXT NOT NULL DEFAULT 'poll-referente-equipo-2026',
    choice TEXT NOT NULL CHECK (choice IN ('yes', 'no')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en poll_votes
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas previas para evitar error 42710 si ya existen
DROP POLICY IF EXISTS "Public can insert poll_votes" ON public.poll_votes;
DROP POLICY IF EXISTS "Public can read poll_votes" ON public.poll_votes;

CREATE POLICY "Public can insert poll_votes" ON public.poll_votes
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public can read poll_votes" ON public.poll_votes
    FOR SELECT TO public USING (true);

-- 3. Habilitar publicación Realtime en Supabase
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
END $$;

-- 4. Función atómica para registrar votos de forma segura y en tiempo real
CREATE OR REPLACE FUNCTION public.vote_in_poll(poll_choice text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_val jsonb;
    new_yes int;
    new_no int;
BEGIN
    SELECT value INTO current_val FROM public.app_settings WHERE key = 'active_poll';
    IF current_val IS NULL THEN
        current_val := '{
            "id": "poll-referente-equipo-2026",
            "title": "¿Están interesados en tener un referente por equipo para subir los resultados al finalizar cada encuentro?",
            "description": "La idea es subir las alineaciones, tener los goleadores, etc.",
            "option_yes_label": "SÍ",
            "option_no_label": "NO",
            "yes_votes": 0,
            "no_votes": 0,
            "expires_at": "2026-09-20T23:59:59.000Z",
            "is_active": true
        }'::jsonb;
    END IF;

    new_yes := COALESCE((current_val->>'yes_votes')::int, 0);
    new_no := COALESCE((current_val->>'no_votes')::int, 0);

    IF poll_choice = 'yes' THEN
        new_yes := new_yes + 1;
    ELSIF poll_choice = 'no' THEN
        new_no := new_no + 1;
    END IF;

    current_val := jsonb_set(current_val, '{yes_votes}', to_jsonb(new_yes));
    current_val := jsonb_set(current_val, '{no_votes}', to_jsonb(new_no));
    current_val := jsonb_set(current_val, '{updated_at}', to_jsonb(NOW()));

    INSERT INTO public.app_settings (key, value, updated_at)
    VALUES ('active_poll', current_val, NOW())
    ON CONFLICT (key) DO UPDATE SET value = current_val, updated_at = NOW();

    -- Registrar también en poll_votes
    INSERT INTO public.poll_votes (poll_id, choice)
    VALUES (COALESCE(current_val->>'id', 'poll-referente-equipo-2026'), poll_choice);

    RETURN current_val;
END;
$$;

-- 5. Otorgar permisos de ejecución a los usuarios anónimos (públicos)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.poll_votes TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.app_settings TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.vote_in_poll(text) TO anon, authenticated, service_role, public;
