import { ErrorMap } from '../error-map';

export const adminErrorMap: ErrorMap = {
  USER_NOT_FOUND: { status: 404, body: { error: 'Usuario no encontrado.' } },
  JOB_NOT_FOUND: { status: 404, body: { error: 'Vacante no encontrada.' } },
  INSTITUTION_NOT_FOUND: { status: 404, body: { error: 'Institución no encontrada.' } },
  UNIVERSITY_NOT_FOUND: { status: 404, body: { error: 'Universidad no encontrada.' } },
  UNIVERSITY_NAME_TAKEN: { status: 409, body: { error: 'Ya existe una universidad con ese nombre.' } },
  UNIVERSITY_INACTIVE: { status: 400, body: { error: 'La universidad seleccionada no está activa.' } },
  CAREER_NOT_FOUND: { status: 404, body: { error: 'Carrera no encontrada.' } },
  CAREER_NAME_TAKEN: { status: 409, body: { error: 'Ya existe una carrera con ese nombre.' } },
  EMAIL_TAKEN: { status: 409, body: { error: 'El correo ya está registrado.' } },
  WEIGHTS_SUM_INVALID: { status: 400, body: { error: 'Los pesos deben sumar aproximadamente 1.0.' } },
};
