-- Crea la tabla para almacenar los mensajes de contacto
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Seguridad a Nivel de Fila)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Crear política que permita a CUALQUIERA (incluso usuarios no logueados) insertar un mensaje
-- Pero NO les permite ver/leer los mensajes de otras personas.
CREATE POLICY "Allow public inserts on contact_messages" 
ON public.contact_messages FOR INSERT 
TO public
WITH CHECK (true);
