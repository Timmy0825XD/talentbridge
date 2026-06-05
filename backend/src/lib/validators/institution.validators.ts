import { Role } from '@prisma/client';
import { z } from 'zod';

export const institutionCandidatesQuerySchema = z.object({
  role: z.enum([Role.STUDENT, Role.GRADUATE]).optional(),
  career: z.string().trim().optional(),
  status: z
    .enum(['all', 'incomplete_profile', 'no_applications', 'in_process', 'hired'])
    .optional()
    .default('all'),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(20),
});

export type InstitutionCandidatesQuery = z.infer<typeof institutionCandidatesQuerySchema>;

/** Consulta para exportación PDF (más registros por página) */
export const institutionCandidatesReportQuerySchema = institutionCandidatesQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(200).optional().default(200),
});
