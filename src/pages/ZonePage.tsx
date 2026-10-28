import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Layers, 
  Trophy, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { AdaroZoneView } from '../components/AdaroZoneView';
import { 
  fetchTournaments, 
  fetchDivisions, 
  fetchTeams, 
  fetchZones, 
  fetchAllTournamentMatches,
  isExcludedDivision 
} from '../lib/db';
import { 
  ADARO_TOURNAMENT_ID, 
  ADARO_ZONES, 
  getAdaroZoneClubs 
} from '../lib/mockAdaroData';
import { ClubLogo } from '../components/ClubLogo';
import type { Division, Team, Zone, Match } from '../lib/types';

export const ZonePage: React.FC = () => {
  const { year: paramYear, zoneId: paramZoneId } = useParams<{ year?: string; zoneId?: string }>();
  const navigate = useNavigate();
  const { setTournamentById } = useTournament();

  // Normalizar el año (por defecto 2026 si no viene en el path)
  const currentYear = useMemo(() => {
    const parsed = parseInt(paramYear || '', 10);
    return isNaN(parsed) ? 2026 : parsed;
  }, [paramYear]);

  // Normalizar el ID de la zona
  const normalizedZoneId = useMemo(() => {
    if (!paramZoneId) return 'adaro-zone-a';
    const lower = paramZoneId.toLowerCase();
    const found = ADARO_ZONES.find(
      z => z.id === lower || z.name.toLowerCase() === lower || z.name.toLowerCase().replace('zona ', '') === lower
    );
    return found ? found.id : (lower.startsWith('adaro-zone-') ? lower : 'adaro-zone-a');
  }, [paramZoneId]);

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Redirigir al path con año canónico si se ingresó sin año (/zona/adaro-zone-a -> /2026/zona/adaro-zone-a)
  useEffect(() => {
    if (!paramYear) {
      navigate(`/${currentYear}/zona/${normalizedZoneId}`, { replace: true });
    }
  }, [paramYear, currentYear, normalizedZoneId, navigate]);

  // Cargar datos base
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [tourns, divs, tms, zns] = await Promise.all([
          fetchTournaments(),
          fetchDivisions(),
          fetchTeams(),
          fetchZones(),
        ]);

        if (!isMounted) return;

        setDivisions(divs.filter(d => !isExcludedDivision(d.name)));
        setTeams(tms);
        setZones(zns);

        // Buscar el torneo Adaro correspondiente al año
        const adaroTourn = tourns.find(
          t => (t.id === ADARO_TOURNAMENT_ID || t.name.toLowerCase().includes('adaro')) && (t.year === currentYear || !t.year)
        ) || tourns.find(t => t.id === ADARO_TOURNAMENT_ID) || tourns[0];

        if (adaroTourn) {
          setTournamentById(adaroTourn.id);
          const tournMatches = await fetchAllTournamentMatches(adaroTourn.id);
          if (isMounted) {
            setMatches(tournMatches);
          }
        }
      } catch (err) {
        console.error('Error cargando datos de la Zona:', err);
        if (isMounted) setError('No se pudieron cargar los datos de la zona.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [currentYear, setTournamentById]);

  // Cambiar de zona navegando al nuevo path con año
  const handleSelectZone = (newZoneId: string) => {
    navigate(`/${currentYear}/zona/${newZoneId}`);
  };

  const currentZoneObj = useMemo(() => {
    return ADARO_ZONES.find(z => z.id === normalizedZoneId) || ADARO_ZONES[0];
  }, [normalizedZoneId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6 max-w-6xl mx-auto text-left font-sans"
    >
      {/* ── Breadcrumb & Top Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors bg-card px-3 py-1.5 rounded-xl border border-border/70 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border/60 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Temporada {currentYear}</span>
            </span>

            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 hidden md:inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Torneo Armando "Chamaco" Adaro</span>
            </span>
          </div>
        </div>

        {/* Link a Copas de Playoff */}
        <Link
          to="/copas"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all self-start sm:self-auto shadow-xs"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Ver Cuadro de 4 Copas</span>
        </Link>
      </div>

      {/* ── Header de la Zona ── */}
      <div className="rounded-2xl bg-card border border-border/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Fase Clasificatoria · Temporada {currentYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {currentZoneObj.name} · Torneo Adaro
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Tabla acumulada oficial de las 8 divisiones puntuables (7ª a 14ª), fixture completo de las 6 fechas de tiras y tablas de posiciones individuales por categoría.
          </p>
        </div>

        {/* Escudos de los 4 clubes de esta zona (solo escudos sin nombres para optimizar espacio visual) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-start md:self-center">
          {getAdaroZoneClubs(currentZoneObj.id, teams).map((club) => {
            const clubName = club.display_name || club.name;
            return (
              <div 
                key={club.id} 
                className="group relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-card hover:bg-muted/50 border border-border/80 hover:border-primary/50 shadow-2xs hover:shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 p-1.5"
                title={clubName}
                aria-label={clubName}
              >
                <ClubLogo 
                  url={club.logo_url} 
                  name={clubName} 
                  className="w-full h-full object-contain filter drop-shadow-2xs transition-transform duration-200 group-hover:scale-110"
                  iconClassName="w-5 h-5 text-muted-foreground"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Selector Rápido de Zonas A - G con URLs con año ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
        {ADARO_ZONES.map((z) => {
          const isActive = z.id === currentZoneObj.id;
          return (
            <button
              key={z.id}
              onClick={() => handleSelectZone(z.id)}
              className={`flex-shrink-0 snap-start px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20'
                  : 'bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border/70'
              }`}
            >
              {z.name}
            </button>
          );
        })}
      </div>

      {/* ── Contenido Principal: AdaroZoneView ── */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border/70 shadow-xs space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-muted-foreground">
            Cargando estadísticas oficiales y partidos de la {currentZoneObj.name}...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive space-y-2">
          <ShieldAlert className="w-8 h-8 mx-auto" />
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <AdaroZoneView
          selectedZoneId={currentZoneObj.id}
          onSelectZone={handleSelectZone}
          matches={matches}
          teams={teams}
          divisions={divisions}
          zones={zones}
        />
      )}
    </motion.div>
  );
};
