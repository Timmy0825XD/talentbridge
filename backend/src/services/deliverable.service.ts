import { prisma } from '../lib/prisma';
import {
  getCandidateOrThrow,
  getCompanyOrThrow,
  getContractForUser,
} from '../lib/access/profile-access';
import { parseOptionalDate } from '../lib/dates/parse-date';
import { uploadToStorage } from '../lib/storage/upload';
import { ContractStatus, DeliverableStatus } from '@prisma/client';
import type {
  CreateDeliverableInput,
  ReviewDeliverableInput,
  SubmitDeliverableInput,
} from '../lib/validators/contract.validators';

async function getDeliverableForCompany(deliverableId: string, userId: string) {
  const company = await getCompanyOrThrow(userId);

  const deliverable = await prisma.deliverable.findFirst({
    where: {
      id: deliverableId,
      contract: { companyId: company.id },
    },
    include: { contract: true },
  });
  if (!deliverable) throw new Error('DELIVERABLE_NOT_FOUND');
  return deliverable;
}

async function getDeliverableForCandidate(deliverableId: string, userId: string) {
  const candidate = await getCandidateOrThrow(userId);

  const deliverable = await prisma.deliverable.findFirst({
    where: {
      id: deliverableId,
      contract: { candidateId: candidate.id },
    },
    include: { contract: true },
  });
  if (!deliverable) throw new Error('DELIVERABLE_NOT_FOUND');
  return deliverable;
}

// ─── LISTAR ENTREGABLES ───────────────────────────────────────────────────────

export async function getDeliverables(userId: string, contractId: string) {
  await getContractForUser(contractId, userId);

  return prisma.deliverable.findMany({
    where: { contractId },
    orderBy: { createdAt: 'asc' },
  });
}

// ─── CREAR ENTREGABLE ─────────────────────────────────────────────────────────

export async function createDeliverable(
  userId: string,
  contractId: string,
  data: CreateDeliverableInput
) {
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

  return prisma.deliverable.create({
    data: {
      contractId,
      title: data.title,
      description: data.description ?? '',
      dueDate: parseOptionalDate(data.dueDate),
    },
  });
}

// ─── ENVIAR ENTREGABLE (CANDIDATO) ────────────────────────────────────────────

export async function submitDeliverable(
  userId: string,
  deliverableId: string,
  data: SubmitDeliverableInput,
  fileBuffer?: Buffer,
  mimeType?: string
) {
  const deliverable = await getDeliverableForCandidate(deliverableId, userId);

  if (deliverable.contract.status !== ContractStatus.ACTIVE) {
    throw new Error('CONTRACT_NOT_ACTIVE');
  }

  if (
    deliverable.status !== DeliverableStatus.PENDING &&
    deliverable.status !== DeliverableStatus.REJECTED
  ) {
    throw new Error('DELIVERABLE_NOT_SUBMITTABLE');
  }

  let fileUrl = deliverable.fileUrl;

  if (fileBuffer && mimeType) {
    const ext = mimeType === 'application/pdf' ? 'pdf'
      : mimeType === 'image/png' ? 'png' : 'jpg';
    const fileName = `deliverable_${deliverableId}.${ext}`;

    fileUrl = await uploadToStorage({
      bucket: 'contracts',
      fileName,
      buffer: fileBuffer,
      mimeType,
    });
  }

  return prisma.deliverable.update({
    where: { id: deliverableId },
    data: {
      status: DeliverableStatus.SUBMITTED,
      candidateNotes: data.candidateNotes ?? deliverable.candidateNotes,
      fileUrl,
      submittedAt: new Date(),
      companyFeedback: null,
      reviewedAt: null,
    },
  });
}

// ─── REVISAR ENTREGABLE (EMPRESA) ─────────────────────────────────────────────

export async function reviewDeliverable(
  userId: string,
  deliverableId: string,
  data: ReviewDeliverableInput
) {
  const deliverable = await getDeliverableForCompany(deliverableId, userId);

  if (deliverable.contract.status !== ContractStatus.ACTIVE) {
    throw new Error('CONTRACT_NOT_ACTIVE');
  }

  if (deliverable.status !== DeliverableStatus.SUBMITTED) {
    throw new Error('DELIVERABLE_NOT_REVIEWABLE');
  }

  return prisma.deliverable.update({
    where: { id: deliverableId },
    data: {
      status: data.status as DeliverableStatus,
      companyFeedback: data.companyFeedback ?? '',
      reviewedAt: new Date(),
    },
  });
}
