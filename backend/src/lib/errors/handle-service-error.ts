import { Response } from 'express';
import { ErrorMap, getErrorCode } from './error-map';

export function handleServiceError(
  err: unknown,
  res: Response,
  map: ErrorMap,
  logLabel?: string
): boolean {
  const code = getErrorCode(err);
  if (code && map[code]) {
    const { status, body } = map[code];
    res.status(status).json(body);
    return true;
  }
  if (logLabel) console.error(`${logLabel} error:`, err);
  return false;
}
