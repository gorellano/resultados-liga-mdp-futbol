import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Award, 
  ChevronLeft, 
  Search, 
  Shield, 
  Trophy, 
  TrendingUp, 
  Goal, 
  Calendar,
  Filter,
  Info
} from 'lucide-react';
import { 
  fetchTournaments, 
  fetchDivisions, 
  fetchTeams, 
  fetchAllTournamentMatches,
  isExcludedDivision 
} from '../lib/db';
import { calculateAnnualClubStandings } from '../lib/standings';
import type { Tournament, Division, Team, Match } from '../lib/types';
import { SponsorBanner } from '../components/SponsorBanner';
import { useTournament } from '../context/TournamentContext';
import { 
  ADARO_TOURNAMENT_ID, 
  isAdaroPuntuableDivision 
} from '../lib/mockAdaroData';

export function TablaAnualPage() {
  const { selectedTournamentId: contextTournId, setTournamentById } = useTournament();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(contextTournId || ADARO_TOURNAMENT_ID);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExtendedStats, setShowExtendedStats] = useState(false);

  const isAdaroActive = useMemo(() => {
    return selectedTournamentId === ADARO_TOURNAMENT_ID || 
           (tournaments.find(t => t.id === selectedTournamentId)?.name.toLowerCase().includes('adaro') ?? false) ||
           (tournaments.find(t => t.id === selectedTournamentId)?.name.toLowerCase().includes('chamaco') ?? false);
  }, [selectedTournamentId, tournaments]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [tourns, divs, tms] = await Promise.all([
          fetchTournaments(),
          fetchDivisions(),
          fetchTeams(),
        ]);

        // Cargar torneos válidos de inferiores (excluyendo Cacho Méndez)
        const leagueTourns = tourns.filter(t => {
          const name = t.name.toLowerCase();
          return (
            !name.includes('cacho') &&
            !name.includes('mendez') &&
            !name.includes('méndez') &&
            !name.includes('joaquin') &&
            !name.includes('joaquín') &&
            !name.includes('reyes')
          );
        });
        setTournaments(leagueTourns);

        // Filtrar divisiones juveniles formativas
        const youthDivs = divs
          .filter(d => !isExcludedDivision(d.name))
          .sort((a, b) => a.sort_order - b.sort_order);
        setDivisions(youthDivs);
        setTeams(tms);

        // Determinar torneo activo (priorizar torneo del contexto o Adaro por default)
        const activeTourn = leagueTourns.find(t => t.id === contextTournId) ||
                            leagueTourns.find(t => t.id === ADARO_TOURNAMENT_ID) ||
                            leagueTourns.find(t => t.name.toLowerCase().includes('adaro')) ||
                            leagueTourns.find(t => t.name.toLowerCase().includes('chamaco')) ||
                            leagueTourns.find(t => t.is_current) ||
                            leagueTourns[0];

        if (activeTourn) {
          const defaultYear = activeTourn.year || new Date().getFullYear();
          setSelectedYear(defaultYear);
          setSelectedTournamentId(activeTourn.id);
        }
      } catch (err) {
        console.error('Error cargando datos iniciales de tabla general:', err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [contextTournId]);

  // Cargar partidos cuando cambia el torneo seleccionado
  useEffect(() => {
    let isMounted = true;
    async function loadMatches() {
      if (!selectedTournamentId) {
        setMatches([]);
        return;
      }
      setLoading(true);
      try {
        const tournMatches = await fetchAllTournamentMatches(selectedTournamentId);
        if (isMounted) setMatches(tournMatches);
      } catch (err) {
        console.error('Error cargando partidos del torneo:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMatches();
    return () => { isMounted = false; };
  }, [selectedTournamentId]);


  // Torneo actualmente seleccionado
  const selectedTournament = useMemo(() => {
    return tournaments.find(t => t.id === selectedTournamentId) || null;
  }, [tournaments, selectedTournamentId]);

  // Cálculo de divisiones efectivas para la tabla general
  // Si Adaro está activo, puntúan exclusivamente las divisiones 7ª a 14ª
  const effectiveDivisions = useMemo(() => {
    if (isAdaroActive) {
      return divisions.filter(d => isAdaroPuntuableDivision(d));
    }
    return divisions;
  }, [divisions, isAdaroActive]);

  const standings = useMemo(() => {
    if (teams.length === 0 || effectiveDivisions.length === 0) return [];
    return calculateAnnualClubStandings(matches, teams, effectiveDivisions);
  }, [matches, teams, effectiveDivisions]);

  // Filtrado por buscador
  const filteredStandings = useMemo(() => {
    if (!searchQuery.trim()) return standings;
    const q = searchQuery.toLowerCase().trim();
    return standings.filter(s => 
      s.team.name.toLowerCase().includes(q) ||
      (s.team.display_name && s.team.display_name.toLowerCase().includes(q))
    );
  }, [standings, searchQuery]);

  // Estadísticas globales del torneo
  const leaderClub = standings[0] || null;
  const totalGoals = useMemo(() => {
    return standings.reduce((acc, s) => acc + s.goalsFor, 0) / 2; // cada gol se cuenta en home y away
  }, [standings]);
  const totalMatchesPlayed = useMemo(() => {
    return standings.reduce((acc, s) => acc + s.played, 0) / 2;
  }, [standings]);

  // Diccionario de abreviaciones de divisiones
  const DIVISION_SHORT_LABELS: Record<string, string> = {
    'séptima': '7ª',
    'septima': '7ª',
    'octava': '8ª',
    'novena': '9ª',
    'décima': '10ª',
    'decima': '10ª',
    'undécima': '11ª',
    'undecima': '11ª',
    'duodécima': '12ª',
    'duodecima': '12ª',
    'decimotercera': '13ª',
    'decimocuarta': '14ª',
    'decimoquinta': '15ª',
    'decimosexta': '16ª',
    '7ma': '7ª',
    '8va': '8ª',
    '9na': '9ª',
    '10ma': '10ª',
    '11ma': '11ª',
    '12ma': '12ª',
    '13ra': '13ª',
    '14ta': '14ª',
    '15ta': '15ª',
    '16ta': '16ª',
  };

  // Abreviación de nombres de división para cabeceras compactas y legibles
  const getDivShortName = (name: string) => {
    const clean = name.toLowerCase().replace(' división', '').replace(' division', '').trim();
    if (DIVISION_SHORT_LABELS[clean]) return DIVISION_SHORT_LABELS[clean];
    const match = name.match(/(\d+)/);
    if (match) return `${match[1]}ª`;
    return name.replace(/ División/i, '');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6 sm:space-y-7 max-w-6xl mx-auto text-left font-sans"
    >
      {/* ── Breadcrumb & Navigation ── */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors bg-card px-3 py-1.5 rounded-xl border border-border/70 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>

        <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border/60 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          {selectedTournament ? selectedTournament.name : `Temporada ${selectedYear}`}
        </span>
      </div>

      {/* ── Hero Banner (Estilo Costa y Gol, sobrio y natural) ── */}
      <section className="rounded-2xl bg-card border border-border/80 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Award className="w-3.5 h-3.5" />
              <span>{isAdaroActive ? 'Torneo Armando "Chamaco" Adaro' : 'Tabla General de Clubes'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {isAdaroActive ? 'Tabla General del Torneo' : 'Tabla General LMF'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isAdaroActive
                ? 'Sumatoria de puntos oficial de las 8 divisiones puntuables (7ª a 14ª). Todos los clubes inician desde cero en este torneo.'
                : `Sumatoria de puntos de cada institución en todas sus divisiones formativas en el ${selectedTournament ? selectedTournament.name : `Torneo ${selectedYear}`}.`}
            </p>
          </div>

          {/* Líder de la Tabla General */}
          {leaderClub && leaderClub.totalPoints > 0 && (
            <div className="bg-muted/40 border border-border/70 p-3.5 sm:p-4 rounded-xl shadow-xs flex items-center gap-3 shrink-0 self-start md:self-auto">
              <div className="w-11 h-11 rounded-xl bg-background border border-border/60 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                {leaderClub.team.logo_url ? (
                  <img src={leaderClub.team.logo_url} alt={leaderClub.team.name} className="w-full h-full object-contain" />
                ) : (
                  <Trophy className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Líder General
                </span>
                <span className="text-sm font-bold text-foreground block truncate max-w-[170px]">
                  {leaderClub.team.display_name || leaderClub.team.name}
                </span>
                <span className="text-xs font-semibold text-primary">
                  {leaderClub.totalPoints} puntos acumulados
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Métricas Resumen ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground block">Clubes en Competencia</span>
            <span className="text-base sm:text-lg font-bold text-foreground">
              {standings.length > 0 ? `${standings.length} instituciones` : 'Sin datos'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground block">Partidos Jugados</span>
            <span className="text-base sm:text-lg font-bold text-foreground">
              {Math.round(totalMatchesPlayed)} encuentros
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Goal className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground block">Goles Totales</span>
            <span className="text-base sm:text-lg font-bold text-foreground">
              {Math.round(totalGoals)} goles
            </span>
          </div>
        </div>
      </div>

      {/* ── Toolbar de Filtros & Buscador ── */}
      <div className="bg-card border border-border/70 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Selector de Torneos (permite ver torneos actuales y anteriores) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {tournaments.length > 0 && (
              <div className="flex items-center gap-1.5 bg-muted/60 border border-border/70 rounded-xl px-3 py-1.5">
                <Filter className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-semibold text-muted-foreground">Torneo:</span>
                <select
                  value={selectedTournamentId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedTournamentId(newId);
                    setTournamentById(newId);
                    const sel = tournaments.find(t => t.id === newId);
                    if (sel && sel.year) setSelectedYear(sel.year);
                  }}
                  className="bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer max-w-[200px] sm:max-w-[280px] truncate"
                >
                  {tournaments.map(t => (
                    <option key={t.id} value={t.id} className="bg-card text-foreground">
                      {t.name} {t.year ? `(${t.year})` : ''} {t.is_current ? '· Actual' : '· Finalizado'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Toggle Estadísticas Extendidas (PJ, PG, PE, PP, DIF) */}
            <button
              type="button"
              onClick={() => setShowExtendedStats(!showExtendedStats)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted/80 transition-colors"
            >
              {showExtendedStats ? '📊 Ocultar PJ/DIF' : '📊 Ver PJ/DIF'}
            </button>
          </div>

          {/* Buscador de Club */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar club..."
              className="w-full pl-9 pr-4 py-1.5 bg-muted/50 border border-border/70 rounded-xl text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      </div>

      {/* ── Tabla General ── */}
      <section className="bg-card border border-border/70 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Calculando posiciones de la tabla general...</span>
          </div>
        ) : filteredStandings.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No se encontraron resultados</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {searchQuery
                ? `No hay clubes que coincidan con "${searchQuery}".`
                : `Aún no hay partidos finalizados cargados para el torneo seleccionado.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-border/70 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3 text-center w-12 sticky left-0 bg-card z-20 border-r border-border/40">
                    Pos
                  </th>
                  <th className="py-3 px-3 sm:px-4 sticky left-12 bg-card z-20 min-w-[140px] sm:min-w-[180px] border-r border-border/40">
                    Club
                  </th>

                  {/* Columnas por división puntuable */}
                  {effectiveDivisions.map(div => (
                    <th 
                      key={div.id} 
                      title={div.name}
                      className="py-3 px-2 text-center min-w-[38px] max-w-[46px] select-none"
                    >
                      {getDivShortName(div.name)}
                    </th>
                  ))}

                  {/* Estadísticas extendidas */}
                  {showExtendedStats && (
                    <>
                      <th className="py-3 px-2 text-center text-slate-500 min-w-[36px]">PJ</th>
                      <th className="py-3 px-2 text-center text-emerald-600 dark:text-emerald-400 min-w-[36px]">PG</th>
                      <th className="py-3 px-2 text-center text-amber-600 dark:text-amber-400 min-w-[36px]">PE</th>
                      <th className="py-3 px-2 text-center text-rose-600 dark:text-rose-400 min-w-[36px]">PP</th>
                      <th className="py-3 px-2 text-center text-slate-600 dark:text-slate-300 min-w-[40px]">DIF</th>
                    </>
                  )}

                  {/* Columna TOTAL Puntos */}
                  <th className="py-3 px-3 sm:px-5 text-center bg-card text-primary font-bold text-xs sm:text-sm min-w-[70px] sticky right-0 z-20 border-l border-primary/20 shadow-[-3px_0_6px_rgba(0,0,0,0.06)]">
                    TOTAL
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/50">
                {filteredStandings.map((standing, index) => {
                  const rank = index + 1;
                  const isTop1 = rank === 1;

                  return (
                    <tr
                      key={standing.team.id}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      {/* Posición */}
                      <td className="py-2.5 px-3 text-center font-bold sticky left-0 bg-card group-hover:bg-muted/60 transition-colors border-r border-border/40 z-10">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-xs">
                            1°
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground font-bold text-xs">
                            2°
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-800/15 text-amber-800 dark:text-amber-500 font-bold text-xs">
                            3°
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-medium">{rank}</span>
                        )}
                      </td>

                      {/* Club (Escudo + Nombre) */}
                      <td className="py-2.5 px-3 sm:px-4 sticky left-12 bg-card group-hover:bg-muted/60 transition-colors border-r border-border/40 z-10">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-background border border-border/60 flex items-center justify-center p-1 shrink-0 shadow-2xs">
                            {standing.team.logo_url ? (
                              <img src={standing.team.logo_url} alt={standing.team.name} className="w-full h-full object-contain" />
                            ) : (
                              <Shield className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-semibold text-foreground tracking-tight truncate text-xs sm:text-sm">
                            {standing.team.display_name || standing.team.name}
                          </span>
                        </div>
                      </td>

                      {/* Puntos por división */}
                      {effectiveDivisions.map(div => {
                        const pts = standing.divisionPoints[div.id] ?? 0;
                        return (
                          <td
                            key={div.id}
                            className={`py-2.5 px-2 text-center font-semibold text-xs ${
                              pts > 0 ? 'text-foreground' : 'text-muted-foreground/35'
                            }`}
                          >
                            {pts}
                          </td>
                        );
                      })}

                      {/* Estadísticas extendidas */}
                      {showExtendedStats && (
                        <>
                          <td className="py-2.5 px-2 text-center text-muted-foreground font-medium">{standing.played}</td>
                          <td className="py-2.5 px-2 text-center text-emerald-600 dark:text-emerald-400 font-semibold">{standing.won}</td>
                          <td className="py-2.5 px-2 text-center text-amber-600 dark:text-amber-400 font-semibold">{standing.drawn}</td>
                          <td className="py-2.5 px-2 text-center text-rose-600 dark:text-rose-400 font-semibold">{standing.lost}</td>
                          <td className="py-2.5 px-2 text-center font-semibold text-foreground">
                            {standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}
                          </td>
                        </>
                      )}

                      {/* TOTAL Puntos */}
                      <td className="py-2.5 px-3 sm:px-5 text-center bg-card group-hover:bg-muted/60 transition-colors sticky right-0 z-10 border-l border-primary/20 shadow-[-3px_0_6px_rgba(0,0,0,0.06)]">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-bold text-xs sm:text-sm shadow-xs min-w-[2.5rem]">
                          {standing.totalPoints}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Sponsor Banner ── */}
      <SponsorBanner />
    </motion.div>
  );
}

