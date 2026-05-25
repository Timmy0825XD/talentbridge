import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export function handleMulterError(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'El archivo supera el tamaño máximo permitido (10MB).',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: "Campo de archivo incorrecto. Use 'file'.",
      });
    }
    return res.status(400).json({ error: 'Error al procesar el archivo.' });
  }

  if (err instanceof Error && err.message === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: 'Tipo de archivo no permitido.' });
  }

  next(err);
}
