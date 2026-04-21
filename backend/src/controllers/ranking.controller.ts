import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as rankingService from '../services/ranking.service';

// GET /api/ranking/me — mi propio puntaje
export async function getMyScore(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const score = await rankingService.getScoreByUserId(userId);
    res.json(score);
  } catch (err: any) {
    if (err.message === 'CANDIDATE_NOT_FOUND')
      return res.status(404).json({ error: 'No tienes un perfil de candidato.' });
    console.error('getMyScore error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

// GET /api/ranking/:userId — puntaje de cualquier candidato (para empresas)
export async function getCandidateScore(req: AuthRequest, res: Response) {
  try {
    const userId = req.params['userId'] as string;
    const score = await rankingService.getScoreByUserId(userId);
    res.json(score);
  } catch (err: any) {
    if (err.message === 'CANDIDATE_NOT_FOUND')
      return res.status(404).json({ error: 'Candidato no encontrado.' });
    console.error('getCandidateScore error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

// POST /api/ranking/recalculate — forzar recálculo del propio score
export async function recalculateMyScore(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    await rankingService.computeAndSaveScore(userId);
    const score = await rankingService.getScoreByUserId(userId);
    res.json({ message: 'Puntaje recalculado exitosamente.', ...score });
  } catch (err: any) {
    console.error('recalculateMyScore error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}