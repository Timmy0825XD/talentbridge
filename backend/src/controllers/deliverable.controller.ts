import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  createDeliverableSchema,
  reviewDeliverableSchema,
  submitDeliverableSchema,
} from '../lib/validators/contract.validators';
import * as deliverableService from '../services/deliverable.service';

function zodErrorMessage(err: unknown): string | null {
  if (err && typeof err === 'object' && 'issues' in err) {
    const issues = (err as { issues: { message: string }[] }).issues;
    return issues[0]?.message ?? 'Datos inválidos.';
  }
  return null;
}

export async function getDeliverables(req: AuthRequest, res: Response) {
  try {
    const deliverables = await deliverableService.getDeliverables(
      req.user!.userId, req.params['id'] as string
    );
    res.json(deliverables);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'CONTRACT_NOT_FOUND')
        return res.status(404).json({ error: 'Contrato no encontrado.' });
      if (err.message === 'UNAUTHORIZED')
        return res.status(403).json({ error: 'No tienes acceso a este contrato.' });
    }
    console.error('getDeliverables error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function createDeliverable(req: AuthRequest, res: Response) {
  try {
    const parsed = createDeliverableSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: zodErrorMessage(parsed.error) ?? 'Datos inválidos.' });
    }

    const deliverable = await deliverableService.createDeliverable(
      req.user!.userId, req.params['id'] as string, parsed.data
    );
    res.status(201).json(deliverable);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'COMPANY_PROFILE_NOT_FOUND')
        return res.status(404).json({ error: 'Completa tu perfil de empresa primero.' });
      if (err.message === 'CONTRACT_NOT_FOUND')
        return res.status(404).json({ error: 'Contrato no encontrado.' });
      if (err.message === 'CONTRACT_NOT_EDITABLE')
        return res.status(400).json({ error: 'El contrato no puede modificarse en su estado actual.' });
    }
    console.error('createDeliverable error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function submitDeliverable(req: AuthRequest, res: Response) {
  try {
    const parsed = submitDeliverableSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: zodErrorMessage(parsed.error) ?? 'Datos inválidos.' });
    }

    const file = req.file;
    const deliverable = await deliverableService.submitDeliverable(
      req.user!.userId,
      req.params['id'] as string,
      parsed.data,
      file?.buffer,
      file?.mimetype
    );
    res.json({ message: 'Entregable enviado.', deliverable });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'DELIVERABLE_NOT_FOUND')
        return res.status(404).json({ error: 'Entregable no encontrado.' });
      if (err.message === 'CONTRACT_NOT_ACTIVE')
        return res.status(400).json({ error: 'El contrato no está activo.' });
      if (err.message === 'DELIVERABLE_NOT_SUBMITTABLE')
        return res.status(400).json({ error: 'Este entregable no puede enviarse en su estado actual.' });
      if (err.message === 'STORAGE_UPLOAD_FAILED')
        return res.status(500).json({ error: 'Error al subir el archivo.' });
    }
    console.error('submitDeliverable error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function reviewDeliverable(req: AuthRequest, res: Response) {
  try {
    const parsed = reviewDeliverableSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: zodErrorMessage(parsed.error) ?? 'Datos inválidos.' });
    }

    const deliverable = await deliverableService.reviewDeliverable(
      req.user!.userId, req.params['id'] as string, parsed.data
    );
    res.json({ message: 'Entregable revisado.', deliverable });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'DELIVERABLE_NOT_FOUND')
        return res.status(404).json({ error: 'Entregable no encontrado.' });
      if (err.message === 'CONTRACT_NOT_ACTIVE')
        return res.status(400).json({ error: 'El contrato no está activo.' });
      if (err.message === 'DELIVERABLE_NOT_REVIEWABLE')
        return res.status(400).json({ error: 'Este entregable no está pendiente de revisión.' });
    }
    console.error('reviewDeliverable error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
