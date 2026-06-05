import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ErrorMap } from './error-map';
import { handleServiceError } from './handle-service-error';

export function asyncHandler(
  fn: RequestHandler,
  errorMap?: ErrorMap,
  logLabel?: string
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: unknown) => {
      if (errorMap && handleServiceError(err, res, errorMap, logLabel)) return;
      if (logLabel) console.error(`${logLabel} error:`, err);
      next(err);
    });
  };
}
