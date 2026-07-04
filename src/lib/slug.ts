export function createSlug(name: string): string {
  if (!name) return '';
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/[^a-z0-9\-]/g, ''); // remove any other non-alphanumeric characters except hyphen
}
