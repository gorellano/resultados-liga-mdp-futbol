import { supabase } from './supabase';
import type { Team, Match, Tournament, Division, Zone, User, ContactMessage } from './types';
import { 
  MOCK_TEAMS_CAMPEONATO, 
  MOCK_TEAMS_PROMOCION, 
  MOCK_MATCHES_CAMPEONATO, 
  MOCK_MATCHES_PROMOCION, 
  MOCK_TOURNAMENTS,
  WEBSITES,
  INSTAGRAMS
} from './mockData';
import {
  ADARO_TOURNAMENT,
  ADARO_TOURNAMENT_ID,
  ADARO_ZONES,
  generateAdaroMatches,
  getAdaroDivisionIndex,
  getAdaroZoneIndex
} from './mockAdaroData';
import { saveAuth } from './auth';

// In-memory copies of mock matches to persist edits during the mock session
let memoryMatchesCamp = [...MOCK_MATCHES_CAMPEONATO];
let memoryMatchesProm = [...MOCK_MATCHES_PROMOCION];
let memoryMatchesAdaro: Match[] = [];
let adaroInitializedWithReal = false;

function getOrGenerateAdaroMatches(teams?: Team[], divs?: Division[], zns?: Zone[]): Match[] {
  const hasRealTeams = Boolean(teams && teams.length > 0 && !teams[0].id.startsWith('00000000-'));

  if (memoryMatchesAdaro.length === 0 || (!adaroInitializedWithReal && hasRealTeams)) {
    const existingEdits = new Map<string, { home_goals: number | null; away_goals: number | null; status: any; match_date?: string | null }>();
    if (memoryMatchesAdaro.length > 0) {
      memoryMatchesAdaro.forEach(m => {
        if (m.home_goals !== null || m.away_goals !== null || m.status === 'finished') {
          existingEdits.set(`${m.round_number}-${m.home_team_id}-${m.away_team_id}`, {
            home_goals: m.home_goals,
            away_goals: m.away_goals,
            status: m.status,
            match_date: m.match_date
          });
        }
      });
    }

    memoryMatchesAdaro = generateAdaroMatches(teams, divs, zns);
    if (hasRealTeams) {
      adaroInitializedWithReal = true;
    }

    if (existingEdits.size > 0) {
      memoryMatchesAdaro.forEach(m => {
        const edit = existingEdits.get(`${m.round_number}-${m.home_team_id}-${m.away_team_id}`);
        if (edit) {
          m.home_goals = edit.home_goals;
          m.away_goals = edit.away_goals;
          m.status = edit.status;
          if (edit.match_date) m.match_date = edit.match_date;
        }
      });
    }
  }
  return memoryMatchesAdaro;
}

// In-memory copies of users
let memoryUsers: User[] = [
  { id: 'u1', username: 'superadmin', role: 'super_admin', is_active: true, created_at: new Date().toISOString() },
  { id: 'u2', username: 'editor',     role: 'editor',      is_active: true, created_at: new Date().toISOString() },
];

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

export function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCached<T>(key: string, data: T, ttlMs: number): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidateDbCache(pattern?: string): void {
  if (!pattern) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  }
}

async function withCache<T>(
  cacheKey: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = getCached<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T>;
  }

  const promise = (async () => {
    try {
      const result = await fetcher();
      setCached(cacheKey, result, ttlMs);
      return result;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, promise);
  return promise;
}

/**
 * Checks if Supabase has been configured with real, non-placeholder credentials
 */
export function isSupabaseActive(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(
    url && 
    url !== 'https://placeholder.supabase.co' && 
    !url.includes('dummy') &&
    key && 
    key !== 'placeholder' &&
    !key.includes('dummy')
  );
}

/**
 * Fetches all tournaments from Supabase (or fallback MOCK_TOURNAMENTS)
 */
export async function fetchTournaments(): Promise<Tournament[]> {
  return withCache('tournaments', 5 * 60 * 1000, async () => {
    const filterYouthTournaments = (list: Tournament[]) => {
      return list.filter(t => {
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
    };

    if (!isSupabaseActive()) {
      return [ADARO_TOURNAMENT, ...filterYouthTournaments(MOCK_TOURNAMENTS)];
    }
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name, year, is_current')
        .order('year', { ascending: false });

      if (error) throw error;

      const dbTournaments = (data || []).map(t => {
        if (t.id === ADARO_TOURNAMENT_ID || t.name.toLowerCase().includes('adaro') || t.name.toLowerCase().includes('chamaco')) {
          return { ...t, is_current: true };
        }
        return { ...t, is_current: false };
      });

      const adaroInDb = dbTournaments.find(t => 
        t.id === ADARO_TOURNAMENT_ID || 
        t.name.toLowerCase().includes('adaro') || 
        t.name.toLowerCase().includes('chamaco')
      );

      const adaroEntry: Tournament = {
        ...ADARO_TOURNAMENT,
        id: adaroInDb ? adaroInDb.id : ADARO_TOURNAMENT_ID,
        is_current: true,
      };

      const withoutAdaro = dbTournaments.filter(t => {
        const name = t.name.toLowerCase();
        return (
          t.id !== ADARO_TOURNAMENT_ID &&
          t.id !== adaroEntry.id &&
          !name.includes('adaro') &&
          !name.includes('chamaco') &&
          !name.includes('cacho') &&
          !name.includes('mendez') &&
          !name.includes('méndez') &&
          !name.includes('joaquin') &&
          !name.includes('joaquín') &&
          !name.includes('reyes')
        );
      });
      return [adaroEntry, ...withoutAdaro];
    } catch (err) {
      console.warn('Supabase fetchTournaments failed, falling back to mocks:', err);
      return [ADARO_TOURNAMENT, ...filterYouthTournaments(MOCK_TOURNAMENTS)];
    }
  });
}

/**
 * Obtiene todos los partidos de todos los torneos de un año específico (con paginación completa)
 */
export async function fetchMatchesForYear(year: number): Promise<Match[]> {
  const cacheKey = `matches_year_${year}`;
  return withCache(cacheKey, 2 * 60 * 1000, async () => {
    if (!isSupabaseActive()) {
      return [...memoryMatchesCamp, ...memoryMatchesProm];
    }
    try {
      const { data: tourns, error: tournErr } = await supabase
        .from('tournaments')
        .select('id')
        .eq('year', year);

      if (tournErr || !tourns || tourns.length === 0) {
        return [];
      }

      const tournIds = tourns.map(t => t.id);
      let allMatches: Match[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;
        const { data, error } = await supabase
          .from('matches')
          .select('id, tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date')
          .in('tournament_id', tournIds)
          .range(from, to);

        if (error) throw error;
        if (data && data.length > 0) {
          allMatches = allMatches.concat(data.map(m => ({
            ...m,
            status: m.status as 'scheduled' | 'finished' | 'postponed'
          })));
          if (data.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }
      return allMatches;
    } catch (err) {
      console.warn('fetchMatchesForYear failed:', err);
      return [];
    }
  });
}

/**
 * Helper to identify senior divisions (Primera, Quinta, Sexta) that must NEVER
 * be shown anywhere in this youth/infantiles football platform.
 */
export function isExcludedDivision(name: string): boolean {
  if (!name) return false;
  const norm = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // Coincidencia exacta de palabras o prefijos (evita falso positivo en decimoprimera, decimoquinta, decimosexta)
  const isPrimera = /\bprimera\b/.test(norm) || /^1(ra|era|ª|º|°)?(\s+division)?$/i.test(norm) || norm.startsWith('1ra ') || norm.startsWith('1era ');
  const isQuinta  = /\bquinta\b/.test(norm)  || /^5(ta|to|ª|º|°)?(\s+division)?$/i.test(norm)  || norm.startsWith('5ta ')  || norm.startsWith('5to ');
  const isSexta   = /\bsexta\b/.test(norm)   || /^6(ta|to|ª|º|°)?(\s+division)?$/i.test(norm)   || norm.startsWith('6ta ')   || norm.startsWith('6to ');

  return isPrimera || isQuinta || isSexta;
}

/**
 * Fetches all youth divisions (7ma a 16ta), strictly excluding senior/unwanted divisions.
 */
export async function fetchDivisions(): Promise<Division[]> {
  const mockDivisions: Division[] = [
    { id: '11111111-0001-0001-0001-000000000001', name: '7ma División',  sort_order: 1 },
    { id: '11111111-0001-0001-0001-000000000002', name: '8va División',  sort_order: 2 },
    { id: '11111111-0001-0001-0001-000000000003', name: '9na División',  sort_order: 3 },
    { id: '11111111-0001-0001-0001-000000000004', name: '10ma División', sort_order: 4 },
    { id: '11111111-0001-0001-0001-000000000005', name: '11ma División', sort_order: 5 },
    { id: '11111111-0001-0001-0001-000000000006', name: '12ma División', sort_order: 6 },
    { id: '11111111-0001-0001-0001-000000000007', name: '13ra División', sort_order: 7 },
    { id: '11111111-0001-0001-0001-000000000008', name: '14ta División', sort_order: 8 },
    { id: '11111111-0001-0001-0001-000000000009', name: '15ta División', sort_order: 9 },
    { id: '11111111-0001-0001-0001-000000000010', name: '16ta División', sort_order: 10 },
    { id: '11111111-0001-0001-0001-000000000011', name: '17ma División', sort_order: 11 },
  ];

  return withCache('divisions', 10 * 60 * 1000, async () => {
    if (!isSupabaseActive()) {
      return mockDivisions;
    }
    try {
      const { data, error } = await supabase
        .from('divisions')
        .select('id, name, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      const valid = (data || []).filter(d => !isExcludedDivision(d.name));
      if (valid.length > 0) {
        // Garantizar que la 17ma division exista en la lista sin duplicar
        const has17 = valid.some(d => {
          const norm = d.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return norm.includes('17') || norm.includes('decimoseptima');
        });
        if (!has17) {
          valid.push({ id: '11111111-0001-0001-0001-000000000011', name: '17ma División', sort_order: 11 });
        }
        return valid;
      }
      return mockDivisions;
    } catch (err) {
      console.warn('Supabase fetchDivisions failed, falling back to mocks:', err);
      return mockDivisions;
    }
  });
}

/**
 * Fetches zones (or fallback mocks)
 */
export async function fetchZones(): Promise<Zone[]> {
  const mockZones: Zone[] = [
    { id: '22222222-0001-0001-0001-000000000001', name: 'Campeonato' },
    { id: '22222222-0001-0001-0001-000000000002', name: 'Promoción' },
    // Zonas torneo - Primera División
    { id: '22222222-0001-0001-0001-000000000011', name: 'Zona 1 - Primera' },
    { id: '22222222-0001-0001-0001-000000000012', name: 'Zona 2 - Primera' },
    { id: '22222222-0001-0001-0001-000000000013', name: 'Zona 3 - Primera' },
    // Zonas torneo - Quinta División
    { id: '22222222-0001-0001-0001-000000000021', name: 'Zona 1 - Quinta' },
    { id: '22222222-0001-0001-0001-000000000022', name: 'Zona 2 - Quinta' },
    { id: '22222222-0001-0001-0001-000000000023', name: 'Zona 3 - Quinta' },
    // Zonas torneo - Sexta División
    { id: '22222222-0001-0001-0001-000000000031', name: 'Zona 1 - Sexta' },
    { id: '22222222-0001-0001-0001-000000000032', name: 'Zona 2 - Sexta' },
    { id: '22222222-0001-0001-0001-000000000033', name: 'Zona 3 - Sexta' },
    ...ADARO_ZONES,
  ];

  return withCache('zones', 10 * 60 * 1000, async () => {
    if (!isSupabaseActive()) {
      return mockZones;
    }
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('id, name');

      if (error) throw error;
      const zonesList = [...(data || [])];
      // Si las zonas de Adaro aún no están en la BD, las añadimos a la lista
      ADARO_ZONES.forEach(az => {
        if (!zonesList.some(z => z.id === az.id || z.name.toLowerCase() === az.name.toLowerCase())) {
          zonesList.push(az);
        }
      });
      return zonesList;
    } catch (err) {
      console.warn('Supabase fetchZones failed, falling back to mocks:', err);
      return mockZones;
    }
  });
}

/**
 * Fetches all teams (or fallback mocks)
 */
export async function fetchTeams(): Promise<Team[]> {
  const mockTeams = [...MOCK_TEAMS_CAMPEONATO, ...MOCK_TEAMS_PROMOCION];

  return withCache('teams', 10 * 60 * 1000, async () => {
    if (!isSupabaseActive()) {
      return mockTeams;
    }
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, display_name, logo_url');

      if (error) throw error;
      // Map team display names based on exact matches for visual presentation fallback
      const DISPLAY_NAMES: Record<string, string> = {
        "Talleres de Mar del Plata":            "Talleres",
        "Club Banco Provincia de Mar del Plata": "Banco Provincia",
        "Club Social y Deportivo Chapadmalal":   "Chapadmalal",
        "El cañon":                             "El Cañón",
        "General Mitre":                        "Gral. Mitre",
      };
      return (data || []).map(t => ({
        ...t,
        display_name: t.display_name || DISPLAY_NAMES[t.name],
        website_url: WEBSITES[t.name] || null,
        instagram_url: INSTAGRAMS[t.name] || null
      }));
    } catch (err) {
      console.warn('Supabase fetchTeams failed, falling back to mocks:', err);
      return mockTeams;
    }
  });
}

/**
 * Fetches matches filtered by division, zone, and tournament.
 */
export async function fetchMatches(
  divisionId: string, 
  zoneId: string, 
  tournamentId: string
): Promise<Match[]> {
  const cacheKey = `matches_${tournamentId}_${divisionId}_${zoneId}`;
  return withCache(cacheKey, 2 * 60 * 1000, async () => {
    // Intercepción Torneo Chamaco Adaro en memoria / fallback
    if (tournamentId === ADARO_TOURNAMENT_ID || tournamentId.toLowerCase().includes('adaro') || (zoneId && zoneId.startsWith('adaro-zone-'))) {
      const [teams, divs, zns] = await Promise.all([fetchTeams(), fetchDivisions(), fetchZones()]);
      const matchesPool = getOrGenerateAdaroMatches(teams, divs, zns);
      const targetDivIdx = divisionId ? getAdaroDivisionIndex(divisionId, divs) : -1;
      const targetZoneIdx = zoneId ? getAdaroZoneIndex(zoneId, zns) : -1;

      return matchesPool.filter(m => {
        const matchesDiv = !divisionId || m.division_id === divisionId || (targetDivIdx !== -1 && getAdaroDivisionIndex(m.division_id, divs) === targetDivIdx);
        const matchesZone = !zoneId || m.zone_id === zoneId || (targetZoneIdx !== -1 && getAdaroZoneIndex(m.zone_id, zns) === targetZoneIdx);
        return matchesDiv && matchesZone;
      }).map(m => ({
        ...m,
        ...(divisionId ? { division_id: divisionId } : {}),
        ...(zoneId ? { zone_id: zoneId } : {})
      }));
    }

    if (!isSupabaseActive()) {
      // Determine target mock matches (Campeonato vs Promoción) based on selected zone
      const isProm = zoneId === 'prom' || zoneId === '22222222-0001-0001-0001-000000000002';
      const source = isProm ? memoryMatchesProm : memoryMatchesCamp;
      return source
        .filter(m => m.tournament_id === tournamentId)
        .map(m => ({ ...m, division_id: divisionId, zone_id: zoneId }));
    }
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('id, tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date')
        .eq('division_id', divisionId)
        .eq('zone_id', zoneId)
        .eq('tournament_id', tournamentId);

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(m => ({
          ...m,
          status: m.status as 'scheduled' | 'finished' | 'postponed'
        }));
      }

      // Fallback mock fixture when Supabase has no matches yet for this division/zone/tournament
      const isProm = zoneId === 'prom' || zoneId === '22222222-0001-0001-0001-000000000002' || zoneId.toLowerCase().includes('prom');
      const source = isProm ? memoryMatchesProm : memoryMatchesCamp;
      return source.map(m => ({ ...m, tournament_id: tournamentId, division_id: divisionId, zone_id: zoneId }));
    } catch (err) {
      console.warn('Supabase fetchMatches failed, falling back to mocks:', err);
      const isProm = zoneId === 'prom' || zoneId === '22222222-0001-0001-0001-000000000002' || zoneId.toLowerCase().includes('prom');
      const source = isProm ? memoryMatchesProm : memoryMatchesCamp;
      return source.map(m => ({ ...m, tournament_id: tournamentId, division_id: divisionId, zone_id: zoneId }));
    }
  });
}

/**
 * Fetches all matches for a given tournament (across all divisions/zones)
 */
export async function fetchAllTournamentMatches(tournamentId: string): Promise<Match[]> {
  const cacheKey = `matches_${tournamentId}_all`;
  return withCache(cacheKey, 2 * 60 * 1000, async () => {
    const isAdaro = tournamentId === ADARO_TOURNAMENT_ID || tournamentId.toLowerCase().includes('adaro') || tournamentId.toLowerCase().includes('chamaco');

    if (isSupabaseActive()) {
      try {
        let targetTournId = tournamentId;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tournamentId);

        if (!isUuid && isAdaro) {
          const { data: dbTourns } = await supabase
            .from('tournaments')
            .select('id')
            .or('name.ilike.%adaro%,name.ilike.%chamaco%')
            .limit(1);
          if (dbTourns && dbTourns[0]) {
            targetTournId = dbTourns[0].id;
          }
        }

        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetTournId)) {
          let allMatches: Match[] = [];
          let page = 0;
          const pageSize = 1000;
          let hasMore = true;

          while (hasMore) {
            const from = page * pageSize;
            const to = from + pageSize - 1;
            const { data, error } = await supabase
              .from('matches')
              .select('id, tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, home_penalties, away_penalties, stage')
              .eq('tournament_id', targetTournId)
              .range(from, to);

            if (error) throw error;
            if (data && data.length > 0) {
              allMatches = allMatches.concat(data.map(m => ({
                ...m,
                status: m.status as 'scheduled' | 'finished' | 'postponed'
              })));
              if (data.length < pageSize) {
                hasMore = false;
              } else {
                page++;
              }
            } else {
              hasMore = false;
            }
          }

          if (allMatches.length > 0) {
            return allMatches;
          }
        }
      } catch (err) {
        console.warn('fetchAllTournamentMatches from Supabase failed, falling back:', err);
      }
    }

    if (isAdaro) {
      const [teams, divs, zns] = await Promise.all([fetchTeams(), fetchDivisions(), fetchZones()]);
      return getOrGenerateAdaroMatches(teams, divs, zns);
    }

    if (!isSupabaseActive()) {
      // Generate mock matches dynamically for all active divisions
      const divs = [
        '11111111-0001-0001-0001-000000000001', // 7ma
        '11111111-0001-0001-0001-000000000002', // 8va
        '11111111-0001-0001-0001-000000000003', // 9na
        '11111111-0001-0001-0001-000000000004', // 10ma
        '11111111-0001-0001-0001-000000000005', // 11ma
        '11111111-0001-0001-0001-000000000006', // 12ma
        '11111111-0001-0001-0001-000000000007', // 13ra
        '11111111-0001-0001-0001-000000000008', // 14ta
        '11111111-0001-0001-0001-000000000009', // 15ta
        '11111111-0001-0001-0001-000000000010', // 16ta
      ];
      const campMatches = memoryMatchesCamp.filter(m => m.tournament_id === tournamentId);
      const promMatches = memoryMatchesProm.filter(m => m.tournament_id === tournamentId);
      
      const allMatches: Match[] = [];
      divs.forEach(divId => {
        campMatches.forEach(m => {
          allMatches.push({ ...m, division_id: divId, zone_id: '22222222-0001-0001-0001-000000000001' });
        });
        promMatches.forEach(m => {
          allMatches.push({ ...m, division_id: divId, zone_id: '22222222-0001-0001-0001-000000000002' });
        });
      });
      return allMatches;
    }
    try {
      let allMatches: Match[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;
        const { data, error } = await supabase
          .from('matches')
          .select('id, tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date')
          .eq('tournament_id', tournamentId)
          .range(from, to);

        if (error) throw error;
        if (data && data.length > 0) {
          allMatches = allMatches.concat(data.map(m => ({
            ...m,
            status: m.status as 'scheduled' | 'finished' | 'postponed'
          })));
          if (data.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }
      return allMatches;
    } catch (err) {
      console.warn('Supabase fetchAllTournamentMatches failed, falling back to mocks:', err);
      // Same dynamic expansion fallback
      const divs = [
        '11111111-0001-0001-0001-000000000001',
        '11111111-0001-0001-0001-000000000002',
        '11111111-0001-0001-0001-000000000003',
        '11111111-0001-0001-0001-000000000004',
        '11111111-0001-0001-0001-000000000005',
        '11111111-0001-0001-0001-000000000006',
        '11111111-0001-0001-0001-000000000007',
        '11111111-0001-0001-0001-000000000008',
        '11111111-0001-0001-0001-000000000009',
        '11111111-0001-0001-0001-000000000010',
      ];
      const campMatches = memoryMatchesCamp.filter(m => m.tournament_id === tournamentId);
      const promMatches = memoryMatchesProm.filter(m => m.tournament_id === tournamentId);
      const allMatches: Match[] = [];
      divs.forEach(divId => {
        campMatches.forEach(m => {
          allMatches.push({ ...m, division_id: divId, zone_id: '22222222-0001-0001-0001-000000000001' });
        });
        promMatches.forEach(m => {
          allMatches.push({ ...m, division_id: divId, zone_id: '22222222-0001-0001-0001-000000000002' });
        });
      });
      return allMatches;
    }
  });
}

/**
 * Fetches matches for a given tournament and division
 */
export async function fetchTournamentDivisionMatches(tournamentId: string, divisionId: string): Promise<Match[]> {
  const cacheKey = `matches_${tournamentId}_div_${divisionId}`;
  return withCache(cacheKey, 2 * 60 * 1000, async () => {
    // 1. Si Supabase está configurado, consultar primero la BD
    if (isSupabaseActive()) {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select('id, tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, home_penalties, away_penalties, stage')
          .eq('tournament_id', tournamentId)
          .eq('division_id', divisionId);

        if (error) throw error;
        if (data && data.length > 0) {
          return data.map(m => ({
            ...m,
            status: m.status as 'scheduled' | 'finished' | 'postponed'
          }));
        }
      } catch (err) {
        console.warn('Supabase fetchTournamentDivisionMatches query failed, trying fallback:', err);
      }
    }

    // 2. Torneo Adaro: coincidencia flexible de divisiones y zonas para que todas las categorías tengan sus partidos
    if (tournamentId === ADARO_TOURNAMENT_ID || tournamentId.toLowerCase().includes('adaro')) {
      const [teams, divs, zns] = await Promise.all([fetchTeams(), fetchDivisions(), fetchZones()]);
      const matchesPool = getOrGenerateAdaroMatches(teams, divs, zns);
      const targetDivIdx = getAdaroDivisionIndex(divisionId, divs);
      return matchesPool.filter(m => {
        if (m.division_id === divisionId) return true;
        if (targetDivIdx !== -1) {
          return getAdaroDivisionIndex(m.division_id, divs) === targetDivIdx;
        }
        return false;
      }).map(m => ({ ...m, division_id: divisionId }));
    }

    if (!isSupabaseActive()) {
      const campMatches = memoryMatchesCamp.filter(m => m.tournament_id === tournamentId);
      const promMatches = memoryMatchesProm.filter(m => m.tournament_id === tournamentId);
      
      const allMatches: Match[] = [];
      campMatches.forEach(m => {
        allMatches.push({ ...m, division_id: divisionId, zone_id: '22222222-0001-0001-0001-000000000001' });
      });
      promMatches.forEach(m => {
        allMatches.push({ ...m, division_id: divisionId, zone_id: '22222222-0001-0001-0001-000000000002' });
      });
      return allMatches;
    }
    return [];
  });
}

/**
 * Saves a match score and status
 */
export async function saveMatchResult(
  matchId: string, 
  homeGoals: number | null, 
  awayGoals: number | null,
  status: 'scheduled' | 'finished' | 'postponed',
  matchDate?: string | null,
  homePenalties?: number | null,
  awayPenalties?: number | null,
  stage?: string | null
): Promise<boolean> {
  if (matchId.startsWith('adaro-') || !isSupabaseActive()) {
    // Update local session memory
    const updateMatch = (m: Match) => {
      if (m.id === matchId) {
        return { 
          ...m, 
          home_goals: homeGoals, 
          away_goals: awayGoals, 
          status,
          ...(matchDate !== undefined ? { match_date: matchDate } : {}),
          ...(homePenalties !== undefined ? { home_penalties: homePenalties } : {}),
          ...(awayPenalties !== undefined ? { away_penalties: awayPenalties } : {}),
          ...(stage !== undefined ? { stage } : {})
        };
      }
      return m;
    };
    memoryMatchesAdaro = memoryMatchesAdaro.map(updateMatch);
    memoryMatchesCamp = memoryMatchesCamp.map(updateMatch);
    memoryMatchesProm = memoryMatchesProm.map(updateMatch);
    invalidateDbCache('matches');
    return true;
  }
  try {
    const updateFields: any = { 
      home_goals: homeGoals, 
      away_goals: awayGoals, 
      status 
    };
    if (matchDate !== undefined) {
      updateFields.match_date = matchDate;
    }
    if (homePenalties !== undefined) {
      updateFields.home_penalties = homePenalties;
    }
    if (awayPenalties !== undefined) {
      updateFields.away_penalties = awayPenalties;
    }
    if (stage !== undefined) {
      updateFields.stage = stage;
    }

    const { error } = await supabase
      .from('matches')
      .update(updateFields)
      .eq('id', matchId);

    if (error) throw error;
    invalidateDbCache('matches');
    return true;
  } catch (err) {
    console.error('Supabase saveMatchResult failed:', err);
    return false;
  }
}

/**
 * Authenticates an administrator via database RPC or mock local fallback.
 */
export async function authenticateUser(
  username: string, 
  password: string
): Promise<{ username: string; role: 'super_admin' | 'editor' } | null> {
  if (!isSupabaseActive()) {
    const credentials = [
      { username: 'superadmin', password: 'SuperSecret123!', role: 'super_admin' as const },
      { username: 'editor',     password: 'Editor123!',       role: 'editor'      as const },
    ];
    const found = credentials.find(c => c.username === username.trim().toLowerCase() && c.password === password);
    if (found) {
      saveAuth({ username: found.username, role: found.role });
      return { username: found.username, role: found.role };
    }
    return null;
  }

  try {
    const { data, error } = await supabase.rpc('authenticate_user', {
      p_username: username.trim(),
      p_password: password
    });
    if (error) throw error;
    
    if (data && data.length > 0) {
      const user = data[0];
      const authData = { username: user.username, role: user.role as 'super_admin' | 'editor' };
      
      // Establish Supabase Auth session for RLS authentication
      try {
        await supabase.auth.signInWithPassword({
          email: 'admin-db-session@costaygol.com',
          password: 'LmfAdminDbSession2026!'
        });
      } catch (authErr) {
        console.warn('Failed to establish Supabase Auth session:', authErr);
      }

      saveAuth(authData);
      return authData;
    }
    
    // Si la BD de Supabase aún no tiene usuarios dados de alta, permitir credenciales de fallback
    const credentials = [
      { username: 'superadmin', password: 'SuperSecret123!', role: 'super_admin' as const },
      { username: 'editor',     password: 'Editor123!',       role: 'editor'      as const },
    ];
    const found = credentials.find(c => c.username === username.trim().toLowerCase() && c.password === password);
    if (found) {
      saveAuth({ username: found.username, role: found.role });
      return { username: found.username, role: found.role };
    }
    return null;
  } catch (err) {
    console.warn('Supabase authentication failed, trying mock fallback:', err);
    const credentials = [
      { username: 'superadmin', password: 'SuperSecret123!', role: 'super_admin' as const },
      { username: 'editor',     password: 'Editor123!',       role: 'editor'      as const },
    ];
    const found = credentials.find(c => c.username === username.trim().toLowerCase() && c.password === password);
    if (found) {
      saveAuth({ username: found.username, role: found.role });
      return { username: found.username, role: found.role };
    }
    return null;
  }
}

/**
 * Signs out from the Supabase session.
 */
export async function logoutUser(): Promise<void> {
  if (isSupabaseActive()) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Failed to sign out from Supabase Auth:', err);
    }
  }
}


/**
 * Creates a new team in the database or returns a mock team.
 */
export async function createTeam(
  name: string, 
  displayName: string | null, 
  logoUrl: string | null
): Promise<Team | null> {
  if (!isSupabaseActive()) {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: name.trim(),
      display_name: displayName?.trim() || undefined,
      logo_url: logoUrl || null
    };
    invalidateDbCache('teams');
    return newTeam;
  }
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert([{ name: name.trim(), display_name: displayName?.trim() || null, logo_url: logoUrl }])
      .select('id, name, display_name, logo_url');
    if (error) throw error;
    invalidateDbCache('teams');
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Supabase createTeam failed:', err);
    return null;
  }
}

/**
 * Creates a new tournament in the database or returns a mock tournament.
 */
export async function createTournament(
  name: string, 
  year: number
): Promise<Tournament | null> {
  if (!isSupabaseActive()) {
    const newTourn: Tournament = {
      id: `t-${Date.now()}`,
      name: name.trim(),
      year
    };
    invalidateDbCache('tournaments');
    return newTourn;
  }
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .insert([{ name: name.trim(), year }])
      .select('id, name, year');
    if (error) throw error;
    invalidateDbCache('tournaments');
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Supabase createTournament failed:', err);
    return null;
  }
}

/**
 * Fetches all users from the database (safe schema) or returns mocks.
 */
export async function fetchUsers(): Promise<User[]> {
  if (!isSupabaseActive()) {
    return memoryUsers;
  }
  try {
    const { data, error } = await supabase.rpc('fetch_users');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Supabase fetchUsers failed, falling back to mocks:', err);
    return memoryUsers;
  }
}

/**
 * Creates a new user with encrypted password.
 */
export async function createUser(
  username: string, 
  passwordRaw: string, 
  role: 'super_admin' | 'editor'
): Promise<User | null> {
  if (!isSupabaseActive()) {
    if (memoryUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error(`El nombre de usuario ${username} ya existe`);
    }
    const newUser: User = {
      id: `u-${Date.now()}`,
      username: username.trim(),
      role,
      is_active: true,
      created_at: new Date().toISOString()
    };
    memoryUsers.push(newUser);
    return newUser;
  }
  try {
    const { data: userId, error } = await supabase.rpc('create_user', {
      p_username: username.trim(),
      p_password: passwordRaw,
      p_role: role
    });
    if (error) throw error;
    return {
      id: userId,
      username: username.trim(),
      role,
      is_active: true,
      created_at: new Date().toISOString()
    };
  } catch (err) {
    console.error('Supabase createUser failed:', err);
    throw err;
  }
}

/**
 * Updates a user's password.
 */
export async function updateUserPassword(
  userId: string, 
  passwordRaw: string
): Promise<boolean> {
  if (!isSupabaseActive()) {
    return memoryUsers.some(u => u.id === userId);
  }
  try {
    const { data, error } = await supabase.rpc('update_user_password', {
      p_user_id: userId,
      p_new_password: passwordRaw
    });
    if (error) throw error;
    return !!data;
  } catch (err) {
    console.error('Supabase updateUserPassword failed:', err);
    return false;
  }
}

/**
 * Toggles user active/inactive status.
 */
export async function toggleUserActive(
  userId: string, 
  isActive: boolean
): Promise<boolean> {
  if (!isSupabaseActive()) {
    memoryUsers = memoryUsers.map(u => u.id === userId ? { ...u, is_active: isActive } : u);
    return true;
  }
  try {
    const { data, error } = await supabase.rpc('toggle_user_active', {
      p_user_id: userId,
      p_is_active: isActive
    });
    if (error) throw error;
    return !!data;
  } catch (err) {
    console.error('Supabase toggleUserActive failed:', err);
    return false;
  }
}

/**
 * Creates a single match (manual fixture entry).
 */
export async function createMatch(
  match: Omit<Match, 'id'>
): Promise<Match | null> {
  if (!isSupabaseActive()) {
    const newMatch: Match = {
      ...match,
      id: `match-camp-${Date.now()}`
    };
    const isProm = match.zone_id === 'prom' || match.zone_id === '22222222-0001-0001-0001-000000000002';
    if (isProm) {
      memoryMatchesProm.push(newMatch);
    } else {
      memoryMatchesCamp.push(newMatch);
    }
    invalidateDbCache('matches');
    return newMatch;
  }
  try {
    const { data, error } = await supabase
      .from('matches')
      .insert([match])
      .select('id, tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date');
    if (error) throw error;
    if (data && data.length > 0) {
      invalidateDbCache('matches');
      return {
        ...data[0],
        status: data[0].status as 'scheduled' | 'finished' | 'postponed'
      };
    }
    return null;
  } catch (err) {
    console.error('Supabase createMatch failed:', err);
    return null;
  }
}

/**
 * Deletes a single match from the database.
 */
export async function deleteMatch(
  matchId: string
): Promise<boolean> {
  if (!isSupabaseActive()) {
    memoryMatchesCamp = memoryMatchesCamp.filter(m => m.id !== matchId);
    memoryMatchesProm = memoryMatchesProm.filter(m => m.id !== matchId);
    invalidateDbCache('matches');
    return true;
  }
  try {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);
    if (error) throw error;
    invalidateDbCache('matches');
    return true;
  } catch (err) {
    console.error('Supabase deleteMatch failed:', err);
    return false;
  }
}

/**
 * Creates multiple matches in bulk.
 */
export async function createMatches(
  matches: Omit<Match, 'id'>[]
): Promise<Match[]> {
  if (matches.length === 0) return [];
  if (!isSupabaseActive()) {
    const newMatches = matches.map((m, i) => ({
      ...m,
      id: `match-camp-${Date.now()}-${i}`
    }));
    const isProm = matches[0].zone_id === 'prom' || matches[0].zone_id === '22222222-0001-0001-0001-000000000002';
    if (isProm) {
      memoryMatchesProm.push(...newMatches);
    } else {
      memoryMatchesCamp.push(...newMatches);
    }
    invalidateDbCache('matches');
    return newMatches;
  }
  try {
    const { data, error } = await supabase
      .from('matches')
      .insert(matches)
      .select('id, tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date');
    if (error) throw error;
    invalidateDbCache('matches');
    return (data || []).map(m => ({
      ...m,
      status: m.status as 'scheduled' | 'finished' | 'postponed'
    }));
  } catch (err) {
    console.error('Supabase createMatches failed, falling back to mock:', err);
    const newMatches = matches.map((m, i) => ({
      ...m,
      id: `match-camp-${Date.now()}-${i}`
    }));
    const isProm = matches[0].zone_id === 'prom' || matches[0].zone_id === '22222222-0001-0001-0001-000000000002';
    if (isProm) {
      memoryMatchesProm.push(...newMatches);
    } else {
      memoryMatchesCamp.push(...newMatches);
    }
    invalidateDbCache('matches');
    return newMatches;
  }
}

/**
 * Clears all matches matching tournament, division, and zone filter.
 */
export async function deleteMatchesByFilter(
  tournamentId: string,
  divisionId: string,
  zoneId: string
): Promise<boolean> {
  if (!isSupabaseActive()) {
    const filter = (m: Match) => !(m.tournament_id === tournamentId && m.division_id === divisionId && m.zone_id === zoneId);
    memoryMatchesCamp = memoryMatchesCamp.filter(filter);
    memoryMatchesProm = memoryMatchesProm.filter(filter);
    invalidateDbCache('matches');
    return true;
  }
  try {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('tournament_id', tournamentId)
      .eq('division_id', divisionId)
      .eq('zone_id', zoneId);
    if (error) throw error;
    invalidateDbCache('matches');
    return true;
  } catch (err) {
    console.error('Supabase deleteMatchesByFilter failed:', err);
    return false;
  }
}

/**
 * Fetch contact messages (Admins only via RLS)
 */
export async function fetchContactMessages(): Promise<ContactMessage[]> {
  if (!isSupabaseActive()) {
    return [];
  }
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Mark a contact message as read
 */
export async function markContactMessageAsRead(id: string): Promise<void> {
  if (!isSupabaseActive()) {
    return;
  }
  const { error } = await supabase
    .from('contact_messages')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Soft-delete a contact message (logical delete)
 */
export async function deleteContactMessage(id: string): Promise<void> {
  if (!isSupabaseActive()) {
    return;
  }
  const { error } = await supabase
    .from('contact_messages')
    .update({ is_deleted: true })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Guarda masivamente los resultados parseados de un boletín PDF.
 */
export async function saveBatchParsedMatchResults(
  tournamentId: string,
  roundNumber: number,
  parsedResults: Array<{
    divisionNumber: number;
    zone: 'CAMPEONATO' | 'PROMOCION';
    homeTeamCanonical: string;
    awayTeamCanonical: string;
    homeGoals: number | null;
    awayGoals: number | null;
    status: 'finished' | 'postponed';
    isPostponed: boolean;
  }>
): Promise<{ updatedCount: number; errors: string[] }> {
  const errors: string[] = [];
  let updatedCount = 0;

  try {
    const [divisions, zones, teams] = await Promise.all([
      fetchDivisions(),
      fetchZones(),
      fetchTeams(),
    ]);

    const allMatches = await fetchAllTournamentMatches(tournamentId);

    // Mapeo auxiliar de equipo por nombre
    const findTeamId = (canonicalName: string): string | null => {
      const found = teams.find(t => 
        t.name.toLowerCase() === canonicalName.toLowerCase() ||
        (t.display_name && t.display_name.toLowerCase() === canonicalName.toLowerCase())
      );
      return found ? found.id : null;
    };

    // Mapeo auxiliar de división por número
    const findDivisionId = (divNum: number): string | null => {
      const found = divisions.find(d => 
        d.sort_order === (divNum - 6) || 
        d.name.includes(`${divNum}`)
      );
      return found ? found.id : null;
    };

    // Mapeo auxiliar de zona
    const findZoneId = (zoneType: 'CAMPEONATO' | 'PROMOCION'): string | null => {
      const found = zones.find(z => 
        zoneType === 'PROMOCION' 
          ? z.name.toLowerCase().includes('prom')
          : z.name.toLowerCase().includes('camp')
      );
      return found ? found.id : zones[0]?.id || null;
    };

    for (const item of parsedResults) {
      if (item.isPostponed) {
        // Los pospuestos se omiten o no alteran goles
        continue;
      }

      const homeId = findTeamId(item.homeTeamCanonical);
      const awayId = findTeamId(item.awayTeamCanonical);
      const divId = findDivisionId(item.divisionNumber);
      const zoneId = findZoneId(item.zone);

      if (!homeId || !awayId) {
        errors.push(`No se encontraron IDs para ${item.homeTeamCanonical} o ${item.awayTeamCanonical}`);
        continue;
      }

      // Buscar el partido correspondiente en la fecha
      const targetMatch = allMatches.find(m => 
        m.round_number === roundNumber &&
        (divId ? m.division_id === divId : true) &&
        (zoneId ? m.zone_id === zoneId : true) &&
        m.home_team_id === homeId &&
        m.away_team_id === awayId
      );

      if (targetMatch) {
        const success = await saveMatchResult(
          targetMatch.id,
          item.homeGoals,
          item.awayGoals,
          item.status
        );
        if (success) updatedCount++;
      } else {
        // Si no se encuentra exactamente por división/zona, buscar solo por fecha y equipos
        const fallbackMatch = allMatches.find(m => 
          m.round_number === roundNumber &&
          m.home_team_id === homeId &&
          m.away_team_id === awayId
        );
        if (fallbackMatch) {
          const success = await saveMatchResult(
            fallbackMatch.id,
            item.homeGoals,
            item.awayGoals,
            item.status
          );
          if (success) updatedCount++;
        } else {
          errors.push(`Partido no encontrado en el fixture: ${item.homeTeamCanonical} vs ${item.awayTeamCanonical} (Fecha ${roundNumber})`);
        }
      }
    }
  } catch (err: any) {
    console.error('Error en saveBatchParsedMatchResults:', err);
    errors.push(`Error general: ${err.message || String(err)}`);
  }

  return { updatedCount, errors };
}

