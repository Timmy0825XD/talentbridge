import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import * as careerService from '../services/career.service';

export const listCareers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const careers = await careerService.listActiveCareers();
  res.json(careers);
}, undefined, 'listCareers');
