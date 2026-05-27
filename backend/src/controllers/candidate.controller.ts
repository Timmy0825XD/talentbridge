import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import { candidateErrorMap } from '../lib/errors/error-maps/candidate.errors';
import * as candidateService from '../services/candidate.service';

export const searchCandidates = asyncHandler(async (req: AuthRequest, res: Response) => {
  const minScoreRaw = req.query['minScore'];
  const pageRaw = req.query['page'];
  const limitRaw = req.query['limit'];

  const result = await candidateService.searchCandidates(req.user!.userId, {
    skills: req.query['skills'] as string | undefined,
    career: req.query['career'] as string | undefined,
    workMode: req.query['workMode'] as string | undefined,
    search: req.query['search'] as string | undefined,
    minScore: minScoreRaw ? Number(minScoreRaw) : undefined,
    page: pageRaw ? Number(pageRaw) : undefined,
    limit: limitRaw ? Number(limitRaw) : undefined,
  });

  res.json(result);
}, candidateErrorMap, 'searchCandidates');
