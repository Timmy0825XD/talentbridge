/** Tokens alineados con frontend/app/globals.css y páginas auth */
const BRAND = {
  primary: '#00386c',
  primaryContainer: '#1a4f8b',
  secondary: '#006d37',
  accent: '#6bfe9c',
  accentDim: '#4ae183',
  primaryFixed: '#d5e3ff',
  background: '#f7f9fb',
  surface: '#ffffff',
  onSurface: '#191c1e',
  muted: '#424750',
  outline: '#737781',
  border: '#e0e3e5',
  pageBg: '#e8edf3',
} as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function emailShell(options: {
  preheader: string;
  badge: string;
  title: string;
  intro: string;
  body: string;
  footerNote: string;
}): string {
  const siteUrl = (process.env.FRONTEND_URL ?? 'https://talentbridge.co').replace(/\/$/, '');
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(options.title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet" />
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.pageBg};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;color:transparent;">
    ${escapeHtml(options.preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.pageBg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
          <!-- Header -->
          <tr>
            <td style="border-radius:24px 24px 0 0;overflow:hidden;background:linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryContainer} 55%, #0c4783 100%);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:28px 32px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:12px;">
                          <div style="width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);text-align:center;line-height:44px;">
                            <span style="font-family:'Manrope',Arial,sans-serif;font-size:14px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">TB</span>
                          </div>
                        </td>
                        <td style="vertical-align:middle;">
                          <span style="font-family:'Manrope',Arial,sans-serif;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">TalentBridge</span>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:20px 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.accent};">
                      ${escapeHtml(options.badge)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body card -->
          <tr>
            <td style="background-color:${BRAND.surface};border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:36px 32px 8px;">
                    <h1 style="margin:0 0 12px;font-family:'Manrope',Arial,sans-serif;font-size:26px;font-weight:800;line-height:1.2;color:${BRAND.primary};letter-spacing:-0.4px;">
                      ${escapeHtml(options.title)}
                    </h1>
                    <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:16px;line-height:1.6;color:${BRAND.muted};">
                      ${options.intro}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px 32px;">
                    ${options.body}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND.background};border:1px solid ${BRAND.border};border-top:none;border-radius:0 0 24px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:24px 32px 28px;text-align:center;">
                    <p style="margin:0 0 8px;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.5;color:${BRAND.outline};">
                      ${escapeHtml(options.footerNote)}
                    </p>
                    <p style="margin:0 0 16px;font-family:'Manrope',Arial,sans-serif;font-size:13px;font-weight:700;color:${BRAND.primary};">
                      Conecta el talento universitario del Cesar
                    </p>
                    <a href="${escapeHtml(siteUrl)}" style="font-family:'DM Sans',Arial,sans-serif;font-size:13px;font-weight:600;color:${BRAND.secondary};text-decoration:none;">
                      ${escapeHtml(siteUrl.replace(/^https?:\/\//, ''))}
                    </a>
                    <p style="margin:20px 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:${BRAND.outline};">
                      &copy; ${year} TalentBridge. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildOtpEmailHtml(code: string): string {
  const safeCode = escapeHtml(code);

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:8px 0 20px;">
          <p style="margin:0 0 14px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:600;color:${BRAND.muted};text-align:center;">
            Tu código de verificación
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(180deg, ${BRAND.primaryFixed} 0%, #eef4ff 100%);border:2px solid ${BRAND.primary};border-radius:16px;">
            <tr>
              <td style="padding:22px 40px;">
                <span style="font-family:'Manrope',Arial,sans-serif;font-size:36px;font-weight:800;letter-spacing:10px;color:${BRAND.primary};">
                  ${safeCode}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background-color:${BRAND.background};border-radius:12px;border:1px solid ${BRAND.border};padding:16px 18px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="28" style="vertical-align:top;padding-right:10px;">
                <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background-color:${BRAND.accent};color:${BRAND.secondary};font-family:'Manrope',Arial,sans-serif;font-size:12px;font-weight:800;line-height:22px;text-align:center;">!</span>
              </td>
              <td style="vertical-align:top;">
                <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.55;color:${BRAND.muted};">
                  El código expira en <strong style="color:${BRAND.primary};">10 minutos</strong>.
                  No lo compartas con nadie.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

  return emailShell({
    preheader: `Tu código TalentBridge es ${code}. Válido por 10 minutos.`,
    badge: 'Verificación de cuenta',
    title: 'Verifica tu cuenta',
    intro:
      'Gracias por registrarte en <strong style="color:#00386c;">TalentBridge</strong>. ' +
      'Ingresa este código en la pantalla de verificación para activar tu perfil.',
    body,
    footerNote: 'Si no creaste una cuenta, puedes ignorar este correo con tranquilidad.',
  });
}

export function buildResetEmailHtml(resetUrl: string): string {
  const safeUrl = escapeHtml(resetUrl);

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:8px 0 24px;">
          <a href="${safeUrl}" target="_blank" style="display:inline-block;padding:16px 36px;background-color:${BRAND.primary};color:#ffffff;font-family:'Manrope',Arial,sans-serif;font-size:15px;font-weight:700;text-decoration:none;border-radius:999px;box-shadow:0 8px 24px rgba(0,56,108,0.22);">
            Restablecer contraseña
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:8px;">
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.6;color:${BRAND.outline};text-align:center;">
            ¿El botón no funciona? Copia y pega este enlace en tu navegador:
          </p>
        </td>
      </tr>
      <tr>
        <td style="background-color:${BRAND.background};border:1px solid ${BRAND.border};border-radius:10px;padding:14px 16px;word-break:break-all;">
          <a href="${safeUrl}" style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;line-height:1.5;color:${BRAND.primaryContainer};text-decoration:underline;">
            ${safeUrl}
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding-top:20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.background};border-radius:12px;border:1px solid ${BRAND.border};">
            <tr>
              <td style="padding:16px 18px;">
                <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.55;color:${BRAND.muted};">
                  Este enlace expira en <strong style="color:${BRAND.primary};">15 minutos</strong>
                  y solo puede usarse una vez.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

  return emailShell({
    preheader: 'Restablece tu contraseña de TalentBridge. El enlace caduca en 15 minutos.',
    badge: 'Recuperación de acceso',
    title: 'Restablece tu contraseña',
    intro:
      'Recibimos una solicitud para cambiar la contraseña de tu cuenta. ' +
      'Si fuiste tú, usa el botón siguiente para continuar.',
    body,
    footerNote: 'Si no solicitaste este cambio, ignora este correo; tu contraseña no se modificará.',
  });
}

export function buildOtpEmailText(code: string): string {
  return [
    'TalentBridge — Verifica tu cuenta',
    '',
    `Tu código de verificación es: ${code}`,
    '',
    'El código expira en 10 minutos.',
    'Si no solicitaste esto, ignora este correo.',
    '',
    process.env.FRONTEND_URL ?? '',
  ].join('\n');
}

export function buildResetEmailText(resetUrl: string): string {
  return [
    'TalentBridge — Restablece tu contraseña',
    '',
    'Usa este enlace para crear una nueva contraseña:',
    resetUrl,
    '',
    'El enlace expira en 15 minutos.',
    'Si no solicitaste esto, ignora este correo.',
  ].join('\n');
}
