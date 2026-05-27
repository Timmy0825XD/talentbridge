import { ErrorMap } from '../error-map';

export const ratingErrorMap: ErrorMap = {
  CONTRACT_NOT_FOUND: { status: 404, body: { error: 'Contrato no encontrado.' } },
  UNAUTHORIZED: { status: 403, body: { error: 'No tienes acceso a este contrato.' } },
  CONTRACT_NOT_COMPLETED: { status: 400, body: { error: 'Solo puedes calificar contratos completados.' } },
  RATING_ALREADY_EXISTS: { status: 409, body: { error: 'Ya enviaste tu calificación para este contrato.' } },
  COMPANY_PROFILE_NOT_FOUND: { status: 404, body: { error: 'Completa tu perfil de empresa primero.' } },
  CANDIDATE_NOT_FOUND: { status: 404, body: { error: 'Perfil de candidato no encontrado.' } },
};
