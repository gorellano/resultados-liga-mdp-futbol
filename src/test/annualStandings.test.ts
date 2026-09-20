import { describe, it, expect } from 'vitest';
import { calculateAnnualClubStandings } from '../lib/standings';
import type { Match, Team, Division } from '../lib/types';

describe('calculateAnnualClubStandings', () => {
  const teamA: Team = { id: 'team-a', name: 'Club Atlético Aldosivi', display_name: 'Aldosivi', logo_url: null };
  const teamB: Team = { id: 'team-b', name: 'Club Atlético Kimberley', display_name: 'Kimberley', logo_url: null };
  const teamC: Team = { id: 'team-c', name: 'Club Atlético Alvarado', display_name: 'Alvarado', logo_url: null };

  const div7: Division = { id: 'div-7', name: '7ma División', sort_order: 1 };
  const div8: Division = { id: 'div-8', name: '8va División', sort_order: 2 };
  const div9: Division = { id: 'div-9', name: '9na División', sort_order: 3 };

  const divisions = [div7, div8, div9];
  const teams = [teamA, teamB, teamC];

  it('should calculate points per division and total accumulated points correctly', () => {
    const matches: Match[] = [
      // 7ma: Team A 2 - 1 Team B (Team A +3, Team B 0)
      {
        id: 'm1',
        tournament_id: 't-2026-1',
        division_id: 'div-7',
        zone_id: 'z1',
        round_number: 1,
        home_team_id: 'team-a',
        away_team_id: 'team-b',
        home_goals: 2,
        away_goals: 1,
        status: 'finished',
        match_date: '2026-04-10',
      },
      // 8va: Team B 3 - 0 Team A (Team B +3, Team A 0)
      {
        id: 'm2',
        tournament_id: 't-2026-1',
        division_id: 'div-8',
        zone_id: 'z1',
        round_number: 1,
        home_team_id: 'team-b',
        away_team_id: 'team-a',
        home_goals: 3,
        away_goals: 0,
        status: 'finished',
        match_date: '2026-04-10',
      },
      // 9na: Team A 1 - 1 Team B (Team A +1, Team B +1)
      {
        id: 'm3',
        tournament_id: 't-2026-1',
        division_id: 'div-9',
        zone_id: 'z1',
        round_number: 1,
        home_team_id: 'team-a',
        away_team_id: 'team-b',
        home_goals: 1,
        away_goals: 1,
        status: 'finished',
        match_date: '2026-04-10',
      },
    ];

    const standings = calculateAnnualClubStandings(matches, teams, divisions);

    expect(standings.length).toBe(2); // Team C has no matches

    const standingA = standings.find(s => s.team.id === 'team-a');
    const standingB = standings.find(s => s.team.id === 'team-b');

    expect(standingA).toBeDefined();
    expect(standingB).toBeDefined();

    // Team A: 7ma=3, 8va=0, 9na=1 -> Total: 4 pts, PJ=3, PG=1, PE=1, PP=1, GF=3, GC=5, DIF=-2
    expect(standingA?.divisionPoints['div-7']).toBe(3);
    expect(standingA?.divisionPoints['div-8']).toBe(0);
    expect(standingA?.divisionPoints['div-9']).toBe(1);
    expect(standingA?.totalPoints).toBe(4);
    expect(standingA?.played).toBe(3);
    expect(standingA?.won).toBe(1);
    expect(standingA?.drawn).toBe(1);
    expect(standingA?.lost).toBe(1);
    expect(standingA?.goalsFor).toBe(3);
    expect(standingA?.goalsAgainst).toBe(5);
    expect(standingA?.goalDifference).toBe(-2);

    // Team B: 7ma=0, 8va=3, 9na=1 -> Total: 4 pts, PJ=3, PG=1, PE=1, PP=1, GF=5, GC=3, DIF=+2
    expect(standingB?.divisionPoints['div-7']).toBe(0);
    expect(standingB?.divisionPoints['div-8']).toBe(3);
    expect(standingB?.divisionPoints['div-9']).toBe(1);
    expect(standingB?.totalPoints).toBe(4);
    expect(standingB?.goalDifference).toBe(2);

    // Tie-break: Team B has +2 DIF, Team A has -2 DIF -> Team B is 1st, Team A is 2nd
    expect(standings[0].team.id).toBe('team-b');
    expect(standings[1].team.id).toBe('team-a');
  });

  it('should accumulate points across multiple tournaments in the same annual season', () => {
    const matches: Match[] = [
      // Tournament 1 (Apertura)
      {
        id: 'm1',
        tournament_id: 'tourn-apertura-2026',
        division_id: 'div-7',
        zone_id: 'z1',
        round_number: 1,
        home_team_id: 'team-a',
        away_team_id: 'team-c',
        home_goals: 3,
        away_goals: 0,
        status: 'finished',
        match_date: '2026-05-01',
      },
      // Tournament 2 (Clausura)
      {
        id: 'm2',
        tournament_id: 'tourn-clausura-2026',
        division_id: 'div-7',
        zone_id: 'z1',
        round_number: 1,
        home_team_id: 'team-c',
        away_team_id: 'team-a',
        home_goals: 1,
        away_goals: 2,
        status: 'finished',
        match_date: '2026-09-01',
      },
    ];

    const standings = calculateAnnualClubStandings(matches, teams, divisions);

    const standingA = standings.find(s => s.team.id === 'team-a');
    expect(standingA?.totalPoints).toBe(6); // 3 pts (Apertura) + 3 pts (Clausura)
    expect(standingA?.divisionPoints['div-7']).toBe(6);
    expect(standingA?.played).toBe(2);
  });
});
