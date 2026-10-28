-- SQL Script to resolve silent write failures in the LMF Admin Dashboard.
-- Since the application uses a custom username/password login system (via RPC),
-- the Supabase client executes database operations under the anonymous public role.
-- We disable Row Level Security (RLS) on content tables to allow direct admin operations.
-- Note: The sensitive 'users' table remains protected by RLS and RPC-only access.

ALTER TABLE public.divisions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;

-- Output confirmation message
SELECT 'RLS deshabilitado exitosamente en tablas de contenido.' AS resultado;
