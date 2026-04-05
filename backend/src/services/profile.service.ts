import { prisma } from '../lib/prisma';
import path from 'path';
import fs from 'fs';

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
  // upsert = actualiza si existe, crea si no existe
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

// ─── CARGA DE CV ──────────────────────────────────────────────────────────────

export async function saveCvLocally(
  userId: string,
  fileBuffer: Buffer,
  originalName: string
): Promise<string> {
  // En desarrollo guardamos el CV en una carpeta local uploads/
  // En producción esto se reemplaza por un storage en la nube (Supabase Storage)
  const uploadsDir = path.join(__dirname, '../../uploads');

  // Crear la carpeta uploads si no existe
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Nombre único para evitar colisiones: userId_timestamp.pdf
  const fileName = `${userId}_${Date.now()}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  fs.writeFileSync(filePath, fileBuffer);

  // Guardamos la ruta relativa en la BD
  const cvUrl = `/uploads/${fileName}`;

  await prisma.candidateProfile.upsert({
    where: { userId },
    update: { cvUrl },
    create: { userId, cvUrl },
  });

  return cvUrl;
}