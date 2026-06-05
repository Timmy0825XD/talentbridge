import { ErrorMap } from '../error-map';

export const authErrorMap: ErrorMap = {
  EMAIL_TAKEN: { status: 409, body: { error: 'El correo ya está registrado.' } },
  ROLE_NOT_ALLOWED: { status: 403, body: { error: 'Este tipo de cuenta no puede registrarse públicamente.' } },
  OTP_INVALID: { status: 400, body: { error: 'Código inválido o expirado.' } },
  USER_NOT_FOUND: { status: 404, body: { error: 'Usuario no encontrado.' } },
  ALREADY_VERIFIED: { status: 400, body: { error: 'La cuenta ya está verificada.' } },
  INVALID_CREDENTIALS: { status: 401, body: { error: 'Correo o contraseña incorrectos.' } },
  ACCOUNT_INACTIVE: { status: 403, body: { error: 'Tu cuenta ha sido suspendida.' } },
  TOKEN_INVALID: { status: 400, body: { error: 'Enlace inválido o expirado.' } },
};
