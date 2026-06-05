import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import { ratingErrorMap } from '../lib/errors/error-maps/rating.errors';
import { formatFirstZodIssue } from '../lib/validation/zod-utils';
import {
  candidateRatesCompanySchema,
  companyRatesCandidateSchema,
} from '../lib/validators/rating.validators';
import * as ratingService from '../services/rating.service';

export const getContractRatings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await ratingService.getContractRatings(
    req.user!.userId,
    req.params['id'] as string
  );
  res.json(data);
}, ratingErrorMap, 'getContractRatings');

export const rateCandidate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = companyRatesCandidateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatFirstZodIssue(parsed.error) });
  }

  const rating = await ratingService.rateCandidate(
    req.user!.userId,
    req.params['id'] as string,
    parsed.data
  );
  res.status(201).json({ message: 'Calificación registrada.', rating });
}, ratingErrorMap, 'rateCandidate');

export const rateCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = candidateRatesCompanySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatFirstZodIssue(parsed.error) });
  }

  const rating = await ratingService.rateCompany(
    req.user!.userId,
    req.params['id'] as string,
    parsed.data
  );
  res.status(201).json({ message: 'Calificación registrada.', rating });
}, ratingErrorMap, 'rateCompany');
