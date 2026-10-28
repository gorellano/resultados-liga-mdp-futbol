const fs = require('fs');
const path = require('path');

// ─── 1. Divisiones (11 categorías: 7ma a 17ma) ──────────────────────────────
const DIVISIONS = [
  { name: 'Séptima División', sort: 1, alt: '7ma' },
  { name: 'Octava División', sort: 2, alt: '8va' },
  { name: 'Novena División', sort: 3, alt: '9na' },
  { name: 'Décima División', sort: 4, alt: '10ma' },
  { name: 'Undécima División', sort: 5, alt: '11ma' },
  { name: 'Duodécima División', sort: 6, alt: '12ma' },
  { name: 'Decimotercera División', sort: 7, alt: '13ra' },
  { name: 'Decimocuarta División', sort: 8, alt: '14ta' },
  { name: 'Decimoquinta División', sort: 9, alt: '15ta' },
  { name: 'Decimosexta División', sort: 10, alt: '16ta' },
  { name: 'Decimoséptima División', sort: 11, alt: '17ma' },
];

// ─── 2. 7 Zonas ─────────────────────────────────────────────────────────────
const ZONES = ['Zona A', 'Zona B', 'Zona C', 'Zona D', 'Zona E', 'Zona F', 'Zona G'];

// ─── 3. 28 Equipos con clave e ILIKE search pattern ─────────────────────────
const TEAMS = [
  { key: 'aldosivi', name: 'Aldosivi', pattern: '%Aldosivi%', logo: '/logos/aldosivi.png' },
  { key: 'argsud', name: 'Argentinos del Sud', pattern: '%Argentinos%', logo: '/logos/argentinos_del_sud.png' },
  { key: 'libertad', name: 'Libertad', pattern: '%Libertad%', logo: '/logos/libertad.png' },
  { key: 'sanlorenzo', name: 'San Lorenzo', pattern: '%San Lorenzo%', logo: '/logos/san_lorenzo.png' },

  { key: 'kimberley', name: 'Kimberley', pattern: '%Kimberley%', logo: '/logos/kimberley.png' },
  { key: 'talleres', name: 'Talleres', pattern: '%Talleres%', logo: '/logos/talleres.png' },
  { key: 'boca', name: 'Boca Juniors', pattern: '%Boca%', logo: '/logos/boca_juniors.png' },
  { key: 'chap', name: 'Chapadmalal', pattern: '%Chapadmalal%', logo: '/logos/chapadmalal.png' },

  { key: 'sanisidro', name: 'San Isidro', pattern: '%San Isidro%', logo: '/logos/san_isidro.png' },
  { key: 'alvarado', name: 'Alvarado', pattern: '%Alvarado%', logo: '/logos/alvarado.png' },
  { key: 'mdp', name: 'Atlético Mar del Plata', pattern: '%Mar del Plata%', logo: '/logos/atletico_mar_del_plata.png' },
  { key: 'alver', name: 'Al Ver Veras', pattern: '%Veras%', logo: '/logos/al_ver_veras.png' },

  { key: 'quilmes', name: 'Quilmes', pattern: '%Quilmes%', logo: '/logos/quilmes.png' },
  { key: 'indep', name: 'Independiente', pattern: '%Independiente%', logo: '/logos/independiente.png' },
  { key: 'canon', name: 'El cañon', pattern: '%cañon%', logo: '/logos/el_canon.png' },
  { key: 'racing', name: 'Racing', pattern: '%Racing%', logo: '/logos/racing.png' },

  { key: 'nacion', name: 'Nacion', pattern: '%nacio%', logo: '/logos/nacion.png' },
  { key: 'depnorte', name: 'Deportivo Norte', pattern: '%Deportivo Norte%', logo: '/logos/deportivo_norte.png' },
  { key: 'almagro', name: 'Almagro', pattern: '%Almagro%', logo: '/logos/almagro_florida.png' },
  { key: 'circulo', name: 'Circulo', pattern: '%Circulo%', logo: '/logos/circulo_deportivo.png' },

  { key: 'river', name: 'River Plate', pattern: '%River%', logo: '/logos/river_plate.png' },
  { key: 'colegia', name: 'Colegiales', pattern: '%Colegiales%', logo: '/logos/colegiales_el_siciliano.png' },
  { key: 'sanjose', name: 'San José', pattern: '%San Jos%', logo: '/logos/san_jose.png' },
  { key: 'cadetes', name: 'Cadetes', pattern: '%Cadetes%', logo: '/logos/cadetes.png' },

  { key: 'banfield', name: 'Banfield', pattern: '%Banfield%', logo: '/logos/banfield.png' },
  { key: 'onceunidos', name: 'Once Unidos', pattern: '%Once Unidos%', logo: '/logos/once_unidos.png' },
  { key: 'urquiza', name: 'General Urquiza', pattern: '%Urquiza%', logo: '/logos/general_urquiza.png' },
  { key: 'banco', name: 'Banco Provincia', pattern: '%Banco%', logo: '/logos/banco_provincia.png' },
];

const TEAM_MAP = {};
TEAMS.forEach(t => { TEAM_MAP[t.name] = t.key; });

// ─── 4. Emparejamientos Oficiales (6 fechas x 7 zonas) ──────────────────────
const PAIRINGS = [
  // ZONA A
  { zone: 'Zona A', round: 1, home: 'Libertad', away: 'Argentinos del Sud' },
  { zone: 'Zona A', round: 1, home: 'San Lorenzo', away: 'Aldosivi' },
  { zone: 'Zona A', round: 2, home: 'Aldosivi', away: 'Libertad' },
  { zone: 'Zona A', round: 2, home: 'Argentinos del Sud', away: 'San Lorenzo' },
  { zone: 'Zona A', round: 3, home: 'Libertad', away: 'San Lorenzo' },
  { zone: 'Zona A', round: 3, home: 'Aldosivi', away: 'Argentinos del Sud' },
  { zone: 'Zona A', round: 4, home: 'Argentinos del Sud', away: 'Libertad' },
  { zone: 'Zona A', round: 4, home: 'Aldosivi', away: 'San Lorenzo' },
  { zone: 'Zona A', round: 5, home: 'Libertad', away: 'Aldosivi' },
  { zone: 'Zona A', round: 5, home: 'San Lorenzo', away: 'Argentinos del Sud' },
  { zone: 'Zona A', round: 6, home: 'San Lorenzo', away: 'Libertad' },
  { zone: 'Zona A', round: 6, home: 'Argentinos del Sud', away: 'Aldosivi' },

  // ZONA B
  { zone: 'Zona B', round: 1, home: 'Chapadmalal', away: 'Kimberley' },
  { zone: 'Zona B', round: 1, home: 'Boca Juniors', away: 'Talleres' },
  { zone: 'Zona B', round: 2, home: 'Talleres', away: 'Chapadmalal' },
  { zone: 'Zona B', round: 2, home: 'Kimberley', away: 'Boca Juniors' },
  { zone: 'Zona B', round: 3, home: 'Chapadmalal', away: 'Boca Juniors' },
  { zone: 'Zona B', round: 3, home: 'Talleres', away: 'Kimberley' },
  { zone: 'Zona B', round: 4, home: 'Kimberley', away: 'Chapadmalal' },
  { zone: 'Zona B', round: 4, home: 'Talleres', away: 'Boca Juniors' },
  { zone: 'Zona B', round: 5, home: 'Chapadmalal', away: 'Talleres' },
  { zone: 'Zona B', round: 5, home: 'Boca Juniors', away: 'Kimberley' },
  { zone: 'Zona B', round: 6, home: 'Boca Juniors', away: 'Chapadmalal' },
  { zone: 'Zona B', round: 6, home: 'Kimberley', away: 'Talleres' },

  // ZONA C
  { zone: 'Zona C', round: 1, home: 'Atlético Mar del Plata', away: 'Alvarado' },
  { zone: 'Zona C', round: 1, home: 'Al Ver Veras', away: 'San Isidro' },
  { zone: 'Zona C', round: 2, home: 'San Isidro', away: 'Atlético Mar del Plata' },
  { zone: 'Zona C', round: 2, home: 'Alvarado', away: 'Al Ver Veras' },
  { zone: 'Zona C', round: 3, home: 'Atlético Mar del Plata', away: 'Al Ver Veras' },
  { zone: 'Zona C', round: 3, home: 'San Isidro', away: 'Alvarado' },
  { zone: 'Zona C', round: 4, home: 'Alvarado', away: 'Atlético Mar del Plata' },
  { zone: 'Zona C', round: 4, home: 'San Isidro', away: 'Al Ver Veras' },
  { zone: 'Zona C', round: 5, home: 'Atlético Mar del Plata', away: 'San Isidro' },
  { zone: 'Zona C', round: 5, home: 'Al Ver Veras', away: 'Alvarado' },
  { zone: 'Zona C', round: 6, home: 'Al Ver Veras', away: 'Atlético Mar del Plata' },
  { zone: 'Zona C', round: 6, home: 'Alvarado', away: 'San Isidro' },

  // ZONA D
  { zone: 'Zona D', round: 1, home: 'Independiente', away: 'El cañon' },
  { zone: 'Zona D', round: 1, home: 'Racing', away: 'Quilmes' },
  { zone: 'Zona D', round: 2, home: 'Quilmes', away: 'Independiente' },
  { zone: 'Zona D', round: 2, home: 'El cañon', away: 'Racing' },
  { zone: 'Zona D', round: 3, home: 'Independiente', away: 'Racing' },
  { zone: 'Zona D', round: 3, home: 'Quilmes', away: 'El cañon' },
  { zone: 'Zona D', round: 4, home: 'El cañon', away: 'Independiente' },
  { zone: 'Zona D', round: 4, home: 'Quilmes', away: 'Racing' },
  { zone: 'Zona D', round: 5, home: 'Independiente', away: 'Quilmes' },
  { zone: 'Zona D', round: 5, home: 'Racing', away: 'El cañon' },
  { zone: 'Zona D', round: 6, home: 'Racing', away: 'Independiente' },
  { zone: 'Zona D', round: 6, home: 'El cañon', away: 'Quilmes' },

  // ZONA E
  { zone: 'Zona E', round: 1, home: 'Deportivo Norte', away: 'Circulo' },
  { zone: 'Zona E', round: 1, home: 'Almagro', away: 'Nacion' },
  { zone: 'Zona E', round: 2, home: 'Nacion', away: 'Deportivo Norte' },
  { zone: 'Zona E', round: 2, home: 'Circulo', away: 'Almagro' },
  { zone: 'Zona E', round: 3, home: 'Deportivo Norte', away: 'Almagro' },
  { zone: 'Zona E', round: 3, home: 'Nacion', away: 'Circulo' },
  { zone: 'Zona E', round: 4, home: 'Circulo', away: 'Deportivo Norte' },
  { zone: 'Zona E', round: 4, home: 'Nacion', away: 'Almagro' },
  { zone: 'Zona E', round: 5, home: 'Deportivo Norte', away: 'Nacion' },
  { zone: 'Zona E', round: 5, home: 'Almagro', away: 'Circulo' },
  { zone: 'Zona E', round: 6, home: 'Almagro', away: 'Deportivo Norte' },
  { zone: 'Zona E', round: 6, home: 'Circulo', away: 'Nacion' },

  // ZONA F
  { zone: 'Zona F', round: 1, home: 'Colegiales', away: 'San José' },
  { zone: 'Zona F', round: 1, home: 'River Plate', away: 'Cadetes' },
  { zone: 'Zona F', round: 2, home: 'Cadetes', away: 'Colegiales' },
  { zone: 'Zona F', round: 2, home: 'San José', away: 'River Plate' },
  { zone: 'Zona F', round: 3, home: 'Colegiales', away: 'River Plate' },
  { zone: 'Zona F', round: 3, home: 'Cadetes', away: 'San José' },
  { zone: 'Zona F', round: 4, home: 'San José', away: 'Colegiales' },
  { zone: 'Zona F', round: 4, home: 'Cadetes', away: 'River Plate' },
  { zone: 'Zona F', round: 5, home: 'Colegiales', away: 'Cadetes' },
  { zone: 'Zona F', round: 5, home: 'River Plate', away: 'San José' },
  { zone: 'Zona F', round: 6, home: 'River Plate', away: 'Colegiales' },
  { zone: 'Zona F', round: 6, home: 'San José', away: 'Cadetes' },

  // ZONA G
  { zone: 'Zona G', round: 1, home: 'Banco Provincia', away: 'Banfield' },
  { zone: 'Zona G', round: 1, home: 'General Urquiza', away: 'Once Unidos' },
  { zone: 'Zona G', round: 2, home: 'Once Unidos', away: 'Banco Provincia' },
  { zone: 'Zona G', round: 2, home: 'Banfield', away: 'General Urquiza' },
  { zone: 'Zona G', round: 3, home: 'Banco Provincia', away: 'General Urquiza' },
  { zone: 'Zona G', round: 3, home: 'Once Unidos', away: 'Banfield' },
  { zone: 'Zona G', round: 4, home: 'Banfield', away: 'Banco Provincia' },
  { zone: 'Zona G', round: 4, home: 'Once Unidos', away: 'General Urquiza' },
  { zone: 'Zona G', round: 5, home: 'Banco Provincia', away: 'Once Unidos' },
  { zone: 'Zona G', round: 5, home: 'General Urquiza', away: 'Banfield' },
  { zone: 'Zona G', round: 6, home: 'General Urquiza', away: 'Banco Provincia' },
  { zone: 'Zona G', round: 6, home: 'Banfield', away: 'Once Unidos' },
];

// ─── 5. Resultados Oficiales de Fecha 1 (11 divisiones por serie) ───────────
const FECHA_1_RESULTS = {
  'Libertad_Argentinos del Sud': [
    [0, 2], [1, 2], [0, 4], [0, 5], [0, 2], [0, 6], [0, 3], [1, 5], [1, 4], [0, 4], [0, 3]
  ],
  'San Lorenzo_Aldosivi': [
    [0, 8], [0, 3], [0, 2], [0, 2], [1, 2], [0, 2], [0, 4], [0, 8], [0, 4], [1, 4], [1, 0]
  ],
  'Chapadmalal_Kimberley': [
    [1, 3], [0, 5], [0, 7], [1, 2], [0, 6], [0, 7], [1, 4], [1, 2], [1, 7], [0, 7], [0, 1]
  ],
  'Boca Juniors_Talleres': [
    [1, 2], [1, 3], [0, 2], [0, 4], [1, 1], [1, 6], [0, 1], [0, 5], [0, 3], [0, 4], [0, 1]
  ],
  'Atlético Mar del Plata_Alvarado': [
    [0, 3], [1, 1], [0, 1], [4, 1], [1, 1], [0, 2], [0, 4], [1, 2], [2, 3], [0, 2], [0, 0]
  ],
  'Al Ver Veras_San Isidro': [
    [1, 4], [0, 1], [0, 5], [0, 1], [0, 2], [0, 3], [1, 0], [4, 5], [0, 0], [6, 1], [4, 0]
  ],
  'Independiente_El cañon': [
    [2, 2], [1, 0], [0, 0], [1, 1], [6, 0], [2, 1], [1, 0], [2, 3], [0, 2], [1, 1], [2, 2]
  ],
  'Racing_Quilmes': [
    [2, 3], [1, 3], [1, 1], [0, 0], [0, 5], [1, 4], [0, 11], [0, 1], [1, 4], [0, 1], [0, 0]
  ],
  'Deportivo Norte_Circulo': [
    [1, 0], [1, 0], [0, 0], [0, 0], [3, 0], [2, 0], [1, 2], [1, 2], [6, 0], [7, 0], [1, 1]
  ],
  'Almagro_Nacion': [
    [2, 1], [1, 3], [1, 7], [0, 8], [0, 3], [0, 2], [3, 1], [2, 1], [1, 5], [0, 0], [0, 0]
  ],
  'Colegiales_San José': [
    [0, 0], [0, 1], [6, 0], [0, 5], [4, 0], [1, 3], [2, 0], [2, 1], [2, 0], [9, 0], [7, 0]
  ],
  'River Plate_Cadetes': [
    [2, 1], [0, 1], [2, 0], [0, 2], [3, 1], [2, 1], [0, 0], [5, 2], [1, 1], [4, 0], [0, 4]
  ],
  'Banco Provincia_Banfield': [
    [1, 3], [1, 9], [0, 10], [0, 5], [1, 7], [0, 2], [0, 9], [2, 3], [0, 2], [0, 1], [0, 1]
  ],
  'General Urquiza_Once Unidos': [
    [2, 0], [0, 2], [1, 0], [2, 4], [0, 1], [0, 3], [0, 5], [3, 2], [1, 0], [1, 1], [1, 4]
  ],
};

// ─── 5.1 Resultados Oficiales de Fecha 2 (25/10/26) ─────────────────────────
// null indica partido suspendido (SU) o no jugado -> queda como scheduled
const FECHA_2_RESULTS = {
  // ZONA A
  'Aldosivi_Libertad': [
    null,   // 7ma: SU
    null,   // 8va: SU
    null,   // 9na: SU
    [9, 0], // 10ma
    [9, 1], // 11ma
    [9, 0], // 12ma
    [7, 1], // 13ra
    [8, 0], // 14ta
    [6, 0], // 15ta
    [12, 0],// 16ta
    [11, 0] // 17ma
  ],
  'Argentinos del Sud_San Lorenzo': [
    [1, 1], // 7ma
    [4, 1], // 8va
    [0, 1], // 9na
    [0, 1], // 10ma
    [0, 1], // 11ma
    [2, 1], // 12ma
    [1, 0], // 13ra
    [5, 0], // 14ta
    [2, 0], // 15ta
    [0, 0], // 16ta
    [2, 3]  // 17ma
  ],

  // ZONA B
  'Talleres_Chapadmalal': [
    [1, 0], // 7ma
    [4, 1], // 8va
    [4, 0], // 9na
    [5, 1], // 10ma
    [0, 0], // 11ma
    [2, 0], // 12ma
    [1, 2], // 13ra
    [0, 1], // 14ta
    [3, 0], // 15ta
    [2, 0], // 16ta
    [1, 0]  // 17ma (Chapadmalal NP)
  ],
  'Kimberley_Boca Juniors': [
    [3, 2], // 7ma
    [3, 0], // 8va
    [8, 1], // 9na
    [8, 0], // 10ma
    [1, 0], // 11ma
    [7, 0], // 12ma
    [1, 0], // 13ra (Boca NP)
    [6, 0], // 14ta
    [3, 1], // 15ta
    [8, 0], // 16ta
    [1, 0]  // 17ma (Boca NP)
  ],

  // ZONA C
  'San Isidro_Atlético Mar del Plata': [
    [0, 3], // 7ma
    [2, 2], // 8va
    [0, 2], // 9na
    [0, 0], // 10ma
    [1, 0], // 11ma
    [0, 0], // 12ma
    [0, 0], // 13ra
    [1, 2], // 14ta
    [6, 0], // 15ta
    [1, 1], // 16ta
    [0, 3]  // 17ma
  ],
  'Alvarado_Al Ver Veras': [
    [4, 0], // 7ma
    [1, 0], // 8va (Al Ver Veras NP)
    [11, 0],// 9na
    [8, 0], // 10ma
    [1, 2], // 11ma
    [3, 0], // 12ma
    [8, 0], // 13ra
    [6, 1], // 14ta
    [1, 2], // 15ta
    [7, 0], // 16ta
    [0, 1]  // 17ma
  ],

  // ZONA D
  'Quilmes_Independiente': [
    null,   // 7ma: SU
    null,   // 8va: SU
    [0, 1], // 9na
    [1, 3], // 10ma
    [0, 2], // 11ma
    [0, 3], // 12ma
    [1, 0], // 13ra
    [1, 2], // 14ta
    [0, 3], // 15ta
    [1, 0], // 16ta
    [0, 1]  // 17ma (Quilmes NP)
  ],
  'El cañon_Racing': [
    [5, 1], // 7ma
    [1, 1], // 8va
    [4, 0], // 9na
    [5, 0], // 10ma
    [5, 0], // 11ma
    [15, 0],// 12ma
    [5, 0], // 13ra
    [0, 3], // 14ta
    [5, 2], // 15ta
    [1, 0], // 16ta (Racing NP)
    [1, 0]  // 17ma (Racing NP)
  ],

  // ZONA E
  'Nacion_Deportivo Norte': [
    [0, 3], // 7ma
    [0, 1], // 8va
    [4, 3], // 9na
    [5, 0], // 10ma
    [1, 2], // 11ma
    [0, 0], // 12ma
    [1, 1], // 13ra
    [2, 3], // 14ta
    [2, 3], // 15ta
    [0, 3], // 16ta
    [0, 1]  // 17ma (Nacion NP)
  ],
  'Circulo_Almagro': [
    [5, 1], // 7ma
    [4, 2], // 8va
    [3, 1], // 9na
    [3, 1], // 10ma
    [2, 0], // 11ma
    [3, 0], // 12ma
    [1, 3], // 13ra
    [9, 0], // 14ta
    [3, 1], // 15ta
    [3, 2], // 16ta
    [1, 0]  // 17ma (Almagro NP)
  ],

  // ZONA F
  'Cadetes_Colegiales': [
    [5, 1], // 7ma
    [1, 0], // 8va (Colegiales NP)
    [2, 1], // 9na
    [8, 0], // 10ma
    [1, 2], // 11ma
    [4, 0], // 12ma
    [2, 0], // 13ra
    [5, 0], // 14ta
    [3, 1], // 15ta
    null,   // 16ta: sin resultado cargado / pendiente
    [0, 2]  // 17ma
  ],
  'San José_River Plate': [
    [0, 7], // 7ma
    [0, 2], // 8va
    [1, 4], // 9na
    [1, 2], // 10ma
    [0, 6], // 11ma
    [0, 2], // 12ma
    [0, 0], // 13ra
    [0, 0], // 14ta
    [0, 4], // 15ta
    [0, 7], // 16ta
    [0, 5]  // 17ma
  ],

  // ZONA G
  'Once Unidos_Banco Provincia': [
    [2, 5], // 7ma
    [3, 1], // 8va
    [3, 0], // 9na
    [3, 1], // 10ma
    [4, 0], // 11ma
    [10, 2],// 12ma
    [5, 1], // 13ra
    [6, 1], // 14ta
    [3, 1], // 15ta
    [1, 0], // 16ta (Banco Provincia NP)
    [1, 0]  // 17ma (Banco Provincia NP)
  ],
  'Banfield_General Urquiza': [
    [0, 3], // 7ma
    [8, 0], // 8va
    [0, 1], // 9na
    [2, 0], // 10ma
    [5, 0], // 11ma
    [4, 0], // 12ma
    [5, 0], // 13ra
    [8, 0], // 14ta
    [9, 1], // 15ta
    [4, 0], // 16ta
    [2, 2]  // 17ma
  ],
};

function generateSql() {
  let sql = `-- =============================================================================
-- TORNEO ARMANDO "CHAMACO" ADARO 2026 - FIXTURE COMPLETO Y RESULTADOS OFICIALES
-- Liga Marplatense de Fútbol - Formato Copas Multinivel (Platino, Oro, Plata, Bronce)
-- =============================================================================
-- Script integral para ejecutar en: Supabase Dashboard -> SQL Editor
-- Incluye:
--  1. Migración de columnas de soporte (format, penales y etapas)
--  2. Torneo Adaro 2026 oficial (marcado como is_current = true)
--  3. Las 7 Zonas oficiales (Zona A a Zona G)
--  4. Las 11 Divisiones oficiales (7ma a 17ma inclusive)
--  5. Verificación de los 28 clubes
--  6. Fixture completo de 6 fechas ida y vuelta (924 partidos)
--  7. Carga de resultados oficiales ya disputados en Fecha 1
-- =============================================================================

-- ─── 1. MIGRACIÓN DE ESQUEMA (RETROCOMPATIBLE) ────────────────────────────────

ALTER TABLE public.tournaments 
  ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'liga_clasica';

ALTER TABLE public.matches 
  ADD COLUMN IF NOT EXISTS home_penalties INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS away_penalties INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'regular';

-- ─── 2. TORNEO ARMANDO "CHAMACO" ADARO 2026 ──────────────────────────────────

-- Desactivar bandera is_current de torneos anteriores para que Adaro sea el actual
UPDATE public.tournaments SET is_current = false WHERE is_current = true;

-- Insertar o actualizar Torneo Adaro
INSERT INTO public.tournaments (name, year, is_current, format)
  SELECT 'Torneo Armando "Chamaco" Adaro', 2026, true, 'copas_multinivel'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.tournaments 
    WHERE name ILIKE '%adaro%' OR name ILIKE '%chamaco%'
  );

UPDATE public.tournaments
  SET is_current = true, format = 'copas_multinivel'
  WHERE name ILIKE '%adaro%' OR name ILIKE '%chamaco%';

-- ─── 3. LAS 7 ZONAS OFICIALES ─────────────────────────────────────────────────

INSERT INTO public.zones (name) SELECT 'Zona A' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona A');
INSERT INTO public.zones (name) SELECT 'Zona B' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona B');
INSERT INTO public.zones (name) SELECT 'Zona C' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona C');
INSERT INTO public.zones (name) SELECT 'Zona D' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona D');
INSERT INTO public.zones (name) SELECT 'Zona E' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona E');
INSERT INTO public.zones (name) SELECT 'Zona F' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona F');
INSERT INTO public.zones (name) SELECT 'Zona G' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Zona G');

-- ─── 4. LAS 11 DIVISIONES (7ma a 17ma inclusive) ──────────────────────────────

`;

  DIVISIONS.forEach(d => {
    sql += `INSERT INTO public.divisions (name, sort_order, is_active)
  SELECT '${d.name}', ${d.sort}, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.divisions 
    WHERE name ILIKE '%${d.name}%' OR name ILIKE '%${d.alt}%'
  );
`;
  });

  sql += `
-- Asegurar que todas las 11 divisiones estén activas
UPDATE public.divisions 
  SET is_active = true 
  WHERE name ILIKE '%séptima%' OR name ILIKE '%octava%' OR name ILIKE '%novena%' 
     OR name ILIKE '%décima%' OR name ILIKE '%undécima%' OR name ILIKE '%duodécima%' 
     OR name ILIKE '%decimotercera%' OR name ILIKE '%decimocuarta%' 
     OR name ILIKE '%decimoquinta%' OR name ILIKE '%decimosexta%' 
     OR name ILIKE '%decimoséptima%' OR name ILIKE '%17ma%';

-- ─── 5. VERIFICACIÓN / ALTA DE LOS 28 CLUBES ──────────────────────────────────
`;

  TEAMS.forEach(t => {
    sql += `INSERT INTO public.teams (name, logo_url)
  SELECT '${t.name}', '${t.logo}'
  WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name ILIKE '${t.pattern}');
`;
  });

  sql += `
-- ─── 6. FIXTURE COMPLETO (6 FECHAS x 7 ZONAS x 11 DIVISIONES) ─────────────────

DO $$
DECLARE
  v_tourn uuid;
  v_za uuid; v_zb uuid; v_zc uuid; v_zd uuid; v_ze uuid; v_zf uuid; v_zg uuid;
  
  -- 11 divisiones
  v_d7 uuid; v_d8 uuid; v_d9 uuid; v_d10 uuid; v_d11 uuid; v_d12 uuid;
  v_d13 uuid; v_d14 uuid; v_d15 uuid; v_d16 uuid; v_d17 uuid;

  -- 28 equipos
`;

  TEAMS.forEach(t => {
    sql += `  t_${t.key} uuid;\n`;
  });

  sql += `BEGIN
  -- Obtener ID del Torneo
  SELECT id INTO v_tourn FROM public.tournaments WHERE name ILIKE '%adaro%' OR name ILIKE '%chamaco%' LIMIT 1;

  -- Obtener IDs de las 7 Zonas
  SELECT id INTO v_za FROM public.zones WHERE name = 'Zona A' LIMIT 1;
  SELECT id INTO v_zb FROM public.zones WHERE name = 'Zona B' LIMIT 1;
  SELECT id INTO v_zc FROM public.zones WHERE name = 'Zona C' LIMIT 1;
  SELECT id INTO v_zd FROM public.zones WHERE name = 'Zona D' LIMIT 1;
  SELECT id INTO v_ze FROM public.zones WHERE name = 'Zona E' LIMIT 1;
  SELECT id INTO v_zf FROM public.zones WHERE name = 'Zona F' LIMIT 1;
  SELECT id INTO v_zg FROM public.zones WHERE name = 'Zona G' LIMIT 1;

  -- Obtener IDs de las 11 Divisiones (con coincidencia exacta primero para evitar colisiones)
  SELECT id INTO v_d7  FROM public.divisions WHERE name = 'Séptima División' OR ((name ILIKE '%séptima%' OR name ILIKE '%septima%' OR name ILIKE '%7ma%') AND name NOT ILIKE '%decimo%') LIMIT 1;
  SELECT id INTO v_d8  FROM public.divisions WHERE name = 'Octava División' OR name ILIKE '%octava%' OR name ILIKE '%8va%' LIMIT 1;
  SELECT id INTO v_d9  FROM public.divisions WHERE name = 'Novena División' OR name ILIKE '%novena%' OR name ILIKE '%9na%' LIMIT 1;
  SELECT id INTO v_d10 FROM public.divisions WHERE name = 'Décima División' OR ((name ILIKE '%décima%' OR name ILIKE '%decima%' OR name ILIKE '%10ma%') AND name NOT ILIKE '%un%' AND name NOT ILIKE '%duo%' AND name NOT ILIKE '%ter%' AND name NOT ILIKE '%cuar%' AND name NOT ILIKE '%quin%' AND name NOT ILIKE '%sex%' AND name NOT ILIKE '%sep%') LIMIT 1;
  SELECT id INTO v_d11 FROM public.divisions WHERE name = 'Undécima División' OR name ILIKE '%undécima%' OR name ILIKE '%undecima%' OR name ILIKE '%11ma%' LIMIT 1;
  SELECT id INTO v_d12 FROM public.divisions WHERE name = 'Duodécima División' OR name ILIKE '%duodécima%' OR name ILIKE '%duodecima%' OR name ILIKE '%12ma%' LIMIT 1;
  SELECT id INTO v_d13 FROM public.divisions WHERE name = 'Decimotercera División' OR name ILIKE '%decimotercera%' OR name ILIKE '%13ra%' LIMIT 1;
  SELECT id INTO v_d14 FROM public.divisions WHERE name = 'Decimocuarta División' OR name ILIKE '%decimocuarta%' OR name ILIKE '%14ta%' LIMIT 1;
  SELECT id INTO v_d15 FROM public.divisions WHERE name = 'Decimoquinta División' OR name ILIKE '%decimoquinta%' OR name ILIKE '%15ta%' LIMIT 1;
  SELECT id INTO v_d16 FROM public.divisions WHERE name = 'Decimosexta División' OR name ILIKE '%decimosexta%' OR name ILIKE '%16ta%' LIMIT 1;
  SELECT id INTO v_d17 FROM public.divisions WHERE name = 'Decimoséptima División' OR name ILIKE '%decimoséptima%' OR name ILIKE '%decimoseptima%' OR name ILIKE '%17ma%' LIMIT 1;

  -- Obtener IDs de los 28 Equipos
`;

  TEAMS.forEach(t => {
    sql += `  SELECT id INTO t_${t.key} FROM public.teams WHERE name ILIKE '${t.pattern}' LIMIT 1;\n`;
  });

  sql += `
  -- Limpiar partidos previos de este torneo para evitar duplicaciones
  DELETE FROM public.matches WHERE tournament_id = v_tourn;

  -- ── INSERCIÓN DE PARTIDOS ──
`;

  const zoneVarMap = {
    'Zona A': 'v_za',
    'Zona B': 'v_zb',
    'Zona C': 'v_zc',
    'Zona D': 'v_zd',
    'Zona E': 'v_ze',
    'Zona F': 'v_zf',
    'Zona G': 'v_zg',
  };

  const divVars = ['v_d7', 'v_d8', 'v_d9', 'v_d10', 'v_d11', 'v_d12', 'v_d13', 'v_d14', 'v_d15', 'v_d16', 'v_d17'];

  // Agrupar por zona y fecha
  PAIRINGS.forEach(p => {
    const pairKey = `${p.home}_${p.away}`;
    const scores = FECHA_1_RESULTS[pairKey];
    const hVar = `t_${TEAM_MAP[p.home]}`;
    const aVar = `t_${TEAM_MAP[p.away]}`;
    const zVar = zoneVarMap[p.zone];

    sql += `\n  -- ${p.zone} - Fecha ${p.round}: ${p.home} vs ${p.away}\n`;

    divVars.forEach((dVar, idx) => {
      let homeGoals = 'NULL';
      let awayGoals = 'NULL';
      let status = `'scheduled'`;

      // Cálculo de fecha de calendario válida con salto de mes (Noviembre 2026)
      const baseDate = new Date(Date.UTC(2026, 9, 25)); // 25 Octubre 2026
      baseDate.setUTCDate(baseDate.getUTCDate() + (p.round - 2) * 7);
      const yyyy = baseDate.getUTCFullYear();
      const mm = String(baseDate.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(baseDate.getUTCDate()).padStart(2, '0');
      const hh = String(9 + (idx % 8)).padStart(2, '0');
      let matchDate = `'${yyyy}-${mm}-${dd}T${hh}:00:00-03:00'::timestamptz`;

      if (p.round === 1) {
        status = `'finished'`;
        matchDate = `'2026-10-17T${hh}:00:00-03:00'::timestamptz`;
        if (scores && scores[idx]) {
          homeGoals = scores[idx][0];
          awayGoals = scores[idx][1];
        }
      } else if (p.round === 2) {
        const scoresF2 = FECHA_2_RESULTS[pairKey];
        if (scoresF2 && scoresF2[idx] !== null && scoresF2[idx] !== undefined) {
          status = `'finished'`;
          homeGoals = scoresF2[idx][0];
          awayGoals = scoresF2[idx][1];
          matchDate = `'2026-10-25T${hh}:00:00-03:00'::timestamptz`;
        } else {
          // Suspendido (SU) o no jugado
          status = `'scheduled'`;
          homeGoals = 'NULL';
          awayGoals = 'NULL';
          matchDate = `'2026-10-25T10:00:00-03:00'::timestamptz`;
        }
      }

      sql += `  INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id, home_goals, away_goals, status, match_date, stage)
    VALUES (v_tourn, ${dVar}, ${zVar}, ${p.round}, ${hVar}, ${aVar}, ${homeGoals}, ${awayGoals}, ${status}, ${matchDate}, 'regular');\n`;
    });
  });

  sql += `
  RAISE NOTICE '¡Fixture de Torneo Adaro cargado exitosamente en Supabase!';
END $$;

-- =============================================================================
-- VERIFICACIÓN FINAL TRAS EJECUCIÓN
-- =============================================================================
-- SELECT COUNT(*) AS total_partidos FROM public.matches WHERE tournament_id IN (SELECT id FROM public.tournaments WHERE name ILIKE '%adaro%');
-- SELECT round_number, status, count(*) FROM public.matches WHERE tournament_id IN (SELECT id FROM public.tournaments WHERE name ILIKE '%adaro%') GROUP BY round_number, status ORDER BY round_number;
`;

  return sql;
}

const outputPath = path.join(__dirname, 'sql', 'adaro2026_completo_fixture_supabase.sql');
fs.writeFileSync(outputPath, generateSql(), 'utf8');
console.log(`Generated ${outputPath}`);
