import { describe, it, expect } from 'vitest';
import { calculateH2HStats } from '../lib/h2h';
import type { Match, Standing } from '../lib/types';

describe('h2h.ts - Cálculo de estadísticas Head to Head', () => {
  const teamA = 'team-1';
  const teamB = 'team-2';

  const mockMatches: Match[] = [
    {
      id: 'm1',
      tournament_id: 't1',
      division_id: 'd1',
      zone_id: 'z1',
      round_number: 1,
      home_team_id: teamA,
      away_team_id: teamB,
      home_goals: 3,
      away_goals: 1,
      status: 'finished',
      match_date: null
    },
    {
      id: 'm2',
      tournament_id: 't1',
      division_id: 'd1',
      zone_id: 'z1',
      round_number: 2,
      home_team_id: teamB,
      away_team_id: teamA,
      home_goals: 2,
      away_goals: 2,
      status: 'finished',
      match_date: null
    },
    {
      id: 'm3',
      tournament_id: 't1',
      division_id: 'd1',
      zone_id: 'z1',
      round_number: 3,
      home_team_id: teamA,
      away_team_id: teamB,
      home_goals: null,
      away_goals: null,
      status: 'scheduled',
      match_date: null
    }
  ];

  const mockStandings: Standing[] = [
    {
      team: { id: teamA, name: 'Aldosivi', logo_url: null },
      played: 5,
      won: 4,
      drawn: 1,
      lost: 0,
      goalsFor: 12,
      goalsAgainst: 3,
      goalDifference: 9,
      points: 13
    },
    {
      team: { id: teamB, name: 'Kimberley', logo_url: null },
      played: 5,
      won: 3,
      drawn: 1,
      lost: 1,
      goalsFor: 8,
      goalsAgainst: 5,
      goalDifference: 3,
      points: 10
    }
  ];

  it('debe filtrar unicamente partidos finalizados entre ambos equipos', () => {
    const stats = calculateH2HStats(teamA, teamB, mockMatches, mockStandings);
    expect(stats.matchesPlayed).toBe(2);
  });

  it('debe calcular victorias, empates y goles acumulados correctamente', () => {
    const stats = calculateH2HStats(teamA, teamB, mockMatches, mockStandings);
    expect(stats.winsA).toBe(1);
    expect(stats.winsB).toBe(0);
    expect(stats.draws).toBe(1);
    expect(stats.goalsA).toBe(5); // 3 + 2
    expect(stats.goalsB).toBe(3); // 1 + 2
    expect(stats.dominantTeamId).toBe(teamA);
  });

  it('debe vincular la posicion y puntos de la tabla si estan provistos', () => {
    const stats = calculateH2HStats(teamA, teamB, mockMatches, mockStandings);
    expect(stats.standingA?.points).toBe(13);
    expect(stats.standingB?.points).toBe(10);
  });
});
