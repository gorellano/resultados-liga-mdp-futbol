-- Schema y configuración inicial para la Encuesta Comunitaria
-- Puede insertarse directamente en la tabla existente public.app_settings

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
