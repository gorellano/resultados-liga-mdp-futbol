// Configuración de divisiones con formato torneo (3 zonas + fase eliminatoria)
// vs divisiones con formato liga (Campeonato/Promoción)

export type DivisionFormat = 'liga' | 'torneo';

// Slugs de las divisiones que usan el formato torneo
export const TORNEO_DIVISION_SLUGS = [
  'primera-division',
  'quinta-division',
  'sexta-division',
] as const;

export type TorneoSlug = (typeof TORNEO_DIVISION_SLUGS)[number];

export interface TournamentDivisionConfig {
  displayName: string;
  matchTime: string;
  aperturaCampeon: string;
  copaName: string;
  /**
   * Nombres exactos de las zonas en la tabla `zones` de Supabase.
   * El índice 0 = Zona 1, 1 = Zona 2, 2 = Zona 3.
   */
  zoneNames: [string, string, string];
  /** Búsquedas por palabras clave para emparejar equipos de cada zona */
  zoneTeamKeywords: [string[], string[], string[]];
  /** True si la fase eliminatoria arranca con 16avos de final */
  hasRoundOf16: boolean;
  /** Nombre del partido final de temporada (Super Final / Final Anual) */
  finalName: string;
}

const ZONA1_PRIMERA_KEYWORDS = ['Quilmes', 'River', 'Argentinos', 'Alvarado', 'Independiente', 'Talleres', 'Veras', 'Libertad', 'Almagro'];
const ZONA1_QUINTA_KEYWORDS   = ['Quilmes', 'River', 'Argentinos', 'Alvarado', 'Independiente', 'Talleres', 'Veras', 'Libertad', 'Almagro', 'Banco'];
const ZONA1_SEXTA_KEYWORDS    = ['Quilmes', 'River', 'Argentinos', 'Alvarado', 'Independiente', 'Talleres', 'Veras', 'Libertad', 'Banco'];

const ZONA2_FULL_KEYWORDS     = ['Kimberley', 'San Isidro', 'Circulo', 'Cadetes', 'Racing', 'San Jos', 'Boca', 'Chapadmalal', 'Mitre', 'Union', 'Unión'];
const ZONA2_SEXTA_KEYWORDS    = ['Kimberley', 'San Isidro', 'Circulo', 'Cadetes', 'Racing', 'San Jos', 'Boca', 'Chapadmalal', 'Mitre'];

const ZONA3_KEYWORDS          = ['Mar del Plata', 'Deportivo Norte', 'Once Unidos', 'Banfield', 'cañon', 'canon', 'nacio', 'San Lorenzo', 'Colegiales', 'Urquiza'];

export const TOURNAMENT_DIVISION_CONFIGS: Record<TorneoSlug, TournamentDivisionConfig> = {
  'primera-division': {
    displayName: 'Primera División',
    matchTime: '15:30',
    aperturaCampeon: 'Quilmes',
    copaName: 'Copa "Carlos de los Reyes"',
    zoneNames: ['Zona 1 - Primera', 'Zona 2 - Primera', 'Zona 3 - Primera'],
    zoneTeamKeywords: [ZONA1_PRIMERA_KEYWORDS, ZONA2_FULL_KEYWORDS, ZONA3_KEYWORDS],
    hasRoundOf16: true,
    finalName: 'Super Final 2026',
  },
  'quinta-division': {
    displayName: 'Quinta División',
    matchTime: '13:30',
    aperturaCampeon: 'Once Unidos',
    copaName: 'Copa "Carlos de los Reyes"',
    zoneNames: ['Zona 1 - Quinta', 'Zona 2 - Quinta', 'Zona 3 - Quinta'],
    zoneTeamKeywords: [ZONA1_QUINTA_KEYWORDS, ZONA2_FULL_KEYWORDS, ZONA3_KEYWORDS],
    hasRoundOf16: false,
    finalName: 'Final Anual 2026',
  },
  'sexta-division': {
    displayName: 'Sexta División',
    matchTime: '12:00',
    aperturaCampeon: 'Kimberley',
    copaName: 'Copa "Carlos de los Reyes"',
    zoneNames: ['Zona 1 - Sexta', 'Zona 2 - Sexta', 'Zona 3 - Sexta'],
    zoneTeamKeywords: [ZONA1_SEXTA_KEYWORDS, ZONA2_SEXTA_KEYWORDS, ZONA3_KEYWORDS],
    hasRoundOf16: true,
    finalName: 'Final Anual 2026',
  },
};

/**
 * Convierte un nombre o slug de división a slug normalizado
 * para comparación con TORNEO_DIVISION_SLUGS.
 */
function toSlug(slugOrName: string): string {
  return slugOrName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** Devuelve true si la división usa formato torneo (3 zonas + KO) */
export function isTournamentDivision(slugOrName: string): boolean {
  return (TORNEO_DIVISION_SLUGS as readonly string[]).includes(toSlug(slugOrName));
}

/** Devuelve la configuración de una división torneo, o null si es formato liga */
export function getTournamentConfig(slugOrName: string): TournamentDivisionConfig | null {
  return TOURNAMENT_DIVISION_CONFIGS[toSlug(slugOrName) as TorneoSlug] ?? null;
}

/** Etiquetas cortas para las zonas en la UI (Zona 1, Zona 2, Zona 3) */
export const ZONE_LABELS = ['Zona 1', 'Zona 2', 'Zona 3'] as const;
export type ZoneIndex = 0 | 1 | 2;
export type ZoneTab = ZoneIndex | 3; // 3 = Tabla General
