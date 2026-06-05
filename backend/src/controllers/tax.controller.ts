import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import * as taxService from '../services/tax.service';

export const getTaxBenefits = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.json(taxService.getTaxBenefitsInfo());
}, undefined, 'getTaxBenefits');

export const simulateTax = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const result = taxService.simulateTax(req.body);
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith('VALIDATION:')) {
      return res.status(400).json({ error: err.message.replace('VALIDATION:', '') });
    }
    throw err;
  }
}, undefined, 'simulateTax');
