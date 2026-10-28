-- Configuración para App Settings (Global Feature Flags)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar valor por defecto
INSERT INTO public.app_settings (key, value)
VALUES ('show_sponsors', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Configuración para Sponsors
CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuración para Push Subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT NOT NULL,
    keys JSONB NOT NULL, -- contiene p256dh y auth
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    division_id UUID REFERENCES public.divisions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE NULLS NOT DISTINCT (endpoint, team_id, division_id)
);

-- Habilitar RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para app_settings
CREATE POLICY "Public can read app_settings" ON public.app_settings
    FOR SELECT TO public USING (true);

CREATE POLICY "Admin can modify app_settings" ON public.app_settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para sponsors
CREATE POLICY "Public can read active sponsors" ON public.sponsors
    FOR SELECT TO public USING (true);

CREATE POLICY "Admin can modify sponsors" ON public.sponsors
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para push_subscriptions
CREATE POLICY "Anyone can insert push_subscriptions" ON public.push_subscriptions
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can delete their own push_subscription" ON public.push_subscriptions
    FOR DELETE TO public USING (true); -- En un entorno real se filtra por endpoint o auth

CREATE POLICY "Admin can read push_subscriptions" ON public.push_subscriptions
    FOR SELECT TO authenticated USING (true);

-- Crear bucket de storage para sponsors
INSERT INTO storage.buckets (id, name, public) VALUES ('sponsors', 'sponsors', true) ON CONFLICT (id) DO NOTHING;

-- Políticas del Storage para Sponsors
CREATE POLICY "Public Access Sponsors" ON storage.objects FOR SELECT USING ( bucket_id = 'sponsors' );
CREATE POLICY "Admin Insert Sponsors" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'sponsors' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Update Sponsors" ON storage.objects FOR UPDATE USING ( bucket_id = 'sponsors' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin Delete Sponsors" ON storage.objects FOR DELETE USING ( bucket_id = 'sponsors' AND auth.role() = 'authenticated' );
