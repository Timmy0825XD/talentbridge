import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

// Usado por n8n — no requiere JWT del usuario sino un secret compartido
router.get(
  '/jobs/:id/candidates',
  notificationController.getCandidatesToNotify
);

// Usado por el bot de Telegram — no requiere JWT
router.post(
  '/telegram/register',
  notificationController.registerTelegram
);

// Usado por el candidato desde su perfil
router.patch(
  '/preferences',
  authenticate,
  authorize('STUDENT', 'GRADUATE'),
  notificationController.updatePreferences
);

export default router;