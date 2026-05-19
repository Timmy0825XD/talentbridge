import { prisma } from '../lib/prisma';
import axios from 'axios';

// ─── OBTENER CANDIDATOS PARA NOTIFICAR ───────────────────────────────────────
// Devuelve candidatos compatibles con la vacante que tienen notificaciones activas

export async function getCandidatesToNotify(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { company: { select: { companyName: true } } },
  });

  if (!job) throw new Error('JOB_NOT_FOUND');

  // Obtener candidatos con score >= 60 y notificaciones habilitadas
  const candidates = await prisma.candidateProfile.findMany({
    where: {
      notificationsEnabled: true,
      telegramChatId: { not: null },
    },
    include: {
      score: { select: { totalScore: true } },
      user: { select: { email: true } },
    },
  });

  // Filtrar por score mínimo de 50
  const eligible = candidates.filter(c =>
    (c.score?.totalScore ?? 0) >= 50
  );

  return {
    job,
    candidates: eligible.map(c => ({
      candidateId: c.id,
      fullName: c.fullName,
      telegramChatId: c.telegramChatId,
      notificationChannel: c.notificationChannel,
      score: Math.round(c.score?.totalScore ?? 0),
    })),
  };
}

// ─── DISPARAR WEBHOOK A N8N ──────────────────────────────────────────────────

export async function triggerNotificationWebhook(jobId: string): Promise<void> {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!n8nWebhookUrl) {
    console.log('N8N_WEBHOOK_URL no configurada — notificaciones deshabilitadas');
    return;
  }

  try {
    await axios.post(n8nWebhookUrl, { jobId }, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(`Webhook disparado para vacante ${jobId}`);
  } catch (err: any) {
    // Fallo silencioso — no afecta la publicación de la vacante
    console.log('Webhook n8n falló (no crítico):', err.message);
  }
}

// ─── REGISTRAR TELEGRAM CHAT ID ──────────────────────────────────────────────

export async function registerTelegramChatId(
  userId: string,
  chatId: string
): Promise<void> {
  await prisma.candidateProfile.upsert({
    where: { userId },
    update: {
      telegramChatId: chatId,
      notificationsEnabled: true,
      notificationChannel: 'telegram',
    },
    create: {
      userId,
      telegramChatId: chatId,
      notificationsEnabled: true,
      notificationChannel: 'telegram',
    },
  });
  console.log(`Telegram chatId ${chatId} registrado para usuario ${userId}`);
}

// ─── ACTUALIZAR PREFERENCIAS DE NOTIFICACIÓN ─────────────────────────────────

export async function updateNotificationPreferences(
  userId: string,
  enabled: boolean
): Promise<void> {
  await prisma.candidateProfile.update({
    where: { userId },
    data: { notificationsEnabled: enabled },
  });
}