import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as rankingController from '../controllers/ranking.controller';

const router = Router();

// Mi propio puntaje — solo candidatos
router.get(
  '/me',
  authenticate,
  authorize('STUDENT', 'GRADUATE'),
  rankingController.getMyScore
);

// Recalcular mi puntaje manualmente
router.post(
  '/recalculate',
  authenticate,
  authorize('STUDENT', 'GRADUATE'),
  rankingController.recalculateMyScore
);

// Puntaje de un candidato específico — empresas y admins
router.get(
  '/:userId',
  authenticate,
  authorize('COMPANY', 'ADMIN'),
  rankingController.getCandidateScore
);

export default router;