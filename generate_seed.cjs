const fs = require('fs');

const divisions = [
  'Primera División',
  'Quinta División',
  'Sexta División',
  'Séptima División',
  'Octava División',
  'Novena División',
  'Décima División',
  'Undécima División',
  'Duodécima División',
  'Decimotercera División',
  'Decimocuarta División',
  'Decimoquinta División',
  'Decimosexta División'
];

const allTeams = [
  // Zona Campeonato (14)
  ['Talleres de Mar del Plata', 'Talleres', '/logos/talleres.png'],
  ['Deportivo Norte', null, '/logos/deportivo_norte.png'],
  ['Kimberley', null, '/logos/kimberley.png'],
  ['Once Unidos', null, '/logos/once_unidos.png'],
  ['Aldosivi', null, '/logos/aldosivi.png'],
  ['Banfield', null, '/logos/banfield.png'],
  ['Atlético Mar del Plata', null, '/logos/atletico_mar_del_plata.png'],
  ['Argentinos del Sud', null, '/logos/argentinos_del_sud.png'],
  ['Independiente', null, '/logos/independiente.png'],
  ['River Plate', null, '/logos/river_plate.png'],
  ['Cadetes', null, '/logos/cadetes.png'],
  ['Nacion', null, '/logos/nacion.png'],
  ['Alvarado', null, '/logos/alvarado.png'],
  ['Quilmes', null, '/logos/quilmes.png'],

  // Zona Promocion (14)
  ['Boca Juniors', null, '/logos/boca_juniors.png'],
  ['Libertad', null, '/logos/libertad.png'],
  ['Circulo Deportivo', null, '/logos/circulo_deportivo.png'],
  ['San Lorenzo', null, '/logos/san_lorenzo.png'],
  ['General Urquiza', null, '/logos/general_urquiza.png'],
  ['El cañon', 'El Cañón', '/logos/el_canon.png'],
  ['Almagro Florida', null, '/logos/almagro_florida.png'],
  ['Al Ver Veras', null, '/logos/al_ver_veras.png'],
  ['Colegiales/Siciliano', null, '/logos/colegiales_el_siciliano.png'],
  ['Club Banco Provincia de Mar del Plata', 'Banco Provincia', '/logos/banco_provincia.png'],
  ['Club Social y Deportivo Chapadmalal', 'Chapadmalal', '/logos/chapadmalal.png'],
  ['San José', null, '/logos/san_jose.png'],
  ['Racing', null, '/logos/racing.png'],
  ['San Isidro', null, '/logos/san_isidro.png']
];

const campMap = {
  "TALLERES": "Talleres de Mar del Plata",
  "DVO NORTE": "Deportivo Norte",
  "KIMBERLEY": "Kimberley",
  "ONCE UNIDOS": "Once Unidos",
  "ALDOSIVI": "Aldosivi",
  "BANFIELD": "Banfield",
  "MAR DEL PLATA": "Atlético Mar del Plata",
  "ARG. DEL SUD": "Argentinos del Sud",
  "INDEPENDIENTE": "Independiente",
  "RIVER PLATE": "River Plate",
  "CADETES": "Cadetes",
  "NACION": "Nacion",
  "ALVARADO": "Alvarado",
  "QUILMES": "Quilmes"
};

const promMap = {
  "BOCA JRS": "Boca Juniors",
  "LIBERTAD": "Libertad",
  "CIRCULO DVO": "Circulo Deportivo",
  "SAN LORENZO": "San Lorenzo",
  "GRAL. URQUIZA": "General Urquiza",
  "EL CAÑON": "El cañon",
  "ALM. FLORIDA": "Almagro Florida",
  "AL VER VERAS": "Al Ver Veras",
  "COLEGIALES": "Colegiales/Siciliano",
  "BANCO PROVINCIA": "Club Banco Provincia de Mar del Plata",
  "CHAPADMALAL": "Club Social y Deportivo Chapadmalal",
  "SAN JOSE": "San José",
  "RACING": "Racing",
  "SAN ISIDRO": "San Isidro"
};

// Fixture real Zona Campeonato (13 fechas)
const FIXTURE_CAMPEONATO = [
  // PRIMERA FECHA
  { round: 1,  home: "TALLERES",      away: "DVO NORTE" },
  { round: 1,  home: "KIMBERLEY",     away: "ONCE UNIDOS" },
  { round: 1,  home: "ALDOSIVI",      away: "BANFIELD" },
  { round: 1,  home: "MAR DEL PLATA", away: "ARG. DEL SUD" },
  { round: 1,  home: "INDEPENDIENTE", away: "RIVER PLATE" },
  { round: 1,  home: "CADETES",       away: "NACION" },
  { round: 1,  home: "ALVARADO",      away: "QUILMES" },
  // SEGUNDA FECHA
  { round: 2,  home: "ALVARADO",      away: "TALLERES" },
  { round: 2,  home: "QUILMES",       away: "CADETES" },
  { round: 2,  home: "NACION",        away: "INDEPENDIENTE" },
  { round: 2,  home: "RIVER PLATE",   away: "MAR DEL PLATA" },
  { round: 2,  home: "ARG. DEL SUD",  away: "ALDOSIVI" },
  { round: 2,  home: "BANFIELD",      away: "KIMBERLEY" },
  { round: 2,  home: "ONCE UNIDOS",   away: "DVO NORTE" },
  // TERCERA FECHA
  { round: 3,  home: "TALLERES",      away: "ONCE UNIDOS" },
  { round: 3,  home: "DVO NORTE",     away: "BANFIELD" },
  { round: 3,  home: "KIMBERLEY",     away: "ARG. DEL SUD" },
  { round: 3,  home: "ALDOSIVI",      away: "RIVER PLATE" },
  { round: 3,  home: "MAR DEL PLATA", away: "NACION" },
  { round: 3,  home: "INDEPENDIENTE", away: "QUILMES" },
  { round: 3,  home: "CADETES",       away: "ALVARADO" },
  // CUARTA FECHA
  { round: 4,  home: "CADETES",       away: "TALLERES" },
  { round: 4,  home: "ALVARADO",      away: "INDEPENDIENTE" },
  { round: 4,  home: "QUILMES",       away: "MAR DEL PLATA" },
  { round: 4,  home: "NACION",        away: "ALDOSIVI" },
  { round: 4,  home: "RIVER PLATE",   away: "KIMBERLEY" },
  { round: 4,  home: "ARG. DEL SUD",  away: "DVO NORTE" },
  { round: 4,  home: "BANFIELD",      away: "ONCE UNIDOS" },
  // QUINTA FECHA
  { round: 5,  home: "TALLERES",      away: "BANFIELD" },
  { round: 5,  home: "ONCE UNIDOS",   away: "ARG. DEL SUD" },
  { round: 5,  home: "DVO NORTE",     away: "RIVER PLATE" },
  { round: 5,  home: "KIMBERLEY",     away: "NACION" },
  { round: 5,  home: "ALDOSIVI",      away: "QUILMES" },
  { round: 5,  home: "MAR DEL PLATA", away: "ALVARADO" },
  { round: 5,  home: "INDEPENDIENTE", away: "CADETES" },
  // SEXTA FECHA
  { round: 6,  home: "INDEPENDIENTE", away: "TALLERES" },
  { round: 6,  home: "CADETES",       away: "MAR DEL PLATA" },
  { round: 6,  home: "ALVARADO",      away: "ALDOSIVI" },
  { round: 6,  home: "QUILMES",       away: "KIMBERLEY" },
  { round: 6,  home: "NACION",        away: "DVO NORTE" },
  { round: 6,  home: "RIVER PLATE",   away: "ONCE UNIDOS" },
  { round: 6,  home: "ARG. DEL SUD",  away: "BANFIELD" },
  // SÉPTIMA FECHA
  { round: 7,  home: "TALLERES",      away: "ARG. DEL SUD" },
  { round: 7,  home: "BANFIELD",      away: "RIVER PLATE" },
  { round: 7,  home: "ONCE UNIDOS",   away: "NACION" },
  { round: 7,  home: "DVO NORTE",     away: "QUILMES" },
  { round: 7,  home: "KIMBERLEY",     away: "ALVARADO" },
  { round: 7,  home: "ALDOSIVI",      away: "CADETES" },
  { round: 7,  home: "MAR DEL PLATA", away: "INDEPENDIENTE" },
  // OCTAVA FECHA
  { round: 8,  home: "MAR DEL PLATA", away: "TALLERES" },
  { round: 8,  home: "INDEPENDIENTE", away: "ALDOSIVI" },
  { round: 8,  home: "CADETES",       away: "KIMBERLEY" },
  { round: 8,  home: "ALVARADO",      away: "DVO NORTE" },
  { round: 8,  home: "QUILMES",       away: "ONCE UNIDOS" },
  { round: 8,  home: "NACION",        away: "BANFIELD" },
  { round: 8,  home: "RIVER PLATE",   away: "ARG. DEL SUD" },
  // NOVENA FECHA
  { round: 9,  home: "TALLERES",      away: "RIVER PLATE" },
  { round: 9,  home: "ARG. DEL SUD",  away: "NACION" },
  { round: 9,  home: "BANFIELD",      away: "QUILMES" },
  { round: 9,  home: "ONCE UNIDOS",   away: "ALVARADO" },
  { round: 9,  home: "DVO NORTE",     away: "CADETES" },
  { round: 9,  home: "KIMBERLEY",     away: "INDEPENDIENTE" },
  { round: 9,  home: "ALDOSIVI",      away: "MAR DEL PLATA" },
  // DÉCIMA FECHA
  { round: 10, home: "ALDOSIVI",      away: "TALLERES" },
  { round: 10, home: "MAR DEL PLATA", away: "KIMBERLEY" },
  { round: 10, home: "INDEPENDIENTE", away: "DVO NORTE" },
  { round: 10, home: "CADETES",       away: "ONCE UNIDOS" },
  { round: 10, home: "ALVARADO",      away: "BANFIELD" },
  { round: 10, home: "QUILMES",       away: "ARG. DEL SUD" },
  { round: 10, home: "NACION",        away: "RIVER PLATE" },
  // DECIMOPRIMERA FECHA
  { round: 11, home: "TALLERES",      away: "NACION" },
  { round: 11, home: "RIVER PLATE",   away: "QUILMES" },
  { round: 11, home: "ARG. DEL SUD",  away: "ALVARADO" },
  { round: 11, home: "BANFIELD",      away: "CADETES" },
  { round: 11, home: "ONCE UNIDOS",   away: "INDEPENDIENTE" },
  { round: 11, home: "DVO NORTE",     away: "MAR DEL PLATA" },
  { round: 11, home: "KIMBERLEY",     away: "ALDOSIVI" },
  // DECIMOSEGUNDA FECHA
  { round: 12, home: "KIMBERLEY",     away: "TALLERES" },
  { round: 12, home: "ALDOSIVI",      away: "DVO NORTE" },
  { round: 12, home: "MAR DEL PLATA", away: "ONCE UNIDOS" },
  { round: 12, home: "INDEPENDIENTE", away: "BANFIELD" },
  { round: 12, home: "CADETES",       away: "ARG. DEL SUD" },
  { round: 12, home: "ALVARADO",      away: "RIVER PLATE" },
  { round: 12, home: "QUILMES",       away: "NACION" },
  // DECIMOTERCERA FECHA
  { round: 13, home: "TALLERES",      away: "QUILMES" },
  { round: 13, home: "NACION",        away: "ALVARADO" },
  { round: 13, home: "RIVER PLATE",   away: "CADETES" },
  { round: 13, home: "ARG. DEL SUD",  away: "INDEPENDIENTE" },
  { round: 13, home: "BANFIELD",      away: "MAR DEL PLATA" },
  { round: 13, home: "ONCE UNIDOS",   away: "ALDOSIVI" },
  { round: 13, home: "DVO NORTE",     away: "KIMBERLEY" },
];

// Fixture real Zona Promoción (13 fechas)
const FIXTURE_PROMOCION = [
  // PRIMERA FECHA
  { round: 1,  home: "BOCA JRS",        away: "LIBERTAD" },
  { round: 1,  home: "CIRCULO DVO",     away: "SAN LORENZO" },
  { round: 1,  home: "GRAL. URQUIZA",   away: "EL CAÑON" },
  { round: 1,  home: "ALM. FLORIDA",    away: "AL VER VERAS" },
  { round: 1,  home: "COLEGIALES",      away: "BANCO PROVINCIA" },
  { round: 1,  home: "CHAPADMALAL",     away: "SAN JOSE" },
  { round: 1,  home: "RACING",          away: "SAN ISIDRO" },
  // SEGUNDA FECHA
  { round: 2,  home: "RACING",          away: "BOCA JRS" },
  { round: 2,  home: "SAN ISIDRO",      away: "CHAPADMALAL" },
  { round: 2,  home: "SAN JOSE",        away: "COLEGIALES" },
  { round: 2,  home: "BANCO PROVINCIA", away: "ALM. FLORIDA" },
  { round: 2,  home: "AL VER VERAS",    away: "GRAL. URQUIZA" },
  { round: 2,  home: "EL CAÑON",        away: "CIRCULO DVO" },
  { round: 2,  home: "SAN LORENZO",     away: "LIBERTAD" },
  // TERCERA FECHA
  { round: 3,  home: "BOCA JRS",        away: "SAN LORENZO" },
  { round: 3,  home: "LIBERTAD",        away: "EL CAÑON" },
  { round: 3,  home: "CIRCULO DVO",     away: "AL VER VERAS" },
  { round: 3,  home: "GRAL. URQUIZA",   away: "BANCO PROVINCIA" },
  { round: 3,  home: "ALM. FLORIDA",    away: "SAN JOSE" },
  { round: 3,  home: "COLEGIALES",      away: "SAN ISIDRO" },
  { round: 3,  home: "CHAPADMALAL",     away: "RACING" },
  // CUARTA FECHA
  { round: 4,  home: "CHAPADMALAL",     away: "BOCA JRS" },
  { round: 4,  home: "RACING",          away: "COLEGIALES" },
  { round: 4,  home: "SAN ISIDRO",      away: "ALM. FLORIDA" },
  { round: 4,  home: "SAN JOSE",        away: "GRAL. URQUIZA" },
  { round: 4,  home: "BANCO PROVINCIA", away: "CIRCULO DVO" },
  { round: 4,  home: "AL VER VERAS",    away: "LIBERTAD" },
  { round: 4,  home: "EL CAÑON",        away: "SAN LORENZO" },
  // QUINTA FECHA
  { round: 5,  home: "BOCA JRS",        away: "EL CAÑON" },
  { round: 5,  home: "SAN LORENZO",     away: "AL VER VERAS" },
  { round: 5,  home: "LIBERTAD",        away: "BANCO PROVINCIA" },
  { round: 5,  home: "CIRCULO DVO",     away: "SAN JOSE" },
  { round: 5,  home: "GRAL. URQUIZA",   away: "SAN ISIDRO" },
  { round: 5,  home: "ALM. FLORIDA",    away: "RACING" },
  { round: 5,  home: "COLEGIALES",      away: "CHAPADMALAL" },
  // SEXTA FECHA
  { round: 6,  home: "COLEGIALES",      away: "BOCA JRS" },
  { round: 6,  home: "CHAPADMALAL",     away: "ALM. FLORIDA" },
  { round: 6,  home: "RACING",          away: "GRAL. URQUIZA" },
  { round: 6,  home: "SAN ISIDRO",      away: "CIRCULO DVO" },
  { round: 6,  home: "SAN JOSE",        away: "LIBERTAD" },
  { round: 6,  home: "BANCO PROVINCIA", away: "SAN LORENZO" },
  { round: 6,  home: "AL VER VERAS",    away: "EL CAÑON" },
  // SEPTIMA FECHA
  { round: 7,  home: "BOCA JRS",        away: "AL VER VERAS" },
  { round: 7,  home: "EL CAÑON",        away: "BANCO PROVINCIA" },
  { round: 7,  home: "SAN LORENZO",     away: "SAN JOSE" },
  { round: 7,  home: "LIBERTAD",        away: "SAN ISIDRO" },
  { round: 7,  home: "CIRCULO DVO",     away: "RACING" },
  { round: 7,  home: "GRAL. URQUIZA",   away: "CHAPADMALAL" },
  { round: 7,  home: "ALM. FLORIDA",    away: "COLEGIALES" },
  // OCTAVA FECHA
  { round: 8,  home: "ALM. FLORIDA",    away: "BOCA JRS" },
  { round: 8,  home: "COLEGIALES",      away: "GRAL. URQUIZA" },
  { round: 8,  home: "CHAPADMALAL",     away: "CIRCULO DVO" },
  { round: 8,  home: "RACING",          away: "LIBERTAD" },
  { round: 8,  home: "SAN ISIDRO",      away: "SAN LORENZO" },
  { round: 8,  home: "SAN JOSE",        away: "EL CAÑON" },
  { round: 8,  home: "BANCO PROVINCIA", away: "AL VER VERAS" },
  // NOVENA FECHA
  { round: 9,  home: "BOCA JRS",        away: "BANCO PROVINCIA" },
  { round: 9,  home: "AL VER VERAS",    away: "SAN JOSE" },
  { round: 9,  home: "EL CAÑON",        away: "SAN ISIDRO" },
  { round: 9,  home: "SAN LORENZO",     away: "RACING" },
  { round: 9,  home: "LIBERTAD",        away: "CHAPADMALAL" },
  { round: 9,  home: "CIRCULO DVO",     away: "COLEGIALES" },
  { round: 9,  home: "GRAL. URQUIZA",   away: "ALM. FLORIDA" },
  // DECIMA FECHA
  { round: 10, home: "GRAL. URQUIZA",   away: "BOCA JRS" },
  { round: 10, home: "ALM. FLORIDA",    away: "CIRCULO DVO" },
  { round: 10, home: "COLEGIALES",      away: "LIBERTAD" },
  { round: 10, home: "CHAPADMALAL",     away: "SAN LORENZO" },
  { round: 10, home: "RACING",          away: "EL CAÑON" },
  { round: 10, home: "SAN ISIDRO",      away: "AL VER VERAS" },
  { round: 10, home: "SAN JOSE",        away: "BANCO PROVINCIA" },
  // DECIMOPRIMERA FECHA
  { round: 11, home: "BOCA JRS",        away: "SAN JOSE" },
  { round: 11, home: "BANCO PROVINCIA", away: "SAN ISIDRO" },
  { round: 11, home: "AL VER VERAS",    away: "RACING" },
  { round: 11, home: "EL CAÑON",        away: "CHAPADMALAL" },
  { round: 11, home: "SAN LORENZO",     away: "COLEGIALES" },
  { round: 11, home: "LIBERTAD",        away: "ALM. FLORIDA" },
  { round: 11, home: "CIRCULO DVO",     away: "GRAL. URQUIZA" },
  // DECIMOSEGUNDA FECHA
  { round: 12, home: "CIRCULO DVO",     away: "BOCA JRS" },
  { round: 12, home: "GRAL. URQUIZA",   away: "LIBERTAD" },
  { round: 12, home: "ALM. FLORIDA",    away: "SAN LORENZO" },
  { round: 12, home: "COLEGIALES",      away: "EL CAÑON" },
  { round: 12, home: "CHAPADMALAL",     away: "AL VER VERAS" },
  { round: 12, home: "RACING",          away: "BANCO PROVINCIA" },
  { round: 12, home: "SAN ISIDRO",      away: "SAN JOSE" },
  // DECIMOTERCERA FECHA
  { round: 13, home: "BOCA JRS",        away: "SAN ISIDRO" },
  { round: 13, home: "SAN JOSE",        away: "RACING" },
  { round: 13, home: "BANCO PROVINCIA", away: "CHAPADMALAL" },
  { round: 13, home: "AL VER VERAS",    away: "COLEGIALES" },
  { round: 13, home: "EL CAÑON",        away: "ALM. FLORIDA" },
  { round: 13, home: "SAN LORENZO",     away: "GRAL. URQUIZA" },
  { round: 13, home: "LIBERTAD",        away: "CIRCULO DVO" },
];

let sql = `-- 1. CREATE ADMIN USERS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'superadmin') THEN
        PERFORM public.create_user('superadmin', 'Admin.2026!', 'super_admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'editor') THEN
        PERFORM public.create_user('editor', 'Editor.2026!', 'editor');
    END IF;
END $$;

-- 2. CREATE TOURNAMENT AND ZONES
INSERT INTO public.tournaments (name, year, is_current) SELECT 'Torneo Anual', 2026, true WHERE NOT EXISTS (SELECT 1 FROM public.tournaments WHERE name = 'Torneo Anual' AND year = 2026);
INSERT INTO public.zones (name) SELECT 'Campeonato' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Campeonato');
INSERT INTO public.zones (name) SELECT 'Promoción' WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Promoción');

-- 3. CREATE TEAMS
`;

allTeams.forEach(t => {
  sql += `INSERT INTO public.teams (name, display_name, logo_url) SELECT '${t[0]}', ${t[1] ? `'${t[1]}'` : 'NULL'}, '${t[2]}' WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = '${t[0]}');\n`;
});

sql += `\n-- 4. CREATE DIVISIONS AND MATCHES\n`;

sql += `DO $$
DECLARE
    v_tourn_id uuid;
    v_zone_camp uuid;
    v_zone_prom uuid;
    v_div_id uuid;
BEGIN
    SELECT id INTO v_tourn_id FROM public.tournaments WHERE name = 'Torneo Anual' AND year = 2026 LIMIT 1;
    SELECT id INTO v_zone_camp FROM public.zones WHERE name = 'Campeonato' LIMIT 1;
    SELECT id INTO v_zone_prom FROM public.zones WHERE name = 'Promoción' LIMIT 1;

`;

divisions.forEach(div => {
  sql += `
    -- ${div}
    IF NOT EXISTS (SELECT 1 FROM public.divisions WHERE name = '${div}') THEN
        INSERT INTO public.divisions (name, sort_order) VALUES ('${div}', ${(divisions.indexOf(div) + 1) * 10}) RETURNING id INTO v_div_id;
    ELSE
        SELECT id INTO v_div_id FROM public.divisions WHERE name = '${div}' LIMIT 1;
    END IF;
`;

    if (!['Primera División', 'Quinta División', 'Sexta División'].includes(div)) {
      sql += `
    IF NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_id AND tournament_id = v_tourn_id LIMIT 1) THEN
        -- Campeonato Matches
`;
      
      FIXTURE_CAMPEONATO.forEach(match => {
        const fullHome = campMap[match.home];
        const fullAway = campMap[match.away];
        sql += `        INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) SELECT v_tourn_id, v_div_id, v_zone_camp, ${match.round}, (SELECT id FROM public.teams WHERE name = '${fullHome}'), (SELECT id FROM public.teams WHERE name = '${fullAway}');\n`;
      });

      sql += `\n        -- Promocion Matches\n`;
      FIXTURE_PROMOCION.forEach(match => {
        const fullHome = promMap[match.home];
        const fullAway = promMap[match.away];
        sql += `        INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) SELECT v_tourn_id, v_div_id, v_zone_prom, ${match.round}, (SELECT id FROM public.teams WHERE name = '${fullHome}'), (SELECT id FROM public.teams WHERE name = '${fullAway}');\n`;
      });

      sql += `    END IF;\n`;
    }
});

sql += `END $$;\n`;

fs.writeFileSync('supabase_seed.sql', sql);
console.log('Done!');
