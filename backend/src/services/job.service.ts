import { prisma } from '../lib/prisma';
import { JobStatus, JobType, WorkMode } from '@prisma/client';

// ─── PUBLICAR VACANTE ─────────────────────────────────────────────────────────

export async function createJob(userId: string, data: {
  title: string;
  description: string;
  type: JobType;
  workMode: WorkMode;
  area?: string;
  skills: string[];
  budgetMin?: number;
  budgetMax?: number;
  duration?: string;
  deadline?: string;
  deliverables?: string;
  rankWeights?: {
    skillsWeight?: number;
    experienceWeight?: number;
    educationWeight?: number;
    certsWeight?: number;
    reputationWeight?: number;
    languagesWeight?: number;
    completionWeight?: number;
  };
}) {
  // Obtener el perfil de empresa del usuario
  const company = await prisma.companyProfile.findUnique({
    where: { userId },
  });
  if (!company) throw new Error('COMPANY_PROFILE_NOT_FOUND');

  const { rankWeights, deadline, ...jobData } = data;

  // Crear la vacante
  const job = await prisma.job.create({
    data: {
      ...jobData,
      companyId: company.id,
      deadline: deadline ? new Date(deadline) : undefined,
    },
  });

  // Si la empresa personalizó los pesos del ranking, guardarlos
  if (rankWeights) {
    const weights = rankWeights;
    const total =
      (weights.skillsWeight ?? 0.30) +
      (weights.experienceWeight ?? 0.25) +
      (weights.educationWeight ?? 0.15) +
      (weights.certsWeight ?? 0.10) +
      (weights.reputationWeight ?? 0.10) +
      (weights.languagesWeight ?? 0.05) +
      (weights.completionWeight ?? 0.05);

    // Validar que los pesos sumen aproximadamente 1.0
    if (Math.abs(total - 1.0) > 0.01)
      throw new Error('INVALID_WEIGHTS');

    await prisma.jobRankConfig.create({
      data: {
        jobId: job.id,
        skillsWeight: weights.skillsWeight ?? 0.30,
        experienceWeight: weights.experienceWeight ?? 0.25,
        educationWeight: weights.educationWeight ?? 0.15,
        certsWeight: weights.certsWeight ?? 0.10,
        reputationWeight: weights.reputationWeight ?? 0.10,
        languagesWeight: weights.languagesWeight ?? 0.05,
        completionWeight: weights.completionWeight ?? 0.05,
      },
    });
  }

  return prisma.job.findUnique({
    where: { id: job.id },
    include: { rankConfig: true, company: true },
  });
}

// ─── LISTAR VACANTES ACTIVAS CON FILTROS ─────────────────────────────────────

export async function listJobs(filters: {
  area?: string;
  workMode?: string;
  type?: string;
  budgetMin?: number;
  budgetMax?: number;
  skills?: string[];
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: any = {
    status: JobStatus.ACTIVE,
  };

  if (filters.area) where.area = { contains: filters.area, mode: 'insensitive' };
  if (filters.workMode) where.workMode = filters.workMode;
  if (filters.type) where.type = filters.type;
  if (filters.budgetMin) where.budgetMin = { gte: filters.budgetMin };
  if (filters.budgetMax) where.budgetMax = { lte: filters.budgetMax };
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.skills && filters.skills.length > 0) {
    where.skills = { hasSome: filters.skills };
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: {
          select: {
            companyName: true,
            logoUrl: true,
            city: true,
            sector: true,
          },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return {
    jobs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── DETALLE DE VACANTE ───────────────────────────────────────────────────────

export async function getJobById(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      company: {
        select: {
          companyName: true,
          logoUrl: true,
          city: true,
          sector: true,
          description: true,
          website: true,
        },
      },
      rankConfig: true,
      _count: { select: { applications: true } },
    },
  });

  if (!job) throw new Error('JOB_NOT_FOUND');
  return job;
}

// ─── EDITAR VACANTE ───────────────────────────────────────────────────────────

export async function updateJob(userId: string, jobId: string, data: {
  title?: string;
  description?: string;
  workMode?: WorkMode;
  area?: string;
  skills?: string[];
  budgetMin?: number;
  budgetMax?: number;
  duration?: string;
  deadline?: string;
  deliverables?: string;
}) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { company: true },
  });

  if (!job) throw new Error('JOB_NOT_FOUND');
  if (job.company.userId !== userId) throw new Error('UNAUTHORIZED');

  const { deadline, ...rest } = data;

  return prisma.job.update({
    where: { id: jobId },
    data: {
      ...rest,
      deadline: deadline ? new Date(deadline) : undefined,
    },
  });
}

// ─── CAMBIAR ESTADO DE VACANTE ────────────────────────────────────────────────

export async function updateJobStatus(
  userId: string,
  jobId: string,
  status: JobStatus
) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { company: true },
  });

  if (!job) throw new Error('JOB_NOT_FOUND');
  if (job.company.userId !== userId) throw new Error('UNAUTHORIZED');

  return prisma.job.update({
    where: { id: jobId },
    data: { status },
  });
}

// ─── MIS VACANTES (EMPRESA) ───────────────────────────────────────────────────

export async function getMyJobs(userId: string) {
  const company = await prisma.companyProfile.findUnique({
    where: { userId },
  });

  if (!company) throw new Error('COMPANY_PROFILE_NOT_FOUND');

  return prisma.job.findMany({
    where: { companyId: company.id },
    include: {
      _count: { select: { applications: true } },
      rankConfig: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}