import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../App';
import { Star, Shield, ChevronRight, Trophy, Calendar, RefreshCw, Plus } from 'lucide-react';
import { useFavoriteTeam } from '../hooks/useFavoriteTeam';
import { fetchDivisions, fetchTournaments, fetchAllTournamentMatches, fetchTeams } from '../lib/db';
import { getCategoryYear } from '../lib/auth';
import { calculateStandings } from '../lib/standings';
import type { Division, Match, Team } from '../lib/types';
import { SponsorBanner } from '../components/SponsorBanner';
import { createSlug, formatSlugToTitle } from '../lib/slug';

export function HomePage() {
  const { favorites, toggleFavorite, setFavoriteDivisionId } = useFavoriteTeam();
  const currentYear = new Date().getFullYear();
  const [activeDivs, setActiveDivs] = useState<Division[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [divisionStatuses, setDivisionStatuses] = useState<Record<string, 'en_curso' | 'finalizado'>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [tourns, divs, tms] = await Promise.all([
          fetchTournaments(),
          fetchDivisions(),
          fetchTeams()
        ]);
        setActiveDivs(divs);
        setAllTeams(tms);

        if (tourns.length > 0) {
          const latestTournament = tourns[0];
          const matches = await fetchAllTournamentMatches(latestTournament.id);
          setAllMatches(matches);
          
          const statuses: Record<string, 'en_curso' | 'finalizado'> = {};
          divs.forEach(div => {
            const divMatches = matches.filter(m => m.division_id === div.id);
            if (divMatches.length === 0) {
              statuses[div.id] = 'en_curso';
            } else {
              const round13Matches = divMatches.filter(m => m.round_number === 13);
              const round13Finished = round13Matches.filter(m => m.status === 'finished').length;
              const round13Total = round13Matches.length;
              
              if (round13Total > 0 && (round13Finished / round13Total) >= 0.9) {
                statuses[div.id] = 'finalizado';
              } else {
                statuses[div.id] = 'en_curso';
              }
            }
          });
          setDivisionStatuses(statuses);
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      }
    }
    loadData();
  }, []);

  const favoritesStats = useMemo(() => {
    if (favorites.length === 0 || allMatches.length === 0) return [];

    return favorites.map(fav => {
      if (!fav.team) return null;

      let teamMatches = allMatches.filter(
        m => m.home_team_id === fav.teamId || m.away_team_id === fav.teamId
      );

      if (teamMatches.length === 0) return null;

      let targetDivisionId = fav.divisionId;
      if (targetDivisionId) {
        const filtered = teamMatches.filter(m => m.division_id === targetDivisionId);
        if (filtered.length > 0) {
          teamMatches = filtered;
        }
      } else {
        const lastFinished = teamMatches.find(m => m.status === 'finished') || teamMatches[0];
        targetDivisionId = lastFinished?.division_id;
      }

      const currentDiv = activeDivs.find(d => d.id === targetDivisionId) || activeDivs.find(d => d.id === teamMatches[0]?.division_id);
      const divisionName = currentDiv ? currentDiv.name : '';
      const divisionSlug = currentDiv ? createSlug(currentDiv.name) : '';

      // Standings position calculation
      let positionRank: number | null = null;
      let totalPoints: number | null = null;
      if (targetDivisionId) {
        const divMatches = allMatches.filter(m => m.division_id === targetDivisionId);
        const standings = calculateStandings(divMatches, allTeams);
        const teamRowIdx = standings.findIndex(row => row.team.id === fav.teamId);
        if (teamRowIdx >= 0) {
          positionRank = teamRowIdx + 1;
          totalPoints = standings[teamRowIdx].points;
        }
      }

      const finishedMatches = teamMatches
        .filter(m => m.status === 'finished')
        .sort((a, b) => (b.round_number ?? 0) - (a.round_number ?? 0));

      const latestMatch = finishedMatches[0] || null;

      let latestResult = null;
      if (latestMatch) {
        const isHome = latestMatch.home_team_id === fav.teamId;
        const rivalId = isHome ? latestMatch.away_team_id : latestMatch.home_team_id;
        const rival = allTeams.find(t => t.id === rivalId);
        const rivalName = rival ? (rival.display_name ?? rival.name) : 'Rival';
        const homeTeam = allTeams.find(t => t.id === latestMatch.home_team_id);
        const awayTeam = allTeams.find(t => t.id === latestMatch.away_team_id);
        const homeName = homeTeam ? (homeTeam.display_name ?? homeTeam.name) : 'Local';
        const awayName = awayTeam ? (awayTeam.display_name ?? awayTeam.name) : 'Visitante';
        const homeGoals = latestMatch.home_goals ?? 0;
        const awayGoals = latestMatch.away_goals ?? 0;

        const favGoals = isHome ? homeGoals : awayGoals;
        const rivalGoals = isHome ? awayGoals : homeGoals;

        const outcome = favGoals > rivalGoals ? 'G' : favGoals < rivalGoals ? 'P' : 'E';

        latestResult = {
          outcome,
          homeName,
          awayName,
          homeGoals,
          awayGoals,
          rivalName,
          isHome,
          round: latestMatch.round_number,
        };
      }

      const scheduledMatches = teamMatches
        .filter(m => m.status === 'scheduled')
        .sort((a, b) => (a.round_number ?? 0) - (b.round_number ?? 0));

      let nextMatchInfo = null;
      if (scheduledMatches.length > 0) {
        const nextM = scheduledMatches[0];
        const isHome = nextM.home_team_id === fav.teamId;
        const rivalId = isHome ? nextM.away_team_id : nextM.home_team_id;
        const rival = allTeams.find(t => t.id === rivalId);
        nextMatchInfo = {
          rivalName: rival ? (rival.display_name ?? rival.name) : 'Rival',
          round: nextM.round_number,
          isHome,
        };
      }

      const teamDivIds = Array.from(new Set(
        allMatches
          .filter(m => m.home_team_id === fav.teamId || m.away_team_id === fav.teamId)
          .map(m => m.division_id)
      ));
      const teamDivisions = activeDivs.filter(d => teamDivIds.includes(d.id));

      return {
        team: fav.team,
        teamId: fav.teamId,
        divisionName,
        divisionSlug,
        currentDivisionId: targetDivisionId,
        teamDivisions,
        positionRank,
        totalPoints,
        latestResult,
        nextMatchInfo,
      };
    }).filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [favorites, allMatches, allTeams, activeDivs]);

  const divisionsList = activeDivs
    .filter(d => !['Primera División', 'Quinta División', 'Sexta División'].includes(d.name))
    .map(d => {
      return {
        id: d.id,
        name: d.name,
        soon: false,
        status: divisionStatuses[d.id] || 'en_curso'
      };
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 sm:space-y-8"
    >
      <section className="flex items-center gap-4 sm:gap-6 text-left bg-card/30 border border-border/50 p-4 sm:p-6 md:p-8 rounded-3xl backdrop-blur-sm max-w-4xl mx-auto shadow-sm">
        <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-primary/5 border border-border/50 overflow-hidden shadow-md shrink-0 hover:scale-105 transition-transform duration-300">
          <img src="/logo_costa_y_gol.png" alt="Costa y Gol Logo" className="w-full h-full object-cover" />
        </div>
        <div className="space-y-1 sm:space-y-2 md:space-y-3">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground">
            Fútbol Marplatense
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed max-w-[550px]">
            Viví la pasión del fútbol juvenil de la ciudad. Seguí al instante los resultados, estadísticas completas, fixtures y tablas de posiciones de todas las divisiones de la LMF en <strong className="text-primary font-bold">Costa y Gol</strong>.
          </p>
        </div>
      </section>

      {/* Favorite Teams Banners (Up to 2) */}
      {favoritesStats.length > 0 && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {favoritesStats.map((favStat, index) => (
            <section
              key={favStat.teamId}
              className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-card border border-amber-500/35 p-4 sm:p-5 rounded-3xl backdrop-blur-md shadow-md relative overflow-hidden space-y-3"
            >
              {/* Header Row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-background border border-amber-500/40 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                    {favStat.team.logo_url ? (
                      <img src={favStat.team.logo_url} alt={favStat.team.name} className="w-full h-full object-contain" />
                    ) : (
                      <Shield className="w-6 h-6 text-amber-500" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Favorito {favoritesStats.length > 1 ? `#${index + 1}` : ''}
                      </span>

                      {favStat.teamDivisions.length > 1 ? (
                        <select
                          value={favStat.currentDivisionId || ''}
                          onChange={(e) => setFavoriteDivisionId(favStat.teamId, e.target.value)}
                          className="text-[10px] font-bold text-foreground bg-muted/80 border border-border/60 rounded-md px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                        >
                          {favStat.teamDivisions.map(d => (
                            <option key={d.id} value={d.id}>
                              {formatSlugToTitle(createSlug(d.name))}
                            </option>
                          ))}
                        </select>
                      ) : (
                        favStat.divisionName && (
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                            {formatSlugToTitle(createSlug(favStat.divisionName))}
                          </span>
                        )
                      )}
                    </div>
                    <h3 className="font-black text-base sm:text-lg text-foreground tracking-tight truncate">
                      {favStat.team.display_name ?? favStat.team.name}
                    </h3>
                  </div>
                </div>

                {/* Right Header Controls (Position & Desktop Link & Remove) */}
                <div className="flex items-center gap-2 shrink-0">
                  {favStat.positionRank && (
                    <div className="bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-xl flex items-center gap-1 text-xs font-black shadow-2xs">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pos. #{favStat.positionRank}</span>
                      {favStat.totalPoints !== null && (
                        <span className="text-[10px] opacity-80 font-bold hidden xs:inline">({favStat.totalPoints} pts)</span>
                      )}
                    </div>
                  )}

                  {favStat.divisionSlug && (
                    <Link
                      to={`/division/${favStat.divisionSlug}`}
                      className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold text-xs hidden sm:flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Ver Tabla</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  <button
                    onClick={() => toggleFavorite(favStat.teamId)}
                    className="p-2 rounded-2xl bg-muted/50 hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500 transition-all"
                    title="Quitar de favoritos"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats Grid: Latest Result & Next Match */}
              <div className="pt-2.5 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                {favStat.latestResult && (
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">Último:</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-md text-[10px] font-black shrink-0 border",
                      favStat.latestResult.outcome === 'G' ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" :
                      favStat.latestResult.outcome === 'E' ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" :
                      "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                    )}>
                      {favStat.latestResult.outcome === 'G' ? 'Victoria' : favStat.latestResult.outcome === 'E' ? 'Empate' : 'Derrota'}
                    </span>
                    <span className="font-bold text-foreground truncate text-[11px] sm:text-xs">
                      {favStat.latestResult.homeName} {favStat.latestResult.homeGoals} - {favStat.latestResult.awayGoals} {favStat.latestResult.awayName}
                    </span>
                    <span className="text-muted-foreground/70 font-semibold text-[10px] shrink-0">
                      (F{favStat.latestResult.round})
                    </span>
                  </div>
                )}

                {favStat.nextMatchInfo && (
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] sm:text-xs shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Próximo: <strong>vs {favStat.nextMatchInfo.rivalName}</strong> (F{favStat.nextMatchInfo.round})</span>
                  </div>
                )}
              </div>

              {/* Mobile Direct Button */}
              {favStat.divisionSlug && (
                <div className="pt-1 sm:hidden">
                  <Link
                    to={`/division/${favStat.divisionSlug}`}
                    className="w-full py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Ver Tabla de Posiciones ({formatSlugToTitle(favStat.divisionSlug)})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </section>
          ))}

          {/* Add 2nd Favorite Prompt Banner */}
          {favoritesStats.length === 1 && (
            <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-amber-500/5 border border-dashed border-amber-500/30 text-xs">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                <span className="text-muted-foreground font-medium">Podés agregar hasta <strong>2 equipos favoritos</strong> (ej. hermano, amigo o 2da categoría).</span>
              </div>
              <Link
                to="/equipos"
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex items-center gap-1 shrink-0 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar 2do Favorito</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {favoritesStats.length === 0 && (
        <section className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-card border border-amber-500/25 p-4 sm:p-5 rounded-3xl backdrop-blur-md max-w-4xl mx-auto shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-foreground">¿Seguís a algún equipo de la LMF?</h4>
              <p className="text-xs text-muted-foreground">Elegí hasta 2 equipos favoritos para seguir sus resultados y fixture directamente en el inicio.</p>
            </div>
          </div>
          <Link
            to="/equipos"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold text-xs transition-colors shrink-0 shadow-xs"
          >
            ⭐️ Elegir mis equipos
          </Link>
        </section>
      )}

      <SponsorBanner />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4 max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <span>Divisiones LMF</span>
            <span className="text-xs font-extrabold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
              Temporada {currentYear}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {divisionsList.map((div) => {
            const slug = createSlug(div.name);
            const isFinished = div.status === 'finalizado';

            return (
              <div key={div.id} className="relative group">
                <Link
                  to={`/division/${slug}`}
                  className="block p-5 sm:p-6 rounded-3xl bg-card/60 hover:bg-card/90 border border-border/60 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-xs relative overflow-hidden text-left"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border",
                      isFinished
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isFinished ? "bg-amber-500" : "bg-emerald-500")} />
                      {isFinished ? 'Torneo Finalizado' : 'En Curso'}
                    </span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </div>

                  <h3 className="font-extrabold text-lg sm:text-xl text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {div.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    (Categoría {getCategoryYear(div.name, currentYear)})
                  </p>
                </Link>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
