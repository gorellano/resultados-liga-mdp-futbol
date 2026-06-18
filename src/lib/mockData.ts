import type { Team, Match, Tournament } from './types';

// Escudos de los equipos
const LOGOS: Record<string, string> = {
  "Talleres de Mar del Plata": "/logos/talleres.png",
  "Kimberley": "/logos/kimberley.png",
  "Aldosivi": "/logos/aldosivi.png",
  "Atlético Mar del Plata": "/logos/atletico_mar_del_plata.png",
  "Argentinos del Sud": "/logos/argentinos_del_sud.png",
  "Cadetes": "/logos/cadetes.png",
  "Alvarado": "/logos/alvarado.png",
  "Quilmes": "/logos/quilmes.png",
  "Circulo Deportivo": "/logos/circulo_deportivo.png",
  "San Lorenzo": "/logos/san_lorenzo.png",
  "Deportivo Norte": "/logos/deportivo_norte.png",
  "Once Unidos": "/logos/once_unidos.png",
  "Banfield": "/logos/banfield.png",
  "Independiente": "/logos/independiente.png",
  "River Plate": "/logos/river_plate.png",
  "Nacion": "/logos/nacion.png",
  "Boca Juniors": "/logos/boca_juniors.png",
  "Libertad": "/logos/libertad.png",
  "General Urquiza": "/logos/general_urquiza.png",
  "El cañon": "/logos/el_canon.png",
  "Almagro Florida": "/logos/almagro_florida.png",
  "Al Ver Veras": "/logos/al_ver_veras.png",
  "Colegiales/Siciliano": "/logos/colegiales_el_siciliano.png",
  "Club Banco Provincia de Mar del Plata": "/logos/banco_provincia.png",
  "Club Social y Deportivo Chapadmalal": "/logos/chapadmalal.png",
  "San José": "/logos/san_jose.png",
  "Racing": "/logos/racing.png",
  "San Isidro": "/logos/san_isidro.png",
  "General Mitre": "/logos/general_mitre.png",
};

// Nombres cortos para la UI (cuando el nombre completo es muy largo)
const DISPLAY_NAMES: Record<string, string> = {
  "Talleres de Mar del Plata":            "Talleres",
  "Club Banco Provincia de Mar del Plata": "Banco Provincia",
  "Club Social y Deportivo Chapadmalal":   "Chapadmalal",
  "El cañon":                             "El Cañón",
};

// ─── Equipos Zona Campeonato ──────────────────────────────────────────────────
// Nombres según el fixture de la imagen
const TEAMS_CAMPEONATO_NAMES = [
  "Talleres de Mar del Plata",
  "Deportivo Norte",
  "Kimberley",
  "Once Unidos",
  "Aldosivi",
  "Banfield",
  "Atlético Mar del Plata",
  "Argentinos del Sud",
  "Independiente",
  "River Plate",
  "Cadetes",
  "Nacion",
  "Alvarado",
  "Quilmes",
];

// ─── Equipos Zona Promoción ───────────────────────────────────────────────────
const TEAMS_PROMOCION_NAMES = [
  "Boca Juniors",
  "Libertad",
  "Circulo Deportivo",
  "San Lorenzo",
  "General Urquiza",
  "El cañon",
  "Almagro Florida",
  "Al Ver Veras",
  "Colegiales/Siciliano",
  "Club Banco Provincia de Mar del Plata",
  "Club Social y Deportivo Chapadmalal",
  "San José",
  "Racing",
  "San Isidro",
];

export const MOCK_TEAMS_CAMPEONATO: Team[] = TEAMS_CAMPEONATO_NAMES.map((name, i) => ({
  id: `camp-team-${i}`,
  name,
  display_name: DISPLAY_NAMES[name],
  logo_url: LOGOS[name] || null,
}));

export const MOCK_TEAMS_PROMOCION: Team[] = TEAMS_PROMOCION_NAMES.map((name, i) => ({
  id: `prom-team-${i}`,
  name,
  display_name: DISPLAY_NAMES[name],
  logo_url: LOGOS[name] || null,
}));

// ─── Torneos ──────────────────────────────────────────────────────────────────
export const MOCK_TOURNAMENTS: Tournament[] = [
  { id: 't1', name: 'Anual', year: 2026 },
  { id: 't2', name: 'Anual', year: 2025 },
];

// ─── Helper: obtener ID de equipo campeonato por nombre abreviado ──────────────
function campId(shortName: string): string {
  const map: Record<string, string> = {
    "TALLERES":      "camp-team-0",  // Talleres de Mar del Plata
    "DVO NORTE":     "camp-team-1",  // Deportivo Norte
    "KIMBERLEY":     "camp-team-2",  // Kimberley
    "ONCE UNIDOS":   "camp-team-3",  // Once Unidos
    "ALDOSIVI":      "camp-team-4",  // Aldosivi
    "BANFIELD":      "camp-team-5",  // Banfield
    "MAR DEL PLATA": "camp-team-6",  // Atlético Mar del Plata
    "ARG. DEL SUD":  "camp-team-7",  // Argentinos del Sud
    "INDEPENDIENTE": "camp-team-8",  // Independiente
    "RIVER PLATE":   "camp-team-9",  // River Plate
    "CADETES":       "camp-team-10", // Cadetes
    "NACION":        "camp-team-11", // Nacion
    "ALVARADO":      "camp-team-12", // Alvarado
    "QUILMES":       "camp-team-13", // Quilmes
  };
  return map[shortName] ?? '';
}

// ─── Fixture real Zona Campeonato (13 fechas) ─────────────────────────────────
// Extraído de la imagen provista
const FIXTURE_CAMPEONATO: Array<{ round: number; home: string; away: string }> = [
  // PRIMERA FECHA
  { round: 1,  home: "TALLERES",      away: "DVO NORTE" },
  { round: 1,  home: "KIMBERLEY",     away: "ONCE UNIDOS" },
  { round: 1,  home: "ALDOSIVI",      away: "BANFIELD" },
  { round: 1,  home: "MAR DEL PLATA", away: "ARG. DEL SUD" },
  { round: 1,  home: "INDEPENDIENTE", away: "RIVER PLATE" },
  { round: 1,  home: "CADETES",       away: "NACION" },
  { round: 1,  home: "ALVARADO",      away: "QUILMES" },
  // SEGUNDA FECHA
  { round: 2,  home: "ALVARADO",      away: "TALLERES" },
  { round: 2,  home: "QUILMES",       away: "CADETES" },
  { round: 2,  home: "NACION",        away: "INDEPENDIENTE" },
  { round: 2,  home: "RIVER PLATE",   away: "MAR DEL PLATA" },
  { round: 2,  home: "ARG. DEL SUD",  away: "ALDOSIVI" },
  { round: 2,  home: "BANFIELD",      away: "KIMBERLEY" },
  { round: 2,  home: "ONCE UNIDOS",   away: "DVO NORTE" },
  // TERCERA FECHA
  { round: 3,  home: "TALLERES",      away: "ONCE UNIDOS" },
  { round: 3,  home: "DVO NORTE",     away: "BANFIELD" },
  { round: 3,  home: "KIMBERLEY",     away: "ARG. DEL SUD" },
  { round: 3,  home: "ALDOSIVI",      away: "RIVER PLATE" },
  { round: 3,  home: "MAR DEL PLATA", away: "NACION" },
  { round: 3,  home: "INDEPENDIENTE", away: "QUILMES" },
  { round: 3,  home: "CADETES",       away: "ALVARADO" },
  // CUARTA FECHA
  { round: 4,  home: "CADETES",       away: "TALLERES" },
  { round: 4,  home: "ALVARADO",      away: "INDEPENDIENTE" },
  { round: 4,  home: "QUILMES",       away: "MAR DEL PLATA" },
  { round: 4,  home: "NACION",        away: "ALDOSIVI" },
  { round: 4,  home: "RIVER PLATE",   away: "KIMBERLEY" },
  { round: 4,  home: "ARG. DEL SUD",  away: "DVO NORTE" },
  { round: 4,  home: "BANFIELD",      away: "ONCE UNIDOS" },
  // QUINTA FECHA
  { round: 5,  home: "TALLERES",      away: "BANFIELD" },
  { round: 5,  home: "ONCE UNIDOS",   away: "ARG. DEL SUD" },
  { round: 5,  home: "DVO NORTE",     away: "RIVER PLATE" },
  { round: 5,  home: "KIMBERLEY",     away: "NACION" },
  { round: 5,  home: "ALDOSIVI",      away: "QUILMES" },
  { round: 5,  home: "MAR DEL PLATA", away: "ALVARADO" },
  { round: 5,  home: "INDEPENDIENTE", away: "CADETES" },
  // SEXTA FECHA
  { round: 6,  home: "INDEPENDIENTE", away: "TALLERES" },
  { round: 6,  home: "CADETES",       away: "MAR DEL PLATA" },
  { round: 6,  home: "ALVARADO",      away: "ALDOSIVI" },
  { round: 6,  home: "QUILMES",       away: "KIMBERLEY" },
  { round: 6,  home: "NACION",        away: "DVO NORTE" },
  { round: 6,  home: "RIVER PLATE",   away: "ONCE UNIDOS" },
  { round: 6,  home: "ARG. DEL SUD",  away: "BANFIELD" },
  // SÉPTIMA FECHA
  { round: 7,  home: "TALLERES",      away: "ARG. DEL SUD" },
  { round: 7,  home: "BANFIELD",      away: "RIVER PLATE" },
  { round: 7,  home: "ONCE UNIDOS",   away: "NACION" },
  { round: 7,  home: "DVO NORTE",     away: "QUILMES" },
  { round: 7,  home: "KIMBERLEY",     away: "ALVARADO" },
  { round: 7,  home: "ALDOSIVI",      away: "CADETES" },
  { round: 7,  home: "MAR DEL PLATA", away: "INDEPENDIENTE" },
  // OCTAVA FECHA
  { round: 8,  home: "MAR DEL PLATA", away: "TALLERES" },
  { round: 8,  home: "INDEPENDIENTE", away: "ALDOSIVI" },
  { round: 8,  home: "CADETES",       away: "KIMBERLEY" },
  { round: 8,  home: "ALVARADO",      away: "DVO NORTE" },
  { round: 8,  home: "QUILMES",       away: "ONCE UNIDOS" },
  { round: 8,  home: "NACION",        away: "BANFIELD" },
  { round: 8,  home: "RIVER PLATE",   away: "ARG. DEL SUD" },
  // NOVENA FECHA
  { round: 9,  home: "TALLERES",      away: "RIVER PLATE" },
  { round: 9,  home: "ARG. DEL SUD",  away: "NACION" },
  { round: 9,  home: "BANFIELD",      away: "QUILMES" },
  { round: 9,  home: "ONCE UNIDOS",   away: "ALVARADO" },
  { round: 9,  home: "DVO NORTE",     away: "CADETES" },
  { round: 9,  home: "KIMBERLEY",     away: "INDEPENDIENTE" },
  { round: 9,  home: "ALDOSIVI",      away: "MAR DEL PLATA" },
  // DÉCIMA FECHA
  { round: 10, home: "ALDOSIVI",      away: "TALLERES" },
  { round: 10, home: "MAR DEL PLATA", away: "KIMBERLEY" },
  { round: 10, home: "INDEPENDIENTE", away: "DVO NORTE" },
  { round: 10, home: "CADETES",       away: "ONCE UNIDOS" },
  { round: 10, home: "ALVARADO",      away: "BANFIELD" },
  { round: 10, home: "QUILMES",       away: "ARG. DEL SUD" },
  { round: 10, home: "NACION",        away: "RIVER PLATE" },
  // DECIMOPRIMERA FECHA
  { round: 11, home: "TALLERES",      away: "NACION" },
  { round: 11, home: "RIVER PLATE",   away: "QUILMES" },
  { round: 11, home: "ARG. DEL SUD",  away: "ALVARADO" },
  { round: 11, home: "BANFIELD",      away: "CADETES" },
  { round: 11, home: "ONCE UNIDOS",   away: "INDEPENDIENTE" },
  { round: 11, home: "DVO NORTE",     away: "MAR DEL PLATA" },
  { round: 11, home: "KIMBERLEY",     away: "ALDOSIVI" },
  // DECIMOSEGUNDA FECHA
  { round: 12, home: "KIMBERLEY",     away: "TALLERES" },
  { round: 12, home: "ALDOSIVI",      away: "DVO NORTE" },
  { round: 12, home: "MAR DEL PLATA", away: "ONCE UNIDOS" },
  { round: 12, home: "INDEPENDIENTE", away: "BANFIELD" },
  { round: 12, home: "CADETES",       away: "ARG. DEL SUD" },
  { round: 12, home: "ALVARADO",      away: "RIVER PLATE" },
  { round: 12, home: "QUILMES",       away: "NACION" },
  // DECIMOTERCERA FECHA
  { round: 13, home: "TALLERES",      away: "QUILMES" },
  { round: 13, home: "NACION",        away: "ALVARADO" },
  { round: 13, home: "RIVER PLATE",   away: "CADETES" },
  { round: 13, home: "ARG. DEL SUD",  away: "INDEPENDIENTE" },
  { round: 13, home: "BANFIELD",      away: "MAR DEL PLATA" },
  { round: 13, home: "ONCE UNIDOS",   away: "ALDOSIVI" },
  { round: 13, home: "DVO NORTE",     away: "KIMBERLEY" },
];

// ─── Generador de partidos campeonato ────────────────────────────────────────
let matchIdCounter = 1;

export const MOCK_MATCHES_CAMPEONATO: Match[] = [];

MOCK_TOURNAMENTS.forEach(tournament => {
  FIXTURE_CAMPEONATO.forEach(({ round, home, away }) => {
    MOCK_MATCHES_CAMPEONATO.push({
      id: `match-camp-${matchIdCounter++}`,
      tournament_id: tournament.id,
      division_id: 'd1',
      zone_id: 'camp',
      round_number: round,
      home_team_id: campId(home),
      away_team_id: campId(away),
      home_goals: null,
      away_goals: null,
      status: 'scheduled',
      match_date: null,
    });
  });
});

// ─── Helper: obtener ID de equipo promoción por nombre abreviado ──────────────
function promId(shortName: string): string {
  const map: Record<string, string> = {
    "BOCA JRS":        "prom-team-0",
    "LIBERTAD":        "prom-team-1",
    "CIRCULO DVO":     "prom-team-2",
    "SAN LORENZO":     "prom-team-3",
    "GRAL. URQUIZA":   "prom-team-4",
    "EL CAÑON":        "prom-team-5",
    "ALM. FLORIDA":    "prom-team-6",
    "AL VER VERAS":    "prom-team-7",
    "COLEGIALES":      "prom-team-8",
    "BANCO PROVINCIA": "prom-team-9",
    "CHAPADMALAL":     "prom-team-10",
    "SAN JOSE":        "prom-team-11",
    "RACING":          "prom-team-12",
    "SAN ISIDRO":      "prom-team-13",
  };
  return map[shortName] ?? '';
}

// ─── Fixture real Zona Promoción (13 fechas) ─────────────────────────────────
// Extraído de la imagen provista
const FIXTURE_PROMOCION: Array<{ round: number; home: string; away: string }> = [
  // PRIMERA FECHA
  { round: 1,  home: "BOCA JRS",        away: "LIBERTAD" },
  { round: 1,  home: "CIRCULO DVO",     away: "SAN LORENZO" },
  { round: 1,  home: "GRAL. URQUIZA",   away: "EL CAÑON" },
  { round: 1,  home: "ALM. FLORIDA",    away: "AL VER VERAS" },
  { round: 1,  home: "COLEGIALES",      away: "BANCO PROVINCIA" },
  { round: 1,  home: "CHAPADMALAL",     away: "SAN JOSE" },
  { round: 1,  home: "RACING",          away: "SAN ISIDRO" },
  // SEGUNDA FECHA
  { round: 2,  home: "RACING",          away: "BOCA JRS" },
  { round: 2,  home: "SAN ISIDRO",      away: "CHAPADMALAL" },
  { round: 2,  home: "SAN JOSE",        away: "COLEGIALES" },
  { round: 2,  home: "BANCO PROVINCIA", away: "ALM. FLORIDA" },
  { round: 2,  home: "AL VER VERAS",    away: "GRAL. URQUIZA" },
  { round: 2,  home: "EL CAÑON",        away: "CIRCULO DVO" },
  { round: 2,  home: "SAN LORENZO",     away: "LIBERTAD" },
  // TERCERA FECHA
  { round: 3,  home: "BOCA JRS",        away: "SAN LORENZO" },
  { round: 3,  home: "LIBERTAD",        away: "EL CAÑON" },
  { round: 3,  home: "CIRCULO DVO",     away: "AL VER VERAS" },
  { round: 3,  home: "GRAL. URQUIZA",   away: "BANCO PROVINCIA" },
  { round: 3,  home: "ALM. FLORIDA",    away: "SAN JOSE" },
  { round: 3,  home: "COLEGIALES",      away: "SAN ISIDRO" },
  { round: 3,  home: "CHAPADMALAL",     away: "RACING" },
  // CUARTA FECHA
  { round: 4,  home: "CHAPADMALAL",     away: "BOCA JRS" },
  { round: 4,  home: "RACING",          away: "COLEGIALES" },
  { round: 4,  home: "SAN ISIDRO",      away: "ALM. FLORIDA" },
  { round: 4,  home: "SAN JOSE",        away: "GRAL. URQUIZA" },
  { round: 4,  home: "BANCO PROVINCIA", away: "CIRCULO DVO" },
  { round: 4,  home: "AL VER VERAS",    away: "LIBERTAD" },
  { round: 4,  home: "EL CAÑON",        away: "SAN LORENZO" },
  // QUINTA FECHA
  { round: 5,  home: "BOCA JRS",        away: "EL CAÑON" },
  { round: 5,  home: "SAN LORENZO",     away: "AL VER VERAS" },
  { round: 5,  home: "LIBERTAD",        away: "BANCO PROVINCIA" },
  { round: 5,  home: "CIRCULO DVO",     away: "SAN JOSE" },
  { round: 5,  home: "GRAL. URQUIZA",   away: "SAN ISIDRO" },
  { round: 5,  home: "ALM. FLORIDA",    away: "RACING" },
  { round: 5,  home: "COLEGIALES",      away: "CHAPADMALAL" },
  // SEXTA FECHA
  { round: 6,  home: "COLEGIALES",      away: "BOCA JRS" },
  { round: 6,  home: "CHAPADMALAL",     away: "ALM. FLORIDA" },
  { round: 6,  home: "RACING",          away: "GRAL. URQUIZA" },
  { round: 6,  home: "SAN ISIDRO",      away: "CIRCULO DVO" },
  { round: 6,  home: "SAN JOSE",        away: "LIBERTAD" },
  { round: 6,  home: "BANCO PROVINCIA", away: "SAN LORENZO" },
  { round: 6,  home: "AL VER VERAS",    away: "EL CAÑON" },
  // SEPTIMA FECHA
  { round: 7,  home: "BOCA JRS",        away: "AL VER VERAS" },
  { round: 7,  home: "EL CAÑON",        away: "BANCO PROVINCIA" },
  { round: 7,  home: "SAN LORENZO",     away: "SAN JOSE" },
  { round: 7,  home: "LIBERTAD",        away: "SAN ISIDRO" },
  { round: 7,  home: "CIRCULO DVO",     away: "RACING" },
  { round: 7,  home: "GRAL. URQUIZA",   away: "CHAPADMALAL" },
  { round: 7,  home: "ALM. FLORIDA",    away: "COLEGIALES" },
  // OCTAVA FECHA
  { round: 8,  home: "ALM. FLORIDA",    away: "BOCA JRS" },
  { round: 8,  home: "COLEGIALES",      away: "GRAL. URQUIZA" },
  { round: 8,  home: "CHAPADMALAL",     away: "CIRCULO DVO" },
  { round: 8,  home: "RACING",          away: "LIBERTAD" },
  { round: 8,  home: "SAN ISIDRO",      away: "SAN LORENZO" },
  { round: 8,  home: "SAN JOSE",        away: "EL CAÑON" },
  { round: 8,  home: "BANCO PROVINCIA", away: "AL VER VERAS" },
  // NOVENA FECHA
  { round: 9,  home: "BOCA JRS",        away: "BANCO PROVINCIA" },
  { round: 9,  home: "AL VER VERAS",    away: "SAN JOSE" },
  { round: 9,  home: "EL CAÑON",        away: "SAN ISIDRO" },
  { round: 9,  home: "SAN LORENZO",     away: "RACING" },
  { round: 9,  home: "LIBERTAD",        away: "CHAPADMALAL" },
  { round: 9,  home: "CIRCULO DVO",     away: "COLEGIALES" },
  { round: 9,  home: "GRAL. URQUIZA",   away: "ALM. FLORIDA" },
  // DECIMA FECHA
  { round: 10, home: "GRAL. URQUIZA",   away: "BOCA JRS" },
  { round: 10, home: "ALM. FLORIDA",    away: "CIRCULO DVO" },
  { round: 10, home: "COLEGIALES",      away: "LIBERTAD" },
  { round: 10, home: "CHAPADMALAL",     away: "SAN LORENZO" },
  { round: 10, home: "RACING",          away: "EL CAÑON" },
  { round: 10, home: "SAN ISIDRO",      away: "AL VER VERAS" },
  { round: 10, home: "SAN JOSE",        away: "BANCO PROVINCIA" },
  // DECIMOPRIMERA FECHA
  { round: 11, home: "BOCA JRS",        away: "SAN JOSE" },
  { round: 11, home: "BANCO PROVINCIA", away: "SAN ISIDRO" },
  { round: 11, home: "AL VER VERAS",    away: "RACING" },
  { round: 11, home: "EL CAÑON",        away: "CHAPADMALAL" },
  { round: 11, home: "SAN LORENZO",     away: "COLEGIALES" },
  { round: 11, home: "LIBERTAD",        away: "ALM. FLORIDA" },
  { round: 11, home: "CIRCULO DVO",     away: "GRAL. URQUIZA" },
  // DECIMOSEGUNDA FECHA
  { round: 12, home: "CIRCULO DVO",     away: "BOCA JRS" },
  { round: 12, home: "GRAL. URQUIZA",   away: "LIBERTAD" },
  { round: 12, home: "ALM. FLORIDA",    away: "SAN LORENZO" },
  { round: 12, home: "COLEGIALES",      away: "EL CAÑON" },
  { round: 12, home: "CHAPADMALAL",     away: "AL VER VERAS" },
  { round: 12, home: "RACING",          away: "BANCO PROVINCIA" },
  { round: 12, home: "SAN ISIDRO",      away: "SAN JOSE" },
  // DECIMOTERCERA FECHA
  { round: 13, home: "BOCA JRS",        away: "SAN ISIDRO" },
  { round: 13, home: "SAN JOSE",        away: "RACING" },
  { round: 13, home: "BANCO PROVINCIA", away: "CHAPADMALAL" },
  { round: 13, home: "AL VER VERAS",    away: "COLEGIALES" },
  { round: 13, home: "EL CAÑON",        away: "ALM. FLORIDA" },
  { round: 13, home: "SAN LORENZO",     away: "GRAL. URQUIZA" },
  { round: 13, home: "LIBERTAD",        away: "CIRCULO DVO" },
];

export const MOCK_MATCHES_PROMOCION: Match[] = [];

MOCK_TOURNAMENTS.forEach(tournament => {
  FIXTURE_PROMOCION.forEach(({ round, home, away }) => {
    MOCK_MATCHES_PROMOCION.push({
      id: `match-prom-${matchIdCounter++}`,
      tournament_id: tournament.id,
      division_id: 'd1',
      zone_id: 'prom',
      round_number: round,
      home_team_id: promId(home),
      away_team_id: promId(away),
      home_goals: null,
      away_goals: null,
      status: 'scheduled',
      match_date: null,
    });
  });
});
