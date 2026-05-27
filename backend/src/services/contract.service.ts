import { prisma } from '../lib/prisma';
import { computePaymentTotals } from '../lib/contract-helpers';
import {
  assertContractAccess,
  getCandidateOrThrow,
  getCompanyOrThrow,
} from '../lib/access/profile-access';
import { parseOptionalDate } from '../lib/dates/parse-date';
import { uploadToStorage } from '../lib/storage/upload';
import {
  ContractStatus,
  DeliverableStatus,
  PaymentScheme,
  PaymentStatus,
} from '@prisma/client';
import type { CreateContractInput, CreatePaymentInput } from '../lib/validators/contract.validators';

const contractInclude = {
  candidate: {
    select: {
      fullName: true,
      photoUrl: true,
      user: { select: { email: true } },
    },
  },
  company: { select: { companyName: true, logoUrl: true } },
  job: { select: { title: true } },
  payments: { orderBy: { sequence: 'asc' as const } },
  deliverableItems: { orderBy: { createdAt: 'asc' as const } },
  _count: { select: { payments: true, deliverableItems: true } },
};

function enrichContract<T extends { totalAmount: number; payments: { amount: number; status: PaymentStatus }[] }>(
  contract: T
) {
  const totals = computePaymentTotals(contract.payments, contract.totalAmount);
  return { ...contract, ...totals };
}

// ─── CREAR CONTRATO ───────────────────────────────────────────────────────────

export async function createContract(userId: string, data: CreateContractInput) {
  const company = await getCompanyOrThrow(userId);

  const candidate = await prisma.candidateProfile.findUnique({
    where: { id: data.candidateId },
  });
  if (!candidate) throw new Error('CANDIDATE_NOT_FOUND');

  let jobId = data.jobId;
  let applicationId: string | undefined;

  const application = await prisma.application.findFirst({
    where: {
      candidateId: candidate.id,
      status: 'SELECTED',
      job: { companyId: company.id, ...(jobId ? { id: jobId } : {}) },
    },
    select: { id: true, jobId: true },
  });

  if (!application) throw new Error('APPLICATION_NOT_SELECTED');
  jobId = application.jobId;
  applicationId = application.id;

  const existing = await prisma.contract.findFirst({
    where: {
      jobId,
      candidateId: candidate.id,
      status: { not: ContractStatus.CANCELLED },
    },
  });
  if (existing) throw new Error('CONTRACT_ALREADY_EXISTS');

  const job = await prisma.job.findFirst({
    where: { id: jobId, companyId: company.id },
  });
  if (!job) throw new Error('JOB_NOT_FOUND');

  const contract = await prisma.$transaction(async tx => {
    const created = await tx.contract.create({
      data: {
        jobId,
        candidateId: candidate.id,
        companyId: company.id,
        applicationId,
        title: data.title,
        description: data.description ?? '',
        deliverables: data.deliverables ?? '',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        totalAmount: data.totalAmount,
        paymentScheme: (data.paymentScheme as PaymentScheme) ?? PaymentScheme.SINGLE,
      },
      include: contractInclude,
    });

    if (data.items?.length) {
      await tx.deliverable.createMany({
        data: data.items.map(item => ({
          contractId: created.id,
          title: item.title,
          description: item.description ?? '',
          dueDate: parseOptionalDate(item.dueDate),
        })),
      });
    }

    if (job.status === 'ACTIVE') {
      await tx.job.update({
        where: { id: jobId },
        data: { status: 'SELECTING' },
      });
    }

    return created;
  });

  const full = await prisma.contract.findUnique({
    where: { id: contract.id },
    include: contractInclude,
  });

  return enrichContract(full!);
}

// ─── SUBIR PDF DEL CONTRATO ───────────────────────────────────────────────────

export async function uploadContractFile(
  userId: string,
  contractId: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const company = await getCompanyOrThrow(userId);

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, companyId: company.id },
  });
  if (!contract) throw new Error('CONTRACT_NOT_FOUND');

  if (
    contract.status !== ContractStatus.PENDING_CANDIDATE &&
    contract.status !== ContractStatus.ACTIVE
  ) {
    throw new Error('CONTRACT_NOT_EDITABLE');
  }

  const ext = mimeType === 'application/pdf' ? 'pdf'
    : mimeType === 'image/png' ? 'png' : 'jpg';
  const fileName = `contract_${contractId}.${ext}`;

  const publicUrl = await uploadToStorage({
    bucket: 'contracts',
    fileName,
    buffer: fileBuffer,
    mimeType,
  });

  await prisma.contract.update({
    where: { id: contractId },
    data: { contractFileUrl: publicUrl },
  });

  return publicUrl;
}

// ─── CONFIRMAR CONTRATO (CANDIDATO) ──────────────────────────────────────────

export async function confirmContract(userId: string, contractId: string) {
  const candidate = await getCandidateOrThrow(userId);

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, candidateId: candidate.id },
  });
  if (!contract) throw new Error('CONTRACT_NOT_FOUND');
  if (contract.status !== ContractStatus.PENDING_CANDIDATE)
    throw new Error('CONTRACT_NOT_PENDING');
  if (!contract.contractFileUrl) throw new Error('CONTRACT_FILE_REQUIRED');

  const updated = await prisma.contract.update({
    where: { id: contractId },
    data: {
      status: ContractStatus.ACTIVE,
      confirmedAt: new Date(),
    },
    include: contractInclude,
  });

  return enrichContract(updated);
}

// ─── CANCELAR CONTRATO ───────────────────────────────────────────────────────

export async function cancelContract(userId: string, contractId: string) {
  const company = await getCompanyOrThrow(userId);

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, companyId: company.id },
  });
  if (!contract) throw new Error('CONTRACT_NOT_FOUND');

  if (
    contract.status !== ContractStatus.PENDING_CANDIDATE &&
    contract.status !== ContractStatus.ACTIVE
  ) {
    throw new Error('CONTRACT_NOT_CANCELLABLE');
  }

  const updated = await prisma.contract.update({
    where: { id: contractId },
    data: {
      status: ContractStatus.CANCELLED,
      cancelledAt: new Date(),
    },
    include: contractInclude,
  });

  return enrichContract(updated);
}

// ─── MIS CONTRATOS ────────────────────────────────────────────────────────────

export async function getMyContracts(userId: string, role: string) {
  let contracts;

  if (role === 'COMPANY') {
    const company = await getCompanyOrThrow(userId);
    contracts = await prisma.contract.findMany({
      where: { companyId: company.id },
      include: contractInclude,
      orderBy: { createdAt: 'desc' },
    });
  } else {
    const candidate = await getCandidateOrThrow(userId);
    contracts = await prisma.contract.findMany({
      where: { candidateId: candidate.id },
      include: contractInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  return contracts.map(enrichContract);
}

// ─── DETALLE DEL CONTRATO ─────────────────────────────────────────────────────

export async function getContractById(userId: string, contractId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: contractInclude,
  });

  if (!contract) throw new Error('CONTRACT_NOT_FOUND');
  await assertContractAccess(userId, contract);

  return enrichContract(contract);
}

// ─── REGISTRAR PAGO ───────────────────────────────────────────────────────────

export async function createPayment(
  userId: string,
  contractId: string,
  data: CreatePaymentInput
) {
  const company = await getCompanyOrThrow(userId);

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, companyId: company.id },
    include: { payments: true },
  });
  if (!contract) throw new Error('CONTRACT_NOT_FOUND');
  if (contract.status !== ContractStatus.ACTIVE)
    throw new Error('CONTRACT_NOT_ACTIVE');

  if (contract.paymentScheme === PaymentScheme.SINGLE && contract.payments.length >= 1) {
    throw new Error('SINGLE_PAYMENT_LIMIT');
  }

  const totals = computePaymentTotals(contract.payments, contract.totalAmount);
  if (totals.pendingAmount + totals.paidAmount + data.amount > contract.totalAmount) {
    throw new Error('PAYMENT_EXCEEDS_TOTAL');
  }

  const nextSequence = contract.payments.length > 0
    ? Math.max(...contract.payments.map(p => p.sequence)) + 1
    : 1;

  return prisma.payment.create({
    data: {
      contractId,
      amount: data.amount,
      description: data.description ?? '',
      dueDate: parseOptionalDate(data.dueDate),
      sequence: data.sequence ?? nextSequence,
    },
  });
}

// ─── SUBIR COMPROBANTE DE PAGO ────────────────────────────────────────────────

export async function uploadPaymentReceipt(
  userId: string,
  paymentId: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const company = await getCompanyOrThrow(userId);

  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      contract: { companyId: company.id },
    },
  });
  if (!payment) throw new Error('PAYMENT_NOT_FOUND');

  const ext = mimeType === 'application/pdf' ? 'pdf'
    : mimeType === 'image/png' ? 'png' : 'jpg';
  const fileName = `receipt_${paymentId}.${ext}`;

  const publicUrl = await uploadToStorage({
    bucket: 'contracts',
    fileName,
    buffer: fileBuffer,
    mimeType,
  });

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      receiptUrl: publicUrl,
      status: PaymentStatus.CONFIRMED,
      confirmedAt: new Date(),
    },
  });

  return publicUrl;
}

// ─── COMPLETAR CONTRATO ───────────────────────────────────────────────────────

export async function completeContract(userId: string, contractId: string) {
  const company = await getCompanyOrThrow(userId);

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, companyId: company.id },
    include: {
      payments: true,
      deliverableItems: true,
    },
  });
  if (!contract) throw new Error('CONTRACT_NOT_FOUND');
  if (contract.status !== ContractStatus.ACTIVE)
    throw new Error('CONTRACT_NOT_ACTIVE');

  if (contract.deliverableItems.length > 0) {
    const pending = contract.deliverableItems.filter(
      d => d.status !== DeliverableStatus.APPROVED
    );
    if (pending.length > 0) throw new Error('DELIVERABLES_PENDING');
  }

  const totals = computePaymentTotals(contract.payments, contract.totalAmount);
  if (contract.totalAmount > 0 && totals.paidAmount < contract.totalAmount) {
    throw new Error('PAYMENTS_INCOMPLETE');
  }

  const updated = await prisma.contract.update({
    where: { id: contractId },
    data: {
      status: ContractStatus.COMPLETED,
      completedAt: new Date(),
    },
    include: contractInclude,
  });

  const enriched = enrichContract(updated);
  const ratings = await prisma.contractRating.findMany({
    where: { contractId },
    select: { raterRole: true },
  });

  return {
    ...enriched,
    ratingsPending: ratings.length < 2,
  };
}
