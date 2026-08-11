import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Swords, Shield, Trophy, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDivisions, fetchTeams, fetchTournaments, fetchAllTournamentMatches, fetchZones, fetchMatches } from '../lib/db';
import type { Division, Team, Match } from '../lib/types';
import { calculateH2HStats } from '../lib/h2h';
import { calculateStandings } from '../lib/standings';
import { createSlug } from '../lib/slug';
import { isTournamentDivision, getTournamentConfig } from '../lib/divisionConfig';

export function H2HPage() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');
  const [teamAId, setTeamAId] = useState<string>('');
  const [teamBId, setTeamBId] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [divs, tms] = await Promise.all([
          fetchDivisions(),
          fetchTeams()
        ]);
        setDivisions(divs);
        setTeams(tms);

        if (divs.length > 0) {
          setSelectedDivisionId(divs[0].id);
        }
        if (tms.length >= 2) {
          setTeamAId(tms[0].id);
          setTeamBId(tms[1].id);
        }
      } catch (err) {
        console.error('Error cargando datos para H2H:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Cargar partidos de la división seleccionada
  useEffect(() => {
    async function loadMatches() {
      if (!selectedDivisionId) return;
      try {
        const tourns = await fetchTournaments();
        if (tourns.length === 0) return;
        const tournamentId = tourns[0].id;

        const currentDiv = divisions.find(d => d.id === selectedDivisionId);
        if (!currentDiv) return;

        const divSlug = createSlug(currentDiv.name);
        const isTournament = isTournamentDivision(divSlug);
        const zones = await fetchZones();

        let divMatches: Match[] = [];

        if (isTournament) {
          const config = getTournamentConfig(divSlug);
          const zoneNames = config?.zoneNames ?? ['Zona 1', 'Zona 2', 'Zona 3'];
          const foundZones = zoneNames.map(name => zones.find(z => z.name === name) ?? null);

          const matchArrays = await Promise.all(
            foundZones.map(z => z ? fetchMatches(currentDiv.id, z.id, tournamentId) : Promise.resolve([]))
          );
          divMatches = matchArrays.flat();
        } else {
          const matchArrays = await Promise.all(
            zones.map(z => fetchMatches(currentDiv.id, z.id, tournamentId))
          );
          divMatches = matchArrays.flat();

          if (divMatches.length === 0) {
            const msCamp = await fetchMatches(currentDiv.id, 'camp', tournamentId);
            const msProm = await fetchMatches(currentDiv.id, 'prom', tournamentId);
            divMatches = [...msCamp, ...msProm];
          }
        }

        if (divMatches.length === 0) {
          const allM = await fetchAllTournamentMatches(tournamentId);
          divMatches = allM.filter(m => m.division_id === selectedDivisionId);
        }

        setMatches(divMatches);
      } catch (err) {
        console.error('Error cargando partidos de división para H2H:', err);
      }
    }
    loadMatches();
  }, [selectedDivisionId, divisions]);

  const youthDivisions = useMemo(() => {
    return divisions.filter(d => !['Primera División', 'Quinta División', 'Sexta División'].includes(d.name));
  }, [divisions]);

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      const nameA = a.display_name ?? a.name;
      const nameB = b.display_name ?? b.name;
      return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
    });
  }, [teams]);

  useEffect(() => {
    if (sortedTeams.length >= 2) {
      const validA = sortedTeams.some(t => t.id === teamAId) ? teamAId : sortedTeams[0].id;
      const availableForB = sortedTeams.filter(t => t.id !== validA);
      const validB = availableForB.some(t => t.id === teamBId) ? teamBId : (availableForB[0]?.id ?? '');
      setTeamAId(validA);
      setTeamBId(validB);
    }
  }, [sortedTeams]);

  const teamA = useMemo(() => teams.find(t => t.id === teamAId) || null, [teams, teamAId]);
  const teamB = useMemo(() => teams.find(t => t.id === teamBId) || null, [teams, teamBId]);

  const standings = useMemo(() => {
    return calculateStandings(matches, teams);
  }, [matches, teams]);

  const stats = useMemo(() => {
    if (!teamAId || !teamBId) return null;
    return calculateH2HStats(teamAId, teamBId, matches, standings);
  }, [teamAId, teamBId, matches, standings]);

  const totalWins = stats ? stats.winsA + stats.winsB : 0;
  const pctA = totalWins > 0 && stats ? Math.round((stats.winsA / totalWins) * 100) : 50;
  const pctB = totalWins > 0 && stats ? Math.round((stats.winsB / totalWins) * 100) : 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/40 border border-border/50 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <Link
            to="/equipos"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a Equipos
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Swords className="w-7 h-7 text-primary shrink-0" />
            Modo versus
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Analizá el historial de duelos directos, victorias y estadísticas entre dos equipos.
          </p>
        </div>
      </div>

      {/* Selector de División y Equipos */}
      <div className="bg-card/60 border border-border/60 rounded-3xl p-5 sm:p-6 shadow-md backdrop-blur-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* División */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">División / Categoría</label>
            <select
              value={selectedDivisionId}
              onChange={(e) => setSelectedDivisionId(e.target.value)}
              className="w-full bg-background border border-border/60 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 text-sm font-semibold text-foreground cursor-pointer shadow-xs"
            >
              {youthDivisions.map(d => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-slate-100 py-1.5 font-medium">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Equipo A */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-primary uppercase tracking-wider">Equipo 1</label>
            <select
              value={teamAId}
              onChange={(e) => setTeamAId(e.target.value)}
              className="w-full bg-background border border-border/60 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 text-sm font-semibold text-foreground cursor-pointer shadow-xs"
            >
              {sortedTeams.map(t => (
                <option key={t.id} value={t.id} disabled={t.id === teamBId} className="bg-slate-900 text-slate-100 py-1.5 font-medium disabled:opacity-40">
                  {t.display_name ?? t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Equipo B */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-primary uppercase tracking-wider">Equipo 2</label>
            <select
              value={teamBId}
              onChange={(e) => setTeamBId(e.target.value)}
              className="w-full bg-background border border-border/60 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 text-sm font-semibold text-foreground cursor-pointer shadow-xs"
            >
              {sortedTeams.map(t => (
                <option key={t.id} value={t.id} disabled={t.id === teamAId} className="bg-slate-900 text-slate-100 py-1.5 font-medium disabled:opacity-40">
                  {t.display_name ?? t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground animate-pulse font-semibold">
          Cargando datos comparativos...
        </div>
      ) : !teamA || !teamB || !stats ? (
        <div className="text-center py-12 text-muted-foreground">
          Seleccioná dos equipos para comparar su rendimiento.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Card Principal VS */}
          <div className="bg-gradient-to-b from-card/80 via-card/40 to-card/20 border border-border/60 rounded-3xl p-6 sm:p-8 shadow-xl text-center backdrop-blur-md relative overflow-hidden">
            <div className="grid grid-cols-3 items-center">
              {/* Equipo A */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-background border-2 border-primary/30 shadow-md flex items-center justify-center p-2.5">
                  {teamA.logo_url ? (
                    <img src={teamA.logo_url} alt={teamA.name} className="w-full h-full object-contain" />
                  ) : (
                    <Shield className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-foreground truncate max-w-[130px]" title={teamA.name}>
                  {teamA.display_name ?? teamA.name}
                </h3>
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl font-black text-primary">{stats.winsA}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Victorias</span>
                </div>
              </div>

              {/* VS Badge */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-black text-lg shadow-lg flex items-center justify-center tracking-wider">
                  VS
                </div>
                <span className="text-xs sm:text-sm font-bold text-muted-foreground">
                  {stats.matchesPlayed} partidos disputados
                </span>
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground font-extrabold text-xs">
                  {stats.draws} {stats.draws === 1 ? 'empate' : 'empates'}
                </span>
              </div>

              {/* Equipo B */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-background border-2 border-primary/30 shadow-md flex items-center justify-center p-2.5">
                  {teamB.logo_url ? (
                    <img src={teamB.logo_url} alt={teamB.name} className="w-full h-full object-contain" />
                  ) : (
                    <Shield className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-foreground truncate max-w-[130px]" title={teamB.name}>
                  {teamB.display_name ?? teamB.name}
                </h3>
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl font-black text-primary">{stats.winsB}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Victorias</span>
                </div>
              </div>
            </div>

            {/* Barra de Porcentaje */}
            {totalWins > 0 && (
              <div className="mt-6 space-y-1.5 max-w-lg mx-auto">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-primary">{teamA.display_name ?? teamA.name} ({pctA}%)</span>
                  <span className="text-primary">{teamB.display_name ?? teamB.name} ({pctB}%)</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
                  <div className="bg-primary h-full transition-all duration-500" style={{ width: `${pctA}%` }} />
                  <div className="bg-primary/40 h-full transition-all duration-500" style={{ width: `${pctB}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Comparativa de Tabla Actual */}
          <div className="bg-card/70 border border-border/60 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Estadísticas en la Tabla Actual
            </h3>

            <div className="grid grid-cols-3 gap-2 items-center text-center text-xs sm:text-sm font-semibold divide-y sm:divide-y-0 divide-border/40">
              {/* Equipo A */}
              <div className="space-y-3 py-2 sm:py-0">
                <p className="font-black text-base text-primary">{stats.standingA?.points ?? '—'}</p>
                <p className="font-bold text-foreground">
                  {stats.standingA ? (stats.standingA.goalDifference > 0 ? `+${stats.standingA.goalDifference}` : stats.standingA.goalDifference) : '—'}
                </p>
                <p className="text-muted-foreground">{stats.standingA?.goalsFor ?? '—'}</p>
                <p className="text-muted-foreground">{stats.standingA?.goalsAgainst ?? '—'}</p>
              </div>

              {/* Etiquetas Centrales */}
              <div className="space-y-3 py-2 sm:py-0 text-muted-foreground font-bold">
                <p className="uppercase tracking-wider text-[11px]">Puntos en Tabla</p>
                <p className="uppercase tracking-wider text-[11px]">Diferencia de Gol</p>
                <p className="uppercase tracking-wider text-[11px]">Goles a Favor</p>
                <p className="uppercase tracking-wider text-[11px]">Goles en Contra</p>
              </div>

              {/* Equipo B */}
              <div className="space-y-3 py-2 sm:py-0">
                <p className="font-black text-base text-primary">{stats.standingB?.points ?? '—'}</p>
                <p className="font-bold text-foreground">
                  {stats.standingB ? (stats.standingB.goalDifference > 0 ? `+${stats.standingB.goalDifference}` : stats.standingB.goalDifference) : '—'}
                </p>
                <p className="text-muted-foreground">{stats.standingB?.goalsFor ?? '—'}</p>
                <p className="text-muted-foreground">{stats.standingB?.goalsAgainst ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Historial de Partidos */}
          <div className="bg-card/70 border border-border/60 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Historial de Partidos entre sí
            </h3>

            {stats.h2hMatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border/60 rounded-2xl">
                Aún no registran partidos finalizados entre sí en esta categoría.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.h2hMatches.map(m => {
                  const isAHome = m.home_team_id === teamA.id;
                  const homeName = isAHome ? (teamA.display_name ?? teamA.name) : (teamB.display_name ?? teamB.name);
                  const awayName = isAHome ? (teamB.display_name ?? teamB.name) : (teamA.display_name ?? teamA.name);

                  return (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-muted/30 border border-border/40 rounded-2xl text-xs sm:text-sm">
                      <span className="text-muted-foreground font-semibold">Fecha {m.round_number}</span>
                      <div className="flex items-center gap-3 font-extrabold">
                        <span>{homeName}</span>
                        <span className="px-3 py-1 rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-xs">
                          {m.home_goals} - {m.away_goals}
                        </span>
                        <span>{awayName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
