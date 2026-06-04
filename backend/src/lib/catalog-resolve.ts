import { prisma } from './prisma';
import { normalizeUniversityName } from './university-credentials';

export function normalizeCatalogName(name: string): string {
  return normalizeUniversityName(name);
}

function slugFromName(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return base || 'carrera';
}

export async function resolveUniversityIdByName(
  rawName: string | null | undefined
): Promise<string | null> {
  if (!rawName?.trim()) return null;
  const normalized = normalizeCatalogName(rawName);

  const exact = await prisma.university.findFirst({
    where: { isActive: true, name: { equals: rawName.trim(), mode: 'insensitive' } },
    select: { id: true },
  });
  if (exact) return exact.id;

  const all = await prisma.university.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });
  const byNorm = all.filter(u => normalizeCatalogName(u.name) === normalized);
  if (byNorm.length === 1) return byNorm[0].id;

  const contains = all.filter(
    u =>
      normalizeCatalogName(u.name).includes(normalized) ||
      normalized.includes(normalizeCatalogName(u.name))
  );
  if (contains.length === 1) return contains[0].id;

  return null;
}

export async function resolveCareerIdByName(
  rawName: string | null | undefined
): Promise<string | null> {
  if (!rawName?.trim()) return null;
  const normalized = normalizeCatalogName(rawName);

  const exact = await prisma.career.findFirst({
    where: { isActive: true, name: { equals: rawName.trim(), mode: 'insensitive' } },
    select: { id: true },
  });
  if (exact) return exact.id;

  const all = await prisma.career.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });
  const byNorm = all.filter(c => normalizeCatalogName(c.name) === normalized);
  if (byNorm.length === 1) return byNorm[0].id;

  const contains = all.filter(
    c =>
      normalizeCatalogName(c.name).includes(normalized) ||
      normalized.includes(normalizeCatalogName(c.name))
  );
  if (contains.length === 1) return contains[0].id;

  return null;
}

export { slugFromName };
