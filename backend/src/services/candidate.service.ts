import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getCompanyOrThrow } from '../lib/access/profile-access';

export interface CandidateSearchQuery {
  skills?: string;
  career?: string;
  workMode?: string;
  minScore?: number;
  search?: string;
  page?: number;
  limit?: number;
}

const candidateSelect = {
  id: true,
  userId: true,
  fullName: true,
  career: true,
  skills: true,
  softSkills: true,
  workMode: true,
  photoUrl: true,
  summary: true,
  reputationAvg: true,
  ratingCount: true,
  university: { select: { id: true, name: true } },
  score: {
    select: {
      totalScore: true,
      reputationScore: true,
    },
  },
} satisfies Prisma.CandidateProfileSelect;

export async function searchCandidates(userId: string, query: CandidateSearchQuery) {
  await getCompanyOrThrow(userId);

  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const skillList = query.skills
    ? query.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    : [];

  const andConditions: Prisma.CandidateProfileWhereInput[] = [
    { cvUrl: { not: null } },
    { user: { isActive: true, isVerified: true } },
  ];

  if (query.career) {
    andConditions.push({ career: { contains: query.career, mode: 'insensitive' } });
  }
  if (query.workMode) {
    andConditions.push({ workMode: query.workMode });
  }
  if (query.minScore) {
    andConditions.push({ score: { totalScore: { gte: query.minScore } } });
  }
  if (query.search) {
    andConditions.push({
      OR: [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { summary: { contains: query.search, mode: 'insensitive' } },
        { career: { contains: query.search, mode: 'insensitive' } },
      ],
    });
  }
  if (skillList.length > 0) {
    andConditions.push({
      OR: skillList.flatMap(skill => ([
        { skills: { has: skill } },
        { softSkills: { has: skill } },
      ])),
    });
  }

  const where: Prisma.CandidateProfileWhereInput = { AND: andConditions };

  const [candidates, total] = await Promise.all([
    prisma.candidateProfile.findMany({
      where,
      select: candidateSelect,
      orderBy: [{ score: { totalScore: 'desc' } }, { updatedAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.candidateProfile.count({ where }),
  ]);

  return {
    candidates: candidates.map(c => ({
      id: c.id,
      userId: c.userId,
      fullName: c.fullName,
      career: c.career,
      skills: c.skills,
      softSkills: c.softSkills,
      workMode: c.workMode,
      photoUrl: c.photoUrl,
      summary: c.summary ? c.summary.slice(0, 160) : null,
      university: c.university,
      profileScore: c.score
        ? {
            totalScore: c.score.totalScore,
            reputationScore: c.ratingCount > 0 ? c.reputationAvg : null,
          }
        : null,
      reputationAvg: c.ratingCount > 0 ? c.reputationAvg : null,
      ratingCount: c.ratingCount,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}
