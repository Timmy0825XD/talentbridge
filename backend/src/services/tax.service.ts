import { simulateTaxBenefits, TAX_BENEFITS_INFO } from '../lib/tax-benefits';
import { formatFirstZodIssue } from '../lib/validation/zod-utils';
import { taxSimulateSchema } from '../lib/validators/tax.validators';

export function getTaxBenefitsInfo() {
  return TAX_BENEFITS_INFO;
}

export function simulateTax(body: unknown) {
  const parsed = taxSimulateSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error(`VALIDATION:${formatFirstZodIssue(parsed.error)}`);
  }
  return simulateTaxBenefits(parsed.data);
}
