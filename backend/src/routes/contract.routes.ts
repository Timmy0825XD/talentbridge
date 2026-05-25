import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  handleMulterError,
  handleReceiptMulterError,
} from '../middlewares/upload-error.middleware';
import {
  uploadContractFile,
  uploadDeliverableFile,
  uploadDocument,
} from '../middlewares/upload.middleware';
import * as contractController from '../controllers/contract.controller';
import * as deliverableController from '../controllers/deliverable.controller';

const router = Router();

router.use(authenticate);

router.get('/', contractController.getMyContracts);

router.post(
  '/deliverables/:id/submit',
  authorize('STUDENT', 'GRADUATE'),
  uploadDeliverableFile,
  handleMulterError,
  deliverableController.submitDeliverable
);

router.patch(
  '/deliverables/:id/review',
  authorize('COMPANY'),
  deliverableController.reviewDeliverable
);

router.post(
  '/payments/:id/receipt',
  authorize('COMPANY'),
  uploadDocument.single('receipt'),
  handleReceiptMulterError,
  contractController.uploadPaymentReceipt
);

router.post(
  '/',
  authorize('COMPANY'),
  contractController.createContract
);

router.get('/:id', contractController.getContractById);

router.get(
  '/:id/deliverables',
  authorize('COMPANY', 'STUDENT', 'GRADUATE'),
  deliverableController.getDeliverables
);

router.post(
  '/:id/deliverables',
  authorize('COMPANY'),
  deliverableController.createDeliverable
);

router.post(
  '/:id/file',
  authorize('COMPANY'),
  uploadContractFile,
  handleMulterError,
  contractController.uploadContractFile
);

router.patch(
  '/:id/confirm',
  authorize('STUDENT', 'GRADUATE'),
  contractController.confirmContract
);

router.patch(
  '/:id/cancel',
  authorize('COMPANY'),
  contractController.cancelContract
);

router.patch(
  '/:id/complete',
  authorize('COMPANY'),
  contractController.completeContract
);

router.post(
  '/:id/payments',
  authorize('COMPANY'),
  contractController.createPayment
);

export default router;
