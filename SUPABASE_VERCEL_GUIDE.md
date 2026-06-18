# Guía de Base de Datos y Despliegue

Esta guía contiene todo lo necesario para configurar tu base de datos en Supabase, poblarla de datos, conectarla al proyecto y finalmente desplegar la aplicación en Vercel.

---

## 1. Script SQL Completo para Supabase

Copia y pega el siguiente script en el **SQL Editor** de tu proyecto en Supabase para crear todas las tablas, configurar la seguridad (RLS) y preparar la base de datos para la aplicación.

```sql
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
  penalty_points integer DEFAULT 0, -- Quita de puntos
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
-- 3. Row Level Security (RLS)
-- ==========================================
-- Activar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Políticas de Lectura (Público: cualquier persona puede ver los resultados)
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Teams are viewable by everyone." ON teams FOR SELECT USING (true);
CREATE POLICY "Tournaments are viewable by everyone." ON tournaments FOR SELECT USING (true);
CREATE POLICY "Tournament Teams are viewable by everyone." ON tournament_teams FOR SELECT USING (true);
CREATE POLICY "Matches are viewable by everyone." ON matches FOR SELECT USING (true);

-- Políticas de Escritura (Solo Administradores Autenticados)
CREATE POLICY "Only super admins can insert teams" ON teams FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
);

CREATE POLICY "Only super admins can update teams" ON teams FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
);

CREATE POLICY "Admins can update matches" ON matches FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'editor'))
);
CREATE POLICY "Admins can insert matches" ON matches FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'editor'))
);

-- ==========================================
-- 4. Creación Automática de Perfil Admin
-- ==========================================
-- Al registrar el primer usuario, se le asignará el rol de super_admin
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'super_admin');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 2. Cómo Crear la BD con Supabase

1. Ve a [Supabase](https://supabase.com) y crea una cuenta o inicia sesión.
2. Haz clic en **New Project**, selecciona tu organización y dale un nombre al proyecto (ej: `resultados-lmf`).
3. Asigna una contraseña segura para la base de datos y elige la región más cercana (ej: `South America (São Paulo)`).
4. Una vez creado el proyecto, ve a la sección **SQL Editor** en el menú lateral izquierdo.
5. Haz clic en **New Query**, pega todo el script del punto 1 y presiona **Run**. Esto creará todas las tablas y políticas.

---

## 3. Dónde Colocar los Datos en el Proyecto

Para conectar el frontend (tu código) con el backend (Supabase), necesitas las credenciales de tu proyecto.

1. En Supabase, ve a **Project Settings** (el ícono de engranaje) > **API**.
2. Copia la `Project URL` y la `anon public key`.
3. En la raíz de tu proyecto local (donde está el `package.json`), crea un archivo llamado `.env.local`.
4. Pega las variables de esta manera:

```env
VITE_SUPABASE_URL=tu_project_url_aqui
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### Sustitución de Datos (De Mock a Supabase)

Actualmente los datos visuales de los equipos están en `src/lib/mockData.ts`. 
Cuando comiences a ingresar los equipos en tu base de datos Supabase a través de la pestaña **Table Editor** o mediante el Panel de Admin de tu propia web, deberás modificar `src/lib/supabaseClient.ts` o los componentes donde haces fetch. 

Ejemplo para obtener los equipos:
```ts
import { supabase } from './supabaseClient';

export async function fetchTeams() {
  const { data, error } = await supabase.from('teams').select('*');
  if (error) console.error(error);
  return data;
}
```

---

## 4. Cómo Desplegar en Vercel

Una vez que tengas tu código subido a un repositorio en GitHub, desplegarlo es muy sencillo y gratuito.

1. Entra a [Vercel](https://vercel.com/) e inicia sesión con GitHub.
2. Haz clic en **Add New...** > **Project**.
3. Vercel te mostrará tus repositorios de GitHub. Busca el de tu aplicación y haz clic en **Import**.
4. En la sección **Environment Variables**, debes desplegar la flecha y agregar las credenciales de Supabase que pusiste en tu `.env.local` de forma manual:
   - Name: `VITE_SUPABASE_URL` | Value: `tu_project_url_aqui`
   - Name: `VITE_SUPABASE_ANON_KEY` | Value: `tu_anon_key_aqui`
   Haz clic en **Add** para cada una.
5. Haz clic en **Deploy**.
6. Vercel construirá tu proyecto (tardará unos segundos) y luego te entregará una URL en vivo (por ejemplo, `resultados-lmf.vercel.app`).
7. **Importante:** Ve a Supabase > **Authentication** > **URL Configuration** y agrega tu nueva URL de Vercel (incluyendo `https://`) a las **Site URLs** y **Redirect URLs** para que el login de administrador funcione en producción.
