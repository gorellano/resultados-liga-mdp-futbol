import * as pdfjsLib from 'pdfjs-dist';

// Definir el worker de pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface ParsedMatchResult {
  id: string; // ID único para controlar edición en UI
  division: string;
  divisionNumber: number; // 7..16
  zone: 'CAMPEONATO' | 'PROMOCION';
  homeTeamRaw: string;
  awayTeamRaw: string;
  homeTeamCanonical: string;
  awayTeamCanonical: string;
  homeGoals: number | null;
  awayGoals: number | null;
  status: 'finished' | 'postponed';
  isPostponed: boolean;
  isNoShow: boolean;
  rawLine: string;
}

export interface ParsePdfSummary {
  roundNumber: number | null;
  totalParsed: number;
  finishedCount: number;
  postponedCount: number;
  noShowCount: number;
  results: ParsedMatchResult[];
  unknownTeams: string[];
}

// Mapeo oficial de nombres impresos en el PDF a nombres oficiales en la BD
export const TEAM_ALIAS_MAP: Record<string, string> = {
  // Zona Campeonato
  "TALLERES": "Talleres de Mar del Plata",
  "RIVER PLATE": "River Plate",
  "ARGENTINOS DEL SUD": "Argentinos del Sud",
  "NACION": "Nacion",
  "BANFIELD": "Banfield",
  "QUILMES": "Quilmes",
  "ONCE UNIDOS": "Once Unidos",
  "ALVARADO": "Alvarado",
  "DVO NORTE": "Deportivo Norte",
  "DEPORTIVO NORTE": "Deportivo Norte",
  "CADETES": "Cadetes",
  "KIMBERLEY": "Kimberley",
  "INDEPENDIENTE": "Independiente",
  "ALDOSIVI": "Aldosivi",
  "MAR DEL PLATA": "Atlético Mar del Plata",

  // Zona Promoción / Promocional
  "BOCA": "Boca Juniors",
  "BANCO PROVINCIA": "Club Banco Provincia de Mar del Plata",
  "AL VER VERAS": "Al Ver Veras",
  "SAN JOSE": "San José",
  "EL CAÑON": "El cañon",
  "SAN ISIDRO": "San Isidro",
  "SAN LORENZO": "San Lorenzo",
  "RACING": "Racing",
  "LIBERTAD": "Libertad",
  "CHAPADMALAL": "Club Social y Deportivo Chapadmalal",
  "CIRCULO DEPORTIVO": "Circulo Deportivo",
  "COLEGIALES": "Colegiales/Siciliano",
  "GRAL URQUIZA": "General Urquiza",
  "ALMAGRO FLORIDA": "Almagro Florida",
};

// Mapeo de nombres de divisiones a número de división
export const DIVISION_NAME_MAP: Record<string, number> = {
  "SEPTIMA DIVISION": 7,
  "OCTAVA DIVISION": 8,
  "NOVENA DIVISION": 9,
  "DECIMA DIVISION": 10,
  "DECIMOPRIMERA DIVISION": 11,
  "DECIMOSEGUNDA DIVISION": 12,
  "DECIMOTERCERA DIVISION": 13,
  "DECIMOCUARTA DIVISION": 14,
  "DECIMOQUINTA DIVISION": 15,
  "DECIMOSEXTA DIVISION": 16,
};

/**
 * Normaliza un nombre de equipo del PDF a su nombre canónico en el sistema.
 */
export function normalizeTeamName(rawName: string): string {
  const clean = rawName.trim().toUpperCase();
  if (TEAM_ALIAS_MAP[clean]) {
    return TEAM_ALIAS_MAP[clean];
  }
  for (const [alias, canonical] of Object.entries(TEAM_ALIAS_MAP)) {
    if (clean.includes(alias) || alias.includes(clean)) {
      return canonical;
    }
  }
  return rawName.trim();
}

/**
 * Lee un archivo File PDF en el navegador y extrae el texto por páginas.
 */
export async function readPdfFileInBrowser(file: File): Promise<ParsePdfSummary> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pagesText: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    pagesText.push(pageStrings);
  }

  return parseBoletinPdfText(pagesText);
}

/**
 * Procesa el texto extraído de las páginas del PDF del boletín oficial
 * y retorna los partidos con sus resultados normalizados.
 */
export function parseBoletinPdfText(fullTextPages: string[]): ParsePdfSummary {
  const allText = fullTextPages.join('\n');
  const lines = allText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let roundNumber: number | null = null;
  const roundMatch = allText.match(/RESULTADOS\s+([A-Z]+)\s+FECHA/i);
  if (roundMatch) {
    const roundStr = roundMatch[1].toUpperCase();
    const NUMBERS: Record<string, number> = {
      'PRIMERA': 1, 'SEGUNDA': 2, 'TERCERA': 3, 'CUARTA': 4, 'QUINTA': 5,
      'SEXTA': 6, 'SEPTIMA': 7, 'OCTAVA': 8, 'NOVENA': 9, 'DECIMA': 10,
      'DECIMOPRIMERA': 11, 'DECIMOSEGUNDA': 12, 'DECIMOTERCERA': 13
    };
    if (NUMBERS[roundStr]) {
      roundNumber = NUMBERS[roundStr];
    }
  }

  const results: ParsedMatchResult[] = [];
  const unknownTeams = new Set<string>();

  let currentDivision: string | null = null;
  let currentDivisionNum: number | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const [divName, divNum] of Object.entries(DIVISION_NAME_MAP)) {
      if (line.toUpperCase().includes(divName)) {
        currentDivision = divName;
        currentDivisionNum = divNum;
        break;
      }
    }

    if (!currentDivision || !currentDivisionNum) {
      continue;
    }

    const parsedPairs = parseLineMatches(line, currentDivision, currentDivisionNum);
    for (const matchResult of parsedPairs) {
      results.push(matchResult);

      if (!TEAM_ALIAS_MAP[matchResult.homeTeamRaw]) {
        unknownTeams.add(matchResult.homeTeamRaw);
      }
      if (!TEAM_ALIAS_MAP[matchResult.awayTeamRaw]) {
        unknownTeams.add(matchResult.awayTeamRaw);
      }
    }
  }

  const finishedCount = results.filter(r => r.status === 'finished' && !r.isNoShow).length;
  const postponedCount = results.filter(r => r.isPostponed).length;
  const noShowCount = results.filter(r => r.isNoShow).length;

  return {
    roundNumber,
    totalParsed: results.length,
    finishedCount,
    postponedCount,
    noShowCount,
    results,
    unknownTeams: Array.from(unknownTeams),
  };
}

/**
 * Función interna para extraer partidos de una línea de texto de las tablas del PDF.
 */
function parseLineMatches(
  line: string, 
  division: string, 
  divisionNum: number
): ParsedMatchResult[] {
  const matches: ParsedMatchResult[] = [];
  const cleanLine = line.replace(/\s+/g, ' ');

  const matchRegex = /([A-ZÁÉÍÓÚÑ\s\/]+?)\s+(post|np|\d+)\s+([A-ZÁÉÍÓÚÑ\s\/]+?)\s+(post|np|\d+)/gi;

  let match: RegExpExecArray | null;
  let indexCounter = 0;

  while ((match = matchRegex.exec(cleanLine)) !== null) {
    indexCounter++;
    const rawHome = match[1].trim();
    const resHomeStr = match[2].trim().toLowerCase();
    const rawAway = match[3].trim();
    const resAwayStr = match[4].trim().toLowerCase();

    const homeCanonical = normalizeTeamName(rawHome);
    const awayCanonical = normalizeTeamName(rawAway);

    if (rawHome.includes("DIVISION") || rawAway.includes("DIVISION") || rawHome.includes("ZONA") || rawAway.includes("ZONA")) {
      continue;
    }

    const isPostponed = resHomeStr === 'post' || resAwayStr === 'post';
    const isNoShow = resHomeStr === 'np' || resAwayStr === 'np';

    let homeGoals: number | null = null;
    let awayGoals: number | null = null;
    let status: 'finished' | 'postponed' = 'finished';

    if (isPostponed) {
      status = 'postponed';
      homeGoals = null;
      awayGoals = null;
    } else {
      homeGoals = resHomeStr === 'np' ? 0 : parseInt(resHomeStr, 10);
      awayGoals = resAwayStr === 'np' ? 0 : parseInt(resAwayStr, 10);
    }

    const isPromocionTeam = [
      "Boca Juniors", "Al Ver Veras", "El cañon", "San Lorenzo", "Libertad", 
      "Circulo Deportivo", "General Urquiza", "Club Banco Provincia de Mar del Plata",
      "San José", "Racing", "San Isidro", "Colegiales/Siciliano", "Club Social y Deportivo Chapadmalal",
      "Almagro Florida"
    ].includes(homeCanonical) || [
      "Boca Juniors", "Al Ver Veras", "El cañon", "San Lorenzo", "Libertad", 
      "Circulo Deportivo", "General Urquiza", "Club Banco Provincia de Mar del Plata",
      "San José", "Racing", "San Isidro", "Colegiales/Siciliano", "Club Social y Deportivo Chapadmalal",
      "Almagro Florida"
    ].includes(awayCanonical);

    const zone: 'CAMPEONATO' | 'PROMOCION' = isPromocionTeam ? 'PROMOCION' : 'CAMPEONATO';

    matches.push({
      id: `parsed-${divisionNum}-${zone}-${indexCounter}-${Date.now()}`,
      division,
      divisionNumber: divisionNum,
      zone,
      homeTeamRaw: rawHome,
      awayTeamRaw: rawAway,
      homeTeamCanonical: homeCanonical,
      awayTeamCanonical: awayCanonical,
      homeGoals,
      awayGoals,
      status,
      isPostponed,
      isNoShow,
      rawLine: match[0],
    });
  }

  return matches;
}
