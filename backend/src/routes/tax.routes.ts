import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as taxController from '../controllers/tax.controller';

const router = Router();

router.use(authenticate, authorize('COMPANY'));

router.get('/benefits', taxController.getTaxBenefits);
router.post('/simulate', taxController.simulateTax);

export default router;
