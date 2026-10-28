-- Agrega columna is_deleted para soportar borrado lógico de mensajes
-- Correr en: Supabase Dashboard → SQL Editor → New Query

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- También agregar is_read si aún no existe
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;
