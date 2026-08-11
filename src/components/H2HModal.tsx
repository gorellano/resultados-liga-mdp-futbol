import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Swords, Trophy, Calendar } from 'lucide-react';
import type { Team, Match, Standing } from '../lib/types';
import { calculateH2HStats } from '../lib/h2h';
import { cn } from '../App';

interface H2HModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamA: Team | null;
  teamB: Team | null;
  divisionName?: string;
  allMatches: Match[];
  standings?: Standing[];
}

export function H2HModal({
  isOpen,
  onClose,
  teamA,
  teamB,
  divisionName,
  allMatches,
  standings = []
}: H2HModalProps) {
  const stats = useMemo(() => {
    if (!teamA || !teamB) return null;
    return calculateH2HStats(teamA.id, teamB.id, allMatches, standings);
  }, [teamA, teamB, allMatches, standings]);

  if (!isOpen || !teamA || !teamB || !stats) return null;

  const totalWins = stats.winsA + stats.winsB;
  const pctA = totalWins > 0 ? Math.round((stats.winsA / totalWins) * 100) : 50;
  const pctB = totalWins > 0 ? Math.round((stats.winsB / totalWins) * 100) : 50;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-card border border-border/60 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border/50 bg-gradient-to-r from-primary/10 via-muted/30 to-primary/10">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/15 rounded-xl text-primary">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Cara a Cara (H2H)</h2>
                {divisionName && (
                  <p className="text-xs text-muted-foreground">{divisionName}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            {/* Enfrentamiento principal */}
            <div className="grid grid-cols-3 items-center bg-muted/20 border border-border/50 rounded-2xl p-4 sm:p-6 text-center relative overflow-hidden">
              {/* Equipo A */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-background border border-border/60 shadow-xs flex items-center justify-center p-2">
                  {teamA.logo_url ? (
                    <img src={teamA.logo_url} alt={teamA.name} className="w-full h-full object-contain" />
                  ) : (
                    <Shield className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <span className="font-extrabold text-sm sm:text-base leading-tight max-w-[110px] truncate" title={teamA.name}>
                  {teamA.display_name ?? teamA.name}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-primary">{stats.winsA}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Victorias</span>
              </div>

              {/* VS Badge & Empates */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-black text-xs sm:text-sm shadow-md tracking-wider">
                  VS
                </div>
                <span className="text-xs sm:text-sm font-bold text-muted-foreground mt-1">
                  {stats.matchesPlayed} jugados
                </span>
                <div className="px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold text-xs">
                  {stats.draws} {stats.draws === 1 ? 'empate' : 'empates'}
                </div>
              </div>

              {/* Equipo B */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-background border border-border/60 shadow-xs flex items-center justify-center p-2">
                  {teamB.logo_url ? (
                    <img src={teamB.logo_url} alt={teamB.name} className="w-full h-full object-contain" />
                  ) : (
                    <Shield className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <span className="font-extrabold text-sm sm:text-base leading-tight max-w-[110px] truncate" title={teamB.name}>
                  {teamB.display_name ?? teamB.name}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-primary">{stats.winsB}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Victorias</span>
              </div>
            </div>

            {/* Barra comparativa de dominancia */}
            {totalWins > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-primary">{teamA.display_name ?? teamA.name} ({pctA}%)</span>
                  <span className="text-primary">{teamB.display_name ?? teamB.name} ({pctB}%)</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
                  <div className="bg-primary h-full transition-all duration-500" style={{ width: `${pctA}%` }} />
                  <div className="bg-primary/40 h-full transition-all duration-500" style={{ width: `${pctB}%` }} />
                </div>
              </div>
            )}

            {/* Comparativa de Tabla Actual */}
            {(stats.standingA || stats.standingB) && (
              <div className="bg-card/60 border border-border/50 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" /> Rendimiento en la Tabla
                </h4>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  {/* Puntos */}
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-primary w-12 text-left">{stats.standingA?.points ?? '—'} pts</span>
                    <span className="text-muted-foreground font-semibold">Puntos en tabla</span>
                    <span className="font-extrabold text-primary w-12 text-right">{stats.standingB?.points ?? '—'} pts</span>
                  </div>

                  {/* Diferencia de Gol */}
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-foreground w-12 text-left">
                      {stats.standingA ? (stats.standingA.goalDifference > 0 ? `+${stats.standingA.goalDifference}` : stats.standingA.goalDifference) : '—'}
                    </span>
                    <span className="text-muted-foreground font-semibold">Diferencia de Gol</span>
                    <span className="font-extrabold text-foreground w-12 text-right">
                      {stats.standingB ? (stats.standingB.goalDifference > 0 ? `+${stats.standingB.goalDifference}` : stats.standingB.goalDifference) : '—'}
                    </span>
                  </div>

                  {/* Goles a favor */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground w-12 text-left">{stats.standingA?.goalsFor ?? '—'}</span>
                    <span className="text-muted-foreground font-semibold">Goles Marcados</span>
                    <span className="font-semibold text-foreground w-12 text-right">{stats.standingB?.goalsFor ?? '—'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Historial de partidos jugados */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" /> Historial de Partidos
              </h4>

              {stats.h2hMatches.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border/60 rounded-2xl">
                  Sin partidos finalizados entre ambos en este torneo aún.
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.h2hMatches.map(m => {
                    const isAHome = m.home_team_id === teamA.id;
                    const homeName = isAHome ? (teamA.display_name ?? teamA.name) : (teamB.display_name ?? teamB.name);
                    const awayName = isAHome ? (teamB.display_name ?? teamB.name) : (teamA.display_name ?? teamA.name);

                    return (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-muted/30 border border-border/40 rounded-xl text-xs sm:text-sm">
                        <span className="text-muted-foreground font-semibold w-16">Fecha {m.round_number}</span>
                        <div className="flex items-center gap-2 flex-1 justify-center font-bold">
                          <span className={cn(isAHome ? "text-foreground" : "text-foreground")}>{homeName}</span>
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-black text-xs">
                            {m.home_goals} - {m.away_goals}
                          </span>
                          <span className={cn(!isAHome ? "text-foreground" : "text-foreground")}>{awayName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
