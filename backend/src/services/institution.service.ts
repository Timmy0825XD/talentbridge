import {
  ApplicationStatus,
  ContractStatus,
  JobStatus,
  Prisma,
  Role,
} from '@prisma/client';
import { getInstitutionProfileOrThrow } from '../lib/access/profile-access';
import { prisma } from '../lib/prisma';
import {
  institutionCandidatesQuerySchema,
  type InstitutionCandidatesQuery,
} from '../lib/validators/institution.validators';

export function buildInstitutionUserFilter(role?: Role): Prisma.UserWhereInput {
  return {
    isActive: true,
    isVerified: true,
    ...(role ? { role } : {}),
  };
}

export function buildInstitutionCandidateFilter(
  universityId: string,
  role?: Role
): Prisma.CandidateProfileWhereInput {
  return {
    universityId,
    user: buildInstitutionUserFilter(role),
  };
}

export function isProfileComplete(cvUrl: string | null, skills: string[]): boolean {
  return cvUrl !== null || skills.length >= 3;
}

function countSkillsFromJobs(jobs: { skills: string[] }[]): { skill: string; count: number }[] {
  const skillCounts = new Map<string, number>();
  for (const job of jobs) {
    for (const skill of job.skills) {
      const key = skill.toLowerCase();
      skillCounts.set(key, (skillCounts.get(key) ?? 0) + 1);
    }
  }
  return [...skillCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));
}

function countSkillsFromCandidates(
  profiles: { skills: string[]; softSkills: string[] }[]
): { skill: string; count: number }[] {
  const skillCounts = new Map<string, number>();
  for (const profile of profiles) {
    for (const skill of [...profile.skills, ...profile.softSkills]) {
      const key = skill.toLowerCase();
      skillCounts.set(key, (skillCounts.get(key) ?? 0) + 1);
    }
  }
  return [...skillCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));
}

function buildSkillsGap(
  marketSkills: { skill: string; count: number }[],
  graduateSkills: { skill: string; count: number }[]
): { skill: string; marketCount: number }[] {
  const graduateSet = new Set(graduateSkills.map(s => s.skill.toLowerCase()));
  return marketSkills
    .filter(s => !graduateSet.has(s.skill.toLowerCase()))
    .slice(0, 5)
    .map(s => ({ skill: s.skill, marketCount: s.count }));
}

function last12MonthKeys(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export type InstitutionEmploymentStatus =
  | 'incomplete_profile'
  | 'no_applications'
  | 'in_process'
  | 'hired';

export function deriveEmploymentStatus(
  cvUrl: string | null,
  skills: string[],
  applicationCount: number,
  hasCompletedContract: boolean
): InstitutionEmploymentStatus {
  if (hasCompletedContract) return 'hired';
  if (!isProfileComplete(cvUrl, skills)) return 'incomplete_profile';
  if (applicationCount === 0) return 'no_applications';
  return 'in_process';
}

export async function getInstitutionDashboard(userId: string) {
  const profile = await getInstitutionProfileOrThrow(userId);
  const institutionFilter = buildInstitutionCandidateFilter(profile.universityId);
  const graduateFilter = buildInstitutionCandidateFilter(profile.universityId, Role.GRADUATE);

  const [
    activeStudents,
    activeGraduates,
    linked,
    linkedForFunnel,
    hasApplied,
    hasSelected,
    graduatesWithContract,
    topSkillsJobs,
    linkedProfiles,
  ] = await Promise.all([
    prisma.candidateProfile.count({
      where: buildInstitutionCandidateFilter(profile.universityId, Role.STUDENT),
    }),
    prisma.candidateProfile.count({ where: graduateFilter }),
    prisma.candidateProfile.count({ where: institutionFilter }),
    prisma.candidateProfile.findMany({
      where: institutionFilter,
      select: { cvUrl: true, skills: true },
    }),
    prisma.candidateProfile.count({
      where: { ...institutionFilter, applications: { some: {} } },
    }),
    prisma.candidateProfile.count({
      where: {
        ...institutionFilter,
        applications: { some: { status: ApplicationStatus.SELECTED } },
      },
    }),
    prisma.candidateProfile.count({
      where: {
        ...graduateFilter,
        contracts: { some: { status: ContractStatus.COMPLETED } },
      },
    }),
    prisma.job.findMany({
      where: { status: JobStatus.ACTIVE },
      select: { skills: true },
      take: 200,
    }),
    prisma.candidateProfile.findMany({
      where: institutionFilter,
      select: { skills: true, softSkills: true },
    }),
  ]);

  const profileComplete = linkedForFunnel.filter(p =>
    isProfileComplete(p.cvUrl, p.skills)
  ).length;

  const marketDemandSkills = countSkillsFromJobs(topSkillsJobs);
  const graduateSkills = countSkillsFromCandidates(linkedProfiles);
  const skillsGap = buildSkillsGap(marketDemandSkills, graduateSkills);

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
    funnel: {
      linked,
      profileComplete,
      hasApplied,
      hasSelected,
      hasCompletedContract: graduatesWithContract,
    },
    marketDemandSkills,
    graduateSkills,
    skillsGap,
  };
}

function buildCandidatesBaseWhere(
  universityId: string,
  query: InstitutionCandidatesQuery
): Prisma.CandidateProfileWhereInput {
  const and: Prisma.CandidateProfileWhereInput[] = [
    buildInstitutionCandidateFilter(universityId, query.role),
  ];
  if (query.career) {
    and.push({ career: { name: { contains: query.career, mode: 'insensitive' } } });
  }
  if (query.search) {
    and.push({
      OR: [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { career: { name: { contains: query.search, mode: 'insensitive' } } },
      ],
    });
  }

  const status = query.status ?? 'all';
  if (status === 'no_applications') {
    and.push({ applications: { none: {} } });
  } else if (status === 'hired') {
    and.push({ contracts: { some: { status: ContractStatus.COMPLETED } } });
  } else if (status === 'in_process') {
    and.push(
      { applications: { some: {} } },
      { NOT: { contracts: { some: { status: ContractStatus.COMPLETED } } } }
    );
  }

  return { AND: and };
}

const candidateListSelect = {
  id: true,
  fullName: true,
  career: { select: { id: true, name: true } },
  graduationYear: true,
  photoUrl: true,
  cvUrl: true,
  skills: true,
  user: { select: { role: true } },
  score: { select: { totalScore: true } },
  _count: { select: { applications: true } },
  contracts: {
    where: { status: ContractStatus.COMPLETED },
    select: { id: true },
    take: 1,
  },
  applications: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    select: { status: true },
  },
} satisfies Prisma.CandidateProfileSelect;

function mapCandidateItem(
  row: Prisma.CandidateProfileGetPayload<{ select: typeof candidateListSelect }>
) {
  const hasCompletedContract = row.contracts.length > 0;
  const employmentStatus = deriveEmploymentStatus(
    row.cvUrl,
    row.skills,
    row._count.applications,
    hasCompletedContract
  );

  return {
    id: row.id,
    fullName: row.fullName,
    career: row.career?.name ?? null,
    graduationYear: row.graduationYear,
    photoUrl: row.photoUrl,
    role: row.user.role,
    totalScore: row.score?.totalScore ?? null,
    applicationCount: row._count.applications,
    hasCompletedContract,
    latestApplicationStatus: row.applications[0]?.status ?? null,
    employmentStatus,
  };
}

export async function listInstitutionCandidates(
  userId: string,
  rawQuery: unknown
) {
  const parsed = institutionCandidatesQuerySchema.safeParse(rawQuery);
  if (!parsed.success) throw new Error('INVALID_QUERY');

  const query = parsed.data;
  const profile = await getInstitutionProfileOrThrow(userId);
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const baseWhere = buildCandidatesBaseWhere(profile.universityId, query);
  const status = query.status ?? 'all';

  if (status === 'incomplete_profile') {
    const rows = await prisma.candidateProfile.findMany({
      where: baseWhere,
      select: candidateListSelect,
      orderBy: { fullName: 'asc' },
    });
    const filtered = rows.filter(r => !isProfileComplete(r.cvUrl, r.skills));
    const total = filtered.length;
    const slice = filtered.slice(skip, skip + limit);
    return {
      items: slice.map(mapCandidateItem),
      total,
      page,
      limit,
    };
  }

  const [rows, total] = await Promise.all([
    prisma.candidateProfile.findMany({
      where: baseWhere,
      select: candidateListSelect,
      orderBy: { fullName: 'asc' },
      skip,
      take: limit,
    }),
    prisma.candidateProfile.count({ where: baseWhere }),
  ]);

  return {
    items: rows.map(mapCandidateItem),
    total,
    page,
    limit,
  };
}

export async function getInstitutionAnalytics(userId: string) {
  const profile = await getInstitutionProfileOrThrow(userId);
  const institutionFilter = buildInstitutionCandidateFilter(profile.universityId);

  const monthKeys = last12MonthKeys();
  const trendStart = new Date();
  trendStart.setMonth(trendStart.getMonth() - 11);
  trendStart.setDate(1);
  trendStart.setHours(0, 0, 0, 0);

  const [linkedProfiles, completedContracts, applications, scoreAgg] = await Promise.all([
    prisma.candidateProfile.findMany({
      where: institutionFilter,
      select: {
        career: { select: { name: true } },
        contracts: {
          where: { status: ContractStatus.COMPLETED },
          select: { id: true },
        },
      },
    }),
    prisma.contract.findMany({
      where: {
        status: ContractStatus.COMPLETED,
        completedAt: { gte: trendStart },
        candidate: institutionFilter,
      },
      select: { completedAt: true, job: { select: { area: true } } },
    }),
    prisma.application.findMany({
      where: {
        createdAt: { gte: trendStart },
        candidate: institutionFilter,
      },
      select: { createdAt: true },
    }),
    prisma.profileScore.aggregate({
      where: { candidate: institutionFilter },
      _avg: { totalScore: true },
      _count: true,
    }),
  ]);

  const careerMap = new Map<
    string,
    { career: string; linked: number; withCompletedContract: number }
  >();

  for (const row of linkedProfiles) {
    const career = row.career?.name?.trim() || 'Sin carrera';
    const entry = careerMap.get(career) ?? { career, linked: 0, withCompletedContract: 0 };
    entry.linked += 1;
    if (row.contracts.length > 0) entry.withCompletedContract += 1;
    careerMap.set(career, entry);
  }

  const byCareer = [...careerMap.values()]
    .map(c => ({
      career: c.career,
      linked: c.linked,
      withCompletedContract: c.withCompletedContract,
      insertionRatePercent:
        c.linked > 0
          ? Math.round((c.withCompletedContract / c.linked) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.linked - a.linked);

  const insertionCounts = new Map(monthKeys.map(k => [k, 0]));
  for (const c of completedContracts) {
    if (!c.completedAt) continue;
    const key = monthKey(c.completedAt);
    if (insertionCounts.has(key)) {
      insertionCounts.set(key, (insertionCounts.get(key) ?? 0) + 1);
    }
  }
  const insertionTrend = monthKeys.map(month => ({
    month,
    count: insertionCounts.get(month) ?? 0,
  }));

  const applicationCounts = new Map(monthKeys.map(k => [k, 0]));
  for (const app of applications) {
    const key = monthKey(app.createdAt);
    if (applicationCounts.has(key)) {
      applicationCounts.set(key, (applicationCounts.get(key) ?? 0) + 1);
    }
  }
  const applicationsTrend = monthKeys.map(month => ({
    month,
    count: applicationCounts.get(month) ?? 0,
  }));

  const areaCounts = new Map<string, number>();
  for (const c of completedContracts) {
    const area = c.job?.area ?? 'Sin área';
    areaCounts.set(area, (areaCounts.get(area) ?? 0) + 1);
  }
  const topHiringAreas = [...areaCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([area, count]) => ({ area, count }));

  return {
    byCareer,
    insertionTrend,
    applicationsTrend,
    topHiringAreas,
    avgGraduateScore:
      scoreAgg._count > 0 && scoreAgg._avg.totalScore != null
        ? Math.round(scoreAgg._avg.totalScore * 10) / 10
        : null,
  };
}
