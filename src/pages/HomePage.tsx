import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../App';
import { fetchDivisions } from '../lib/db';
import type { Division } from '../lib/types';

function getCategoryYear(divisionName: string, tournamentYear: number): number {
  const match = divisionName.match(/(\d+)/);
  if (!match) return 0;
  return parseInt(match[1]) + tournamentYear - 23;
}

export function HomePage() {
  const currentYear = new Date().getFullYear();
  const [activeDivs, setActiveDivs] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDivisions().then(data => {
      setActiveDivs(data);
      setLoading(false);
    });
  }, []);

  const soonDivisions = [
    { name: '1ra División',  soon: true,  active: false },
    { name: '5ta División',  soon: true,  active: false },
    { name: '6ta División',  soon: true,  active: false },
  ];

  const divisionsList = [
    ...soonDivisions,
    ...activeDivs.map(d => ({ name: d.name, active: true, soon: false })),
  ];

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
                "group relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300",
                div.soon
                  ? "bg-muted/50 border-transparent cursor-not-allowed opacity-70"
                  : "bg-card border-border hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5"
              )}
            >
              {div.active && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-bold text-green-600 border border-green-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  EN CURSO
                </span>
              )}
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{div.name}</h3>
              {!div.soon && (
                <span className="text-xs text-muted-foreground mt-0.5">
                  ({getCategoryYear(div.name, currentYear)})
                </span>
              )}
              {div.soon && (
                <span className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  Próximamente
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </motion.div>
  );
}
