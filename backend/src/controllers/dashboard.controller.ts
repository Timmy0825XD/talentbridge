import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import { dashboardErrorMap } from '../lib/errors/error-maps/dashboard.errors';
import * as dashboardService from '../services/dashboard.service';

export const getCompanyDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await dashboardService.getCompanyDashboard(req.user!.userId);
  res.json(data);
}, dashboardErrorMap, 'getCompanyDashboard');

export const getCandidateDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await dashboardService.getCandidateDashboard(req.user!.userId);
  res.json(data);
}, dashboardErrorMap, 'getCandidateDashboard');
