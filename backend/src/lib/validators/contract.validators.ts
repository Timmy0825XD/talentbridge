import { z } from 'zod';

const paymentSchemeEnum = z.enum(['SINGLE', 'MILESTONES', 'PERIODIC']);

function normalizePaymentScheme(val: unknown): 'SINGLE' | 'MILESTONES' | 'PERIODIC' {
  if (val === 'MILESTONES' || val === 'PERIODIC' || val === 'SINGLE') return val;
  return 'SINGLE';
}

const deliverableItemSchema = z.object({
  title: z.string().min(1, 'El título del entregable es obligatorio.'),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
});

export const createContractSchema = z.object({
  jobId: z.string().uuid().optional(),
  candidateId: z.string().uuid(),
  title: z.string().min(1, 'El título es obligatorio.'),
  description: z.string().optional(),
  deliverables: z.string().optional(),
  startDate: z.string().min(1, 'La fecha de inicio es obligatoria.'),
  endDate: z.string().min(1, 'La fecha de finalización es obligatoria.'),
  totalAmount: z.number().int().min(0),
  paymentScheme: z.preprocess(normalizePaymentScheme, paymentSchemeEnum.optional()),
  items: z.array(deliverableItemSchema).optional(),
}).refine(
  data => new Date(data.endDate) > new Date(data.startDate),
  { message: 'La fecha de finalización debe ser posterior a la de inicio.', path: ['endDate'] }
);

export const createPaymentSchema = z.object({
  amount: z.number().int().positive('El monto debe ser mayor a cero.'),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  sequence: z.number().int().positive().optional(),
});

export const createDeliverableSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio.'),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
});

export const reviewDeliverableSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  companyFeedback: z.string().optional(),
});

export const submitDeliverableSchema = z.object({
  candidateNotes: z.string().optional(),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreateDeliverableInput = z.infer<typeof createDeliverableSchema>;
export type ReviewDeliverableInput = z.infer<typeof reviewDeliverableSchema>;
export type SubmitDeliverableInput = z.infer<typeof submitDeliverableSchema>;
