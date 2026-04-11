import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import * as authService from '../services/auth.service';
import { prisma } from '../lib/prisma';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, role } = req.body;
    const result = await authService.registerUser(email, password, role as Role);
    res.status(201).json({
      message: 'Usuario creado. Revisa tu correo para verificar tu cuenta.',
      userId: result.userId,
    });
  } catch (err: any) {
    if (err.message === 'EMAIL_TAKEN')
      return res.status(409).json({ error: 'El correo ya está registrado.' });
    console.error('register error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { userId, code } = req.body;
    await authService.verifyOtp(userId, code);
    res.json({ message: 'Cuenta verificada exitosamente.' });
  } catch (err: any) {
    if (err.message === 'OTP_INVALID')
      return res.status(400).json({ error: 'Código inválido o expirado.' });
    console.error('verifyOtp error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function resendOtp(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    await authService.resendOtp(userId);
    res.json({ message: 'Código reenviado. Revisa tu correo.' });
  } catch (err: any) {
    if (err.message === 'USER_NOT_FOUND')
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    if (err.message === 'ALREADY_VERIFIED')
      return res.status(400).json({ error: 'La cuenta ya está verificada.' });
    console.error('resendOtp error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'INVALID_CREDENTIALS')
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });

    if (err.message === 'NOT_VERIFIED') {
      try {
        // Buscar el usuario y reenviar OTP automáticamente
        const user = await prisma.user.findUnique({
          where: { email: req.body.email },
        });
        if (user) {
          await authService.resendOtp(user.id);
        }
        return res.status(403).json({
          error: 'Debes verificar tu correo primero. Te enviamos un nuevo código.',
          code: 'NOT_VERIFIED',
          userId: user?.id,
        });
      } catch (resendErr) {
        console.error('resendOtp en login error:', resendErr);
        return res.status(403).json({
          error: 'Debes verificar tu correo primero.',
          code: 'NOT_VERIFIED',
        });
      }
    }

    if (err.message === 'ACCOUNT_INACTIVE')
      return res.status(403).json({ error: 'Tu cuenta ha sido suspendida.' });
    console.error('login error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function logout(_req: Request, res: Response) {
  res.json({ message: 'Sesión cerrada correctamente.' });
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({
      message: 'Si el correo existe, recibirás un enlace de recuperación.',
    });
  } catch (err: any) {
    console.error('forgotPassword error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.json({ message: 'Contraseña restablecida exitosamente.' });
  } catch (err: any) {
    if (err.message === 'TOKEN_INVALID')
      return res.status(400).json({ error: 'Enlace inválido o expirado.' });
    console.error('resetPassword error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}