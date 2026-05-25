import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { handleMulterError } from '../middlewares/upload-error.middleware';
import {
  uploadContractFile,
  uploadDeliverableFile,
  uploadDocument,
} from '../middlewares/upload.middleware';
import * as contractController from '../controllers/contract.controller';
import * as deliverableController from '../controllers/deliverable.controller';

const router = Router();

router.use(authenticate);

// Mis contratos — empresa y candidato
router.get('/', contractController.getMyContracts);

// Entregables — rutas estáticas antes de /:id
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

// Subir comprobante de pago — ruta estática
router.post(
  '/payments/:id/receipt',
  authorize('COMPANY'),
  uploadDocument.single('receipt'),
  handleMulterError,
  contractController.uploadPaymentReceipt
);

// Crear contrato — solo empresa
router.post(
  '/',
  authorize('COMPANY'),
  contractController.createContract
);

// Detalle de contrato
router.get('/:id', contractController.getContractById);

// Entregables de un contrato
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

// Subir PDF del contrato — solo empresa
router.post(
  '/:id/file',
  authorize('COMPANY'),
  uploadContractFile,
  handleMulterError,
  contractController.uploadContractFile
);

// Confirmar contrato — solo candidato
router.patch(
  '/:id/confirm',
  authorize('STUDENT', 'GRADUATE'),
  contractController.confirmContract
);

// Cancelar contrato — solo empresa
router.patch(
  '/:id/cancel',
  authorize('COMPANY'),
  contractController.cancelContract
);

// Completar contrato — solo empresa
router.patch(
  '/:id/complete',
  authorize('COMPANY'),
  contractController.completeContract
);

// Registrar pago — solo empresa
router.post(
  '/:id/payments',
  authorize('COMPANY'),
  contractController.createPayment
);

export default router;
