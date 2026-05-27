import { z } from 'zod';

const scoreField = z.number().int().min(1).max(5);

export const companyRatesCandidateSchema = z.object({
  quality: scoreField,
  deadlines: scoreField,
  communication: scoreField,
  attitude: scoreField,
  comment: z.string().max(1000).optional(),
});

export const candidateRatesCompanySchema = z.object({
  paymentPunctuality: scoreField,
  instructionClarity: scoreField,
  workEnvironment: scoreField,
  comment: z.string().max(1000).optional(),
});

export type CompanyRatesCandidateInput = z.infer<typeof companyRatesCandidateSchema>;
export type CandidateRatesCompanyInput = z.infer<typeof candidateRatesCompanySchema>;
