-- Modificamos la tabla actual para agregar la columna is_read
ALTER TABLE public.contact_messages 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false NOT NULL;

-- Permitimos que usuarios autenticados (los admins) puedan ver (SELECT) todos los mensajes
CREATE POLICY "Admins can view contact_messages" 
ON public.contact_messages FOR SELECT 
TO authenticated
USING (true);

-- Permitimos que usuarios autenticados (los admins) puedan actualizar (UPDATE) los mensajes (para marcarlos como leídos)
CREATE POLICY "Admins can update contact_messages" 
ON public.contact_messages FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);
