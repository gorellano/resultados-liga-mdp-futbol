export function createSlug(name: string): string {
  if (!name) return '';
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/[^a-z0-9\-]/g, ''); // remove any other non-alphanumeric characters except hyphen
}

export function formatSlugToTitle(slug: string): string {
  if (!slug) return '';
  
  const map: Record<string, string> = {
    'septima-division': 'Séptima División',
    'octava-division': 'Octava División',
    'novena-division': 'Novena División',
    'decima-division': 'Décima División',
    'undecima-division': 'Undécima División',
    'duodecima-division': 'Duodécima División',
    'decimotercera-division': 'Decimotercera División',
    'decimocuarta-division': 'Decimocuarta División',
    'decimoquinta-division': 'Decimoquinta División',
    'decimosexta-division': 'Decimosexta División',
    'primera-division': 'Primera División',
    'quinta-division': 'Quinta División',
    'sexta-division': 'Sexta División',
  };

  if (map[slug.toLowerCase()]) {
    return map[slug.toLowerCase()];
  }

  // Fallback: replace hyphens with spaces and capitalize words
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

