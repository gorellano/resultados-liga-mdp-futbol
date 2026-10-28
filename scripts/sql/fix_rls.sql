-- Deshabilitamos RLS en la tabla contact_messages para que coincida con el resto de las tablas del sistema
-- y permita que el frontend (que no usa Supabase Auth) pueda leer y actualizar los mensajes.

ALTER TABLE public.contact_messages DISABLE ROW LEVEL SECURITY;
