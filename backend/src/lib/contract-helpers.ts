import { Payment } from '@prisma/client';

export function pickUploadedFile(
  files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined
): Express.Multer.File | undefined {
  if (!files) return undefined;
  if (Array.isArray(files)) return files[0];
  return files.file?.[0] ?? files.contract?.[0];
}

export function computePaymentTotals(
  payments: Pick<Payment, 'amount' | 'status'>[],
  totalAmount: number
) {
  const confirmedAmount = payments
    .filter(p => p.status === 'CONFIRMED')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    paidAmount: confirmedAmount,
    pendingAmount,
    remainingAmount: Math.max(0, totalAmount - confirmedAmount),
  };
}
