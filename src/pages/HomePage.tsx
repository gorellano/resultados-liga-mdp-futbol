import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../App';

export function HomePage() {
  const divisions = [
    { name: '1ra División', soon: true },
    { name: '5ta División', soon: true },
    { name: '6ta División', soon: true },
    { name: '7ma División' },
    { name: '8va División' },
    { name: '9na División' },
    { name: '10ma División' },
    { name: '11ma División' },
    { name: '12ma División' },
    { name: '13ra División' },
    { name: '14ta División' },
    { name: '15ta División' },
    { name: '16ta División' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Fútbol Marplatense
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
          Seguí los resultados, fixtures y posiciones de las divisiones juveniles de la LMF.
        </p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {divisions.map((div, i) => (
          <Link
            key={i}
            to={div.soon ? "#" : `/division/${encodeURIComponent(div.name)}`}
            className={cn(
              "group relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300",
              div.soon 
                ? "bg-muted/50 border-transparent cursor-not-allowed opacity-80" 
                : "bg-card border-border hover:border-primary hover:shadow-lg hover:-translate-y-1"
            )}
          >
            <h3 className="font-semibold text-lg">{div.name}</h3>
            {div.soon && (
              <span className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                Próximamente
              </span>
            )}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
