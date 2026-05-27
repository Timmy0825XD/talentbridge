import { getGlobalRankingWeights } from '../lib/global-rank-config';
import { prisma } from '../lib/prisma';
import { calculateScore } from '../lib/ranking';

export async function computeAndSaveScore(userId: string): Promise<void> {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: { score: true },
  });

  if (!profile) return;

  const weights = await getGlobalRankingWeights();

  const breakdown = calculateScore({
    skills:         profile.skills,
    softSkills:     profile.softSkills,
    languages:      profile.languages,
    projects:       profile.projects,
    certifications: profile.certifications,
    career:         profile.career,
    institution:    profile.institution,
    semester:       profile.semester,
    graduationYear: profile.graduationYear,
    summary:        profile.summary,
    cvUrl:          profile.cvUrl,
    fullName:       profile.fullName,
    phone:          profile.phone,
    photoUrl:       profile.photoUrl,
    workMode:       profile.workMode,
    salaryExpected: profile.salaryExpected,
    reputationScore: profile.ratingCount > 0 ? profile.reputationAvg : undefined,
  }, weights);

  await prisma.profileScore.upsert({
    where: { candidateId: profile.id },
    update: {
      totalScore:      breakdown.total,
      skillsScore:     breakdown.skills,
      experienceScore: breakdown.experience,
      educationScore:  breakdown.education,
      certsScore:      breakdown.certs,
      reputationScore: breakdown.reputation,
      languagesScore:  breakdown.certs, // Compatibilidad — certs incluye idiomas ahora
      completionScore: breakdown.completion,
      calculatedAt:    new Date(),
    },
    create: {
      candidateId:     profile.id,
      totalScore:      breakdown.total,
      skillsScore:     breakdown.skills,
      experienceScore: breakdown.experience,
      educationScore:  breakdown.education,
      certsScore:      breakdown.certs,
      reputationScore: breakdown.reputation,
      languagesScore:  breakdown.certs,
      completionScore: breakdown.completion,
    },
  });

  console.log(`Score recalculado para ${userId}: ${breakdown.total}/100`);
}

export async function getScoreByUserId(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: { score: true },
  });

  if (!profile) throw new Error('CANDIDATE_NOT_FOUND');

  if (!profile.score) {
    await computeAndSaveScore(userId);
    return getScoreByUserId(userId);
  }

  return {
    totalScore: profile.score.totalScore,
    breakdown: {
      skills:     profile.score.skillsScore,
      experience: profile.score.experienceScore,
      education:  profile.score.educationScore,
      certs:      profile.score.certsScore,
      reputation: profile.score.reputationScore,
      completion: profile.score.completionScore,
    },
    calculatedAt: profile.score.calculatedAt,
    suggestions:  generateSuggestions(profile.score, profile),
    reputationAvg: profile.ratingCount > 0 ? profile.reputationAvg : null,
    ratingCount: profile.ratingCount,
  };
}

function generateSuggestions(
  score: any,
  profile: any
): string[] {
  const suggestions: string[] = [];

  if (score.skillsScore < 50)
    suggestions.push('Agrega más habilidades técnicas y blandas a tu perfil.');
  if (score.experienceScore < 40)
    suggestions.push('Registra tus proyectos académicos o personales con descripción detallada.');
  if (score.educationScore < 60)
    suggestions.push('Completa tu información académica: institución, carrera y semestre.');
  if (score.certsScore < 30)
    suggestions.push('Agrega certificaciones o idiomas que hayas estudiado.');
  if (score.completionScore < 70)
    suggestions.push('Completa todos los campos del perfil incluyendo foto y resumen profesional.');
  if (!profile.cvUrl)
    suggestions.push('Sube tu hoja de vida en PDF para aumentar tu visibilidad.');
  if (!profile.photoUrl)
    suggestions.push('Agrega una foto de perfil profesional.');

  return suggestions;
}