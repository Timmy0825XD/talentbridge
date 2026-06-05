import { prisma } from '../lib/prisma';
import { uploadToStorage } from '../lib/storage/upload';
import { extractCvIntelligent, ExtractedKeywords } from '../lib/cv-extractor';
import { extractCvKeywords } from '../lib/cv-extractor';
import { computeAndSaveScore } from './ranking.service';
import { resolveCareerIdByName, resolveUniversityIdByName } from '../lib/catalog-resolve';
import type { UpsertCandidateProfileInput } from '../lib/validators/profile.validators';

// ─── PERFIL CANDIDATO ─────────────────────────────────────────────────────────

export async function getCandidateProfile(userId: string) {
  return prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      university: { select: { id: true, name: true } },
      career: { select: { id: true, name: true } },
    },
  });
}

async function assertUniversityId(universityId: string) {
  const university = await prisma.university.findUnique({ where: { id: universityId } });
  if (!university) throw new Error('UNIVERSITY_NOT_FOUND');
  if (!university.isActive) throw new Error('UNIVERSITY_INACTIVE');
}

async function assertCareerId(careerId: string) {
  const career = await prisma.career.findUnique({ where: { id: careerId } });
  if (!career) throw new Error('CAREER_NOT_FOUND');
  if (!career.isActive) throw new Error('CAREER_INACTIVE');
}

export async function upsertCandidateProfile(userId: string, data: UpsertCandidateProfileInput) {
  await assertUniversityId(data.universityId);
  await assertCareerId(data.careerId);

  const profile = await prisma.candidateProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
    include: {
      university: { select: { id: true, name: true } },
      career: { select: { id: true, name: true } },
    },
  });

  computeAndSaveScore(userId).catch(err =>
    console.error('Error recalculando score:', err)
  );

  return profile;
}

// ─── PERFIL EMPRESA ───────────────────────────────────────────────────────────

export async function getCompanyProfile(userId: string) {
  return prisma.companyProfile.findUnique({ where: { userId } });
}

export async function upsertCompanyProfile(userId: string, data: {
  companyName?: string;
  nit?: string;
  sector?: string;
  employeeCount?: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
}) {
  return prisma.companyProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

// ─── UPLOAD FOTO DE PERFIL (CANDIDATO) ───────────────────────────────────────

export async function uploadPhotoToStorage(
  userId: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const ext = mimeType === 'image/png' ? 'png'
    : mimeType === 'image/webp' ? 'webp' : 'jpg';

  const fileName = `${userId}.${ext}`;

  const publicUrl = await uploadToStorage({
    bucket: 'avatars',
    fileName,
    buffer: fileBuffer,
    mimeType,
  });

  await prisma.candidateProfile.upsert({
    where: { userId },
    update: { photoUrl: publicUrl },
    create: { userId, photoUrl: publicUrl },
  });

  return publicUrl;
}

// ─── UPLOAD LOGO EMPRESA ─────────────────────────────────────────────────────

export async function uploadLogoToStorage(
  userId: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const ext = mimeType === 'image/png' ? 'png'
    : mimeType === 'image/webp' ? 'webp' : 'jpg';

  const fileName = `${userId}.${ext}`;

  const publicUrl = await uploadToStorage({
    bucket: 'logos',
    fileName,
    buffer: fileBuffer,
    mimeType,
  });

  await prisma.companyProfile.upsert({
    where: { userId },
    update: { logoUrl: publicUrl },
    create: { userId, logoUrl: publicUrl },
  });

  return publicUrl;
}

async function applyCvExtractionToProfile(userId: string, extracted: Awaited<ReturnType<typeof extractCvIntelligent>>) {
  const updateData: Record<string, unknown> = {};

  if (extracted.skills.length > 0) updateData.skills = extracted.skills;
  if (extracted.softSkills.length > 0) updateData.softSkills = extracted.softSkills;
  if (extracted.languages.length > 0) updateData.languages = extracted.languages;
  if (extracted.certifications.length > 0) updateData.certifications = extracted.certifications;
  if (extracted.projects.length > 0) updateData.projects = extracted.projects;
  if (extracted.summary) updateData.summary = extracted.summary;

  const profile = await prisma.candidateProfile.findUnique({ where: { userId } });

  if (!profile?.universityId && extracted.universityName) {
    const universityId = await resolveUniversityIdByName(extracted.universityName);
    if (universityId) updateData.universityId = universityId;
  }
  if (!profile?.careerId && extracted.careerName) {
    const careerId = await resolveCareerIdByName(extracted.careerName);
    if (careerId) updateData.careerId = careerId;
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.candidateProfile.update({ where: { userId }, data: updateData });
  }

  await computeAndSaveScore(userId);

  return {
    suggestedUniversityId: (updateData.universityId as string) ?? null,
    suggestedCareerId: (updateData.careerId as string) ?? null,
  };
}

// ─── UPLOAD CV + EXTRACCIÓN INTELIGENTE ──────────────────────────────────────

export async function uploadCvToStorage(
  userId: string,
  fileBuffer: Buffer,
  _originalName: string
): Promise<{ cvUrl: string; suggestedUniversityId: string | null; suggestedCareerId: string | null }> {
  const fileName = `${userId}_${Date.now()}.pdf`;

  const cvUrl = await uploadToStorage({
    bucket: 'cvs',
    fileName,
    buffer: fileBuffer,
    mimeType: 'application/pdf',
  });

  await prisma.candidateProfile.upsert({
    where: { userId },
    update: { cvUrl },
    create: { userId, cvUrl },
  });

  try {
    const extracted = await extractCvIntelligent(cvUrl);
    const suggestions = await applyCvExtractionToProfile(userId, extracted);
    console.log(`CV Intelligence completado para usuario ${userId}`);
    return { cvUrl, ...suggestions };
  } catch (err) {
    console.error('Error en CV Intelligence:', err);
    return { cvUrl, suggestedUniversityId: null, suggestedCareerId: null };
  }
}

export async function extractCvManually(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
  if (!profile?.cvUrl) throw new Error('CV_NOT_FOUND');

  const extracted = await extractCvIntelligent(profile.cvUrl);
  const suggestions = await applyCvExtractionToProfile(userId, extracted);

  return {
    technical: extracted.skills,
    soft: extracted.softSkills,
    languages: extracted.languages,
    ...suggestions,
  };
}

export { ExtractedKeywords, extractCvKeywords };
