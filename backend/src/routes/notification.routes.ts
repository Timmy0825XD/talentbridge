import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { verifyWebhookSecret } from '../middlewares/webhook-secret.middleware';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

router.get(
  '/jobs/:id/candidates',
  verifyWebhookSecret,
  notificationController.getCandidatesToNotify
);

router.post(
  '/telegram/register',
  verifyWebhookSecret,
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