import { supabase } from './supabase';
import type { Team, Match, Tournament, Division, Zone, User, ContactMessage } from './types';
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

// In-memory copies of users
let memoryUsers: User[] = [
  { id: 'u1', username: 'superadmin', role: 'super_admin', is_active: true, created_at: new Date().toISOString() },
  { id: 'u2', username: 'editor',     role: 'editor',      is_active: true, created_at: new Date().toISOString() },
];

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
      .select('id, name, display_name, logo_url');

    if (error) throw error;
    // Map team display names based on exact matches for visual presentation fallback
    const DISPLAY_NAMES: Record<string, string> = {
      "Talleres de Mar del Plata":            "Talleres",
      "Club Banco Provincia de Mar del Plata": "Banco Provincia",
      "Club Social y Deportivo Chapadmalal":   "Chapadmalal",
      "El cañon":                             "El Cañón",
    };
    return (data || []).map(t => ({
      ...t,
      display_name: t.display_name || DISPLAY_NAMES[t.name]
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
 * Fetches matches for a given tournament and division
 */
export async function fetchTournamentDivisionMatches(tournamentId: string, divisionId: string): Promise<Match[]> {
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
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('id, tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date')
      .eq('tournament_id', tournamentId)
      .eq('division_id', divisionId);

    if (error) throw error;
    return (data || []).map(m => ({
      ...m,
      status: m.status as 'scheduled' | 'finished' | 'postponed'
    }));
  } catch (err) {
    console.warn('Supabase fetchTournamentDivisionMatches failed:', err);
    return [];
  }
}

/**
 * Saves a match score and status
 */
export async function saveMatchResult(
  matchId: string, 
  homeGoals: number | null, 
  awayGoals: number | null,
  status: 'scheduled' | 'finished',
  matchDate?: string | null
): Promise<boolean> {
  if (!isSupabaseActive()) {
    // Update local session memory
    const updateMatch = (m: Match) => {
      if (m.id === matchId) {
        return { 
          ...m, 
          home_goals: homeGoals, 
          away_goals: awayGoals, 
          status,
          ...(matchDate !== undefined ? { match_date: matchDate } : {})
        };
      }
      return m;
    };
    memoryMatchesCamp = memoryMatchesCamp.map(updateMatch);
    memoryMatchesProm = memoryMatchesProm.map(updateMatch);
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

    const { error } = await supabase
      .from('matches')
      .update(updateFields)
      .eq('id', matchId);

    if (error) throw error;
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
    return newTeam;
  }
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert([{ name: name.trim(), display_name: displayName?.trim() || null, logo_url: logoUrl }])
      .select('id, name, display_name, logo_url');
    if (error) throw error;
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
    return newTourn;
  }
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .insert([{ name: name.trim(), year }])
      .select('id, name, year');
    if (error) throw error;
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
    return newMatch;
  }
  try {
    const { data, error } = await supabase
      .from('matches')
      .insert([match])
      .select('id, tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date');
    if (error) throw error;
    if (data && data.length > 0) {
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
    return true;
  }
  try {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);
    if (error) throw error;
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
    return newMatches;
  }
  try {
    const { data, error } = await supabase
      .from('matches')
      .insert(matches)
      .select('id, tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date');
    if (error) throw error;
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
