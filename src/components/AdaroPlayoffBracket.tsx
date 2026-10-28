import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Swords, 
  Crown, 
  Info, 
  SlidersHorizontal,
  Layers,
  Sparkles
} from 'lucide-react';
import type { Team, Match } from '../lib/types';
import { calculateAdaroZoneStandings, CUP_BADGES, type AdaroCupTier } from '../lib/adaroStandings';
import { ADARO_ZONES, ADARO_PUNTUABLE_DIVISION_IDS } from '../lib/mockAdaroData';

interface AdaroPlayoffBracketProps {
  matches: Match[];
  teams: Team[];
}

interface PlayoffMatch {
  id: string;
  stage: 'cuartos' | 'semifinal' | 'final';
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeSeed?: number;
  awaySeed?: number;
  homeScore?: number;
  awayScore?: number;
  homePenalties?: number;
  awayPenalties?: number;
  winnerTeamId?: string;
  isBye?: boolean;
  divisionLabel?: string;
}

export type SeedingCriteria = 'grupos_adaro' | 'promedio_anual';

export interface DivisionCategoryOption {
  id: string;
  name: string;
  year: number;
}

export const PLAYOFF_DIVISIONS: DivisionCategoryOption[] = [
  { id: '11111111-0001-0001-0001-000000000001', name: '7ª División', year: 2010 },
  { id: '11111111-0001-0001-0001-000000000002', name: '8ª División', year: 2011 },
  { id: '11111111-0001-0001-0001-000000000003', name: '9ª División', year: 2012 },
  { id: '11111111-0001-0001-0001-000000000004', name: '10ª División', year: 2013 },
  { id: '11111111-0001-0001-0001-000000000005', name: '11ª División', year: 2014 },
  { id: '11111111-0001-0001-0001-000000000006', name: '12ª División', year: 2015 },
  { id: '11111111-0001-0001-0001-000000000007', name: '13ª División', year: 2016 },
  { id: '11111111-0001-0001-0001-000000000008', name: '14ª División', year: 2017 },
  { id: '11111111-0001-0001-0001-000000000009', name: '15ª División', year: 2018 },
  { id: '11111111-0001-0001-0001-000000000010', name: '16ª División', year: 2019 },
  { id: '11111111-0001-0001-0001-000000000011', name: '17ª División', year: 2020 },
];

export const AdaroPlayoffBracket: React.FC<AdaroPlayoffBracketProps> = ({
  matches,
  teams
}) => {
  const [selectedCup, setSelectedCup] = useState<AdaroCupTier>('platino');
  // 'general' = Tira General de Clubes, o un divisionId específico de 7ma a 14ta
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>('general');
  const [seedingCriteria, setSeedingCriteria] = useState<SeedingCriteria>('grupos_adaro');

  // 1. Obtener la posición de cada club en su respectiva zona (Fase 1 de Grupos Adaro)
  const zoneRankings = useMemo(() => {
    const results: Record<AdaroCupTier, Array<{ team: Team; zoneName: string; pts: number; avg: number; dg: number; gf: number }>> = {
      platino: [],
      oro: [],
      plata: [],
      bronce: []
    };

    ADARO_ZONES.forEach(zone => {
      const zoneMatches = matches.filter(m => m.zone_id === zone.id);
      const teamIdSet = new Set<string>();
      zoneMatches.forEach(m => {
        teamIdSet.add(m.home_team_id);
        teamIdSet.add(m.away_team_id);
      });
      const zTeams = teams.filter(t => teamIdSet.has(t.id));

      const standings = calculateAdaroZoneStandings(
        zoneMatches,
        zTeams,
        ADARO_PUNTUABLE_DIVISION_IDS
      );

      standings.forEach(s => {
        results[s.cupTier].push({
          team: s.team,
          zoneName: zone.name,
          pts: s.points,
          avg: s.average,
          dg: s.goalDifference,
          gf: s.goalsFor,
        });
      });
    });

    // Ordenar los 7 equipos de cada copa para definir los sembrados del 1 al 7
    // Criterio Oficial: Promedio DESC, Puntos DESC, Diferencia de Gol DESC, Goles a Favor DESC
    Object.keys(results).forEach(tier => {
      results[tier as AdaroCupTier].sort((a, b) => {
        if (b.avg !== a.avg) return b.avg - a.avg;
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dg !== a.dg) return b.dg - a.dg;
        return b.gf - a.gf;
      });
    });

    return results;
  }, [matches, teams]);

  const currentSeedList = zoneRankings[selectedCup] || [];
  const badge = CUP_BADGES[selectedCup];

  const activeDivision = PLAYOFF_DIVISIONS.find(d => d.id === selectedDivisionFilter);

  // Generar llaves oficiales según reglamento (Sembrado 1 BYE directo a semis, A vs D // B vs C)
  const bracketData = useMemo(() => {
    const s = currentSeedList;
    const seed1 = s[0]?.team || null;
    const seed2 = s[1]?.team || null;
    const seed3 = s[2]?.team || null;
    const seed4 = s[3]?.team || null;
    const seed5 = s[4]?.team || null;
    const seed6 = s[5]?.team || null;
    const seed7 = s[6]?.team || null;

    const divLabel = activeDivision ? `${activeDivision.name} (${activeDivision.year})` : 'Tira General';

    // Resultados de prueba simulados con definición por penales en caso de empate
    // Si se selecciona una división puntual, simula los tanteos de esa categoría
    const isCategoryMode = selectedDivisionFilter !== 'general';
    const offset = isCategoryMode 
      ? PLAYOFF_DIVISIONS.findIndex(d => d.id === selectedDivisionFilter) + 1 
      : 0;

    // Cuartos de Final Oficiales:
    // A: 1ro libre a Semifinal
    // B: 2° vs 7°
    // C: 3° vs 6°
    // D: 4° vs 5°
    // Locales: 2°, 3° y 4°
    const qfMatches: PlayoffMatch[] = [
      {
        id: `${selectedCup}-qf-a-bye`,
        stage: 'cuartos',
        homeTeam: seed1,
        awayTeam: null,
        homeSeed: 1,
        isBye: true,
        winnerTeamId: seed1?.id,
        divisionLabel: divLabel
      },
      {
        id: `${selectedCup}-qf-d`, // Cruce D: 4° vs 5°
        stage: 'cuartos',
        homeTeam: seed4,
        awayTeam: seed5,
        homeSeed: 4,
        awaySeed: 5,
        homeScore: (offset % 2 === 0) ? 2 : 1,
        awayScore: (offset % 2 === 0) ? 0 : 1,
        homePenalties: (offset % 2 !== 0) ? 5 : undefined,
        awayPenalties: (offset % 2 !== 0) ? 4 : undefined,
        winnerTeamId: seed4?.id,
        divisionLabel: divLabel
      },
      {
        id: `${selectedCup}-qf-b`, // Cruce B: 2° vs 7°
        stage: 'cuartos',
        homeTeam: seed2,
        awayTeam: seed7,
        homeSeed: 2,
        awaySeed: 7,
        homeScore: 3,
        awayScore: 1,
        winnerTeamId: seed2?.id,
        divisionLabel: divLabel
      },
      {
        id: `${selectedCup}-qf-c`, // Cruce C: 3° vs 6°
        stage: 'cuartos',
        homeTeam: seed3,
        awayTeam: seed6,
        homeSeed: 3,
        awaySeed: 6,
        homeScore: 2,
        awayScore: 2,
        homePenalties: 4,
        awayPenalties: 5,
        winnerTeamId: seed6?.id,
        divisionLabel: divLabel
      },
    ];

    // Semifinales Oficiales: A vs D // B vs C
    // Canchas a designar (neutrales)
    const sfMatches: PlayoffMatch[] = [
      {
        id: `${selectedCup}-sf-1`, // A vs D
        stage: 'semifinal',
        homeTeam: seed1, // 1º Sembrado (A)
        awayTeam: seed4, // Ganador de D (4° vs 5°)
        homeSeed: 1,
        awaySeed: 4,
        homeScore: 2,
        awayScore: 1,
        winnerTeamId: seed1?.id,
        divisionLabel: divLabel
      },
      {
        id: `${selectedCup}-sf-2`, // B vs C
        stage: 'semifinal',
        homeTeam: seed2, // Ganador de B (2° vs 7°)
        awayTeam: seed6, // Ganador de C (3° vs 6°)
        homeSeed: 2,
        awaySeed: 6,
        homeScore: 1,
        awayScore: 1,
        homePenalties: 6,
        awayPenalties: 5,
        winnerTeamId: seed2?.id,
        divisionLabel: divLabel
      }
    ];

    // Gran Final Oficial: Ganador SF 1 vs Ganador SF 2
    const finalMatch: PlayoffMatch = {
      id: `${selectedCup}-final`,
      stage: 'final',
      homeTeam: seed1,
      awayTeam: seed2,
      homeSeed: 1,
      awaySeed: 2,
      homeScore: 2,
      awayScore: 0,
      winnerTeamId: seed1?.id,
      divisionLabel: divLabel
    };

    return {
      qfMatches,
      sfMatches,
      finalMatch
    };
  }, [currentSeedList, selectedCup, selectedDivisionFilter, activeDivision]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── 1. Selector de las 4 Copas ─────────────────────────────────────── */}
      <div className="bg-card/40 border border-border/60 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Fase Final · LMF 2026
              </h2>
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-foreground flex items-center gap-2 mt-0.5">
              <span>{badge.emoji}</span>
              Playoffs · {badge.label}
            </h3>
          </div>

          {/* Botones de las 4 Copas */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            {(['platino', 'oro', 'plata', 'bronce'] as AdaroCupTier[]).map((tier) => {
              const b = CUP_BADGES[tier];
              const isSelected = selectedCup === tier;
              return (
                <button
                  key={tier}
                  onClick={() => setSelectedCup(tier)}
                  className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold tracking-tight transition-all active:scale-95 flex items-center justify-center space-x-1.5 border ${
                    isSelected
                      ? `${b.bgClass} ${b.textClass} ${b.borderClass} ring-2 ring-primary/20 shadow-sm`
                      : 'bg-card/70 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50'
                  }`}
                >
                  <span>{b.emoji}</span>
                  <span>{b.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── 1.1 Selector de Categorías Ganadoras (7ª a 14ª) vs Tira General ─── */}
        <div className="pt-2 border-t border-border/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              Nivel de Visualización de Playoffs:
            </span>
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {activeDivision ? `Mostrando: ${activeDivision.name}` : 'Mostrando: Tira General de Clubes'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedDivisionFilter('general')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                selectedDivisionFilter === 'general'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Resumen Tiras de Clubes</span>
            </button>

            {PLAYOFF_DIVISIONS.map((div) => {
              const isSelected = selectedDivisionFilter === div.id;
              return (
                <button
                  key={div.id}
                  onClick={() => setSelectedDivisionFilter(div.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50'
                  }`}
                >
                  {div.name} ({div.year})
                </button>
              );
            })}
          </div>
        </div>

        {/* Explicación del Formato según Reglamento Oficial */}
        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/40 flex items-start gap-3 text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="leading-relaxed">
              <strong className="text-foreground">Reglamento Oficial: </strong>
              Compiten los 7 clubes clasificados ({selectedCup === 'platino' ? '1º de cada zona' : selectedCup === 'oro' ? '2º de cada zona' : selectedCup === 'plata' ? '3º de cada zona' : '4º de cada zona'}).
              El <strong>1º Sembrado</strong> accede directo a Semifinales (Cruce A).
              Cruces de Cuartos: <strong>B (2° vs 7°), C (3° vs 6°), D (4° vs 5°)</strong> con localía para 2°, 3° y 4°.
            </p>
            <p className="leading-relaxed text-[11px] text-primary dark:text-cyan-400 font-medium">
              ⚡ <strong>Categorías Ganadoras:</strong> Clasifican a Semifinales las divisiones ganadoras. En caso de empate en tiempo reglamentario, se definen por tanda de 5 penales por lado y luego 1 a 1 hasta quebrar la igualdad.
            </p>
          </div>
        </div>
      </div>

      {/* ─── 2. Tabla de Sembrados (1 al 7) con Selector de Criterio ───────── */}
      <div className="bg-card/30 border border-border/60 rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            Tabla de Sembrados Oficial ({currentSeedList.length} Clubes Clasificados)
          </h4>

          {/* Toggle de Criterio de Siembra (Retrocompatible) */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/50 text-[10px] font-bold">
            <SlidersHorizontal className="w-3 h-3 text-muted-foreground ml-1" />
            <span className="text-muted-foreground">Criterio:</span>
            <button
              onClick={() => setSeedingCriteria('grupos_adaro')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                seedingCriteria === 'grupos_adaro'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Puntos Fase Grupos
            </button>
            <button
              onClick={() => setSeedingCriteria('promedio_anual')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                seedingCriteria === 'promedio_anual'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Promedio Anual (1ª Fase)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {currentSeedList.map((item, idx) => {
            const seedNum = idx + 1;
            const isByeSeed = seedNum === 1;

            return (
              <div
                key={item.team.id}
                className={`p-3 rounded-2xl border transition-all ${
                  isByeSeed
                    ? 'bg-cyan-500/10 border-cyan-500/30 ring-1 ring-cyan-500/30'
                    : 'bg-background/60 border-border/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${
                    isByeSeed ? 'bg-cyan-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    #{seedNum}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {item.zoneName}
                  </span>
                </div>

                <div className="font-bold text-xs text-foreground truncate">
                  {item.team.display_name || item.team.name}
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                  <span>{item.pts} pts <span className="text-amber-600 dark:text-amber-400 font-bold">({item.avg.toFixed(2).replace('.', ',')})</span></span>
                  <span>DG {item.dg > 0 ? `+${item.dg}` : item.dg}</span>
                </div>

                {isByeSeed && (
                  <span className="inline-block mt-2 text-[9px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    Libre a Semis 🚀
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 3. Árbol Visual del Cuadro de Playoffs (Cuartos -> Semis -> Final) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black tracking-tight text-foreground flex items-center gap-2">
            <Swords className="w-4 h-4 text-primary" />
            Cuadro de Enfrentamientos Directos · {activeDivision ? activeDivision.name : 'Tiras de Clubes'}
          </h4>
          <span className="text-xs text-muted-foreground">
            {activeDivision ? `Definición por penales activa en ${activeDivision.name}` : 'Empates resueltos por penales reglamentarios'}
          </span>
        </div>

        <div className="overflow-x-auto pb-6 scrollbar-none">
          <div className="min-w-[760px] grid grid-cols-3 gap-6">
            
            {/* COLUMNA 1: Cuartos de Final */}
            <div className="space-y-4">
              <div className="text-center pb-2 border-b border-border/40">
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Cuartos de Final
                </span>
                <p className="text-[10px] text-muted-foreground">Locales: 2°, 3° y 4° (Sembrado 1 Libre)</p>
              </div>

              <div className="space-y-3">
                {bracketData.qfMatches.map((m) => (
                  <BracketMatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>

            {/* COLUMNA 2: Semifinales */}
            <div className="space-y-4">
              <div className="text-center pb-2 border-b border-border/40">
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Semifinales (A vs D // B vs C)
                </span>
                <p className="text-[10px] text-muted-foreground">En canchas neutrales LMF</p>
              </div>

              <div className="space-y-12 pt-6">
                {bracketData.sfMatches.map((m) => (
                  <BracketMatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>

            {/* COLUMNA 3: Gran Final */}
            <div className="space-y-4">
              <div className="text-center pb-2 border-b border-border/40">
                <span className="text-xs font-black uppercase tracking-wider text-amber-500 dark:text-amber-400 flex items-center justify-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  Gran Final
                </span>
                <p className="text-[10px] text-muted-foreground">Por la corona de {badge.name} ({activeDivision ? activeDivision.name : 'Club Campeón'})</p>
              </div>

              <div className="pt-24">
                <BracketMatchCard match={bracketData.finalMatch} isFinal />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponente de Partido en el Bracket
const BracketMatchCard: React.FC<{ match: PlayoffMatch; isFinal?: boolean }> = ({ match, isFinal = false }) => {
  if (match.isBye) {
    return (
      <div className="p-3.5 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 backdrop-blur-md text-xs">
        <div className="flex items-center justify-between text-[10px] font-bold text-cyan-600 dark:text-cyan-400 mb-1">
          <span>LIBRE A SEMIFINALES (Cruce A)</span>
          <span>Sembrado #1</span>
        </div>
        <div className="font-bold text-foreground">
          {match.homeTeam?.display_name || match.homeTeam?.name || 'Por definir'}
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">
          Avanza directo a Semis (enfrenta al ganador de D)
        </div>
      </div>
    );
  }

  const isHomeWinner = match.winnerTeamId === match.homeTeam?.id;
  const isAwayWinner = match.winnerTeamId === match.awayTeam?.id;
  const hasPenalties = match.homePenalties !== undefined && match.awayPenalties !== undefined;

  return (
    <div className={`p-3.5 rounded-2xl border backdrop-blur-md text-xs transition-all ${
      isFinal 
        ? 'border-amber-500/40 bg-amber-500/5 shadow-md ring-1 ring-amber-500/20' 
        : 'border-border/60 bg-card/60 shadow-sm'
    }`}>
      {/* Equipo Local */}
      <div className={`flex items-center justify-between py-1.5 ${isHomeWinner ? 'font-black text-foreground' : 'text-muted-foreground'}`}>
        <div className="flex items-center space-x-2 truncate pr-2">
          {match.homeSeed && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
              #{match.homeSeed}
            </span>
          )}
          <span className="truncate">
            {match.homeTeam?.display_name || match.homeTeam?.name || 'Por definir'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 flex-shrink-0">
          {hasPenalties && (
            <span className="text-[11px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              ({match.homePenalties} pen)
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
            isHomeWinner ? 'bg-primary/20 text-primary' : 'bg-muted/80 text-muted-foreground'
          }`}>
            {match.homeScore ?? '-'}
          </span>
        </div>
      </div>

      <div className="h-px bg-border/40 my-1" />

      {/* Equipo Visitante */}
      <div className={`flex items-center justify-between py-1.5 ${isAwayWinner ? 'font-black text-foreground' : 'text-muted-foreground'}`}>
        <div className="flex items-center space-x-2 truncate pr-2">
          {match.awaySeed && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
              #{match.awaySeed}
            </span>
          )}
          <span className="truncate">
            {match.awayTeam?.display_name || match.awayTeam?.name || 'Por definir'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 flex-shrink-0">
          {hasPenalties && (
            <span className="text-[11px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              ({match.awayPenalties} pen)
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
            isAwayWinner ? 'bg-primary/20 text-primary' : 'bg-muted/80 text-muted-foreground'
          }`}>
            {match.awayScore ?? '-'}
          </span>
        </div>
      </div>

      {hasPenalties && (
        <div className="mt-1.5 text-[9px] text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-between">
          <span>Definición por Penales</span>
          <span>
            {match.winnerTeamId === match.homeTeam?.id 
              ? `${match.homeTeam?.display_name || match.homeTeam?.name} ganó ${match.homePenalties}-${match.awayPenalties}`
              : `${match.awayTeam?.display_name || match.awayTeam?.name} ganó ${match.awayPenalties}-${match.homePenalties}`}
          </span>
        </div>
      )}

      {isFinal && isHomeWinner && match.homeTeam && (
        <div className="mt-2 pt-2 border-t border-amber-500/30 flex items-center justify-center gap-1.5 text-[11px] font-black text-amber-500 dark:text-amber-400">
          <Crown className="w-3.5 h-3.5" />
          <span>¡Campeón: {match.homeTeam.display_name || match.homeTeam.name}!</span>
        </div>
      )}
    </div>
  );
};
