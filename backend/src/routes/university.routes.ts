import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as universityController from '../controllers/university.controller';

const router = Router();

router.use(authenticate);

router.get('/', universityController.getUniversities);

export default router;
