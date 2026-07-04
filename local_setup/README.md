# Guía de Entorno Local con Supabase

Estos pasos te permiten tener una base de datos PostgreSQL local idéntica a la de producción, sin tocar nada de la BD real.

---

## Opción A — Supabase Local (CLI) ✅ Recomendada

Supabase CLI levanta un PostgreSQL + API local en tu máquina usando Docker. Es la opción más fiel a producción porque las URLs y la anon key son compatibles directamente con la app.

### Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Node.js instalado (ya lo tenés)

### Paso 1 — Instalar Supabase CLI

```bash
# Desde la carpeta del proyecto
npx supabase --version
```

Si no está instalado:
```bash
npm install -g supabase
```

### Paso 2 — Iniciar el entorno local

```bash
# Desde la carpeta del proyecto
supabase start
```

La primera vez descarga las imágenes Docker (tarda ~5 minutos). Cuando termina, muestra algo así:

```
API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
anon key: eyJhbGci...
service_role key: eyJhbGci...
```

> **Anotá la `anon key` que te muestra**, la vas a necesitar en el paso 4.

### Paso 3 — Ejecutar los scripts SQL

Hay dos formas de hacerlo:

#### Opción 3a — Por terminal (recomendado)

```bash
# Ejecutar el schema (tablas, funciones)
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f local_setup/01_schema.sql

# Ejecutar los datos de ejemplo
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f local_setup/02_seed_data.sql
```

#### Opción 3b — Por DBeaver

1. Abrir DBeaver
2. Crear una nueva conexión → **PostgreSQL**
3. Completar con estos datos:

   | Campo | Valor |
   |-------|-------|
   | Host | `127.0.0.1` |
   | Port | `54322` |
   | Database | `postgres` |
   | Username | `postgres` |
   | Password | `postgres` |

4. Conectar y verificar que se ve la base
5. Abrir el archivo `local_setup/01_schema.sql` con DBeaver (File → Open SQL Script)
6. Ejecutarlo completo (Ctrl+Alt+X o botón ▶)
7. Repetir con `local_setup/02_seed_data.sql`

### Paso 4 — Configurar el `.env.local`

Reemplazá el contenido de tu `.env.local` con:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<la anon key que mostró supabase start>
VITE_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjZJkqYZBjOTMcpwBNqk7NXk4yAI
```

> La `anon key` local es siempre la misma para Supabase CLI local. La que está en `local_setup/.env.local.example` es la estándar. Copiá ese archivo directamente:

```bash
cp local_setup/.env.local.example .env.local
```

### Paso 5 — Levantar la app

```bash
npm run dev
```

La app ahora apunta a tu BD local. Podés hacer pruebas, cargar datos, borrar cosas — **sin tocar producción**.

### Paso 6 — Detener el entorno local

```bash
supabase stop
```

Cuando volvés a hacer `supabase start`, los datos persisten.

---

## Opción B — PostgreSQL directo (sin Docker)

Si preferís usar PostgreSQL instalado directamente en tu Mac (más liviano que Docker):

### Instalar PostgreSQL

```bash
# Con Homebrew
brew install postgresql@16
brew services start postgresql@16
```

### Crear la base de datos

```bash
createdb lmf_local
```

### Ejecutar los scripts

```bash
psql lmf_local -f local_setup/01_schema.sql
psql lmf_local -f local_setup/02_seed_data.sql
```

### Configurar DBeaver

| Campo | Valor |
|-------|-------|
| Host | `127.0.0.1` |
| Port | `5432` |
| Database | `lmf_local` |
| Username | tu usuario de macOS |
| Password | (vacío, si no configuraste una) |

### Limitación importante ⚠️

Con esta opción **la app NO puede conectarse** a tu BD local directamente, porque Vite necesita la URL y las claves de Supabase (que son específicas de su API REST). Esta opción solo sirve para explorar los datos con DBeaver o hacer pruebas de SQL — no para correr la app apuntando a local.

Para correr la app completa en local, necesitás la **Opción A** (Supabase CLI + Docker).

---

## Resumen de credenciales locales

| Dato | Valor |
|------|-------|
| URL de la API | `http://127.0.0.1:54321` |
| URL directa PostgreSQL | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Usuario admin app | `superadmin` / `Admin.2026!` |
| Usuario editor app | `editor` / `Editor.2026!` |
| Supabase Studio (UI web) | `http://127.0.0.1:54323` |

---

## Cómo restaurar al entorno de producción

Cuando terminás de probar y querés volver a producción, simplemente restaurás el `.env.local` original:

```bash
# Guardar el local por si lo necesitás de nuevo
cp .env.local .env.local.local_backup

# Restaurar producción (tenés que tener guardado el contenido original)
# O simplemente editar el archivo y poner de vuelta los valores de producción:
# VITE_SUPABASE_URL=https://cwioddxcjwstvotmkdnt.supabase.co
# VITE_SUPABASE_ANON_KEY=<tu anon key de producción>
# VITE_VAPID_PUBLIC_KEY=<tu vapid key de producción>
```

---

## Archivos en esta carpeta

| Archivo | Qué hace |
|---------|----------|
| `01_schema.sql` | Crea todas las tablas y funciones desde cero |
| `02_seed_data.sql` | Carga datos de ejemplo (equipos, divisiones, partidos, etc.) |
| `.env.local.example` | Variables de entorno para apuntar a la BD local |
| `README.md` | Esta guía |
