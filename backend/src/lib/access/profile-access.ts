import { prisma } from '../prisma';

export async function getCompanyByUserId(userId: string) {
  return prisma.companyProfile.findUnique({ where: { userId } });
}

export async function getCandidateByUserId(userId: string) {
  return prisma.candidateProfile.findUnique({ where: { userId } });
}

export async function getCompanyOrThrow(userId: string) {
  const company = await getCompanyByUserId(userId);
  if (!company) throw new Error('COMPANY_PROFILE_NOT_FOUND');
  return company;
}

export async function getCandidateOrThrow(userId: string) {
  const candidate = await getCandidateByUserId(userId);
  if (!candidate) throw new Error('CANDIDATE_NOT_FOUND');
  return candidate;
}

export async function assertContractAccess(
  userId: string,
  contract: { companyId: string; candidateId: string }
) {
  const company = await getCompanyByUserId(userId);
  const candidate = await getCandidateByUserId(userId);

  const hasAccess =
    company?.id === contract.companyId ||
    candidate?.id === contract.candidateId;

  if (!hasAccess) throw new Error('UNAUTHORIZED');
}

export async function getContractForUser(contractId: string, userId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      company: { select: { userId: true, id: true } },
      candidate: { select: { userId: true, id: true } },
    },
  });
  if (!contract) throw new Error('CONTRACT_NOT_FOUND');

  await assertContractAccess(userId, contract);
  return contract;
}
