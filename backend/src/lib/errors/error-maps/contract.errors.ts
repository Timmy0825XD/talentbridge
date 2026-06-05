import { ErrorMap } from '../error-map';

export const contractErrorMap: ErrorMap = {
  COMPANY_PROFILE_NOT_FOUND: { status: 404, body: { error: 'Completa tu perfil de empresa primero.' } },
  CANDIDATE_NOT_FOUND: { status: 404, body: { error: 'Candidato no encontrado.' } },
  JOB_NOT_FOUND: { status: 404, body: { error: 'Vacante no encontrada.' } },
  APPLICATION_NOT_SELECTED: { status: 400, body: { error: 'El candidato debe estar en estado Seleccionado para esta vacante.' } },
  CONTRACT_ALREADY_EXISTS: { status: 409, body: { error: 'Ya existe un contrato activo para este candidato y vacante.' } },
  CONTRACT_NOT_FOUND: { status: 404, body: { error: 'Contrato no encontrado.' } },
  CONTRACT_NOT_EDITABLE: { status: 400, body: { error: 'El contrato no puede modificarse en su estado actual.' } },
  STORAGE_UPLOAD_FAILED: { status: 500, body: { error: 'Error al subir el archivo.' } },
  CONTRACT_NOT_PENDING: { status: 400, body: { error: 'El contrato ya fue procesado.' } },
  CONTRACT_FILE_REQUIRED: { status: 400, body: { error: 'La empresa debe subir el PDF del contrato antes de que puedas confirmarlo.' } },
  CONTRACT_NOT_CANCELLABLE: { status: 400, body: { error: 'El contrato no puede cancelarse en su estado actual.' } },
  UNAUTHORIZED: { status: 403, body: { error: 'No tienes acceso a este contrato.' } },
  CONTRACT_NOT_ACTIVE: { status: 400, body: { error: 'El contrato no está activo.' } },
  PAYMENT_EXCEEDS_TOTAL: { status: 400, body: { error: 'El monto supera el total pendiente del contrato.' } },
  SINGLE_PAYMENT_LIMIT: { status: 400, body: { error: 'Este contrato solo permite un pago único.' } },
  PAYMENT_NOT_FOUND: { status: 404, body: { error: 'Pago no encontrado.' } },
  DELIVERABLES_PENDING: { status: 400, body: { error: 'Hay entregables pendientes de aprobación.' } },
  PAYMENTS_INCOMPLETE: { status: 400, body: { error: 'Los pagos confirmados no cubren el monto total del contrato.' } },
};

export const paymentReceiptErrorMap: ErrorMap = {
  PAYMENT_NOT_FOUND: { status: 404, body: { error: 'Pago no encontrado.' } },
  STORAGE_UPLOAD_FAILED: { status: 500, body: { error: 'Error al subir el comprobante.' } },
};
