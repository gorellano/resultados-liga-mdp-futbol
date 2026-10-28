import type { Tournament, Zone, Team, Match, Division } from './types';
import { MOCK_TEAMS_CAMPEONATO, MOCK_TEAMS_PROMOCION } from './mockData';

export const ADARO_TOURNAMENT_ID = 'adaro-2026';

export const ADARO_TOURNAMENT: Tournament = {
  id: ADARO_TOURNAMENT_ID,
  name: 'Torneo Armando "Chamaco" Adaro',
  year: 2026,
  is_current: true,
  format: 'copas_multinivel',
};

// ─── 7 Zonas Oficiales ────────────────────────────────────────────────────────
export const ADARO_ZONES: Zone[] = [
  { id: 'adaro-zone-a', name: 'Zona A' },
  { id: 'adaro-zone-b', name: 'Zona B' },
  { id: 'adaro-zone-c', name: 'Zona C' },
  { id: 'adaro-zone-d', name: 'Zona D' },
  { id: 'adaro-zone-e', name: 'Zona E' },
  { id: 'adaro-zone-f', name: 'Zona F' },
  { id: 'adaro-zone-g', name: 'Zona G' },
];

// Helper: Buscar equipo por coincidencia de nombre en un listado
export function findTeamInList(teams: Team[], keyword: string): Team | undefined {
  if (!keyword || !keyword.trim()) return undefined;
  const normKey = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // 1. Coincidencia exacta
  const exact = teams.find(t => {
    const tName = t.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const dName = (t.display_name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    return tName === normKey || (dName !== '' && dName === normKey);
  });
  if (exact) return exact;

  // 2. Coincidencia por inclusión (tName incluye keyword o dName incluye keyword)
  const inclusion = teams.find(t => {
    const tName = t.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const dName = (t.display_name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (tName.includes(normKey)) return true;
    if (dName !== '' && dName.includes(normKey)) return true;
    if (normKey.length >= 4 && tName.length >= 4 && normKey.includes(tName)) return true;
    if (dName !== '' && dName.length >= 3 && normKey.includes(dName)) return true;
    return false;
  });
  return inclusion;
}

export const ALL_MOCK_TEAMS: Team[] = [...MOCK_TEAMS_CAMPEONATO, ...MOCK_TEAMS_PROMOCION];

export function findTeamId(keyword: string, pool: Team[] = ALL_MOCK_TEAMS): string {
  const found = findTeamInList(pool, keyword);
  if (found) return found.id;
  // Fallback con mock teams si el pool provisto no lo tiene
  const fallback = findTeamInList(ALL_MOCK_TEAMS, keyword);
  return fallback ? fallback.id : '';
}

// ─── Nombres canónicos de los 4 clubes por Zona según Reglamento Oficial (Págs 1 y 2) ───
export const ADARO_ZONE_TEAM_NAMES: Record<string, string[]> = {
  'adaro-zone-a': ['Aldosivi', 'Argentinos del Sud', 'Libertad', 'San Lorenzo'],
  'adaro-zone-b': ['Kimberley', 'Talleres', 'Boca Juniors', 'Chapadmalal'],
  'adaro-zone-c': ['San Isidro', 'Alvarado', 'Atlético Mar del Plata', 'Al Ver Veras'],
  'adaro-zone-d': ['Quilmes', 'Independiente', 'El cañon', 'Racing'],
  'adaro-zone-e': ['Nacion', 'Deportivo Norte', 'Almagro', 'Circulo'],
  'adaro-zone-f': ['River Plate', 'Colegiales', 'San José', 'Cadetes'],
  'adaro-zone-g': ['Banfield', 'Once Unidos', 'General Urquiza', 'Banco Provincia'],
};

/**
 * Obtiene los 4 clubes de una zona con sus objetos Team completos (logos, display_name, id)
 * garantizando compatibilidad tanto con Supabase como con datos en memoria.
 */
export function getAdaroZoneClubs(zoneId: string, availableTeams: Team[] = []): Team[] {
  const names = ADARO_ZONE_TEAM_NAMES[zoneId] || [];
  const searchPool = availableTeams.length > 0 ? [...availableTeams, ...ALL_MOCK_TEAMS] : ALL_MOCK_TEAMS;

  return names.map(name => {
    const found = findTeamInList(searchPool, name);
    if (found) return found;

    return {
      id: `fallback-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      display_name: name,
      logo_url: null,
    };
  });
}

// Mapa de IDs por zona (retrocompatible con IDs de mock)
export const ADARO_ZONE_TEAMS_MAP: Record<string, string[]> = {
  'adaro-zone-a': ADARO_ZONE_TEAM_NAMES['adaro-zone-a'].map(n => findTeamId(n)),
  'adaro-zone-b': ADARO_ZONE_TEAM_NAMES['adaro-zone-b'].map(n => findTeamId(n)),
  'adaro-zone-c': ADARO_ZONE_TEAM_NAMES['adaro-zone-c'].map(n => findTeamId(n)),
  'adaro-zone-d': ADARO_ZONE_TEAM_NAMES['adaro-zone-d'].map(n => findTeamId(n)),
  'adaro-zone-e': ADARO_ZONE_TEAM_NAMES['adaro-zone-e'].map(n => findTeamId(n)),
  'adaro-zone-f': ADARO_ZONE_TEAM_NAMES['adaro-zone-f'].map(n => findTeamId(n)),
  'adaro-zone-g': ADARO_ZONE_TEAM_NAMES['adaro-zone-g'].map(n => findTeamId(n)),
};

// ─── Divisiones Puntuables (7ma a 14ta inclusive) ─────────────────────────────
export const ADARO_PUNTUABLE_DIVISION_IDS = [
  '11111111-0001-0001-0001-000000000001', // 7ma (2010)
  '11111111-0001-0001-0001-000000000002', // 8va (2011)
  '11111111-0001-0001-0001-000000000003', // 9na (2012)
  '11111111-0001-0001-0001-000000000004', // 10ma (2013)
  '11111111-0001-0001-0001-000000000005', // 11ma (2014)
  '11111111-0001-0001-0001-000000000006', // 12ma (2015)
  '11111111-0001-0001-0001-000000000007', // 13ra (2016)
  '11111111-0001-0001-0001-000000000008', // 14ta (2017)
];

// ─── Divisiones Formativas / Pre-Décimas (2018, 2019, 2020 - No suman puntos a la tira) ──
export const ADARO_FORMATIVE_DIVISION_IDS = [
  '11111111-0001-0001-0001-000000000009', // 15ta (2018 - Decimo Quinta)
  '11111111-0001-0001-0001-000000000010', // 16ta (2019 - Decimo Sexta)
  '11111111-0001-0001-0001-000000000011', // 17ma (2020 - Decimo Septima)
];

export const ADARO_ALL_DIVISION_IDS = [
  ...ADARO_PUNTUABLE_DIVISION_IDS,
  ...ADARO_FORMATIVE_DIVISION_IDS,
];

export function isAdaroPuntuableDivision(div: { id: string; name: string }): boolean {
  if (ADARO_PUNTUABLE_DIVISION_IDS.includes(div.id)) return true;
  if (div.id && ADARO_FORMATIVE_DIVISION_IDS.includes(div.id)) return false;

  const nameNorm = div.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // Si es 15ª, 16ª o 17ª, o formativa, NO es puntuable
  if (
    nameNorm.includes('15') || 
    nameNorm.includes('16') || 
    nameNorm.includes('17') ||
    nameNorm.includes('decimoquinta') ||
    nameNorm.includes('decima quinta') ||
    nameNorm.includes('decimosexta') ||
    nameNorm.includes('decima sexta') ||
    nameNorm.includes('decimoseptima') ||
    nameNorm.includes('decima septima') ||
    nameNorm.includes('formativa') ||
    nameNorm.includes('promocional')
  ) {
    return false;
  }

  // Verificar que sea 7ma, 8va, 9na, 10ma, 11ma, 12ma, 13ra o 14ta
  if (nameNorm.includes('7') || nameNorm.includes('septima')) return true;
  if (nameNorm.includes('8') || nameNorm.includes('octava')) return true;
  if (nameNorm.includes('9') || nameNorm.includes('novena')) return true;
  if (nameNorm.includes('10') || (nameNorm.includes('decima') && !nameNorm.includes('undecima') && !nameNorm.includes('duodecima') && !nameNorm.includes('decimotercera') && !nameNorm.includes('decimocuarta'))) return true;
  if (nameNorm.includes('11') || nameNorm.includes('undecima')) return true;
  if (nameNorm.includes('12') || nameNorm.includes('duodecima')) return true;
  if (nameNorm.includes('13') || nameNorm.includes('decimotercera')) return true;
  if (nameNorm.includes('14') || nameNorm.includes('decimocuarta')) return true;

  return false;
}

export function isAdaroParticipativeDivision(div: { id?: string; name: string }): boolean {
  if (div.id && ADARO_FORMATIVE_DIVISION_IDS.includes(div.id)) return true;
  const nameNorm = div.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  // Excluir terminantemente Primera, Quinta, Sexta
  if (/\bprimera\b/.test(nameNorm) || /^1(ra|era|ª|º|°)?(\s+division)?$/i.test(nameNorm)) return false;
  if (/\bquinta\b/.test(nameNorm) || /^5(ta|to|ª|º|°)?(\s+division)?$/i.test(nameNorm)) return false;
  if (/\bsexta\b/.test(nameNorm) || /^6(ta|to|ª|º|°)?(\s+division)?$/i.test(nameNorm)) return false;

  // Formativas y promocionales (15ta, 16ta y 17ma)
  return (
    nameNorm.includes('15') ||
    nameNorm.includes('16') ||
    nameNorm.includes('17') ||
    nameNorm.includes('decimoquinta') ||
    nameNorm.includes('decimosexta') ||
    nameNorm.includes('decimoseptima') ||
    nameNorm.includes('promocional') ||
    nameNorm.includes('formativa') ||
    nameNorm.includes('pre-decima') ||
    nameNorm.includes('predecima')
  );
}

export function resolveAdaroAllDivisionIds(divisions?: Division[]): string[] {
  if (!divisions || divisions.length === 0) return ADARO_ALL_DIVISION_IDS;

  const keywords = [
    'septima', 'octava', 'novena', 'decima', 'undecima', 'duodecima', 'decimotercera', 'decimocuarta',
    'decimoquinta', 'decimosexta', 'decimoseptima'
  ];
  const altKeywords = [
    '7ma', '8va', '9na', '10ma', '11ma', '12ma', '13ra', '14ta',
    '15ta', '16ta', '17ma'
  ];

  const resolved: string[] = [];
  keywords.forEach((kw, i) => {
    const alt = altKeywords[i];
    const found = divisions.find(d => {
      const norm = d.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return norm.includes(kw) || norm.includes(alt);
    });
    if (found) {
      resolved.push(found.id);
    } else {
      resolved.push(ADARO_ALL_DIVISION_IDS[i] || `fallback-div-${i}`);
    }
  });
  return resolved;
}

export function resolveAdaroPuntuableDivisionIds(divisions?: Division[]): string[] {
  if (!divisions || divisions.length === 0) return ADARO_PUNTUABLE_DIVISION_IDS;

  const matchers = [
    (n: string) => (n.includes('7') || n.includes('septima')) && !n.includes('17') && !n.includes('decimoseptima'),
    (n: string) => n.includes('8') || n.includes('octava'),
    (n: string) => n.includes('9') || n.includes('novena'),
    (n: string) => (n.includes('10') || (n.includes('decima') && !n.includes('undecima') && !n.includes('duodecima') && !n.includes('decimotercera') && !n.includes('decimocuarta') && !n.includes('quinta') && !n.includes('sexta') && !n.includes('septima'))),
    (n: string) => n.includes('11') || n.includes('undecima'),
    (n: string) => n.includes('12') || n.includes('duodecima'),
    (n: string) => n.includes('13') || n.includes('decimotercera'),
    (n: string) => n.includes('14') || n.includes('decimocuarta'),
  ];

  const resolved: string[] = [];
  matchers.forEach((matcher, i) => {
    const found = divisions.find(d => {
      const norm = d.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return matcher(norm);
    });
    if (found) {
      resolved.push(found.id);
    } else {
      resolved.push(ADARO_PUNTUABLE_DIVISION_IDS[i]);
    }
  });
  return resolved;
}

export function getAdaroDivisionIndex(divisionIdOrName: string, divisions?: Division[]): number {
  if (!divisionIdOrName) return -1;

  // 1. Coincidencia directa por ID en ADARO_ALL_DIVISION_IDS
  const idIdx = ADARO_ALL_DIVISION_IDS.indexOf(divisionIdOrName);
  if (idIdx !== -1) return idIdx;

  // 2. Si se provee la lista de divisiones, buscar por ID para obtener el nombre
  if (divisions && divisions.length > 0) {
    const div = divisions.find(d => d.id === divisionIdOrName);
    if (div) {
      return getAdaroDivisionIndex(div.name);
    }
  }

  // 3. Coincidencia por palabra clave del nombre
  const norm = divisionIdOrName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (norm.includes('17') || norm.includes('decimoseptima')) return 10;
  if (norm.includes('16') || norm.includes('decimosexta')) return 9;
  if (norm.includes('15') || norm.includes('decimoquinta')) return 8;
  if (norm.includes('14') || norm.includes('decimocuarta')) return 7;
  if (norm.includes('13') || norm.includes('decimotercera')) return 6;
  if (norm.includes('12') || norm.includes('duodecima')) return 5;
  if (norm.includes('11') || norm.includes('undecima')) return 4;
  if (norm.includes('10') || norm.includes('decima')) return 3;
  if (norm.includes('9') || norm.includes('novena')) return 2;
  if (norm.includes('8') || norm.includes('octava')) return 1;
  if (norm.includes('7') || norm.includes('septima')) return 0;

  return -1;
}

export function getAdaroZoneIndex(zoneIdOrName: string, zones?: Zone[]): number {
  if (!zoneIdOrName) return -1;

  const zoneLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  // 1. Coincidencia directa por id tipo adaro-zone-X
  const directMatch = zoneIdOrName.toLowerCase().match(/adaro-zone-([a-g])/);
  if (directMatch) {
    return zoneLetters.indexOf(directMatch[1]);
  }

  // 2. Si se provee lista de zonas, buscar por ID para obtener el nombre
  if (zones && zones.length > 0) {
    const foundZone = zones.find(z => z.id === zoneIdOrName);
    if (foundZone) {
      return getAdaroZoneIndex(foundZone.name);
    }
  }

  // 3. Coincidencia por nombre (ej: "Zona A", "zona b")
  const norm = zoneIdOrName.toLowerCase().trim();
  for (let i = 0; i < zoneLetters.length; i++) {
    const l = zoneLetters[i];
    if (norm === `zona ${l}` || norm === l || norm.endsWith(` ${l}`)) {
      return i;
    }
  }

  return -1;
}

export function resolveAdaroZoneIds(zones?: Zone[]): Record<string, string> {
  const map: Record<string, string> = {
    'adaro-zone-a': 'adaro-zone-a',
    'adaro-zone-b': 'adaro-zone-b',
    'adaro-zone-c': 'adaro-zone-c',
    'adaro-zone-d': 'adaro-zone-d',
    'adaro-zone-e': 'adaro-zone-e',
    'adaro-zone-f': 'adaro-zone-f',
    'adaro-zone-g': 'adaro-zone-g',
  };

  if (!zones || zones.length === 0) return map;

  const zoneLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  zoneLetters.forEach(letter => {
    const key = `adaro-zone-${letter}`;
    const found = zones.find(z => {
      const norm = z.name.toLowerCase().trim();
      return (
        norm === `zona ${letter}` || 
        norm === `zona ${letter.toUpperCase()}` ||
        norm.endsWith(` ${letter}`) ||
        z.id === key
      );
    });
    if (found) {
      map[key] = found.id;
    }
  });

  return map;
}

// ─── Fixture Oficial de 6 Fechas (Ida y Vuelta) extraído del PDF ───────────────
export interface AdaroFixturePairing {
  zoneId: string;
  round: number;
  homeName: string;
  awayName: string;
}

export const ADARO_OFFICIAL_PAIRINGS: AdaroFixturePairing[] = [
  // ── ZONA A ──
  { zoneId: 'adaro-zone-a', round: 1, homeName: 'Libertad', awayName: 'Argentinos del Sud' },
  { zoneId: 'adaro-zone-a', round: 1, homeName: 'San Lorenzo', awayName: 'Aldosivi' },
  { zoneId: 'adaro-zone-a', round: 2, homeName: 'Aldosivi', awayName: 'Libertad' },
  { zoneId: 'adaro-zone-a', round: 2, homeName: 'Argentinos del Sud', awayName: 'San Lorenzo' },
  { zoneId: 'adaro-zone-a', round: 3, homeName: 'Libertad', awayName: 'San Lorenzo' },
  { zoneId: 'adaro-zone-a', round: 3, homeName: 'Aldosivi', awayName: 'Argentinos del Sud' },
  { zoneId: 'adaro-zone-a', round: 4, homeName: 'Argentinos del Sud', awayName: 'Libertad' },
  { zoneId: 'adaro-zone-a', round: 4, homeName: 'Aldosivi', awayName: 'San Lorenzo' },
  { zoneId: 'adaro-zone-a', round: 5, homeName: 'Libertad', awayName: 'Aldosivi' },
  { zoneId: 'adaro-zone-a', round: 5, homeName: 'San Lorenzo', awayName: 'Argentinos del Sud' },
  { zoneId: 'adaro-zone-a', round: 6, homeName: 'San Lorenzo', awayName: 'Libertad' },
  { zoneId: 'adaro-zone-a', round: 6, homeName: 'Argentinos del Sud', awayName: 'Aldosivi' },

  // ── ZONA B ──
  { zoneId: 'adaro-zone-b', round: 1, homeName: 'Chapadmalal', awayName: 'Kimberley' },
  { zoneId: 'adaro-zone-b', round: 1, homeName: 'Boca Juniors', awayName: 'Talleres' },
  { zoneId: 'adaro-zone-b', round: 2, homeName: 'Talleres', awayName: 'Chapadmalal' },
  { zoneId: 'adaro-zone-b', round: 2, homeName: 'Kimberley', awayName: 'Boca Juniors' },
  { zoneId: 'adaro-zone-b', round: 3, homeName: 'Chapadmalal', awayName: 'Boca Juniors' },
  { zoneId: 'adaro-zone-b', round: 3, homeName: 'Talleres', awayName: 'Kimberley' },
  { zoneId: 'adaro-zone-b', round: 4, homeName: 'Kimberley', awayName: 'Chapadmalal' },
  { zoneId: 'adaro-zone-b', round: 4, homeName: 'Talleres', awayName: 'Boca Juniors' },
  { zoneId: 'adaro-zone-b', round: 5, homeName: 'Chapadmalal', awayName: 'Talleres' },
  { zoneId: 'adaro-zone-b', round: 5, homeName: 'Boca Juniors', awayName: 'Kimberley' },
  { zoneId: 'adaro-zone-b', round: 6, homeName: 'Boca Juniors', awayName: 'Chapadmalal' },
  { zoneId: 'adaro-zone-b', round: 6, homeName: 'Kimberley', awayName: 'Talleres' },

  // ── ZONA C ──
  { zoneId: 'adaro-zone-c', round: 1, homeName: 'Atlético Mar del Plata', awayName: 'Alvarado' },
  { zoneId: 'adaro-zone-c', round: 1, homeName: 'Al Ver Veras', awayName: 'San Isidro' },
  { zoneId: 'adaro-zone-c', round: 2, homeName: 'San Isidro', awayName: 'Atlético Mar del Plata' },
  { zoneId: 'adaro-zone-c', round: 2, homeName: 'Alvarado', awayName: 'Al Ver Veras' },
  { zoneId: 'adaro-zone-c', round: 3, homeName: 'Atlético Mar del Plata', awayName: 'Al Ver Veras' },
  { zoneId: 'adaro-zone-c', round: 3, homeName: 'San Isidro', awayName: 'Alvarado' },
  { zoneId: 'adaro-zone-c', round: 4, homeName: 'Alvarado', awayName: 'Atlético Mar del Plata' },
  { zoneId: 'adaro-zone-c', round: 4, homeName: 'San Isidro', awayName: 'Al Ver Veras' },
  { zoneId: 'adaro-zone-c', round: 5, homeName: 'Atlético Mar del Plata', awayName: 'San Isidro' },
  { zoneId: 'adaro-zone-c', round: 5, homeName: 'Al Ver Veras', awayName: 'Alvarado' },
  { zoneId: 'adaro-zone-c', round: 6, homeName: 'Al Ver Veras', awayName: 'Atlético Mar del Plata' },
  { zoneId: 'adaro-zone-c', round: 6, homeName: 'Alvarado', awayName: 'San Isidro' },

  // ── ZONA D ──
  { zoneId: 'adaro-zone-d', round: 1, homeName: 'Independiente', awayName: 'El cañon' },
  { zoneId: 'adaro-zone-d', round: 1, homeName: 'Racing', awayName: 'Quilmes' },
  { zoneId: 'adaro-zone-d', round: 2, homeName: 'Quilmes', awayName: 'Independiente' },
  { zoneId: 'adaro-zone-d', round: 2, homeName: 'El cañon', awayName: 'Racing' },
  { zoneId: 'adaro-zone-d', round: 3, homeName: 'Independiente', awayName: 'Racing' },
  { zoneId: 'adaro-zone-d', round: 3, homeName: 'Quilmes', awayName: 'El cañon' },
  { zoneId: 'adaro-zone-d', round: 4, homeName: 'El cañon', awayName: 'Independiente' },
  { zoneId: 'adaro-zone-d', round: 4, homeName: 'Quilmes', awayName: 'Racing' },
  { zoneId: 'adaro-zone-d', round: 5, homeName: 'Independiente', awayName: 'Quilmes' },
  { zoneId: 'adaro-zone-d', round: 5, homeName: 'Racing', awayName: 'El cañon' },
  { zoneId: 'adaro-zone-d', round: 6, homeName: 'Racing', awayName: 'Independiente' },
  { zoneId: 'adaro-zone-d', round: 6, homeName: 'El cañon', awayName: 'Quilmes' },

  // ── ZONA E ──
  { zoneId: 'adaro-zone-e', round: 1, homeName: 'Deportivo Norte', awayName: 'Circulo' },
  { zoneId: 'adaro-zone-e', round: 1, homeName: 'Almagro', awayName: 'Nacion' },
  { zoneId: 'adaro-zone-e', round: 2, homeName: 'Nacion', awayName: 'Deportivo Norte' },
  { zoneId: 'adaro-zone-e', round: 2, homeName: 'Circulo', awayName: 'Almagro' },
  { zoneId: 'adaro-zone-e', round: 3, homeName: 'Deportivo Norte', awayName: 'Almagro' },
  { zoneId: 'adaro-zone-e', round: 3, homeName: 'Nacion', awayName: 'Circulo' },
  { zoneId: 'adaro-zone-e', round: 4, homeName: 'Circulo', awayName: 'Deportivo Norte' },
  { zoneId: 'adaro-zone-e', round: 4, homeName: 'Nacion', awayName: 'Almagro' },
  { zoneId: 'adaro-zone-e', round: 5, homeName: 'Deportivo Norte', awayName: 'Nacion' },
  { zoneId: 'adaro-zone-e', round: 5, homeName: 'Almagro', awayName: 'Circulo' },
  { zoneId: 'adaro-zone-e', round: 6, homeName: 'Almagro', awayName: 'Deportivo Norte' },
  { zoneId: 'adaro-zone-e', round: 6, homeName: 'Circulo', awayName: 'Nacion' },

  // ── ZONA F ──
  { zoneId: 'adaro-zone-f', round: 1, homeName: 'Colegiales', awayName: 'San José' },
  { zoneId: 'adaro-zone-f', round: 1, homeName: 'River Plate', awayName: 'Cadetes' },
  { zoneId: 'adaro-zone-f', round: 2, homeName: 'Cadetes', awayName: 'Colegiales' },
  { zoneId: 'adaro-zone-f', round: 2, homeName: 'San José', awayName: 'River Plate' },
  { zoneId: 'adaro-zone-f', round: 3, homeName: 'Colegiales', awayName: 'River Plate' },
  { zoneId: 'adaro-zone-f', round: 3, homeName: 'Cadetes', awayName: 'San José' },
  { zoneId: 'adaro-zone-f', round: 4, homeName: 'San José', awayName: 'Colegiales' },
  { zoneId: 'adaro-zone-f', round: 4, homeName: 'Cadetes', awayName: 'River Plate' },
  { zoneId: 'adaro-zone-f', round: 5, homeName: 'Colegiales', awayName: 'Cadetes' },
  { zoneId: 'adaro-zone-f', round: 5, homeName: 'River Plate', awayName: 'San José' },
  { zoneId: 'adaro-zone-f', round: 6, homeName: 'River Plate', awayName: 'Colegiales' },
  { zoneId: 'adaro-zone-f', round: 6, homeName: 'San José', awayName: 'Cadetes' },

  // ── ZONA G ──
  { zoneId: 'adaro-zone-g', round: 1, homeName: 'Banco Provincia', awayName: 'Banfield' },
  { zoneId: 'adaro-zone-g', round: 1, homeName: 'General Urquiza', awayName: 'Once Unidos' },
  { zoneId: 'adaro-zone-g', round: 2, homeName: 'Once Unidos', awayName: 'Banco Provincia' },
  { zoneId: 'adaro-zone-g', round: 2, homeName: 'Banfield', awayName: 'General Urquiza' },
  { zoneId: 'adaro-zone-g', round: 3, homeName: 'Banco Provincia', awayName: 'General Urquiza' },
  { zoneId: 'adaro-zone-g', round: 3, homeName: 'Once Unidos', awayName: 'Banfield' },
  { zoneId: 'adaro-zone-g', round: 4, homeName: 'Banfield', awayName: 'Banco Provincia' },
  { zoneId: 'adaro-zone-g', round: 4, homeName: 'Once Unidos', awayName: 'General Urquiza' },
  { zoneId: 'adaro-zone-g', round: 5, homeName: 'Banco Provincia', awayName: 'Once Unidos' },
  { zoneId: 'adaro-zone-g', round: 5, homeName: 'General Urquiza', awayName: 'Banfield' },
  { zoneId: 'adaro-zone-g', round: 6, homeName: 'General Urquiza', awayName: 'Banco Provincia' },
  { zoneId: 'adaro-zone-g', round: 6, homeName: 'Banfield', awayName: 'Once Unidos' },
];

// ─── Resultados Oficiales Fecha 1 (Boletín N° 4 - Págs 3, 4 y 5) ──────────────
// Cada par contiene los resultados para las 11 divisiones oficiales en orden:
// [0]: 7ma (2010), [1]: 8va (2011), [2]: 9na (2012), [3]: 10ma (2013),
// [4]: 11ma (2014), [5]: 12ma (2015), [6]: 13ra (2016), [7]: 14ta (2017),
// [8]: 15ta (2018), [9]: 16ta (2019), [10]: 17ma (2020)
export const FECHA_1_OFFICIAL_RESULTS: Record<string, Array<{ home: number; away: number }>> = {
  // ZONA A
  'Libertad_Argentinos del Sud': [
    { home: 0, away: 2 }, // 7ma (2010)
    { home: 0, away: 4 }, // 8va (2011)
    { home: 0, away: 2 }, // 9na (2012)
    { home: 0, away: 5 }, // 10ma (2013)
    { home: 0, away: 2 }, // 11ma (2014)
    { home: 0, away: 6 }, // 12ma (2015)
    { home: 0, away: 3 }, // 13ra (2016)
    { home: 0, away: 6 }, // 14ta (2017)
    { home: 0, away: 4 }, // 15ta (2018)
    { home: 0, away: 8 }, // 16ta (2019)
    { home: 1, away: 10 }, // 17ma (2020)
  ],
  'San Lorenzo_Aldosivi': [
    { home: 0, away: 8 }, // 7ma
    { home: 0, away: 3 }, // 8va
    { home: 0, away: 2 }, // 9na
    { home: 0, away: 2 }, // 10ma
    { home: 1, away: 2 }, // 11ma
    { home: 0, away: 2 }, // 12ma
    { home: 0, away: 4 }, // 13ra
    { home: 0, away: 8 }, // 14ta
    { home: 0, away: 4 }, // 15ta
    { home: 1, away: 4 }, // 16ta
    { home: 1, away: 0 }, // 17ma (np Aldosivi)
  ],

  // ZONA B
  'Chapadmalal_Kimberley': [
    { home: 1, away: 3 }, // 7ma
    { home: 0, away: 5 }, // 8va
    { home: 0, away: 7 }, // 9na
    { home: 1, away: 2 }, // 10ma
    { home: 0, away: 6 }, // 11ma
    { home: 0, away: 7 }, // 12ma
    { home: 1, away: 4 }, // 13ra
    { home: 1, away: 2 }, // 14ta
    { home: 1, away: 7 }, // 15ta
    { home: 0, away: 7 }, // 16ta
    { home: 0, away: 1 }, // 17ma (np Chapadmalal)
  ],
  'Boca Juniors_Talleres': [
    { home: 1, away: 2 }, // 7ma
    { home: 1, away: 3 }, // 8va
    { home: 0, away: 2 }, // 9na
    { home: 0, away: 4 }, // 10ma
    { home: 1, away: 1 }, // 11ma
    { home: 1, away: 6 }, // 12ma
    { home: 0, away: 1 }, // 13ra (np Boca)
    { home: 0, away: 5 }, // 14ta
    { home: 0, away: 3 }, // 15ta
    { home: 0, away: 4 }, // 16ta
    { home: 0, away: 1 }, // 17ma (np Boca)
  ],

  // ZONA C
  'Atlético Mar del Plata_Alvarado': [
    { home: 0, away: 3 }, // 7ma
    { home: 1, away: 1 }, // 8va
    { home: 0, away: 1 }, // 9na
    { home: 4, away: 1 }, // 10ma
    { home: 1, away: 1 }, // 11ma
    { home: 0, away: 2 }, // 12ma
    { home: 0, away: 4 }, // 13ra
    { home: 1, away: 2 }, // 14ta
    { home: 2, away: 3 }, // 15ta
    { home: 0, away: 2 }, // 16ta
    { home: 0, away: 0 }, // 17ma
  ],
  'Al Ver Veras_San Isidro': [
    { home: 1, away: 4 }, // 7ma
    { home: 0, away: 1 }, // 8va (np Al Ver Veras)
    { home: 0, away: 5 }, // 9na
    { home: 0, away: 1 }, // 10ma
    { home: 0, away: 2 }, // 11ma
    { home: 0, away: 3 }, // 12ma
    { home: 1, away: 0 }, // 13ra
    { home: 4, away: 5 }, // 14ta
    { home: 0, away: 0 }, // 15ta
    { home: 6, away: 1 }, // 16ta
    { home: 4, away: 0 }, // 17ma
  ],

  // ZONA D
  'Independiente_El cañon': [
    { home: 2, away: 2 }, // 7ma
    { home: 1, away: 0 }, // 8va
    { home: 0, away: 0 }, // 9na
    { home: 1, away: 1 }, // 10ma
    { home: 6, away: 0 }, // 11ma
    { home: 2, away: 1 }, // 12ma
    { home: 1, away: 0 }, // 13ra
    { home: 2, away: 3 }, // 14ta
    { home: 0, away: 2 }, // 15ta
    { home: 1, away: 1 }, // 16ta
    { home: 2, away: 2 }, // 17ma
  ],
  'Racing_Quilmes': [
    { home: 2, away: 3 }, // 7ma
    { home: 1, away: 3 }, // 8va
    { home: 1, away: 1 }, // 9na
    { home: 0, away: 0 }, // 10ma
    { home: 0, away: 5 }, // 11ma
    { home: 1, away: 4 }, // 12ma
    { home: 0, away: 11 }, // 13ra
    { home: 0, away: 1 }, // 14ta
    { home: 1, away: 4 }, // 15ta
    { home: 0, away: 1 }, // 16ta (np Racing)
    { home: 0, away: 0 }, // 17ma (ambos np)
  ],

  // ZONA E
  'Deportivo Norte_Circulo': [
    { home: 1, away: 0 }, // 7ma
    { home: 1, away: 0 }, // 8va
    { home: 0, away: 0 }, // 9na
    { home: 0, away: 0 }, // 10ma
    { home: 3, away: 0 }, // 11ma
    { home: 2, away: 0 }, // 12ma
    { home: 1, away: 2 }, // 13ra
    { home: 1, away: 2 }, // 14ta
    { home: 6, away: 0 }, // 15ta
    { home: 7, away: 0 }, // 16ta
    { home: 1, away: 1 }, // 17ma
  ],
  'Almagro_Nacion': [
    { home: 2, away: 1 }, // 7ma
    { home: 1, away: 3 }, // 8va
    { home: 1, away: 7 }, // 9na
    { home: 0, away: 8 }, // 10ma
    { home: 0, away: 3 }, // 11ma
    { home: 0, away: 2 }, // 12ma
    { home: 3, away: 1 }, // 13ra
    { home: 2, away: 1 }, // 14ta
    { home: 1, away: 5 }, // 15ta
    { home: 0, away: 0 }, // 16ta
    { home: 0, away: 0 }, // 17ma (ambos np)
  ],

  // ZONA F
  'Colegiales_San José': [
    { home: 0, away: 0 }, // 7ma
    { home: 0, away: 1 }, // 8va (np Colegiales)
    { home: 6, away: 0 }, // 9na
    { home: 0, away: 5 }, // 10ma
    { home: 4, away: 0 }, // 11ma
    { home: 1, away: 3 }, // 12ma
    { home: 2, away: 0 }, // 13ra
    { home: 2, away: 1 }, // 14ta
    { home: 2, away: 0 }, // 15ta
    { home: 9, away: 0 }, // 16ta
    { home: 7, away: 0 }, // 17ma
  ],
  'River Plate_Cadetes': [
    { home: 2, away: 1 }, // 7ma
    { home: 0, away: 1 }, // 8va
    { home: 2, away: 0 }, // 9na
    { home: 0, away: 2 }, // 10ma
    { home: 3, away: 1 }, // 11ma
    { home: 2, away: 1 }, // 12ma
    { home: 0, away: 0 }, // 13ra
    { home: 5, away: 2 }, // 14ta
    { home: 1, away: 1 }, // 15ta
    { home: 4, away: 0 }, // 16ta
    { home: 0, away: 4 }, // 17ma
  ],

  // ZONA G
  'Banco Provincia_Banfield': [
    { home: 1, away: 3 }, // 7ma
    { home: 1, away: 9 }, // 8va
    { home: 0, away: 10 }, // 9na
    { home: 0, away: 5 }, // 10ma
    { home: 1, away: 7 }, // 11ma
    { home: 0, away: 2 }, // 12ma
    { home: 0, away: 9 }, // 13ra
    { home: 2, away: 3 }, // 14ta
    { home: 0, away: 2 }, // 15ta
    { home: 0, away: 1 }, // 16ta (np Banco)
    { home: 0, away: 1 }, // 17ma (np Banco)
  ],
  'General Urquiza_Once Unidos': [
    { home: 2, away: 0 }, // 7ma
    { home: 0, away: 2 }, // 8va
    { home: 1, away: 0 }, // 9na
    { home: 2, away: 4 }, // 10ma
    { home: 0, away: 1 }, // 11ma
    { home: 0, away: 3 }, // 12ma
    { home: 0, away: 5 }, // 13ra
    { home: 1, away: 2 }, // 14ta
    { home: 1, away: 6 }, // 15ta
    { home: 1, away: 3 }, // 16ta
    { home: 0, away: 5 }, // 17ma
  ],
};

// ─── Resultados Oficiales Fecha 2 (25/10/26) ──────────────────────────────────
// null indica partido suspendido (SU) o pendiente -> status: 'scheduled'
export const FECHA_2_OFFICIAL_RESULTS: Record<string, Array<{ home: number; away: number } | null>> = {
  // ZONA A
  'Aldosivi_Libertad': [
    null,   // 7ma: SU
    null,   // 8va: SU
    null,   // 9na: SU
    { home: 9, away: 0 }, // 10ma
    { home: 9, away: 1 }, // 11ma
    { home: 9, away: 0 }, // 12ma
    { home: 7, away: 1 }, // 13ra
    { home: 8, away: 0 }, // 14ta
    { home: 6, away: 0 }, // 15ta
    { home: 12, away: 0 },// 16ta
    { home: 11, away: 0 },// 17ma
  ],
  'Argentinos del Sud_San Lorenzo': [
    { home: 1, away: 1 }, // 7ma
    { home: 4, away: 1 }, // 8va
    { home: 0, away: 1 }, // 9na
    { home: 0, away: 1 }, // 10ma
    { home: 0, away: 1 }, // 11ma
    { home: 2, away: 1 }, // 12ma
    { home: 1, away: 0 }, // 13ra
    { home: 5, away: 0 }, // 14ta
    { home: 2, away: 0 }, // 15ta
    { home: 0, away: 0 }, // 16ta
    { home: 2, away: 3 }, // 17ma
  ],

  // ZONA B
  'Talleres_Chapadmalal': [
    { home: 1, away: 0 }, // 7ma
    { home: 4, away: 1 }, // 8va
    { home: 4, away: 0 }, // 9na
    { home: 5, away: 1 }, // 10ma
    { home: 0, away: 0 }, // 11ma
    { home: 2, away: 0 }, // 12ma
    { home: 1, away: 2 }, // 13ra
    { home: 0, away: 1 }, // 14ta
    { home: 3, away: 0 }, // 15ta
    { home: 2, away: 0 }, // 16ta
    { home: 1, away: 0 }, // 17ma (Chapadmalal NP)
  ],
  'Kimberley_Boca Juniors': [
    { home: 3, away: 2 }, // 7ma
    { home: 3, away: 0 }, // 8va
    { home: 8, away: 1 }, // 9na
    { home: 8, away: 0 }, // 10ma
    { home: 1, away: 0 }, // 11ma
    { home: 7, away: 0 }, // 12ma
    { home: 1, away: 0 }, // 13ra (Boca NP)
    { home: 6, away: 0 }, // 14ta
    { home: 3, away: 1 }, // 15ta
    { home: 8, away: 0 }, // 16ta
    { home: 1, away: 0 }, // 17ma (Boca NP)
  ],

  // ZONA C
  'San Isidro_Atlético Mar del Plata': [
    { home: 0, away: 3 }, // 7ma
    { home: 2, away: 2 }, // 8va
    { home: 0, away: 2 }, // 9na
    { home: 0, away: 0 }, // 10ma
    { home: 1, away: 0 }, // 11ma
    { home: 0, away: 0 }, // 12ma
    { home: 0, away: 0 }, // 13ra
    { home: 1, away: 2 }, // 14ta
    { home: 6, away: 0 }, // 15ta
    { home: 1, away: 1 }, // 16ta
    { home: 0, away: 3 }, // 17ma
  ],
  'Alvarado_Al Ver Veras': [
    { home: 4, away: 0 }, // 7ma
    { home: 1, away: 0 }, // 8va (Al Ver Veras NP)
    { home: 11, away: 0 },// 9na
    { home: 8, away: 0 }, // 10ma
    { home: 1, away: 2 }, // 11ma
    { home: 3, away: 0 }, // 12ma
    { home: 8, away: 0 }, // 13ra
    { home: 6, away: 1 }, // 14ta
    { home: 1, away: 2 }, // 15ta
    { home: 7, away: 0 }, // 16ta
    { home: 0, away: 1 }, // 17ma
  ],

  // ZONA D
  'Quilmes_Independiente': [
    null,   // 7ma: SU
    null,   // 8va: SU
    { home: 0, away: 1 }, // 9na
    { home: 1, away: 3 }, // 10ma
    { home: 0, away: 2 }, // 11ma
    { home: 0, away: 3 }, // 12ma
    { home: 1, away: 0 }, // 13ra
    { home: 1, away: 2 }, // 14ta
    { home: 0, away: 3 }, // 15ta
    { home: 1, away: 0 }, // 16ta
    { home: 0, away: 1 }, // 17ma (Quilmes NP)
  ],
  'El cañon_Racing': [
    { home: 5, away: 1 }, // 7ma
    { home: 1, away: 1 }, // 8va
    { home: 4, away: 0 }, // 9na
    { home: 5, away: 0 }, // 10ma
    { home: 5, away: 0 }, // 11ma
    { home: 15, away: 0 },// 12ma
    { home: 5, away: 0 }, // 13ra
    { home: 0, away: 3 }, // 14ta
    { home: 5, away: 2 }, // 15ta
    { home: 1, away: 0 }, // 16ta (Racing NP)
    { home: 1, away: 0 }, // 17ma (Racing NP)
  ],

  // ZONA E
  'Nacion_Deportivo Norte': [
    { home: 0, away: 3 }, // 7ma
    { home: 0, away: 1 }, // 8va
    { home: 4, away: 3 }, // 9na
    { home: 5, away: 0 }, // 10ma
    { home: 1, away: 2 }, // 11ma
    { home: 0, away: 0 }, // 12ma
    { home: 1, away: 1 }, // 13ra
    { home: 2, away: 3 }, // 14ta
    { home: 2, away: 3 }, // 15ta
    { home: 0, away: 3 }, // 16ta
    { home: 0, away: 1 }, // 17ma (Nacion NP)
  ],
  'Circulo_Almagro': [
    { home: 5, away: 1 }, // 7ma
    { home: 4, away: 2 }, // 8va
    { home: 3, away: 1 }, // 9na
    { home: 3, away: 1 }, // 10ma
    { home: 2, away: 0 }, // 11ma
    { home: 3, away: 0 }, // 12ma
    { home: 1, away: 3 }, // 13ra
    { home: 9, away: 0 }, // 14ta
    { home: 3, away: 1 }, // 15ta
    { home: 3, away: 2 }, // 16ta
    { home: 1, away: 0 }, // 17ma (Almagro NP)
  ],

  // ZONA F
  'Cadetes_Colegiales': [
    { home: 5, away: 1 }, // 7ma
    { home: 1, away: 0 }, // 8va (Colegiales NP)
    { home: 2, away: 1 }, // 9na
    { home: 8, away: 0 }, // 10ma
    { home: 1, away: 2 }, // 11ma
    { home: 4, away: 0 }, // 12ma
    { home: 2, away: 0 }, // 13ra
    { home: 5, away: 0 }, // 14ta
    { home: 3, away: 1 }, // 15ta
    null,                 // 16ta: sin resultado / pendiente
    { home: 0, away: 2 }, // 17ma
  ],
  'San José_River Plate': [
    { home: 0, away: 7 }, // 7ma
    { home: 0, away: 2 }, // 8va
    { home: 1, away: 4 }, // 9na
    { home: 1, away: 2 }, // 10ma
    { home: 0, away: 6 }, // 11ma
    { home: 0, away: 2 }, // 12ma
    { home: 0, away: 0 }, // 13ra
    { home: 0, away: 0 }, // 14ta
    { home: 0, away: 4 }, // 15ta
    { home: 0, away: 7 }, // 16ta
    { home: 0, away: 5 }, // 17ma
  ],

  // ZONA G
  'Once Unidos_Banco Provincia': [
    { home: 2, away: 5 }, // 7ma
    { home: 3, away: 1 }, // 8va
    { home: 3, away: 0 }, // 9na
    { home: 3, away: 1 }, // 10ma
    { home: 4, away: 0 }, // 11ma
    { home: 10, away: 2 },// 12ma
    { home: 5, away: 1 }, // 13ra
    { home: 6, away: 1 }, // 14ta
    { home: 3, away: 1 }, // 15ta
    { home: 1, away: 0 }, // 16ta (Banco Provincia NP)
    { home: 1, away: 0 }, // 17ma (Banco Provincia NP)
  ],
  'Banfield_General Urquiza': [
    { home: 0, away: 3 }, // 7ma
    { home: 8, away: 0 }, // 8va
    { home: 0, away: 1 }, // 9na
    { home: 2, away: 0 }, // 10ma
    { home: 5, away: 0 }, // 11ma
    { home: 4, away: 0 }, // 12ma
    { home: 5, away: 0 }, // 13ra
    { home: 8, away: 0 }, // 14ta
    { home: 9, away: 1 }, // 15ta
    { home: 4, away: 0 }, // 16ta
    { home: 2, away: 2 }, // 17ma
  ],
};

// Generador de partidos para el Torneo Adaro (genera partidos para las 11 divisiones)
export function generateAdaroMatches(
  availableTeams?: Team[], 
  availableDivisions?: Division[],
  availableZones?: Zone[]
): Match[] {
  let counter = 1;
  const matches: Match[] = [];
  const searchPool = availableTeams && availableTeams.length > 0 ? availableTeams : ALL_MOCK_TEAMS;
  const targetDivisionIds = resolveAdaroAllDivisionIds(availableDivisions);
  const zoneIdMap = resolveAdaroZoneIds(availableZones);

  ADARO_OFFICIAL_PAIRINGS.forEach(p => {
    const homeId = findTeamId(p.homeName, searchPool);
    const awayId = findTeamId(p.awayName, searchPool);
    if (!homeId || !awayId) return;

    const pairKey = `${p.homeName}_${p.awayName}`;
    const fecha1Scores = FECHA_1_OFFICIAL_RESULTS[pairKey];
    const resolvedZoneId = zoneIdMap[p.zoneId] || p.zoneId;

    targetDivisionIds.forEach((divId, divIndex) => {
      let homeGoals: number | null = null;
      let awayGoals: number | null = null;
      let status: 'scheduled' | 'finished' = 'scheduled';
      let matchDate: string | null = null;

      if (p.round === 1) {
        status = 'finished';
        matchDate = `2026-10-17T${9 + (divIndex % 8)}:00:00Z`;
        if (fecha1Scores && fecha1Scores[divIndex]) {
          homeGoals = fecha1Scores[divIndex].home;
          awayGoals = fecha1Scores[divIndex].away;
        }
      } else if (p.round === 2) {
        const fecha2Scores = FECHA_2_OFFICIAL_RESULTS[pairKey];
        if (fecha2Scores && fecha2Scores[divIndex]) {
          status = 'finished';
          homeGoals = fecha2Scores[divIndex].home;
          awayGoals = fecha2Scores[divIndex].away;
          matchDate = `2026-10-25T${9 + (divIndex % 8)}:00:00Z`;
        } else {
          // Suspendido (SU) o no jugado
          status = 'scheduled';
          homeGoals = null;
          awayGoals = null;
          matchDate = `2026-10-25T10:00:00Z`;
        }
      } else {
        // Fecha 3 en adelante
        matchDate = `2026-10-${25 + (p.round - 2) * 7}T10:00:00Z`;
      }

      matches.push({
        id: `adaro-match-${counter++}`,
        tournament_id: ADARO_TOURNAMENT_ID,
        division_id: divId,
        zone_id: resolvedZoneId,
        round_number: p.round,
        home_team_id: homeId,
        away_team_id: awayId,
        home_goals: homeGoals,
        away_goals: awayGoals,
        status,
        match_date: matchDate,
      });
    });
  });

  return matches;
}

export const MOCK_ADARO_MATCHES: Match[] = generateAdaroMatches();
