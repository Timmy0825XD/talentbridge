import {
  ApplicationStatus,
  ContractStatus,
  JobStatus,
  PaymentStatus,
  RatingRaterRole,
} from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  getCandidateOrThrow,
  getCompanyOrThrow,
} from '../lib/access/profile-access';
import { getScoreByUserId } from './ranking.service';

export async function getCompanyDashboard(userId: string) {
  const company = await getCompanyOrThrow(userId);

  const [
    activeJobsCount,
    totalApplicants,
    activeContractsCount,
    completedContractsCount,
    paymentAgg,
    avgCandidateRating,
    activeJobs,
    topApplicants,
  ] = await Promise.all([
    prisma.job.count({
      where: { companyId: company.id, status: JobStatus.ACTIVE },
    }),
    prisma.application.count({
      where: { job: { companyId: company.id } },
    }),
    prisma.contract.count({
      where: { companyId: company.id, status: ContractStatus.ACTIVE },
    }),
    prisma.contract.count({
      where: { companyId: company.id, status: ContractStatus.COMPLETED },
    }),
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.CONFIRMED,
        contract: { companyId: company.id },
      },
      _sum: { amount: true },
    }),
    prisma.contractRating.aggregate({
      where: {
        raterRole: RatingRaterRole.COMPANY,
        contract: { companyId: company.id },
      },
      _avg: { overallScore: true },
    }),
    prisma.job.findMany({
      where: { companyId: company.id, status: JobStatus.ACTIVE },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.application.findMany({
      where: { job: { companyId: company.id } },
      select: {
        id: true,
        scoreAtApply: true,
        candidate: {
          select: {
            id: true,
            fullName: true,
            career: { select: { name: true } },
            skills: true,
            reputationAvg: true,
            ratingCount: true,
          },
        },
      },
      orderBy: { scoreAtApply: 'desc' },
      take: 10,
    }),
  ]);

  const seen = new Set<string>();
  const topCandidates = topApplicants
    .filter(a => {
      if (seen.has(a.candidate.id)) return false;
      seen.add(a.candidate.id);
      return true;
    })
    .slice(0, 3)
    .map(a => ({
      id: a.candidate.id,
      fullName: a.candidate.fullName,
      career: a.candidate.career?.name ?? null,
      skills: a.candidate.skills,
      scoreAtApply: a.scoreAtApply,
      reputationAvg: a.candidate.ratingCount > 0 ? a.candidate.reputationAvg : null,
    }));

  return {
    metrics: {
      activeJobs: activeJobsCount,
      totalApplicants,
      activeContracts: activeContractsCount,
      completedContracts: completedContractsCount,
      accumulatedCost: paymentAgg._sum.amount ?? 0,
      avgCandidateRating: avgCandidateRating._avg.overallScore,
    },
    activeJobs,
    topCandidates,
  };
}

export async function getCandidateDashboard(userId: string) {
  const candidate = await getCandidateOrThrow(userId);

  const [
    scoreData,
    activeApplicationsCount,
    historicalApplicationsCount,
    activeContractsCount,
    incomeAgg,
    avgRating,
    recentApplications,
    activeContracts,
  ] = await Promise.all([
    getScoreByUserId(userId),
    prisma.application.count({
      where: {
        candidateId: candidate.id,
        status: { notIn: [ApplicationStatus.REJECTED] },
      },
    }),
    prisma.application.count({
      where: { candidateId: candidate.id },
    }),
    prisma.contract.count({
      where: { candidateId: candidate.id, status: ContractStatus.ACTIVE },
    }),
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.CONFIRMED,
        contract: { candidateId: candidate.id },
      },
      _sum: { amount: true },
    }),
    prisma.contractRating.aggregate({
      where: {
        raterRole: RatingRaterRole.COMPANY,
        contract: { candidateId: candidate.id },
      },
      _avg: { overallScore: true },
    }),
    prisma.application.findMany({
      where: { candidateId: candidate.id },
      select: {
        id: true,
        status: true,
        scoreAtApply: true,
        createdAt: true,
        job: {
          select: {
            id: true,
            title: true,
            company: { select: { companyName: true, logoUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.contract.findMany({
      where: { candidateId: candidate.id, status: ContractStatus.ACTIVE },
      select: {
        id: true,
        title: true,
        status: true,
        totalAmount: true,
        endDate: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    score: scoreData,
    metrics: {
      activeApplications: activeApplicationsCount,
      totalApplications: historicalApplicationsCount,
      activeContracts: activeContractsCount,
      registeredIncome: incomeAgg._sum.amount ?? 0,
      avgRatingReceived: avgRating._avg.overallScore,
    },
    recentApplications,
    activeContracts,
  };
}
