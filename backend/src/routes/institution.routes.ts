import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as institutionController from '../controllers/institution.controller';

const router = Router();

router.use(authenticate, authorize('INSTITUTION'));

router.get('/dashboard', institutionController.getDashboard);
router.get('/candidates', institutionController.getCandidates);
router.get('/analytics', institutionController.getAnalytics);

export default router;
