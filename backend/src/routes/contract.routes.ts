import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadDocument } from '../middlewares/upload.middleware';
import * as contractController from '../controllers/contract.controller';

const router = Router();

router.use(authenticate);

// Mis contratos — empresa y candidato
router.get('/', contractController.getMyContracts);

// Detalle de contrato
router.get('/:id', contractController.getContractById);

// Crear contrato — solo empresa
router.post(
  '/',
  authorize('COMPANY'),
  contractController.createContract
);

// Subir PDF del contrato — solo empresa
router.post(
  '/:id/file',
  authorize('COMPANY'),
  uploadDocument.single('contract'),
  contractController.uploadContractFile
);

// Confirmar contrato — solo candidato
router.patch(
  '/:id/confirm',
  authorize('STUDENT', 'GRADUATE'),
  contractController.confirmContract
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

// Subir comprobante de pago — solo empresa
router.post(
  '/payments/:id/receipt',
  authorize('COMPANY'),
  uploadDocument.single('receipt'),
  contractController.uploadPaymentReceipt
);

export default router;