import { prisma } from '../lib/prisma';
import { supabase } from '../lib/supabase';
import { extractCvKeywords, ExtractedKeywords } from '../lib/cv-extractor';
import { computeAndSaveScore } from './ranking.service';

// ─── PERFIL CANDIDATO ─────────────────────────────────────────────────────────

export async function getCandidateProfile(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
  });
  return profile;
}

export async function upsertCandidateProfile(userId: string, data: {
  fullName?: string;
  phone?: string;
  summary?: string;
  career?: string;
  semester?: number;
  graduationYear?: number;
  institution?: string;
  skills?: string[];
  softSkills?: string[];
  languages?: { language: string; level: string }[];
  projects?: { title: string; description?: string; url?: string }[];
  certifications?: { name: string; issuer?: string; year?: number }[];
  salaryExpected?: number;
  workMode?: string;
}) {
  const profile = await prisma.candidateProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });

  computeAndSaveScore(userId).catch(err =>
    console.error('Error recalculando score:', err)
  );

  return profile;
}

// ─── PERFIL EMPRESA ───────────────────────────────────────────────────────────

export async function getCompanyProfile(userId: string) {
  const profile = await prisma.companyProfile.findUnique({
    where: { userId },
  });
  return profile;
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
  const profile = await prisma.companyProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
  return profile;
}

// ─── UPLOAD FOTO DE PERFIL ────────────────────────────────────────────────────

export async function uploadPhotoToStorage(
  userId: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  // Determinar extensión según el tipo de archivo
  const ext = mimeType === 'image/png' ? 'png'
    : mimeType === 'image/webp' ? 'webp'
    : 'jpg';

  const fileName = `${userId}.${ext}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(fileName, fileBuffer, {
      contentType: mimeType,
      upsert: true, // Reemplaza la foto anterior
    });

  if (error) {
    console.error('Supabase Storage error (photo):', error);
    throw new Error('STORAGE_UPLOAD_FAILED');
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  const photoUrl = data.publicUrl;

  // Guardar la URL en el perfil
  await prisma.candidateProfile.upsert({
    where: { userId },
    update: { photoUrl },
    create: { userId, photoUrl },
  });

  return photoUrl;
}

// ─── CARGA DE CV EN SUPABASE STORAGE ─────────────────────────────────────────

export async function uploadCvToStorage(
  userId: string,
  fileBuffer: Buffer,
  originalName: string
): Promise<string> {
  const fileName = `${userId}_${Date.now()}.pdf`;

  const { error } = await supabase.storage
    .from('cvs')
    .upload(fileName, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    console.error('Supabase Storage error:', error);
    throw new Error('STORAGE_UPLOAD_FAILED');
  }

  const { data } = supabase.storage
    .from('cvs')
    .getPublicUrl(fileName);

  const cvUrl = data.publicUrl;

  await prisma.candidateProfile.upsert({
    where: { userId },
    update: { cvUrl },
    create: { userId, cvUrl },
  });

  extractCvKeywords(cvUrl).then(async (extracted) => {
    const updateData: any = {};
    if (extracted.technical.length > 0) updateData.skills = extracted.technical;
    if (extracted.soft.length > 0) updateData.softSkills = extracted.soft;
    if (extracted.languages.length > 0)
      updateData.languages = extracted.languages.map(lang => ({
        language: lang,
        level: 'No especificado',
      }));

    if (Object.keys(updateData).length > 0) {
      await prisma.candidateProfile.update({
        where: { userId },
        data: updateData,
      });
    }
    await computeAndSaveScore(userId);
  }).catch(err => {
    console.error('Error extrayendo keywords del CV:', err);
  });

  return cvUrl;
}

// ─── EXTRACCIÓN MANUAL DE CV ──────────────────────────────────────────────────

export async function extractCvManually(userId: string): Promise<ExtractedKeywords> {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
  });

  if (!profile?.cvUrl) throw new Error('CV_NOT_FOUND');

  const extracted = await extractCvKeywords(profile.cvUrl);

  const updateData: any = {};
  if (extracted.technical.length > 0) updateData.skills = extracted.technical;
  if (extracted.soft.length > 0) updateData.softSkills = extracted.soft;
  if (extracted.languages.length > 0)
    updateData.languages = extracted.languages.map(lang => ({
      language: lang,
      level: 'No especificado',
    }));

  if (Object.keys(updateData).length > 0) {
    await prisma.candidateProfile.update({
      where: { userId },
      data: updateData,
    });
  }

  return extracted;
}