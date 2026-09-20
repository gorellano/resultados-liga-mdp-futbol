import type { Match, Team, Standing, Division, ClubAnnualStanding } from './types';

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

/**
 * Calcula la tabla general combinando los partidos de todas las zonas,
 * ordenada por promedio (puntos / partidos jugados) para normalizar
 * equipos de zonas con distinta cantidad de participantes.
 */
export function calculatePromedioStandings(
  allMatches: Match[],
  allTeams: Team[]
): (Standing & { promedio: number })[] {
  const standings = calculateStandings(allMatches, allTeams);

  return standings
    .map(s => ({
      ...s,
      promedio: s.played > 0 ? s.points / s.played : 0,
    }))
    .sort((a, b) => {
      const diff = b.promedio - a.promedio;
      if (Math.abs(diff) > 0.0001) return diff;
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.team.name.localeCompare(b.team.name);
    });
}

/**
 * Calcula la Tabla Anual Acumulada de Clubes consolidando los puntos
 * de cada división y de todos los torneos disputados en el año.
 */
export function calculateAnnualClubStandings(
  matches: Match[],
  teams: Team[],
  divisions: Division[]
): ClubAnnualStanding[] {
  const clubMap: Record<string, ClubAnnualStanding> = {};

  teams.forEach(team => {
    const divisionPoints: Record<string, number> = {};
    divisions.forEach(div => {
      divisionPoints[div.id] = 0;
    });

    clubMap[team.id] = {
      team,
      divisionPoints,
      totalPoints: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    };
  });

  matches.forEach(match => {
    if (match.status !== 'finished' || match.home_goals === null || match.away_goals === null) return;

    const home = clubMap[match.home_team_id];
    const away = clubMap[match.away_team_id];

    if (!home || !away) return;

    home.played += 1;
    away.played += 1;

    home.goalsFor += match.home_goals;
    home.goalsAgainst += match.away_goals;
    home.goalDifference = home.goalsFor - home.goalsAgainst;

    away.goalsFor += match.away_goals;
    away.goalsAgainst += match.home_goals;
    away.goalDifference = away.goalsFor - away.goalsAgainst;

    if (match.home_goals > match.away_goals) {
      home.won += 1;
      home.totalPoints += 3;
      if (match.division_id) {
        home.divisionPoints[match.division_id] = (home.divisionPoints[match.division_id] || 0) + 3;
      }
      away.lost += 1;
    } else if (match.home_goals < match.away_goals) {
      away.won += 1;
      away.totalPoints += 3;
      if (match.division_id) {
        away.divisionPoints[match.division_id] = (away.divisionPoints[match.division_id] || 0) + 3;
      }
      home.lost += 1;
    } else {
      home.drawn += 1;
      home.totalPoints += 1;
      if (match.division_id) {
        home.divisionPoints[match.division_id] = (home.divisionPoints[match.division_id] || 0) + 1;
      }
      away.drawn += 1;
      away.totalPoints += 1;
      if (match.division_id) {
        away.divisionPoints[match.division_id] = (away.divisionPoints[match.division_id] || 0) + 1;
      }
    }
  });

  // Filtrar solo los clubes que tengan partidos jugados o que pertenezcan a la liga
  const list = Object.values(clubMap).filter(c => c.played > 0 || c.totalPoints > 0);

  // Si aún no se jugó ningún partido, devolver todos los equipos inicializados en 0
  const finalList = list.length > 0 ? list : Object.values(clubMap);

  finalList.sort((a, b) => {
    // 1. Puntos Totales
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    // 2. Diferencia de Gol
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    // 3. Goles a Favor
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    // 4. Nombre
    const nameA = a.team.display_name || a.team.name;
    const nameB = b.team.display_name || b.team.name;
    return nameA.localeCompare(nameB);
  });

  return finalList;
}

