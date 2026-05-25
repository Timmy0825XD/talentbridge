import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { sendOtpEmail, sendResetEmail } from '../lib/mailer';

// Genera un código OTP de 6 dígitos
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── REGISTRO ────────────────────────────────────────────────────────────────

export async function registerUser(
  email: string,
  password: string,
  role: Role
) {
  // Verificar si el correo ya existe
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('EMAIL_TAKEN');

  // Hashear la contraseña con bcrypt (factor de costo 10)
  const passwordHash = await bcrypt.hash(password, 10);

  // Crear el usuario en la BD
  const user = await prisma.user.create({
    data: { email, passwordHash, role },
  });

  // Crear el OTP y guardarlo en la BD
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
  await prisma.otpCode.create({
    data: { code, userId: user.id, expiresAt },
  });

  // Enviar el correo con el OTP
  await sendOtpEmail(email, code);
  return { userId: user.id };
}

// ─── VERIFICACIÓN OTP ─────────────────────────────────────────────────────────

export async function verifyOtp(userId: string, code: string) {
  // Buscar OTP válido: mismo userId, mismo código, no usado, no expirado
  const otp = await prisma.otpCode.findFirst({
    where: {
      userId,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) throw new Error('OTP_INVALID');

  // Marcar OTP como usado y activar la cuenta
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { used: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { isVerified: true },
  });

  return { verified: true };
}

// ─── REENVÍO OTP ──────────────────────────────────────────────────────────────

export async function resendOtp(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('USER_NOT_FOUND');
  if (user.isVerified) throw new Error('ALREADY_VERIFIED');

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpCode.create({
    data: { code, userId, expiresAt },
  });

  await sendOtpEmail(user.email, code);
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('INVALID_CREDENTIALS');
  if (!user.isVerified) throw new Error('NOT_VERIFIED');
  if (!user.isActive) throw new Error('ACCOUNT_INACTIVE');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('INVALID_CREDENTIALS');

  const token = signToken({ userId: user.id, role: user.role });

  return { token, role: user.role, userId: user.id };
}

// ─── RECUPERACIÓN DE CONTRASEÑA ───────────────────────────────────────────────

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Siempre respondemos igual para no revelar si el email existe
  if (!user) return;

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

  await prisma.resetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  await sendResetEmail(email, token);
}

// ─── REENVÍO OTP PARA LOGIN NO VERIFICADO ─────────────────────────────────────

export async function resendOtpForUnverifiedEmail(email: string): Promise<{ userId?: string }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await resendOtp(user.id);
    return { userId: user.id };
  }
  return {};
}

// ─── RESET DE CONTRASEÑA ──────────────────────────────────────────────────────

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await prisma.resetToken.findFirst({
    where: {
      token,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!resetToken) throw new Error('TOKEN_INVALID');

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  });

  await prisma.resetToken.update({
    where: { id: resetToken.id },
    data: { used: true },
  });
}