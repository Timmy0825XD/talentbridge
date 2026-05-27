import { RatingRaterRole } from '@prisma/client';
import { prisma } from './prisma';

function averageOverall(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return Math.round((sum / scores.length) * 100) / 100;
}

export async function recalculateCandidateReputation(candidateId: string): Promise<void> {
  const ratings = await prisma.contractRating.findMany({
    where: {
      raterRole: RatingRaterRole.COMPANY,
      contract: { candidateId },
    },
    select: { overallScore: true },
  });

  const reputationAvg = averageOverall(ratings.map(r => r.overallScore));
  const ratingCount = ratings.length;

  await prisma.candidateProfile.update({
    where: { id: candidateId },
    data: { reputationAvg, ratingCount },
  });
}

export async function recalculateCompanyReputation(companyId: string): Promise<void> {
  const ratings = await prisma.contractRating.findMany({
    where: {
      raterRole: RatingRaterRole.CANDIDATE,
      contract: { companyId },
    },
    select: { overallScore: true },
  });

  const reputationAvg = averageOverall(ratings.map(r => r.overallScore));
  const ratingCount = ratings.length;

  await prisma.companyProfile.update({
    where: { id: companyId },
    data: { reputationAvg, ratingCount },
  });
}
