import { describe, it, expect } from 'vitest';
import { parseBoletinPdfText, normalizeTeamName } from '../lib/pdfResultsParser';

describe('PDF Results Parser - Boletín Oficial LMF', () => {
  it('debe normalizar correctamente los nombres de equipos abreviados del PDF', () => {
    expect(normalizeTeamName('TALLERES')).toBe('Talleres de Mar del Plata');
    expect(normalizeTeamName('MAR DEL PLATA')).toBe('Atlético Mar del Plata');
    expect(normalizeTeamName('DVO NORTE')).toBe('Deportivo Norte');
    expect(normalizeTeamName('BOCA')).toBe('Boca Juniors');
    expect(normalizeTeamName('BANCO PROVINCIA')).toBe('Club Banco Provincia de Mar del Plata');
    expect(normalizeTeamName('CHAPADMALAL')).toBe('Club Social y Deportivo Chapadmalal');
    expect(normalizeTeamName('GRAL URQUIZA')).toBe('General Urquiza');
    expect(normalizeTeamName('EL CAÑON')).toBe('El cañon');
  });

  it('debe procesar el texto real de las Páginas 2 y 3 del Boletín Oficial N° 23', () => {
    const page2Text = `
RESULTADOS NOVENA FECHA FASE FINAL
TORNEO INFANTO JUVENIL "LIGA MARPLATENSE DE FUTBOL"
SEPTIMA DIVISION SEPTIMA DIVISION
ZONA "CAMPEONATO" ZONA "PROMOCIONAL"
TALLERES 1 RIVER PLATE 2 BOCA 0 BANCO PROVINCIA 0
ARGENTINOS DEL SUD 0 NACION 0 AL VER VERAS 1 SAN JOSE 0
BANFIELD 2 QUILMES 1 EL CAÑON 4 SAN ISIDRO 0
ONCE UNIDOS 0 ALVARADO 6 SAN LORENZO 8 RACING 0
DVO NORTE 3 CADETES 0 LIBERTAD 1 CHAPADMALAL 2
KIMBERLEY 3 INDEPENDIENTE 1 CIRCULO DEPORTIVO 4 COLEGIALES 1
ALDOSIVI post MAR DEL PLATA post GRAL URQUIZA 2 ALMAGRO FLORIDA 0

OCTAVA DIVISION OCTAVA DIVISION
ZONA "CAMPEONATO" ZONA "PROMOCIONAL"
TALLERES 2 RIVER PLATE 0 BOCA 1 BANCO PROVINCIA 0
ARGENTINOS DEL SUD 1 NACION 1 AL VER VERAS 0 SAN JOSE 1
BANFIELD 5 QUILMES 2 EL CAÑON 1 SAN ISIDRO 1
ONCE UNIDOS 0 ALVARADO 3 SAN LORENZO 2 RACING 1
DVO NORTE 0 CADETES 3 LIBERTAD 1 CHAPADMALAL 2
KIMBERLEY 1 INDEPENDIENTE 0 CIRCULO DEPORTIVO 1 COLEGIALES NP
ALDOSIVI post MAR DEL PLATA post GRAL URQUIZA 1 ALMAGRO FLORIDA 3
    `;

    const page3Text = `
DECIMOSEXTA DIVISION DECIMOSEXTA DIVISION
ZONA "CAMPEONATO" ZONA "PROMOCIONAL"
TALLERES 0 RIVER PLATE 3 BOCA 1 BANCO PROVINCIA NP
ARGENTINOS DEL SUD 11 NACION 0 AL VER VERAS 2 SAN JOSE 1
BANFIELD 3 QUILMES 1 EL CAÑON 3 SAN ISIDRO 0
ONCE UNIDOS 1 ALVARADO 6 SAN LORENZO 1 RACING NP
DVO NORTE 3 CADETES 3 LIBERTAD 0 CHAPADMALAL 2
KIMBERLEY 4 INDEPENDIENTE 0 CIRCULO DEPORTIVO 0 COLEGIALES 1
ALDOSIVI 6 MAR DEL PLATA 0 GRAL URQUIZA 3 ALMAGRO FLORIDA 0
    `;

    const summary = parseBoletinPdfText([page2Text, page3Text]);

    expect(summary.roundNumber).toBe(9);
    expect(summary.totalParsed).toBeGreaterThan(20);

    // Verificar partido con resultado normal (7ma División: Talleres vs River)
    const talleresRiver = summary.results.find(
      r => r.divisionNumber === 7 && r.homeTeamCanonical === 'Talleres de Mar del Plata'
    );
    expect(talleresRiver).toBeDefined();
    expect(talleresRiver?.homeGoals).toBe(1);
    expect(talleresRiver?.awayGoals).toBe(2);
    expect(talleresRiver?.status).toBe('finished');
    expect(talleresRiver?.zone).toBe('CAMPEONATO');

    // Verificar partido pospuesto (7ma División: Aldosivi vs Mar del Plata)
    const aldosiviMdp = summary.results.find(
      r => r.divisionNumber === 7 && r.homeTeamCanonical === 'Aldosivi'
    );
    expect(aldosiviMdp).toBeDefined();
    expect(aldosiviMdp?.isPostponed).toBe(true);
    expect(aldosiviMdp?.status).toBe('postponed');
    expect(aldosiviMdp?.homeGoals).toBeNull();
    expect(aldosiviMdp?.awayGoals).toBeNull();

    // Verificar partido con NP (8va División: Círculo Deportivo vs Colegiales)
    const circuloColegiales = summary.results.find(
      r => r.divisionNumber === 8 && r.homeTeamCanonical === 'Circulo Deportivo'
    );
    expect(circuloColegiales).toBeDefined();
    expect(circuloColegiales?.isNoShow).toBe(true);
    expect(circuloColegiales?.homeGoals).toBe(1);
    expect(circuloColegiales?.awayGoals).toBe(0); // NP convertido a 0

    // Verificar partido con NP en 16ta División (Boca vs Banco Provincia NP)
    const bocaBanco = summary.results.find(
      r => r.divisionNumber === 16 && r.homeTeamCanonical === 'Boca Juniors'
    );
    expect(bocaBanco).toBeDefined();
    expect(bocaBanco?.isNoShow).toBe(true);
    expect(bocaBanco?.homeGoals).toBe(1);
    expect(bocaBanco?.awayGoals).toBe(0); // NP convertido a 0
  });
});
