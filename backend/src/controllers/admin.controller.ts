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

export const listUniversities = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.json(await adminService.listUniversities());
}, adminErrorMap, 'listUniversities');

export const createUniversity = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.createUniversity(req.body);
    res.status(201).json({
      message: 'Universidad creada.',
      university: result.university,
      generatedCredentials: result.generatedCredentials,
    });
  } catch (err) {
    if (handleValidation(err, res)) return;
    throw err;
  }
}, adminErrorMap, 'createUniversity');

export const updateUniversity = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const university = await adminService.updateUniversity(req.params['id'] as string, req.body);
    res.json({ message: 'Universidad actualizada.', university });
  } catch (err) {
    if (handleValidation(err, res)) return;
    throw err;
  }
}, adminErrorMap, 'updateUniversity');

export const listCareers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.json(await adminService.listCareers());
}, adminErrorMap, 'listCareers');

export const createCareer = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const career = await adminService.createCareer(req.body);
    res.status(201).json({ message: 'Carrera creada.', career });
  } catch (err) {
    if (handleValidation(err, res)) return;
    throw err;
  }
}, adminErrorMap, 'createCareer');

export const updateCareer = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const career = await adminService.updateCareer(req.params['id'] as string, req.body);
    res.json({ message: 'Carrera actualizada.', career });
  } catch (err) {
    if (handleValidation(err, res)) return;
    throw err;
  }
}, adminErrorMap, 'updateCareer');

export const createAdminUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const user = await adminService.createAdminUser(req.body);
    res.status(201).json({ message: 'Administrador creado.', user });
  } catch (err) {
    if (handleValidation(err, res)) return;
    throw err;
  }
}, adminErrorMap, 'createAdminUser');
