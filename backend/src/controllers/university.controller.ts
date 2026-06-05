import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import * as universityService from '../services/university.service';

export const getUniversities = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const universities = await universityService.listActiveUniversities();
  res.json(universities);
}, undefined, 'getUniversities');
