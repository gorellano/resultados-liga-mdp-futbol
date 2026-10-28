import { describe, it, expect } from 'vitest';
import { 
  ADARO_TOURNAMENT_ID,
  ADARO_TOURNAMENT,
  ADARO_ZONES,
  ADARO_PUNTUABLE_DIVISION_IDS,
  ADARO_FORMATIVE_DIVISION_IDS,
  ADARO_ALL_DIVISION_IDS,
  MOCK_ADARO_MATCHES,
  findTeamId
} from '../lib/mockAdaroData';
import { calculateAdaroZoneStandings } from '../lib/adaroStandings';
import { MOCK_TEAMS_CAMPEONATO, MOCK_TEAMS_PROMOCION } from '../lib/mockData';
import type { Team } from '../lib/types';

describe('Torneo Armando "Chamaco" Adaro - Fixture Completo y Resultados Oficiales', () => {
  const allTeams: Team[] = [...MOCK_TEAMS_CAMPEONATO, ...MOCK_TEAMS_PROMOCION];

  describe('1. Integridad del Fixture (6 Fechas, 7 Zonas, 11 Categorías)', () => {
    it('debe tener formato "copas_multinivel" y metadatos correctos', () => {
      expect(ADARO_TOURNAMENT.id).toBe(ADARO_TOURNAMENT_ID);
      expect(ADARO_TOURNAMENT.format).toBe('copas_multinivel');
      expect(ADARO_TOURNAMENT.name).toContain('Armando "Chamaco" Adaro');
      expect(ADARO_TOURNAMENT.is_current).toBe(true);
    });

    it('debe contener exactamente 7 zonas con 4 clubes cada una', () => {
      expect(ADARO_ZONES.length).toBe(7);
      const zoneIds = ADARO_ZONES.map(z => z.id);
      expect(zoneIds).toEqual([
        'adaro-zone-a',
        'adaro-zone-b',
        'adaro-zone-c',
        'adaro-zone-d',
        'adaro-zone-e',
        'adaro-zone-f',
        'adaro-zone-g'
      ]);
    });

    it('debe contener exactamente 924 partidos en total (154 partidos por fecha x 6 fechas)', () => {
      expect(MOCK_ADARO_MATCHES.length).toBe(924);

      // Verificar 154 partidos por cada una de las 6 fechas
      for (let r = 1; r <= 6; r++) {
        const roundMatches = MOCK_ADARO_MATCHES.filter(m => m.round_number === r);
        expect(roundMatches.length, `Fecha ${r} debe tener 154 partidos`).toBe(154);
      }
    });

    it('cada partido debe tener datos consistentes y pertenecer a una división válida de las 11', () => {
      const validDivsSet = new Set(ADARO_ALL_DIVISION_IDS);
      MOCK_ADARO_MATCHES.forEach(m => {
        expect(m.tournament_id).toBe(ADARO_TOURNAMENT_ID);
        expect(validDivsSet.has(m.division_id)).toBe(true);
        expect(m.home_team_id).toBeDefined();
        expect(m.away_team_id).toBeDefined();
        expect(m.home_team_id).not.toBe(m.away_team_id);
      });
    });
  });

  describe('2. Resultados Oficiales de la Fecha 1 (Boletín Oficial LMF)', () => {
    it('todos los 154 partidos de la Fecha 1 deben estar finalizados', () => {
      const fecha1Matches = MOCK_ADARO_MATCHES.filter(m => m.round_number === 1);
      expect(fecha1Matches.length).toBe(154);
      fecha1Matches.forEach(m => {
        expect(m.status).toBe('finished');
        expect(m.home_goals).not.toBeNull();
        expect(m.away_goals).not.toBeNull();
      });
    });

    it('debe coincidir con los líderes invictos de la Fecha 1 (Aldosivi, Kimberley, Banfield con 24 pts)', () => {
      const checkLeader = (zoneId: string, teamKeyword: string, expectedPts: number) => {
        const matches = MOCK_ADARO_MATCHES.filter(m => m.zone_id === zoneId && m.round_number === 1);
        const standings = calculateAdaroZoneStandings(matches, allTeams, ADARO_PUNTUABLE_DIVISION_IDS);
        const leader = standings.find(s => s.team.name.toLowerCase().includes(teamKeyword.toLowerCase()));
        expect(leader?.points).toBe(expectedPts);
        expect(leader?.played).toBe(8);
        expect(leader?.average).toBe(3.00);
      };

      checkLeader('adaro-zone-a', 'Aldosivi', 24);
      checkLeader('adaro-zone-b', 'Kimberley', 24);
      checkLeader('adaro-zone-g', 'Banfield', 24);
    });
  });

  describe('3. Resultados Oficiales de la Fecha 2 (Boletín Oficial LMF)', () => {
    it('debe conservar los partidos suspendidos (SU) como scheduled con goles en NULL', () => {
      const aldosiviId = findTeamId('Aldosivi');
      const libertadId = findTeamId('Libertad');

      // 1. Aldosivi vs Libertad en Zona A (suspendidos en 7ª, 8ª y 9ª según Boletín Oficial)
      const aldosiviLibertadMatches = MOCK_ADARO_MATCHES.filter(m => 
        m.zone_id === 'adaro-zone-a' && 
        m.round_number === 2 && 
        ((m.home_team_id === aldosiviId && m.away_team_id === libertadId) ||
         (m.home_team_id === libertadId && m.away_team_id === aldosiviId))
      );

      const suspendedDivsAldosivi = [
        ADARO_PUNTUABLE_DIVISION_IDS[0], // 7ma (2010)
        ADARO_PUNTUABLE_DIVISION_IDS[1], // 8va (2011)
        ADARO_PUNTUABLE_DIVISION_IDS[2], // 9na (2012)
      ];

      suspendedDivsAldosivi.forEach(divId => {
        const m = aldosiviLibertadMatches.find(match => match.division_id === divId);
        expect(m, `Partido suspendido Aldosivi vs Libertad en div ${divId}`).toBeDefined();
        expect(m?.status).toBe('scheduled');
        expect(m?.home_goals).toBeNull();
        expect(m?.away_goals).toBeNull();
      });

      // 2. Quilmes vs Independiente en Zona D (suspendidos en 7ª y 8ª)
      const quilmesId = findTeamId('Quilmes');
      const independienteId = findTeamId('Independiente');
      const quilmesIndependienteMatches = MOCK_ADARO_MATCHES.filter(m => 
        m.zone_id === 'adaro-zone-d' && 
        m.round_number === 2 &&
        ((m.home_team_id === quilmesId && m.away_team_id === independienteId) ||
         (m.home_team_id === independienteId && m.away_team_id === quilmesId))
      );

      const suspendedDivsQuilmes = [
        ADARO_PUNTUABLE_DIVISION_IDS[0], // 7ma
        ADARO_PUNTUABLE_DIVISION_IDS[1], // 8va
      ];

      suspendedDivsQuilmes.forEach(divId => {
        const m = quilmesIndependienteMatches.find(match => match.division_id === divId);
        expect(m, `Partido suspendido Quilmes vs CAI en div ${divId}`).toBeDefined();
        expect(m?.status).toBe('scheduled');
        expect(m?.home_goals).toBeNull();
        expect(m?.away_goals).toBeNull();
      });
    });

    it('debe registrar los partidos por No Presentó (NP) como walkovers con resultado 1-0 o 0-1', () => {
      // Zona D: El Cañón vs Racing en 16ª (Racing NP -> gana El Cañón 1-0)
      const cañonId = findTeamId('El cañon');
      const racingId = findTeamId('Racing');
      const cañonRacing16 = MOCK_ADARO_MATCHES.find(m => 
        m.zone_id === 'adaro-zone-d' && 
        m.round_number === 2 && 
        m.division_id === ADARO_FORMATIVE_DIVISION_IDS[1] && // 16ta (2019)
        m.home_team_id === cañonId && 
        m.away_team_id === racingId
      );
      expect(cañonRacing16?.status).toBe('finished');
      expect(cañonRacing16?.home_goals).toBe(1);
      expect(cañonRacing16?.away_goals).toBe(0);

      // Zona C: Alvarado vs Al Ver Veras en 8ª (Al Ver Veras NP -> gana Alvarado 1-0)
      const alvaradoId = findTeamId('Alvarado');
      const alVerVerasId = findTeamId('Al Ver Veras');
      const alvaradoAlVerVeras8 = MOCK_ADARO_MATCHES.find(m => 
        m.zone_id === 'adaro-zone-c' && 
        m.round_number === 2 && 
        m.division_id === ADARO_PUNTUABLE_DIVISION_IDS[1] && // 8va (2011)
        m.home_team_id === alvaradoId && 
        m.away_team_id === alVerVerasId
      );
      expect(alvaradoAlVerVeras8?.status).toBe('finished');
      expect(alvaradoAlVerVeras8?.home_goals).toBe(1);
      expect(alvaradoAlVerVeras8?.away_goals).toBe(0);
    });

    it('debe reproducir con 100% de exactitud los 28 clubes en la Tabla de Promedios tras Fecha 2', () => {
      const checkTeamStanding = (
        zoneId: string, 
        teamKeyword: string, 
        expectedPts: number, 
        expectedPj: number, 
        expectedAvg: number
      ) => {
        const matches = MOCK_ADARO_MATCHES.filter(m => m.zone_id === zoneId && (m.round_number === 1 || m.round_number === 2));
        const standings = calculateAdaroZoneStandings(matches, allTeams, ADARO_PUNTUABLE_DIVISION_IDS);
        const row = standings.find(s => 
          s.team.name.toLowerCase().includes(teamKeyword.toLowerCase()) || 
          (s.team.display_name && s.team.display_name.toLowerCase().includes(teamKeyword.toLowerCase()))
        );
        expect(row, `Equipo ${teamKeyword} en ${zoneId}`).toBeDefined();
        expect(row?.points, `Pts ${teamKeyword}`).toBe(expectedPts);
        expect(row?.played, `PJ ${teamKeyword}`).toBe(expectedPj);
        expect(row?.average, `Promedio ${teamKeyword}`).toBe(expectedAvg);
      };

      // ZONA A
      checkTeamStanding('adaro-zone-a', 'Aldosivi', 39, 13, 3.00);
      checkTeamStanding('adaro-zone-a', 'Argentinos del Sud', 37, 16, 2.31);
      checkTeamStanding('adaro-zone-a', 'San Lorenzo', 10, 16, 0.63);
      checkTeamStanding('adaro-zone-a', 'Libertad', 0, 13, 0.00);

      // ZONA B
      checkTeamStanding('adaro-zone-b', 'Kimberley', 48, 16, 3.00);
      checkTeamStanding('adaro-zone-b', 'Talleres', 38, 16, 2.38);
      checkTeamStanding('adaro-zone-b', 'Chapadmalal', 7, 16, 0.44);
      checkTeamStanding('adaro-zone-b', 'Boca', 1, 16, 0.06);

      // ZONA C
      checkTeamStanding('adaro-zone-c', 'Alvarado', 38, 16, 2.38);
      checkTeamStanding('adaro-zone-c', 'San Isidro', 28, 16, 1.75);
      checkTeamStanding('adaro-zone-c', 'Mar del Plata', 18, 16, 1.13);
      checkTeamStanding('adaro-zone-c', 'Al Ver Veras', 6, 16, 0.38);

      // ZONA D
      checkTeamStanding('adaro-zone-d', 'Independiente', 30, 14, 2.14);
      checkTeamStanding('adaro-zone-d', 'Quilmes', 23, 14, 1.64);
      checkTeamStanding('adaro-zone-d', 'El cañon', 25, 16, 1.56);
      checkTeamStanding('adaro-zone-d', 'Racing', 6, 16, 0.38);

      // ZONA E
      checkTeamStanding('adaro-zone-e', 'Circulo', 29, 16, 1.81);
      checkTeamStanding('adaro-zone-e', 'Deportivo Norte', 28, 16, 1.75);
      checkTeamStanding('adaro-zone-e', 'Nacion', 23, 16, 1.44);
      checkTeamStanding('adaro-zone-e', 'Almagro', 12, 16, 0.75);

      // ZONA F
      checkTeamStanding('adaro-zone-f', 'River Plate', 36, 16, 2.25);
      checkTeamStanding('adaro-zone-f', 'Cadetes', 28, 16, 1.75);
      checkTeamStanding('adaro-zone-f', 'Colegiales', 16, 16, 1.00);
      checkTeamStanding('adaro-zone-f', 'San José', 12, 16, 0.75);

      // ZONA G
      checkTeamStanding('adaro-zone-g', 'Banfield', 42, 16, 2.63);
      checkTeamStanding('adaro-zone-g', 'Once Unidos', 39, 16, 2.44);
      checkTeamStanding('adaro-zone-g', 'General Urquiza', 12, 16, 0.75);
      checkTeamStanding('adaro-zone-g', 'Banco Provincia', 3, 16, 0.19);
    });
  });

  describe('4. Fechas 3 a 6 (Partidos Programados)', () => {
    it('todos los partidos de las Fechas 3 a 6 deben figurar como scheduled con scores null', () => {
      for (let r = 3; r <= 6; r++) {
        const roundMatches = MOCK_ADARO_MATCHES.filter(m => m.round_number === r);
        expect(roundMatches.length).toBe(154);
        roundMatches.forEach(m => {
          expect(m.status).toBe('scheduled');
          expect(m.home_goals).toBeNull();
          expect(m.away_goals).toBeNull();
        });
      }
    });
  });
});
