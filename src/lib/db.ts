import { supabase } from './supabase';
import type { Team, Match, Tournament, Division, Zone } from './types';
import { 
  MOCK_TEAMS_CAMPEONATO, 
  MOCK_TEAMS_PROMOCION, 
  MOCK_MATCHES_CAMPEONATO, 
  MOCK_MATCHES_PROMOCION, 
  MOCK_TOURNAMENTS 
} from './mockData';
import { saveAuth } from './auth';

// In-memory copies of mock matches to persist edits during the mock session
let memoryMatchesCamp = [...MOCK_MATCHES_CAMPEONATO];
let memoryMatchesProm = [...MOCK_MATCHES_PROMOCION];

/**
 * Checks if Supabase has been configured with real, non-placeholder credentials
 */
export function isSupabaseActive(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && url !== 'https://placeholder.supabase.co' && key && key !== 'placeholder');
}

/**
 * Fetches all tournaments from Supabase (or fallback MOCK_TOURNAMENTS)
 */
export async function fetchTournaments(): Promise<Tournament[]> {
  if (!isSupabaseActive()) {
    return MOCK_TOURNAMENTS;
  }
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('id, name, year')
      .order('year', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Supabase fetchTournaments failed, falling back to mocks:', err);
    return MOCK_TOURNAMENTS;
  }
}

/**
 * Fetches all divisions (or fallback mocks)
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
  ];

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
    return data || [];
  } catch (err) {
    console.warn('Supabase fetchDivisions failed, falling back to mocks:', err);
    return mockDivisions;
  }
}

/**
 * Fetches zones (or fallback mocks)
 */
export async function fetchZones(): Promise<Zone[]> {
  const mockZones: Zone[] = [
    { id: '22222222-0001-0001-0001-000000000001', name: 'Campeonato' },
    { id: '22222222-0001-0001-0001-000000000002', name: 'Promoción' },
  ];

  if (!isSupabaseActive()) {
    return mockZones;
  }
  try {
    const { data, error } = await supabase
      .from('zones')
      .select('id, name');

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Supabase fetchZones failed, falling back to mocks:', err);
    return mockZones;
  }
}

/**
 * Fetches all teams (or fallback mocks)
 */
export async function fetchTeams(): Promise<Team[]> {
  const mockTeams = [...MOCK_TEAMS_CAMPEONATO, ...MOCK_TEAMS_PROMOCION];

  if (!isSupabaseActive()) {
    return mockTeams;
  }
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, logo_url');

    if (error) throw error;
    // Map team display names based on exact matches for visual presentation
    const DISPLAY_NAMES: Record<string, string> = {
      "Talleres de Mar del Plata":            "Talleres",
      "Club Banco Provincia de Mar del Plata": "Banco Provincia",
      "Club Social y Deportivo Chapadmalal":   "Chapadmalal",
      "El cañon":                             "El Cañón",
    };
    return (data || []).map(t => ({
      ...t,
      display_name: DISPLAY_NAMES[t.name]
    }));
  } catch (err) {
    console.warn('Supabase fetchTeams failed, falling back to mocks:', err);
    return mockTeams;
  }
}

/**
 * Fetches matches filtered by division, zone, and tournament.
 */
export async function fetchMatches(
  divisionId: string, 
  zoneId: string, 
  tournamentId: string
): Promise<Match[]> {
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
    return (data || []).map(m => ({
      ...m,
      status: m.status as 'scheduled' | 'finished' | 'postponed'
    }));
  } catch (err) {
    console.warn('Supabase fetchMatches failed, falling back to mocks:', err);
    const isProm = zoneId === 'prom' || zoneId === '22222222-0001-0001-0001-000000000002';
    const source = isProm ? memoryMatchesProm : memoryMatchesCamp;
    return source
      .filter(m => m.tournament_id === tournamentId)
      .map(m => ({ ...m, division_id: divisionId, zone_id: zoneId }));
  }
}

/**
 * Fetches all matches for a given tournament (across all divisions/zones)
 */
export async function fetchAllTournamentMatches(tournamentId: string): Promise<Match[]> {
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
    const { data, error } = await supabase
      .from('matches')
      .select('id, tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date')
      .eq('tournament_id', tournamentId);

    if (error) throw error;
    return (data || []).map(m => ({
      ...m,
      status: m.status as 'scheduled' | 'finished' | 'postponed'
    }));
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
}

/**
 * Saves a match score and status
 */
export async function saveMatchResult(
  matchId: string, 
  homeGoals: number | null, 
  awayGoals: number | null,
  status: 'scheduled' | 'finished'
): Promise<boolean> {
  if (!isSupabaseActive()) {
    // Update local session memory
    const updateMatch = (m: Match) => {
      if (m.id === matchId) {
        return { ...m, home_goals: homeGoals, away_goals: awayGoals, status };
      }
      return m;
    };
    memoryMatchesCamp = memoryMatchesCamp.map(updateMatch);
    memoryMatchesProm = memoryMatchesProm.map(updateMatch);
    return true;
  }
  try {
    const { error } = await supabase
      .from('matches')
      .update({ 
        home_goals: homeGoals, 
        away_goals: awayGoals, 
        status 
      })
      .eq('id', matchId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase saveMatchResult failed:', err);
    return false;
  }
}

/**
 * Authenticates an administrator via Supabase Auth or mock local fallback.
 */
export async function authenticateUser(
  email: string, 
  password: string
): Promise<{ email: string; role: 'super_admin' | 'editor' } | null> {
  if (!isSupabaseActive()) {
    // Local mock login credentials
    const credentials = [
      { email: 'superadmin@ligamdp.com', password: 'supersecret123', role: 'super_admin' as const },
      { email: 'editor@ligamdp.com',     password: 'editor123',       role: 'editor'      as const },
    ];
    const found = credentials.find(c => c.email === email.trim().toLowerCase() && c.password === password);
    if (found) {
      saveAuth({ email: found.email, role: found.role });
      return { email: found.email, role: found.role };
    }
    return null;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      // For real Supabase, users are either super_admin or editor based on metadata, default to editor
      const role: 'super_admin' | 'editor' = (data.user.user_metadata?.role === 'super_admin') ? 'super_admin' : 'editor';
      const authData = { email: data.user.email || email, role };
      saveAuth(authData);
      return authData;
    }
    return null;
  } catch (err) {
    console.warn('Supabase authentication failed, trying mock fallback:', err);
    // If Supabase Auth fails due to network/no-user, fallback to mock credentials
    const credentials = [
      { email: 'superadmin@ligamdp.com', password: 'supersecret123', role: 'super_admin' as const },
      { email: 'editor@ligamdp.com',     password: 'editor123',       role: 'editor'      as const },
    ];
    const found = credentials.find(c => c.email === email.trim().toLowerCase() && c.password === password);
    if (found) {
      saveAuth({ email: found.email, role: found.role });
      return { email: found.email, role: found.role };
    }
    return null;
  }
}
