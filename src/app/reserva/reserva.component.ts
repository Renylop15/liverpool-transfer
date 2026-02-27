import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.css'
})
export class ReservaComponent {
  reservationForm: FormGroup;
  isSubmitting = false;
  cotizacion: number | null = null;

  lang: 'es' | 'en' = 'es'; 

  textos = {
    es: {
      titulo: 'Servicio Ejecutivo Sedán',
      nombres: 'NOMBRE(S)',
      apellidos: 'APELLIDOS',
      nombres_ph: 'Ej. Roberto',
      apellidos_ph: 'Ej. Martínez',
      email: 'EMAIL CORPORATIVO',
      telefono: 'TELÉFONO',
      aerolinea: 'AEROLÍNEA',
      aerolinea_ph: 'Ej. Aeroméxico',
      vuelo: 'NO. DE VUELO',
      terminal: 'TERMINAL DE LLEGADA',
      term1: 'Terminal 1',
      term2: 'Terminal 2',
      fecha_llegada: 'FECHA DE LLEGADA',
      fecha_salida: 'FECHA DE SALIDA',
      tipo: 'TIPO DE VIAJE',
      tipo_sencillo: 'Sencillo (One Way)',
      tipo_redondo: 'Redondo (Round Trip)',
      pasajeros: 'PASAJEROS (Max 4)',
      destino: 'DESTINO / HOTEL',
      destino_ph: 'Ubicación de llegada',
      asistencia: 'ASISTENCIA ESPECIAL (Opcional)',
      asistencia_ph: 'Ej. Silla de ruedas, asiento para bebé...',
      tarifa: 'TARIFA ESTIMADA',
      terminos: '* Incluye IVA (16%). Servicio hasta por 10 horas.',
      btn_cotizando: 'CALCULANDO...',
      btn_cotizar: 'COTIZAR VIAJE',
      btn_pagar: 'PROCEDER AL PAGO SEGURO',
      alerta: '¡Listo para cobrar $'
    },
    en: {
      titulo: 'Executive Sedan Service',
      nombres: 'FIRST NAME',
      apellidos: 'LAST NAME',
      nombres_ph: 'E.g. Robert',
      apellidos_ph: 'E.g. Martin',
      email: 'CORPORATE EMAIL',
      telefono: 'PHONE NUMBER',
      aerolinea: 'AIRLINE',
      aerolinea_ph: 'E.g. Delta Airlines',
      vuelo: 'FLIGHT NUMBER',
      terminal: 'ARRIVAL TERMINAL',
      term1: 'Terminal 1',
      term2: 'Terminal 2',
      fecha_llegada: 'ARRIVAL DATE',
      fecha_salida: 'DEPARTURE DATE',
      tipo: 'TRIP TYPE',
      tipo_sencillo: 'One Way',
      tipo_redondo: 'Round Trip',
      pasajeros: 'PASSENGERS (Max 4)',
      destino: 'DESTINATION / HOTEL',
      destino_ph: 'Drop-off location',
      asistencia: 'SPECIAL ASSISTANCE (Optional)',
      asistencia_ph: 'E.g. Wheelchair, baby seat...',
      tarifa: 'ESTIMATED FARE',
      terminos: '* Tax included (16%). Up to 10 hours service.',
      btn_cotizando: 'CALCULATING...',
      btn_cotizar: 'GET QUOTE',
      btn_pagar: 'PROCEED TO SECURE PAYMENT',
      alerta: 'Ready to charge $'
    }
  };

  toggleLanguage() {
    this.lang = this.lang === 'es' ? 'en' : 'es';
  }

  constructor(private fb: FormBuilder) {
    this.reservationForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      codigoPais: ['+52', Validators.required], // Por defecto México
      telefono: ['', Validators.required],
      aerolinea: ['', Validators.required],
      noVuelo: ['', Validators.required],
      terminal: ['t1', Validators.required],
      fechaLlegada: ['', Validators.required],
      fechaSalida: ['', Validators.required],
      pasajeros: [1, [Validators.required, Validators.min(1), Validators.max(4)]],
      tipoViaje: ['one_way', Validators.required],
      destino: ['', Validators.required],
      asistencia: [''] // Este campo NO tiene Validators.required (Es opcional)
    });

    this.reservationForm.valueChanges.subscribe(() => {
      this.cotizacion = null;
    });
  }

  onSubmit() {
    if (this.reservationForm.valid) {
      if (this.cotizacion === null) {
        this.isSubmitting = true;
        const tipo = this.reservationForm.value.tipoViaje;
        
        if (tipo === 'one_way') {
          this.cotizacion = 1914.00;
        } else if (tipo === 'round_trip') {
          this.cotizacion = 3328.00;
        }

        const tipoViaje = this.reservationForm.value.tipoViaje;
        const terminalTexto = this.reservationForm.value.terminal.toUpperCase();

        let tipoTraducido = '';
        if (this.lang === 'en') {
          tipoTraducido = tipoViaje === 'one_way' ? 'One Way' : 'Round Trip';
        } else {
          tipoTraducido = tipoViaje === 'one_way' ? 'Sencillo' : 'Redondo';
        }

        const templateParams = {
          nombre: `${this.reservationForm.value.nombres} ${this.reservationForm.value.apellidos}`,
          email_destino: this.reservationForm.value.email, 
          destino: this.reservationForm.value.destino,
          vuelo: this.reservationForm.value.noVuelo,
          terminal: terminalTexto,
          pasajeros: this.reservationForm.value.pasajeros,
          tipo: tipoTraducido,
          cotizacion: this.cotizacion,
          // Nuevos campos para EmailJS (Recuerda agregarlos a tu plantilla de EmailJS si quieres que se vean)
          telefono_completo: `${this.reservationForm.value.codigoPais} ${this.reservationForm.value.telefono}`,
          aerolinea: this.reservationForm.value.aerolinea,
          fecha_llegada: this.reservationForm.value.fechaLlegada,
          fecha_salida: this.reservationForm.value.fechaSalida,
          asistencia: this.reservationForm.value.asistencia || 'Ninguna'
        };

        const templateId = this.lang === 'en' ? 'template_dcmxpi5' : 'template_s5rm6yu';

        emailjs.send(
          'service_jzr70mc', 
          templateId, 
          templateParams, 
          'AW3xttKiA-x-8jgoP'
        ).then(() => {
          console.log('¡Correo enviado con éxito!');
        }).catch((err) => {
          console.error('Error al enviar el correo:', err);
        });

        // WHATSAPP ACTUALIZADO CON NUEVOS CAMPOS
        let mensajeWA = '';
        if (this.lang === 'en') {
          mensajeWA = `Hello Vancity 🚐✨\n`
          + `I would like to confirm my trip reservation to *${this.reservationForm.value.destino}*.\n\n`
          + `✅ *QUOTE DETAILS:*\n`
          + `👤 *Name:* ${this.reservationForm.value.nombres} ${this.reservationForm.value.apellidos}\n`
          + `📞 *Phone:* ${this.reservationForm.value.codigoPais} ${this.reservationForm.value.telefono}\n`
          + `✈️ *Flight:* ${this.reservationForm.value.aerolinea} ${this.reservationForm.value.noVuelo} (Terminal ${terminalTexto})\n`
          + `📅 *Arrival Date:* ${this.reservationForm.value.fechaLlegada}\n`
          + `📅 *Departure Date:* ${this.reservationForm.value.fechaSalida}\n`
          + `👥 *Passengers:* ${this.reservationForm.value.pasajeros}\n`
          + `🚗 *Type:* ${tipoTraducido}\n`
          + `♿ *Assistance:* ${this.reservationForm.value.asistencia || 'None'}\n\n`
          + `💰 *ESTIMATED FARE: $${this.cotizacion} MXN*\n\n`
          + `I await payment instructions.`;
        } else {
          mensajeWA = `Hola Vancity 🚐✨\n`
          + `Me gustaría confirmar mi reserva de viaje a *${this.reservationForm.value.destino}*.\n\n`
          + `✅ *DETALLES DE LA COTIZACIÓN:*\n`
          + `👤 *Nombre:* ${this.reservationForm.value.nombres} ${this.reservationForm.value.apellidos}\n`
          + `📞 *Teléfono:* ${this.reservationForm.value.codigoPais} ${this.reservationForm.value.telefono}\n`
          + `✈️ *Vuelo:* ${this.reservationForm.value.aerolinea} ${this.reservationForm.value.noVuelo} (Terminal ${terminalTexto})\n`
          + `📅 *Llegada:* ${this.reservationForm.value.fechaLlegada}\n`
          + `📅 *Salida:* ${this.reservationForm.value.fechaSalida}\n`
          + `👥 *Pasajeros:* ${this.reservationForm.value.pasajeros}\n`
          + `🚗 *Tipo:* ${tipoTraducido}\n`
          + `♿ *Asistencia:* ${this.reservationForm.value.asistencia || 'Ninguna'}\n\n`
          + `💰 *TARIFA ESTIMADA: $${this.cotizacion} MXN*\n\n`
          + `Quedo en espera de instrucciones para el pago.`;
        }

        const mensajeCodificado = encodeURIComponent(mensajeWA);
        const telefonoEmpresa = '525512345678'; 
        const urlWhatsApp = `https://wa.me/${telefonoEmpresa}?text=${mensajeCodificado}`;
        window.open(urlWhatsApp, '_blank');

        this.isSubmitting = false; 
      } else {
        alert(`${this.textos[this.lang].alerta} ${this.cotizacion} MXN con OpenPay!`);
      }
    }
  }

  soloNumeros(event: KeyboardEvent) {
    const tecla = event.key;
    if (tecla < '0' || tecla > '9') {
      event.preventDefault();
    }
  }
}