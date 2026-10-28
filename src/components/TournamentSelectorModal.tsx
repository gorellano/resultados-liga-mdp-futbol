import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle2, X, Sparkles, Shield, ChevronRight } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { ADARO_TOURNAMENT_ID } from '../lib/mockAdaroData';
import type { Tournament } from '../lib/types';

export const TournamentSelectorModal: React.FC = () => {
  const { tournaments, selectedTournament, setTournament, isSelectorOpen, closeSelector } = useTournament();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSelector();
    };
    if (isSelectorOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isSelectorOpen, closeSelector]);

  if (!isSelectorOpen) return null;

  const handleSelect = (tourn: Tournament) => {
    setTournament(tourn);
    closeSelector();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSelector}
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-lg bg-background/95 border border-border/70 rounded-t-3xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden z-10 p-6 sm:p-7 max-h-[90vh] flex flex-col"
          style={{
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/40">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
                <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-foreground">
                  Seleccionar Torneo
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Alterna entre formatos oficiales y archivo histórico
                </p>
              </div>
            </div>
            <button
              onClick={closeSelector}
              className="p-2 rounded-full hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors active:scale-90"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tournament List */}
          <div className="py-4 space-y-3.5 overflow-y-auto pr-1">
            {tournaments
              .filter(t => {
                const name = t.name.toLowerCase();
                return (
                  !name.includes('cacho') &&
                  !name.includes('mendez') &&
                  !name.includes('méndez') &&
                  !name.includes('joaquin') &&
                  !name.includes('joaquín') &&
                  !name.includes('reyes')
                );
              })
              .map((tourn) => {
              const isSelected = selectedTournament?.id === tourn.id;
              const isAdaro = tourn.id === ADARO_TOURNAMENT_ID || tourn.name.toLowerCase().includes('adaro');

              return (
                <div
                  key={tourn.id}
                  onClick={() => handleSelect(tourn)}
                  className={`group relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
                    isSelected
                      ? 'bg-primary/5 dark:bg-primary/10 border-primary/60 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.25)] ring-1 ring-primary/40'
                      : 'bg-card/50 hover:bg-muted/50 border-border/60 hover:border-border shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                      <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                        isAdaro 
                          ? 'bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/30 text-amber-500' 
                          : 'bg-muted border border-border text-muted-foreground'
                      }`}>
                        {isAdaro ? (
                          <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" />
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-bold text-sm sm:text-base tracking-tight text-foreground">
                            {tourn.name}
                          </h4>
                          {isAdaro ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              En Juego · 2026
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border/50">
                              Liga Tradicional
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {isAdaro 
                            ? 'Fase inicial en 7 Zonas (A a G) por sumatoria de tiras (7ª a 14ª) y clasificación a 4 Copas de Playoffs (Platino, Oro, Plata, Bronce).' 
                            : 'Zonas Campeonato y Promoción con tablas de posiciones y fixtures individuales por división.'
                          }
                        </p>

                        {/* Pills de características */}
                        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                          {isAdaro ? (
                            <>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                                💎 Platino
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                🥇 Oro
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20">
                                🥈 Plata
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20">
                                🥉 Bronce
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
                                7ª a 16ª
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
                                Campeonato & Promoción
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center pl-2">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>


        </motion.div>
      </div>
    </AnimatePresence>
  );
};
