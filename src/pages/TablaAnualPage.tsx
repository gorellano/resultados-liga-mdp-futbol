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
  fetchAllTournamentMatches 
} from '../lib/db';
import { calculateAnnualClubStandings } from '../lib/standings';
import type { Tournament, Division, Team, Match } from '../lib/types';
import { SponsorBanner } from '../components/SponsorBanner';

export function TablaAnualPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExtendedStats, setShowExtendedStats] = useState(false);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [tourns, divs, tms] = await Promise.all([
          fetchTournaments(),
          fetchDivisions(),
          fetchTeams(),
        ]);

        // Filtrar torneos de liga juvenil (excluir torneos especiales de Primera/Quinta/Sexta como Cacho Méndez)
        const leagueTourns = tourns.filter(t => 
          !t.name.toLowerCase().includes('cacho') && 
          !t.name.toLowerCase().includes('reyes')
        );
        setTournaments(leagueTourns);

        // Filtrar divisiones juveniles formativas (7ma a 16ta)
        const youthDivs = divs
          .filter(d => !['Primera División', 'Quinta División', 'Sexta División'].includes(d.name))
          .sort((a, b) => a.sort_order - b.sort_order);
        setDivisions(youthDivs);
        setTeams(tms);

        // Determinar torneo activo (priorizar torneo juvenil con is_current o el primero)
        const activeTourn = leagueTourns.find(t => t.name.toLowerCase().includes('clausura') && t.is_current) ||
                            leagueTourns.find(t => t.is_current) ||
                            leagueTourns.find(t => t.name.toLowerCase().includes('clausura')) ||
                            leagueTourns[0] || tourns[0];

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
  }, []);

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

  // Lista de años disponibles basados en torneos registrados
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    tournaments.forEach(t => {
      if (t.year) yearsSet.add(t.year);
    });
    if (yearsSet.size === 0) yearsSet.add(new Date().getFullYear());
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [tournaments]);

  // Torneos correspondientes al año seleccionado
  const tournamentsInYear = useMemo(() => {
    return tournaments.filter(t => t.year === selectedYear);
  }, [tournaments, selectedYear]);

  // Torneo actualmente seleccionado
  const selectedTournament = useMemo(() => {
    return tournaments.find(t => t.id === selectedTournamentId) || null;
  }, [tournaments, selectedTournamentId]);

  // Cálculo de la Tabla Anual de Clubes
  const standings = useMemo(() => {
    if (teams.length === 0 || divisions.length === 0) return [];
    return calculateAnnualClubStandings(matches, teams, divisions);
  }, [matches, teams, divisions]);

  // Filtrado por buscador
  const filteredStandings = useMemo(() => {
    if (!searchQuery.trim()) return standings;
    const q = searchQuery.toLowerCase().trim();
    return standings.filter(s => 
      s.team.name.toLowerCase().includes(q) ||
      (s.team.display_name && s.team.display_name.toLowerCase().includes(q))
    );
  }, [standings, searchQuery]);

  // Estadísticas globales del año
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 sm:space-y-8 max-w-6xl mx-auto text-left"
    >
      {/* ── Breadcrumb & Back Navigation ── */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors bg-card/60 px-3 py-1.5 rounded-xl border border-border/50 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>

        <span className="text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          {selectedTournament ? selectedTournament.name : `Temporada ${selectedYear}`}
        </span>
      </div>

      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/15 via-card to-card border border-amber-500/30 p-5 sm:p-7 md:p-8 shadow-md backdrop-blur-md">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/35">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Tabla General de Clubes
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
              Tabla General LMF
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Sumatoria de puntos de cada institución en todas sus divisiones formativas (7ª a 16ª) en el <strong className="text-foreground">{selectedTournament ? selectedTournament.name : `Torneo ${selectedYear}`}</strong>.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          {leaderClub && (
            <div className="bg-card/80 border border-amber-500/30 p-4 rounded-2xl shadow-sm flex items-center gap-3.5 shrink-0 self-start md:self-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center p-1 shrink-0">
                {leaderClub.team.logo_url ? (
                  <img src={leaderClub.team.logo_url} alt={leaderClub.team.name} className="w-full h-full object-contain" />
                ) : (
                  <Trophy className="w-6 h-6 text-amber-500" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  👑 Líder General
                </span>
                <span className="text-sm sm:text-base font-black text-foreground block truncate max-w-[170px]">
                  {leaderClub.team.display_name || leaderClub.team.name}
                </span>
                <span className="text-xs font-extrabold text-primary">
                  {leaderClub.totalPoints} puntos acumulados
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-card/60 border border-border/60 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">Clubes en Competencia</span>
            <span className="text-lg font-black text-foreground">{standings.length} instituciones</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card/60 border border-border/60 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">Partidos Jugados</span>
            <span className="text-lg font-black text-foreground">{Math.round(totalMatchesPlayed)} encuentros</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card/60 border border-border/60 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Goal className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">Goles Totales</span>
            <span className="text-lg font-black text-foreground">{Math.round(totalGoals)} goles</span>
          </div>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ── */}
      <div className="bg-card/70 border border-border/60 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Year & Tournament Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Year Selector */}
            <div className="flex items-center gap-1.5 bg-muted/60 border border-border/60 rounded-xl px-3 py-1.5">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-bold text-muted-foreground">Año:</span>
              <select
                value={selectedYear}
                onChange={(e) => {
                  const newYear = Number(e.target.value);
                  setSelectedYear(newYear);
                  const inYear = tournaments.filter(t => t.year === newYear);
                  const currentInYear = inYear.find(t => t.is_current) || inYear[0];
                  if (currentInYear) {
                    setSelectedTournamentId(currentInYear.id);
                  } else {
                    setSelectedTournamentId('');
                  }
                }}
                className="bg-transparent text-xs font-black text-foreground outline-none cursor-pointer"
              >
                {availableYears.map(yr => (
                  <option key={yr} value={yr} className="bg-card text-foreground">
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Tournament Selector */}
            {tournamentsInYear.length > 0 && (
              <div className="flex items-center gap-1.5 bg-muted/60 border border-border/60 rounded-xl px-3 py-1.5">
                <Filter className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-bold text-muted-foreground">Torneo:</span>
                <select
                  value={selectedTournamentId}
                  onChange={(e) => setSelectedTournamentId(e.target.value)}
                  className="bg-transparent text-xs font-black text-foreground outline-none cursor-pointer max-w-[180px] sm:max-w-[240px] truncate"
                >
                  {tournamentsInYear.map(t => (
                    <option key={t.id} value={t.id} className="bg-card text-foreground">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Toggle Extended Stats (PJ, PG, PE, PP, DIF) */}
            <button
              type="button"
              onClick={() => setShowExtendedStats(!showExtendedStats)}
              className="text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors"
            >
              {showExtendedStats ? '📊 Ocultar PJ/DIF' : '📊 Ver PJ/DIF'}
            </button>
          </div>

          {/* Right: Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar club..."
              className="w-full pl-9 pr-4 py-1.5 bg-muted/40 border border-border/60 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      </div>

      {/* ── Standings Table ── */}
      <section className="bg-card/70 border border-border/70 rounded-3xl overflow-hidden shadow-sm backdrop-blur-xs">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground text-sm font-semibold flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Calculando posiciones de la tabla general...</span>
          </div>
        ) : filteredStandings.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Info className="w-8 h-8 text-muted-foreground mx-auto" />
            <h3 className="font-extrabold text-foreground text-base">No se encontraron resultados</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {searchQuery
                ? `No hay clubes que coincidan con "${searchQuery}".`
                : `Aún no hay partidos finalizados cargados para el torneo seleccionado.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/80 border-b border-border/70 text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-3 text-center w-12 sticky left-0 bg-card z-20 border-r border-border/40 shadow-xs">
                    Pos
                  </th>
                  <th className="py-3.5 px-3 sm:px-4 sticky left-12 bg-card z-20 min-w-[140px] sm:min-w-[180px] border-r border-border/40 shadow-xs">
                    Club
                  </th>

                  {/* Columnas por división */}
                  {divisions.map(div => (
                    <th 
                      key={div.id} 
                      title={div.name}
                      className="py-3.5 px-2.5 text-center min-w-[42px] max-w-[50px] cursor-help hover:text-primary transition-colors select-none"
                    >
                      {getDivShortName(div.name)}
                    </th>
                  ))}

                  {/* Estadísticas extendidas */}
                  {showExtendedStats && (
                    <>
                      <th className="py-3.5 px-2 text-center text-muted-foreground min-w-[36px]">PJ</th>
                      <th className="py-3.5 px-2 text-center text-emerald-600 dark:text-emerald-400 min-w-[36px]">PG</th>
                      <th className="py-3.5 px-2 text-center text-amber-600 dark:text-amber-400 min-w-[36px]">PE</th>
                      <th className="py-3.5 px-2 text-center text-rose-600 dark:text-rose-400 min-w-[36px]">PP</th>
                      <th className="py-3.5 px-2 text-center min-w-[40px]">DIF</th>
                    </>
                  )}

                  {/* Columna TOTAL */}
                  <th className="py-3.5 px-3 sm:px-5 text-center bg-card text-primary font-black text-xs sm:text-sm min-w-[76px] sticky right-0 z-20 border-l border-primary/25 shadow-[-3px_0_8px_rgba(0,0,0,0.12)]">
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
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Posición */}
                      <td className="py-3 px-3 text-center font-black sticky left-0 bg-card group-hover:bg-muted/60 transition-colors border-r border-border/40 z-10">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-xs shadow-2xs">
                            1°
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400/20 text-slate-700 dark:text-slate-300 font-black text-xs">
                            2°
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-800 dark:text-amber-600 font-black text-xs">
                            3°
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{rank}</span>
                        )}
                      </td>

                      {/* Club (Escudo + Nombre) */}
                      <td className="py-3 px-3 sm:px-4 sticky left-12 bg-card group-hover:bg-muted/60 transition-colors border-r border-border/40 z-10">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-background border border-border/60 flex items-center justify-center p-1 shrink-0 shadow-2xs">
                            {standing.team.logo_url ? (
                              <img src={standing.team.logo_url} alt={standing.team.name} className="w-full h-full object-contain" />
                            ) : (
                              <Shield className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-extrabold text-foreground tracking-tight truncate text-xs sm:text-sm">
                            {standing.team.display_name || standing.team.name}
                          </span>
                        </div>
                      </td>

                      {/* Puntos por división */}
                      {divisions.map(div => {
                        const pts = standing.divisionPoints[div.id] ?? 0;
                        return (
                          <td
                            key={div.id}
                            className={`py-3 px-2 text-center font-bold text-xs ${
                              pts > 0 ? 'text-foreground' : 'text-muted-foreground/40'
                            }`}
                          >
                            {pts}
                          </td>
                        );
                      })}

                      {/* Estadísticas extendidas */}
                      {showExtendedStats && (
                        <>
                          <td className="py-3 px-2 text-center text-muted-foreground font-semibold">{standing.played}</td>
                          <td className="py-3 px-2 text-center text-emerald-600 dark:text-emerald-400 font-bold">{standing.won}</td>
                          <td className="py-3 px-2 text-center text-amber-600 dark:text-amber-400 font-bold">{standing.drawn}</td>
                          <td className="py-3 px-2 text-center text-rose-600 dark:text-rose-400 font-bold">{standing.lost}</td>
                          <td className="py-3 px-2 text-center font-bold text-foreground">
                            {standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}
                          </td>
                        </>
                      )}

                      {/* TOTAL Puntos */}
                      <td className="py-3 px-3 sm:px-5 text-center bg-card group-hover:bg-muted/60 transition-colors sticky right-0 z-10 border-l border-primary/25 shadow-[-3px_0_8px_rgba(0,0,0,0.12)]">
                        <span className="inline-block px-2.5 py-1 rounded-xl bg-primary text-primary-foreground font-black text-xs sm:text-sm shadow-xs min-w-[2.75rem]">
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

      {/* ── Footer Sponsor Banner ── */}
      <SponsorBanner />
    </motion.div>
  );
}
