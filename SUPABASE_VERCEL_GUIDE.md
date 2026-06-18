# Guía Definitiva de Supabase y Vercel

Esta guía contiene el paso a paso exacto para crear tu base de datos desde cero, subir la aplicación a internet (Vercel) y, muy importante, **evitar que la base de datos se borre o se ponga en pausa por inactividad**.

---

## 1. Crear el Proyecto en Supabase

1. Ve a [Supabase](https://supabase.com) y crea una cuenta o inicia sesión.
2. Haz clic en **New Project** y dale un nombre al proyecto (ej: `resultados-lmf`).
3. Asigna una **Database Password** muy segura y elige la región más cercana a ti (ej: `South America (São Paulo)`).
4. Espera un par de minutos mientras el sistema prepara la base de datos.
5. Cuando esté lista, ve en el menú lateral izquierdo al **SQL Editor**.
6. Haz clic en **New Query**.
7. Primero, copia todo el contenido del archivo `supabase_schema.sql` (que creamos hoy) y pégalo ahí. Presiona **Run**. Esto creará todas las tablas y el sistema de usuarios seguro.
8. Luego, haz clic nuevamente en **New Query**, pega todo el contenido del archivo `supabase_seed.sql` (el script que recién generamos) y presiona **Run**. Esto insertará todos los torneos, zonas, equipos y todo el fixture de los 500+ partidos listos para recibir los resultados.

---

## 2. Conectar tu Código a Supabase

1. En Supabase, ve a **Project Settings** (el ícono del engranaje) > **API**.
2. Ahí vas a ver la **Project URL** y la **anon public key**.
3. En la carpeta de tu código (donde está el `package.json`), crea un archivo llamado `.env.local`.
4. Pega tus credenciales de esta manera:

```env
VITE_SUPABASE_URL=tu_project_url_aqui
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

¡Con esto, si ejecutas el código localmente (`npm run dev`), el sistema ya no usará datos de prueba, sino los datos reales de Supabase!

---

## 3. Desplegar tu web a todo el mundo con Vercel

1. Asegúrate de tener todo tu código subido a GitHub (usando `git push`).
2. Entra a [Vercel](https://vercel.com/) e inicia sesión con tu GitHub.
3. Haz clic en **Add New...** > **Project**.
4. Verás la lista de tus repositorios de GitHub. Ubica el de tu aplicación y haz clic en **Import**.
5. En la sección llamada **Environment Variables** (despliega la pestaña si está oculta), debes poner las credenciales igual que hiciste en tu PC:
   - Name: `VITE_SUPABASE_URL` | Value: `tu_project_url_aqui`
   - Haz clic en **Add**.
   - Name: `VITE_SUPABASE_ANON_KEY` | Value: `tu_anon_key_aqui`
   - Haz clic en **Add**.
6. Finalmente, haz clic en **Deploy**. 
7. Vercel te entregará en unos segundos una URL pública (ej. `resultados-lmf.vercel.app`) y todo tu sistema, junto con tu Panel de Admin, estará funcionando en vivo.

---

## 4. 🔴 CRÍTICO: Cómo evitar que Supabase borre tu base de datos

Supabase en su plan gratuito ("Free Tier") **pausa automáticamente las bases de datos si no reciben solicitudes por 7 días seguidos**. Si queda pausada y no entras a reactivarla manualmente, **puede ser borrada**. (Ya no son 30 días, ahora son 7 días).

Para evitar pagar los $25 mensuales del plan Pro, existe un truco totalmente legal y seguro para que la base de datos "crea" que alguien la está usando todo el tiempo: usar un sistema de alertas automático.

### El truco del "Heartbeat" (Latido) con Cron-job.org

Vamos a configurar un robot gratuito para que visite la base de datos de forma invisible una vez al día:

1. Entra en [cron-job.org](https://cron-job.org/) (es gratis y no pide tarjeta de crédito).
2. Regístrate e inicia sesión.
3. Haz clic en **CREATE CRONJOB** (Crear tarea programada).
4. **Title:** Ponle `Mantener Supabase LMF Activo`.
5. **URL:** Acá debes poner una dirección que obligue a la base de datos a despertarse. La ruta oficial para hacer esto usando la API de Supabase es tu URL de proyecto seguida de `/rest/v1/tournaments?select=id&limit=1`.
   * *Ejemplo:* `https://abcdefghijklmnopq.supabase.co/rest/v1/tournaments?select=id&limit=1` (Reemplaza con TU verdadera URL).
6. **Execution schedule:** Elige `Every day` (Todos los días).
7. Haz clic en la pestaña inferior llamada **Advanced** (Avanzado).
8. En la sección **Headers**, haz clic en **Add header**.
9. En el recuadro de la izquierda (Key) escribe: `apikey`
10. En el recuadro de la derecha (Value) pega tu: `VITE_SUPABASE_ANON_KEY` (la larguísima que empieza con `eyJ...`).
11. Haz clic en **CREATE** para guardar.

¡Listo! A partir de ahora, Cron-Job hará una "visita" invisible todos los días a tu base de datos de Supabase simulando ser un usuario real de tu aplicación. Al ver que tiene tráfico diario, **Supabase jamás pondrá en pausa tu base de datos** y tendrás tu sistema en línea 24/7 sin pagar un centavo de forma permanente.
