import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as dashboardController from '../controllers/dashboard.controller';

const router = Router();

router.use(authenticate);

router.get('/company', authorize('COMPANY'), dashboardController.getCompanyDashboard);
router.get('/candidate', authorize('STUDENT', 'GRADUATE'), dashboardController.getCandidateDashboard);

export default router;
