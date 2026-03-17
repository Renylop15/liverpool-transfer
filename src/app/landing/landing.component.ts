import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <--- IMPORTANTE

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule], // <--- AGREGAR AQUÍ
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
// En tu archivo landing.component.ts
export class LandingComponent {
  modalAbierto = false;
  contenidoModal = '';
  tituloModal = '';

  openModal(tipo: string) {
    if (tipo === 'privacidad') {
      this.tituloModal = 'AVISO DE PRIVACIDAD';
      this.contenidoModal = `
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p><strong>USO DE COOKIES:</strong></p>
        <p>Le informamos que en nuestra página de internet utilizamos cookies y otras tecnologías a través de las cuales es posible monitorear su comportamiento como usuario de internet para brindarle un mejor servicio y experiencia al navegar en nuestra página.</p>
        <p>Los datos personales que obtenemos de estas tecnologías de rastreo son: horario de navegación, tiempo de navegación en nuestra página de internet y secciones consultadas. Usted puede deshabilitar el uso de cookies a través de la configuración de su navegador.</p>
        <p><strong>Vancity Executive Travel</strong> es responsable del tratamiento de sus datos personales. Su información será utilizada para proveer los servicios de transporte ejecutivo que ha solicitado, informarle sobre cambios en los mismos y evaluar la calidad del servicio que le brindamos.</p>
        <p>Para las finalidades antes mencionadas, requerimos obtener los siguientes datos personales: Nombre, Apellidos, Correo electrónico y Teléfono.</p>
        <p>Usted tiene derecho de acceder, rectificar y cancelar sus datos personales, así como de oponerse al tratamiento de los mismos o revocar el consentimiento que para tal fin nos haya otorgado (Derechos ARCO), a través de un correo electrónico a: <strong>admin@vancity.mx</strong></p>
        <p>Cualquier modificación a este aviso de privacidad podrá consultarlo en nuestra página web o se le notificará vía correo electrónico.</p>
      `;
    }else if (tipo === 'terminos') {
    this.tituloModal = 'TÉRMINOS Y CONDICIONES';
    this.contenidoModal = `
      <div style="font-size: 13px; color: #555;">
        <p><strong>1. OBJETO:</strong> Vancity MX proporciona servicios de transporte ejecutivo para el 17th World Department Store Summit en la Ciudad de México.</p>
        
        <p><strong>2. PASARELA DE PAGO:</strong> Se hace uso de <strong>Openpay</strong> como pasarela de pagos para el procesamiento de transacciones con tarjetas de crédito y débito.</p>
        
        <p><strong>POLÍTICA DE CANCELACIÓN:</strong></p>
      <ul>
        <li>Las cancelaciones deben solicitarse por escrito al correo <strong>admin@vancity.mx</strong>.</li>
        <li>Si la cancelación se realiza con <strong>más de 24 horas</strong> de anticipación, se reembolsará el 100% del pago.</li>
        <li>Si la cancelación ocurre con <strong>menos de 24 horas</strong> de antelación al servicio, se aplicará un cargo del 100% (No reembolsable).</li>
      </ul>

      <p><strong>POLÍTICA DE REEMBOLSO:</strong></p>
      <ul>
        <li>Los reembolsos aprobados se procesarán en un plazo de 5 a 10 días hábiles a través del mismo método de pago original.</li>
        <li><strong>Importante:</strong> Se hace uso de <strong>Openpay</strong> como pasarela de pagos, por lo que los tiempos finales de acreditación pueden variar según la institución bancaria.</li>
      </ul>

        <p><strong>4. RESPONSABILIDAD:</strong> Vancity se compromete a la puntualidad; sin embargo, no se hace responsable por retrasos derivados de tráfico inusual, accidentes viales o cierres de vialidades por parte de las autoridades.</p>

        <p><strong>5. SEGURIDAD:</strong> Todas las unidades cuentan con seguro de viajero vigente y choferes certificados.</p>

        <p><strong>6. CONTACTO:</strong> Para cualquier aclaración, favor de contactar a <strong>admin@vancity.mx</strong> o a los teléfonos indicados en este sitio.</p>
      </div>
    `;
  }else if (tipo === 'faq') {
  this.tituloModal = 'PREGUNTAS FRECUENTES';
  this.contenidoModal = `
    <div style="font-size: 13px; color: #555;">
      <p><strong>¿Cómo localizo a mi chofer en el aeropuerto?</strong><br>
      Su chofer lo esperará en la salida de pasajeros con un letrero digital o impreso con su nombre y el logo del Evento/Vancity. Le enviaremos los datos del chofer vía WhatsApp antes de su llegada.</p>

      <p><strong>¿Qué pasa si mi vuelo se retrasa?</strong><br>
      No se preocupe. Monitoreamos su vuelo en tiempo real. Su chofer ajustará la hora de llegada automáticamente sin costo adicional.</p>

      <p><strong>¿Las unidades cuentan con seguro?</strong><br>
      Sí, todas nuestras unidades cuentan con seguro de cobertura amplia y seguro de viajero para su total tranquilidad.</p>

      <p><strong>¿Puedo solicitar factura?</strong><br>
      Sí. Envía al correo admin@vancity.mx tu CSF (Constancia de Situación Fiscal) e indica el tipo de egreso. (Una vez compartidos los datos deberás recibir tu factura en los próximos 5 días hábiles después de tu viaje). </p>

      <p><strong>¿Qué tipos de pago aceptan?</strong><br>
      Aceptamos todas las tarjetas de crédito y débito (Visa, Mastercard, American Express) procesadas de forma segura por <strong>Openpay</strong>.</p>
    </div>
  `;
}
    this.modalAbierto = true;
  }

  closeModal() {
    this.modalAbierto = false;
  }
}