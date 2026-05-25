import { prisma } from '../lib/prisma';
import { supabase } from '../lib/supabase';
import { ContractStatus, DeliverableStatus } from '@prisma/client';
import type {
  CreateDeliverableInput,
  ReviewDeliverableInput,
  SubmitDeliverableInput,
} from '../lib/validators/contract.validators';

function parseOptionalDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('INVALID_DATE');
  return date;
}

async function getContractForUser(contractId: string, userId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      company: { select: { userId: true, id: true } },
      candidate: { select: { userId: true, id: true } },
    },
  });
  if (!contract) throw new Error('CONTRACT_NOT_FOUND');

  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId } });

  const hasAccess =
    company?.id === contract.companyId ||
    candidate?.id === contract.candidateId;

  if (!hasAccess) throw new Error('UNAUTHORIZED');
  return contract;
}

async function getDeliverableForCompany(deliverableId: string, userId: string) {
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) throw new Error('COMPANY_PROFILE_NOT_FOUND');

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
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId } });
  if (!candidate) throw new Error('CANDIDATE_NOT_FOUND');

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
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) throw new Error('COMPANY_PROFILE_NOT_FOUND');

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

    const { error } = await supabase.storage
      .from('contracts')
      .upload(fileName, fileBuffer, { contentType: mimeType, upsert: true });

    if (error) throw new Error('STORAGE_UPLOAD_FAILED');

    const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(fileName);
    fileUrl = urlData.publicUrl;
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
