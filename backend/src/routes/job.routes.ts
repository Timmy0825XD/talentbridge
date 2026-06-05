import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as jobController from '../controllers/job.controller';
import * as applicationController from '../controllers/application.controller';


const router = Router();

// Rutas públicas para candidatos autenticados
router.get(
  '/',
  authenticate,
  jobController.listJobs
);

router.get(
  '/company/mine',
  authenticate,
  authorize('COMPANY'),
  jobController.getMyJobs
);

router.get(
  '/:id',
  authenticate,
  jobController.getJobById
);

// Rutas exclusivas para empresas
router.post(
  '/',
  authenticate,
  authorize('COMPANY'),
  jobController.createJob
);

router.put(
  '/:id',
  authenticate,
  authorize('COMPANY'),
  jobController.updateJob
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('COMPANY'),
  jobController.updateJobStatus
);

// Postularse a una vacante — candidatos
router.post(
  '/:id/apply',
  authenticate,
  authorize('STUDENT', 'GRADUATE'),
  applicationController.applyToJob
);

// Ver candidatos postulados — empresa
router.get(
  '/:id/applicants',
  authenticate,
  authorize('COMPANY'),
  applicationController.getJobApplicants
);

export default router;