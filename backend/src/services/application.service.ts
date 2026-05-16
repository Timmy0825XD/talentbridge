import { prisma } from '../lib/prisma';
import { ApplicationStatus } from '@prisma/client';
import { calculateScore, DEFAULT_WEIGHTS, RankingWeights, combineScores } from '../lib/ranking';
import { scoreCompatibility } from '../lib/gemini';

// ─── POSTULARSE A UNA VACANTE ─────────────────────────────────────────────────

export async function applyToJob(userId: string, jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { rankConfig: true },
  });

  if (!job) throw new Error('JOB_NOT_FOUND');
  if (job.status !== 'ACTIVE') throw new Error('JOB_NOT_ACTIVE');

  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId },
  });

  if (!candidate) throw new Error('CANDIDATE_PROFILE_NOT_FOUND');

  const existing = await prisma.application.findUnique({
    where: {
      jobId_candidateId: { jobId, candidateId: candidate.id },
    },
  });

  if (existing) throw new Error('ALREADY_APPLIED');

  // ── CAPA 1: Score base del perfil ────────────────────────────────────────
  const weights: RankingWeights = job.rankConfig
    ? {
        skills:     job.rankConfig.skillsWeight,
        experience: job.rankConfig.experienceWeight,
        education:  job.rankConfig.educationWeight,
        certs:      job.rankConfig.certsWeight,
        reputation: job.rankConfig.reputationWeight,
        completion: job.rankConfig.completionWeight,
      }
    : DEFAULT_WEIGHTS;

  const baseBreakdown = calculateScore({
    skills:        candidate.skills,
    softSkills:    candidate.softSkills,
    languages:     candidate.languages,
    projects:      candidate.projects,
    certifications: candidate.certifications,
    career:        candidate.career,
    institution:   candidate.institution,
    semester:      candidate.semester,
    graduationYear: candidate.graduationYear,
    summary:       candidate.summary,
    cvUrl:         candidate.cvUrl,
    fullName:      candidate.fullName,
    phone:         candidate.phone,
    photoUrl:      candidate.photoUrl,
    workMode:      candidate.workMode,
    salaryExpected: candidate.salaryExpected,
  }, weights);

  // ── CAPA 2: Score de compatibilidad con IA (Gemini) ──────────────────────
  const aiResult = await scoreCompatibility(
    {
      career:         candidate.career,
      skills:         candidate.skills,
      softSkills:     candidate.softSkills,
      languages:      candidate.languages,
      projects:       candidate.projects,
      certifications: candidate.certifications,
      summary:        candidate.summary,
      workMode:       candidate.workMode,
    },
    {
      title:       job.title,
      area:        job.area,
      skills:      job.skills,
      description: job.description,
      workMode:    job.workMode,
      type:        job.type,
    }
  );

  // ── Score final combinado ─────────────────────────────────────────────────
  const finalScore = combineScores(baseBreakdown.total, aiResult.score);

  // Crear la postulación con el score final y los insights de la IA
  const application = await prisma.application.create({
    data: {
      jobId,
      candidateId: candidate.id,
      scoreAtApply: finalScore,
      aiReasons: aiResult.reasons,
      aiGaps: aiResult.gaps,
    },
    include: {
      job: {
        select: {
          title: true,
          company: { select: { companyName: true } },
        },
      },
    },
  });

  return {
    ...application,
    aiInsights: {
      baseScore:   baseBreakdown.total,
      aiScore:     aiResult.score,
      finalScore,
      reasons:     aiResult.reasons,
      gaps:        aiResult.gaps,
    },
  };
}

// ─── CANDIDATOS POSTULADOS ORDENADOS POR RANKING ──────────────────────────────

export async function getJobApplicants(userId: string, jobId: string) {
  // Verificar que la vacante pertenece a la empresa
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { company: true },
  });

  if (!job) throw new Error('JOB_NOT_FOUND');
  if (job.company.userId !== userId) throw new Error('UNAUTHORIZED');

  const applications = await prisma.application.findMany({
    where: { jobId },
    include: {
      candidate: {
        select: {
          id: true,
          fullName: true,
          career: true,
          institution: true,
          skills: true,
          softSkills: true,
          cvUrl: true,
          workMode: true,
          salaryExpected: true,
          score: {
            select: { totalScore: true },
          },
        },
      },
    },
    orderBy: { scoreAtApply: 'desc' }, // Ordenar por score descendente
  });

  return applications;
}

// ─── CAMBIAR ESTADO DE POSTULACIÓN ────────────────────────────────────────────

export async function updateApplicationStatus(
  userId: string,
  applicationId: string,
  status: ApplicationStatus
) {
  // Verificar que la postulación existe y pertenece a una vacante de la empresa
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        include: { company: true },
      },
    },
  });

  if (!application) throw new Error('APPLICATION_NOT_FOUND');
  if (application.job.company.userId !== userId) throw new Error('UNAUTHORIZED');

  return prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });
}

// ─── MIS POSTULACIONES (CANDIDATO) ───────────────────────────────────────────

export async function getMyApplications(userId: string) {
  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId },
  });

  if (!candidate) throw new Error('CANDIDATE_PROFILE_NOT_FOUND');

  return prisma.application.findMany({
    where: { candidateId: candidate.id },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          type: true,
          workMode: true,
          status: true,
          budgetMin: true,
          budgetMax: true,
          company: {
            select: {
              companyName: true,
              logoUrl: true,
              city: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}