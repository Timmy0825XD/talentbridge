import { KeywordType } from '@prisma/client';
import { prisma } from '../lib/prisma';

export async function getKeywords(type?: string) {
  const where: { isActive: boolean; type?: KeywordType } = { isActive: true };
  if (type) where.type = type as KeywordType;

  return prisma.keyword.findMany({
    where,
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, type: true, category: true },
  });
}
