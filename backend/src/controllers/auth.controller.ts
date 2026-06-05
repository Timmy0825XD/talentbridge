import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { asyncHandler } from '../lib/errors/async-handler';
import { handleServiceError } from '../lib/errors/handle-service-error';
import { authErrorMap } from '../lib/errors/error-maps/auth.errors';
import * as authService from '../services/auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const result = await authService.registerUser(email, password, role as Role);
  res.status(201).json({
    message: 'Usuario creado. Revisa tu correo para verificar tu cuenta.',
    userId: result.userId,
  });
}, authErrorMap, 'register');

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { userId, code } = req.body;
  await authService.verifyOtp(userId, code);
  res.json({ message: 'Cuenta verificada exitosamente.' });
}, authErrorMap, 'verifyOtp');

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;
  await authService.resendOtp(userId);
  res.json({ message: 'Código reenviado. Revisa tu correo.' });
}, authErrorMap, 'resendOtp');

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'NOT_VERIFIED') {
      try {
        const { userId } = await authService.resendOtpForUnverifiedEmail(email);
        return res.status(403).json({
          error: 'Debes verificar tu correo primero. Te enviamos un nuevo código.',
          code: 'NOT_VERIFIED',
          userId,
        });
      } catch (resendErr) {
        console.error('resendOtp en login error:', resendErr);
        return res.status(403).json({
          error: 'Debes verificar tu correo primero.',
          code: 'NOT_VERIFIED',
        });
      }
    }

    if (handleServiceError(err, res, authErrorMap, 'login')) return;
    console.error('login error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export function logout(_req: Request, res: Response) {
  res.json({ message: 'Sesión cerrada correctamente.' });
}

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  res.json({
    message: 'Si el correo existe, recibirás un enlace de recuperación.',
  });
}, undefined, 'forgotPassword');

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  res.json({ message: 'Contraseña restablecida exitosamente.' });
}, authErrorMap, 'resetPassword');
