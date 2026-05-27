import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as institutionController from '../controllers/institution.controller';

const router = Router();

router.use(authenticate, authorize('INSTITUTION'));

router.get('/dashboard', institutionController.getDashboard);

export default router;
