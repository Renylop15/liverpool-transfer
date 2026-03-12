import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { createClient } from '@supabase/supabase-js'; 

const supabaseUrl = 'https://chyuacdnyaduqnawsoii.supabase.co'; 
const supabaseKey = 'sb_publishable_j34PDqBJtmzklQqnP6kL4A_AxNnerKR'; 
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.css'
})
export class ReservaComponent implements OnInit {
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
      terminal: 'TERMINAL',
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
      alerta: '¡Listo para cobrar $',
      titulo_llegada: 'DATOS DE VUELO DE LLEGADA',
      titulo_salida: 'DATOS DE VUELO DE SALIDA'
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
      terminal: 'TERMINAL',
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
      alerta: 'Ready to charge $',
      titulo_llegada: 'ARRIVAL FLIGHT DETAILS',
      titulo_salida: 'DEPARTURE FLIGHT DETAILS'
    }
  };

  toggleLanguage() {
    this.lang = this.lang === 'es' ? 'en' : 'es';
  }

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.reservationForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      codigoPais: ['+52', Validators.required],
      telefono: ['', Validators.required],
      tipoViaje: ['one_way', Validators.required],
      pasajeros: [1, [Validators.required, Validators.min(1), Validators.max(4)]],
      destino: ['Hotel Hyatt Regency Mexico City', Validators.required],
      
      aerolinea: ['', Validators.required],
      noVuelo: ['', Validators.required],
      terminal: ['t1', Validators.required],
      fechaLlegada: ['', Validators.required],
      
      aerolineaSalida: [''],
      noVueloSalida: [''],
      terminalSalida: ['t1'],
      fechaSalida: [''], 
      
      asistencia: [''] 
    });

    this.reservationForm.valueChanges.subscribe(() => {
      this.cotizacion = null;
    });
  }

  ngOnInit() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const openpayId = urlParams.get('id'); // OpenPay lo manda como ?id=XXX

      if (openpayId) {
        const datosGuardados = localStorage.getItem('reserva_vancity');
        const idiomaGuardado = localStorage.getItem('idioma_vancity') || 'es';

        if (datosGuardados) {
          const datosCorreo = JSON.parse(datosGuardados);

          // Limpiamos el texto para que el Folio se vea perfecto
          datosCorreo.titulo_mensaje = idiomaGuardado === 'en' ? '✅ Payment Confirmed' : '✅ Pago Confirmado';
          
          // Usamos solo el openpayId que atrapamos de la URL
          datosCorreo.mensaje_principal = idiomaGuardado === 'en' 
            ? `Your payment was successful. Folio: ${openpayId}. Your unit is reserved.` 
            : `Hemos recibido tu pago exitosamente. Folio: ${openpayId}. Tu unidad está reservada.`;

          const templateId = idiomaGuardado === 'en' ? 'template_dcmxpi5' : 'template_s5rm6yu';
          emailjs.send('service_jzr70mc', templateId, datosCorreo, 'AW3xttKiA-x-8jgoP')
            .catch(() => {});

          supabase.from('reservas').update({ estatus: 'PAGADO' })
            .eq('email', datosCorreo.email_destino)
            .then(() => {});

          alert(idiomaGuardado === 'en' ? 'Payment Successful! Confirmation email sent.' : '¡Pago Exitoso! Te hemos enviado un correo de confirmación.');
          
          localStorage.removeItem('reserva_vancity');
          localStorage.removeItem('idioma_vancity');
          
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }

  async onSubmit() {
    if (this.reservationForm.valid) {
      
      if (this.cotizacion === null) {
        this.isSubmitting = true; 
        
        try {
          const tipoViaje = this.reservationForm.value.tipoViaje;
          const isRound = tipoViaje === 'round_trip';

          if (tipoViaje === 'one_way') {
            this.cotizacion = 1914.00;
          } else if (tipoViaje === 'round_trip') {
            this.cotizacion = 3328.00;
          }

          let tipoTraducido = isRound ? (this.lang === 'en' ? 'Round Trip' : 'Redondo') : (this.lang === 'en' ? 'One Way' : 'Sencillo');
          const terminalTexto = this.reservationForm.value.terminal.toUpperCase();
          const terminalSalidaTexto = this.reservationForm.value.terminalSalida.toUpperCase();

          const aerolineaGuardar = isRound ? `Ida: ${this.reservationForm.value.aerolinea} | Vuelta: ${this.reservationForm.value.aerolineaSalida || 'N/A'}` : this.reservationForm.value.aerolinea;
          const vueloGuardar = isRound ? `Ida: ${this.reservationForm.value.noVuelo} | Vuelta: ${this.reservationForm.value.noVueloSalida || 'N/A'}` : this.reservationForm.value.noVuelo;
          const terminalGuardar = isRound ? `Ida: ${terminalTexto} | Vuelta: ${terminalSalidaTexto}` : terminalTexto;

          const { error } = await supabase.from('reservas').insert([{
              nombres: this.reservationForm.value.nombres,
              apellidos: this.reservationForm.value.apellidos,
              email: this.reservationForm.value.email,
              telefono: `${this.reservationForm.value.codigoPais} ${this.reservationForm.value.telefono}`,
              aerolinea: aerolineaGuardar,
              vuelo: vueloGuardar,
              terminal: terminalGuardar,
              fecha_llegada: this.reservationForm.value.fechaLlegada,
              fecha_salida: this.reservationForm.value.fechaSalida ? this.reservationForm.value.fechaSalida : null,
              pasajeros: this.reservationForm.value.pasajeros,
              tipo_viaje: tipoTraducido,
              destino: this.reservationForm.value.destino,
              asistencia: this.reservationForm.value.asistencia || 'Ninguna',
              cotizacion: this.cotizacion,
              estatus: 'COTIZADO'
          }]);

          if (error) console.error('Error en Supabase:', error);

          // Aquí empacamos los datos con los textos de COTIZACIÓN
          const templateParams = {
            titulo_mensaje: this.lang === 'en' ? 'Your Trip Quote' : 'Tu Cotización de Viaje',
            mensaje_principal: this.lang === 'en' ? 'Here are the details of your requested quote.' : 'Aquí están los detalles de la cotización solicitada.',
            nombre: `${this.reservationForm.value.nombres} ${this.reservationForm.value.apellidos}`,
            email_destino: this.reservationForm.value.email, 
            destino: this.reservationForm.value.destino,
            vuelo: vueloGuardar,
            terminal: terminalGuardar,
            pasajeros: this.reservationForm.value.pasajeros,
            tipo: tipoTraducido,
            cotizacion: this.cotizacion,
            telefono_completo: `${this.reservationForm.value.codigoPais} ${this.reservationForm.value.telefono}`,
            aerolinea: aerolineaGuardar,
            fecha_llegada: this.reservationForm.value.fechaLlegada,
            fecha_salida: this.reservationForm.value.fechaSalida,
            asistencia: this.reservationForm.value.asistencia || 'Ninguna'
          };

          // GUARDAMOS LA MOCHILA PARA USARLA DESPUÉS DEL PAGO
          localStorage.setItem('reserva_vancity', JSON.stringify(templateParams));
          localStorage.setItem('idioma_vancity', this.lang);

          const templateId = this.lang === 'en' ? 'template_dcmxpi5' : 'template_s5rm6yu';
          emailjs.send('service_jzr70mc', templateId, templateParams, 'AW3xttKiA-x-8jgoP')
            .catch((err) => console.error('Error al enviar el correo:', err));

          let mensajeWA = '';
          if (this.lang === 'en') {
            mensajeWA = `Hello Vancity 🚐✨\nI would like to confirm my trip reservation to *${this.reservationForm.value.destino}*.\n\n✅ *QUOTE DETAILS:*\n👤 *Name:* ${this.reservationForm.value.nombres} ${this.reservationForm.value.apellidos}\n📞 *Phone:* ${this.reservationForm.value.codigoPais} ${this.reservationForm.value.telefono}\n👥 *Passengers:* ${this.reservationForm.value.pasajeros}\n🚗 *Type:* ${tipoTraducido}\n\n🛬 *ARRIVAL FLIGHT:*\n✈️ ${this.reservationForm.value.aerolinea} ${this.reservationForm.value.noVuelo} (Terminal ${terminalTexto})\n📅 ${this.reservationForm.value.fechaLlegada}\n\n`;
            if (isRound) mensajeWA += `🛫 *DEPARTURE FLIGHT:*\n✈️ ${this.reservationForm.value.aerolineaSalida} ${this.reservationForm.value.noVueloSalida} (Terminal ${terminalSalidaTexto})\n📅 ${this.reservationForm.value.fechaSalida}\n\n`;
            mensajeWA += `♿ *Assistance:* ${this.reservationForm.value.asistencia || 'None'}\n\n💰 *ESTIMATED FARE: $${this.cotizacion} MXN*\n\nI await payment instructions.`;
          } else {
            mensajeWA = `Hola Vancity 🚐✨\nMe gustaría confirmar mi reserva de viaje a *${this.reservationForm.value.destino}*.\n\n✅ *DETALLES DE LA COTIZACIÓN:*\n👤 *Nombre:* ${this.reservationForm.value.nombres} ${this.reservationForm.value.apellidos}\n📞 *Teléfono:* ${this.reservationForm.value.codigoPais} ${this.reservationForm.value.telefono}\n👥 *Pasajeros:* ${this.reservationForm.value.pasajeros}\n🚗 *Tipo:* ${tipoTraducido}\n\n🛬 *VUELO DE LLEGADA:*\n✈️ ${this.reservationForm.value.aerolinea} ${this.reservationForm.value.noVuelo} (Terminal ${terminalTexto})\n📅 ${this.reservationForm.value.fechaLlegada}\n\n`;
            if (isRound) mensajeWA += `🛫 *VUELO DE SALIDA:*\n✈️ ${this.reservationForm.value.aerolineaSalida} ${this.reservationForm.value.noVueloSalida} (Terminal ${terminalSalidaTexto})\n📅 ${this.reservationForm.value.fechaSalida}\n\n`;
            mensajeWA += `♿ *Asistencia:* ${this.reservationForm.value.asistencia || 'Ninguna'}\n\n💰 *TARIFA ESTIMADA: $${this.cotizacion} MXN*\n\nQuedo en espera de instrucciones para el pago.`;
          }          

          //const urlWhatsApp = `https://wa.me/525536365421?text=${encodeURIComponent(mensajeWA)}`;
          //window.open(urlWhatsApp, '_blank');

        } catch (fatalError) {
          console.error("Error crítico:", fatalError);
        } finally {
          this.isSubmitting = false; 
          this.cdr.detectChanges(); 
        }

      } else {
        this.isSubmitting = true; 
        this.cdr.detectChanges(); 
        
        try {
          const datosPago = {
            monto: this.cotizacion,
            nombre: `${this.reservationForm.value.nombres} ${this.reservationForm.value.apellidos}`,
            email: this.reservationForm.value.email,
            descripcion: `Traslado Ejecutivo Vancity`
          };

          const { data, error } = await supabase.functions.invoke('openpay-checkout', { body: datosPago });

          if (error || (data && data.error)) {
            alert('Hubo un detalle al conectar con el banco. Intenta dar clic de nuevo.');
            this.isSubmitting = false;
            this.cdr.detectChanges();
            return;
          }

          window.location.href = data.checkoutLink; 

        } catch (fatalError) {
          console.error('Error de conexión:', fatalError);
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      }
    }
  }

  soloNumeros(event: KeyboardEvent) {
    const tecla = event.key;
    if (tecla < '0' || tecla > '9') event.preventDefault();
  }
}