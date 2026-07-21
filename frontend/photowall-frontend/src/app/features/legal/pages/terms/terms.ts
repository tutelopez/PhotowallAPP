import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="legal-page">
      <div class="legal-inner">
        <a routerLink="/" class="back-link">← Volver al inicio</a>
        <h1>Términos y Condiciones de Uso</h1>
        <p class="legal-updated">Última actualización: {{ today }}</p>

        <section>
          <h2>1. Quiénes somos</h2>
          <p>PhotoWall es una plataforma que permite a organizadores de eventos (bodas, cumpleaños, aniversarios y celebraciones similares) crear galerías fotográficas colaborativas en tiempo real, a las que sus invitados acceden mediante un código QR o enlace, sin necesidad de crear una cuenta.</p>
        </section>

        <section>
          <h2>2. Aceptación de los términos</h2>
          <p>Al registrarte como organizador o al usar la galería de un evento como invitado, aceptas estos Términos y nuestra <a routerLink="/privacidad">Política de Privacidad</a>. Si no estás de acuerdo, no debes usar el servicio.</p>
        </section>

        <section>
          <h2>3. Cuentas de organizador</h2>
          <p>Para crear eventos necesitas registrarte con un correo electrónico y una contraseña. Eres responsable de mantener la confidencialidad de tus credenciales y de toda actividad realizada desde tu cuenta. Debes ser mayor de edad para registrarte como organizador.</p>
        </section>

        <section>
          <h2>4. Contenido de invitados y responsabilidad del organizador</h2>
          <p>Los invitados pueden subir fotos, videos y mensajes de texto a la galería del evento sin necesidad de registrarse, únicamente ingresando su nombre. Todo el contenido subido es responsabilidad de quien lo publica.</p>
          <p><strong>El organizador es responsable de informar a sus invitados que sus fotos, videos y mensajes serán visibles públicamente en la galería y proyección del evento</strong>, y de obtener el consentimiento necesario cuando corresponda — incluyendo el de los padres o acudientes cuando el contenido involucre menores de edad. PhotoWall actúa únicamente como plataforma técnica y no verifica ni modera activamente dicho consentimiento.</p>
        </section>

        <section>
          <h2>5. Contenido prohibido</h2>
          <p>Está prohibido subir contenido que sea ilegal, difamatorio, que infrinja derechos de autor, que contenga desnudez, violencia explícita, discurso de odio, o que vulnere los derechos de terceros. PhotoWall se reserva el derecho de eliminar cualquier contenido que incumpla esta norma y de suspender el acceso de quien lo publique.</p>
        </section>

        <section>
          <h2>6. Planes y pagos</h2>
          <p>PhotoWall ofrece un plan gratuito y planes de pago único por evento, con límites de fotos, videos, mensajes y tiempo de vigencia de la galería según el plan contratado, detallados en nuestra <a routerLink="/precios">página de precios</a>. El pago no implica una suscripción recurrente. Los medios de pago habilitados y el proceso de activación pueden variar mientras completamos la integración de pasarelas de pago automáticas.</p>
          <p>Al día de hoy, la activación de planes pagos puede requerir confirmación manual por parte de nuestro equipo. No se realizan reembolsos una vez el plan ha sido activado y la galería ha comenzado a recibir contenido, salvo error comprobado de nuestra parte.</p>
        </section>

        <section>
          <h2>7. Eliminación automática de contenido</h2>
          <p>Cada plan tiene un período de vigencia de la galería (por ejemplo, 3, 30, 180 o 365 días, contados desde la fecha del evento). Una vez vencido este período, <strong>todas las fotos, videos y mensajes del evento se eliminan automáticamente y de forma irreversible</strong> de nuestros servidores. Es responsabilidad del organizador descargar el contenido antes de esa fecha si desea conservarlo.</p>
        </section>

        <section>
          <h2>8. Disponibilidad del servicio</h2>
          <p>Hacemos nuestro mejor esfuerzo para mantener el servicio disponible durante los eventos, pero no garantizamos disponibilidad ininterrumpida. No somos responsables por fallas causadas por conexión a internet del usuario, del lugar del evento, o por interrupciones de nuestros proveedores externos (almacenamiento en la nube, correo electrónico, etc.).</p>
        </section>

        <section>
          <h2>9. Propiedad del contenido</h2>
          <p>Los organizadores e invitados conservan los derechos sobre las fotos, videos y mensajes que suben. Al usar el servicio, otorgas a PhotoWall una licencia limitada para almacenar, procesar y mostrar dicho contenido únicamente con el fin de prestar el servicio (galería y proyección del evento).</p>
        </section>

        <section>
          <h2>10. Limitación de responsabilidad</h2>
          <p>PhotoWall se ofrece "tal cual". En la medida permitida por la ley, no somos responsables por daños indirectos derivados del uso del servicio, incluyendo pérdida de contenido por causas ajenas a nuestro control.</p>
        </section>

        <section>
          <h2>11. Cambios a estos términos</h2>
          <p>Podemos actualizar estos Términos ocasionalmente. Los cambios importantes se notificarán por correo electrónico a los organizadores registrados.</p>
        </section>

        <section>
          <h2>12. Ley aplicable</h2>
          <p>Estos Términos se rigen por las leyes de la República de Colombia.</p>
        </section>

        <section>
          <h2>13. Contacto</h2>
          <p>Para preguntas sobre estos Términos, escríbenos a <strong>mrtecnologiamb&#64;gmail.com</strong>.</p>
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
export class TermsComponent {
  today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}
