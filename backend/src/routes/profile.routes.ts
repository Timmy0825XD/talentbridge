import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  handleCvMulterError,
  handleLogoMulterError,
  handlePhotoMulterError,
} from '../middlewares/upload-error.middleware';
import { uploadCv, uploadPhoto } from '../middlewares/upload.middleware';
import * as profileController from '../controllers/profile.controller';

const router = Router();

router.use(authenticate);

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
  handleCvMulterError,
  profileController.uploadCv
);

router.post(
  '/candidate/photo',
  authorize('STUDENT', 'GRADUATE'),
  uploadPhoto.single('photo'),
  handlePhotoMulterError,
  profileController.uploadPhoto
);

router.post(
  '/candidate/extract-cv',
  authorize('STUDENT', 'GRADUATE'),
  profileController.extractCv
);

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
  handleLogoMulterError,
  profileController.uploadLogo
);

export default router;
