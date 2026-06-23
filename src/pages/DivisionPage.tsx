import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../App';
import { calculateStandings } from '../lib/standings';
import { Shield, Share2, Copy, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fetchTournaments, fetchDivisions, fetchZones, fetchTeams, fetchMatches } from '../lib/db';
import { getCategoryYear } from '../lib/auth';
import type { Team, Match, Tournament, Division, Zone } from '../lib/types';

function StandingsSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="bg-muted/30 border-b border-border/50 h-14 flex items-center px-6">
        <div className="h-4 bg-muted-foreground/20 rounded w-8 mr-6"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-32 flex-1"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-10 ml-4"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-10 ml-4"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-10 ml-4 hidden sm:block"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-10 ml-4 hidden sm:block"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-10 ml-4 hidden sm:block"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-12 ml-4"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-16 ml-4"></div>
      </div>
      <div className="divide-y divide-border/50">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="h-16 flex items-center px-6 py-4">
            <div className="w-8 h-8 rounded-full bg-muted/50 mr-6 flex-shrink-0"></div>
            <div className="w-10 h-10 rounded-full bg-muted/50 mr-4 flex-shrink-0"></div>
            <div className="h-5 bg-muted/50 rounded w-1/3 flex-1"></div>
            <div className="w-8 h-8 rounded bg-muted/50 ml-4 flex-shrink-0"></div>
            <div className="h-4 bg-muted/40 rounded w-6 ml-6 flex-shrink-0"></div>
            <div className="h-4 bg-muted/40 rounded w-6 ml-6 flex-shrink-0 hidden sm:block"></div>
            <div className="h-4 bg-muted/40 rounded w-6 ml-6 flex-shrink-0 hidden sm:block"></div>
            <div className="h-4 bg-muted/40 rounded w-6 ml-6 flex-shrink-0 hidden sm:block"></div>
            <div className="h-5 bg-muted/50 rounded w-8 ml-6 flex-shrink-0"></div>
            <div className="flex gap-1 ml-6 shrink-0">
              <div className="w-6 h-6 rounded-full bg-muted/40"></div>
              <div className="w-6 h-6 rounded-full bg-muted/40"></div>
              <div className="w-6 h-6 rounded-full bg-muted/40"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FixtureSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 bg-muted/50 rounded w-24"></div>
        <div className="h-2 bg-muted/30 rounded-full w-full"></div>
      </div>
      <div className="flex gap-2 py-2 overflow-x-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-8 h-8 rounded-full bg-muted/50 shrink-0"></div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-5 bg-muted/60 rounded w-28"></div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-border/50 rounded-2xl p-5 bg-card/30 flex flex-col gap-4">
              <div className="flex justify-between items-center mb-1">
                <div className="h-4 bg-muted/50 rounded w-20"></div>
                <div className="h-3 bg-muted/30 rounded w-24"></div>
              </div>
              <div className="flex justify-between items-center gap-4">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-14 h-14 rounded-full bg-muted/50"></div>
                  <div className="h-4 bg-muted/55 rounded w-16"></div>
                </div>
                <div className="w-20 h-10 bg-muted/40 rounded-xl"></div>
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-14 h-14 rounded-full bg-muted/50"></div>
                  <div className="h-4 bg-muted/55 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DivisionPage() {
  const { name } = useParams();
  const [zone, setZone] = useState<'campeonato' | 'promocion'>('campeonato');
  const [tab, setTab] = useState<'posiciones' | 'fixture'>('posiciones');
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [copiedRound, setCopiedRound] = useState(false);
  const [copiedMatchId, setCopiedMatchId] = useState<string | null>(null);
  
  const handleShareRound = () => {
    const zoneLabel = zone === 'campeonato' ? 'Zona Campeonato' : 'Zona Promoción';
    let text = `🏆 Liga MDP - ${name}\n📅 ${zoneLabel} - Fecha ${selectedRound}\n\n`;
    
    matchesByRound.forEach(match => {
      const home = teams.find(t => t.id === match.home_team_id);
      const away = teams.find(t => t.id === match.away_team_id);
      if (!home || !away) return;
      
      const homeName = home.display_name ?? home.name;
      const awayName = away.display_name ?? away.name;
      
      if (match.status === 'finished') {
        text += `⚽ ${homeName} ${match.home_goals} - ${match.away_goals} ${awayName}\n`;
      } else {
        text += `⏳ ${homeName} vs ${awayName}\n`;
      }
    });
    
    text += `\nCosta y Gol ⚽`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedRound(true);
      setTimeout(() => setCopiedRound(false), 2000);
    }
  };

  const handleShareMatch = (match: Match) => {
    const home = teams.find(t => t.id === match.home_team_id);
    const away = teams.find(t => t.id === match.away_team_id);
    if (!home || !away) return;
    
    const homeName = home.display_name ?? home.name;
    const awayName = away.display_name ?? away.name;
    const zoneLabel = zone === 'campeonato' ? 'Zona Campeonato' : 'Zona Promoción';
    
    let text = `⚽ Liga MDP - ${name} (${zoneLabel})\n📅 Fecha ${match.round_number}\n\n`;
    if (match.status === 'finished') {
      text += `${homeName} ${match.home_goals} - ${match.away_goals} ${awayName}\n🏆 ¡Partido Finalizado!`;
    } else {
      text += `${homeName} vs ${awayName}\n⏳ Próximamente`;
    }
    text += `\n\nCosta y Gol ⚽`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMatchId(match.id);
      setTimeout(() => setCopiedMatchId(null), 2000);
    }
  };
  
  // Datos cargados dinámicamente
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar datos base al montar
  useEffect(() => {
    async function loadBaseData() {
      try {
        const [tourns, divs, zns, tms] = await Promise.all([
          fetchTournaments(),
          fetchDivisions(),
          fetchZones(),
          fetchTeams(),
        ]);
        setTournaments(tourns);
        setDivisions(divs);
        setZones(zns);
        setAllTeams(tms);

        if (tourns.length > 0) {
          setSelectedYear(tourns[0].year);
          setSelectedTournamentId(tourns[0].id);
        }
      } catch (err) {
        console.error('Error loading base data:', err);
      }
    }
    loadBaseData();
  }, []);

  // 2. Cargar partidos filtrados cuando cambien los filtros o la ruta
  useEffect(() => {
    if (divisions.length === 0 || zones.length === 0 || !selectedTournamentId) return;

    async function loadFilteredMatches() {
      setLoading(true);
      try {
        // Encontrar UUID de división correspondiente al nombre de la URL
        const currentDiv = divisions.find(d => d.name === name) || divisions[0];
        const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const currentZone = zones.find(z => normalize(z.name) === normalize(zone)) || zones[0];

        const data = await fetchMatches(currentDiv.id, currentZone.id, selectedTournamentId);
        setMatches(data);

        const roundsList = Array.from(new Set(data.map(m => m.round_number))).sort((a, b) => a - b);
        if (roundsList.length > 0) {
          let activeRound = roundsList[roundsList.length - 1]; // por defecto la última
          for (const round of roundsList) {
            const roundMatches = data.filter(m => m.round_number === round);
            const finishedCount = roundMatches.filter(m => m.status === 'finished').length;
            const completionRate = roundMatches.length > 0 ? (finishedCount / roundMatches.length) : 0;
            
            // Si la fecha tiene menos del 85% cargado, nos quedamos en esta fecha
            if (completionRate < 0.85) {
              activeRound = round;
              break;
            }
          }
          setSelectedRound(activeRound);
        } else {
          setSelectedRound(1);
        }
      } catch (err) {
        console.error('Error loading matches:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFilteredMatches();
  }, [name, zone, selectedTournamentId, divisions, zones]);

  // 3. Filtrar los equipos de la zona seleccionada
  const teams = useMemo(() => {
    if (allTeams.length === 0) return [];
    
    // Si estamos en modo mock local (los IDs empiezan con 'camp-team' o 'prom-team')
    if (allTeams[0].id.includes('team')) {
      return zone === 'campeonato' 
        ? allTeams.filter(t => t.id.startsWith('camp-team'))
        : allTeams.filter(t => t.id.startsWith('prom-team'));
    }
    
    // Si estamos con Supabase real, filtramos los equipos basándonos en los partidos cargados
    const activeTeamIds = new Set(matches.flatMap(m => [m.home_team_id, m.away_team_id]));
    return allTeams.filter(t => activeTeamIds.has(t.id));
  }, [allTeams, zone, matches]);

  const standings = useMemo(() => calculateStandings(matches, teams), [matches, teams]);
  
  const formByTeam = useMemo(() => {
    const result: Record<string, ('G' | 'E' | 'P')[]> = {};
    teams.forEach(t => {
      const teamMatches = matches
        .filter(m => m.status === 'finished' && (m.home_team_id === t.id || m.away_team_id === t.id))
        .sort((a, b) => a.round_number - b.round_number);
      const form = teamMatches.map(m => {
        const isHome = m.home_team_id === t.id;
        const homeGoals = m.home_goals ?? 0;
        const awayGoals = m.away_goals ?? 0;
        if (homeGoals === awayGoals) return 'E';
        if (isHome) {
          return homeGoals > awayGoals ? 'G' : 'P';
        } else {
          return awayGoals > homeGoals ? 'G' : 'P';
        }
      });
      result[t.id] = form.slice(-5);
    });
    return result;
  }, [matches, teams]);
  
  const rounds = useMemo(() => {
    return Array.from(new Set(matches.map(m => m.round_number))).sort((a, b) => a - b);
  }, [matches]);
  
  const matchesByRound = useMemo(() => {
    return matches.filter(m => m.round_number === selectedRound);
  }, [matches, selectedRound]);

  const currentTournament = useMemo(() => {
    return tournaments.find(t => t.id === selectedTournamentId);
  }, [tournaments, selectedTournamentId]);
  
  const uniqueYears = useMemo(() => {
    return Array.from(new Set(tournaments.map(t => t.year))).sort((a, b) => b - a);
  }, [tournaments]);

  const tournamentsForYear = useMemo(() => {
    return tournaments.filter(t => t.year === selectedYear);
  }, [tournaments, selectedYear]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            {name}
            {getCategoryYear(name ?? '', selectedYear) !== null && (
              <span className="text-2xl font-semibold text-muted-foreground/70 ml-2">
                (Categoría {getCategoryYear(name ?? '', selectedYear)})
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Temporada {selectedYear} - Torneo {currentTournament?.name ?? '—'}</p>
        </div>
        <div className="flex bg-muted/50 p-1.5 rounded-xl backdrop-blur-sm border border-border/50">
          <button
            onClick={() => setZone('campeonato')}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300",
              zone === 'campeonato' ? "bg-background shadow-md text-primary scale-[1.02]" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Campeonato
          </button>
          <button
            onClick={() => setZone('promocion')}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300",
              zone === 'promocion' ? "bg-background shadow-md text-primary scale-[1.02]" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Promoción
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/40 p-4 rounded-xl border border-border/50">
        <div className="flex border-b sm:border-b-0 border-border/50 overflow-x-auto hide-scrollbar w-full sm:w-auto">
          {['posiciones', 'fixture'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={cn(
                "px-6 py-2 text-sm font-bold border-b-2 sm:border-b-0 transition-all duration-300 capitalize whitespace-nowrap",
                tab === t 
                  ? "border-primary text-primary sm:bg-primary/10 sm:rounded-lg" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/80 sm:hover:bg-muted/50 sm:rounded-lg"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <select 
            className="flex-1 sm:flex-none bg-background border border-border/50 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
            value={selectedYear}
            onChange={(e) => {
              const year = Number(e.target.value);
              setSelectedYear(year);
              const tourns = tournaments.filter(t => t.year === year);
              if (tourns.length > 0) setSelectedTournamentId(tourns[0].id);
            }}
          >
            {uniqueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select 
            className="flex-1 sm:flex-none bg-background border border-border/50 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
          >
            {tournamentsForYear.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-xl rounded-2xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden min-h-[400px] relative">
        {loading && (
          tab === 'posiciones' ? <StandingsSkeleton /> : <FixtureSkeleton />
        )}
        {!loading && tab === 'posiciones' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground font-bold uppercase bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="px-6 py-5 text-center w-16">Pos</th>
                  <th className="px-6 py-5">Equipo</th>
                  <th className="px-6 py-5 text-center">Pts</th>
                  <th className="px-6 py-5 text-center">PJ</th>
                  <th className="px-6 py-5 text-center hidden sm:table-cell">G</th>
                  <th className="px-6 py-5 text-center hidden sm:table-cell">E</th>
                  <th className="px-6 py-5 text-center hidden sm:table-cell">P</th>
                  <th className="px-6 py-5 text-center hidden md:table-cell">GF</th>
                  <th className="px-6 py-5 text-center hidden md:table-cell">GC</th>
                  <th className="px-6 py-5 text-center">DIF</th>
                  <th className="px-6 py-5 text-center">Forma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {standings.map((row, index) => (
                  <tr key={row.team.id} className="hover:bg-muted/40 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-muted-foreground text-center">
                      {index === 0 ? <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-600 mx-auto">1</span> : 
                       index === 1 ? <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-400/20 text-slate-500 mx-auto">2</span> : 
                       index === 2 ? <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/20 text-amber-700 mx-auto">3</span> : 
                       index + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-background border border-border/50 shadow-sm flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                        {row.team.logo_url ? (
                          <img src={row.team.logo_url} alt={row.team.name} className="w-full h-full object-contain p-1.5" />
                        ) : (
                          <Shield className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="truncate max-w-[120px] sm:max-w-none text-base">{row.team.display_name ?? row.team.name}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-base">
                        {row.points}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground font-medium">{row.played}</td>
                    <td className="px-6 py-4 text-center hidden sm:table-cell text-muted-foreground font-medium">{row.won}</td>
                    <td className="px-6 py-4 text-center hidden sm:table-cell text-muted-foreground font-medium">{row.drawn}</td>
                    <td className="px-6 py-4 text-center hidden sm:table-cell text-muted-foreground font-medium">{row.lost}</td>
                    <td className="px-6 py-4 text-center hidden md:table-cell text-muted-foreground font-medium">{row.goalsFor}</td>
                    <td className="px-6 py-4 text-center hidden md:table-cell text-muted-foreground font-medium">{row.goalsAgainst}</td>
                    <td className="px-6 py-4 text-center font-bold">
                      <span className={cn("px-2 py-1 rounded-md text-xs", row.goalDifference > 0 ? "bg-green-500/10 text-green-600" : row.goalDifference < 0 ? "bg-red-500/10 text-red-600" : "bg-muted text-muted-foreground")}>
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {formByTeam[row.team.id]?.map((outcome, idx) => (
                          <span
                            key={idx}
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm select-none shrink-0 transition-transform hover:scale-110 duration-200",
                              outcome === 'G' ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" :
                              outcome === 'E' ? "bg-amber-200 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" :
                              "bg-rose-200 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                            )}
                            title={outcome === 'G' ? 'Victoria' : outcome === 'E' ? 'Empate' : 'Derrota'}
                          >
                            {outcome}
                          </span>
                        ))}
                        {(!formByTeam[row.team.id] || formByTeam[row.team.id].length === 0) && (
                          <span className="text-muted-foreground text-xs font-semibold">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === 'fixture' && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Progress bar del torneo */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="text-muted-foreground">Progreso del torneo</span>
                <span className="text-primary font-bold">{selectedRound} / {rounds.length} fechas</span>
              </div>
              <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                  style={{ width: rounds.length ? `${(selectedRound / rounds.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Ver Fecha:</span>
              <div className="flex gap-2">
                {rounds.map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRound(r)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors shrink-0",
                      selectedRound === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-border"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-muted/10 p-3 rounded-2xl border border-border/30">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Fecha {selectedRound}
                </h3>
                <button
                  onClick={handleShareRound}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 shadow-sm cursor-pointer",
                    copiedRound 
                      ? "bg-emerald-500 text-white" 
                      : "bg-primary/10 hover:bg-primary/20 text-primary hover:scale-[1.03]"
                  )}
                  title="Compartir todos los partidos de esta fecha"
                >
                  {copiedRound ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                      ✓ ¡Fixture Copiado!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      Compartir Fecha
                    </>
                  )}
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {matchesByRound.map(match => {
                  const home = teams.find(t => t.id === match.home_team_id);
                  const away = teams.find(t => t.id === match.away_team_id);
                  if (!home || !away) return null;
 
                  // Mostramos todos los partidos del fixture
                  return (
                    <div key={match.id} className="flex flex-col bg-background/50 border border-border/50 rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300 relative group/match">
                      <div className="flex justify-between items-center mb-5 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <span className={cn("px-2.5 py-1 rounded-full", match.status === 'finished' ? "bg-muted" : "bg-primary/10 text-primary")}>
                            {match.status === 'finished' ? 'Finalizado' : 'Por jugarse'}
                          </span>
                          <button
                            onClick={() => handleShareMatch(match)}
                            className={cn(
                              "p-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                              copiedMatchId === match.id 
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" 
                                : "hover:bg-muted text-muted-foreground hover:text-primary"
                            )}
                            title="Copiar resultado al portapapeles"
                          >
                            {copiedMatchId === match.id ? (
                              <span className="text-[10px] font-extrabold px-1">✓ Copiado</span>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {match.match_date && <span>{format(new Date(match.match_date), "HH:mm")} hs</span>}
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex flex-col items-center gap-3 flex-1">
                          <div className="w-14 h-14 rounded-full bg-background border border-border/50 shadow-sm flex items-center justify-center overflow-hidden">
                            {home.logo_url ? <img src={home.logo_url} className="w-full h-full object-contain p-2" /> : <Shield className="w-6 h-6 text-muted-foreground" />}
                          </div>
                          <span className="text-sm font-bold text-center line-clamp-2 leading-tight">{home.display_name ?? home.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-center gap-3 font-black text-2xl px-5 py-3 bg-muted/30 rounded-xl border border-border/50 min-w-[100px]">
                          {match.status === 'finished' ? (
                            <>
                              <span className={cn(match.home_goals! > match.away_goals! ? "text-primary" : "")}>{match.home_goals}</span>
                              <span className="text-muted-foreground/30">-</span>
                              <span className={cn(match.away_goals! > match.home_goals! ? "text-primary" : "")}>{match.away_goals}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground/50 text-base font-semibold">VS</span>
                          )}
                        </div>

                        <div className="flex flex-col items-center gap-3 flex-1">
                          <div className="w-14 h-14 rounded-full bg-background border border-border/50 shadow-sm flex items-center justify-center overflow-hidden">
                            {away.logo_url ? <img src={away.logo_url} className="w-full h-full object-contain p-2" /> : <Shield className="w-6 h-6 text-muted-foreground" />}
                          </div>
                          <span className="text-sm font-bold text-center line-clamp-2 leading-tight">{away.display_name ?? away.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
