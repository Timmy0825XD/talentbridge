import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as careerController from '../controllers/career.controller';

const router = Router();

router.use(authenticate);
router.get('/', careerController.listCareers);

export default router;
