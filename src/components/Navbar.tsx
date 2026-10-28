import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Award, 
  Swords, 
  Trophy, 
  Shirt, 
  Mail, 
  Sun, 
  Moon, 
  Lock, 
  Home,
  ChevronDown
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';

interface NavbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenContact: () => void;
}

// Configuración de resortes estilo Apple (Amortiguación Crítica sin oscilación innecesaria)
const appleSpring = {
  type: 'spring' as const,
  damping: 30,
  stiffness: 360,
  mass: 0.8,
};

// Definición estática de destinos principales fuera del componente
const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: Home, exact: true },
  { to: '/tabla-general', label: 'Tabla', icon: Award },
  { to: '/h2h', label: 'Versus', icon: Swords },
  { to: '/campeones', label: 'Campeones', icon: Trophy },
  { to: '/equipos', label: 'Equipos', icon: Shirt },
];

export const Navbar: React.FC<NavbarProps> = React.memo(({
  darkMode,
  onToggleTheme,
  onOpenContact,
}) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { isAdaro, selectedTournament, openSelector } = useTournament();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 10;
          setScrolled(prev => (prev !== isScrolled ? isScrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isCurrentActive = (path: string, exact = false) => {
    if (path === '/tabla-general') {
      return location.pathname === '/tabla-general' || location.pathname === '/tabla-anual';
    }
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* 1. Header Superior (Desktop & Mobile Chrome) */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.4)]'
            : 'bg-background/65 backdrop-blur-xl'
        } border-b border-border/40`}
        style={{
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
          backdropFilter: 'blur(24px) saturate(190%)',
          boxShadow: darkMode
            ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
            : 'inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
        }}
      >
        <div className="max-w-6xl flex h-16 items-center justify-between px-4 sm:px-8 mx-auto">
          
          {/* Brand Logo con Escala Óptica */}
          <Link
            to="/"
            className="flex items-center space-x-3 group focus:outline-none transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-border/50 bg-primary/5 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-200">
              <picture>
                <source srcSet="/logo_costa_y_gol.avif" type="image/avif" />
                <img
                  src="/logo_costa_y_gol.png"
                  alt="Costa y Gol"
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </picture>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 leading-none">
                Costa y Gol
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-muted-foreground mt-0.5">
                Fútbol Marplatense
              </span>
            </div>
          </Link>

          {/* 2. Desktop Segmented Navigation Control */}
          <nav className="hidden md:flex items-center p-1 bg-muted/60 dark:bg-muted/40 rounded-full border border-border/60 shadow-inner">
            {NAV_ITEMS.map((item) => {
              const active = isCurrentActive(item.to, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-colors duration-150 flex items-center space-x-1.5 active:scale-95 ${
                    active
                      ? 'text-primary dark:text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      transition={appleSpring}
                      className="absolute inset-0 bg-background rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-border/50"
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. Action Tools: Selector de Torneo, Contacto, Tema, Admin */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Pill Selector de Torneo */}
            <button
              onClick={openSelector}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary text-xs font-bold tracking-tight transition-all active:scale-95 shadow-xs"
              title="Cambiar Torneo Oficial"
              aria-label="Cambiar Torneo"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="hidden sm:inline max-w-[150px] truncate">
                {isAdaro ? 'Chamaco Adaro' : (selectedTournament ? selectedTournament.name.replace(/^Torneo\s+/i, '') : 'Clausura 2026')}
              </span>
              <span className="sm:hidden font-bold max-w-[110px] truncate">
                {isAdaro ? 'Adaro' : 'Clausura 2026'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70 flex-shrink-0" />
            </button>

            {/* Botón Contacto */}
            <button
              onClick={onOpenContact}
              className="p-2.5 rounded-full bg-muted/50 hover:bg-muted border border-border/50 text-muted-foreground hover:text-primary transition-all active:scale-90"
              aria-label="Contacto"
              title="Contacto"
            >
              <Mail className="w-4 h-4" />
            </button>

            {/* Toggle Tema con feedback físico y vectores Lucide */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-full bg-muted/50 hover:bg-muted border border-border/50 text-foreground transition-all active:scale-90"
              aria-label="Alternar tema claro/oscuro"
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Acceso Admin */}
            <Link
              to="/admin"
              className="p-2.5 rounded-full bg-muted/50 hover:bg-muted border border-border/50 text-muted-foreground hover:text-primary transition-all active:scale-90 flex items-center justify-center"
              title="Panel de Administración"
              aria-label="Panel de Administración"
            >
              <Lock className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 4. Tab Bar Flotante Inferior para Móvil (iOS Style Glass Island) */}
      <nav
        aria-label="Navegación móvil"
        className="md:hidden fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-border/60 bg-background/85 shadow-[0_8px_32px_rgba(0,0,0,0.14)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.55)] p-1.5"
        style={{
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
          backdropFilter: 'blur(24px) saturate(190%)',
          boxShadow: darkMode
            ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 8px 30px rgba(0, 0, 0, 0.6)'
            : 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6), 0 8px 24px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="grid grid-cols-5 gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isCurrentActive(item.to, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-semibold tracking-tight transition-all active:scale-90 ${
                  active
                    ? 'text-primary dark:text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="mobileActivePill"
                    transition={appleSpring}
                    className="absolute inset-0 bg-primary/10 dark:bg-white/10 rounded-xl"
                    style={{ zIndex: -1 }}
                  />
                )}
                <Icon className={`w-4 h-4 mb-0.5 ${active ? 'scale-110' : 'opacity-70'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
});
