-- =============================================================================
-- SCRIPT 01 — SCHEMA COMPLETO (BD Local para Desarrollo)
-- Combina: supabase_schema.sql + features_schema.sql + contact_messages
-- Ejecutar primero, antes que el seed de datos.
-- =============================================================================

-- Extensión para hashing de passwords (bcrypt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- TABLAS CORE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.divisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    year INTEGER NOT NULL DEFAULT 2026,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'editor')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
    division_id UUID REFERENCES public.divisions(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    home_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    away_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    home_goals INTEGER,
    away_goals INTEGER,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'finished', 'postponed')),
    match_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- TABLAS DE FEATURES (sponsors, notificaciones, configuración)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT NOT NULL,
    keys JSONB NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    division_id UUID REFERENCES public.divisions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE NULLS NOT DISTINCT (endpoint, team_id, division_id)
);

-- =============================================================================
-- TABLA DE MENSAJES DE CONTACTO
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- FUNCIONES RPCs PARA GESTIÓN DE USUARIOS
-- (usan SECURITY DEFINER para operar sobre passwords sin exponer la tabla)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.authenticate_user(p_username text, p_password text)
RETURNS TABLE (id uuid, username text, role text) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.username, u.role
    FROM public.users u
    WHERE LOWER(u.username) = LOWER(p_username)
      AND u.password_hash = crypt(p_password, u.password_hash)
      AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.create_user(p_username text, p_password text, p_role text)
RETURNS uuid AS $$
DECLARE
    v_user_id uuid;
BEGIN
    IF EXISTS (SELECT 1 FROM public.users u WHERE LOWER(u.username) = LOWER(p_username)) THEN
        RAISE EXCEPTION 'El nombre de usuario % ya existe', p_username;
    END IF;
    INSERT INTO public.users (username, password_hash, role)
    VALUES (p_username, crypt(p_password, gen_salt('bf')), p_role)
    RETURNING id INTO v_user_id;
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_user_password(p_user_id uuid, p_new_password text)
RETURNS boolean AS $$
BEGIN
    UPDATE public.users
    SET password_hash = crypt(p_new_password, gen_salt('bf'))
    WHERE id = p_user_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.toggle_user_active(p_user_id uuid, p_is_active boolean)
RETURNS boolean AS $$
BEGIN
    UPDATE public.users SET is_active = p_is_active WHERE id = p_user_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.fetch_users()
RETURNS TABLE (id uuid, username text, role text, is_active boolean, created_at timestamp with time zone) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.username, u.role, u.is_active, u.created_at
    FROM public.users u ORDER BY u.username ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
