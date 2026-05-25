import { ErrorMap } from '../error-map';

export const deliverableErrorMap: ErrorMap = {
  CONTRACT_NOT_FOUND: { status: 404, body: { error: 'Contrato no encontrado.' } },
  UNAUTHORIZED: { status: 403, body: { error: 'No tienes acceso a este contrato.' } },
  COMPANY_PROFILE_NOT_FOUND: { status: 404, body: { error: 'Completa tu perfil de empresa primero.' } },
  CONTRACT_NOT_EDITABLE: { status: 400, body: { error: 'El contrato no puede modificarse en su estado actual.' } },
  DELIVERABLE_NOT_FOUND: { status: 404, body: { error: 'Entregable no encontrado.' } },
  CONTRACT_NOT_ACTIVE: { status: 400, body: { error: 'El contrato no está activo.' } },
  DELIVERABLE_NOT_SUBMITTABLE: { status: 400, body: { error: 'Este entregable no puede enviarse en su estado actual.' } },
  STORAGE_UPLOAD_FAILED: { status: 500, body: { error: 'Error al subir el archivo.' } },
  DELIVERABLE_NOT_REVIEWABLE: { status: 400, body: { error: 'Este entregable no está pendiente de revisión.' } },
};
