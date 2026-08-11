import type { Match, Standing } from './types';

export interface H2HStats {
  matchesPlayed: number;
  winsA: number;
  winsB: number;
  draws: number;
  goalsA: number;
  goalsB: number;
  h2hMatches: Match[];
  standingA?: Standing | null;
  standingB?: Standing | null;
  dominantTeamId?: string | null;
}

export function calculateH2HStats(
  teamAId: string,
  teamBId: string,
  allMatches: Match[],
  standings: Standing[] = []
): H2HStats {
  const h2hMatches = allMatches.filter(m => 
    m.status === 'finished' &&
    ((m.home_team_id === teamAId && m.away_team_id === teamBId) ||
     (m.home_team_id === teamBId && m.away_team_id === teamAId))
  ).sort((a, b) => (b.round_number ?? 0) - (a.round_number ?? 0));

  let winsA = 0;
  let winsB = 0;
  let draws = 0;
  let goalsA = 0;
  let goalsB = 0;

  h2hMatches.forEach(m => {
    const isAHome = m.home_team_id === teamAId;
    const homeGoals = m.home_goals ?? 0;
    const awayGoals = m.away_goals ?? 0;

    const gA = isAHome ? homeGoals : awayGoals;
    const gB = isAHome ? awayGoals : homeGoals;

    goalsA += gA;
    goalsB += gB;

    if (gA > gB) {
      winsA += 1;
    } else if (gB > gA) {
      winsB += 1;
    } else {
      draws += 1;
    }
  });

  const standingA = standings.find(s => s.team.id === teamAId) || null;
  const standingB = standings.find(s => s.team.id === teamBId) || null;

  let dominantTeamId: string | null = null;
  if (winsA > winsB) dominantTeamId = teamAId;
  else if (winsB > winsA) dominantTeamId = teamBId;

  return {
    matchesPlayed: h2hMatches.length,
    winsA,
    winsB,
    draws,
    goalsA,
    goalsB,
    h2hMatches,
    standingA,
    standingB,
    dominantTeamId
  };
}
