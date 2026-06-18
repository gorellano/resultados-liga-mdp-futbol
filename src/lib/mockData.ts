import type { Team, Match, Tournament } from './types';

// Escudos generados y descargados de internet (.png/.svg)
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
  "Club Banco Provincia de Mar del Plata": "/logos/banco_provincia.svg",
  "Club Social y Deportivo Chapadmalal": "/logos/chapadmalal.svg",
  "San José": "/logos/san_jose.png",
  "Racing": "/logos/racing.png",
  "San Isidro": "/logos/san_isidro.png",
  "General Mitre": "/logos/general_mitre.png",
};


const TEAMS_CAMPEONATO_NAMES = [
  "Talleres de Mar del Plata", "Deportivo Norte", "Kimberley", "Once Unidos", 
  "Aldosivi", "Banfield", "Atlético Mar del Plata", "Argentinos del Sud", 
  "Independiente", "River Plate", "Cadetes", "Nacion", "Alvarado", "Quilmes"
];

const TEAMS_PROMOCION_NAMES = [
  "Boca Juniors", "Libertad", "Circulo Deportivo", "San Lorenzo", 
  "General Urquiza", "El cañon", "Almagro Florida", "Al Ver Veras", 
  "Colegiales/Siciliano", "Club Banco Provincia de Mar del Plata", "Club Social y Deportivo Chapadmalal", "San José", 
  "Racing", "San Isidro"
];

export const MOCK_TEAMS_CAMPEONATO: Team[] = TEAMS_CAMPEONATO_NAMES.map((name, i) => ({
  id: `camp-team-${i}`,
  name,
  logo_url: LOGOS[name] || null
}));

export const MOCK_TEAMS_PROMOCION: Team[] = TEAMS_PROMOCION_NAMES.map((name, i) => ({
  id: `prom-team-${i}`,
  name,
  logo_url: LOGOS[name] || null
}));

export const MOCK_TOURNAMENTS: Tournament[] = [
  { id: 't1', name: 'Apertura', year: 2026 },
  { id: 't2', name: 'Clausura', year: 2026 },
  { id: 't3', name: 'Oficial', year: 2025 },
];

export const MOCK_MATCHES_CAMPEONATO: Match[] = [];
let matchIdCounter = 1;

MOCK_TOURNAMENTS.forEach(tournament => {
  for (let round = 1; round <= 3; round++) {
    for (let i = 0; i < 7; i++) {
      const homeTeam = MOCK_TEAMS_CAMPEONATO[i];
      const awayTeam = MOCK_TEAMS_CAMPEONATO[13 - i];
      
      // If it's a past tournament (2025) or past rounds of Apertura 2026
      const isFinished = tournament.year === 2025 || (tournament.name === 'Apertura' && round < 3);
      
      MOCK_MATCHES_CAMPEONATO.push({
        id: `match-${matchIdCounter++}`,
        tournament_id: tournament.id,
        division_id: 'd1',
        zone_id: 'camp',
        round_number: round,
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id,
        home_goals: isFinished ? Math.floor(Math.random() * 4) : null,
        away_goals: isFinished ? Math.floor(Math.random() * 4) : null,
        status: isFinished ? 'finished' : 'scheduled',
        match_date: isFinished ? `${tournament.year}-06-10T15:00:00Z` : `${tournament.year}-06-20T15:00:00Z`,
      });
    }
  }
});

// Same for promocion
export const MOCK_MATCHES_PROMOCION: Match[] = [];
MOCK_TOURNAMENTS.forEach(tournament => {
  for (let round = 1; round <= 3; round++) {
    for (let i = 0; i < 7; i++) {
      const homeTeam = MOCK_TEAMS_PROMOCION[i];
      const awayTeam = MOCK_TEAMS_PROMOCION[13 - i];
      const isFinished = tournament.year === 2025 || (tournament.name === 'Apertura' && round < 3);
      
      MOCK_MATCHES_PROMOCION.push({
        id: `match-${matchIdCounter++}`,
        tournament_id: tournament.id,
        division_id: 'd1',
        zone_id: 'prom',
        round_number: round,
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id,
        home_goals: isFinished ? Math.floor(Math.random() * 4) : null,
        away_goals: isFinished ? Math.floor(Math.random() * 4) : null,
        status: isFinished ? 'finished' : 'scheduled',
        match_date: isFinished ? `${tournament.year}-06-10T15:00:00Z` : `${tournament.year}-06-20T15:00:00Z`,
      });
    }
  }
});
