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

function generateRoundRobin(teams) {
  const rounds = [];
  const n = teams.length;
  const teamList = [...teams];
  
  if (n % 2 !== 0) teamList.push(null); // Bye
  
  const totalRounds = teamList.length - 1;
  const halfSize = teamList.length / 2;

  for (let round = 0; round < totalRounds; round++) {
    const roundMatches = [];
    for (let i = 0; i < halfSize; i++) {
      const home = teamList[i];
      const away = teamList[teamList.length - 1 - i];
      if (home !== null && away !== null) {
        roundMatches.push({ home, away });
      }
    }
    rounds.push(roundMatches);
    // Rotate
    teamList.splice(1, 0, teamList.pop());
  }
  return rounds;
}

const campTeams = allTeams.slice(0, 14).map(t => t[0]);
const promTeams = allTeams.slice(14, 28).map(t => t[0]);

const campSchedule = generateRoundRobin(campTeams);
const promSchedule = generateRoundRobin(promTeams);

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
        -- Campeonate Matches
`;
      
      campSchedule.forEach((round, roundIndex) => {
        round.forEach(match => {
          sql += `        INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) SELECT v_tourn_id, v_div_id, v_zone_camp, ${roundIndex + 1}, (SELECT id FROM public.teams WHERE name = '${match.home}'), (SELECT id FROM public.teams WHERE name = '${match.away}');\n`;
        });
      });

      sql += `\n        -- Promocion Matches\n`;
      promSchedule.forEach((round, roundIndex) => {
        round.forEach(match => {
          sql += `        INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) SELECT v_tourn_id, v_div_id, v_zone_prom, ${roundIndex + 1}, (SELECT id FROM public.teams WHERE name = '${match.home}'), (SELECT id FROM public.teams WHERE name = '${match.away}');\n`;
        });
      });

      sql += `    END IF;\n`;
    }
});

sql += `END $$;\n`;

fs.writeFileSync('supabase_seed.sql', sql);
console.log('Done!');
