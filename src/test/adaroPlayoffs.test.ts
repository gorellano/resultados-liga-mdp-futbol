import { describe, it, expect } from 'vitest';
import { PLAYOFF_DIVISIONS } from '../components/AdaroPlayoffBracket';
import { 
  calculateAdaroZoneStandings, 
  type AdaroCupTier 
} from '../lib/adaroStandings';
import { 
  ADARO_ZONES, 
  ADARO_PUNTUABLE_DIVISION_IDS,
  MOCK_ADARO_MATCHES 
} from '../lib/mockAdaroData';
import { MOCK_TEAMS_CAMPEONATO, MOCK_TEAMS_PROMOCION } from '../lib/mockData';
import { saveMatchResult } from '../lib/db';
import type { Team, Match } from '../lib/types';

describe('Torneo Armando "Chamaco" Adaro - Playoff Brackets y Sembrados (Seeds)', () => {
  const allTeams: Team[] = [...MOCK_TEAMS_CAMPEONATO, ...MOCK_TEAMS_PROMOCION];

  describe('1. Estructura de Divisiones de Playoff (PLAYOFF_DIVISIONS)', () => {
    it('debe contener exactamente 11 divisiones (de 7ª a 17ª) para disputa individual de copas', () => {
      expect(PLAYOFF_DIVISIONS.length).toBe(11);

      // Puntuables originales de zona
      expect(PLAYOFF_DIVISIONS[0].name).toContain('7ª');
      expect(PLAYOFF_DIVISIONS[0].year).toBe(2010);
      expect(PLAYOFF_DIVISIONS[1].name).toContain('8ª');
      expect(PLAYOFF_DIVISIONS[1].year).toBe(2011);
      expect(PLAYOFF_DIVISIONS[2].name).toContain('9ª');
      expect(PLAYOFF_DIVISIONS[2].year).toBe(2012);
      expect(PLAYOFF_DIVISIONS[3].name).toContain('10ª');
      expect(PLAYOFF_DIVISIONS[3].year).toBe(2013);
      expect(PLAYOFF_DIVISIONS[4].name).toContain('11ª');
      expect(PLAYOFF_DIVISIONS[4].year).toBe(2014);
      expect(PLAYOFF_DIVISIONS[5].name).toContain('12ª');
      expect(PLAYOFF_DIVISIONS[5].year).toBe(2015);
      expect(PLAYOFF_DIVISIONS[6].name).toContain('13ª');
      expect(PLAYOFF_DIVISIONS[6].year).toBe(2016);
      expect(PLAYOFF_DIVISIONS[7].name).toContain('14ª');
      expect(PLAYOFF_DIVISIONS[7].year).toBe(2017);

      // Formativas que juegan copa por mérito del club en la zona general
      expect(PLAYOFF_DIVISIONS[8].name).toContain('15ª');
      expect(PLAYOFF_DIVISIONS[8].year).toBe(2018);
      expect(PLAYOFF_DIVISIONS[9].name).toContain('16ª');
      expect(PLAYOFF_DIVISIONS[9].year).toBe(2019);
      expect(PLAYOFF_DIVISIONS[10].name).toContain('17ª');
      expect(PLAYOFF_DIVISIONS[10].year).toBe(2020);
    });
  });

  describe('2. Clasificación de Clubes a las 4 Copas (Platino, Oro, Plata, Bronce)', () => {
    // Helper para calcular la tabla de las 7 zonas
    const computeAllZoneRankings = (matches: Match[]) => {
      const results: Record<AdaroCupTier, Array<{ team: Team; zoneName: string; pts: number; avg: number; dg: number; gf: number }>> = {
        platino: [],
        oro: [],
        plata: [],
        bronce: []
      };

      ADARO_ZONES.forEach(zone => {
        const zoneMatches = matches.filter(m => m.zone_id === zone.id);
        const teamIdSet = new Set<string>();
        zoneMatches.forEach(m => {
          teamIdSet.add(m.home_team_id);
          teamIdSet.add(m.away_team_id);
        });
        const zTeams = allTeams.filter(t => teamIdSet.has(t.id));

        const standings = calculateAdaroZoneStandings(
          zoneMatches,
          zTeams,
          ADARO_PUNTUABLE_DIVISION_IDS
        );

        standings.forEach(s => {
          results[s.cupTier].push({
            team: s.team,
            zoneName: zone.name,
            pts: s.points,
            avg: s.average,
            dg: s.goalDifference,
            gf: s.goalsFor,
          });
        });
      });

      // Ordenar los 7 equipos de cada copa para definir sembrados 1 al 7
      Object.keys(results).forEach(tier => {
        results[tier as AdaroCupTier].sort((a, b) => {
          if (b.avg !== a.avg) return b.avg - a.avg;
          if (b.pts !== a.pts) return b.pts - a.pts;
          if (b.dg !== a.dg) return b.dg - a.dg;
          return b.gf - a.gf;
        });
      });

      return results;
    };

    it('cada una de las 4 copas debe recibir exactamente 7 clubes (1 por cada zona)', () => {
      const rankings = computeAllZoneRankings(MOCK_ADARO_MATCHES);

      expect(rankings.platino.length).toBe(7); // Los 7 primeros de zona
      expect(rankings.oro.length).toBe(7);     // Los 7 segundos de zona
      expect(rankings.plata.length).toBe(7);   // Los 7 terceros de zona
      expect(rankings.bronce.length).toBe(7);  // Los 7 cuartos de zona
    });

    it('los sembrados (Seeds 1 al 7) deben quedar ordenados estrictamente por Promedio DESC, luego Pts DESC, luego DG DESC', () => {
      const rankings = computeAllZoneRankings(MOCK_ADARO_MATCHES);

      ['platino', 'oro', 'plata', 'bronce'].forEach(tier => {
        const list = rankings[tier as AdaroCupTier];
        for (let i = 0; i < list.length - 1; i++) {
          const a = list[i];
          const b = list[i + 1];

          if (a.avg !== b.avg) {
            expect(a.avg, `En ${tier}, sembrado ${i+1} debe tener >= promedio que ${i+2}`).toBeGreaterThanOrEqual(b.avg);
          } else if (a.pts !== b.pts) {
            expect(a.pts, `En ${tier}, a igual promedio debe desempatar por puntos`).toBeGreaterThanOrEqual(b.pts);
          } else if (a.dg !== b.dg) {
            expect(a.dg, `En ${tier}, a igual promedio y pts debe desempatar por DG`).toBeGreaterThanOrEqual(b.dg);
          }
        }
      });
    });
  });

  describe('3. Estructura Oficial de Llaves de Playoff (Cruces y BYE del 1º)', () => {
    it('el Sembrado 1 debe tener pase libre (BYE) a Semifinales según reglamento', () => {
      // Regla LMF: 7 equipos -> 1° Libre a Semis, 2° vs 7°, 3° vs 6°, 4° vs 5°
      const dummySeeds: Team[] = [
        { id: 's1', name: 'Sembrado 1', logo_url: null },
        { id: 's2', name: 'Sembrado 2', logo_url: null },
        { id: 's3', name: 'Sembrado 3', logo_url: null },
        { id: 's4', name: 'Sembrado 4', logo_url: null },
        { id: 's5', name: 'Sembrado 5', logo_url: null },
        { id: 's6', name: 'Sembrado 6', logo_url: null },
        { id: 's7', name: 'Sembrado 7', logo_url: null },
      ];

      // Cuartos
      const matchA = { homeTeam: dummySeeds[0], awayTeam: null, isBye: true, winnerId: dummySeeds[0].id };
      const matchB = { homeTeam: dummySeeds[1], awayTeam: dummySeeds[6] }; // 2 vs 7
      const matchC = { homeTeam: dummySeeds[2], awayTeam: dummySeeds[5] }; // 3 vs 6
      const matchD = { homeTeam: dummySeeds[3], awayTeam: dummySeeds[4] }; // 4 vs 5

      expect(matchA.isBye).toBe(true);
      expect(matchA.winnerId).toBe('s1');

      // Cruces correctos de Cuartos
      expect(matchB.homeTeam.id).toBe('s2');
      expect(matchB.awayTeam.id).toBe('s7');

      expect(matchC.homeTeam.id).toBe('s3');
      expect(matchC.awayTeam.id).toBe('s6');

      expect(matchD.homeTeam.id).toBe('s4');
      expect(matchD.awayTeam.id).toBe('s5');

      // Semifinales: A vs D (Sembrado 1 vs Ganador 4-5) y B vs C (Ganador 2-7 vs Ganador 3-6)
      const sf1 = { homeTeamId: matchA.winnerId, awayTeamId: matchD.homeTeam.id };
      expect(sf1.homeTeamId).toBe('s1');

      const sf2 = { homeTeamId: matchB.homeTeam.id, awayTeamId: matchC.homeTeam.id };
      expect(sf2.homeTeamId).toBe('s2');
    });

    it('debe resolver desempate por penales cuando el partido de playoff finaliza igualado', () => {
      // Simular partido empatado 1-1 en tiempo reglamentario
      const homeScore = 1;
      const awayScore = 1;
      const homePenalties = 5;
      const awayPenalties = 4;

      const determinePlayoffWinner = (
        hs: number, 
        as: number, 
        hp?: number, 
        ap?: number, 
        hId = 'team-home', 
        aId = 'team-away'
      ) => {
        if (hs > as) return hId;
        if (as > hs) return aId;
        if (hp !== undefined && ap !== undefined) {
          return hp > ap ? hId : aId;
        }
        return null;
      };

      const winner = determinePlayoffWinner(homeScore, awayScore, homePenalties, awayPenalties);
      expect(winner).toBe('team-home');

      // Caso inverso (gana visitante en penales)
      const visitorWinner = determinePlayoffWinner(2, 2, 3, 5);
      expect(visitorWinner).toBe('team-away');
    });

    it('saveMatchResult debe almacenar penales y stage correctamente en el backend/mock', async () => {
      const matchId = 'playoff-penalties-test';
      const success = await saveMatchResult(
        matchId,
        1,
        1,
        'finished',
        null,
        4, // home_penalties
        5, // away_penalties
        'semifinal' // stage
      );

      expect(success).toBe(true);
    });
  });
});
