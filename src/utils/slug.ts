export function generateSlug(name: string, id: string | number): string {
  if (!name) return String(id);
  const slug = name
    .toLowerCase()
    .normalize('NFD') // divide characters into base and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove diacritical marks
    .replace(/đ/g, 'd') // replace Vietnamese character
    .replace(/[^a-z0-9\s-]/g, '') // remove special characters
    .trim()
    .replace(/\s+/g, '-') // spaces to hyphen
    .replace(/-+/g, '-'); // collapse multiple hyphens

  return `${slug}.${id}`;
}

export function extractIdFromSlug(slug: string): string {
  if (!slug) return '';
  const parts = slug.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : slug;
}
