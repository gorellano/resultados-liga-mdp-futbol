import { describe, it, expect } from 'vitest';
import {
  MOCK_TEAMS_CAMPEONATO,
  MOCK_TEAMS_PROMOCION,
  MOCK_MATCHES_CAMPEONATO,
  MOCK_MATCHES_PROMOCION,
  MOCK_TOURNAMENTS,
} from '../lib/mockData';

describe('MOCK_TEAMS_CAMPEONATO', () => {
  it('has exactly 14 teams', () => {
    expect(MOCK_TEAMS_CAMPEONATO).toHaveLength(14);
  });

  it('every team has a unique id', () => {
    const ids = MOCK_TEAMS_CAMPEONATO.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every team has a name', () => {
    MOCK_TEAMS_CAMPEONATO.forEach(t => {
      expect(t.name.trim()).not.toBe('');
    });
  });
});

describe('MOCK_TEAMS_PROMOCION', () => {
  it('has exactly 14 teams', () => {
    expect(MOCK_TEAMS_PROMOCION).toHaveLength(14);
  });

  it('every team has a unique id', () => {
    const ids = MOCK_TEAMS_PROMOCION.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('MOCK_TOURNAMENTS', () => {
  it('has at least 1 tournament', () => {
    expect(MOCK_TOURNAMENTS.length).toBeGreaterThanOrEqual(1);
  });

  it('every tournament has a name and year', () => {
    MOCK_TOURNAMENTS.forEach(t => {
      expect(t.name.trim()).not.toBe('');
      expect(t.year).toBeGreaterThan(2000);
    });
  });
});

describe('MOCK_MATCHES_CAMPEONATO fixture structure', () => {
  // The fixture has 13 rounds × 7 matches = 91 matches per tournament
  const matchesPerTournament = 91;
  const tournaments = MOCK_TOURNAMENTS.length;

  it(`has ${matchesPerTournament * tournaments} total matches (${matchesPerTournament} × ${tournaments} torneos)`, () => {
    expect(MOCK_MATCHES_CAMPEONATO).toHaveLength(matchesPerTournament * tournaments);
  });

  it('has 13 distinct rounds', () => {
    const rounds = new Set(MOCK_MATCHES_CAMPEONATO.map(m => m.round_number));
    expect(rounds.size).toBe(13);
    for (let r = 1; r <= 13; r++) {
      expect(rounds.has(r)).toBe(true);
    }
  });

  it('each round within one tournament has exactly 7 matches', () => {
    const tournament = MOCK_TOURNAMENTS[0];
    for (let round = 1; round <= 13; round++) {
      const matchesInRound = MOCK_MATCHES_CAMPEONATO.filter(
        m => m.tournament_id === tournament.id && m.round_number === round
      );
      expect(matchesInRound).toHaveLength(7);
    }
  });

  it('all matches reference valid team IDs', () => {
    const validIds = new Set(MOCK_TEAMS_CAMPEONATO.map(t => t.id));
    MOCK_MATCHES_CAMPEONATO.forEach(m => {
      expect(validIds.has(m.home_team_id)).toBe(true);
      expect(validIds.has(m.away_team_id)).toBe(true);
    });
  });

  it('no team plays itself', () => {
    MOCK_MATCHES_CAMPEONATO.forEach(m => {
      expect(m.home_team_id).not.toBe(m.away_team_id);
    });
  });

  it('all matches start as scheduled with no goals', () => {
    MOCK_MATCHES_CAMPEONATO.forEach(m => {
      expect(m.status).toBe('scheduled');
      expect(m.home_goals).toBeNull();
      expect(m.away_goals).toBeNull();
    });
  });

  it('Fecha 1 has the correct first match: Talleres vs Deportivo Norte', () => {
    const firstTournament = MOCK_TOURNAMENTS[0];
    const fecha1 = MOCK_MATCHES_CAMPEONATO.filter(
      m => m.tournament_id === firstTournament.id && m.round_number === 1
    );
    const firstMatch = fecha1[0];
    const homeTeam = MOCK_TEAMS_CAMPEONATO.find(t => t.id === firstMatch.home_team_id);
    const awayTeam = MOCK_TEAMS_CAMPEONATO.find(t => t.id === firstMatch.away_team_id);
    expect(homeTeam?.name).toBe('Talleres de Mar del Plata');
    expect(awayTeam?.name).toBe('Deportivo Norte');
  });
});

describe('MOCK_MATCHES_PROMOCION fixture structure', () => {
  it('has the same number of total matches as campeonato', () => {
    expect(MOCK_MATCHES_PROMOCION).toHaveLength(MOCK_MATCHES_CAMPEONATO.length);
  });

  it('all matches reference valid promo team IDs', () => {
    const validIds = new Set(MOCK_TEAMS_PROMOCION.map(t => t.id));
    MOCK_MATCHES_PROMOCION.forEach(m => {
      expect(validIds.has(m.home_team_id)).toBe(true);
      expect(validIds.has(m.away_team_id)).toBe(true);
    });
  });

  it('no team plays itself', () => {
    MOCK_MATCHES_PROMOCION.forEach(m => {
      expect(m.home_team_id).not.toBe(m.away_team_id);
    });
  });
});
