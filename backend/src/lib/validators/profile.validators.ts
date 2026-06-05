import { z } from 'zod';

const languageSchema = z.object({
  language: z.string(),
  level: z.string(),
});

const certificationSchema = z.object({
  name: z.string(),
  issuer: z.string().optional(),
  year: z.number().optional(),
});

const projectSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  url: z.string().optional(),
});

export const upsertCandidateProfileSchema = z
  .object({
    fullName: z.string().optional(),
    phone: z.string().optional(),
    summary: z.string().optional(),
    semester: z.number().int().optional(),
    graduationYear: z.number().int().optional(),
    universityId: z.string().uuid({ message: 'universityId inválido.' }),
    careerId: z.string().uuid({ message: 'careerId inválido.' }),
    skills: z.array(z.string()).optional(),
    softSkills: z.array(z.string()).optional(),
    languages: z.array(languageSchema).optional(),
    certifications: z.array(certificationSchema).optional(),
    projects: z.array(projectSchema).optional(),
    salaryExpected: z.number().optional(),
    workMode: z.string().optional(),
  })
  .strict();

export type UpsertCandidateProfileInput = z.infer<typeof upsertCandidateProfileSchema>;
