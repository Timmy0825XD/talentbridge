import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Envía el código OTP de verificación de cuenta
export async function sendOtpEmail(to: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'TalentBridge — Verifica tu cuenta',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Verifica tu cuenta</h2>
        <p>Tu código de verificación es:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; 
                    color: #1e40af; padding: 16px; background: #eff6ff; 
                    border-radius: 8px; text-align: center;">
          ${code}
        </div>
        <p style="color: #6b7280; margin-top: 16px;">
          Este código expira en <strong>10 minutos</strong>.<br/>
          Si no solicitaste esto, ignora este correo.
        </p>
      </div>
    `,
  });
}

// Envía el enlace de recuperación de contraseña
export async function sendResetEmail(to: string, token: string): Promise<void> {
  const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'TalentBridge — Restablece tu contraseña',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <a href="${url}" 
           style="display: inline-block; padding: 12px 24px; background: #1e40af; 
                  color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Restablecer contraseña
        </a>
        <p style="color: #6b7280;">
          Este enlace expira en <strong>15 minutos</strong>.<br/>
          Si no solicitaste esto, ignora este correo.
        </p>
      </div>
    `,
  });
}