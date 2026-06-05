import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import { institutionErrorMap } from '../lib/errors/error-maps/institution.errors';
import * as institutionService from '../services/institution.service';
import * as institutionReportService from '../services/institution-report.service';

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

export const downloadCandidatesReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pdf = await institutionReportService.generateInstitutionCandidatesPdf(
    req.user!.userId,
    req.query
  );
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="reporte_vinculados_talentbridge.pdf"'
  );
  res.send(pdf);
}, institutionErrorMap, 'downloadCandidatesReport');

export const downloadAnalyticsReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pdf = await institutionReportService.generateInstitutionAnalyticsPdf(req.user!.userId);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="reporte_empleabilidad_talentbridge.pdf"'
  );
  res.send(pdf);
}, institutionErrorMap, 'downloadAnalyticsReport');
