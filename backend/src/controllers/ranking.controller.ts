import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import {
  rankingCandidateErrorMap,
  rankingErrorMap,
} from '../lib/errors/error-maps/ranking.errors';
import * as rankingService from '../services/ranking.service';

export const getMyScore = asyncHandler(async (req: AuthRequest, res: Response) => {
  const score = await rankingService.getScoreByUserId(req.user!.userId);
  res.json(score);
}, rankingErrorMap, 'getMyScore');

export const getCandidateScore = asyncHandler(async (req: AuthRequest, res: Response) => {
  const score = await rankingService.getScoreByUserId(req.params['userId'] as string);
  res.json(score);
}, rankingCandidateErrorMap, 'getCandidateScore');

export const recalculateMyScore = asyncHandler(async (req: AuthRequest, res: Response) => {
  await rankingService.computeAndSaveScore(req.user!.userId);
  const score = await rankingService.getScoreByUserId(req.user!.userId);
  res.json({ message: 'Puntaje recalculado exitosamente.', ...score });
}, undefined, 'recalculateMyScore');
