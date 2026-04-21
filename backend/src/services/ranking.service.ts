import { prisma } from '../lib/prisma';
import { calculateScore, DEFAULT_WEIGHTS, RankingWeights } from '../lib/ranking';

// Calcula y persiste el puntaje de un candidato
export async function computeAndSaveScore(userId: string): Promise<void> {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: { score: true },
  });

  if (!profile) return;

  const weights: RankingWeights = DEFAULT_WEIGHTS;

  const breakdown = calculateScore({
    skills: profile.skills,
    softSkills: profile.softSkills,
    languages: profile.languages,
    projects: profile.projects,
    certifications: profile.certifications,
    career: profile.career,
    institution: profile.institution,
    semester: profile.semester,
    graduationYear: profile.graduationYear,
    summary: profile.summary,
    cvUrl: profile.cvUrl,
    fullName: profile.fullName,
    phone: profile.phone,
    workMode: profile.workMode,
    salaryExpected: profile.salaryExpected,
  }, weights);

  // Upsert el score en la BD
  await prisma.profileScore.upsert({
    where: { candidateId: profile.id },
    update: {
      totalScore: breakdown.total,
      skillsScore: breakdown.skills,
      experienceScore: breakdown.experience,
      educationScore: breakdown.education,
      certsScore: breakdown.certs,
      reputationScore: breakdown.reputation,
      languagesScore: breakdown.languages,
      completionScore: breakdown.completion,
      calculatedAt: new Date(),
    },
    create: {
      candidateId: profile.id,
      totalScore: breakdown.total,
      skillsScore: breakdown.skills,
      experienceScore: breakdown.experience,
      educationScore: breakdown.education,
      certsScore: breakdown.certs,
      reputationScore: breakdown.reputation,
      languagesScore: breakdown.languages,
      completionScore: breakdown.completion,
    },
  });

  console.log(`Score calculado para ${userId}: ${breakdown.total}/100`);
}

// Obtiene el score guardado de un candidato por userId
export async function getScoreByUserId(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: { score: true },
  });

  if (!profile) throw new Error('CANDIDATE_NOT_FOUND');

  // Si no tiene score calculado, calcularlo ahora
  if (!profile.score) {
    await computeAndSaveScore(userId);
    return getScoreByUserId(userId);
  }

  return {
    totalScore: profile.score.totalScore,
    breakdown: {
      skills: profile.score.skillsScore,
      experience: profile.score.experienceScore,
      education: profile.score.educationScore,
      certs: profile.score.certsScore,
      reputation: profile.score.reputationScore,
      languages: profile.score.languagesScore,
      completion: profile.score.completionScore,
    },
    calculatedAt: profile.score.calculatedAt,
    suggestions: generateSuggestions(profile.score),
  };
}

// Obtiene el score de un candidato por su profileId (para el ranking de postulaciones)
export async function getScoreByCandidateId(candidateId: string) {
  const score = await prisma.profileScore.findUnique({
    where: { candidateId },
  });

  if (!score) return 0;
  return score.totalScore;
}

// Genera sugerencias de mejora según los criterios con puntaje bajo
function generateSuggestions(score: {
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  certsScore: number;
  languagesScore: number;
  completionScore: number;
}): string[] {
  const suggestions: string[] = [];

  if (score.skillsScore < 60)
    suggestions.push('Agrega más habilidades técnicas a tu perfil para aumentar tu visibilidad.');
  if (score.experienceScore < 50)
    suggestions.push('Registra tus proyectos académicos o personales en la sección de proyectos.');
  if (score.educationScore < 70)
    suggestions.push('Completa tu información académica: institución, carrera y semestre.');
  if (score.certsScore < 40)
    suggestions.push('Agrega certificaciones obtenidas para destacar ante las empresas.');
  if (score.languagesScore < 50)
    suggestions.push('Registra los idiomas que manejas y su nivel.');
  if (score.completionScore < 80)
    suggestions.push('Completa todos los campos de tu perfil para mejorar tu puntaje de completitud.');

  return suggestions;
}