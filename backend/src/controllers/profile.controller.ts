import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as profileService from '../services/profile.service';

// ─── PERFIL CANDIDATO ─────────────────────────────────────────────────────────

export async function getCandidateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const profile = await profileService.getCandidateProfile(userId);
    res.json(profile ?? {});
  } catch (err) {
    console.error('getCandidateProfile error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function updateCandidateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const profile = await profileService.upsertCandidateProfile(userId, req.body);
    res.json(profile);
  } catch (err) {
    console.error('updateCandidateProfile error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

// ─── PERFIL EMPRESA ───────────────────────────────────────────────────────────

export async function getCompanyProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const profile = await profileService.getCompanyProfile(userId);
    res.json(profile ?? {});
  } catch (err) {
    console.error('getCompanyProfile error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function updateCompanyProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const profile = await profileService.upsertCompanyProfile(userId, req.body);
    res.json(profile);
  } catch (err) {
    console.error('updateCompanyProfile error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

// ─── CARGA DE CV ──────────────────────────────────────────────────────────────

export async function uploadCv(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }

    const userId = req.user!.userId;
    const cvUrl = await profileService.uploadCvToStorage(
      userId,
      req.file.buffer,
      req.file.originalname
    );

    res.json({ message: 'CV cargado exitosamente.', cvUrl });
  } catch (err: any) {
    if (err.message === 'INVALID_FILE_TYPE')
      return res.status(400).json({ error: 'Solo se permiten archivos PDF.' });
    if (err.message === 'STORAGE_UPLOAD_FAILED')
      return res.status(500).json({ error: 'Error al subir el archivo. Intenta de nuevo.' });
    console.error('uploadCv error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function extractCv(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const extracted = await profileService.extractCvManually(userId);
    res.json({
      message: 'Extracción completada.',
      technical: extracted.technical,
      soft: extracted.soft,
      languages: extracted.languages,
      total: extracted.technical.length + extracted.soft.length + extracted.languages.length,
    });
  } catch (err: any) {
    if (err.message === 'CV_NOT_FOUND')
      return res.status(404).json({ error: 'No tienes un CV cargado.' });
    console.error('extractCv error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function uploadPhoto(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }

    const userId = req.user!.userId;
    const photoUrl = await profileService.uploadPhotoToStorage(
      userId,
      req.file.buffer,
      req.file.mimetype
    );

    res.json({ message: 'Foto de perfil actualizada.', photoUrl });
  } catch (err: any) {
    if (err.message === 'INVALID_FILE_TYPE')
      return res.status(400).json({ error: 'Solo se permiten imágenes JPG, PNG o WebP.' });
    if (err.message === 'STORAGE_UPLOAD_FAILED')
      return res.status(500).json({ error: 'Error al subir la imagen. Intenta de nuevo.' });
    console.error('uploadPhoto error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}