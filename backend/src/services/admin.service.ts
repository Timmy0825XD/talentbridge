import bcrypt from 'bcryptjs';
import {
  ContractStatus,
  JobStatus,
  Prisma,
  Role,
} from '@prisma/client';
import { prisma } from '../lib/prisma';
import { validateWeightsSum } from '../lib/global-rank-config';
import {
  createAdminUserSchema,
  createInstitutionSchema,
  moderateJobSchema,
  updateInstitutionSchema,
  updateRankingWeightsSchema,
  updateUserStatusSchema,
} from '../lib/validators/admin.validators';
import { formatFirstZodIssue } from '../lib/validation/zod-utils';

function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

export async function getAdminMetrics() {
  const [
    activeUsers,
    publishedJobs,
    applications,
    closedContracts,
    avgRating,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true, isVerified: true } }),
    prisma.job.count({ where: { status: { in: [JobStatus.ACTIVE, JobStatus.SELECTING] } } }),
    prisma.application.count(),
    prisma.contract.count({ where: { status: ContractStatus.COMPLETED } }),
    prisma.contractRating.aggregate({ _avg: { overallScore: true } }),
  ]);

  return {
    activeUsers,
    publishedJobs,
    applications,
    closedContracts,
    averageRating: avgRating._avg.overallScore,
  };
}

export async function listUsers(query: Record<string, unknown>) {
  const { page, limit, skip } = parsePagination(query);
  const role = query.role as Role | undefined;
  const isActiveRaw = query.isActive;
  const search = query.search as string | undefined;

  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : {}),
    ...(isActiveRaw !== undefined ? { isActive: isActiveRaw === 'true' || isActiveRaw === true } : {}),
    ...(search
      ? { email: { contains: search, mode: 'insensitive' } }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function updateUserStatus(userId: string, body: unknown) {
  const parsed = updateUserStatusSchema.safeParse(body);
  if (!parsed.success) throw new Error(`VALIDATION:${formatFirstZodIssue(parsed.error)}`);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('USER_NOT_FOUND');

  return prisma.user.update({
    where: { id: userId },
    data: { isActive: parsed.data.isActive },
    select: { id: true, email: true, role: true, isActive: true },
  });
}

export async function deleteUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('USER_NOT_FOUND');

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  return { deleted: true };
}

export async function listJobsForModeration(query: Record<string, unknown>) {
  const { page, limit, skip } = parsePagination(query);

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        company: { select: { companyName: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.job.count(),
  ]);

  return {
    jobs,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function moderateJob(jobId: string, body: unknown) {
  const parsed = moderateJobSchema.safeParse(body);
  if (!parsed.success) throw new Error(`VALIDATION:${formatFirstZodIssue(parsed.error)}`);

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error('JOB_NOT_FOUND');

  return prisma.job.update({
    where: { id: jobId },
    data: { status: parsed.data.status },
    select: { id: true, title: true, status: true },
  });
}

export async function getGlobalRankingWeights() {
  const config = await prisma.globalRankConfig.upsert({
    where: { id: 'global' },
    update: {},
    create: { id: 'global' },
  });
  return config;
}

export async function updateGlobalRankingWeights(body: unknown) {
  const parsed = updateRankingWeightsSchema.safeParse(body);
  if (!parsed.success) throw new Error(`VALIDATION:${formatFirstZodIssue(parsed.error)}`);

  validateWeightsSum(parsed.data);

  return prisma.globalRankConfig.upsert({
    where: { id: 'global' },
    update: parsed.data,
    create: { id: 'global', ...parsed.data },
  });
}

export async function listInstitutions() {
  return prisma.institutionProfile.findMany({
    include: {
      user: { select: { id: true, email: true, isActive: true, isVerified: true } },
    },
    orderBy: { institutionName: 'asc' },
  });
}

export async function createInstitution(body: unknown) {
  const parsed = createInstitutionSchema.safeParse(body);
  if (!parsed.success) throw new Error(`VALIDATION:${formatFirstZodIssue(parsed.error)}`);

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) throw new Error('EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  return prisma.$transaction(async tx => {
    const user = await tx.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        role: Role.INSTITUTION,
        isVerified: true,
        isActive: true,
      },
    });

    return tx.institutionProfile.create({
      data: {
        userId: user.id,
        institutionName: parsed.data.institutionName,
        contactEmail: parsed.data.contactEmail,
        contactPhone: parsed.data.contactPhone,
      },
      include: {
        user: { select: { id: true, email: true, isActive: true } },
      },
    });
  });
}

export async function updateInstitution(institutionId: string, body: unknown) {
  const parsed = updateInstitutionSchema.safeParse(body);
  if (!parsed.success) throw new Error(`VALIDATION:${formatFirstZodIssue(parsed.error)}`);

  const profile = await prisma.institutionProfile.findUnique({ where: { id: institutionId } });
  if (!profile) throw new Error('INSTITUTION_NOT_FOUND');

  const updated = await prisma.institutionProfile.update({
    where: { id: institutionId },
    data: parsed.data,
    include: {
      user: { select: { id: true, email: true, isActive: true } },
    },
  });

  if (parsed.data.isActive !== undefined) {
    await prisma.user.update({
      where: { id: profile.userId },
      data: { isActive: parsed.data.isActive },
    });
  }

  return updated;
}

export async function createAdminUser(body: unknown) {
  const parsed = createAdminUserSchema.safeParse(body);
  if (!parsed.success) throw new Error(`VALIDATION:${formatFirstZodIssue(parsed.error)}`);

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) throw new Error('EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  return prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      role: Role.ADMIN,
      isVerified: true,
      isActive: true,
    },
    select: { id: true, email: true, role: true, isActive: true },
  });
}
