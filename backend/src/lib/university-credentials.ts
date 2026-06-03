import crypto from 'crypto';

const STOP_WORDS = new Set([
  'de', 'del', 'la', 'el', 'y', 'a', 'en', 'los', 'las', 'o', 'e',
]);

const INSTITUTION_PREFIXES = new Set([
  'universidad', 'fundacion', 'corporacion', 'instituto', 'escuela',
  'facultad', 'colegio', 'centro', 'politecnico',
]);

/** Acrónimos conocidos para universidades colombianas (nombre normalizado → slug). */
export const UNIVERSITY_ACRONYMS: Record<string, string> = {
  'universidad popular del cesar': 'upc',
  'universidad nacional de colombia': 'unal',
  'universidad de santander': 'udes',
  'fundacion universitaria del area andina': 'areandina',
  'universidad antonio narino': 'uan',
  'universidad externado de colombia': 'uec',
  'universidad autonoma de bucaramanga': 'unab',
  'universidad mariana': 'umariana',
  'corporacion universitaria minuto de dios': 'uniminuto',
  'universidad nacional abierta y a distancia': 'unad',
  'universidad santo tomas': 'usta',
  'fundacion universidad de bogota jorge tadeo lozano': 'utadeo',
  'universidad del norte': 'uninorte',
  'universidad de medellin': 'udem',
  'universidad del atlantico': 'uniatlantico',
  'universidad de pamplona': 'unipamplona',
  'fundacion de educacion superior uparsistem': 'uparsistem',
};

export function normalizeUniversityName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function tokenize(name: string): string[] {
  return normalizeUniversityName(name)
    .split(/[\s\-]+/)
    .filter(Boolean);
}

function slugFromTokens(tokens: string[]): string {
  const significant = tokens.filter(t => !STOP_WORDS.has(t));
  if (significant.length === 0) return 'uni';

  const first = significant[0];
  const hasInstitutionPrefix = INSTITUTION_PREFIXES.has(first);
  const contentTokens = hasInstitutionPrefix ? significant : significant;

  if (hasInstitutionPrefix) {
    return contentTokens.map(t => t[0]).join('');
  }

  return contentTokens.map(t => t[0]).join('');
}

export function generateUniversitySlug(name: string): string {
  const normalized = normalizeUniversityName(name);
  const acronym = UNIVERSITY_ACRONYMS[normalized];
  if (acronym) return acronym;

  const tokens = tokenize(name);
  return slugFromTokens(tokens);
}

export function resolveUniqueSlug(
  baseSlug: string,
  existingSlugs: Set<string>,
): string {
  let slug = baseSlug;
  let counter = 2;

  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export function getUniversityEmailDomain(): string {
  return process.env.UNIVERSITY_EMAIL_DOMAIN ?? 'talentbridge.com';
}

export function buildUniversityEmail(slug: string): string {
  return `${slug}@${getUniversityEmailDomain()}`;
}

function randomAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, b => chars[b % chars.length]).join('');
}

export function generateUniversityPassword(_name: string, slug: string): string {
  const year = new Date().getFullYear();
  const slugPart = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, '');
  const random = randomAlphanumeric(4);
  return `${slugPart}${year}${random}`;
}
