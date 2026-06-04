import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import { institutionErrorMap } from '../lib/errors/error-maps/institution.errors';
import * as institutionService from '../services/institution.service';

export const getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await institutionService.getInstitutionDashboard(req.user!.userId);
  res.json(data);
}, institutionErrorMap, 'getInstitutionDashboard');

export const getCandidates = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await institutionService.listInstitutionCandidates(
    req.user!.userId,
    req.query
  );
  res.json(data);
}, institutionErrorMap, 'listInstitutionCandidates');

export const getAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await institutionService.getInstitutionAnalytics(req.user!.userId);
  res.json(data);
}, institutionErrorMap, 'getInstitutionAnalytics');
