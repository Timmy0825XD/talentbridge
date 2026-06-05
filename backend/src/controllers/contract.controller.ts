import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { pickUploadedFile } from '../lib/contract-helpers';
import { asyncHandler } from '../lib/errors/async-handler';
import {
  contractErrorMap,
  paymentReceiptErrorMap,
} from '../lib/errors/error-maps/contract.errors';
import { formatFirstZodIssue } from '../lib/validation/zod-utils';
import {
  createContractSchema,
  createPaymentSchema,
} from '../lib/validators/contract.validators';
import * as contractService from '../services/contract.service';

export const createContract = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = createContractSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatFirstZodIssue(parsed.error) });
  }

  const contract = await contractService.createContract(req.user!.userId, parsed.data);
  res.status(201).json(contract);
}, contractErrorMap, 'createContract');

export const uploadContractFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const file = pickUploadedFile(req.files);
  if (!file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  }

  const url = await contractService.uploadContractFile(
    req.user!.userId,
    req.params['id'] as string,
    file.buffer,
    file.mimetype
  );
  res.json({ message: 'Contrato subido exitosamente.', contractFileUrl: url });
}, contractErrorMap, 'uploadContractFile');

export const confirmContract = asyncHandler(async (req: AuthRequest, res: Response) => {
  const contract = await contractService.confirmContract(
    req.user!.userId,
    req.params['id'] as string
  );
  res.json({ message: 'Contrato confirmado.', contract });
}, contractErrorMap, 'confirmContract');

export const cancelContract = asyncHandler(async (req: AuthRequest, res: Response) => {
  const contract = await contractService.cancelContract(
    req.user!.userId,
    req.params['id'] as string
  );
  res.json({ message: 'Contrato cancelado.', contract });
}, contractErrorMap, 'cancelContract');

export const getMyContracts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const contracts = await contractService.getMyContracts(
    req.user!.userId,
    req.user!.role
  );
  res.json(contracts);
}, undefined, 'getMyContracts');

export const getContractById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const contract = await contractService.getContractById(
    req.user!.userId,
    req.params['id'] as string
  );
  res.json(contract);
}, contractErrorMap, 'getContractById');

export const createPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = createPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatFirstZodIssue(parsed.error) });
  }

  const payment = await contractService.createPayment(
    req.user!.userId,
    req.params['id'] as string,
    parsed.data
  );
  res.status(201).json(payment);
}, contractErrorMap, 'createPayment');

export const uploadPaymentReceipt = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  }

  const url = await contractService.uploadPaymentReceipt(
    req.user!.userId,
    req.params['id'] as string,
    req.file.buffer,
    req.file.mimetype
  );
  res.json({ message: 'Comprobante registrado.', receiptUrl: url });
}, paymentReceiptErrorMap, 'uploadPaymentReceipt');

export const completeContract = asyncHandler(async (req: AuthRequest, res: Response) => {
  const contract = await contractService.completeContract(
    req.user!.userId,
    req.params['id'] as string
  );
  res.json({ message: 'Contrato completado exitosamente.', contract });
}, contractErrorMap, 'completeContract');
