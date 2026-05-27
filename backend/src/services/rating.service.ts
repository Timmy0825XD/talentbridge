import { ContractStatus, RatingRaterRole } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  assertContractAccess,
  getCandidateOrThrow,
  getCompanyOrThrow,
} from '../lib/access/profile-access';
import {
  recalculateCandidateReputation,
  recalculateCompanyReputation,
} from '../lib/reputation';
import { computeAndSaveScore } from './ranking.service';
import type {
  CandidateRatesCompanyInput,
  CompanyRatesCandidateInput,
} from '../lib/validators/rating.validators';

function averageScores(values: number[]): number {
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

async function getContractForRating(userId: string, contractId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      ratings: true,
      candidate: { select: { userId: true } },
    },
  });

  if (!contract) throw new Error('CONTRACT_NOT_FOUND');
  await assertContractAccess(userId, contract);
  return contract;
}

export async function getContractRatings(userId: string, contractId: string) {
  const contract = await getContractForRating(userId, contractId);

  const companyRating = contract.ratings.find(r => r.raterRole === RatingRaterRole.COMPANY) ?? null;
  const candidateRating = contract.ratings.find(r => r.raterRole === RatingRaterRole.CANDIDATE) ?? null;

  const isCompleted = contract.status === ContractStatus.COMPLETED;
  const isCompany = (await getCompanyOrThrow(userId).catch(() => null))?.id === contract.companyId;
  const isCandidate = contract.candidate.userId === userId;

  return {
    contractStatus: contract.status,
    ratingsPending: isCompleted && (!companyRating || !candidateRating),
    companyRating,
    candidateRating,
    canRateCandidate: isCompleted && isCompany && !companyRating,
    canRateCompany: isCompleted && isCandidate && !candidateRating,
  };
}

export async function rateCandidate(
  userId: string,
  contractId: string,
  data: CompanyRatesCandidateInput
) {
  const company = await getCompanyOrThrow(userId);
  const contract = await prisma.contract.findFirst({
    where: { id: contractId, companyId: company.id },
    include: { ratings: true },
  });

  if (!contract) throw new Error('CONTRACT_NOT_FOUND');
  if (contract.status !== ContractStatus.COMPLETED) throw new Error('CONTRACT_NOT_COMPLETED');

  const existing = contract.ratings.find(r => r.raterRole === RatingRaterRole.COMPANY);
  if (existing) throw new Error('RATING_ALREADY_EXISTS');

  const overallScore = averageScores([
    data.quality,
    data.deadlines,
    data.communication,
    data.attitude,
  ]);

  const rating = await prisma.contractRating.create({
    data: {
      contractId,
      raterRole: RatingRaterRole.COMPANY,
      quality: data.quality,
      deadlines: data.deadlines,
      communication: data.communication,
      attitude: data.attitude,
      overallScore,
      comment: data.comment,
    },
  });

  await recalculateCandidateReputation(contract.candidateId);
  const candidate = await prisma.candidateProfile.findUnique({
    where: { id: contract.candidateId },
    select: { userId: true },
  });
  if (candidate) await computeAndSaveScore(candidate.userId);

  return rating;
}

export async function rateCompany(
  userId: string,
  contractId: string,
  data: CandidateRatesCompanyInput
) {
  const candidate = await getCandidateOrThrow(userId);
  const contract = await prisma.contract.findFirst({
    where: { id: contractId, candidateId: candidate.id },
    include: { ratings: true },
  });

  if (!contract) throw new Error('CONTRACT_NOT_FOUND');
  if (contract.status !== ContractStatus.COMPLETED) throw new Error('CONTRACT_NOT_COMPLETED');

  const existing = contract.ratings.find(r => r.raterRole === RatingRaterRole.CANDIDATE);
  if (existing) throw new Error('RATING_ALREADY_EXISTS');

  const overallScore = averageScores([
    data.paymentPunctuality,
    data.instructionClarity,
    data.workEnvironment,
  ]);

  const rating = await prisma.contractRating.create({
    data: {
      contractId,
      raterRole: RatingRaterRole.CANDIDATE,
      paymentPunctuality: data.paymentPunctuality,
      instructionClarity: data.instructionClarity,
      workEnvironment: data.workEnvironment,
      overallScore,
      comment: data.comment,
    },
  });

  await recalculateCompanyReputation(contract.companyId);

  return rating;
}
