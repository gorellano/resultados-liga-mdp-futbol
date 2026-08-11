import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../App';
import { calculateStandings, calculatePromedioStandings } from '../lib/standings';
import { Shield, Share2, Copy, Calendar, MapPin, Clock, Trophy, Award, ChevronRight, Star, Swords } from 'lucide-react';
import { format } from 'date-fns';
import { fetchTournaments, fetchDivisions, fetchZones, fetchTeams, fetchMatches } from '../lib/db';
import type { Team, Match } from '../lib/types';
import { villasDeportivas } from '../lib/villasDeportivas';
import { SponsorBanner } from '../components/SponsorBanner';
import { getTournamentConfig, ZONE_LABELS } from '../lib/divisionConfig';
import type { ZoneIndex } from '../lib/divisionConfig';
import { createSlug } from '../lib/slug';
import { useFavoriteTeam } from '../hooks/useFavoriteTeam';
import { H2HModal } from '../components/H2HModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ZoneData {
  zoneId: string;
  zoneName: string;
  matches: Match[];
}

type Phase = 'grupos' | 'eliminatoria';
type ZoneTab = ZoneIndex | 3; // 3 = Tabla General
type ContentTab = 'posiciones' | 'fixture';

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="p-6 animate-pulse space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 bg-muted/40 rounded-xl" />
      ))}
    </div>
  );
}

// ─── Standings Table ──────────────────────────────────────────────────────────

interface StandingRow {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  promedio?: number;
}

function StandingsTable({
  standings,
  showPromedio = false,
  formByTeam = {},
  divisionId,
}: {
  standings: StandingRow[];
  showPromedio?: boolean;
  formByTeam?: Record<string, ('G' | 'E' | 'P')[]>;
  divisionId?: string;
}) {
  const { toggleFavorite, isFavorite } = useFavoriteTeam();

  if (standings.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Sin partidos cargados aún</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="text-xs text-muted-foreground font-bold uppercase bg-muted/40 border-b border-border/50 select-none">
          <tr>
            <th className="px-2 py-3.5 sm:px-4 sm:py-4 md:px-6 text-center w-10 sm:w-16">Pos</th>
            <th className="px-2 py-3.5 sm:px-4 sm:py-4 md:px-6">Equipo</th>
            <th className="px-2 py-3.5 sm:px-4 sm:py-4 md:px-6 text-center">Pts</th>
            <th className="px-2 py-3.5 sm:px-4 sm:py-4 md:px-6 text-center">PJ</th>
            <th className="px-2 py-3.5 sm:px-4 sm:py-4 md:px-6 text-center hidden sm:table-cell">G</th>
            <th className="px-2 py-3.5 sm:px-4 sm:py-4 md:px-6 text-center hidden sm:table-cell">E</th>
            <th className="px-2 py-3.5 sm:px-4 sm:py-4 md:px-6 text-center hidden sm:table-cell">P</th>
            <th className="px-2 py-3.5 sm:px-4 sm:py-4 md:px-6 text-center hidden md:table-cell">GF</th>
            <th className="px-2 py-3.5 sm:px-4 sm:py-4 md:px-6 text-center hidden md:table-cell">GC</th>
            <th className="px-2 py-3.5 sm:px-4 sm:py-4 md:px-6 text-center">DIF</th>
            {showPromedio && (
              <th className="px-2 py-3.5 sm:px-4 sm:py-4 md:px-6 text-center hidden sm:table-cell">PROM</th>
            )}
            {!showPromedio && (
              <th className="px-2 py-3.5 sm:px-4 sm:py-4 md:px-6 text-center hidden sm:table-cell">Forma</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {standings.map((row, index) => {
            const isTop1 = index === 0;
            const isTop2 = index === 1;
            const isTop3 = index === 2;

            return (
              <tr
                key={row.team.id}
                className={cn(
                  "transition-all duration-200 group tabular-nums",
                  index % 2 === 0 ? "bg-card/30" : "bg-muted/20",
                  isTop1 ? "hover:bg-amber-500/10 dark:hover:bg-amber-500/15" :
                  isTop2 ? "hover:bg-slate-400/10 dark:hover:bg-slate-400/15" :
                  isTop3 ? "hover:bg-amber-700/10 dark:hover:bg-amber-700/15" :
                  "hover:bg-primary/5"
                )}
              >
                <td className="px-2 py-3 sm:px-4 sm:py-3.5 md:px-6 font-semibold text-muted-foreground text-center">
                  {isTop1 ? (
                    <div className="inline-flex items-center justify-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg sm:rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-extrabold text-[11px] sm:text-sm shadow-2xs mx-auto" title="1º Puesto - Líder">
                      <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-500/30 text-amber-500 shrink-0" />
                      <span>1</span>
                    </div>
                  ) : isTop2 ? (
                    <div className="inline-flex items-center justify-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg sm:rounded-xl bg-slate-300/30 dark:bg-slate-400/20 border border-slate-400/40 text-slate-700 dark:text-slate-200 font-extrabold text-[11px] sm:text-sm shadow-2xs mx-auto" title="2º Puesto">
                      <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 dark:text-slate-300 shrink-0" />
                      <span>2</span>
                    </div>
                  ) : isTop3 ? (
                    <div className="inline-flex items-center justify-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg sm:rounded-xl bg-amber-700/15 border border-amber-700/40 text-amber-800 dark:text-amber-400 font-extrabold text-[11px] sm:text-sm shadow-2xs mx-auto" title="3º Puesto">
                      <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
                      <span>3</span>
                    </div>
                  ) : (
                    <span className="text-xs sm:text-sm font-extrabold text-muted-foreground/70">{index + 1}</span>
                  )}
                </td>
                <td className="px-2 py-3 sm:px-4 sm:py-3.5 md:px-6 font-bold flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(row.team.id, divisionId);
                    }}
                    className="p-1.5 -ml-1 sm:ml-0 hover:scale-125 transition-transform shrink-0 touch-manipulation"
                    title={isFavorite(row.team.id, divisionId) ? "Quitar de favoritos" : "Marcar como mi equipo favorito ⭐️"}
                  >
                    <Star className={cn("w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors", isFavorite(row.team.id, divisionId) ? "fill-amber-400 text-amber-500 drop-shadow-xs" : "text-amber-500/50 dark:text-amber-400/50 hover:text-amber-400")} />
                  </button>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background border border-border/60 shadow-xs flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-110 group-hover:border-primary/40 transition-all duration-300">
                    {row.team.logo_url ? (
                      <img src={row.team.logo_url} alt={row.team.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className={cn("truncate max-w-[100px] xs:max-w-[140px] sm:max-w-none text-xs sm:text-base tracking-tight", isTop1 ? "text-primary font-extrabold" : "text-foreground", isFavorite(row.team.id, divisionId) && "font-black text-amber-600 dark:text-amber-400")}>
                    {row.team.display_name ?? row.team.name}
                  </span>
                </td>
                <td className="px-2 py-3 sm:px-4 sm:py-3.5 md:px-6 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary/15 text-primary font-extrabold text-xs sm:text-base shadow-2xs">
                    {row.points}
                  </span>
                </td>
                <td className="px-2 py-3 sm:px-4 sm:py-3.5 md:px-6 text-center text-foreground font-semibold text-xs sm:text-sm">{row.played}</td>
                <td className="px-2 py-3 sm:px-4 sm:py-3.5 md:px-6 text-center hidden sm:table-cell text-muted-foreground font-medium">{row.won}</td>
                <td className="px-2 py-3 sm:px-4 sm:py-3.5 md:px-6 text-center hidden sm:table-cell text-muted-foreground font-medium">{row.drawn}</td>
                <td className="px-2 py-3 sm:px-4 sm:py-3.5 md:px-6 text-center hidden sm:table-cell text-muted-foreground font-medium">{row.lost}</td>
                <td className="px-2 py-3 sm:px-4 sm:py-3.5 md:px-6 text-center hidden md:table-cell text-muted-foreground font-medium">{row.goalsFor}</td>
                <td className="px-2 py-3 sm:px-4 sm:py-3.5 md:px-6 text-center hidden md:table-cell text-muted-foreground font-medium">{row.goalsAgainst}</td>
                <td className="px-2 py-3 sm:px-4 sm:py-3.5 md:px-6 text-center font-bold">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold inline-block min-w-[28px]",
                    row.goalDifference > 0 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" :
                    row.goalDifference < 0 ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20" :
                    "bg-muted text-muted-foreground border border-border/40"
                  )}>
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </span>
                </td>
                {showPromedio && (
                  <td className="px-2 py-3 sm:px-4 sm:py-3.5 md:px-6 text-center hidden sm:table-cell font-extrabold text-primary text-xs sm:text-sm">
                    {(row.promedio ?? 0).toFixed(2)}
                  </td>
                )}
                {!showPromedio && (
                  <td className="px-1.5 py-3 sm:px-3 sm:py-3.5 hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {formByTeam[row.team.id]?.map((outcome, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            "w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-black shadow-2xs select-none shrink-0 transition-transform hover:scale-125 duration-200 cursor-default",
                            outcome === 'G' ? "bg-emerald-500 text-white dark:bg-emerald-600 dark:text-emerald-50" :
                            outcome === 'E' ? "bg-amber-500 text-white dark:bg-amber-600 dark:text-amber-50" :
                            "bg-rose-500 text-white dark:bg-rose-600 dark:text-rose-50"
                          )}
                          title={outcome === 'G' ? 'Ganó' : outcome === 'E' ? 'Empató' : 'Perdió'}
                        >
                          {outcome}
                        </span>
                      ))}
                      {(!formByTeam[row.team.id] || formByTeam[row.team.id].length === 0) && (
                        <span className="text-muted-foreground/60 text-xs font-medium">—</span>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Match Card ───────────────────────────────────────────────────────────────

function MatchCard({
  match,
  teams,
  copiedMatchId,
  onShare,
  onOpenH2H,
}: {
  match: Match;
  teams: Team[];
  copiedMatchId: string | null;
  onShare: (match: Match) => void;
  onOpenH2H?: (teamA: Team, teamB: Team) => void;
}) {
  const home = teams.find(t => t.id === match.home_team_id);
  const away = teams.find(t => t.id === match.away_team_id);
  if (!home || !away) return null;

  const homeVilla = villasDeportivas[home.name];
  const mapsUrl = homeVilla?.googleMapsUrl;
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  const homeWon = isFinished && (match.home_goals ?? 0) > (match.away_goals ?? 0);
  const awayWon = isFinished && (match.away_goals ?? 0) > (match.home_goals ?? 0);

  return (
    <div className="flex flex-col bg-card/60 border border-border/60 rounded-2xl p-5 hover:shadow-lg hover:border-primary/40 transition-all duration-300 relative group/match">
      <div className="flex justify-between items-center mb-5 text-xs text-muted-foreground font-semibold uppercase tracking-wider select-none">
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 border",
            isFinished ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" :
            isLive ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25" :
            "bg-muted/80 text-muted-foreground border-border/50"
          )}>
            {isLive ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-soft-pulse" />
                EN JUEGO
              </>
            ) : isFinished ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                FINALIZADO
              </>
            ) : (
              'POR JUGARSE'
            )}
          </span>
          {onOpenH2H && (
            <button
              onClick={() => onOpenH2H(home, away)}
              className="px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-extrabold text-[11px] flex items-center gap-1 border border-primary/20 transition-all active:scale-95"
              title="Ver estadísticas y duelo cara a cara (H2H)"
            >
              <Swords className="w-3 h-3" />
              <span>VS</span>
            </button>
          )}
          <button
            onClick={() => onShare(match)}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-200 cursor-pointer",
              copiedMatchId === match.id
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "hover:bg-muted text-muted-foreground hover:text-primary"
            )}
            title="Copiar resultado al portapapeles"
          >
            {copiedMatchId === match.id ? (
              <span className="text-[10px] font-extrabold px-1">✓ Copiado</span>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-emerald-500 transition-all duration-200 cursor-pointer flex items-center justify-center"
              title={`Ubicación: ${homeVilla.stadiumName || 'Villa Deportiva'}`}
            >
              <MapPin className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        {match.match_date && (
          <span className="font-bold text-foreground/80">{format(new Date(match.match_date), 'HH:mm')} hs</span>
        )}
      </div>
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-col items-center gap-2.5 flex-1">
          <div className={cn("w-14 h-14 rounded-full bg-background border shadow-xs flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover/match:scale-105", homeWon ? "border-primary/80 ring-2 ring-primary/20" : "border-border/60")}>
            {home.logo_url ? <img src={home.logo_url} className="w-full h-full object-contain p-2" alt={home.name} /> : <Shield className="w-6 h-6 text-muted-foreground" />}
          </div>
          <span className={cn("text-sm text-center line-clamp-2 leading-tight transition-colors", homeWon ? "font-extrabold text-primary" : "font-semibold text-foreground/90")}>
            {home.display_name ?? home.name}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2.5 font-black text-2xl sm:text-3xl px-4 py-2.5 bg-muted/40 rounded-2xl border border-border/50 min-w-[95px] shadow-inner select-none">
          {isFinished ? (
            <>
              <span className={cn(homeWon ? "text-primary font-black" : "text-foreground/70")}>{match.home_goals}</span>
              <span className="text-muted-foreground/30 text-base">-</span>
              <span className={cn(awayWon ? "text-primary font-black" : "text-foreground/70")}>{match.away_goals}</span>
            </>
          ) : (
            <span className="text-muted-foreground/40 text-sm font-black tracking-widest">VS</span>
          )}
        </div>
        <div className="flex flex-col items-center gap-2.5 flex-1">
          <div className={cn("w-14 h-14 rounded-full bg-background border shadow-xs flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover/match:scale-105", awayWon ? "border-primary/80 ring-2 ring-primary/20" : "border-border/60")}>
            {away.logo_url ? <img src={away.logo_url} className="w-full h-full object-contain p-2" alt={away.name} /> : <Shield className="w-6 h-6 text-muted-foreground" />}
          </div>
          <span className={cn("text-sm text-center line-clamp-2 leading-tight transition-colors", awayWon ? "font-extrabold text-primary" : "font-semibold text-foreground/90")}>
            {away.display_name ?? away.name}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Fixture View (per zone) ──────────────────────────────────────────────────

function ZoneFixtureView({
  matches,
  allTeams,
  onOpenH2H,
}: {
  matches: Match[];
  allTeams: Team[];
  onOpenH2H?: (teamA: Team, teamB: Team) => void;
}) {
  const [selectedRound, setSelectedRound] = useState(1);
  const [copiedMatchId, setCopiedMatchId] = useState<string | null>(null);
  const [copiedRound, setCopiedRound] = useState(false);

  const rounds = useMemo(
    () => Array.from(new Set(matches.map(m => m.round_number))).sort((a, b) => a - b),
    [matches]
  );

  useEffect(() => {
    if (rounds.length > 0) {
      // Auto-select current round (last with finished matches, else first)
      const finished = rounds.filter(r =>
        matches.some(m => m.round_number === r && m.status === 'finished')
      );
      setSelectedRound(finished.length > 0 ? finished[finished.length - 1] : rounds[0]);
    }
  }, [rounds.join(',')]);

  const matchesByRound = useMemo(
    () => matches.filter(m => m.round_number === selectedRound),
    [matches, selectedRound]
  );

  // Teams involved in this zone
  const teams = useMemo(() => {
    const ids = new Set(matches.flatMap(m => [m.home_team_id, m.away_team_id]));
    return allTeams.filter(t => ids.has(t.id));
  }, [matches, allTeams]);

  const handleShareMatch = useCallback((match: Match) => {
    const home = teams.find(t => t.id === match.home_team_id);
    const away = teams.find(t => t.id === match.away_team_id);
    if (!home || !away) return;
    const text =
      match.status === 'finished'
        ? `⚽ ${home.display_name ?? home.name} ${match.home_goals} - ${match.away_goals} ${away.display_name ?? away.name}`
        : `📅 ${home.display_name ?? home.name} vs ${away.display_name ?? away.name}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMatchId(match.id);
      setTimeout(() => setCopiedMatchId(null), 2000);
    });
  }, [teams]);

  const handleShareRound = useCallback(() => {
    const lines = matchesByRound
      .map(match => {
        const home = teams.find(t => t.id === match.home_team_id);
        const away = teams.find(t => t.id === match.away_team_id);
        if (!home || !away) return null;
        return match.status === 'finished'
          ? `⚽ ${home.display_name ?? home.name} ${match.home_goals} - ${match.away_goals} ${away.display_name ?? away.name}`
          : `📅 ${home.display_name ?? home.name} vs ${away.display_name ?? away.name}`;
      })
      .filter(Boolean);
    navigator.clipboard.writeText(`📋 Fecha ${selectedRound}\n${lines.join('\n')}`).then(() => {
      setCopiedRound(true);
      setTimeout(() => setCopiedRound(false), 2000);
    });
  }, [matchesByRound, teams, selectedRound]);

  if (rounds.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Sin partidos cargados aún</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-medium">
          <span className="text-muted-foreground">Progreso de zona</span>
          <span className="text-primary font-bold">{selectedRound} / {rounds.length} fechas</span>
        </div>
        <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
            style={{ width: rounds.length ? `${(selectedRound / rounds.length) * 100}%` : '0%' }}
          />
        </div>
      </div>
      {/* Round selector */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Ver Fecha:</span>
        <div className="flex gap-2">
          {rounds.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRound(r)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors shrink-0",
                selectedRound === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-border"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      {/* Matches */}
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-muted/10 p-3 rounded-2xl border border-border/30">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Fecha {selectedRound}
          </h3>
          <button
            onClick={handleShareRound}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 shadow-sm cursor-pointer",
              copiedRound ? "bg-emerald-500 text-white" : "bg-primary/10 hover:bg-primary/20 text-primary hover:scale-[1.03]"
            )}
          >
            {copiedRound ? '✓ ¡Fixture Copiado!' : (<><Share2 className="w-3.5 h-3.5" /> Compartir Fecha</>)}
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {matchesByRound.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              teams={teams}
              copiedMatchId={copiedMatchId}
              onShare={handleShareMatch}
              onOpenH2H={onOpenH2H}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Eliminatoria placeholder ─────────────────────────────────────────────────

function EliminatoriaPlaceholder({
  hasRoundOf16,
  aperturaCampeon,
  finalName,
}: {
  hasRoundOf16: boolean;
  aperturaCampeon: string;
  finalName: string;
}) {
  const rounds = hasRoundOf16
    ? ['16avos de Final', 'Octavos de Final', 'Cuartos de Final', 'Semifinales', 'Final', finalName]
    : ['Octavos de Final', 'Cuartos de Final', 'Semifinales', 'Final', finalName];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-2xl p-4">
        <Trophy className="w-6 h-6 text-primary shrink-0" />
        <div>
          <p className="font-bold text-sm text-primary">Fase eliminatoria — Próximamente</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Los cruces se generarán al finalizar la Fase de Grupos
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {rounds.map((round, i) => (
          <div
            key={round}
            className={cn(
              "flex items-center gap-4 p-4 rounded-2xl border transition-all",
              i === rounds.length - 1
                ? "border-yellow-500/40 bg-yellow-500/5"
                : "border-border/40 bg-card/40"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0",
              i === rounds.length - 1
                ? "bg-yellow-500/20 text-yellow-600"
                : "bg-primary/10 text-primary"
            )}>
              {i + 1}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{round}</p>
              {i === rounds.length - 1 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Campeón Apertura 2026: <strong>{aperturaCampeon}</strong>
                </p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TournamentDivisionView({ slug }: { slug: string }) {
  const config = getTournamentConfig(slug);

  // ── State ──────────────────────────────────────────────────────────────────
  const [h2hModalData, setH2HModalData] = useState<{ teamA: Team; teamB: Team } | null>(null);
  const [phase, setPhase] = useState<Phase>('grupos');
  const [zoneTab, setZoneTab] = useState<ZoneTab>(0);
  const [contentTab, setContentTab] = useState<ContentTab>('posiciones');

  const [currentDivId, setCurrentDivId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [zonesData, setZonesData] = useState<(ZoneData | null)[]>([null, null, null]);

  const [tournaments, setTournaments] = useState<{ id: string; name: string; year: number }[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // ── Data loading ───────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadMeta() {
      const [tourns, , zones, teams] = await Promise.all([
        fetchTournaments(),
        fetchDivisions(),
        fetchZones(),
        fetchTeams(),
      ]);

      setAllTeams(teams);
      setTournaments(tourns);

      // Find zone IDs by name
      const zoneNames = config?.zoneNames ?? ['Zona 1', 'Zona 2', 'Zona 3'];
      const foundZones = zoneNames.map(name => zones.find(z => z.name === name) ?? null);
      setZonesData(foundZones.map(z => z ? { zoneId: z.id, zoneName: z.name, matches: [] } : null));

      // Select current or most recent tournament
      const currentTourn = tourns.find(t => t.is_current) || tourns.sort((a, b) => b.year - a.year)[0];
      if (currentTourn) {
        setSelectedYear(currentTourn.year);
        setSelectedTournamentId(currentTourn.id);
      }
    }
    loadMeta();
  }, [slug]);

  useEffect(() => {
    if (!selectedTournamentId || zonesData.every(z => z === null)) return;

    async function loadMatches() {
      setLoading(true);
      try {
        const divs = await fetchDivisions();
        const div = divs.find(d => createSlug(d.name) === slug);
        if (!div) return;
        setCurrentDivId(div.id);

        const results = await Promise.all(
          zonesData.map(z =>
            z ? fetchMatches(div.id, z.zoneId, selectedTournamentId) : Promise.resolve([])
          )
        );

        setZonesData(prev =>
          prev.map((z, i) => z ? { ...z, matches: results[i] } : null)
        );
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, [selectedTournamentId, slug]);

  // ── Derived data ───────────────────────────────────────────────────────────
  const zoneTeams = useMemo(() =>
    zonesData.map((z, zoneIdx) => {
      const keywords = config?.zoneTeamKeywords[zoneIdx];
      if (keywords && keywords.length > 0) {
        return allTeams.filter(t =>
          keywords.some(kw => t.name.toLowerCase().includes(kw.toLowerCase()))
        );
      }
      const matchIds = new Set(z?.matches.flatMap(m => [m.home_team_id, m.away_team_id]) ?? []);
      return allTeams.filter(t => matchIds.has(t.id));
    }),
    [zonesData, allTeams, config]
  );

  const zoneStandings = useMemo(() =>
    zonesData.map((z, i) => z ? calculateStandings(z.matches, zoneTeams[i]) : []),
    [zonesData, zoneTeams]
  );

  const formByTeamPerZone = useMemo(() =>
    zonesData.map((z, i) => {
      const result: Record<string, ('G' | 'E' | 'P')[]> = {};
      zoneTeams[i].forEach(t => {
        const tm = (z?.matches ?? [])
          .filter(m => m.status === 'finished' && (m.home_team_id === t.id || m.away_team_id === t.id))
          .sort((a, b) => a.round_number - b.round_number);
        const form = tm.map(m => {
          const isHome = m.home_team_id === t.id;
          const hg = m.home_goals ?? 0;
          const ag = m.away_goals ?? 0;
          if (hg === ag) return 'E';
          return isHome ? (hg > ag ? 'G' : 'P') : (ag > hg ? 'G' : 'P');
        });
        result[t.id] = form.slice(-5);
      });
      return result;
    }),
    [zonesData, zoneTeams]
  );

  const allMatches = useMemo(() => zonesData.flatMap(z => z?.matches ?? []), [zonesData]);
  const allZoneTeams = useMemo(() => {
    const map = new Map<string, Team>();
    zoneTeams.flatMap(teams => teams).forEach(t => map.set(t.id, t));
    return Array.from(map.values());
  }, [zoneTeams]);
  const promedioStandings = useMemo(
    () => calculatePromedioStandings(allMatches, allZoneTeams),
    [allMatches, allZoneTeams]
  );

  const uniqueYears = useMemo(
    () => Array.from(new Set(tournaments.map(t => t.year))).sort((a, b) => b - a),
    [tournaments]
  );
  const tournamentsForYear = useMemo(
    () => tournaments.filter(t => t.year === selectedYear),
    [tournaments, selectedYear]
  );
  const currentTournament = useMemo(
    () => tournaments.find(t => t.id === selectedTournamentId),
    [tournaments, selectedTournamentId]
  );

  if (!config) return null;

  const activeZoneData = zoneTab < 3 ? zonesData[zoneTab as ZoneIndex] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              {config.displayName}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
              <Clock className="w-3.5 h-3.5" />
              {config.matchTime} hs
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {currentTournament?.name ?? '—'} · {config.copaName}
          </p>
        </div>

        {/* Tournament selector */}
        <div className="flex gap-3">
          <select
            className="bg-background border border-border/50 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
            value={selectedYear}
            onChange={e => {
              const year = Number(e.target.value);
              setSelectedYear(year);
              const ts = tournaments.filter(t => t.year === year);
              if (ts.length > 0) setSelectedTournamentId(ts[0].id);
            }}
          >
            {uniqueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            className="bg-background border border-border/50 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
            value={selectedTournamentId}
            onChange={e => setSelectedTournamentId(e.target.value)}
          >
            {tournamentsForYear.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Phase tabs ─────────────────────────────────────────────────────── */}
      <div className="flex bg-muted/50 p-1.5 rounded-xl backdrop-blur-sm border border-border/50 w-full sm:w-fit">
        {(['grupos', 'eliminatoria'] as Phase[]).map(p => (
          <button
            key={p}
            onClick={() => setPhase(p)}
            className={cn(
              "flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 capitalize",
              phase === p ? "bg-background shadow-md text-primary scale-[1.02]" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p === 'grupos' ? '🏆 Fase de Grupos' : '⚔️ Eliminatoria'}
          </button>
        ))}
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="bg-card/40 backdrop-blur-xl rounded-2xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden min-h-[400px] relative">
        {phase === 'eliminatoria' ? (
          <EliminatoriaPlaceholder
            hasRoundOf16={config.hasRoundOf16}
            aperturaCampeon={config.aperturaCampeon}
            finalName={config.finalName}
          />
        ) : (
          <>
            {/* Zone tabs + content tab */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/40 p-4 border-b border-border/50">
              {/* Zone selector */}
              <div className="flex overflow-x-auto hide-scrollbar gap-1">
                {ZONE_LABELS.map((label, idx) => (
                  <button
                    key={label}
                    onClick={() => setZoneTab(idx as ZoneIndex)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap",
                      zoneTab === idx
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => setZoneTab(3)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap",
                    zoneTab === 3
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  Tabla Gral.
                </button>
              </div>

              {/* Content tab (only for zona views) */}
              {zoneTab < 3 && (
                <div className="flex border border-border/50 rounded-lg overflow-hidden">
                  {(['posiciones', 'fixture'] as ContentTab[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setContentTab(t)}
                      className={cn(
                        "px-4 py-2 text-sm font-bold transition-all duration-200 capitalize",
                        contentTab === t
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Zona info badge */}
            {zoneTab < 3 && activeZoneData && (
              <div className="px-4 pt-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {ZONE_LABELS[zoneTab as ZoneIndex]}
                  {' · '}
                  {zoneTeams[zoneTab as ZoneIndex].length} equipos
                </span>
              </div>
            )}

            {loading ? (
              <Skeleton />
            ) : (
              <>
                {/* Tabla General */}
                {zoneTab === 3 && (
                  <div className="pt-4">
                    <div className="px-4 sm:px-6 pb-3">
                      <p className="text-xs text-muted-foreground">
                        Ordenada por promedio de puntos (Pts ÷ PJ) para normalizar equipos de zonas con distinta cantidad de participantes.
                      </p>
                    </div>
                    <StandingsTable
                      standings={promedioStandings}
                      showPromedio
                      divisionId={currentDivId || undefined}
                    />
                    <div className="mt-6 mb-4">
                      <SponsorBanner />
                    </div>
                  </div>
                )}

                {/* Zone Standings */}
                {zoneTab < 3 && contentTab === 'posiciones' && (
                  <>
                    <StandingsTable
                      standings={zoneStandings[zoneTab as ZoneIndex]}
                      formByTeam={formByTeamPerZone[zoneTab as ZoneIndex]}
                      divisionId={currentDivId || undefined}
                    />
                    <div className="mt-6 mb-4">
                      <SponsorBanner />
                    </div>
                  </>
                )}

                {/* Zone Fixture */}
                {zoneTab < 3 && contentTab === 'fixture' && activeZoneData && (
                  <ZoneFixtureView
                    matches={activeZoneData.matches}
                    allTeams={allTeams}
                    onOpenH2H={(teamA, teamB) => setH2HModalData({ teamA, teamB })}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      <H2HModal
        isOpen={!!h2hModalData}
        onClose={() => setH2HModalData(null)}
        teamA={h2hModalData?.teamA ?? null}
        teamB={h2hModalData?.teamB ?? null}
        divisionName={config?.displayName ?? slug}
        allMatches={zonesData.flatMap(z => z?.matches ?? [])}
        standings={zoneTab < 3 ? zoneStandings[zoneTab as ZoneIndex] : promedioStandings}
      />
    </motion.div>
  );
}
