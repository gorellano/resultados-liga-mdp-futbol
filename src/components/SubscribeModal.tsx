import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Division, Team } from '../lib/types';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  initialDivisions: string[] | null; // null means "All"
  onSave: (divisionIds: string[] | null) => Promise<void>;
  isSaving: boolean;
}

export function SubscribeModal({ isOpen, onClose, team, initialDivisions, onSave, isSaving }: SubscribeModalProps) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for selections
  const [selectAll, setSelectAll] = useState<boolean>(initialDivisions === null);
  const [selectedDivisions, setSelectedDivisions] = useState<Set<string>>(
    new Set(initialDivisions || [])
  );

  useEffect(() => {
    if (isOpen) {
      loadDivisions();
      setSelectAll(initialDivisions === null);
      setSelectedDivisions(new Set(initialDivisions || []));
    }
  }, [isOpen, initialDivisions]);

  async function loadDivisions() {
    setLoading(true);
    try {
      const { data } = await supabase.from('divisions').select('*').order('sort_order', { ascending: true });
      if (data) setDivisions(data);
    } catch (e) {
      console.error('Error loading divisions:', e);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleDivision = (divId: string) => {
    setSelectAll(false);
    const newSet = new Set(selectedDivisions);
    if (newSet.has(divId)) {
      newSet.delete(divId);
    } else {
      newSet.add(divId);
    }
    setSelectedDivisions(newSet);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedDivisions(new Set());
    }
  };

  const handleSave = () => {
    onSave(selectAll ? null : Array.from(selectedDivisions));
  };

  if (!isOpen || !team) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/20">
            <div>
              <h2 className="text-xl font-bold">Alertas de {team.display_name || team.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">Elige en qué divisiones quieres recibir notificaciones.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground animate-pulse">Cargando divisiones...</div>
            ) : (
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-border/50 cursor-pointer hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-5 h-5 rounded text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <span className="font-bold block">Todas las divisiones</span>
                    <span className="text-xs text-muted-foreground">Recibirás alertas de todas las categorías de este equipo.</span>
                  </div>
                </label>

                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Divisiones Específicas</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {divisions.map(div => (
                      <label key={div.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${selectAll ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/30'} transition-colors`}>
                        <input
                          type="checkbox"
                          disabled={selectAll}
                          checked={!selectAll && selectedDivisions.has(div.id)}
                          onChange={() => handleToggleDivision(div.id)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium">{div.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving || loading || (!selectAll && selectedDivisions.size === 0)}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Guardando...' : (
                <>
                  <Check className="w-4 h-4" />
                  Guardar Preferencias
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
