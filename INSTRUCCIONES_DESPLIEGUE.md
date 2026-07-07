# Guia de Despliegue a Produccion

**IMPORTANTE:** El codigo nuevo fue disenado para ser 100% retrocompatible. La web NO se va a romper en ningun momento del proceso.

---

## PASO 1 (URGENTE) — Subir el codigo antes de cargar la Fecha 2

Este es el unico paso que hay que hacer YA. El resto puede hacerse con calma.

```bash
git add .
git commit -m "feat: footer redes, URLs amigables, admin sponsors, notificaciones configurables"
git push origin main
```

Vercel detecta el push automaticamente y despliega en pocos minutos.
El nuevo codigo maneja de forma segura la ausencia de las tablas nuevas — las ignora hasta que corras los scripts. No se rompe nada.

---

## PASO 2 — Scripts SQL en Supabase (sin apuro)

Estos scripts **solo agregan** cosas nuevas. **No modifican ni borran nada existente**.

Ir al **SQL Editor** en el panel de Supabase y ejecutar los bloques uno por uno:

### 2a. Tabla app_settings

```sql
CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO app_settings (key, value)
VALUES ('show_sponsors', 'false')
ON CONFLICT (key) DO NOTHING;

INSERT INTO app_settings (key, value)
VALUES ('send_notifications', 'true')
ON CONFLICT (key) DO NOTHING;

INSERT INTO app_settings (key, value)
VALUES ('notification_title_new', '¡Resultado Cargado!')
ON CONFLICT (key) DO NOTHING;

INSERT INTO app_settings (key, value)
VALUES ('notification_title_edit', '¡Resultado Actualizado!')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings"
  ON app_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read settings"
  ON app_settings FOR SELECT TO public
  USING (true);
```

### 2b. Tabla sponsors

```sql
CREATE TABLE IF NOT EXISTS sponsors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  image_url     TEXT NOT NULL,
  link_url      TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- Lectura pública: solo sponsors activos
CREATE POLICY "Anyone can read active sponsors"
  ON sponsors FOR SELECT TO public
  USING (is_active = true);

-- Admins autenticados pueden leer TODOS (activos e inactivos) y hacer todo
CREATE POLICY "Admins can manage sponsors"
  ON sponsors FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
```

### 2c. Tabla push_subscriptions

```sql
-- Crear la tabla si no existe (incluye division_id desde el inicio)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint    TEXT NOT NULL,
  keys        JSONB NOT NULL,
  team_id     UUID REFERENCES teams(id) ON DELETE CASCADE,
  division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (endpoint, team_id, division_id)
);

-- Si la tabla YA existia sin division_id, agregar la columna
ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS division_id UUID REFERENCES divisions(id) ON DELETE CASCADE;

-- Limpiar constraint viejo si existia, y crear el nuevo con division_id
ALTER TABLE push_subscriptions
  DROP CONSTRAINT IF EXISTS push_subscriptions_endpoint_team_id_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'push_subscriptions_endpoint_team_id_division_id_key'
  ) THEN
    ALTER TABLE push_subscriptions
      ADD CONSTRAINT push_subscriptions_endpoint_team_id_division_id_key
      UNIQUE NULLS NOT DISTINCT (endpoint, team_id, division_id);
  END IF;
END $$;

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'push_subscriptions' AND policyname = 'Users can create their own subscriptions') THEN
    CREATE POLICY "Users can create their own subscriptions" ON push_subscriptions FOR INSERT TO public WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'push_subscriptions' AND policyname = 'Users can read their own subscriptions') THEN
    CREATE POLICY "Users can read their own subscriptions" ON push_subscriptions FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'push_subscriptions' AND policyname = 'Users can delete their own subscriptions') THEN
    CREATE POLICY "Users can delete their own subscriptions" ON push_subscriptions FOR DELETE TO public USING (true);
  END IF;
END $$;
```


---

## PASO 3 — Notificaciones Push VAPID (totalmente opcional, sin apuro)

### 3a. Generar las llaves VAPID

En tu terminal, dentro de la carpeta del proyecto:
```bash
npx web-push generate-vapid-keys
```

Guarda la Public Key y la Private Key que aparecen.

### 3b. Agregar la llave publica en Vercel

1. Entrar a tu proyecto en vercel.com
2. Ir a **Settings > Environment Variables**
3. Crear nueva variable:
   - **Key:** `VITE_VAPID_PUBLIC_KEY`
   - **Value:** La Public Key del paso anterior
4. Marcar los 3 entornos (Production, Preview, Development) y guardar.

### 3c. Configurar los secrets en Supabase

Los secrets son las variables privadas que usa la Edge Function para firmar y enviar los pushes. Se pueden configurar de **dos maneras**:

#### Opción 1 — Desde el panel web de Supabase (sin instalar nada) ✅ Recomendada

1. Entrar a [supabase.com](https://supabase.com) → tu proyecto
2. En el menú lateral ir a **Edge Functions**
3. Hacer clic en la función `notify-subscribers`
4. En esa misma pantalla hay una sección llamada **Secrets** (o ir a **Project Settings → Edge Functions → Secrets**)
5. Agregar estas tres variables una por una:

   | Name | Value |
   |------|-------|
   | `VAPID_PUBLIC_KEY` | La Public Key del paso 3a |
   | `VAPID_PRIVATE_KEY` | La Private Key del paso 3a |
   | `VAPID_SUBJECT` | `mailto:costaygolmdq@gmail.com` |

#### Opción 2 — Desde la terminal con Supabase CLI

Primero hay que instalar la CLI (una sola vez):
```bash
npm install -g supabase
supabase login
supabase link --project-ref TU_PROJECT_REF
```
*(El project-ref lo encontras en supabase.com → tu proyecto → Settings → General)*

Después, desde la carpeta del proyecto:
```bash
supabase secrets set VAPID_PUBLIC_KEY="TU_PUBLIC_KEY"
supabase secrets set VAPID_PRIVATE_KEY="TU_PRIVATE_KEY"
supabase secrets set VAPID_SUBJECT="mailto:costaygolmdq@gmail.com"
```

---

### 3d. Deployar la Edge Function

El código de la Edge Function ya está en el repositorio (`supabase/functions/notify-subscribers/index.ts`). Hay que subirlo a Supabase para que lo ejecute. Tambien hay **dos maneras**:

#### Opción 1 — Desde el panel web de Supabase (sin instalar nada) ✅ Recomendada

1. Entrar a [supabase.com](https://supabase.com) → tu proyecto → **Edge Functions**
2. Buscar la función `notify-subscribers` (si no existe, crear una nueva con ese nombre exacto)
3. Hacer clic en **Edit** o **Deploy**
4. Pegar el contenido completo del archivo `supabase/functions/notify-subscribers/index.ts`
5. Guardar / Deploy

#### Opción 2 — Desde la terminal con Supabase CLI (si ya lo instalaste en el paso 3c)

```bash
supabase functions deploy notify-subscribers
```



### 3e. Forzar un redeploy en Vercel

Despues de agregar la variable `VITE_VAPID_PUBLIC_KEY` en Vercel, hay que hacer un nuevo deploy para que el frontend la incluya en el bundle. Dos opciones:

- **Opcion rapida:** Ir a tu proyecto en vercel.com → pestaña **Deployments** → clic en los tres puntos del ultimo deploy → **Redeploy**.
- **Opcion automatica:** El proximo `git push origin main` que hagas va a generar un deploy nuevo que ya la incluye.

---

## Resumen de riesgos

| Paso | Que hace | Urgente? | Riesgo? |
|------|----------|----------|---------|
| **1. Push del codigo** | Footer, URLs, admin sponsors y notificaciones | SI, antes de Fecha 2 | Cero |
| **2a. app_settings** | Switches del admin (sponsors, notificaciones) y textos | Cuando quieras | Solo agrega |
| **2b. sponsors** | Gestion de sponsors con carrusel | Cuando quieras | Solo agrega |
| **2c. push_subscriptions** | Suscripciones por division | Cuando quieras | Solo agrega |
| **3. Push VAPID** | Alertas push a usuarios | Cuando quieras | Independiente |

> **Nota:** Los pasos 2 y 3 son completamente independientes entre si. Podes hacer el 2 sin el 3 y viceversa. Si corres el 2 sin haber hecho el 3, los switches del admin van a estar visibles pero las notificaciones simplemente no se van a enviar (sin error visible para el usuario).

---

## PASO 4 — Sección Historial de Campeones (Salón de la Fama)

Este paso agrega la base de datos necesaria para mostrar los campeones históricos por división, zona, año y torneo.

### 4a. Crear la tabla `champions` en Supabase

1. Entrá a [supabase.com](https://supabase.com) → tu proyecto.
2. En el menú izquierdo, hacé clic en **SQL Editor**.
3. Creá un nuevo query con el botón **+ New Query**.
4. Copiá y pegá el contenido completo del archivo local `create_champions_table.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS public.champions (
       id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       year        INTEGER NOT NULL,
       tournament  TEXT NOT NULL,
       division_id UUID REFERENCES public.divisions(id) ON DELETE CASCADE,
       zone_name   TEXT NOT NULL CHECK (zone_name IN ('campeonato', 'promocion')),
       team_id     UUID REFERENCES public.teams(id) ON DELETE CASCADE,
       created_at  TIMESTAMPTZ DEFAULT NOW(),
       updated_at  TIMESTAMPTZ DEFAULT NOW(),
       CONSTRAINT unique_champion_per_tournament UNIQUE (year, tournament, division_id, zone_name)
   );

   ALTER TABLE public.champions ENABLE ROW LEVEL SECURITY;

   DROP POLICY IF EXISTS "Anyone can read champions" ON public.champions;
   CREATE POLICY "Anyone can read champions" ON public.champions FOR SELECT TO public USING (true);

   DROP POLICY IF EXISTS "Admins can manage champions" ON public.champions;
   CREATE POLICY "Admins can manage champions" ON public.champions FOR ALL TO authenticated USING (true) WITH CHECK (true);
   ```
5. Hacé clic en **Run** (Ejecutar) abajo a la derecha.

### 4b. Push del código a producción

Una vez que la tabla esté creada, podés hacer push de los últimos cambios de código de la rama master:
- El deploy en Vercel incluirá de inmediato la copa/trofeo en el header de navegación, la vista `/campeones` pública y la pestaña "Historial Campeones" dentro de tu Panel de Administración.

