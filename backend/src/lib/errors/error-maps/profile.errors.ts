import { ErrorMap } from '../error-map';

export const profileErrorMap: ErrorMap = {
  INVALID_FILE_TYPE: { status: 400, body: { error: 'Tipo de archivo no permitido.' } },
  STORAGE_UPLOAD_FAILED: { status: 500, body: { error: 'Error al subir el archivo. Intenta de nuevo.' } },
  CV_NOT_FOUND: { status: 404, body: { error: 'No tienes un CV cargado.' } },
};

export const profileCvErrorMap: ErrorMap = {
  ...profileErrorMap,
  INVALID_FILE_TYPE: { status: 400, body: { error: 'Solo se permiten archivos PDF.' } },
};

export const profilePhotoErrorMap: ErrorMap = {
  ...profileErrorMap,
  INVALID_FILE_TYPE: { status: 400, body: { error: 'Solo se permiten imágenes JPG, PNG o WebP.' } },
  STORAGE_UPLOAD_FAILED: { status: 500, body: { error: 'Error al subir la imagen. Intenta de nuevo.' } },
};

export const profileLogoErrorMap: ErrorMap = {
  ...profileErrorMap,
  INVALID_FILE_TYPE: { status: 400, body: { error: 'Solo se permiten imágenes JPG, PNG o WebP.' } },
  STORAGE_UPLOAD_FAILED: { status: 500, body: { error: 'Error al subir el logo. Intenta de nuevo.' } },
};
