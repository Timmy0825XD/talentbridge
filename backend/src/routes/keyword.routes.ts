import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as keywordController from '../controllers/keyword.controller';

const router = Router();

router.use(authenticate);

router.get('/', keywordController.getKeywords);

export default router;
