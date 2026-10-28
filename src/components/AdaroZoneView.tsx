import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Sparkles, 
  Layers, 
  Info,
  Shield,
  Medal,
  Activity
} from 'lucide-react';
import type { Team, Match, Division, Zone } from '../lib/types';
import { 
  calculateAdaroZoneStandings, 
  groupZoneMatchesIntoTiras, 
  CUP_BADGES,
  getDivisionOrder,
  DIVISION_NAMES_MAP
} from '../lib/adaroStandings';
import { 
  ADARO_PUNTUABLE_DIVISION_IDS, 
  ADARO_ALL_DIVISION_IDS,
  ADARO_ZONES,
  getAdaroZoneClubs,
  isAdaroPuntuableDivision,
  isAdaroParticipativeDivision,
  resolveAdaroPuntuableDivisionIds,
  resolveAdaroZoneIds
} from '../lib/mockAdaroData';
import { isExcludedDivision } from '../lib/db';
import { getCategoryYear } from '../lib/auth';

interface AdaroZoneViewProps {
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
  matches: Match[];
  teams: Team[];
  divisions: Division[];
  zones?: Zone[];
  initialMode?: 'general' | 'division';
  initialDivisionSlug?: string;
  onSaveMatchResult?: (matchId: string, home: number | null, away: number | null, status: 'scheduled' | 'finished') => Promise<void>;
  isAdmin?: boolean;
}

export const AdaroZoneView: React.FC<AdaroZoneViewProps> = ({
  selectedZoneId,
  onSelectZone,
  matches,
  teams,
  divisions,
  zones = [],
  initialMode = 'general',
  initialDivisionSlug,
}) => {
  // Modo de visualización: 'general' (Tira completa para 4 copas) o 'division' (por categoría)
  const [viewMode, setViewMode] = useState<'general' | 'division'>(initialMode);
  // Fecha seleccionada para el fixture de tiras (1 a 6)
  const [selectedRound, setSelectedRound] = useState<number>(1);
  // Acordeones abiertos de tiras (pairKey)
  const [expandedTiras, setExpandedTiras] = useState<Record<string, boolean>>({
    'tira-0': true, // primer acordeón abierto por defecto
  });
  // Desglose de puntos por categoría en la tabla acumulada
  const [expandedClubBreakdown, setExpandedClubBreakdown] = useState<string | null>(null);

  // División seleccionada para la sección inferior (Tablas por División)
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');

  // Filtrar zonas Adaro
  const adaroZones = useMemo(() => {
    return ADARO_ZONES;
  }, []);

  // Mapeo de IDs de zona canónicos (adaro-zone-X) a UUIDs de Supabase
  const zoneIdMap = useMemo(() => resolveAdaroZoneIds(zones), [zones]);
  const resolvedZoneUuid = useMemo(() => zoneIdMap[selectedZoneId] || selectedZoneId, [zoneIdMap, selectedZoneId]);

  // Identificar el objeto de zona y letra correspondiente
  const currentZone = useMemo(() => {
    return (
      zones.find(z => z.id === selectedZoneId || z.id === resolvedZoneUuid) ||
      adaroZones.find(z => z.id === selectedZoneId) ||
      adaroZones[0]
    );
  }, [zones, selectedZoneId, resolvedZoneUuid, adaroZones]);

  const currentZoneLetter = useMemo(() => {
    const norm = currentZone.name.toLowerCase().trim();
    const match = norm.match(/zona\s*([a-g])/i);
    if (match) return match[1].toLowerCase();
    const slugMatch = selectedZoneId.match(/adaro-zone-([a-g])/i);
    return slugMatch ? slugMatch[1].toLowerCase() : 'a';
  }, [currentZone, selectedZoneId]);

  // Divisiones garantizadas sin Primera, Quinta ni Sexta
  const safeDivisions = useMemo(() => {
    return divisions.filter(d => !isExcludedDivision(d.name));
  }, [divisions]);

  // Divisiones puntuables ordenadas estrictamente de 7ma a 14ta
  const puntuableDivisions = useMemo(() => {
    return safeDivisions
      .filter(d => isAdaroPuntuableDivision(d))
      .sort((a, b) => getDivisionOrder(a.name) - getDivisionOrder(b.name));
  }, [safeDivisions]);

  // Divisiones participativas/formativas ordenadas estrictamente de 15ta a 17ma
  const participativeDivisions = useMemo(() => {
    return safeDivisions
      .filter(d => isAdaroParticipativeDivision(d))
      .sort((a, b) => getDivisionOrder(a.name) - getDivisionOrder(b.name));
  }, [safeDivisions]);

  // Sincronizar división seleccionada inicial si viene de prop initialDivisionSlug
  useEffect(() => {
    if (initialDivisionSlug && safeDivisions.length > 0) {
      const normSlug = initialDivisionSlug.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const found = safeDivisions.find(d => {
        const normName = d.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normName.includes(normSlug) || normSlug.includes(normName);
      });
      if (found) {
        setSelectedDivisionId(found.id);
        setViewMode('division');
        return;
      }
    }
    if (puntuableDivisions.length > 0 && (!selectedDivisionId || !safeDivisions.some(d => d.id === selectedDivisionId))) {
      setSelectedDivisionId(puntuableDivisions[0].id);
    }
  }, [initialDivisionSlug, safeDivisions, puntuableDivisions, selectedDivisionId]);

  // Todas las divisiones juveniles válidas (puntuables + formativas)
  const allDivisionsSorted = useMemo(() => {
    return [...puntuableDivisions, ...participativeDivisions];
  }, [puntuableDivisions, participativeDivisions]);

  // Partidos de la zona actual (acepta tanto slug canónico como UUID de Supabase)
  const currentZoneMatches = useMemo(() => {
    return matches.filter(m => {
      if (m.zone_id === selectedZoneId || m.zone_id === resolvedZoneUuid) return true;
      if (m.zone_id === `adaro-zone-${currentZoneLetter}`) return true;
      const mZone = zones.find(z => z.id === m.zone_id);
      if (mZone) {
        const mNorm = mZone.name.toLowerCase().trim();
        if (mNorm === `zona ${currentZoneLetter}`) return true;
      }
      return false;
    });
  }, [matches, selectedZoneId, resolvedZoneUuid, currentZoneLetter, zones]);

  // Equipos participantes en esta zona (garantiza los 4 clubes con logo y nombre)
  const zoneTeams = useMemo(() => {
    return getAdaroZoneClubs(selectedZoneId, teams);
  }, [selectedZoneId, teams]);

  // 1. Tabla Oficial Acumulada de la Zona (Suma de 7ª a 14ª División)
  const generalStandings = useMemo(() => {
    const puntuableIds = resolveAdaroPuntuableDivisionIds(safeDivisions);
    const allPuntuableIds = Array.from(new Set([...puntuableIds, ...ADARO_PUNTUABLE_DIVISION_IDS]));
    return calculateAdaroZoneStandings(
      currentZoneMatches,
      zoneTeams,
      allPuntuableIds,
      safeDivisions
    );
  }, [currentZoneMatches, zoneTeams, safeDivisions]);

  // 2. Partidos de la fecha seleccionada agrupados en Tiras
  const roundMatches = useMemo(() => {
    return currentZoneMatches.filter(m => m.round_number === selectedRound);
  }, [currentZoneMatches, selectedRound]);

  const tiras = useMemo(() => {
    return groupZoneMatchesIntoTiras(roundMatches, teams, safeDivisions);
  }, [roundMatches, teams, safeDivisions]);

  const activeDivisionObj = useMemo(() => {
    return allDivisionsSorted.find(d => d.id === selectedDivisionId) || puntuableDivisions[0];
  }, [allDivisionsSorted, selectedDivisionId, puntuableDivisions]);

  // Helper para verificar si un partido pertenece a la división seleccionada
  const isMatchInSelectedDivision = useCallback((matchDivisionId: string, targetDivision: Division | undefined) => {
    if (!targetDivision) return false;
    if (matchDivisionId === targetDivision.id) return true;

    const targetOrder = getDivisionOrder(targetDivision.name);

    // Buscar si matchDivisionId es de divisions
    const matchDivObj = safeDivisions.find(d => d.id === matchDivisionId);
    if (matchDivObj) {
      const matchOrder = getDivisionOrder(matchDivObj.name);
      if (matchOrder !== 99 && matchOrder === targetOrder) return true;
    }

    // Buscar si matchDivisionId es un mock ID (índice 0 a 10 de 7ma a 17ma)
    const mockIdx = ADARO_ALL_DIVISION_IDS.indexOf(matchDivisionId);
    if (mockIdx !== -1) {
      const mockOrder = 7 + mockIdx; // 7ma es 7, 8va es 8, ..., 17ma es 17
      if (mockOrder === targetOrder) return true;
    }

    return false;
  }, [safeDivisions]);

  // IDs correspondientes a la división activa (tanto Supabase UUID como mock ID)
  const matchingDivisionIds = useMemo(() => {
    if (!activeDivisionObj) return [];
    const ids = new Set<string>();
    ids.add(activeDivisionObj.id);
    currentZoneMatches.forEach(m => {
      if (isMatchInSelectedDivision(m.division_id, activeDivisionObj)) {
        ids.add(m.division_id);
      }
    });
    return Array.from(ids);
  }, [activeDivisionObj, currentZoneMatches, isMatchInSelectedDivision]);

  // 3. Tabla específica de la división seleccionada en la sección inferior
  const divisionStandings = useMemo(() => {
    if (matchingDivisionIds.length === 0) return [];
    return calculateAdaroZoneStandings(
      currentZoneMatches,
      zoneTeams,
      matchingDivisionIds
    );
  }, [currentZoneMatches, zoneTeams, matchingDivisionIds]);

  // 4. Partidos específicos de la división seleccionada en esta zona
  const divisionMatches = useMemo(() => {
    if (!activeDivisionObj) return [];
    return currentZoneMatches
      .filter(m => isMatchInSelectedDivision(m.division_id, activeDivisionObj))
      .sort((a, b) => (a.round_number ?? 0) - (b.round_number ?? 0));
  }, [currentZoneMatches, activeDivisionObj, isMatchInSelectedDivision]);

  const toggleTira = (key: string) => {
    setExpandedTiras(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isActiveDivPuntuable = activeDivisionObj 
    ? isAdaroPuntuableDivision(activeDivisionObj)
    : false;
  const activeDivYear = activeDivisionObj ? getCategoryYear(activeDivisionObj.name, 2026) : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── 1. Selector Horizontal de Zonas (A a G) ─────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Fase Zonal Oficial (7 Zonas)
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            4 clubes por zona · 6 fechas ida y vuelta
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {adaroZones.map((zone) => {
            const isSelected = zone.id === selectedZoneId;
            return (
              <button
                key={zone.id}
                onClick={() => onSelectZone(zone.id)}
                className={`flex-shrink-0 snap-start px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold tracking-tight transition-all active:scale-95 flex items-center space-x-2 border ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-[0_4px_16px_rgba(16,185,129,0.3)] ring-2 ring-primary/20'
                    : 'bg-card/70 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60 shadow-sm'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                <span>{zone.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Selector de Modo de Visualización (Tiras / Por División) ─────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 p-2 sm:p-2.5 rounded-2xl border border-border/70 backdrop-blur-md">
        <div className="flex bg-muted/70 p-1 rounded-xl border border-border/50 max-w-md w-full sm:w-auto">
          <button
            onClick={() => setViewMode('general')}
            className={`flex-1 sm:flex-none py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              viewMode === 'general'
                ? 'bg-card text-foreground shadow-xs font-display font-black text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Tiras de Clubes (4 Copas)</span>
          </button>
          <button
            onClick={() => setViewMode('division')}
            className={`flex-1 sm:flex-none py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              viewMode === 'division'
                ? 'bg-primary text-primary-foreground shadow-xs font-display font-black'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Ver por División (7ª a 17ª)</span>
          </button>
        </div>

        <div className="text-xs text-muted-foreground font-medium px-2">
          {viewMode === 'general' ? (
            <span>Sumatoria de 7ª a 14ª para clasificar a Copas</span>
          ) : (
            <span>Resultados y posiciones de {activeDivisionObj?.name || 'la categoría'}</span>
          )}
        </div>
      </div>

      {/* ─── 2. Tabla Oficial Acumulada de la Zona (7ª a 14ª) y Fixture de Tiras ─── */}
      {viewMode === 'general' && (
        <>
          <div className="bg-card/75 border border-border/80 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/50">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Sumatoria General Oficial
                  </span>
                </div>
            <h3 className="text-lg sm:text-xl font-display font-black tracking-tight text-foreground flex items-center gap-2 mt-0.5">
              <Trophy className="w-5 h-5 text-amber-500" />
              Tabla de Posiciones · {currentZone.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              Suma de las 8 divisiones puntuables (7ª a 14ª). Clasifica a las Copas por <strong>Promedio Oficial (Pts / PJ)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-bold text-muted-foreground bg-muted/80 px-3 py-1.5 rounded-full border border-border/60">
              8 categorías puntuables
            </span>
          </div>
        </div>

        {/* Tabla Acumulada con Badges de Copas */}
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/60 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-foreground/80 dark:text-muted-foreground text-[11px] uppercase tracking-wider font-extrabold">
                  <th className="py-3.5 px-3 sm:px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-3 sm:px-4">Club</th>
                  <th className="py-3.5 px-2.5 text-center font-bold">PJ</th>
                  <th className="py-3.5 px-2.5 text-center font-bold">PG</th>
                  <th className="py-3.5 px-2.5 text-center font-bold">PE</th>
                  <th className="py-3.5 px-2.5 text-center font-bold">PP</th>
                  <th className="py-3.5 px-2.5 text-center hidden sm:table-cell font-bold">GF</th>
                  <th className="py-3.5 px-2.5 text-center hidden sm:table-cell font-bold">GC</th>
                  <th className="py-3.5 px-2.5 text-center font-bold">DG</th>
                  <th className="py-3.5 px-3 sm:px-4 text-center font-black text-primary">PTS</th>
                  <th className="py-3.5 px-3 sm:px-4 text-center font-black text-amber-600 dark:text-amber-400 bg-amber-500/10">PROM</th>
                  <th className="py-3.5 px-3 sm:px-4 text-center hidden md:table-cell">Clasificación a Copas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {generalStandings.map((row) => {
                  const badge = CUP_BADGES[row.cupTier];
                  const isBreakdownOpen = expandedClubBreakdown === row.team.id;

                  return (
                    <React.Fragment key={row.team.id}>
                      <tr 
                        className={`transition-colors hover:bg-muted/30 ${
                          row.rank === 1 ? 'bg-cyan-500/[0.04]' : ''
                        }`}
                      >
                        {/* Puesto */}
                        <td className="py-3.5 px-3 sm:px-4 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black font-display shadow-2xs ${
                            row.rank === 1 
                              ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40'
                              : row.rank === 2
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                              : row.rank === 3
                              ? 'bg-slate-400/25 text-slate-700 dark:text-slate-300 border border-slate-400/40'
                              : 'bg-orange-600/20 text-orange-800 dark:text-orange-400 border border-orange-600/40'
                          }`}>
                            {row.rank}
                          </span>
                        </td>

                        {/* Club */}
                        <td className="py-3.5 px-3 sm:px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-card border border-border/70 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
                              {row.team.logo_url ? (
                                <img 
                                  src={row.team.logo_url} 
                                  alt={row.team.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-muted-foreground font-display">
                                  {row.team.name.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-extrabold text-foreground block truncate text-xs sm:text-sm">
                                {row.team.display_name || row.team.name}
                              </span>
                              <button
                                onClick={() => setExpandedClubBreakdown(isBreakdownOpen ? null : row.team.id)}
                                className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1 font-semibold transition-colors mt-0.5"
                              >
                                <span>{isBreakdownOpen ? 'Ocultar categorías' : 'Ver desglose 7ª a 14ª'}</span>
                                {isBreakdownOpen ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-2.5 text-center text-muted-foreground font-semibold">{row.played}</td>
                        <td className="py-3.5 px-2.5 text-center text-muted-foreground">{row.won}</td>
                        <td className="py-3.5 px-2.5 text-center text-muted-foreground">{row.drawn}</td>
                        <td className="py-3.5 px-2.5 text-center text-muted-foreground">{row.lost}</td>
                        <td className="py-3.5 px-2.5 text-center text-muted-foreground hidden sm:table-cell">{row.goalsFor}</td>
                        <td className="py-3.5 px-2.5 text-center text-muted-foreground hidden sm:table-cell">{row.goalsAgainst}</td>
                        <td className="py-3.5 px-2.5 text-center font-bold">
                          <span className={row.goalDifference > 0 ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : row.goalDifference < 0 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-muted-foreground'}>
                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 sm:px-4 text-center font-display font-black text-sm sm:text-base text-primary">
                          {row.points}
                        </td>
                        <td className="py-3.5 px-3 sm:px-4 text-center font-display font-black text-sm sm:text-base text-amber-600 dark:text-amber-400 bg-amber-500/5">
                          {row.average.toFixed(2).replace('.', ',')}
                        </td>

                        {/* Badge de Copa */}
                        <td className="py-3.5 px-3 sm:px-4 text-center hidden md:table-cell">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${badge.bgClass} ${badge.textClass} ${badge.borderClass} shadow-2xs`}>
                            <span>{badge.emoji}</span>
                            <span>{badge.label}</span>
                          </span>
                        </td>
                      </tr>

                      {/* Desglose por categoría si está abierto */}
                      {isBreakdownOpen && (
                        <tr className="bg-muted/20 border-b border-border/40">
                          <td colSpan={12} className="p-3 sm:p-5">
                            <div className="bg-card/90 rounded-2xl p-4 border border-border/60 space-y-2.5 shadow-inner">
                              <div className="flex items-center justify-between">
                                <p className="text-[11px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Activity className="w-3.5 h-3.5 text-primary" />
                                  Puntos sumados por {row.team.display_name || row.team.name} en cada categoría:
                                </p>
                                <span className="text-[10px] text-muted-foreground">7ª a 14ª División</span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                                {puntuableDivisions.map(div => {
                                  const stats = row.divisionBreakdown[div.id] || { won: 0, drawn: 0, lost: 0, points: 0 };
                                  const divOrder = getDivisionOrder(div.name);
                                  const divName = DIVISION_NAMES_MAP[divOrder] || div.name.replace(' División', '');
                                  const divYear = getCategoryYear(div.name, 2026);
                                  return (
                                    <div key={div.id} className="p-2.5 rounded-xl bg-background border border-border/50 text-center shadow-2xs">
                                      <span className="text-[10px] font-bold text-muted-foreground block truncate">
                                        {divOrder <= 17 ? `${divOrder}ª ` : ''}{divName} {divYear ? `(${divYear})` : ''}
                                      </span>
                                      <span className="text-xs font-display font-black text-foreground block my-0.5">
                                        {stats.points} pts
                                      </span>
                                      <span className="text-[9px] text-muted-foreground font-medium">
                                        {stats.won}G {stats.drawn}E {stats.lost}P
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leyenda de Clasificación a las 4 Copas */}
        <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs text-muted-foreground border-t border-border/40">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold text-cyan-600 dark:text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-xs" />
              1º Platino
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
              2º Oro
            </span>
            <span className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-xs" />
              3º Plata
            </span>
            <span className="flex items-center gap-1.5 font-bold text-orange-700 dark:text-orange-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600 shadow-xs" />
              4º Bronce
            </span>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground/80">
            Reglamento Oficial LMF 2026
          </span>
        </div>
      </div>

      {/* ─── 3. Fixture y Tiras de la Zona ────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-display font-black tracking-tight text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Fixture y Tiras de la {currentZone.name}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Enfrentamientos tira por tira con sumatoria del día y detalle de 7ª a 14ª
            </p>
          </div>

          {/* Selector de Fecha (1 a 6) */}
          <div className="flex items-center gap-1 p-1 bg-card border border-border/70 rounded-2xl self-start sm:self-auto shadow-2xs">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => setSelectedRound(num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  selectedRound === num
                    ? 'bg-primary text-primary-foreground shadow-xs font-display font-black'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Fecha {num}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Tiras de la Fecha */}
        {tiras.length === 0 ? (
          <div className="p-8 text-center bg-card/40 border border-border/60 rounded-3xl">
            <Info className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-semibold text-muted-foreground">
              No hay partidos programados para esta fecha en la {currentZone.name}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tiras.map((tira, idx) => {
              const pairKey = `tira-${idx}`;
              const isExpanded = !!expandedTiras[pairKey];

              return (
                <div
                  key={pairKey}
                  className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl overflow-hidden shadow-xs transition-all hover:border-border"
                >
                  {/* Encabezado de la Tira */}
                  <div
                    onClick={() => toggleTira(pairKey)}
                    className="p-4 sm:p-5 cursor-pointer hover:bg-muted/40 transition-colors flex items-center justify-between gap-4 select-none"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                      {/* Local */}
                      <div className="flex items-center space-x-2.5 flex-1 justify-end text-right min-w-0">
                        <span className="font-extrabold text-sm sm:text-base text-foreground truncate">
                          {tira.homeTeam.display_name || tira.homeTeam.name}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-card border border-border/70 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
                          {tira.homeTeam.logo_url ? (
                            <img src={tira.homeTeam.logo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-muted-foreground font-display">
                              {tira.homeTeam.name.slice(0, 2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Marcador Acumulado de la Tira estilo Estadio */}
                      <div className="px-3.5 py-1.5 rounded-2xl bg-muted/80 dark:bg-slate-900 border border-border/70 flex items-center space-x-2 shadow-inner flex-shrink-0">
                        <span className="text-sm sm:text-base font-display font-black text-primary">
                          {tira.homeTiraPoints}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">pts</span>
                        <span className="text-xs font-semibold text-muted-foreground">-</span>
                        <span className="text-sm sm:text-base font-display font-black text-primary">
                          {tira.awayTiraPoints}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">pts</span>
                      </div>

                      {/* Visitante */}
                      <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-card border border-border/70 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
                          {tira.awayTeam.logo_url ? (
                            <img src={tira.awayTeam.logo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-muted-foreground font-display">
                              {tira.awayTeam.name.slice(0, 2)}
                            </span>
                          )}
                        </div>
                        <span className="font-extrabold text-sm sm:text-base text-foreground truncate">
                          {tira.awayTeam.display_name || tira.awayTeam.name}
                        </span>
                      </div>
                    </div>

                    {/* Botón Acordeón */}
                    <div className="flex items-center pl-2 text-muted-foreground">
                      <span className="text-xs font-bold hidden md:inline mr-2 text-foreground/80">
                        {isExpanded ? `Ocultar ${tira.matches.length} categorías` : `Ver ${tira.matches.length} categorías`}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Desglose Tabulado de los Partidos de la Tira */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-border/50 bg-background/50 px-3 sm:px-6 py-2 overflow-x-auto scrollbar-none"
                      >
                        <div className="min-w-[620px] sm:min-w-0 divide-y divide-border/30">
                          {tira.matches.map(({ divisionName, match }) => {
                            const isFinished = match.status === 'finished';
                            const divOrder = getDivisionOrder(divisionName);
                            const divYear = getCategoryYear(divisionName, 2026);
                            const divDisplayName = DIVISION_NAMES_MAP[divOrder] || divisionName.replace(' División', '');

                            return (
                              <div
                                key={match.id}
                                className="py-2.5 grid grid-cols-[auto_1fr_auto] items-center text-xs sm:text-sm hover:bg-muted/30 rounded-xl px-2.5 transition-colors gap-3"
                              >
                                {/* Indicador de División y Categoría (Tabulado con columnas fijas) */}
                                <div className="flex items-center gap-2 w-[220px] sm:w-[250px] shrink-0">
                                  <span className="inline-flex items-center justify-center w-8 h-6 rounded-lg bg-primary/10 text-primary border border-primary/20 font-display font-black text-[11px] sm:text-xs shrink-0 whitespace-nowrap shadow-2xs">
                                    {divOrder <= 17 ? `${divOrder}ª` : ''}
                                  </span>
                                  <span className="font-extrabold text-foreground text-xs sm:text-sm tracking-tight w-24 sm:w-28 truncate">
                                    {divDisplayName}
                                  </span>
                                  {divYear && (
                                    <span className="inline-flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full border border-border/60 whitespace-nowrap shrink-0 shadow-2xs">
                                      Cat. {divYear}
                                    </span>
                                  )}
                                </div>

                                {/* Partido Tabulado (Local a la derecha, Caja de goles en centro exacto, Visitante a la izquierda) */}
                                <div className="flex items-center justify-center gap-2 sm:gap-3 min-w-0 px-2">
                                  <span className="text-right truncate font-bold text-xs sm:text-sm flex-1 text-foreground">
                                    {match.home_team_id === tira.homeTeam.id
                                      ? (tira.homeTeam.display_name || tira.homeTeam.name)
                                      : (tira.awayTeam.display_name || tira.awayTeam.name)}
                                  </span>

                                  <div className="w-14 sm:w-16 py-1 rounded-xl bg-card border border-border/70 font-display font-black text-xs sm:text-sm text-center shrink-0 shadow-xs">
                                    {isFinished ? (
                                      <span>{match.home_goals} - {match.away_goals}</span>
                                    ) : (
                                      <span className="text-muted-foreground text-[11px] font-semibold">vs</span>
                                    )}
                                  </div>

                                  <span className="text-left truncate font-bold text-xs sm:text-sm flex-1 text-foreground">
                                    {match.away_team_id === tira.awayTeam.id
                                      ? (tira.awayTeam.display_name || tira.awayTeam.name)
                                      : (tira.homeTeam.display_name || tira.homeTeam.name)}
                                  </span>
                                </div>

                                {/* Estado Final / Pendiente */}
                                <div className="w-16 sm:w-20 text-right shrink-0">
                                  {isFinished ? (
                                    <span className="inline-flex items-center justify-center text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-500/25 whitespace-nowrap">
                                      Final
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center justify-center text-[10px] font-semibold text-muted-foreground bg-muted px-2 sm:px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                      Pendiente
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </>
      )}

      {/* ─── 4. SECCIÓN: Tablas de Posiciones y Fixture por División (Puntuables y Participativas) ─── */}
      <section className="bg-card/75 border border-border/80 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
          <div>
            <div className="flex items-center space-x-2">
              <Medal className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {viewMode === 'division' ? 'Vista Exclusiva por División' : 'Desglose Particular por Categoría'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-display font-black tracking-tight text-foreground mt-0.5">
              Posiciones y Fixture por División · {currentZone.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              Explorá la tabla de posiciones y resultados oficiales de cada división individual (puntuables y formativas) de la {currentZone.name}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              isActiveDivPuntuable 
                ? 'bg-primary/10 text-primary border-primary/30' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
            }`}>
              {isActiveDivPuntuable ? '🌟 División Puntuable (Suma para Copas)' : '⚽️ Categoría Formativa'}
            </span>
          </div>
        </div>

        {/* Selector de Divisiones (Pills agrupados con jerarquía deportiva) */}
        <div className="space-y-3">
          {/* Grupo 1: Divisiones Puntuables (7ma a 14ta) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-primary" />
              Divisiones Puntuables (7ª a 14ª · Suman para las 4 Copas):
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
              {puntuableDivisions.map((div) => {
                const isSelected = selectedDivisionId === div.id;
                const divOrder = getDivisionOrder(div.name);
                const shortName = DIVISION_NAMES_MAP[divOrder] || div.name.replace(' División', '');
                const year = getCategoryYear(div.name, 2026);

                return (
                  <button
                    key={div.id}
                    onClick={() => setSelectedDivisionId(div.id)}
                    className={`flex-shrink-0 snap-start px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border whitespace-nowrap ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs font-display font-black ring-2 ring-primary/20'
                        : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                    }`}
                  >
                    <span>{divOrder <= 17 ? `${divOrder}ª ` : ''}{shortName}</span>
                    {year && (
                      <span className={`ml-1 text-[10px] ${isSelected ? 'text-primary-foreground/80' : 'opacity-70'}`}>
                        ({year})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grupo 2: Divisiones Participativas / Formativas (15ta a 17ma formativas) */}
          {participativeDivisions.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Categorías Formativas / Pre-Décimas (2018, 2019, 2020 · No suman a la general):
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
                {participativeDivisions.map((div) => {
                  const isSelected = selectedDivisionId === div.id;
                  const divOrder = getDivisionOrder(div.name);
                  const shortName = DIVISION_NAMES_MAP[divOrder] || div.name.replace(' División', '');
                  const year = getCategoryYear(div.name, 2026);

                  return (
                    <button
                      key={div.id}
                      onClick={() => setSelectedDivisionId(div.id)}
                      className={`flex-shrink-0 snap-start px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border whitespace-nowrap ${
                        isSelected
                          ? 'bg-amber-500 text-amber-950 border-amber-500 shadow-xs font-display font-black ring-2 ring-amber-500/20'
                          : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                      }`}
                    >
                      <span>{divOrder <= 17 ? `${divOrder}ª ` : ''}{shortName}</span>
                      {year && (
                        <span className={`ml-1 text-[10px] ${isSelected ? 'text-amber-950/80' : 'opacity-70'}`}>
                          ({year})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Tabla de Posiciones de la División Seleccionada */}
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/60 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-foreground/80 dark:text-muted-foreground text-[11px] uppercase tracking-wider font-extrabold">
                  <th className="py-3 px-3 sm:px-4 w-12 text-center">#</th>
                  <th className="py-3 px-3 sm:px-4">
                    Club ({activeDivisionObj.name} {activeDivYear ? `· Cat. ${activeDivYear}` : ''})
                  </th>
                  <th className="py-3 px-2.5 text-center font-bold">PJ</th>
                  <th className="py-3 px-2.5 text-center font-bold">PG</th>
                  <th className="py-3 px-2.5 text-center font-bold">PE</th>
                  <th className="py-3 px-2.5 text-center font-bold">PP</th>
                  <th className="py-3 px-2.5 text-center hidden sm:table-cell font-bold">GF</th>
                  <th className="py-3 px-2.5 text-center hidden sm:table-cell font-bold">GC</th>
                  <th className="py-3 px-2.5 text-center font-bold">DG</th>
                  <th className="py-3 px-3 sm:px-4 text-center font-black text-primary">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {divisionStandings.map((row) => (
                  <tr key={row.team.id} className="transition-colors hover:bg-muted/30">
                    <td className="py-3 px-3 sm:px-4 text-center font-display font-black text-xs text-muted-foreground">
                      {row.rank}
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-card border border-border/70 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
                          {row.team.logo_url ? (
                            <img src={row.team.logo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-muted-foreground font-display">
                              {row.team.name.slice(0, 2)}
                            </span>
                          )}
                        </div>
                        <span className="font-extrabold text-foreground truncate">
                          {row.team.display_name || row.team.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2.5 text-center text-muted-foreground font-semibold">{row.played}</td>
                    <td className="py-3 px-2.5 text-center text-muted-foreground">{row.won}</td>
                    <td className="py-3 px-2.5 text-center text-muted-foreground">{row.drawn}</td>
                    <td className="py-3 px-2.5 text-center text-muted-foreground">{row.lost}</td>
                    <td className="py-3 px-2.5 text-center text-muted-foreground hidden sm:table-cell">{row.goalsFor}</td>
                    <td className="py-3 px-2.5 text-center text-muted-foreground hidden sm:table-cell">{row.goalsAgainst}</td>
                    <td className="py-3 px-2.5 text-center font-bold">
                      <span className={row.goalDifference > 0 ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : row.goalDifference < 0 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-muted-foreground'}>
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center font-display font-black text-sm sm:text-base text-primary">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Partidos de la División Seleccionada en la Zona */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Partidos de {activeDivisionObj.name} en {currentZone.name}:
          </h4>

          {divisionMatches.length === 0 ? (
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-center text-xs text-muted-foreground">
              Aún no hay partidos programados o cargados para {activeDivisionObj.name} en esta zona.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {divisionMatches.map((match) => {
                const home = zoneTeams.find(t => t.id === match.home_team_id);
                const away = zoneTeams.find(t => t.id === match.away_team_id);
                const isFinished = match.status === 'finished';

                return (
                  <div
                    key={match.id}
                    className="p-3 rounded-2xl bg-background/80 border border-border/60 flex items-center justify-between gap-3 shadow-2xs hover:border-border transition-all"
                  >
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-muted-foreground shrink-0">
                      <span className="px-1.5 py-0.5 rounded-md bg-muted border border-border/50">
                        F{match.round_number}
                      </span>
                    </div>

                    <div className="flex items-center justify-between flex-1 gap-2 min-w-0">
                      <span className="font-bold text-xs text-right truncate flex-1 text-foreground">
                        {home?.display_name || home?.name || 'Local'}
                      </span>

                      <div className="px-2.5 py-0.5 rounded-lg bg-card border border-border/70 font-display font-black text-xs min-w-[50px] text-center shadow-2xs shrink-0">
                        {isFinished ? (
                          <span>{match.home_goals} - {match.away_goals}</span>
                        ) : (
                          <span className="text-muted-foreground text-[10px] font-semibold">vs</span>
                        )}
                      </div>

                      <span className="font-bold text-xs text-left truncate flex-1 text-foreground">
                        {away?.display_name || away?.name || 'Visitante'}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {isFinished ? (
                        <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                          Final
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                          Prog.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
