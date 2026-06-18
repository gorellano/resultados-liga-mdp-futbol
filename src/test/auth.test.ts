import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveAuth, loadAuth, clearAuth,
  recordFailedAttempt, resetRateLimit, isLockedOut, getRateLimitState,
  sanitizeText, sanitizeGoal, getCategoryYear,
  type AuthUser,
} from '../lib/auth';

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

// ─── Auth token ──────────────────────────────────────────────────────────────
describe('Auth token', () => {
  const user: AuthUser = { email: 'superadmin@ligamdp.com', role: 'super_admin' };

  it('saves and loads auth correctly', () => {
    saveAuth(user);
    const loaded = loadAuth();
    expect(loaded).toEqual(user);
  });

  it('returns null when nothing is stored', () => {
    expect(loadAuth()).toBeNull();
  });

  it('returns null and clears storage when token is tampered', () => {
    saveAuth(user);
    // Tamper: overwrite with bad signature
    localStorage.setItem('admin_auth', JSON.stringify({ payload: JSON.stringify(user), sig: 'bad-sig' }));
    expect(loadAuth()).toBeNull();
    expect(localStorage.getItem('admin_auth')).toBeNull();
  });

  it('clearAuth removes the stored token', () => {
    saveAuth(user);
    clearAuth();
    expect(loadAuth()).toBeNull();
  });
});

// ─── Rate limiting ───────────────────────────────────────────────────────────
describe('Rate limiting', () => {
  it('starts with 0 attempts', () => {
    const state = getRateLimitState();
    expect(state.attempts).toBe(0);
    expect(state.lockedUntil).toBeNull();
  });

  it('increments attempts on each failure', () => {
    recordFailedAttempt();
    recordFailedAttempt();
    expect(getRateLimitState().attempts).toBe(2);
  });

  it('locks out after 5 attempts', () => {
    for (let i = 0; i < 5; i++) recordFailedAttempt();
    const { locked } = isLockedOut();
    expect(locked).toBe(true);
  });

  it('isLockedOut returns secondsLeft > 0 when locked', () => {
    for (let i = 0; i < 5; i++) recordFailedAttempt();
    const { secondsLeft } = isLockedOut();
    expect(secondsLeft).toBeGreaterThan(0);
    expect(secondsLeft).toBeLessThanOrEqual(30);
  });

  it('resetRateLimit clears state', () => {
    recordFailedAttempt();
    resetRateLimit();
    expect(getRateLimitState().attempts).toBe(0);
  });

  it('is not locked before 5 attempts', () => {
    for (let i = 0; i < 4; i++) recordFailedAttempt();
    expect(isLockedOut().locked).toBe(false);
  });
});

// ─── Input sanitization ──────────────────────────────────────────────────────
describe('sanitizeText', () => {
  it('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('removes < > " and single-quotes', () => {
    expect(sanitizeText('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script');
  });

  it('leaves normal text untouched', () => {
    expect(sanitizeText('Talleres de Mar del Plata')).toBe('Talleres de Mar del Plata');
  });
});

describe('sanitizeGoal', () => {
  it('accepts valid integer 0–99', () => {
    expect(sanitizeGoal(0)).toBe(0);
    expect(sanitizeGoal(3)).toBe(3);
    expect(sanitizeGoal(99)).toBe(99);
    expect(sanitizeGoal('4')).toBe(4);
  });

  it('rejects negative numbers', () => {
    expect(sanitizeGoal(-1)).toBeNull();
  });

  it('rejects numbers above 99', () => {
    expect(sanitizeGoal(100)).toBeNull();
  });

  it('rejects decimals', () => {
    expect(sanitizeGoal(2.5)).toBeNull();
  });

  it('rejects non-numeric strings', () => {
    expect(sanitizeGoal('abc')).toBeNull();
  });

  it('rejects empty string', () => {
    expect(sanitizeGoal('')).toBeNull();
  });
});

// ─── getCategoryYear ─────────────────────────────────────────────────────────
describe('getCategoryYear', () => {
  it('calculates correctly for 15ta División with 2026', () => {
    expect(getCategoryYear('15ta División', 2026)).toBe(2018); // 15 + 2026 - 23 = 2018
  });

  it('calculates correctly for 7ma División with 2026', () => {
    expect(getCategoryYear('7ma División', 2026)).toBe(2010); // 7 + 2026 - 23 = 2010
  });

  it('calculates correctly for 16ta División with 2026', () => {
    expect(getCategoryYear('16ta División', 2026)).toBe(2019); // 16 + 2026 - 23 = 2019
  });

  it('adjusts when year changes', () => {
    expect(getCategoryYear('15ta División', 2025)).toBe(2017); // 15 + 2025 - 23 = 2017
  });

  it('returns 0 for unknown division name format', () => {
    expect(getCategoryYear('División Desconocida', 2026)).toBe(0);
  });
});
