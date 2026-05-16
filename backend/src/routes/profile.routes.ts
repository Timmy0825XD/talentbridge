import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadCv, uploadPhoto } from '../middlewares/upload.middleware';
import * as profileController from '../controllers/profile.controller';

const router = Router();

router.use(authenticate);

// ─── CANDIDATO ────────────────────────────────────────────────────────────────
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

router.post(
  '/candidate/photo',
  authorize('STUDENT', 'GRADUATE'),
  uploadPhoto.single('photo'),
  profileController.uploadPhoto
);

router.post(
  '/candidate/extract-cv',
  authorize('STUDENT', 'GRADUATE'),
  profileController.extractCv
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
  '/company/logo',
  authorize('COMPANY'),
  uploadPhoto.single('logo'),
  profileController.uploadLogo
);

export default router;