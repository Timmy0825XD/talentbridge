import { prisma } from '../lib/prisma';
import { supabase } from '../lib/supabase';
import { ContractStatus, PaymentStatus } from '@prisma/client';

// ─── CREAR CONTRATO ───────────────────────────────────────────────────────────

export async function createContract(
  userId: string,
  data: {
    jobId: string;
    candidateProfileId: string;
    title: string;
    description: string;
    deliverables: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    paymentScheme: string;
  }
) {
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) throw new Error('COMPANY_PROFILE_NOT_FOUND');

  // Verificar que el candidato existe
  const candidate = await prisma.candidateProfile.findUnique({
    where: { id: data.candidateProfileId },
  });
  if (!candidate) throw new Error('CANDIDATE_NOT_FOUND');

  // Verificar que la vacante pertenece a esta empresa
  const job = await prisma.job.findFirst({
    where: { id: data.jobId, companyId: company.id },
  });
  if (!job) throw new Error('JOB_NOT_FOUND');

  return prisma.contract.create({
    data: {
      jobId: data.jobId,
      candidateId: data.candidateProfileId,
      companyId: company.id,
      title: data.title,
      description: data.description,
      deliverables: data.deliverables,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      totalAmount: data.totalAmount,
      paymentScheme: data.paymentScheme,
    },
    include: {
      candidate: { select: { fullName: true, user: { select: { email: true } } } },
      company: { select: { companyName: true } },
      job: { select: { title: true } },
    },
  });
}

// ─── SUBIR PDF DEL CONTRATO ───────────────────────────────────────────────────

export async function uploadContractFile(
  userId: string,
  contractId: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  // Verificar que el contrato pertenece a la empresa
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) throw new Error('COMPANY_PROFILE_NOT_FOUND');

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, companyId: company.id },
  });
  if (!contract) throw new Error('CONTRACT_NOT_FOUND');

  const ext = mimeType === 'application/pdf' ? 'pdf'
    : mimeType === 'image/png' ? 'png' : 'jpg';
  const fileName = `contract_${contractId}.${ext}`;

  const { error } = await supabase.storage
    .from('contracts')
    .upload(fileName, fileBuffer, { contentType: mimeType, upsert: true });

  if (error) throw new Error('STORAGE_UPLOAD_FAILED');

  const { data } = supabase.storage.from('contracts').getPublicUrl(fileName);

  await prisma.contract.update({
    where: { id: contractId },
    data: { contractFileUrl: data.publicUrl },
  });

  return data.publicUrl;
}

// ─── CONFIRMAR CONTRATO (CANDIDATO) ──────────────────────────────────────────

export async function confirmContract(userId: string, contractId: string) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId } });
  if (!candidate) throw new Error('CANDIDATE_NOT_FOUND');

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, candidateId: candidate.id },
  });
  if (!contract) throw new Error('CONTRACT_NOT_FOUND');
  if (contract.status !== ContractStatus.PENDING_CANDIDATE)
    throw new Error('CONTRACT_NOT_PENDING');

  return prisma.contract.update({
    where: { id: contractId },
    data: {
      status: ContractStatus.ACTIVE,
      confirmedAt: new Date(),
    },
  });
}

// ─── MIS CONTRATOS ────────────────────────────────────────────────────────────

export async function getMyContracts(userId: string, role: string) {
  if (role === 'COMPANY') {
    const company = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!company) throw new Error('COMPANY_PROFILE_NOT_FOUND');

    return prisma.contract.findMany({
      where: { companyId: company.id },
      include: {
        candidate: { select: { fullName: true, photoUrl: true } },
        job: { select: { title: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  const candidate = await prisma.candidateProfile.findUnique({ where: { userId } });
  if (!candidate) throw new Error('CANDIDATE_NOT_FOUND');

  return prisma.contract.findMany({
    where: { candidateId: candidate.id },
    include: {
      company: { select: { companyName: true, logoUrl: true } },
      job: { select: { title: true } },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ─── DETALLE DEL CONTRATO ─────────────────────────────────────────────────────

export async function getContractById(userId: string, contractId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      candidate: {
        select: { fullName: true, photoUrl: true, user: { select: { email: true } } },
      },
      company: { select: { companyName: true, logoUrl: true } },
      job: { select: { title: true } },
      payments: true,
    },
  });

  if (!contract) throw new Error('CONTRACT_NOT_FOUND');

  // Verificar acceso — solo empresa o candidato del contrato
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId } });

  const hasAccess =
    company?.id === contract.companyId ||
    candidate?.id === contract.candidateId;

  if (!hasAccess) throw new Error('UNAUTHORIZED');

  return contract;
}

// ─── REGISTRAR PAGO ───────────────────────────────────────────────────────────

export async function createPayment(
  userId: string,
  contractId: string,
  data: { amount: number; description: string }
) {
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) throw new Error('COMPANY_PROFILE_NOT_FOUND');

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, companyId: company.id },
  });
  if (!contract) throw new Error('CONTRACT_NOT_FOUND');
  if (contract.status !== ContractStatus.ACTIVE)
    throw new Error('CONTRACT_NOT_ACTIVE');

  return prisma.payment.create({
    data: {
      contractId,
      amount: data.amount,
      description: data.description,
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
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) throw new Error('COMPANY_PROFILE_NOT_FOUND');

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

  const { error } = await supabase.storage
    .from('contracts')
    .upload(fileName, fileBuffer, { contentType: mimeType, upsert: true });

  if (error) throw new Error('STORAGE_UPLOAD_FAILED');

  const { data } = supabase.storage.from('contracts').getPublicUrl(fileName);

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      receiptUrl: data.publicUrl,
      status: PaymentStatus.CONFIRMED,
      confirmedAt: new Date(),
    },
  });

  return data.publicUrl;
}

// ─── COMPLETAR CONTRATO ───────────────────────────────────────────────────────

export async function completeContract(userId: string, contractId: string) {
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) throw new Error('COMPANY_PROFILE_NOT_FOUND');

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, companyId: company.id },
  });
  if (!contract) throw new Error('CONTRACT_NOT_FOUND');
  if (contract.status !== ContractStatus.ACTIVE)
    throw new Error('CONTRACT_NOT_ACTIVE');

  return prisma.contract.update({
    where: { id: contractId },
    data: { status: ContractStatus.COMPLETED },
  });
}