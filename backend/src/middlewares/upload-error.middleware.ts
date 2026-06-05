import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

interface MulterErrorHandlerOptions {
  maxSizeLabel: string;
  fileFieldHint: string;
}

export function createMulterErrorHandler(options: MulterErrorHandlerOptions) {
  const { maxSizeLabel, fileFieldHint } = options;

  return function multerErrorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: `El archivo supera el tamaño máximo permitido (${maxSizeLabel}).`,
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          error: `Campo de archivo incorrecto. Use '${fileFieldHint}'.`,
        });
      }
      return res.status(400).json({ error: 'Error al procesar el archivo.' });
    }

    if (err instanceof Error && err.message === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ error: 'Tipo de archivo no permitido.' });
    }

    next(err);
  };
}

/** Default handler for contract/deliverable uploads (10MB, field: file) */
export const handleMulterError = createMulterErrorHandler({
  maxSizeLabel: '10MB',
  fileFieldHint: 'file',
});

export const handleCvMulterError = createMulterErrorHandler({
  maxSizeLabel: '5MB',
  fileFieldHint: 'cv',
});

export const handlePhotoMulterError = createMulterErrorHandler({
  maxSizeLabel: '2MB',
  fileFieldHint: 'photo',
});

export const handleLogoMulterError = createMulterErrorHandler({
  maxSizeLabel: '2MB',
  fileFieldHint: 'logo',
});

export const handleReceiptMulterError = createMulterErrorHandler({
  maxSizeLabel: '10MB',
  fileFieldHint: 'receipt',
});
