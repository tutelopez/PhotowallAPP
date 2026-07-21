import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="legal-page">
      <div class="legal-inner">
        <a routerLink="/" class="back-link">← Volver al inicio</a>
        <h1>Política de Tratamiento de Datos Personales</h1>
        <p class="legal-updated">Última actualización: {{ today }}</p>

        <section>
          <h2>1. Responsable del tratamiento</h2>
          <p>PhotoWall (en adelante, "nosotros" o "la plataforma") es responsable del tratamiento de los datos personales recolectados a través de esta aplicación, de conformidad con la Ley 1581 de 2012 y el Decreto 1377 de 2013 de la República de Colombia.</p>
        </section>

        <section>
          <h2>2. Qué datos recolectamos</h2>
          <p><strong>De los organizadores:</strong> nombre, correo electrónico y contraseña (almacenada de forma cifrada, nunca en texto plano).</p>
          <p><strong>De los invitados:</strong> únicamente el nombre que ingresan al unirse a un evento — no se requiere correo, teléfono ni ningún otro dato para participar como invitado.</p>
          <p><strong>Contenido subido:</strong> fotos, videos y mensajes de texto que los invitados eligen compartir en la galería del evento.</p>
          <p><strong>Datos técnicos:</strong> información básica de uso del servicio (por ejemplo, fecha de creación de eventos, cantidad de fotos subidas) necesaria para aplicar los límites de cada plan.</p>
        </section>

        <section>
          <h2>3. Finalidad del tratamiento</h2>
          <p>Usamos estos datos exclusivamente para:</p>
          <p>• Crear y gestionar tu cuenta de organizador.<br>
             • Permitir que los invitados suban contenido a la galería de un evento.<br>
             • Mostrar dicho contenido en la galería y en la pantalla de proyección del evento.<br>
             • Enviar correos operativos (bienvenida, confirmación de plan, avisos de vencimiento de galería, recuperación de contraseña).<br>
             • Aplicar los límites correspondientes al plan contratado.<br>
             • Cumplir obligaciones legales cuando aplique.</p>
          <p>No usamos tus datos para publicidad de terceros ni los vendemos a nadie.</p>
        </section>

        <section>
          <h2>4. Con quién compartimos datos (encargados del tratamiento)</h2>
          <p>Para operar el servicio, usamos los siguientes proveedores externos, que actúan como encargados del tratamiento bajo nuestras instrucciones:</p>
          <p>• <strong>Cloudinary</strong> — almacenamiento de fotos y videos subidos por los invitados.<br>
             • <strong>Servicios de correo electrónico (Gmail/SMTP)</strong> — envío de notificaciones operativas.<br>
             • <strong>Proveedor de base de datos (MongoDB)</strong> — almacenamiento de la información de cuentas y eventos.</p>
          <p>No compartimos tus datos con terceros para fines comerciales o publicitarios.</p>
        </section>

        <section>
          <h2>5. Menores de edad</h2>
          <p>PhotoWall no está dirigido a menores de edad como usuarios registrados (organizadores). Sin embargo, reconocemos que en eventos familiares pueden aparecer fotos o videos de menores subidos por los invitados. La responsabilidad de contar con el consentimiento de los padres o acudientes para la publicación de imágenes de menores recae en el organizador del evento y en quien sube el contenido, conforme a lo establecido en nuestros <a routerLink="/terminos">Términos y Condiciones</a>.</p>
        </section>

        <section>
          <h2>6. Tiempo de conservación</h2>
          <p>El contenido de cada evento (fotos, videos, mensajes) se conserva únicamente durante el período de vigencia correspondiente a su plan, contado desde la fecha del evento. Una vez vencido ese período, el contenido se elimina automáticamente y de forma permanente de nuestros servidores. Los datos de la cuenta del organizador (nombre, correo) se conservan mientras la cuenta permanezca activa.</p>
        </section>

        <section>
          <h2>7. Tus derechos (Habeas Data)</h2>
          <p>Como titular de tus datos personales, tienes derecho a:</p>
          <p>• Conocer, actualizar y rectificar tus datos personales.<br>
             • Solicitar prueba de la autorización otorgada para el tratamiento de tus datos.<br>
             • Ser informado sobre el uso que se ha dado a tus datos.<br>
             • Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley.<br>
             • Revocar la autorización y/o solicitar la supresión de tus datos, cuando no exista un deber legal o contractual que impida su eliminación.<br>
             • Acceder de forma gratuita a tus datos personales tratados.</p>
          <p>Para ejercer cualquiera de estos derechos, escríbenos a <strong>mrtecnologiamb&#64;gmail.com</strong> indicando tu solicitud. Responderemos dentro de los plazos establecidos por la ley colombiana.</p>
        </section>

        <section>
          <h2>8. Seguridad</h2>
          <p>Implementamos medidas técnicas razonables para proteger tus datos, incluyendo cifrado de contraseñas y comunicación segura (HTTPS). Ningún sistema es 100% infalible, pero trabajamos activamente para mantener la seguridad de la información.</p>
        </section>

        <section>
          <h2>9. Uso de almacenamiento local (localStorage)</h2>
          <p>Usamos el almacenamiento local de tu navegador para mantener tu sesión como invitado dentro de un evento (nombre y un identificador temporal), y la sesión de tu cuenta si eres organizador. No usamos cookies de rastreo publicitario de terceros.</p>
        </section>

        <section>
          <h2>10. Cambios a esta política</h2>
          <p>Podemos actualizar esta política ocasionalmente. Los cambios sustanciales se notificarán por correo electrónico a los organizadores registrados.</p>
        </section>

        <section>
          <h2>11. Contacto</h2>
          <p>Si tienes preguntas sobre el tratamiento de tus datos personales, escríbenos a <strong>mrtecnologiamb&#64;gmail.com</strong>.</p>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .legal-page { min-height: 100vh; padding: 6rem 2rem 5rem; background: var(--pw-ink); }
    .legal-inner { max-width: 720px; margin: 0 auto; }
    .back-link { display: block; color: rgba(248,247,255,0.5); font-size: 0.875rem; margin-bottom: 2rem; }
    h1 { font-family: 'Syne', sans-serif; font-size: 2rem; margin-bottom: 0.4rem; }
    .legal-updated { color: rgba(248,247,255,0.4); font-size: 0.85rem; margin-bottom: 2.5rem; }
    section { margin-bottom: 2rem; }
    h2 { font-family: 'Syne', sans-serif; font-size: 1.1rem; color: #A78BFA; margin-bottom: 0.6rem; }
    p { color: rgba(248,247,255,0.75); font-size: 0.92rem; line-height: 1.7; margin: 0 0 0.75rem; }
    a { color: #A78BFA; }
    strong { color: #F8F7FF; }
  `]
})
export class PrivacyComponent {
  today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}
