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
      this.tituloModal = 'PRIVACY NOTICE';
      this.contenidoModal = `
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p><strong>USE OF COOKIES:</strong></p>
        <p>We inform you that on our website we use cookies and other technologies through which it is possible to monitor your behavior as an internet user in order to provide you with a better service and experience when browsing our website.</p>
        <p>The personal data we obtain from these tracking technologies are: browsing schedule, browsing time on our website and consulted sections. You can disable the use of cookies through the configuration of your browser.</p>
        <p><strong>Vancity Executive Travel</strong> is responsible for the processing of your personal data. Your information will be used to provide the executive transportation services you have requested, inform you about changes to them and evaluate the quality of the service we provide.</p>
        <p>For the purposes mentioned above, we require to obtain the following personal data: Name, Last Names, Email Address and Phone Number.</p>
        <p>You have the right to access, correct and cancel your personal data, as well as to oppose the treatment of the same or revoke the consent that for such purpose we may have obtained (ARCO Rights), through an email to: <strong>admin@vancity.mx</strong></p>
        <p>Any modification to this privacy notice will be available on our website or you will be notified via email.</p>
      `;
    }else if (tipo === 'terminos') {
    this.tituloModal = 'TERMS AND CONDITIONS';
    this.contenidoModal = `
      <div style="font-size: 13px; color: #555;">
        <p><strong>1. OBJECT:</strong> Vancity MX provides executive transportation services for the 17th World Department Store Summit in Mexico City.</p>
        
        <p><strong>2. PAYMENT GATEWAY:</strong> <strong>Openpay</strong> is used as the payment gateway for processing transactions with credit and debit cards.</p>
        
        <p><strong>POLICY OF CANCELLATIONS:</strong></p>
      <ul>
        <li>To request a cancellation, please email <strong>admin@vancity.mx</strong>.</li>
        <li>If the cancellation is made with <strong>more than 24 hours</strong> of advance notice, a 100% refund will be issued.</li>
        <li>If the cancellation occurs with <strong>less than 24 hours</strong> of advance notice, a 100% charge will be applied (non-refundable).</li>
      </ul>

      <p><strong>POLICY OF REFUNDS:</strong></p>
      <ul>
        <li>Approved refunds will be processed within 5 to 10 business days through the original payment method.</li>
        <li><strong>Important:</strong> <strong>Openpay</strong> is used as the payment gateway, so final settlement times may vary depending on the banking institution.</li>
      </ul>

        <p><strong>4. RESPONSIBILITY:</strong> Vancity commits to punctuality; however, it is not responsible for delays derived from unusual traffic, road accidents or road closures by the authorities.</p>

        <p><strong>5. SECURITY:</strong> All units are equipped with valid traveler insurance and certified drivers.</p>

        <p><strong>6. CONTACT:</strong> For any clarification, please contact <strong>admin@vancity.mx</strong> or the phone numbers indicated on this site.</p>
      </div>
    `;
  }else if (tipo === 'faq') {
  this.tituloModal = 'FREQUENTLY ASKED QUESTIONS';
  this.contenidoModal = `
    <div style="font-size: 13px; color: #555;">
      <p><strong>How do I locate my driver at the airport?</strong><br>
      Your driver will be waiting for you at the arrivals area with a digital or printed sign featuring your name and the Event/Vancity logo. We will send you the driver's details via WhatsApp before your arrival.</p>

      <p><strong>What happens if my flight is delayed?</strong><br>
      Don't worry. We monitor your flight in real-time. Your driver will automatically adjust the arrival time without any additional cost.</p>

      <p><strong>Do the vehicles have insurance?</strong><br>
      Yes, all our vehicles are equipped with comprehensive coverage and travel insurance for your complete peace of mind.</p>

      <p><strong>Can I request an invoice?</strong><br>
      Yes. Send your CSF (Constancia de Situación Fiscal) to admin@vancity.mx and indicate the type of expense. (Once the data is shared, you will receive your invoice within the next 5 business days after your trip). </p>

      <p><strong>What payment methods do you accept?</strong><br>
      We accept all credit and debit cards (Visa, Mastercard, American Express) processed securely by <strong>Openpay</strong>.</p>
    </div>
  `;
}
    this.modalAbierto = true;
  }

  closeModal() {
    this.modalAbierto = false;
  }
}