import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import { adminErrorMap } from '../lib/errors/error-maps/admin.errors';
import * as adminService from '../services/admin.service';

function handleValidation(err: unknown, res: Response): boolean {
  if (err instanceof Error && err.message.startsWith('VALIDATION:')) {
    res.status(400).json({ error: err.message.replace('VALIDATION:', '') });
    return true;
  }
  return false;
}

export const getMetrics = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.json(await adminService.getAdminMetrics());
}, adminErrorMap, 'getAdminMetrics');

export const listUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json(await adminService.listUsers(req.query as Record<string, unknown>));
}, adminErrorMap, 'listUsers');

export const updateUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const user = await adminService.updateUserStatus(req.params['id'] as string, req.body);
    res.json({ message: 'Estado del usuario actualizado.', user });
  } catch (err) {
    if (handleValidation(err, res)) return;
    throw err;
  }
}, adminErrorMap, 'updateUserStatus');

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  await adminService.deleteUser(req.params['id'] as string);
  res.json({ message: 'Usuario desactivado correctamente.' });
}, adminErrorMap, 'deleteUser');

export const listJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json(await adminService.listJobsForModeration(req.query as Record<string, unknown>));
}, adminErrorMap, 'listJobs');

export const moderateJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const job = await adminService.moderateJob(req.params['id'] as string, req.body);
    res.json({ message: 'Vacante moderada.', job });
  } catch (err) {
    if (handleValidation(err, res)) return;
    throw err;
  }
}, adminErrorMap, 'moderateJob');

export const getRankingWeights = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.json(await adminService.getGlobalRankingWeights());
}, adminErrorMap, 'getRankingWeights');

export const updateRankingWeights = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const config = await adminService.updateGlobalRankingWeights(req.body);
    res.json({ message: 'Pesos globales actualizados.', config });
  } catch (err) {
    if (handleValidation(err, res)) return;
    throw err;
  }
}, adminErrorMap, 'updateRankingWeights');

export const listInstitutions = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.json(await adminService.listInstitutions());
}, adminErrorMap, 'listInstitutions');

export const createInstitution = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const institution = await adminService.createInstitution(req.body);
    res.status(201).json({ message: 'Institución creada.', institution });
  } catch (err) {
    if (handleValidation(err, res)) return;
    throw err;
  }
}, adminErrorMap, 'createInstitution');

export const updateInstitution = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const institution = await adminService.updateInstitution(req.params['id'] as string, req.body);
    res.json({ message: 'Institución actualizada.', institution });
  } catch (err) {
    if (handleValidation(err, res)) return;
    throw err;
  }
}, adminErrorMap, 'updateInstitution');

export const createAdminUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const user = await adminService.createAdminUser(req.body);
    res.status(201).json({ message: 'Administrador creado.', user });
  } catch (err) {
    if (handleValidation(err, res)) return;
    throw err;
  }
}, adminErrorMap, 'createAdminUser');
