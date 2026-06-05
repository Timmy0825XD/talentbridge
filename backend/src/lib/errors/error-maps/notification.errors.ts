import { ErrorMap } from '../error-map';

export const notificationErrorMap: ErrorMap = {
  JOB_NOT_FOUND: { status: 404, body: { error: 'Vacante no encontrada.' } },
};
