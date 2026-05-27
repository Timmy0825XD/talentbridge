import { z } from 'zod';

export const taxSimulateSchema = z.object({
  monthlySalary: z.number().positive('El salario mensual debe ser mayor a cero.'),
  hireAge: z.number().int().min(16).max(35).optional(),
});
