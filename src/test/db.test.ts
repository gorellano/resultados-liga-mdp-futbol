import { describe, it, expect, beforeEach } from 'vitest';
import { 
  isSupabaseActive, 
  fetchTournaments, 
  fetchDivisions, 
  fetchZones, 
  fetchTeams, 
  fetchMatches, 
  saveMatchResult, 
  authenticateUser,
  fetchUsers,
  createUser,
  updateUserPassword,
  toggleUserActive
} from '../lib/db';

// ─── Mock localStorage ───────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem:    (key: string) => store[key] ?? null,
    setItem:    (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear:      () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

beforeEach(() => localStorageMock.clear());

describe('db.ts - Hibrido de Base de Datos y Mocks', () => {
  
  it('debe detectar que Supabase no esta configurado en testing', () => {
    expect(isSupabaseActive()).toBe(false);
  });

  it('debe obtener torneos de fallback', async () => {
    const data = await fetchTournaments();
    expect(data).toBeDefined();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].name).toBe('Anual');
  });

  it('debe obtener divisiones de fallback con sort_order correcto', async () => {
    const data = await fetchDivisions();
    expect(data).toBeDefined();
    expect(data.length).toBe(10); // 7ma a 16ta
    expect(data[0].name).toBe('7ma División');
    expect(data[9].name).toBe('16ta División');
  });

  it('debe obtener zonas de fallback', async () => {
    const data = await fetchZones();
    expect(data).toBeDefined();
    expect(data.length).toBe(2);
    expect(data[0].name).toBe('Campeonato');
    expect(data[1].name).toBe('Promoción');
  });

  it('debe obtener equipos de campeonato y promocion combinados', async () => {
    const data = await fetchTeams();
    expect(data).toBeDefined();
    expect(data.length).toBe(28); // 14 camp + 14 prom
  });

  it('debe obtener partidos mock filtrados por torneo', async () => {
    // Zona campeonato = 22222222-0001-0001-0001-000000000001
    const matchesCamp = await fetchMatches('d1', '22222222-0001-0001-0001-000000000001', 't1');
    expect(matchesCamp).toBeDefined();
    expect(matchesCamp.length).toBe(91); // 13 fechas x 7 partidos
  });

  it('debe permitir guardar resultado interactivo local en memoria', async () => {
    const matches = await fetchMatches('d1', '22222222-0001-0001-0001-000000000001', 't1');
    const firstMatch = matches[0];
    
    // Guardar resultado: 3-1 finalizado
    const success = await saveMatchResult(firstMatch.id, 3, 1, 'finished');
    expect(success).toBe(true);

    // Volver a obtener y validar persistencia en sesion
    const updatedMatches = await fetchMatches('d1', '22222222-0001-0001-0001-000000000001', 't1');
    const reloadedMatch = updatedMatches.find(m => m.id === firstMatch.id);
    expect(reloadedMatch).toBeDefined();
    expect(reloadedMatch?.home_goals).toBe(3);
    expect(reloadedMatch?.away_goals).toBe(1);
    expect(reloadedMatch?.status).toBe('finished');

    // Limpiar para otros tests
    await saveMatchResult(firstMatch.id, null, null, 'scheduled');
  });

  it('debe permitir autenticar superadmin local en fallback', async () => {
    const user = await authenticateUser('superadmin', 'SuperSecret123!');
    expect(user).not.toBeNull();
    expect(user?.role).toBe('super_admin');
  });

  it('debe retornar null ante credenciales invalidas', async () => {
    const user = await authenticateUser('superadmin', 'WrongPass!');
    expect(user).toBeNull();
  });

  it('debe permitir gestionar usuarios localmente en mock fallback', async () => {
    // 1. Obtener usuarios iniciales
    const initialUsers = await fetchUsers();
    expect(initialUsers.length).toBe(2);

    // 2. Crear un nuevo usuario editor
    const newUser = await createUser('test_editor', 'NewPass123!', 'editor');
    expect(newUser).not.toBeNull();
    expect(newUser?.username).toBe('test_editor');
    expect(newUser?.role).toBe('editor');

    // 3. Validar que se liste
    const usersList = await fetchUsers();
    expect(usersList.length).toBe(3);
    expect(usersList.some(u => u.username === 'test_editor')).toBe(true);

    // 4. Cambiar password
    const passChanged = await updateUserPassword(newUser!.id, 'AnotherPass123!');
    expect(passChanged).toBe(true);

    // 5. Desactivar usuario
    const toggled = await toggleUserActive(newUser!.id, false);
    expect(toggled).toBe(true);
    
    const updatedUsers = await fetchUsers();
    const checkedUser = updatedUsers.find(u => u.id === newUser!.id);
    expect(checkedUser?.is_active).toBe(false);
  });
});
