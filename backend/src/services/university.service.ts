import { prisma } from '../lib/prisma';

export async function listActiveUniversities() {
  return prisma.university.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}
