import { RatingRaterRole } from '@prisma/client';
import { prisma } from './prisma';

export async function recalculateCandidateReputation(candidateId: string): Promise<void> {
  const agg = await prisma.contractRating.aggregate({
    where: {
      raterRole: RatingRaterRole.COMPANY,
      contract: { candidateId },
    },
    _avg: { overallScore: true },
    _count: { overallScore: true },
  });

  const ratingCount = agg._count.overallScore;
  const reputationAvg = ratingCount > 0
    ? Math.round((agg._avg.overallScore ?? 0) * 100) / 100
    : 0;

  await prisma.candidateProfile.update({
    where: { id: candidateId },
    data: { reputationAvg, ratingCount },
  });
}

export async function recalculateCompanyReputation(companyId: string): Promise<void> {
  const agg = await prisma.contractRating.aggregate({
    where: {
      raterRole: RatingRaterRole.CANDIDATE,
      contract: { companyId },
    },
    _avg: { overallScore: true },
    _count: { overallScore: true },
  });

  const ratingCount = agg._count.overallScore;
  const reputationAvg = ratingCount > 0
    ? Math.round((agg._avg.overallScore ?? 0) * 100) / 100
    : 0;

  await prisma.companyProfile.update({
    where: { id: companyId },
    data: { reputationAvg, ratingCount },
  });
}
