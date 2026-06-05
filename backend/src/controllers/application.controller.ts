import { Response } from 'express';
import { ApplicationStatus } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import {
  applicationApplicantsErrorMap,
  applicationErrorMap,
  applicationStatusErrorMap,
  myApplicationsErrorMap,
} from '../lib/errors/error-maps/application.errors';
import * as applicationService from '../services/application.service';

export const applyToJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await applicationService.applyToJob(
    req.user!.userId,
    req.params['id'] as string
  );

  res.status(201).json({
    message: '¡Te postulaste exitosamente!',
    application: {
      id: result.id,
      status: result.status,
      scoreAtApply: result.scoreAtApply,
      job: result.job,
    },
    aiInsights: result.aiInsights,
  });
}, applicationErrorMap, 'applyToJob');

export const getJobApplicants = asyncHandler(async (req: AuthRequest, res: Response) => {
  const applicants = await applicationService.getJobApplicants(
    req.user!.userId,
    req.params['id'] as string
  );
  res.json(applicants);
}, applicationApplicantsErrorMap, 'getJobApplicants');

export const updateApplicationStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;

  if (!Object.values(ApplicationStatus).includes(status)) {
    return res.status(400).json({ error: 'Estado de postulación inválido.' });
  }

  const application = await applicationService.updateApplicationStatus(
    req.user!.userId,
    req.params['id'] as string,
    status as ApplicationStatus
  );
  res.json(application);
}, applicationStatusErrorMap, 'updateApplicationStatus');

export const getMyApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const applications = await applicationService.getMyApplications(req.user!.userId);
  res.json(applications);
}, myApplicationsErrorMap, 'getMyApplications');
