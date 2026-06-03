import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/metrics', adminController.getMetrics);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.get('/jobs', adminController.listJobs);
router.patch('/jobs/:id/moderate', adminController.moderateJob);
router.get('/ranking-weights', adminController.getRankingWeights);
router.put('/ranking-weights', adminController.updateRankingWeights);
router.get('/universities', adminController.listUniversities);
router.post('/universities', adminController.createUniversity);
router.patch('/universities/:id', adminController.updateUniversity);
router.post('/admins', adminController.createAdminUser);

export default router;
