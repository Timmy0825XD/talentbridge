import { ErrorMap } from '../error-map';

export const candidateErrorMap: ErrorMap = {
  COMPANY_PROFILE_NOT_FOUND: { status: 404, body: { error: 'Completa tu perfil de empresa primero.' } },
};
