import axios from 'axios';
import dotenv from 'dotenv';
import {
  buildOtpEmailHtml,
  buildOtpEmailText,
  buildResetEmailHtml,
  buildResetEmailText,
} from './email-templates';

dotenv.config();

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

function resolveSender(): { name: string; email: string } | null {
  const raw =
    process.env.BREVO_SENDER_EMAIL?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    '';

  if (!raw) return null;

  const withName = raw.match(/^(.+?)\s*<([^>]+)>$/);
  if (withName) {
    return { name: withName[1].trim(), email: withName[2].trim() };
  }

  return {
    name: process.env.BREVO_SENDER_NAME?.trim() || 'TalentBridge',
    email: raw,
  };
}

function assertBrevoEnv(): void {
  const missing: string[] = [];
  if (!process.env.BREVO_API_KEY?.trim()) missing.push('BREVO_API_KEY');
  if (!resolveSender()) missing.push('BREVO_SENDER_EMAIL (o SMTP_FROM)');
  if (missing.length > 0) {
    throw new Error(
      `Configuración Brevo incompleta. Faltan: ${missing.join(', ')}`
    );
  }
}

assertBrevoEnv();

async function sendBrevoEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const sender = resolveSender()!;

  await axios.post(
    BREVO_API_URL,
    {
      sender: { name: sender.name, email: sender.email },
      to: [{ email: params.to }],
      subject: params.subject,
      htmlContent: params.html,
      textContent: params.text,
    },
    {
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 30_000,
    }
  );
}

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  await sendBrevoEmail({
    to,
    subject: 'TalentBridge — Verifica tu cuenta',
    html: buildOtpEmailHtml(code),
    text: buildOtpEmailText(code),
  });
}

export async function sendResetEmail(to: string, token: string): Promise<void> {
  const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

  await sendBrevoEmail({
    to,
    subject: 'TalentBridge — Restablece tu contraseña',
    html: buildResetEmailHtml(url),
    text: buildResetEmailText(url),
  });
}
