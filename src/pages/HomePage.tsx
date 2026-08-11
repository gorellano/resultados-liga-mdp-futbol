import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../App';
import { Star, Shield, ChevronRight, Trophy, Calendar, RefreshCw } from 'lucide-react';
import { useFavoriteTeam } from '../hooks/useFavoriteTeam';
import { fetchDivisions, fetchTournaments, fetchAllTournamentMatches, fetchTeams } from '../lib/db';
import { getCategoryYear } from '../lib/auth';
import type { Division, Match, Team } from '../lib/types';
import { SponsorBanner } from '../components/SponsorBanner';
import { createSlug, formatSlugToTitle } from '../lib/slug';

export function HomePage() {
  const { favoriteTeam } = useFavoriteTeam();
  const currentYear = new Date().getFullYear();
  const [activeDivs, setActiveDivs] = useState<Division[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [divisionStatuses, setDivisionStatuses] = useState<Record<string, 'en_curso' | 'finalizado'>>({});
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const favoriteTeamStats = useMemo(() => {
    if (!favoriteTeam || allMatches.length === 0) return null;

    const teamMatches = allMatches.filter(
      m => m.home_team_id === favoriteTeam.id || m.away_team_id === favoriteTeam.id
    );

    if (teamMatches.length === 0) return null;

    const finishedMatches = teamMatches
      .filter(m => m.status === 'finished')
      .sort((a, b) => (b.round_number ?? 0) - (a.round_number ?? 0));

    const latestMatch = finishedMatches[0] || null;

    let divisionName = '';
    let divisionSlug = '';
    const matchForDiv = latestMatch || teamMatches[0];
    if (matchForDiv) {
      const div = activeDivs.find(d => d.id === matchForDiv.division_id);
      if (div) {
        divisionName = div.name;
        divisionSlug = createSlug(div.name);
      }
    }

    let latestResult = null;
    if (latestMatch) {
      const isHome = latestMatch.home_team_id === favoriteTeam.id;
      const rivalId = isHome ? latestMatch.away_team_id : latestMatch.home_team_id;
      const rival = allTeams.find(t => t.id === rivalId);
      const rivalName = rival ? (rival.display_name ?? rival.name) : 'Rival';
      const favGoals = (isHome ? latestMatch.home_goals : latestMatch.away_goals) ?? 0;
      const rivalGoals = (isHome ? latestMatch.away_goals : latestMatch.home_goals) ?? 0;

      const outcome = favGoals > rivalGoals ? 'G' : favGoals < rivalGoals ? 'P' : 'E';

      latestResult = {
        outcome,
        scoreText: isHome ? `${favGoals} - ${rivalGoals}` : `${rivalGoals} - ${favGoals}`,
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
      const isHome = nextM.home_team_id === favoriteTeam.id;
      const rivalId = isHome ? nextM.away_team_id : nextM.home_team_id;
      const rival = allTeams.find(t => t.id === rivalId);
      nextMatchInfo = {
        rivalName: rival ? (rival.display_name ?? rival.name) : 'Rival',
        round: nextM.round_number,
        isHome,
      };
    }

    return {
      divisionName,
      divisionSlug,
      latestResult,
      nextMatchInfo,
    };
  }, [favoriteTeam, allMatches, allTeams, activeDivs]);

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
      className="space-y-8"
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

      {favoriteTeam && (
        <section className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-card border border-amber-500/35 p-5 sm:p-6 rounded-3xl backdrop-blur-md max-w-4xl mx-auto shadow-lg relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Team Info */}
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-background border border-amber-500/40 flex items-center justify-center p-2 shrink-0 shadow-md">
                {favoriteTeam.logo_url ? (
                  <img src={favoriteTeam.logo_url} alt={favoriteTeam.name} className="w-full h-full object-contain" />
                ) : (
                  <Shield className="w-7 h-7 text-amber-500" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Mi Equipo Favorito
                  </span>
                  {favoriteTeamStats?.divisionName && (
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                      {formatSlugToTitle(createSlug(favoriteTeamStats.divisionName))}
                    </span>
                  )}
                </div>
                <h3 className="font-black text-lg sm:text-xl text-foreground tracking-tight">
                  {favoriteTeam.display_name ?? favoriteTeam.name}
                </h3>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 select-none self-end sm:self-center">
              {favoriteTeamStats?.divisionSlug ? (
                <Link
                  to={`/division/${favoriteTeamStats.divisionSlug}`}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Ver en Tabla de Posiciones</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/equipos"
                  className="px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 font-extrabold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Ver Equipos</span>
                </Link>
              )}

              <Link
                to="/equipos"
                className="p-2.5 rounded-2xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                title="Cambiar mi equipo favorito"
              >
                <RefreshCw className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Stats bar / Latest Result */}
          {favoriteTeamStats?.latestResult && (
            <div className="pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Último Resultado:</span>
                <span className="font-extrabold text-foreground flex items-center gap-1.5">
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[11px] font-black border",
                    favoriteTeamStats.latestResult.outcome === 'G' ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" :
                    favoriteTeamStats.latestResult.outcome === 'E' ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" :
                    "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                  )}>
                    {favoriteTeamStats.latestResult.outcome === 'G' ? 'Victoria' : favoriteTeamStats.latestResult.outcome === 'E' ? 'Empate' : 'Derrota'}
                  </span>
                  <span>
                    {favoriteTeamStats.latestResult.isHome
                      ? `${favoriteTeam.display_name ?? favoriteTeam.name} ${favoriteTeamStats.latestResult.scoreText} ${favoriteTeamStats.latestResult.rivalName}`
                      : `${favoriteTeamStats.latestResult.rivalName} ${favoriteTeamStats.latestResult.scoreText} ${favoriteTeam.display_name ?? favoriteTeam.name}`
                    }
                  </span>
                  <span className="text-muted-foreground/70 font-semibold text-[11px]">
                    (Fecha {favoriteTeamStats.latestResult.round})
                  </span>
                </span>
              </div>

              {favoriteTeamStats.nextMatchInfo && (
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Próximo: vs <strong>{favoriteTeamStats.nextMatchInfo.rivalName}</strong> (Fecha {favoriteTeamStats.nextMatchInfo.round})</span>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {!favoriteTeam && (
        <section className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-card border border-amber-500/25 p-4 sm:p-5 rounded-3xl backdrop-blur-md max-w-4xl mx-auto shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-foreground">¿Seguís a algún equipo de la LMF?</h4>
              <p className="text-xs text-muted-foreground">Elegí tu equipo favorito para ver sus resultados y fixture directamente en el inicio.</p>
            </div>
          </div>
          <Link
            to="/equipos"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold text-xs transition-colors shrink-0 shadow-xs"
          >
            ⭐️ Elegir mi equipo
          </Link>
        </section>
      )}

      <SponsorBanner />

      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06 }
          }
        }}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-card/60 border border-border/50 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 animate-pulse shadow-sm"
            >
              <div className="h-4 bg-muted rounded-full w-1/2" />
              <div className="h-6 bg-muted rounded-lg w-3/4" />
              <div className="h-3 bg-muted rounded-md w-1/3" />
            </div>
          ))
        ) : (
          divisionsList.map((div, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
              }}
            >
              <Link
                to={div.soon ? "#" : `/division/${createSlug(div.name)}`}
                className={cn(
                  "group flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 min-h-[135px] text-center relative overflow-hidden",
                  div.soon
                    ? "bg-muted/40 border-border/30 cursor-not-allowed opacity-75"
                    : "bg-card border-border/70 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 active:translate-y-0"
                )}
              >
                {/* Background ambient glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Badge area */}
                <div className="mb-3 z-10">
                  {div.soon ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-700 border border-amber-500/25 dark:text-amber-400 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      PRÓXIMAMENTE
                    </span>
                  ) : div.status === 'finalizado' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-700 border border-blue-500/25 dark:text-blue-400 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      FINALIZADO
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-500/25 dark:text-emerald-400 uppercase tracking-wide shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-soft-pulse" />
                      EN CURSO
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors duration-300 z-10 tracking-tight">
                  {div.name}
                </h3>

                {/* Category year */}
                {!div.soon && getCategoryYear(div.name, currentYear) !== null && (
                  <span className="text-xs text-muted-foreground/80 mt-1 font-semibold z-10">
                    (Categoría {getCategoryYear(div.name, currentYear)})
                  </span>
                )}
              </Link>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
