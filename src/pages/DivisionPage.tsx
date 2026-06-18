import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../App';
import { calculateStandings } from '../lib/standings';
import { Shield } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { fetchTournaments, fetchDivisions, fetchZones, fetchTeams, fetchMatches } from '../lib/db';
import type { Team, Match, Tournament, Division, Zone } from '../lib/types';

function getCategoryYear(divisionName: string, tournamentYear: number): number {
  if (!divisionName) return 0;
  const map: Record<string, number> = {
    '1ra': 1, 'primera': 1,
    '5ta': 5, 'quinta': 5,
    '6ta': 6, 'sexta': 6,
    '7ma': 7, 'séptima': 7, 'septima': 7,
    '8va': 8, 'octava': 8,
    '9na': 9, 'novena': 9,
    '10ma': 10, 'décima': 10, 'decima': 10,
    '11ma': 11, 'undécima': 11, 'undecima': 11,
    '12ma': 12, 'duodécima': 12, 'duodecima': 12,
    '13ra': 13, 'decimotercera': 13,
    '14ta': 14, 'decimocuarta': 14,
    '15ta': 15, 'decimoquinta': 15,
    '16ta': 16, 'decimosexta': 16,
  };
  
  const lowerName = divisionName.toLowerCase();
  let divNumber = 0;

  for (const [key, val] of Object.entries(map)) {
    if (lowerName.includes(key)) {
      divNumber = val;
      break;
    }
  }

  if (divNumber === 0) {
    const match = divisionName.match(/(\d+)/);
    if (match) divNumber = parseInt(match[1]);
  }

  if (divNumber === 0 || divNumber === 1) return 0;
  
  return divNumber + tournamentYear - 23;
}

export function DivisionPage() {
  const { name } = useParams();
  const [zone, setZone] = useState<'campeonato' | 'promocion'>('campeonato');
  const [tab, setTab] = useState<'posiciones' | 'fixture'>('posiciones');
  const [selectedRound, setSelectedRound] = useState<number>(1);
  
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
          if (!roundsList.includes(selectedRound)) {
            setSelectedRound(roundsList[0]);
          }
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
            {name} <span className="text-2xl font-semibold text-muted-foreground/70">({getCategoryYear(name ?? '', selectedYear)})</span>
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
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full"
            />
          </div>
        )}
        {tab === 'posiciones' && (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'fixture' && (
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
              <h3 className="font-semibold text-lg">Fecha {selectedRound}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {matchesByRound.map(match => {
                  const home = teams.find(t => t.id === match.home_team_id);
                  const away = teams.find(t => t.id === match.away_team_id);
                  if (!home || !away) return null;

                  // Mostramos todos los partidos del fixture
                  return (
                    <div key={match.id} className="flex flex-col bg-background/50 border border-border/50 rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                      <div className="flex justify-between items-center mb-5 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                        <span className={cn("px-2.5 py-1 rounded-full", match.status === 'finished' ? "bg-muted" : "bg-primary/10 text-primary")}>
                          {match.status === 'finished' ? 'Finalizado' : 'Por jugarse'}
                        </span>
                        {match.match_date && <span>{format(new Date(match.match_date), "d MMM, HH:mm", { locale: es })}</span>}
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
