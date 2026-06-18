-- Supabase Schema for LMF Results WebApp

-- Enable pgcrypto extension for secure password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create table for Divisions
CREATE TABLE public.divisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., 'Septima', 'Octava', 'Primera'
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create table for Teams
CREATE TABLE public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create table for Zones (Campeonato / Promoción)
CREATE TABLE public.zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- 'Campeonato', 'Promoción'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create table for Tournaments (Seasons)
CREATE TABLE public.tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., 'Apertura'
    year INTEGER NOT NULL DEFAULT 2026,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create table for Users (Custom authentication)
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'editor')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create table for Matches (Fixture & Results)
CREATE TABLE public.matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
    division_id UUID REFERENCES public.divisions(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL, -- e.g., Fecha 1, Fecha 2
    home_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    away_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    home_goals INTEGER, -- NULL if match hasn't been played
    away_goals INTEGER, -- NULL if match hasn't been played
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'finished', 'postponed'
    match_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Read access for everyone (Public)
CREATE POLICY "Public profiles are viewable by everyone." ON public.divisions FOR SELECT USING (true);
CREATE POLICY "Public profiles are viewable by everyone." ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public profiles are viewable by everyone." ON public.zones FOR SELECT USING (true);
CREATE POLICY "Public profiles are viewable by everyone." ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Public profiles are viewable by everyone." ON public.matches FOR SELECT USING (true);

-- Users table RLS policies
-- No public select/insert/update/delete directly on users table to protect password hashes
-- All operations are performed securely via SECURITY DEFINER functions (RPC)

-- Write access only for authenticated users (Admins)
CREATE POLICY "Admins can insert divisions" ON public.divisions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update divisions" ON public.divisions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete divisions" ON public.divisions FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert teams" ON public.teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update teams" ON public.teams FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete teams" ON public.teams FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert zones" ON public.zones FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update zones" ON public.zones FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete zones" ON public.zones FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert tournaments" ON public.tournaments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update tournaments" ON public.tournaments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete tournaments" ON public.tournaments FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert matches" ON public.matches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update matches" ON public.matches FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete matches" ON public.matches FOR DELETE USING (auth.role() = 'authenticated');


-- =============================================================================
-- SECURE DATABASE FUNCTIONS (RPCs) FOR USER MANAGEMENT
-- =============================================================================

-- 1. Authenticate a user
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

-- 2. Create a user
CREATE OR REPLACE FUNCTION public.create_user(p_username text, p_password text, p_role text)
RETURNS uuid AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Check if username already exists
    IF EXISTS (SELECT 1 FROM public.users u WHERE LOWER(u.username) = LOWER(p_username)) THEN
        RAISE EXCEPTION 'El nombre de usuario % ya existe', p_username;
    END IF;

    INSERT INTO public.users (username, password_hash, role)
    VALUES (p_username, crypt(p_password, gen_salt('bf')), p_role)
    RETURNING id INTO v_user_id;
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update user password
CREATE OR REPLACE FUNCTION public.update_user_password(p_user_id uuid, p_new_password text)
RETURNS boolean AS $$
BEGIN
    UPDATE public.users
    SET password_hash = crypt(p_new_password, gen_salt('bf'))
    WHERE id = p_user_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Toggle user active status
CREATE OR REPLACE FUNCTION public.toggle_user_active(p_user_id uuid, p_is_active boolean)
RETURNS boolean AS $$
BEGIN
    UPDATE public.users
    SET is_active = p_is_active
    WHERE id = p_user_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Fetch safe user profiles (excluding password_hash)
CREATE OR REPLACE FUNCTION public.fetch_users()
RETURNS TABLE (id uuid, username text, role text, is_active boolean, created_at timestamp with time zone) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.username, u.role, u.is_active, u.created_at
    FROM public.users u
    ORDER BY u.username ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
