import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as applicationController from '../controllers/application.controller';

const router = Router();

// Mis postulaciones — candidato
router.get(
  '/me',
  authenticate,
  authorize('STUDENT', 'GRADUATE'),
  applicationController.getMyApplications
);

// Cambiar estado de postulación — empresa
router.patch(
  '/:id/status',
  authenticate,
  authorize('COMPANY'),
  applicationController.updateApplicationStatus
);

export default router;