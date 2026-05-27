import { ErrorMap } from '../error-map';

export const reportErrorMap: ErrorMap = {
  COMPANY_PROFILE_NOT_FOUND: { status: 404, body: { error: 'Completa tu perfil de empresa primero.' } },
  CONTRACT_NOT_FOUND: { status: 404, body: { error: 'Contrato no encontrado.' } },
  CONTRACT_NOT_COMPLETED: { status: 400, body: { error: 'El reporte solo está disponible para contratos completados.' } },
};
