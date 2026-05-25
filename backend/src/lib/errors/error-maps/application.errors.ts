import { ErrorMap } from '../error-map';

export const applicationErrorMap: ErrorMap = {
  JOB_NOT_FOUND: { status: 404, body: { error: 'Vacante no encontrada.' } },
  JOB_NOT_ACTIVE: { status: 400, body: { error: 'Esta vacante no está disponible.' } },
  CANDIDATE_PROFILE_NOT_FOUND: { status: 400, body: { error: 'Debes completar tu perfil antes de postularte.' } },
  ALREADY_APPLIED: { status: 409, body: { error: 'Ya te postulaste a esta vacante.' } },
};

export const applicationApplicantsErrorMap: ErrorMap = {
  JOB_NOT_FOUND: { status: 404, body: { error: 'Vacante no encontrada.' } },
  UNAUTHORIZED: { status: 403, body: { error: 'No tienes permiso para ver esta información.' } },
};

export const applicationStatusErrorMap: ErrorMap = {
  APPLICATION_NOT_FOUND: { status: 404, body: { error: 'Postulación no encontrada.' } },
  UNAUTHORIZED: { status: 403, body: { error: 'No tienes permiso para modificar esta postulación.' } },
};

export const myApplicationsErrorMap: ErrorMap = {
  CANDIDATE_PROFILE_NOT_FOUND: { status: 400, body: { error: 'No tienes un perfil de candidato.' } },
};
