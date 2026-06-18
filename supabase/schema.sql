-- Schema para Resultados LMF

-- ==========================================
-- 1. Tablas Core
-- ==========================================

-- Tabla de Usuarios/Perfiles para Roles Admin
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'editor')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- Tabla de Equipos (Con Borrado Lógico)
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  logo_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de Torneos/Años
CREATE TABLE tournaments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL, -- ej. "Apertura"
  year integer NOT NULL, -- ej. 2026
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- 2. Tablas Relacionales (Fixture y Zonas)
-- ==========================================

-- Asignación de Equipos a Torneos y Zonas (Campeonato o Promoción)
CREATE TABLE tournament_teams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  zone text NOT NULL CHECK (zone IN ('campeonato', 'promocion')),
  penalty_points integer DEFAULT 0, -- Quita de puntos (Tribunal de Disciplina)
  UNIQUE(tournament_id, team_id)
);

-- Tabla de Partidos (Fixture y Resultados)
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  zone text NOT NULL CHECK (zone IN ('campeonato', 'promocion')),
  round_number integer NOT NULL, -- Fecha (1, 2, 3...)
  home_team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  home_goals integer,
  away_goals integer,
  status text NOT NULL CHECK (status IN ('scheduled', 'finished', 'postponed')) DEFAULT 'scheduled',
  match_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ==========================================
-- 3. Storage
-- ==========================================
-- (Desde el Dashboard de Supabase hay que crear un bucket público llamado 'logos')

-- ==========================================
-- 4. Row Level Security (RLS)
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Políticas de Lectura (Público)
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Teams are viewable by everyone." ON teams FOR SELECT USING (true);
CREATE POLICY "Tournaments are viewable by everyone." ON tournaments FOR SELECT USING (true);
CREATE POLICY "Tournament Teams are viewable by everyone." ON tournament_teams FOR SELECT USING (true);
CREATE POLICY "Matches are viewable by everyone." ON matches FOR SELECT USING (true);

-- Políticas de Escritura (Solo Administradores)
CREATE POLICY "Only super admins can insert teams" ON teams FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
);

CREATE POLICY "Only super admins can update teams" ON teams FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
);

CREATE POLICY "Admins can update matches" ON matches FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'editor'))
);

-- (Y así sucesivamente para Insertar/Borrar Torneos y Matches)

-- ==========================================
-- 5. Trigger Inicial para Usuario Admin
-- ==========================================
-- Función para crear automáticamente el perfil tras el signup
CREATE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'super_admin'); -- Al primer usuario lo hacemos super_admin por defecto
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
