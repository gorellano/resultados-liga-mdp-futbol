import { describe, it, expect } from 'vitest';
import { 
  calculateAdaroZoneStandings, 
  groupZoneMatchesIntoTiras,
  getDivisionOrder,
  CUP_BADGES
} from '../lib/adaroStandings';
import { 
  ADARO_TOURNAMENT_ID, 
  ADARO_PUNTUABLE_DIVISION_IDS,
  ADARO_FORMATIVE_DIVISION_IDS,
  isAdaroPuntuableDivision,
  isAdaroParticipativeDivision,
  resolveAdaroPuntuableDivisionIds,
  resolveAdaroAllDivisionIds
} from '../lib/mockAdaroData';
import type { Match, Team, Division } from '../lib/types';

describe('Torneo Armando "Chamaco" Adaro - Standings, Reglas y Promedios', () => {
  const dummyTeams: Team[] = [
    { id: 'team-1', name: 'Club Atlético Kimberley', display_name: 'Kimberley', logo_url: null },
    { id: 'team-2', name: 'Boca Juniors de Mar del Plata', display_name: 'Boca', logo_url: null },
    { id: 'team-3', name: 'General Urquiza', display_name: 'Urquiza', logo_url: null },
    { id: 'team-4', name: 'Talleres de Mar del Plata', display_name: 'Talleres', logo_url: null },
  ];

  const dummyDivisions: Division[] = [
    { id: ADARO_PUNTUABLE_DIVISION_IDS[0], name: '7ma División', sort_order: 1 },
    { id: ADARO_PUNTUABLE_DIVISION_IDS[1], name: '8va División', sort_order: 2 },
    { id: ADARO_PUNTUABLE_DIVISION_IDS[2], name: '9na División', sort_order: 3 },
    { id: ADARO_PUNTUABLE_DIVISION_IDS[3], name: '10ma División', sort_order: 4 },
    { id: ADARO_PUNTUABLE_DIVISION_IDS[4], name: '11ma División', sort_order: 5 },
    { id: ADARO_PUNTUABLE_DIVISION_IDS[5], name: '12ma División', sort_order: 6 },
    { id: ADARO_PUNTUABLE_DIVISION_IDS[6], name: '13ra División', sort_order: 7 },
    { id: ADARO_PUNTUABLE_DIVISION_IDS[7], name: '14ta División', sort_order: 8 },
    { id: ADARO_FORMATIVE_DIVISION_IDS[0], name: '15ta División', sort_order: 9 },
    { id: ADARO_FORMATIVE_DIVISION_IDS[1], name: '16ta División', sort_order: 10 },
    { id: ADARO_FORMATIVE_DIVISION_IDS[2], name: '17ma División', sort_order: 11 },
  ];

  describe('1. Filtrado de Divisiones Puntuables vs No Puntuables', () => {
    it('debe identificar correctamente las 8 categorías puntuables (7ª a 14ª)', () => {
      const validPuntuables = [
        '7ma División', '7ª División', 'Séptima', '7ma',
        '8va División', '8ª División', 'Octava', '8va',
        '9na División', '9ª División', 'Novena', '9na',
        '10ma División', '10ª División', 'Décima', '10ma',
        '11ma División', '11ª División', 'Undécima', '11ma',
        '12ma División', '12ª División', 'Duodécima', '12ma',
        '13ra División', '13ª División', 'Decimotercera', '13ra',
        '14ta División', '14ª División', 'Decimocuarta', '14ta'
      ];

      validPuntuables.forEach(name => {
        expect(isAdaroPuntuableDivision({ id: 'dummy-id', name }), `Falló para ${name}`).toBe(true);
      });
    });

    it('debe rechazar categorías formativas 15ª, 16ª y 17ª como puntuables (NO suman a la tira)', () => {
      const nonPuntuables = [
        '15ta División', '15ª División', 'Decimoquinta', 'Décima Quinta',
        '16ta División', '16ª División', 'Decimosexta', 'Décima Sexta',
        '17ma División', '17ª División', 'Decimoséptima', 'Décima Séptima',
        'Categoría 2018 (15ª)', 'Categoría 2019 (16ª)', 'Categoría 2020 (17ª)',
        'Pre-Décima Promocional', 'Formativa 2018'
      ];

      nonPuntuables.forEach(name => {
        expect(isAdaroPuntuableDivision({ id: 'dummy-id', name }), `No debe ser puntuable: ${name}`).toBe(false);
      });
    });

    it('no debe caer en la trampa de subcadenas ("decimoseptima" contiene "septima", "decimoquinta" contiene "quinta")', () => {
      // Substrings engañosos que antes rompían la regex o includes
      expect(isAdaroPuntuableDivision({ id: 'div-17', name: 'Decimoseptima Division' })).toBe(false);
      expect(isAdaroPuntuableDivision({ id: 'div-16', name: 'Decima Sexta Division' })).toBe(false);
      expect(isAdaroPuntuableDivision({ id: 'div-15', name: 'Decimoquinta Division' })).toBe(false);
    });

    it('debe identificar categorías formativas/participativas correctamente', () => {
      expect(isAdaroParticipativeDivision({ name: '15ta División' })).toBe(true);
      expect(isAdaroParticipativeDivision({ name: '16ta División' })).toBe(true);
      expect(isAdaroParticipativeDivision({ name: '17ma División' })).toBe(true);
      expect(isAdaroParticipativeDivision({ name: 'Pre-décima 2018' })).toBe(true);
      
      // Categorías de adultos o excluidas no deben ser participativas del Adaro
      expect(isAdaroParticipativeDivision({ name: 'Primera División' })).toBe(false);
      expect(isAdaroParticipativeDivision({ name: 'Quinta División' })).toBe(false);
      expect(isAdaroParticipativeDivision({ name: 'Sexta División' })).toBe(false);
    });

    it('resolveAdaroPuntuableDivisionIds debe extraer exactamente 8 IDs puntuables de un set mixto', () => {
      const resolved = resolveAdaroPuntuableDivisionIds(dummyDivisions);
      expect(resolved.length).toBe(8);
      // No debe contener 15ª, 16ª ni 17ª
      expect(resolved).not.toContain(ADARO_FORMATIVE_DIVISION_IDS[0]);
      expect(resolved).not.toContain(ADARO_FORMATIVE_DIVISION_IDS[1]);
      expect(resolved).not.toContain(ADARO_FORMATIVE_DIVISION_IDS[2]);
    });

    it('resolveAdaroAllDivisionIds debe resolver las 11 divisiones en orden', () => {
      const resolved = resolveAdaroAllDivisionIds(dummyDivisions);
      expect(resolved.length).toBe(11);
      expect(resolved[0]).toBe(ADARO_PUNTUABLE_DIVISION_IDS[0]); // 7ma
      expect(resolved[10]).toBe(ADARO_FORMATIVE_DIVISION_IDS[2]); // 17ma
    });

    it('getDivisionOrder debe retornar el índice numérico correcto (7 a 17) y 99 para desconocidos', () => {
      expect(getDivisionOrder('7ma División')).toBe(7);
      expect(getDivisionOrder('Séptima')).toBe(7);
      expect(getDivisionOrder('10ma División')).toBe(10);
      expect(getDivisionOrder('Décima')).toBe(10);
      expect(getDivisionOrder('14ta División')).toBe(14);
      expect(getDivisionOrder('15ta División')).toBe(15);
      expect(getDivisionOrder('Decimosexta')).toBe(16);
      expect(getDivisionOrder('17ma División')).toBe(17);
      expect(getDivisionOrder('Decimoséptima')).toBe(17);
      expect(getDivisionOrder('Desconocida')).toBe(99);
      expect(getDivisionOrder('')).toBe(99);
    });
  });

  describe('2. Matemática del Promedio y Casos Borde', () => {
    it('debe calcular average = 0 cuando no hay partidos jugados (evitar NaN o división por cero)', () => {
      const standings = calculateAdaroZoneStandings([], dummyTeams, ADARO_PUNTUABLE_DIVISION_IDS);
      standings.forEach(row => {
        expect(row.played).toBe(0);
        expect(row.points).toBe(0);
        expect(row.average).toBe(0);
        expect(Number.isNaN(row.average)).toBe(false);
        expect(Number.isFinite(row.average)).toBe(true);
      });
    });

    it('debe redondear exactamente a 2 decimales según los ejemplos oficiales de la Liga', () => {
      // Caso 37 pts en 16 PJ: 37 / 16 = 2.3125 -> 2.31
      const kimberleyMatches: Match[] = [];
      // Simular 16 partidos (12 ganados = 36 pts, 1 empatado = 1 pt, 3 perdidos = 0 pt -> 37 pts en 16 pj)
      for (let i = 0; i < 16; i++) {
        let homeGoals = 1;
        let awayGoals = 0;
        if (i === 12) { homeGoals = 1; awayGoals = 1; } // empate
        if (i > 12) { homeGoals = 0; awayGoals = 1; } // derrota
        kimberleyMatches.push({
          id: `calc-m-${i}`,
          tournament_id: ADARO_TOURNAMENT_ID,
          division_id: ADARO_PUNTUABLE_DIVISION_IDS[i % 8],
          zone_id: 'adaro-zone-a',
          round_number: i < 8 ? 1 : 2,
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_goals: homeGoals,
          away_goals: awayGoals,
          status: 'finished',
          match_date: null
        });
      }

      const standings = calculateAdaroZoneStandings(kimberleyMatches, [dummyTeams[0], dummyTeams[1]], ADARO_PUNTUABLE_DIVISION_IDS);
      const team1 = standings.find(s => s.team.id === 'team-1');
      expect(team1?.played).toBe(16);
      expect(team1?.points).toBe(37);
      expect(team1?.average).toBe(2.31);
    });

    it('debe calcular promedio perfecto 3.00 con partidos suspendidos (39 pts en 13 PJ)', () => {
      const matches: Match[] = [];
      // 13 partidos ganados de 13 jugados
      for (let i = 0; i < 13; i++) {
        matches.push({
          id: `aldosivi-m-${i}`,
          tournament_id: ADARO_TOURNAMENT_ID,
          division_id: ADARO_PUNTUABLE_DIVISION_IDS[i % 8],
          zone_id: 'adaro-zone-a',
          round_number: 1,
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_goals: 2,
          away_goals: 0,
          status: 'finished',
          match_date: null
        });
      }

      const standings = calculateAdaroZoneStandings(matches, [dummyTeams[0], dummyTeams[1]], ADARO_PUNTUABLE_DIVISION_IDS);
      const team1 = standings.find(s => s.team.id === 'team-1');
      expect(team1?.played).toBe(13);
      expect(team1?.points).toBe(39);
      expect(team1?.average).toBe(3.00);
    });
  });

  describe('3. Manejo de Estados de Partidos (status) y Scores Nulos', () => {
    it('debe ignorar partidos con status scheduled (partidos suspendidos o a jugar)', () => {
      const matches: Match[] = [
        {
          id: 'm-finished',
          tournament_id: ADARO_TOURNAMENT_ID,
          division_id: ADARO_PUNTUABLE_DIVISION_IDS[0],
          zone_id: 'adaro-zone-a',
          round_number: 1,
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_goals: 2,
          away_goals: 1,
          status: 'finished',
          match_date: null
        },
        {
          id: 'm-scheduled',
          tournament_id: ADARO_TOURNAMENT_ID,
          division_id: ADARO_PUNTUABLE_DIVISION_IDS[1],
          zone_id: 'adaro-zone-a',
          round_number: 1,
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_goals: null,
          away_goals: null,
          status: 'scheduled',
          match_date: null
        }
      ];

      const standings = calculateAdaroZoneStandings(matches, dummyTeams, ADARO_PUNTUABLE_DIVISION_IDS);
      const team1 = standings.find(s => s.team.id === 'team-1');
      expect(team1?.played).toBe(1);
      expect(team1?.won).toBe(1);
      expect(team1?.points).toBe(3);
    });

    it('debe ignorar partidos con scores en null incluso si el status dice finished', () => {
      const matches: Match[] = [
        {
          id: 'm-null-scores',
          tournament_id: ADARO_TOURNAMENT_ID,
          division_id: ADARO_PUNTUABLE_DIVISION_IDS[0],
          zone_id: 'adaro-zone-a',
          round_number: 1,
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_goals: null,
          away_goals: null,
          status: 'finished',
          match_date: null
        }
      ];

      const standings = calculateAdaroZoneStandings(matches, dummyTeams, ADARO_PUNTUABLE_DIVISION_IDS);
      const team1 = standings.find(s => s.team.id === 'team-1');
      expect(team1?.played).toBe(0);
      expect(team1?.points).toBe(0);
    });

    it('debe computar partidos por no presentación (NP) como walkovers con 3 pts al ganador', () => {
      const walkoverMatch: Match = {
        id: 'm-walkover',
        tournament_id: ADARO_TOURNAMENT_ID,
        division_id: ADARO_PUNTUABLE_DIVISION_IDS[0],
        zone_id: 'adaro-zone-a',
        round_number: 1,
        home_team_id: 'team-1',
        away_team_id: 'team-2',
        home_goals: 1,
        away_goals: 0,
        status: 'finished',
        match_date: null
      };

      const standings = calculateAdaroZoneStandings([walkoverMatch], dummyTeams, ADARO_PUNTUABLE_DIVISION_IDS);
      const winner = standings.find(s => s.team.id === 'team-1');
      const loser = standings.find(s => s.team.id === 'team-2');

      expect(winner?.played).toBe(1);
      expect(winner?.won).toBe(1);
      expect(winner?.points).toBe(3);
      expect(winner?.goalDifference).toBe(1);

      expect(loser?.played).toBe(1);
      expect(loser?.lost).toBe(1);
      expect(loser?.points).toBe(0);
      expect(loser?.goalDifference).toBe(-1);
    });

    it('debe registrar victorias visitantes y empates simétricamente', () => {
      const matches: Match[] = [
        // Victoria visitante de team-2 ante team-1
        {
          id: 'm-away-win',
          tournament_id: ADARO_TOURNAMENT_ID,
          division_id: ADARO_PUNTUABLE_DIVISION_IDS[0],
          zone_id: 'adaro-zone-a',
          round_number: 1,
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_goals: 0,
          away_goals: 3,
          status: 'finished',
          match_date: null
        },
        // Empate entre team-3 y team-4
        {
          id: 'm-draw',
          tournament_id: ADARO_TOURNAMENT_ID,
          division_id: ADARO_PUNTUABLE_DIVISION_IDS[0],
          zone_id: 'adaro-zone-a',
          round_number: 1,
          home_team_id: 'team-3',
          away_team_id: 'team-4',
          home_goals: 2,
          away_goals: 2,
          status: 'finished',
          match_date: null
        }
      ];

      const standings = calculateAdaroZoneStandings(matches, dummyTeams, ADARO_PUNTUABLE_DIVISION_IDS);
      const team2 = standings.find(s => s.team.id === 'team-2');
      const team3 = standings.find(s => s.team.id === 'team-3');
      const team4 = standings.find(s => s.team.id === 'team-4');

      expect(team2?.won).toBe(1);
      expect(team2?.points).toBe(3);
      expect(team3?.drawn).toBe(1);
      expect(team3?.points).toBe(1);
      expect(team4?.drawn).toBe(1);
      expect(team4?.points).toBe(1);
    });
  });

  describe('4. Criterios de Desempate y Orden Oficial de la Tabla', () => {
    it('CRITERIO 1: El Promedio tiene prioridad absoluta sobre la cantidad bruta de puntos', () => {
      // Caso Quilmes vs El Cañón:
      // Team A (El Cañón): 25 pts en 16 PJ -> Promedio = 1.56
      // Team B (Quilmes): 23 pts en 14 PJ -> Promedio = 1.64
      // A pesar de que Team A tiene 25 > 23 pts, Team B debe quedar ARRIBA por promedio (1.64 > 1.56)
      const matches: Match[] = [];

      // Team B: 14 partidos -> 7 victorias (21 pts) + 2 empates (2 pts) + 5 derrotas = 23 pts
      for (let i = 0; i < 14; i++) {
        let hg = 1, ag = 0;
        if (i >= 7 && i < 9) { hg = 1; ag = 1; }
        if (i >= 9) { hg = 0; ag = 1; }
        matches.push({
          id: `tb-m-${i}`,
          tournament_id: ADARO_TOURNAMENT_ID,
          division_id: ADARO_PUNTUABLE_DIVISION_IDS[i % 8],
          zone_id: 'adaro-zone-d',
          round_number: 1,
          home_team_id: 'team-2', // Quilmes
          away_team_id: 'team-3', // rival
          home_goals: hg,
          away_goals: ag,
          status: 'finished',
          match_date: null
        });
      }

      // Team A: 16 partidos -> 8 victorias (24 pts) + 1 empate (1 pt) + 7 derrotas = 25 pts
      for (let i = 0; i < 16; i++) {
        let hg = 1, ag = 0;
        if (i === 8) { hg = 1; ag = 1; }
        if (i > 8) { hg = 0; ag = 1; }
        matches.push({
          id: `ta-m-${i}`,
          tournament_id: ADARO_TOURNAMENT_ID,
          division_id: ADARO_PUNTUABLE_DIVISION_IDS[i % 8],
          zone_id: 'adaro-zone-d',
          round_number: 1,
          home_team_id: 'team-1', // El Cañon
          away_team_id: 'team-4', // rival
          home_goals: hg,
          away_goals: ag,
          status: 'finished',
          match_date: null
        });
      }

      const standings = calculateAdaroZoneStandings(matches, dummyTeams, ADARO_PUNTUABLE_DIVISION_IDS);
      
      const pos1 = standings[0];
      const pos2 = standings[1];

      expect(pos1.team.id).toBe('team-2'); // Quilmes con 1.64
      expect(pos1.points).toBe(23);
      expect(pos1.played).toBe(14);
      expect(pos1.average).toBe(1.64);

      expect(pos2.team.id).toBe('team-1'); // El Cañon con 1.56
      expect(pos2.points).toBe(25);
      expect(pos2.played).toBe(16);
      expect(pos2.average).toBe(1.56);
    });

    it('CRITERIO 2: A igual Promedio, desempata mayor cantidad de puntos totales', () => {
      // Team 1: 6 pts en 4 PJ -> Promedio = 1.50
      // Team 2: 3 pts en 2 PJ -> Promedio = 1.50
      const matches: Match[] = [
        // Team 1 (2 ganados, 2 perdidos = 6 pts en 4 PJ)
        { id: 'm1', tournament_id: ADARO_TOURNAMENT_ID, division_id: ADARO_PUNTUABLE_DIVISION_IDS[0], zone_id: 'z', round_number: 1, home_team_id: 'team-1', away_team_id: 'team-3', home_goals: 1, away_goals: 0, status: 'finished', match_date: null },
        { id: 'm2', tournament_id: ADARO_TOURNAMENT_ID, division_id: ADARO_PUNTUABLE_DIVISION_IDS[1], zone_id: 'z', round_number: 1, home_team_id: 'team-1', away_team_id: 'team-3', home_goals: 1, away_goals: 0, status: 'finished', match_date: null },
        { id: 'm3', tournament_id: ADARO_TOURNAMENT_ID, division_id: ADARO_PUNTUABLE_DIVISION_IDS[2], zone_id: 'z', round_number: 1, home_team_id: 'team-1', away_team_id: 'team-3', home_goals: 0, away_goals: 1, status: 'finished', match_date: null },
        { id: 'm4', tournament_id: ADARO_TOURNAMENT_ID, division_id: ADARO_PUNTUABLE_DIVISION_IDS[3], zone_id: 'z', round_number: 1, home_team_id: 'team-1', away_team_id: 'team-3', home_goals: 0, away_goals: 1, status: 'finished', match_date: null },
        
        // Team 2 (1 ganado, 1 perdido = 3 pts en 2 PJ)
        { id: 'm5', tournament_id: ADARO_TOURNAMENT_ID, division_id: ADARO_PUNTUABLE_DIVISION_IDS[0], zone_id: 'z', round_number: 1, home_team_id: 'team-2', away_team_id: 'team-4', home_goals: 1, away_goals: 0, status: 'finished', match_date: null },
        { id: 'm6', tournament_id: ADARO_TOURNAMENT_ID, division_id: ADARO_PUNTUABLE_DIVISION_IDS[1], zone_id: 'z', round_number: 1, home_team_id: 'team-2', away_team_id: 'team-4', home_goals: 0, away_goals: 1, status: 'finished', match_date: null },
      ];

      const standings = calculateAdaroZoneStandings(matches, dummyTeams, ADARO_PUNTUABLE_DIVISION_IDS);
      const row1 = standings.find(s => s.team.id === 'team-1')!;
      const row2 = standings.find(s => s.team.id === 'team-2')!;
      expect(row1.average).toBe(1.50);
      expect(row2.average).toBe(1.50);
      expect(row1.points).toBe(6);
      expect(row2.points).toBe(3);
      expect(row1.rank).toBeLessThan(row2.rank); // A igual promedio (1.50), 6 pts queda por encima de 3 pts
    });

    it('CRITERIO 3: A igual Promedio y Puntos, desempata Diferencia de Gol (DG)', () => {
      const matches: Match[] = [
        // Team 1: 1 partido ganado 5-0 (DG = +5)
        { id: 'm1', tournament_id: ADARO_TOURNAMENT_ID, division_id: ADARO_PUNTUABLE_DIVISION_IDS[0], zone_id: 'z', round_number: 1, home_team_id: 'team-1', away_team_id: 'team-3', home_goals: 5, away_goals: 0, status: 'finished', match_date: null },
        // Team 2: 1 partido ganado 2-0 (DG = +2)
        { id: 'm2', tournament_id: ADARO_TOURNAMENT_ID, division_id: ADARO_PUNTUABLE_DIVISION_IDS[0], zone_id: 'z', round_number: 1, home_team_id: 'team-2', away_team_id: 'team-4', home_goals: 2, away_goals: 0, status: 'finished', match_date: null },
      ];

      const standings = calculateAdaroZoneStandings(matches, dummyTeams, ADARO_PUNTUABLE_DIVISION_IDS);
      expect(standings[0].team.id).toBe('team-1'); // DG +5 vs +2
      expect(standings[0].goalDifference).toBe(5);
      expect(standings[1].team.id).toBe('team-2');
      expect(standings[1].goalDifference).toBe(2);
    });

    it('CRITERIO 4: A igual Promedio, Puntos y DG, desempata Goles a Favor (GF)', () => {
      const matches: Match[] = [
        // Team 1: ganó 3-2 (3 pts, DG +1, GF 3)
        { id: 'm1', tournament_id: ADARO_TOURNAMENT_ID, division_id: ADARO_PUNTUABLE_DIVISION_IDS[0], zone_id: 'z', round_number: 1, home_team_id: 'team-1', away_team_id: 'team-3', home_goals: 3, away_goals: 2, status: 'finished', match_date: null },
        // Team 2: ganó 1-0 (3 pts, DG +1, GF 1)
        { id: 'm2', tournament_id: ADARO_TOURNAMENT_ID, division_id: ADARO_PUNTUABLE_DIVISION_IDS[0], zone_id: 'z', round_number: 1, home_team_id: 'team-2', away_team_id: 'team-4', home_goals: 1, away_goals: 0, status: 'finished', match_date: null },
      ];

      const standings = calculateAdaroZoneStandings(matches, dummyTeams, ADARO_PUNTUABLE_DIVISION_IDS);
      expect(standings[0].team.id).toBe('team-1'); // GF 3 > 1
      expect(standings[0].goalsFor).toBe(3);
      expect(standings[1].team.id).toBe('team-2');
      expect(standings[1].goalsFor).toBe(1);
    });
  });

  describe('5. Asignación de Copas por Zona (Platino, Oro, Plata, Bronce)', () => {
    it('debe asignar Platino al 1°, Oro al 2°, Plata al 3° y Bronce al 4° de cada zona', () => {
      const matches: Match[] = [
        { id: 'm1', tournament_id: ADARO_TOURNAMENT_ID, division_id: ADARO_PUNTUABLE_DIVISION_IDS[0], zone_id: 'z', round_number: 1, home_team_id: 'team-1', away_team_id: 'team-2', home_goals: 3, away_goals: 0, status: 'finished', match_date: null },
        { id: 'm2', tournament_id: ADARO_TOURNAMENT_ID, division_id: ADARO_PUNTUABLE_DIVISION_IDS[0], zone_id: 'z', round_number: 1, home_team_id: 'team-3', away_team_id: 'team-4', home_goals: 1, away_goals: 0, status: 'finished', match_date: null }
      ];

      const standings = calculateAdaroZoneStandings(matches, dummyTeams, ADARO_PUNTUABLE_DIVISION_IDS);

      expect(standings[0].rank).toBe(1);
      expect(standings[0].cupTier).toBe('platino');
      expect(CUP_BADGES[standings[0].cupTier].label).toBe('Copa de Platino');

      expect(standings[1].rank).toBe(2);
      expect(standings[1].cupTier).toBe('oro');
      expect(CUP_BADGES[standings[1].cupTier].label).toBe('Copa de Oro');

      expect(standings[2].rank).toBe(3);
      expect(standings[2].cupTier).toBe('plata');
      expect(CUP_BADGES[standings[2].cupTier].label).toBe('Copa de Plata');

      expect(standings[3].rank).toBe(4);
      expect(standings[3].cupTier).toBe('bronce');
      expect(CUP_BADGES[standings[3].cupTier].label).toBe('Copa de Bronce');
    });
  });

  describe('6. Agrupación en Tiras por Jornada (groupZoneMatchesIntoTiras)', () => {
    it('debe agrupar los 11 partidos de una jornada club vs club en una tira con puntos sumados', () => {
      const tiraMatches: Match[] = [];
      // Simular Kimberley (team-1) vs Boca (team-2) en 11 categorías
      dummyDivisions.forEach((div, i) => {
        tiraMatches.push({
          id: `tira-m-${i}`,
          tournament_id: ADARO_TOURNAMENT_ID,
          division_id: div.id,
          zone_id: 'adaro-zone-b',
          round_number: 1,
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_goals: i < 8 ? 2 : 1,
          away_goals: 0,
          status: 'finished',
          match_date: '2026-03-07'
        });
      });

      const tiras = groupZoneMatchesIntoTiras(tiraMatches, dummyTeams, dummyDivisions);
      expect(tiras.length).toBe(1);
      const tira = tiras[0];
      expect(tira.matches.length).toBe(11);
      expect(tira.homeTiraPoints).toBe(33); // 11 victorias x 3 pts = 33 pts
      expect(tira.awayTiraPoints).toBe(0);
      expect(tira.isFinished).toBe(true);

      // Verificar orden interno de partidos: 7ma a 17ma
      expect(tira.matches[0].divisionName).toContain('7');
      expect(tira.matches[10].divisionName).toContain('17');
    });

    it('no debe fallar cuando hay partidos sin goles o pendientes dentro de la tira', () => {
      const mixedMatches: Match[] = [
        {
          id: 't-finished',
          tournament_id: ADARO_TOURNAMENT_ID,
          division_id: dummyDivisions[0].id,
          zone_id: 'adaro-zone-b',
          round_number: 1,
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_goals: 1,
          away_goals: 0,
          status: 'finished',
          match_date: null
        },
        {
          id: 't-pending',
          tournament_id: ADARO_TOURNAMENT_ID,
          division_id: dummyDivisions[1].id,
          zone_id: 'adaro-zone-b',
          round_number: 1,
          home_team_id: 'team-1',
          away_team_id: 'team-2',
          home_goals: null,
          away_goals: null,
          status: 'scheduled',
          match_date: null
        }
      ];

      const tiras = groupZoneMatchesIntoTiras(mixedMatches, dummyTeams, dummyDivisions);
      expect(tiras.length).toBe(1);
      expect(tiras[0].homeTiraPoints).toBe(3);
      expect(tiras[0].awayTiraPoints).toBe(0);
      expect(tiras[0].matches.length).toBe(2);
    });
  });
});
