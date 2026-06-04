import { prisma } from '../lib/prisma';
import { slugFromName } from '../lib/catalog-resolve';

export async function listActiveCareers() {
  return prisma.career.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

export async function createCareerRecord(name: string) {
  const trimmed = name.trim();
  const existing = await prisma.career.findFirst({
    where: { name: { equals: trimmed, mode: 'insensitive' } },
  });
  if (existing) throw new Error('CAREER_NAME_TAKEN');

  let slug = slugFromName(trimmed);
  const slugTaken = await prisma.career.findUnique({ where: { slug } });
  if (slugTaken) slug = `${slug}-${Date.now().toString(36).slice(-6)}`;

  return prisma.career.create({
    data: { name: trimmed, slug },
  });
}
