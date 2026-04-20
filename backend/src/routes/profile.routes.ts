import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadCv } from '../middlewares/upload.middleware';
import * as profileController from '../controllers/profile.controller';

const router = Router();

// Todas las rutas de perfil requieren autenticación
router.use(authenticate);

// ─── CANDIDATO (STUDENT o GRADUATE) ──────────────────────────────────────────
router.get(
  '/candidate',
  authorize('STUDENT', 'GRADUATE'),
  profileController.getCandidateProfile
);

router.put(
  '/candidate',
  authorize('STUDENT', 'GRADUATE'),
  profileController.updateCandidateProfile
);

router.post(
  '/candidate/cv',
  authorize('STUDENT', 'GRADUATE'),
  uploadCv.single('cv'),
  profileController.uploadCv
);

// ─── EMPRESA ──────────────────────────────────────────────────────────────────
router.get(
  '/company',
  authorize('COMPANY'),
  profileController.getCompanyProfile
);

router.put(
  '/company',
  authorize('COMPANY'),
  profileController.updateCompanyProfile
);

router.post(
  '/candidate/extract-cv',
  authorize('STUDENT', 'GRADUATE'),
  profileController.extractCv
);

export default router;