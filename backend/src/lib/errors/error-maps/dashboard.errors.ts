import { ErrorMap } from '../error-map';

export const dashboardErrorMap: ErrorMap = {
  COMPANY_PROFILE_NOT_FOUND: { status: 404, body: { error: 'Completa tu perfil de empresa primero.' } },
  CANDIDATE_NOT_FOUND: { status: 404, body: { error: 'Perfil de candidato no encontrado.' } },
};
