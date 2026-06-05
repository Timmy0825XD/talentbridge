import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import { notificationErrorMap } from '../lib/errors/error-maps/notification.errors';
import * as notificationService from '../services/notification.service';

export const getCandidatesToNotify = asyncHandler(async (req: Request, res: Response) => {
  const result = await notificationService.getCandidatesToNotify(req.params['id'] as string);
  res.json(result);
}, notificationErrorMap, 'getCandidatesToNotify');

export const registerTelegram = asyncHandler(async (req: Request, res: Response) => {
  const { userId, chatId } = req.body;
  if (!userId || !chatId) {
    return res.status(400).json({ error: 'userId y chatId son requeridos.' });
  }

  await notificationService.registerTelegramChatId(userId, chatId);
  res.json({ message: 'Telegram vinculado exitosamente.' });
}, undefined, 'registerTelegram');

export const updatePreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { enabled } = req.body;
  await notificationService.updateNotificationPreferences(req.user!.userId, enabled);
  res.json({ message: `Notificaciones ${enabled ? 'activadas' : 'desactivadas'}.` });
}, undefined, 'updatePreferences');
