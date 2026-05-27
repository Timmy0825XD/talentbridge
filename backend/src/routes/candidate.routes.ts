import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as candidateController from '../controllers/candidate.controller';

const router = Router();

router.use(authenticate);
router.get('/search', authorize('COMPANY'), candidateController.searchCandidates);

export default router;
