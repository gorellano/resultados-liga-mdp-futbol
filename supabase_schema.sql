-- Supabase Schema for LMF Results WebApp

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
    name TEXT NOT NULL, -- e.g., 'Apertura 2026'
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create table for Matches (Fixture & Results)
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
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Read access for everyone (Public)
CREATE POLICY "Public profiles are viewable by everyone." ON public.divisions FOR SELECT USING (true);
CREATE POLICY "Public profiles are viewable by everyone." ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public profiles are viewable by everyone." ON public.zones FOR SELECT USING (true);
CREATE POLICY "Public profiles are viewable by everyone." ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Public profiles are viewable by everyone." ON public.matches FOR SELECT USING (true);

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
