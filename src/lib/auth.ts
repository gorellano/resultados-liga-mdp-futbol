// ─── Auth utilities ────────────────────────────────────────────────────────────

const AUTH_KEY = 'admin_auth';
const RATE_LIMIT_KEY = 'admin_rate_limit';
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

// Simple hash to make token harder to forge from DevTools
function simpleHash(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16);
}

const TOKEN_SECRET = 'lmf-2026-static-secret';

export interface AuthUser {
  email: string;
  role: 'super_admin' | 'editor';
}

export function saveAuth(user: AuthUser): void {
  const payload = JSON.stringify(user);
  const sig = simpleHash(payload + TOKEN_SECRET);
  localStorage.setItem(AUTH_KEY, JSON.stringify({ payload, sig }));
}

export function loadAuth(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const { payload, sig } = JSON.parse(raw);
    if (simpleHash(payload + TOKEN_SECRET) !== sig) {
      // Token tampered — clear and reject
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    return JSON.parse(payload) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}

// ─── Rate Limiting ──────────────────────────────────────────────────────────

interface RateLimitState {
  attempts: number;
  lockedUntil: number | null;
}

export function getRateLimitState(): RateLimitState {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return { attempts: 0, lockedUntil: null };
    return JSON.parse(raw);
  } catch {
    return { attempts: 0, lockedUntil: null };
  }
}

export function recordFailedAttempt(): RateLimitState {
  const state = getRateLimitState();
  const newAttempts = state.attempts + 1;
  const newState: RateLimitState = {
    attempts: newAttempts,
    lockedUntil: newAttempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_SECONDS * 1000 : null,
  };
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newState));
  return newState;
}

export function resetRateLimit(): void {
  localStorage.removeItem(RATE_LIMIT_KEY);
}

export function isLockedOut(): { locked: boolean; secondsLeft: number } {
  const state = getRateLimitState();
  if (state.lockedUntil && Date.now() < state.lockedUntil) {
    return { locked: true, secondsLeft: Math.ceil((state.lockedUntil - Date.now()) / 1000) };
  }
  if (state.lockedUntil && Date.now() >= state.lockedUntil) {
    resetRateLimit(); // Auto-reset after lockout expires
  }
  return { locked: false, secondsLeft: 0 };
}

// ─── Input Sanitization ─────────────────────────────────────────────────────

export function sanitizeText(value: string): string {
  return value.trim().replace(/[<>"']/g, '');
}

export function sanitizeGoal(value: string | number): number | null {
  if (typeof value === 'string' && value.trim() === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 99 || !Number.isInteger(n)) return null;
  return n;
}

export function getCategoryYear(divisionName: string, tournamentYear: number): number {
  const match = divisionName.match(/(\d+)/);
  if (!match) return 0;
  return parseInt(match[1]) + tournamentYear - 23;
}
