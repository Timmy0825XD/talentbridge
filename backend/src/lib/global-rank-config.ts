import { prisma } from './prisma';
import { DEFAULT_WEIGHTS, RankingWeights } from './ranking';

export async function getGlobalRankingWeights(): Promise<RankingWeights> {
  const config = await prisma.globalRankConfig.findUnique({ where: { id: 'global' } });

  if (!config) {
    return DEFAULT_WEIGHTS;
  }

  return {
    skills: config.skillsWeight,
    experience: config.experienceWeight,
    education: config.educationWeight,
    certs: config.certsWeight + config.languagesWeight,
    reputation: config.reputationWeight,
    completion: config.completionWeight,
  };
}

export function validateWeightsSum(weights: Record<string, number>): void {
  const sum =
    weights.skillsWeight +
    weights.experienceWeight +
    weights.educationWeight +
    weights.certsWeight +
    weights.reputationWeight +
    weights.languagesWeight +
    weights.completionWeight;

  if (Math.abs(sum - 1.0) > 0.01) {
    throw new Error('WEIGHTS_SUM_INVALID');
  }
}
