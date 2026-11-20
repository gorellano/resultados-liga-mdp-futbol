import type { Team, Match, Division } from './types';
import { MOCK_TEAMS_CAMPEONATO, MOCK_TEAMS_PROMOCION } from './mockData';
import { isExcludedDivision } from './db';

const ALL_FALLBACK_TEAMS: Team[] = [...MOCK_TEAMS_CAMPEONATO, ...MOCK_TEAMS_PROMOCION];

export type AdaroCupTier = 'platino' | 'oro' | 'plata' | 'bronce';

/**
 * Tabla Oficial Final de Promedios - Primera Fase (Jugadas 6 fechas)
 * Fuente: Boletín Oficial LMF - Torneo Armando "Chamaco" Adaro
 */
export interface OfficialAdaroStandingOverride {
  played: number;
  points: number;
  average: number;
}

export const OFFICIAL_ADARO_FINAL_STANDINGS: Record<string, OfficialAdaroStandingOverride> = {
  // ZONA A (Zona 1)
  'aldosivi':              { played: 47, points: 135, average: 2.87 },
  'argentinos del sud':    { played: 48, points: 70,  average: 1.46 },
  'san lorenzo':           { played: 48, points: 63,  average: 1.31 },
  'libertad':              { played: 47, points: 7,   average: 0.15 },
  // ZONA B (Zona 2)
  'kimberley':             { played: 48, points: 128, average: 2.67 },
  'talleres':              { played: 48, points: 80,  average: 1.67 },
  'chapadmalal':           { played: 48, points: 43,  average: 0.90 },
  'boca':                  { played: 48, points: 24,  average: 0.50 },
  // ZONA C (Zona 3)
  'alvarado':              { played: 48, points: 129, average: 2.69 },
  'mar del plata':         { played: 48, points: 63,  average: 1.31 },
  'san isidro':            { played: 48, points: 60,  average: 1.25 },
  'al ver veras':          { played: 48, points: 20,  average: 0.42 },
  // ZONA D (Zona 4)
  'independiente':         { played: 48, points: 115, average: 2.40 },
  'el canon':              { played: 48, points: 81,  average: 1.69 },
  'quilmes':               { played: 48, points: 66,  average: 1.38 },
  'racing':                { played: 48, points: 11,  average: 0.23 },
  // ZONA E (Zona 5)
  'deportivo norte':       { played: 48, points: 95,  average: 1.98 },
  'nacion':                { played: 48, points: 84,  average: 1.75 },
  'circulo deportivo':     { played: 48, points: 71,  average: 1.48 },
  'almagro':               { played: 48, points: 23,  average: 0.48 },
  // ZONA F (Zona 6)
  'river plate':           { played: 48, points: 118, average: 2.46 },
  'cadetes':               { played: 48, points: 98,  average: 2.04 },
  'colegiales':            { played: 48, points: 39,  average: 0.81 },
  'san jose':              { played: 48, points: 21,  average: 0.44 },
  // ZONA G (Zona 7)
  'banfield':              { played: 48, points: 112, average: 2.33 },
  'once unidos':           { played: 48, points: 95,  average: 1.98 },
  'general urquiza':       { played: 48, points: 64,  average: 1.33 },
  'banco provincia':       { played: 48, points: 10,  average: 0.21 },
};

const ADARO_CLUB_ALIASES: Array<{ pattern: RegExp; key: string }> = [
  { pattern: /banco\s*prov/i, key: 'banco provincia' },
  { pattern: /argentinos\s*del\s*sud/i, key: 'argentinos del sud' },
  { pattern: /san\s*lorenzo/i, key: 'san lorenzo' },
  { pattern: /san\s*isidro/i, key: 'san isidro' },
  { pattern: /san\s*jose/i, key: 'san jose' },
  { pattern: /gral\.?\s*urquiza|general\s*urquiza/i, key: 'general urquiza' },
  { pattern: /once\s*unidos/i, key: 'once unidos' },
  { pattern: /dep(ortivo)?\.?\s*norte/i, key: 'deportivo norte' },
  { pattern: /circulo\s*dep/i, key: 'circulo deportivo' },
  { pattern: /al\s*ver\s*veras/i, key: 'al ver veras' },
  { pattern: /el\s*ca[ñn]on/i, key: 'el canon' },
  { pattern: /river/i, key: 'river plate' },
  { pattern: /boca/i, key: 'boca' },
  { pattern: /aldosivi/i, key: 'aldosivi' },
  { pattern: /alvarado/i, key: 'alvarado' },
  { pattern: /kimberley/i, key: 'kimberley' },
  { pattern: /talleres/i, key: 'talleres' },
  { pattern: /chapadmalal/i, key: 'chapadmalal' },
  { pattern: /independiente/i, key: 'independiente' },
  { pattern: /quilmes/i, key: 'quilmes' },
  { pattern: /racing/i, key: 'racing' },
  { pattern: /nacion/i, key: 'nacion' },
  { pattern: /almagro/i, key: 'almagro' },
  { pattern: /cadetes/i, key: 'cadetes' },
  { pattern: /colegiales/i, key: 'colegiales' },
  { pattern: /banfield/i, key: 'banfield' },
  { pattern: /libertad/i, key: 'libertad' },
  // Atlético Mar del Plata solo si no coincide con ningún otro club que tenga "de Mar del Plata" en su razón social
  { pattern: /mar\s*del\s*plata/i, key: 'mar del plata' },
];

export function findOfficialAdaroOverride(team: Team): OfficialAdaroStandingOverride | null {
  const candidates = [team.display_name, team.name]
    .filter(Boolean)
    .map(str => (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim());

  // 1. Coincidencia exacta directa
  for (const cand of candidates) {
    if (OFFICIAL_ADARO_FINAL_STANDINGS[cand]) {
      return OFFICIAL_ADARO_FINAL_STANDINGS[cand];
    }
  }

  // 2. Coincidencia por patrones específicos (Banco Provincia tiene prioridad sobre "Mar del Plata")
  for (const cand of candidates) {
    for (const { pattern, key } of ADARO_CLUB_ALIASES) {
      if (pattern.test(cand)) {
        return OFFICIAL_ADARO_FINAL_STANDINGS[key] || null;
      }
    }
  }

  return null;
}

export interface ZoneClubStanding {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  average: number; // Promedio oficial LMF = Pts / PJ
  divisionPoints: Record<string, number>; // division_id -> puntos sumados
  divisionBreakdown: Record<string, { won: number; drawn: number; lost: number; points: number }>;
  cupTier: AdaroCupTier;
  rank: number;
}

export interface AdaroTiraMatch {
  homeTeam: Team;
  awayTeam: Team;
  roundNumber: number;
  zoneId: string;
  homeTiraPoints: number;
  awayTiraPoints: number;
  isFinished: boolean;
  matches: Array<{
    divisionId: string;
    divisionName: string;
    match: Match;
  }>;
}

/**
 * Calcula la tabla acumulada oficial de una Zona para el Torneo Armando "Chamaco" Adaro.
 * Suma los puntos obtenidos por cada club en las divisiones puntuables (7ª a 14ª).
 * Asigna los 4 puestos de clasificación:
 * 1º -> Copa Platino 💎
 * 2º -> Copa Oro 🥇
 * 3º -> Copa Plata 🥈
 * 4º -> Copa Bronce 🥉
 */
export function calculateAdaroZoneStandings(
  zoneMatches: Match[],
  zoneTeams: Team[],
  puntuableDivisionIds: string[] = [],
  divisions?: Division[]
): ZoneClubStanding[] {
  const puntuableSet = new Set(puntuableDivisionIds);
  
  // Filtrar solo partidos de divisiones puntuables (7ª a 14ª)
  const validMatches = puntuableSet.size > 0
    ? zoneMatches.filter(m => {
        if (puntuableSet.has(m.division_id)) return true;
        if (divisions && divisions.length > 0) {
          const d = divisions.find(div => div.id === m.division_id);
          if (d) {
            const order = getDivisionOrder(d.name);
            return order >= 7 && order <= 14;
          }
        }
        return false;
      })
    : zoneMatches;

  const standingsMap = new Map<string, ZoneClubStanding>();
  const allTeamsPool = [...zoneTeams, ...ALL_FALLBACK_TEAMS];
  const poolById = new Map<string, Team>();
  allTeamsPool.forEach(t => poolById.set(t.id, t));

  const effectiveTeams = [...zoneTeams];
  if (effectiveTeams.length === 0) {
    const idSet = new Set<string>();
    validMatches.forEach(m => {
      idSet.add(m.home_team_id);
      idSet.add(m.away_team_id);
    });
    idSet.forEach(id => {
      const t = poolById.get(id);
      if (t) effectiveTeams.push(t);
    });
  }

  effectiveTeams.forEach(team => {
    standingsMap.set(team.id, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      average: 0,
      divisionPoints: {},
      divisionBreakdown: {},
      cupTier: 'bronce',
      rank: 4,
    });
  });

  const findStandingRow = (teamId: string): ZoneClubStanding | undefined => {
    if (standingsMap.has(teamId)) return standingsMap.get(teamId);
    const targetTeam = poolById.get(teamId);
    if (!targetTeam) return undefined;
    const targetNorm = targetTeam.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const row of standingsMap.values()) {
      const rNorm = row.team.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (rNorm === targetNorm || rNorm.includes(targetNorm) || targetNorm.includes(rNorm)) {
        return row;
      }
    }
    return undefined;
  };

  validMatches.forEach(match => {
    if (match.status !== 'finished') return;
    if (match.home_goals === null || match.away_goals === null) return;

    const home = findStandingRow(match.home_team_id);
    const away = findStandingRow(match.away_team_id);
    if (!home || !away) return;

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.home_goals;
    home.goalsAgainst += match.away_goals;
    away.goalsFor += match.away_goals;
    away.goalsAgainst += match.home_goals;

    // Inicializar desglose si no existe
    if (!home.divisionPoints[match.division_id]) home.divisionPoints[match.division_id] = 0;
    if (!away.divisionPoints[match.division_id]) away.divisionPoints[match.division_id] = 0;
    if (!home.divisionBreakdown[match.division_id]) {
      home.divisionBreakdown[match.division_id] = { won: 0, drawn: 0, lost: 0, points: 0 };
    }
    if (!away.divisionBreakdown[match.division_id]) {
      away.divisionBreakdown[match.division_id] = { won: 0, drawn: 0, lost: 0, points: 0 };
    }

    if (match.home_goals > match.away_goals) {
      home.won += 1;
      home.points += 3;
      home.divisionPoints[match.division_id] += 3;
      home.divisionBreakdown[match.division_id].won += 1;
      home.divisionBreakdown[match.division_id].points += 3;

      away.lost += 1;
      away.divisionBreakdown[match.division_id].lost += 1;
    } else if (match.home_goals < match.away_goals) {
      away.won += 1;
      away.points += 3;
      away.divisionPoints[match.division_id] += 3;
      away.divisionBreakdown[match.division_id].won += 1;
      away.divisionBreakdown[match.division_id].points += 3;

      home.lost += 1;
      home.divisionBreakdown[match.division_id].lost += 1;
    } else {
      home.drawn += 1;
      home.points += 1;
      home.divisionPoints[match.division_id] += 1;
      home.divisionBreakdown[match.division_id].drawn += 1;
      home.divisionBreakdown[match.division_id].points += 1;

      away.drawn += 1;
      away.points += 1;
      away.divisionPoints[match.division_id] += 1;
      away.divisionBreakdown[match.division_id].drawn += 1;
      away.divisionBreakdown[match.division_id].points += 1;
    }
  });

  // Si estamos evaluando el fixture completo de 6 fechas del Torneo Adaro,
  // aplicamos los totales oficiales de cierre de Primera Fase (PJ, Puntos y Promedio oficial)
  // incluyendo los partidos suspendidos disputados cuyo detalle de goles no fue informado en boletín.
  const isFullAdaroZoneFixture = zoneMatches.some(m => m.round_number >= 6);

  const sorted = Array.from(standingsMap.values()).map(s => {
    const official = isFullAdaroZoneFixture ? findOfficialAdaroOverride(s.team) : null;
    if (official) {
      return {
        ...s,
        played: official.played,
        points: official.points,
        average: official.average,
        goalDifference: s.goalsFor - s.goalsAgainst,
      };
    }

    const rawAvg = s.played > 0 ? s.points / s.played : 0;
    // Redondeo estándar a 2 decimales según Boletín Oficial LMF
    const roundedAvg = Math.round(rawAvg * 100) / 100;
    return {
      ...s,
      average: roundedAvg,
      goalDifference: s.goalsFor - s.goalsAgainst,
    };
  });

  // Ordenar según criterio oficial del Torneo Adaro:
  // 1. Promedio (Pts / PJ) DESC
  // 2. Puntos DESC
  // 3. Diferencia de Gol DESC
  // 4. Goles a favor DESC
  sorted.sort((a, b) => {
    if (b.average !== a.average) return b.average - a.average;
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  const tiers: AdaroCupTier[] = ['platino', 'oro', 'plata', 'bronce'];

  return sorted.map((s, index) => ({
    ...s,
    rank: index + 1,
    cupTier: tiers[index] || 'bronce',
  }));
}

export const DIVISION_NAMES_MAP: Record<number, string> = {
  7: 'Séptima',
  8: 'Octava',
  9: 'Novena',
  10: 'Décima',
  11: 'Undécima',
  12: 'Duodécima',
  13: 'Decimotercera',
  14: 'Decimocuarta',
  15: 'Decimoquinta',
  16: 'Decimosexta',
  17: 'Decimoséptima',
};

export function getDivisionOrder(name: string): number {
  if (!name) return 99;
  const norm = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // Reconocer IDs canónicos mock (11111111-0001-0001-0001-000000000001 -> 7, ..., 0011 -> 17)
  const mockMatch = norm.match(/^11111111-0001-0001-0001-0000000000(0[1-9]|1[01])$/);
  if (mockMatch) {
    return 6 + parseInt(mockMatch[1], 10);
  }

  // Si es un UUID genérico de base de datos, no intentar adivinar por dígitos hexadecimales
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(norm)) {
    return 99;
  }

  // Excluir pre-décimas/formativas
  if (norm.includes('pre-decima') || norm.includes('predecima')) {
    if (norm.includes('2018') || norm.includes('15')) return 15;
    if (norm.includes('2019') || norm.includes('16')) return 16;
    if (norm.includes('2020') || norm.includes('17')) return 17;
    return 15;
  }

  // 1. Priorizar nombres ordinales en texto (de 17ª a 7ª para que 'decimoseptima' se evalúe antes que 'septima')
  if (norm.includes('decimoseptima') || norm.includes('decima septima')) return 17;
  if (norm.includes('decimosexta') || norm.includes('decima sexta')) return 16;
  if (norm.includes('decimoquinta') || norm.includes('decima quinta')) return 15;
  if (norm.includes('decimocuarta') || norm.includes('decima cuarta')) return 14;
  if (norm.includes('decimotercera') || norm.includes('decima tercera')) return 13;
  if (norm.includes('duodecima') || norm.includes('decimosegunda') || norm.includes('decima segunda')) return 12;
  if (norm.includes('undecima') || norm.includes('decimoprimera') || norm.includes('decima primera')) return 11;
  if (norm.includes('decima')) return 10;
  if (norm.includes('novena')) return 9;
  if (norm.includes('octava')) return 8;
  if (norm.includes('septima')) return 7;

  // 2. Números de división explícitos (7ma, 7ª, 7, ..., 17ma, 17ª, 17) evitando años como 2010..2020
  if (/\b17(ma|va|na|ra|ta|a|º|°)?\b/.test(norm)) return 17;
  if (/\b16(ma|va|na|ra|ta|a|º|°)?\b/.test(norm)) return 16;
  if (/\b15(ma|va|na|ra|ta|a|º|°)?\b/.test(norm)) return 15;
  if (/\b14(ma|va|na|ra|ta|a|º|°)?\b/.test(norm)) return 14;
  if (/\b13(ma|va|na|ra|ta|a|º|°)?\b/.test(norm)) return 13;
  if (/\b12(ma|va|na|ra|ta|a|º|°)?\b/.test(norm)) return 12;
  if (/\b11(ma|va|na|ra|ta|a|º|°)?\b/.test(norm)) return 11;
  if (/\b10(ma|va|na|ra|ta|a|º|°)?\b/.test(norm)) return 10;
  if (/\b9(ma|va|na|ra|ta|a|º|°)?\b/.test(norm)) return 9;
  if (/\b8(ma|va|na|ra|ta|a|º|°)?\b/.test(norm)) return 8;
  if (/\b7(ma|va|na|ra|ta|a|º|°)?\b/.test(norm)) return 7;

  return 99;
}

/**
 * Agrupa los partidos de una zona y fecha en "Tiras de Clubes"
 * (ej: Kimberley vs Boca, con sus 8 partidos y suma total de puntos de la jornada).
 */
export function groupZoneMatchesIntoTiras(
  zoneMatches: Match[],
  teams: Team[],
  divisions: Division[]
): AdaroTiraMatch[] {
  const allTeams = [...teams, ...ALL_FALLBACK_TEAMS];
  const teamsMap = new Map(allTeams.map(t => [t.id, t]));
  const divsMap = new Map(divisions.map(d => [d.id, d.name]));

  const findTeam = (id: string): Team | undefined => {
    if (teamsMap.has(id)) return teamsMap.get(id);
    return allTeams.find(t => t.id === id);
  };

  // Agrupar por par de clubes sin importar quién es local/visitante en la categoría
  const tiraMap = new Map<string, AdaroTiraMatch>();

  zoneMatches.forEach(match => {
    const homeTeam = findTeam(match.home_team_id);
    const awayTeam = findTeam(match.away_team_id);
    if (!homeTeam || !awayTeam) return;

    // Llave canónica para la tira del día (orden alfabético de nombres para agrupar)
    const pairKey = [homeTeam.name, awayTeam.name].sort().join('_') + `_r${match.round_number}`;

    if (!tiraMap.has(pairKey)) {
      tiraMap.set(pairKey, {
        homeTeam,
        awayTeam,
        roundNumber: match.round_number,
        zoneId: match.zone_id,
        homeTiraPoints: 0,
        awayTiraPoints: 0,
        isFinished: false,
        matches: [],
      });
    }

    const tira = tiraMap.get(pairKey)!;
    const fallbackOrder = getDivisionOrder(match.division_id);
    const divName = divsMap.get(match.division_id) || (fallbackOrder >= 7 && fallbackOrder <= 17 ? `${DIVISION_NAMES_MAP[fallbackOrder]} División` : 'División');
    if (isExcludedDivision(divName)) return;

    tira.matches.push({
      divisionId: match.division_id,
      divisionName: divName,
      match,
    });

    if (match.status === 'finished' && match.home_goals !== null && match.away_goals !== null) {
      tira.isFinished = true;
      if (match.home_goals > match.away_goals) {
        if (match.home_team_id === tira.homeTeam.id) {
          tira.homeTiraPoints += 3;
        } else {
          tira.awayTiraPoints += 3;
        }
      } else if (match.home_goals < match.away_goals) {
        if (match.away_team_id === tira.awayTeam.id) {
          tira.awayTiraPoints += 3;
        } else {
          tira.homeTiraPoints += 3;
        }
      } else {
        tira.homeTiraPoints += 1;
        tira.awayTiraPoints += 1;
      }
    }
  });



  // Ordenar los partidos internos de la tira por división (estrictamente de 7ma a 16ta)
  const result = Array.from(tiraMap.values());
  result.forEach(tira => {
    tira.matches.sort((a, b) => {
      const orderA = getDivisionOrder(a.divisionName);
      const orderB = getDivisionOrder(b.divisionName);
      if (orderA !== orderB) return orderA - orderB;
      return a.divisionName.localeCompare(b.divisionName);
    });
  });

  return result.sort((a, b) => a.roundNumber - b.roundNumber);
}

export const CUP_BADGES: Record<AdaroCupTier, {
  name: string;
  label: string;
  badge: string;
  emoji: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}> = {
  platino: {
    name: 'Platino',
    label: 'Copa de Platino',
    badge: '1º Clasifica a Platino',
    emoji: '💎',
    bgClass: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    borderClass: 'border-cyan-500/30 dark:border-cyan-500/50',
  },
  oro: {
    name: 'Oro',
    label: 'Copa de Oro',
    badge: '2º Clasifica a Oro',
    emoji: '🥇',
    bgClass: 'bg-amber-500/10 dark:bg-amber-500/20',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500/30 dark:border-amber-500/50',
  },
  plata: {
    name: 'Plata',
    label: 'Copa de Plata',
    badge: '3º Clasifica a Plata',
    emoji: '🥈',
    bgClass: 'bg-slate-400/10 dark:bg-slate-400/20',
    textClass: 'text-slate-600 dark:text-slate-300',
    borderClass: 'border-slate-400/30 dark:border-slate-400/50',
  },
  bronce: {
    name: 'Bronce',
    label: 'Copa de Bronce',
    badge: '4º Clasifica a Bronce',
    emoji: '🥉',
    bgClass: 'bg-orange-600/10 dark:bg-orange-600/20',
    textClass: 'text-orange-700 dark:text-orange-400',
    borderClass: 'border-orange-600/30 dark:border-orange-600/50',
  },
};

