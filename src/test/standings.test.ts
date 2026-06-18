import { describe, it, expect } from 'vitest';
import { calculateStandings } from '../lib/standings';
import type { Match, Team } from '../lib/types';

const teamA: Team = { id: 'a', name: 'Team A', logo_url: null };
const teamB: Team = { id: 'b', name: 'Team B', logo_url: null };
const teamC: Team = { id: 'c', name: 'Team C', logo_url: null };
const teams = [teamA, teamB, teamC];

function makeMatch(overrides: Partial<Match> & { home: Team; away: Team; hg: number | null; ag: number | null }): Match {
  return {
    id:           `m-${Math.random()}`,
    tournament_id: 't1',
    division_id:  'd1',
    zone_id:      'camp',
    round_number: 1,
    home_team_id: overrides.home.id,
    away_team_id: overrides.away.id,
    home_goals:   overrides.hg,
    away_goals:   overrides.ag,
    status:       overrides.hg !== null ? 'finished' : 'scheduled',
    match_date:   null,
  };
}

describe('calculateStandings', () => {
  it('returns all teams even with no matches', () => {
    const result = calculateStandings([], teams);
    expect(result).toHaveLength(3);
    result.forEach(row => {
      expect(row.played).toBe(0);
      expect(row.points).toBe(0);
    });
  });

  it('awards 3 points to the winner', () => {
    const match = makeMatch({ home: teamA, away: teamB, hg: 2, ag: 0 });
    const result = calculateStandings([match], teams);
    const rowA = result.find(r => r.team.id === 'a')!;
    const rowB = result.find(r => r.team.id === 'b')!;
    expect(rowA.points).toBe(3);
    expect(rowA.won).toBe(1);
    expect(rowA.played).toBe(1);
    expect(rowB.points).toBe(0);
    expect(rowB.lost).toBe(1);
  });

  it('awards 1 point to each team on a draw', () => {
    const match = makeMatch({ home: teamA, away: teamB, hg: 1, ag: 1 });
    const result = calculateStandings([match], teams);
    const rowA = result.find(r => r.team.id === 'a')!;
    const rowB = result.find(r => r.team.id === 'b')!;
    expect(rowA.points).toBe(1);
    expect(rowA.drawn).toBe(1);
    expect(rowB.points).toBe(1);
    expect(rowB.drawn).toBe(1);
  });

  it('correctly counts goals for and against', () => {
    const match = makeMatch({ home: teamA, away: teamB, hg: 3, ag: 1 });
    const result = calculateStandings([match], teams);
    const rowA = result.find(r => r.team.id === 'a')!;
    const rowB = result.find(r => r.team.id === 'b')!;
    expect(rowA.goalsFor).toBe(3);
    expect(rowA.goalsAgainst).toBe(1);
    expect(rowA.goalDifference).toBe(2);
    expect(rowB.goalsFor).toBe(1);
    expect(rowB.goalsAgainst).toBe(3);
    expect(rowB.goalDifference).toBe(-2);
  });

  it('skips scheduled (unplayed) matches', () => {
    const match = makeMatch({ home: teamA, away: teamB, hg: null, ag: null });
    const result = calculateStandings([match], teams);
    result.forEach(row => {
      expect(row.played).toBe(0);
      expect(row.points).toBe(0);
    });
  });

  it('sorts by points descending', () => {
    const m1 = makeMatch({ home: teamA, away: teamB, hg: 2, ag: 0 }); // A: 3pts
    const m2 = makeMatch({ home: teamB, away: teamC, hg: 1, ag: 1 }); // B,C: 1pt each
    const result = calculateStandings([m1, m2], teams);
    expect(result[0].team.id).toBe('a');
  });

  it('uses goal difference as secondary sort', () => {
    // A and B both 3 pts, A has +2 GD, B has +1 GD
    const m1 = makeMatch({ home: teamA, away: teamC, hg: 3, ag: 1 }); // A: +2
    const m2 = makeMatch({ home: teamB, away: teamC, hg: 2, ag: 1 }); // B: +1
    const result = calculateStandings([m1, m2], teams);
    expect(result[0].team.id).toBe('a');
    expect(result[1].team.id).toBe('b');
  });

  it('accumulates multiple matches for same team', () => {
    const m1 = makeMatch({ home: teamA, away: teamB, hg: 1, ag: 0 }); // A wins
    const m2 = makeMatch({ home: teamA, away: teamC, hg: 2, ag: 0 }); // A wins again
    const result = calculateStandings([m1, m2], teams);
    const rowA = result.find(r => r.team.id === 'a')!;
    expect(rowA.points).toBe(6);
    expect(rowA.played).toBe(2);
    expect(rowA.won).toBe(2);
    expect(rowA.goalsFor).toBe(3);
  });
});
