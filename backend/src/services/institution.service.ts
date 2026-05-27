import { ContractStatus, JobStatus, Role } from '@prisma/client';
import { prisma } from '../lib/prisma';

export async function getInstitutionDashboard(userId: string) {
  const profile = await prisma.institutionProfile.findUnique({
    where: { userId },
  });

  if (!profile) throw new Error('INSTITUTION_PROFILE_NOT_FOUND');
  if (!profile.isActive) throw new Error('INSTITUTION_INACTIVE');

  const institutionFilter = {
    institution: { equals: profile.institutionName, mode: 'insensitive' as const },
    user: { isActive: true, isVerified: true },
  };

  const [activeStudents, activeGraduates, graduatesWithContract, topSkillsJobs, contractsByArea] =
    await Promise.all([
      prisma.candidateProfile.count({
        where: { ...institutionFilter, user: { ...institutionFilter.user, role: Role.STUDENT } },
      }),
      prisma.candidateProfile.count({
        where: { ...institutionFilter, user: { ...institutionFilter.user, role: Role.GRADUATE } },
      }),
      prisma.candidateProfile.count({
        where: {
          ...institutionFilter,
          user: { ...institutionFilter.user, role: Role.GRADUATE },
          contracts: { some: { status: ContractStatus.COMPLETED } },
        },
      }),
      prisma.job.findMany({
        where: { status: JobStatus.ACTIVE },
        select: { skills: true },
        take: 200,
      }),
      prisma.contract.findMany({
        where: {
          status: ContractStatus.COMPLETED,
          candidate: institutionFilter,
        },
        select: {
          job: { select: { area: true } },
        },
      }),
    ]);

  const skillCounts = new Map<string, number>();
  for (const job of topSkillsJobs) {
    for (const skill of job.skills) {
      const key = skill.toLowerCase();
      skillCounts.set(key, (skillCounts.get(key) ?? 0) + 1);
    }
  }

  const topSkills = [...skillCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));

  const areaCounts = new Map<string, number>();
  for (const item of contractsByArea) {
    const area = item.job.area ?? 'Sin área';
    areaCounts.set(area, (areaCounts.get(area) ?? 0) + 1);
  }

  const hiringByArea = [...areaCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([area, count]) => ({ area, count }));

  const insertionRate =
    activeGraduates > 0
      ? Math.round((graduatesWithContract / activeGraduates) * 1000) / 10
      : 0;

  return {
    institutionName: profile.institutionName,
    metrics: {
      activeStudents,
      activeGraduates,
      graduatesWithCompletedContract: graduatesWithContract,
      insertionRatePercent: insertionRate,
    },
    topDemandedSkills: topSkills,
    hiringByArea,
  };
}
