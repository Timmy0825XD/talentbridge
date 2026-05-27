import { Request, Response, NextFunction } from 'express';

export function verifyWebhookSecret(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret) {
    next();
    return;
  }

  const header = req.headers['x-webhook-secret'];
  if (header !== secret) {
    res.status(401).json({ error: 'No autorizado.' });
    return;
  }

  next();
}
