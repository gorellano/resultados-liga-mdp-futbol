-- Script para crear la tabla de campeones y sus políticas de seguridad (RLS)
-- Correr en: Supabase Dashboard → SQL Editor → New Query

CREATE TABLE IF NOT EXISTS public.champions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year        INTEGER NOT NULL,                     -- Ej: 2026
    tournament  TEXT NOT NULL,                       -- Ej: 'Apertura', 'Clausura'
    division_id UUID REFERENCES public.divisions(id) ON DELETE CASCADE,
    zone_name   TEXT NOT NULL CHECK (zone_name IN ('campeonato', 'promocion')),
    team_id     UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    -- Restricción para evitar campeones duplicados en la misma división, zona y torneo
    CONSTRAINT unique_champion_per_tournament UNIQUE (year, tournament, division_id, zone_name)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.champions ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "Anyone can read champions" ON public.champions;
CREATE POLICY "Anyone can read champions"
    ON public.champions FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Admins can manage champions" ON public.champions;
CREATE POLICY "Admins can manage champions"
    ON public.champions FOR ALL TO authenticated
    USING (true) WITH CHECK (true);
