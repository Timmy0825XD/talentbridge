import { prisma } from '../lib/prisma';
import { uploadToStorage } from '../lib/storage/upload';
import { extractCvIntelligent, ExtractedKeywords } from '../lib/cv-extractor';
import { extractCvKeywords } from '../lib/cv-extractor';
import { computeAndSaveScore } from './ranking.service';

// ─── PERFIL CANDIDATO ─────────────────────────────────────────────────────────

export async function getCandidateProfile(userId: string) {
  return prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      university: { select: { id: true, name: true } },
    },
  });
}

export async function upsertCandidateProfile(userId: string, data: {
  fullName?: string;
  phone?: string;
  summary?: string;
  career?: string;
  semester?: number;
  graduationYear?: number;
  universityId?: string | null;
  skills?: string[];
  softSkills?: string[];
  languages?: { language: string; level: string }[];
  projects?: { title: string; description?: string; url?: string }[];
  certifications?: { name: string; issuer?: string; year?: number }[];
  salaryExpected?: number;
  workMode?: string;
}) {
  if (data.universityId) {
    const university = await prisma.university.findUnique({
      where: { id: data.universityId },
    });
    if (!university) throw new Error('UNIVERSITY_NOT_FOUND');
    if (!university.isActive) throw new Error('UNIVERSITY_INACTIVE');
  }

  const profile = await prisma.candidateProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
    include: {
      university: { select: { id: true, name: true } },
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

// ─── UPLOAD CV + EXTRACCIÓN INTELIGENTE ──────────────────────────────────────

export async function uploadCvToStorage(
  userId: string,
  fileBuffer: Buffer,
  originalName: string
): Promise<string> {
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

  // Extracción inteligente con Gemini en background
  extractCvIntelligent(cvUrl).then(async (extracted) => {
    const updateData: any = {};

    if (extracted.skills.length > 0)        updateData.skills = extracted.skills;
    if (extracted.softSkills.length > 0)    updateData.softSkills = extracted.softSkills;
    if (extracted.languages.length > 0)     updateData.languages = extracted.languages;
    if (extracted.certifications.length > 0) updateData.certifications = extracted.certifications;
    if (extracted.projects.length > 0)      updateData.projects = extracted.projects;
    if (extracted.summary)                  updateData.summary = extracted.summary;

    if (Object.keys(updateData).length > 0) {
      await prisma.candidateProfile.update({ where: { userId }, data: updateData });
    }

    await computeAndSaveScore(userId);
    console.log(`CV Intelligence completado para usuario ${userId}`);
  }).catch(err => console.error('Error en CV Intelligence:', err));

  return cvUrl;
}

// ─── EXTRACCIÓN MANUAL ────────────────────────────────────────────────────────

export async function extractCvManually(userId: string): Promise<ExtractedKeywords> {
  const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
  if (!profile?.cvUrl) throw new Error('CV_NOT_FOUND');

  const extracted = await extractCvKeywords(profile.cvUrl);

  const updateData: any = {};
  if (extracted.technical.length > 0) updateData.skills = extracted.technical;
  if (extracted.soft.length > 0)      updateData.softSkills = extracted.soft;
  if (extracted.languages.length > 0)
    updateData.languages = extracted.languages.map(lang => ({
      language: lang, level: 'No especificado'
    }));

  if (Object.keys(updateData).length > 0) {
    await prisma.candidateProfile.update({ where: { userId }, data: updateData });
  }

  return extracted;
}