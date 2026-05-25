import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import { deliverableErrorMap } from '../lib/errors/error-maps/deliverable.errors';
import { formatFirstZodIssue } from '../lib/validation/zod-utils';
import {
  createDeliverableSchema,
  reviewDeliverableSchema,
  submitDeliverableSchema,
} from '../lib/validators/contract.validators';
import * as deliverableService from '../services/deliverable.service';

export const getDeliverables = asyncHandler(async (req: AuthRequest, res: Response) => {
  const deliverables = await deliverableService.getDeliverables(
    req.user!.userId,
    req.params['id'] as string
  );
  res.json(deliverables);
}, deliverableErrorMap, 'getDeliverables');

export const createDeliverable = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = createDeliverableSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatFirstZodIssue(parsed.error) });
  }

  const deliverable = await deliverableService.createDeliverable(
    req.user!.userId,
    req.params['id'] as string,
    parsed.data
  );
  res.status(201).json(deliverable);
}, deliverableErrorMap, 'createDeliverable');

export const submitDeliverable = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = submitDeliverableSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatFirstZodIssue(parsed.error) });
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
}, deliverableErrorMap, 'submitDeliverable');

export const reviewDeliverable = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = reviewDeliverableSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatFirstZodIssue(parsed.error) });
  }

  const deliverable = await deliverableService.reviewDeliverable(
    req.user!.userId,
    req.params['id'] as string,
    parsed.data
  );
  res.json({ message: 'Entregable revisado.', deliverable });
}, deliverableErrorMap, 'reviewDeliverable');
