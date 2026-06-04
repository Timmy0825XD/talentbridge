import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import {
  profileCvErrorMap,
  profileErrorMap,
  profileLogoErrorMap,
  profilePhotoErrorMap,
} from '../lib/errors/error-maps/profile.errors';
import * as profileService from '../services/profile.service';
import { upsertCandidateProfileSchema } from '../lib/validators/profile.validators';
import { formatFirstZodIssue } from '../lib/validation/zod-utils';

export const getCandidateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await profileService.getCandidateProfile(req.user!.userId);
  res.json(profile ?? {});
}, undefined, 'getCandidateProfile');

export const updateCandidateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = upsertCandidateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatFirstZodIssue(parsed.error) });
  }
  const profile = await profileService.upsertCandidateProfile(req.user!.userId, parsed.data);
  res.json(profile);
}, profileErrorMap, 'updateCandidateProfile');

export const getCompanyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await profileService.getCompanyProfile(req.user!.userId);
  res.json(profile ?? {});
}, undefined, 'getCompanyProfile');

export const updateCompanyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await profileService.upsertCompanyProfile(req.user!.userId, req.body);
  res.json(profile);
}, undefined, 'updateCompanyProfile');

export const uploadCv = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  }

  const result = await profileService.uploadCvToStorage(
    req.user!.userId,
    req.file.buffer,
    req.file.originalname
  );

  res.json({
    message: 'CV cargado exitosamente.',
    cvUrl: result.cvUrl,
    suggestedUniversityId: result.suggestedUniversityId,
    suggestedCareerId: result.suggestedCareerId,
  });
}, profileCvErrorMap, 'uploadCv');

export const extractCv = asyncHandler(async (req: AuthRequest, res: Response) => {
  const extracted = await profileService.extractCvManually(req.user!.userId);
  res.json({
    message: 'Extracción completada.',
    technical: extracted.technical,
    soft: extracted.soft,
    languages: extracted.languages,
    total: extracted.technical.length + extracted.soft.length + extracted.languages.length,
  });
}, profileCvErrorMap, 'extractCv');

export const uploadPhoto = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  }

  const photoUrl = await profileService.uploadPhotoToStorage(
    req.user!.userId,
    req.file.buffer,
    req.file.mimetype
  );

  res.json({ message: 'Foto de perfil actualizada.', photoUrl });
}, profilePhotoErrorMap, 'uploadPhoto');

export const uploadLogo = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  }

  const logoUrl = await profileService.uploadLogoToStorage(
    req.user!.userId,
    req.file.buffer,
    req.file.mimetype
  );

  res.json({ message: 'Logo actualizado exitosamente.', logoUrl });
}, profileLogoErrorMap, 'uploadLogo');
