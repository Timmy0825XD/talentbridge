import { ErrorMap } from '../error-map';

export const jobErrorMap: ErrorMap = {
  COMPANY_PROFILE_NOT_FOUND: { status: 404, body: { error: 'Debes completar tu perfil de empresa primero.' } },
  INVALID_WEIGHTS: { status: 400, body: { error: 'Los pesos del ranking deben sumar exactamente 1.0' } },
  JOB_NOT_FOUND: { status: 404, body: { error: 'Vacante no encontrada.' } },
  UNAUTHORIZED: { status: 403, body: { error: 'No tienes permiso para editar esta vacante.' } },
};

export const jobStatusErrorMap: ErrorMap = {
  ...jobErrorMap,
  UNAUTHORIZED: { status: 403, body: { error: 'No tienes permiso para modificar esta vacante.' } },
};
