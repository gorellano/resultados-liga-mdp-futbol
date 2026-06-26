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
  username: string;
  role: 'super_admin' | 'editor';
}

export function validatePassword(password: string): string | null {
  if (password.length < 6 || password.length > 20) {
    return "La contraseña debe tener entre 6 y 20 caracteres.";
  }
  if (!/[A-Z]/.test(password)) {
    return "La contraseña debe contener al menos una letra mayúscula.";
  }
  if (!/[a-z]/.test(password)) {
    return "La contraseña debe contener al menos una letra minúscula.";
  }
  if (!/[0-9]/.test(password)) {
    return "La contraseña debe contener al menos un número.";
  }
  // Allow special characters: . , * ! @ # $ % ^ & ( ) _ + - = { } [ ] : ; " ' < >
  if (!/[.,*!@#$%^&()_+\-={}\[\]:;"'<>]/.test(password)) {
    return "La contraseña debe contener al menos un carácter especial (ej. .,*!).";
  }
  return null;
}

export function saveAuth(user: AuthUser): void {
  const payload = JSON.stringify(user);
  const sig = simpleHash(payload + TOKEN_SECRET);
  sessionStorage.setItem(AUTH_KEY, JSON.stringify({ payload, sig }));
}

export function loadAuth(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const { payload, sig } = JSON.parse(raw);
    if (simpleHash(payload + TOKEN_SECRET) !== sig) {
      // Token tampered — clear and reject
      sessionStorage.removeItem(AUTH_KEY);
      return null;
    }
    return JSON.parse(payload) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  sessionStorage.removeItem(AUTH_KEY);
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

export function getCategoryYear(divisionName: string, tournamentYear: number): number | null {
  if (!divisionName) return null;
  const map: Record<string, number> = {
    '1ra': 1, 'primera': 1,
    '5ta': 5, 'quinta': 5,
    '6ta': 6, 'sexta': 6,
    '7ma': 7, 'séptima': 7, 'septima': 7,
    '8va': 8, 'octava': 8,
    '9na': 9, 'novena': 9,
    '10ma': 10, 'décima': 10, 'decima': 10,
    '11ma': 11, 'undécima': 11, 'undecima': 11,
    '12ma': 12, 'duodécima': 12, 'duodecima': 12,
    '13ra': 13, 'decimotercera': 13,
    '14ta': 14, 'decimocuarta': 14,
    '15ta': 15, 'decimoquinta': 15,
    '16ta': 16, 'decimosexta': 16,
  };
  
  const lowerName = divisionName.toLowerCase();
  const cleanName = lowerName.replace(' división', '').replace(' division', '').trim();
  let divNumber = 0;

  for (const [key, val] of Object.entries(map)) {
    if (cleanName === key || lowerName.startsWith(key + ' ') || lowerName === key) {
      divNumber = val;
    }
  }

  if (divNumber === 0) {
    const match = divisionName.match(/(\d+)/);
    if (match) divNumber = parseInt(match[1]);
  }

  if (divNumber === 0 || divNumber === 1 || divNumber === 5 || divNumber === 6) return null;
  
  return divNumber + tournamentYear - 23;
}
