import { ErrorMap } from '../error-map';

export const institutionErrorMap: ErrorMap = {
  INSTITUTION_PROFILE_NOT_FOUND: { status: 404, body: { error: 'Perfil de institución no encontrado.' } },
  INSTITUTION_INACTIVE: { status: 403, body: { error: 'La institución está desactivada.' } },
};
