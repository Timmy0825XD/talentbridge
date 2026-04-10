import { prisma } from '../lib/prisma';
import { supabase } from '../lib/supabase';

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
  languages?: any;
  projects?: any;
  certifications?: any;
  salaryExpected?: number;
  workMode?: string;
}) {
  const profile = await prisma.candidateProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
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

// ─── CARGA DE CV EN SUPABASE STORAGE ─────────────────────────────────────────

export async function uploadCvToStorage(
  userId: string,
  fileBuffer: Buffer,
  originalName: string
): Promise<string> {
  // Nombre único para evitar colisiones
  const fileName = `${userId}_${Date.now()}.pdf`;
  const filePath = fileName;

  // Subir el archivo al bucket 'cvs' de Supabase Storage
  const { error } = await supabase.storage
    .from('cvs')
    .upload(filePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true, // Si ya existe un CV anterior lo reemplaza
    });

  if (error) {
    throw new Error('STORAGE_UPLOAD_FAILED');
  }

  // Obtener la URL pública del archivo
  const { data } = supabase.storage
    .from('cvs')
    .getPublicUrl(filePath);

  const cvUrl = data.publicUrl;

  // Guardar la URL pública en la BD
  await prisma.candidateProfile.upsert({
    where: { userId },
    update: { cvUrl },
    create: { userId, cvUrl },
  });

  return cvUrl;
}