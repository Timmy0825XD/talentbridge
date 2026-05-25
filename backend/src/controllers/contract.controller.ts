import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { pickUploadedFile } from '../lib/contract-helpers';
import {
  createContractSchema,
  createPaymentSchema,
} from '../lib/validators/contract.validators';
import * as contractService from '../services/contract.service';

function zodErrorMessage(err: unknown): string | null {
  if (err && typeof err === 'object' && 'issues' in err) {
    const issues = (err as { issues: { message: string }[] }).issues;
    return issues[0]?.message ?? 'Datos inválidos.';
  }
  return null;
}

export async function createContract(req: AuthRequest, res: Response) {
  try {
    const parsed = createContractSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: zodErrorMessage(parsed.error) ?? 'Datos inválidos.' });
    }

    const contract = await contractService.createContract(req.user!.userId, parsed.data);
    res.status(201).json(contract);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'COMPANY_PROFILE_NOT_FOUND')
        return res.status(404).json({ error: 'Completa tu perfil de empresa primero.' });
      if (err.message === 'CANDIDATE_NOT_FOUND')
        return res.status(404).json({ error: 'Candidato no encontrado.' });
      if (err.message === 'JOB_NOT_FOUND')
        return res.status(404).json({ error: 'Vacante no encontrada.' });
      if (err.message === 'APPLICATION_NOT_SELECTED')
        return res.status(400).json({ error: 'El candidato debe estar en estado Seleccionado para esta vacante.' });
      if (err.message === 'CONTRACT_ALREADY_EXISTS')
        return res.status(409).json({ error: 'Ya existe un contrato activo para este candidato y vacante.' });
    }
    console.error('createContract error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function uploadContractFile(req: AuthRequest, res: Response) {
  try {
    const file = pickUploadedFile(req.files);
    if (!file)
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });

    const contractId = req.params['id'] as string;
    const url = await contractService.uploadContractFile(
      req.user!.userId, contractId, file.buffer, file.mimetype
    );
    res.json({ message: 'Contrato subido exitosamente.', contractFileUrl: url });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'CONTRACT_NOT_FOUND')
        return res.status(404).json({ error: 'Contrato no encontrado.' });
      if (err.message === 'CONTRACT_NOT_EDITABLE')
        return res.status(400).json({ error: 'El contrato no puede modificarse en su estado actual.' });
      if (err.message === 'STORAGE_UPLOAD_FAILED')
        return res.status(500).json({ error: 'Error al subir el archivo.' });
    }
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
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'CONTRACT_NOT_FOUND')
        return res.status(404).json({ error: 'Contrato no encontrado.' });
      if (err.message === 'CONTRACT_NOT_PENDING')
        return res.status(400).json({ error: 'El contrato ya fue procesado.' });
      if (err.message === 'CONTRACT_FILE_REQUIRED')
        return res.status(400).json({ error: 'La empresa debe subir el PDF del contrato antes de que puedas confirmarlo.' });
    }
    console.error('confirmContract error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function cancelContract(req: AuthRequest, res: Response) {
  try {
    const contract = await contractService.cancelContract(
      req.user!.userId, req.params['id'] as string
    );
    res.json({ message: 'Contrato cancelado.', contract });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'CONTRACT_NOT_FOUND')
        return res.status(404).json({ error: 'Contrato no encontrado.' });
      if (err.message === 'CONTRACT_NOT_CANCELLABLE')
        return res.status(400).json({ error: 'El contrato no puede cancelarse en su estado actual.' });
    }
    console.error('cancelContract error:', err);
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
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'CONTRACT_NOT_FOUND')
        return res.status(404).json({ error: 'Contrato no encontrado.' });
      if (err.message === 'UNAUTHORIZED')
        return res.status(403).json({ error: 'No tienes acceso a este contrato.' });
    }
    console.error('getContractById error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function createPayment(req: AuthRequest, res: Response) {
  try {
    const parsed = createPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: zodErrorMessage(parsed.error) ?? 'Datos inválidos.' });
    }

    const payment = await contractService.createPayment(
      req.user!.userId, req.params['id'] as string, parsed.data
    );
    res.status(201).json(payment);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'CONTRACT_NOT_FOUND')
        return res.status(404).json({ error: 'Contrato no encontrado.' });
      if (err.message === 'CONTRACT_NOT_ACTIVE')
        return res.status(400).json({ error: 'El contrato no está activo.' });
      if (err.message === 'PAYMENT_EXCEEDS_TOTAL')
        return res.status(400).json({ error: 'El monto supera el total pendiente del contrato.' });
      if (err.message === 'SINGLE_PAYMENT_LIMIT')
        return res.status(400).json({ error: 'Este contrato solo permite un pago único.' });
    }
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
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'PAYMENT_NOT_FOUND')
        return res.status(404).json({ error: 'Pago no encontrado.' });
      if (err.message === 'STORAGE_UPLOAD_FAILED')
        return res.status(500).json({ error: 'Error al subir el comprobante.' });
    }
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
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'CONTRACT_NOT_FOUND')
        return res.status(404).json({ error: 'Contrato no encontrado.' });
      if (err.message === 'CONTRACT_NOT_ACTIVE')
        return res.status(400).json({ error: 'El contrato no está activo.' });
      if (err.message === 'DELIVERABLES_PENDING')
        return res.status(400).json({ error: 'Hay entregables pendientes de aprobación.' });
      if (err.message === 'PAYMENTS_INCOMPLETE')
        return res.status(400).json({ error: 'Los pagos confirmados no cubren el monto total del contrato.' });
    }
    console.error('completeContract error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
