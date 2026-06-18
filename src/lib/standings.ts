import type { Match, Team, Standing } from './types';

export function calculateStandings(matches: Match[], teams: Team[]): Standing[] {
  const standingsMap: Record<string, Standing> = {};

  // Initialize standings for all teams
  teams.forEach(team => {
    standingsMap[team.id] = {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    };
  });

  // Process each finished match
  matches.forEach(match => {
    if (match.status !== 'finished' || match.home_goals === null || match.away_goals === null) return;

    const home = standingsMap[match.home_team_id];
    const away = standingsMap[match.away_team_id];

    if (!home || !away) return; // Team might not be in the provided list

    // Update played matches
    home.played += 1;
    away.played += 1;

    // Update goals
    home.goalsFor += match.home_goals;
    home.goalsAgainst += match.away_goals;
    home.goalDifference = home.goalsFor - home.goalsAgainst;

    away.goalsFor += match.away_goals;
    away.goalsAgainst += match.home_goals;
    away.goalDifference = away.goalsFor - away.goalsAgainst;

    // Update W/D/L and points
    if (match.home_goals > match.away_goals) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (match.home_goals < match.away_goals) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      home.points += 1;
      away.drawn += 1;
      away.points += 1;
    }
  });

  // Convert map to array and sort
  const standingsArray = Object.values(standingsMap);

  standingsArray.sort((a, b) => {
    // 1. Points
    if (b.points !== a.points) return b.points - a.points;
    // 2. Goal Difference
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    // 3. Goals For
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    // 4. Alphabetical by name
    return a.team.name.localeCompare(b.team.name);
  });

  return standingsArray;
}
