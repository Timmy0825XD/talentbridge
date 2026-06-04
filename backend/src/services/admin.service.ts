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
  createCareerSchema,
  createUniversitySchema,
  moderateJobSchema,
  updateCareerSchema,
  updateRankingWeightsSchema,
  updateUniversitySchema,
  updateUserStatusSchema,
} from '../lib/validators/admin.validators';
import { createUniversityWithAccount } from './university-create.service';
import { createCareerRecord } from './career.service';
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

export async function listUniversities() {
  return prisma.university.findMany({
    include: {
      institutionProfile: {
        include: {
          user: { select: { id: true, email: true, isActive: true, isVerified: true } },
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function createUniversity(body: unknown) {
  const parsed = createUniversitySchema.safeParse(body);
  if (!parsed.success) throw new Error(`VALIDATION:${formatFirstZodIssue(parsed.error)}`);

  return createUniversityWithAccount(parsed.data.name);
}

export async function updateUniversity(universityId: string, body: unknown) {
  const parsed = updateUniversitySchema.safeParse(body);
  if (!parsed.success) throw new Error(`VALIDATION:${formatFirstZodIssue(parsed.error)}`);

  const university = await prisma.university.findUnique({
    where: { id: universityId },
    include: { institutionProfile: true },
  });
  if (!university) throw new Error('UNIVERSITY_NOT_FOUND');

  if (parsed.data.name && parsed.data.name !== university.name) {
    const duplicate = await prisma.university.findFirst({
      where: { name: parsed.data.name, id: { not: universityId } },
    });
    if (duplicate) throw new Error('UNIVERSITY_NAME_TAKEN');
  }

  const isActive = parsed.data.isActive;

  const updated = await prisma.$transaction(async tx => {
    const uni = await tx.university.update({
      where: { id: universityId },
      data: {
        ...(parsed.data.name ? { name: parsed.data.name } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      include: {
        institutionProfile: {
          include: {
            user: { select: { id: true, email: true, isActive: true, isVerified: true } },
          },
        },
      },
    });

    if (university.institutionProfile) {
      await tx.institutionProfile.update({
        where: { id: university.institutionProfile.id },
        data: {
          ...(parsed.data.name ? { institutionName: parsed.data.name } : {}),
          ...(isActive !== undefined ? { isActive } : {}),
        },
      });

      if (isActive !== undefined) {
        await tx.user.update({
          where: { id: university.institutionProfile.userId },
          data: { isActive },
        });
      }
    }

    return uni;
  });

  return updated;
}

export async function listCareers() {
  return prisma.career.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function createCareer(body: unknown) {
  const parsed = createCareerSchema.safeParse(body);
  if (!parsed.success) throw new Error(`VALIDATION:${formatFirstZodIssue(parsed.error)}`);

  return createCareerRecord(parsed.data.name);
}

export async function updateCareer(careerId: string, body: unknown) {
  const parsed = updateCareerSchema.safeParse(body);
  if (!parsed.success) throw new Error(`VALIDATION:${formatFirstZodIssue(parsed.error)}`);

  const career = await prisma.career.findUnique({ where: { id: careerId } });
  if (!career) throw new Error('CAREER_NOT_FOUND');

  if (parsed.data.name && parsed.data.name !== career.name) {
    const duplicate = await prisma.career.findFirst({
      where: { name: parsed.data.name, id: { not: careerId } },
    });
    if (duplicate) throw new Error('CAREER_NAME_TAKEN');
  }

  return prisma.career.update({
    where: { id: careerId },
    data: {
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
    },
  });
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
