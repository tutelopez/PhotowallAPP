import { transporter } from '../config/mailer';
import { PLAN_LABELS, PlanType, PLAN_PRICES_COP } from '../models/Plan';

const FROM = `"${process.env.SMTP_FROM_NAME || 'PhotoWall'}" <${process.env.SMTP_USER}>`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

const wrapTemplate = (title: string, bodyHtml: string) => `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#0D0D14; font-family:'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D14; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px; background:#17161F; border:1px solid rgba(255,255,255,0.08); border-radius:16px; overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#7C3AED,#A78BFA); padding:28px 32px;">
              <span style="color:#F8F7FF; font-size:22px; font-weight:700; letter-spacing:-0.5px;">PhotoWall</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="color:#F8F7FF; font-size:20px; margin:0 0 16px;">${title}</h1>
              <div style="color:rgba(248,247,255,0.75); font-size:14.5px; line-height:1.6;">
                ${bodyHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px; border-top:1px solid rgba(255,255,255,0.06);">
              <span style="color:rgba(248,247,255,0.35); font-size:12px;">
                Recibiste este correo porque tienes una cuenta en PhotoWall.
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const sendWelcomeEmail = async (user: { name: string; email: string }) => {
  try {
    const html = wrapTemplate(
      `¡Bienvenido a PhotoWall, ${user.name}! 🎉`,
      `
      <p>Tu cuenta ya está lista. Ahora puedes crear tu primer evento, generar el código QR y dejar que tus invitados suban fotos y mensajes que aparecerán en vivo en la pantalla de proyección.</p>
      <a href="${FRONTEND_URL}/dashboard"
         style="display:inline-block; margin-top:12px; background:#7C3AED; color:#F8F7FF; text-decoration:none; padding:12px 24px; border-radius:100px; font-weight:600; font-size:14px;">
        Crear mi primer evento
      </a>
      `
    );
    await transporter.sendMail({
      from: FROM,
      to: user.email,
      subject: '¡Bienvenido a PhotoWall! 🎉',
      html
    });
  } catch (err) {
    console.error('🔴 Error enviando correo de bienvenida:', err);
  }
};

export const sendPlanThankYouEmail = async (
  user: { name: string; email: string },
  event: { name: string; slug: string; plan: PlanType }
) => {
  try {
    const planLabel = PLAN_LABELS[event.plan] ?? event.plan;
    const html = wrapTemplate(
      `¡Gracias por tu compra, ${user.name}! 💜`,
      `
      <p>Confirmamos la activación del <strong style="color:#A78BFA;">Plan ${planLabel}</strong> para tu evento <strong>"${event.name}"</strong>.</p>
      <p>Ya puedes disfrutar de todos los beneficios de tu plan en la galería y la proyección de tu evento.</p>
      <a href="${FRONTEND_URL}/e/${event.slug}"
         style="display:inline-block; margin-top:12px; background:#7C3AED; color:#F8F7FF; text-decoration:none; padding:12px 24px; border-radius:100px; font-weight:600; font-size:14px;">
        Ver mi evento
      </a>
      `
    );
    await transporter.sendMail({
      from: FROM,
      to: user.email,
      subject: `✅ Tu Plan ${planLabel} ya está activo`,
      html
    });
  } catch (err) {
    console.error('🔴 Error enviando correo de agradecimiento de plan:', err);
  }
};

export const sendExpirationReminderEmail = async (
  user: { name: string; email: string },
  event: { name: string; slug: string },
  daysLeft: number
) => {
  try {
    const html = wrapTemplate(
      `Tu galería de "${event.name}" se elimina pronto ⏳`,
      `
      <p>Hola ${user.name}, te escribimos para avisarte que en <strong style="color:#F472B6;">${daysLeft} día(s)</strong> se eliminará automáticamente toda la multimedia (fotos, videos y mensajes) de tu evento <strong>"${event.name}"</strong>, según el tiempo de vigencia de tu plan.</p>
      <p>Si quieres conservar los recuerdos, descarga el álbum completo antes de que esto ocurra.</p>
      <a href="${FRONTEND_URL}/dashboard"
         style="display:inline-block; margin-top:12px; background:#F472B6; color:#0D0D14; text-decoration:none; padding:12px 24px; border-radius:100px; font-weight:600; font-size:14px;">
        Descargar mis fotos ahora
      </a>
      `
    );
    await transporter.sendMail({
      from: FROM,
      to: user.email,
      subject: `⏳ Tu galería de "${event.name}" se elimina en ${daysLeft} día(s)`,
      html
    });
  } catch (err) {
    console.error('🔴 Error enviando recordatorio de vencimiento:', err);
  }
};

export const sendFirstGuestEmail = async (
  user: { name: string; email: string },
  event: { name: string; slug: string }
) => {
  try {
    const html = wrapTemplate(
      `¡Tu QR ya está funcionando! 🎊`,
      `
      <p>Hola ${user.name}, el primer invitado se acaba de unir a <strong>"${event.name}"</strong> — eso confirma que tu código QR y tu enlace están funcionando correctamente.</p>
      <p>Ya puedes relajarte, tus invitados van a poder subir fotos y mensajes sin problema durante el evento.</p>
      <a href="${FRONTEND_URL}/e/${event.slug}"
         style="display:inline-block; margin-top:12px; background:#7C3AED; color:#F8F7FF; text-decoration:none; padding:12px 24px; border-radius:100px; font-weight:600; font-size:14px;">
        Ver la galería en vivo
      </a>
      `
    );
    await transporter.sendMail({
      from: FROM,
      to: user.email,
      subject: `🎊 ¡El primer invitado se unió a "${event.name}"!`,
      html
    });
  } catch (err) {
    console.error('🔴 Error enviando correo de primer invitado:', err);
  }
};

export const sendPasswordResetEmail = async (
  user: { name: string; email: string },
  resetUrl: string
) => {
  try {
    const html = wrapTemplate(
      `Restablece tu contraseña 🔑`,
      `
      <p>Hola ${user.name}, recibimos una solicitud para restablecer tu contraseña de PhotoWall.</p>
      <p>Este enlace es válido por <strong>1 hora</strong>. Si tú no pediste esto, puedes ignorar este correo con tranquilidad.</p>
      <a href="${resetUrl}"
         style="display:inline-block; margin-top:12px; background:#7C3AED; color:#F8F7FF; text-decoration:none; padding:12px 24px; border-radius:100px; font-weight:600; font-size:14px;">
        Restablecer contraseña
      </a>
      `
    );
    await transporter.sendMail({
      from: FROM,
      to: user.email,
      subject: '🔑 Restablece tu contraseña de PhotoWall',
      html
    });
  } catch (err) {
    console.error('🔴 Error enviando correo de restablecimiento:', err);
  }
};

export const sendPlanUpgradeRequestEmail = async (
  organizer: { name: string; email: string },
  event: { name: string; slug: string },
  desiredPlan: PlanType
) => {
  try {
    const planLabel = PLAN_LABELS[desiredPlan] ?? desiredPlan;
    const price = PLAN_PRICES_COP[desiredPlan]?.toLocaleString('es-CO') ?? '?';
    const html = wrapTemplate(
      `Nueva solicitud de plan 💰`,
      `
      <p><strong>${organizer.name}</strong> (${organizer.email}) solicitó el <strong style="color:#A78BFA;">Plan ${planLabel}</strong> ($${price} COP) para el evento <strong>"${event.name}"</strong>.</p>
      <p>Contáctalo para coordinar el pago y luego actívalo desde el panel de super admin.</p>
      `
    );
    await transporter.sendMail({
      from: FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `💰 Solicitud de Plan ${planLabel} — ${organizer.name}`,
      html
    });
  } catch (err) {
    console.error('🔴 Error enviando notificación de solicitud de plan:', err);
  }
};

export const sendPlanRequestConfirmationEmail = async (
  user: { name: string; email: string },
  event: { name: string },
  desiredPlan: PlanType
) => {
  try {
    const planLabel = PLAN_LABELS[desiredPlan] ?? desiredPlan;
    const html = wrapTemplate(
      `¡Recibimos tu solicitud! 📩`,
      `
      <p>Hola ${user.name}, recibimos tu solicitud del <strong style="color:#A78BFA;">Plan ${planLabel}</strong> para tu evento <strong>"${event.name}"</strong>.</p>
      <p>Nos pondremos en contacto contigo en las próximas horas para coordinar el pago y activar tu plan.</p>
      `
    );
    await transporter.sendMail({
      from: FROM,
      to: user.email,
      subject: `📩 Recibimos tu solicitud del Plan ${planLabel}`,
      html
    });
  } catch (err) {
    console.error('🔴 Error enviando confirmación de solicitud de plan:', err);
  }
};