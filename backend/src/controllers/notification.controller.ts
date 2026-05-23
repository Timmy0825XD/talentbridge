import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as notificationService from '../services/notification.service';

// GET /api/notifications/jobs/:id/candidates
// Usado por n8n para obtener los candidatos a notificar
export async function getCandidatesToNotify(req: Request, res: Response) {
  try {
    const jobId = req.params['id'] as string;
    const result = await notificationService.getCandidatesToNotify(jobId);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'JOB_NOT_FOUND')
      return res.status(404).json({ error: 'Vacante no encontrada.' });
    console.error('getCandidatesToNotify error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

// POST /api/notifications/telegram/register
// El bot de Telegram llama este endpoint cuando un candidato hace /start
export async function registerTelegram(req: Request, res: Response) {
  try {
    const { userId, chatId } = req.body;
    if (!userId || !chatId)
      return res.status(400).json({ error: 'userId y chatId son requeridos.' });

    await notificationService.registerTelegramChatId(userId, chatId);
    res.json({ message: 'Telegram vinculado exitosamente.' });
  } catch (err) {
    console.error('registerTelegram error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

// PATCH /api/notifications/preferences
// El candidato activa/desactiva notificaciones desde su perfil
export async function updatePreferences(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { enabled } = req.body;
    await notificationService.updateNotificationPreferences(userId, enabled);
    res.json({ message: `Notificaciones ${enabled ? 'activadas' : 'desactivadas'}.` });
  } catch (err) {
    console.error('updatePreferences error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}