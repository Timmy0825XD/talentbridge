import { z } from 'zod';
import { JobStatus } from '@prisma/client';

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const moderateJobSchema = z.object({
  status: z.enum([JobStatus.CANCELLED, JobStatus.CLOSED, JobStatus.ACTIVE]),
});

export const updateRankingWeightsSchema = z.object({
  skillsWeight: z.number().min(0).max(1),
  experienceWeight: z.number().min(0).max(1),
  educationWeight: z.number().min(0).max(1),
  certsWeight: z.number().min(0).max(1),
  reputationWeight: z.number().min(0).max(1),
  languagesWeight: z.number().min(0).max(1),
  completionWeight: z.number().min(0).max(1),
});

export const createUniversitySchema = z.object({
  name: z.string().min(2, 'Nombre de universidad requerido.'),
});

export const updateUniversitySchema = z.object({
  name: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
});

export const createAdminUserSchema = z.object({
  email: z.string().email('Correo inválido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
});

export const createCareerSchema = z.object({
  name: z.string().min(2, 'Nombre de carrera requerido.'),
});

export const updateCareerSchema = z.object({
  name: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
});
