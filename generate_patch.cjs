const fs = require('fs');

const divisions = [
  'Decimotercera División',
  'Decimocuarta División',
  'Decimoquinta División',
  'Decimosexta División'
];

const allTeams = [
  // Zona Campeonato (14)
  ['Talleres de Mar del Plata', 'Talleres'],
  ['Deportivo Norte', null],
  ['Kimberley', null],
  ['Once Unidos', null],
  ['Aldosivi', null],
  ['Banfield', null],
  ['Atlético Mar del Plata', null],
  ['Argentinos del Sud', null],
  ['Independiente', null],
  ['River Plate', null],
  ['Cadetes', null],
  ['Nacion', null],
  ['Alvarado', null],
  ['Quilmes', null],

  // Zona Promocion (14)
  ['Boca Juniors', null],
  ['Libertad', null],
  ['Circulo Deportivo', null],
  ['San Lorenzo', null],
  ['General Urquiza', null],
  ['El cañon', 'El Cañón'],
  ['Almagro Florida', null],
  ['Al Ver Veras', null],
  ['Colegiales/Siciliano', null],
  ['Club Banco Provincia de Mar del Plata', 'Banco Provincia'],
  ['Club Social y Deportivo Chapadmalal', 'Chapadmalal'],
  ['San José', null],
  ['Racing', null],
  ['San Isidro', null]
];

function generateRoundRobin(teams) {
  const rounds = [];
  const n = teams.length;
  const teamList = [...teams];
  if (n % 2 !== 0) teamList.push(null);
  const totalRounds = teamList.length - 1;
  const half = teamList.length / 2;

  for (let round = 0; round < totalRounds; round++) {
    const roundMatches = [];
    for (let i = 0; i < half; i++) {
      const home = teamList[i];
      const away = teamList[teamList.length - 1 - i];
      if (home !== null && away !== null) {
        if (round % 2 === 1 && i === 0) {
          roundMatches.push({ home: away[0], away: home[0] });
        } else {
          roundMatches.push({ home: home[0], away: away[0] });
        }
      }
    }
    rounds.push(roundMatches);
    teamList.splice(1, 0, teamList.pop());
  }
  return rounds;
}

const campTeams = allTeams.slice(0, 14);
const promTeams = allTeams.slice(14, 28);
const campSchedule = generateRoundRobin(campTeams);
const promSchedule = generateRoundRobin(promTeams);

let sql = `-- PATCH SCRIPT FOR 13th to 16th DIVISION
DO $$
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
        INSERT INTO public.divisions (name, sort_order) VALUES ('${div}', 1000) RETURNING id INTO v_div_id;
    ELSE
        SELECT id INTO v_div_id FROM public.divisions WHERE name = '${div}' LIMIT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.matches WHERE division_id = v_div_id AND tournament_id = v_tourn_id LIMIT 1) THEN
        -- Campeonate
`;
      campSchedule.forEach((round, roundIndex) => {
        round.forEach(match => {
          sql += `        INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) SELECT v_tourn_id, v_div_id, v_zone_camp, ${roundIndex + 1}, (SELECT id FROM public.teams WHERE name = '${match.home}'), (SELECT id FROM public.teams WHERE name = '${match.away}');\n`;
        });
      });

      sql += `\n        -- Promocion\n`;
      promSchedule.forEach((round, roundIndex) => {
        round.forEach(match => {
          sql += `        INSERT INTO public.matches (tournament_id, division_id, zone_id, round_number, home_team_id, away_team_id) SELECT v_tourn_id, v_div_id, v_zone_prom, ${roundIndex + 1}, (SELECT id FROM public.teams WHERE name = '${match.home}'), (SELECT id FROM public.teams WHERE name = '${match.away}');\n`;
        });
      });

      sql += `    END IF;\n`;
});

sql += `END $$;\n`;

fs.writeFileSync('patch_seed.sql', sql);
console.log('Patch generated!');
