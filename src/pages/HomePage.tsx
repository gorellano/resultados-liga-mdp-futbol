import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../App';
import { Star, Shield } from 'lucide-react';
import { useFavoriteTeam } from '../hooks/useFavoriteTeam';
import { fetchDivisions, fetchTournaments, fetchAllTournamentMatches } from '../lib/db';
import { getCategoryYear } from '../lib/auth';
import type { Division } from '../lib/types';
import { SponsorBanner } from '../components/SponsorBanner';
import { createSlug } from '../lib/slug';

export function HomePage() {
  const { favoriteTeam } = useFavoriteTeam();
  const currentYear = new Date().getFullYear();
  const [activeDivs, setActiveDivs] = useState<Division[]>([]);
  const [divisionStatuses, setDivisionStatuses] = useState<Record<string, 'en_curso' | 'finalizado'>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [tourns, divs] = await Promise.all([
          fetchTournaments(),
          fetchDivisions()
        ]);
        setActiveDivs(divs);

        if (tourns.length > 0) {
          const latestTournament = tourns[0];
          const matches = await fetchAllTournamentMatches(latestTournament.id);
          
          const statuses: Record<string, 'en_curso' | 'finalizado'> = {};
          divs.forEach(div => {
            const divMatches = matches.filter(m => m.division_id === div.id);
            if (divMatches.length === 0) {
              statuses[div.id] = 'en_curso';
            } else {
              // Validar si están el 90% de los partidos de la fecha 13 cargados
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

  const divisionsList = activeDivs
    .filter(d => !['Primera División', 'Quinta División', 'Sexta División'].includes(d.name))
    .map(d => {
      // Las divisiones juveniles de 7ma a 16ta tienen su propia página completa
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
        <section className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-card border border-amber-500/30 p-4 sm:p-5 rounded-3xl backdrop-blur-md max-w-4xl mx-auto shadow-md relative overflow-hidden flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-background border border-amber-500/40 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
              {favoriteTeam.logo_url ? (
                <img src={favoriteTeam.logo_url} alt={favoriteTeam.name} className="w-full h-full object-contain" />
              ) : (
                <Shield className="w-6 h-6 text-amber-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Mi Equipo Favorito</span>
              </div>
              <h3 className="font-black text-base sm:text-lg text-foreground tracking-tight">
                {favoriteTeam.display_name ?? favoriteTeam.name}
              </h3>
            </div>
          </div>
          <Link
            to="/equipos"
            className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 font-extrabold text-xs transition-colors shrink-0"
          >
            Ver Equipos
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
