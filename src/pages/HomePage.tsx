import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../App';
import { fetchDivisions, fetchTournaments, fetchAllTournamentMatches } from '../lib/db';
import { getCategoryYear } from '../lib/auth';
import type { Division } from '../lib/types';

export function HomePage() {
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

  const divisionsList = activeDivs.map(d => {
    const isSoon = ['primera división', 'quinta división', 'sexta división'].includes(d.name.toLowerCase().trim());
    return {
      id: d.id,
      name: d.name,
      soon: isSoon,
      status: isSoon ? 'soon' : (divisionStatuses[d.id] || 'en_curso')
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-card/50 border border-border/40 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 animate-pulse"
            >
              <div className="h-5 bg-muted rounded-md w-2/3" />
              <div className="h-3 bg-muted rounded-md w-1/3" />
            </div>
          ))
        ) : (
          divisionsList.map((div, i) => (
            <Link
              key={i}
              to={div.soon ? "#" : `/division/${encodeURIComponent(div.name)}`}
              className={cn(
                "group flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 min-h-[120px] text-center",
                div.soon
                  ? "bg-muted/40 border-border/30 cursor-not-allowed opacity-75"
                  : "bg-card border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              )}
            >
              {/* Badge area */}
              <div className="mb-3">
                {div.soon ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-500/25 dark:text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    PRÓXIMAMENTE
                  </span>
                ) : div.status === 'finalizado' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-500/25 dark:text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    FINALIZADO
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-500/25 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    EN CURSO
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                {div.name}
              </h3>

              {/* Category year */}
              {!div.soon && getCategoryYear(div.name, currentYear) !== null && (
                <span className="text-xs text-muted-foreground mt-1 font-medium">
                  (Categoría {getCategoryYear(div.name, currentYear)})
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </motion.div>
  );
}
