import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as contractService from '../services/contract.service';

export async function createContract(req: AuthRequest, res: Response) {
  try {
    const contract = await contractService.createContract(req.user!.userId, req.body);
    res.status(201).json(contract);
  } catch (err: any) {
    if (err.message === 'COMPANY_PROFILE_NOT_FOUND')
      return res.status(404).json({ error: 'Completa tu perfil de empresa primero.' });
    if (err.message === 'CANDIDATE_NOT_FOUND')
      return res.status(404).json({ error: 'Candidato no encontrado.' });
    if (err.message === 'JOB_NOT_FOUND')
      return res.status(404).json({ error: 'Vacante no encontrada.' });
    console.error('createContract error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function uploadContractFile(req: AuthRequest, res: Response) {
  try {
    if (!req.file)
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });

    const contractId = req.params['id'] as string;
    const url = await contractService.uploadContractFile(
      req.user!.userId, contractId, req.file.buffer, req.file.mimetype
    );
    res.json({ message: 'Contrato subido exitosamente.', contractFileUrl: url });
  } catch (err: any) {
    if (err.message === 'CONTRACT_NOT_FOUND')
      return res.status(404).json({ error: 'Contrato no encontrado.' });
    if (err.message === 'STORAGE_UPLOAD_FAILED')
      return res.status(500).json({ error: 'Error al subir el archivo.' });
    console.error('uploadContractFile error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function confirmContract(req: AuthRequest, res: Response) {
  try {
    const contract = await contractService.confirmContract(
      req.user!.userId, req.params['id'] as string
    );
    res.json({ message: 'Contrato confirmado.', contract });
  } catch (err: any) {
    if (err.message === 'CONTRACT_NOT_FOUND')
      return res.status(404).json({ error: 'Contrato no encontrado.' });
    if (err.message === 'CONTRACT_NOT_PENDING')
      return res.status(400).json({ error: 'El contrato ya fue procesado.' });
    console.error('confirmContract error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function getMyContracts(req: AuthRequest, res: Response) {
  try {
    const contracts = await contractService.getMyContracts(
      req.user!.userId, req.user!.role
    );
    res.json(contracts);
  } catch (err) {
    console.error('getMyContracts error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function getContractById(req: AuthRequest, res: Response) {
  try {
    const contract = await contractService.getContractById(
      req.user!.userId, req.params['id'] as string
    );
    res.json(contract);
  } catch (err: any) {
    if (err.message === 'CONTRACT_NOT_FOUND')
      return res.status(404).json({ error: 'Contrato no encontrado.' });
    if (err.message === 'UNAUTHORIZED')
      return res.status(403).json({ error: 'No tienes acceso a este contrato.' });
    console.error('getContractById error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function createPayment(req: AuthRequest, res: Response) {
  try {
    const payment = await contractService.createPayment(
      req.user!.userId, req.params['id'] as string, req.body
    );
    res.status(201).json(payment);
  } catch (err: any) {
    if (err.message === 'CONTRACT_NOT_FOUND')
      return res.status(404).json({ error: 'Contrato no encontrado.' });
    if (err.message === 'CONTRACT_NOT_ACTIVE')
      return res.status(400).json({ error: 'El contrato no está activo.' });
    console.error('createPayment error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function uploadPaymentReceipt(req: AuthRequest, res: Response) {
  try {
    if (!req.file)
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });

    const url = await contractService.uploadPaymentReceipt(
      req.user!.userId, req.params['id'] as string,
      req.file.buffer, req.file.mimetype
    );
    res.json({ message: 'Comprobante registrado.', receiptUrl: url });
  } catch (err: any) {
    if (err.message === 'PAYMENT_NOT_FOUND')
      return res.status(404).json({ error: 'Pago no encontrado.' });
    if (err.message === 'STORAGE_UPLOAD_FAILED')
      return res.status(500).json({ error: 'Error al subir el comprobante.' });
    console.error('uploadPaymentReceipt error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function completeContract(req: AuthRequest, res: Response) {
  try {
    const contract = await contractService.completeContract(
      req.user!.userId, req.params['id'] as string
    );
    res.json({ message: 'Contrato completado exitosamente.', contract });
  } catch (err: any) {
    if (err.message === 'CONTRACT_NOT_FOUND')
      return res.status(404).json({ error: 'Contrato no encontrado.' });
    if (err.message === 'CONTRACT_NOT_ACTIVE')
      return res.status(400).json({ error: 'El contrato no está activo.' });
    console.error('completeContract error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}