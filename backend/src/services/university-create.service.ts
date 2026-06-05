import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  buildUniversityEmail,
  generateUniversityPassword,
  generateUniversitySlug,
  resolveUniqueSlug,
} from '../lib/university-credentials';

export interface CreateUniversityResult {
  university: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: Date;
    institutionProfile: {
      id: string;
      institutionName: string;
      user: { id: string; email: string; isActive: boolean };
    };
  };
  generatedCredentials: { email: string; password: string };
}

export async function resolveSlugForName(name: string): Promise<string> {
  const baseSlug = generateUniversitySlug(name);
  const existing = await prisma.university.findMany({ select: { slug: true } });
  const slugs = new Set(existing.map(u => u.slug));
  return resolveUniqueSlug(baseSlug, slugs);
}

export async function createUniversityWithAccount(name: string): Promise<CreateUniversityResult> {
  const trimmedName = name.trim();
  const slug = await resolveSlugForName(trimmedName);
  const email = buildUniversityEmail(slug);
  const password = generateUniversityPassword(trimmedName, slug);

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw new Error('EMAIL_TAKEN');

  const existingName = await prisma.university.findUnique({
    where: { name: trimmedName },
  });
  if (existingName) throw new Error('UNIVERSITY_NAME_TAKEN');

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async tx => {
    const university = await tx.university.create({
      data: { name: trimmedName, slug },
    });

    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        role: Role.INSTITUTION,
        isVerified: true,
        isActive: true,
      },
    });

    const institutionProfile = await tx.institutionProfile.create({
      data: {
        userId: user.id,
        universityId: university.id,
        institutionName: trimmedName,
      },
      include: {
        user: { select: { id: true, email: true, isActive: true } },
      },
    });

    return { university, institutionProfile };
  });

  return {
    university: {
      id: result.university.id,
      name: result.university.name,
      slug: result.university.slug,
      isActive: result.university.isActive,
      createdAt: result.university.createdAt,
      institutionProfile: result.institutionProfile,
    },
    generatedCredentials: { email, password },
  };
}
