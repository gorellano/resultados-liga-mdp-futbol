import React, { useState } from 'react';
import { X, Mail, Send, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';


interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ContactModal({ isOpen, onClose, onSuccess }: ContactModalProps) {
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    // Reset fields on close
    handleCancel();
    onClose();
  };

  const handleCancel = () => {
    // Solo limpia los campos, no cierra el modal
    setEmail('');
    setTitle('');
    setBody('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación básica
    if (!email || !title || !body) {
      setError('Por favor completá todos los campos.');
      return;
    }

    // Validación de email más estricta (estándar RFC 5322 simplificado)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresá un email válido.');
      return;
    }

    if (body.length > 1000) {
      setError('El mensaje no puede superar los 1000 caracteres.');
      return;
    }

    setLoading(true);

    try {
      // Usamos el cliente de Supabase que automáticamente protege contra Inyección SQL usando consultas preparadas.
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert([{ 
          email: email.trim(), 
          title: title.trim(), 
          body: body.trim() 
        }]);

      if (dbError) {
        throw dbError;
      }

      // Éxito: Limpiamos los campos
      handleCancel();
      onSuccess(); // Disparamos la push notification
      onClose(); // Cerramos el modal
    } catch (err: any) {
      console.error('Error al enviar el mensaje:', err);
      setError('Hubo un error al enviar el mensaje. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] p-4"
          >
            <div className="bg-card border border-border/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Contacto</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-semibold ml-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    maxLength={100}
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="title" className="text-sm font-semibold ml-1">Asunto</label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="¿En qué te podemos ayudar?"
                    maxLength={150}
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="body" className="text-sm font-semibold ml-1">Mensaje</label>
                  <textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Escribe tu mensaje aquí..."
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none resize-none transition-all"
                    required
                  />
                  <div className="text-xs text-muted-foreground text-right mr-1">
                    {body.length}/1000
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2.5 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {loading ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
