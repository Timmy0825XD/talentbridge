import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import {
  buildOtpEmailHtml,
  buildOtpEmailText,
  buildResetEmailHtml,
  buildResetEmailText,
} from './email-templates';

dotenv.config();

const SMTP_ENV_KEYS = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
] as const;

function assertSmtpEnv(): void {
  const missing = SMTP_ENV_KEYS.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `Configuración SMTP incompleta. Faltan: ${missing.join(', ')}`
    );
  }
}

assertSmtpEnv();

/** Host con certificado TLS válido (el relay SA aún expone sendinblue.com, no brevo.com). */
function resolveSmtpHost(): { connectHost: string; tlsServername: string } {
  const raw = process.env.SMTP_HOST!.trim().replace(/\.$/, '');
  if (raw === 'smtp-relay.brevo.com') {
    return {
      connectHost: 'smtp-relay.sendinblue.com',
      tlsServername: 'smtp-relay.sendinblue.com',
    };
  }
  return { connectHost: raw, tlsServername: raw };
}

const { connectHost, tlsServername } = resolveSmtpHost();

const transporter = nodemailer.createTransport({
  host: connectHost,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    servername: tlsServername,
  },
});

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'TalentBridge — Verifica tu cuenta',
    html: buildOtpEmailHtml(code),
    text: buildOtpEmailText(code),
  });
}

export async function sendResetEmail(to: string, token: string): Promise<void> {
  const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'TalentBridge — Restablece tu contraseña',
    html: buildResetEmailHtml(url),
    text: buildResetEmailText(url),
  });
}
