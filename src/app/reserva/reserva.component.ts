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
  lang: 'es' | 'en' = 'en'; 

  aerolineasPopulares = [
  // MÉXICO Y LATAM
  "Aeroméxico", "Volaris", "Viva Aerobus", "Copa Airlines", "Avianca", "LATAM Airlines", 
  "Aerolíneas Argentinas", "Sky Airline", "JetSmart", "TAG Airlines", "AeroMéxico Connect",
  
  // ESTADOS UNIDOS Y CANADÁ
  "American Airlines", "Delta Airlines", "United Airlines", "Southwest Airlines", 
  "Alaska Airlines", "JetBlue Airways", "Spirit Airlines", "Frontier Airlines", 
  "Allegiant Air", "Hawaiian Airlines", "Sun Country Airlines", "Air Canada", 
  "WestJet", "Air Transat", "Porter Airlines", "Flair Airlines",

  // EUROPA
  "Lufthansa", "Air France", "Iberia", "British Airways", "KLM", "Swiss International", 
  "Austrian Airlines", "TAP Air Portugal", "Alitalia", "ITA Airways", "Turkish Airlines", 
  "Aeroflot", "SAS Scandinavian", "Finnair", "Brussels Airlines", "Virgin Atlantic", 
  "Icelandair", "LOT Polish Airlines", "Air Europa", "Norwegian Air", "Ryanair", 
  "EasyJet", "Vueling", "Wizz Air", "Eurowings", "Condor",

  // ASIA Y MEDIO ORIENTE
  "Emirates", "Qatar Airways", "Etihad Airways", "Singapore Airlines", "Cathay Pacific", 
  "All Nippon Airways (ANA)", "Japan Airlines (JAL)", "Korean Air", "Asiana Airlines", 
  "China Southern Airlines", "China Eastern Airlines", "Air China", "Hainan Airlines", 
  "Thai Airways", "Malaysia Airlines", "Vietnam Airlines", "Garuda Indonesia", 
  "Philippine Airlines", "Eva Air", "Air India", "IndiGo", "Saudia", "El Al", 
  "Turkish Airlines", "Royal Jordanian", "Oman Air",

  // OCEANÍA Y ÁFRICA
  "Qantas", "Air New Zealand", "Virgin Australia", "Jetstar", "Ethiopian Airlines", 
  "South African Airways", "EgyptAir", "Kenya Airways", "Royal Air Maroc",

  // PRIVADOS / OTROS
  "NetJets", "Flexjet", "VistaJet", "Wheels Up", "Charter Privado", "Vuelo Privado"
].sort(); // El .sort() las ordena alfabéticamente de la A a la Z automáticamente

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
      terminos: '* Incluye IVA (16%).',
      btn_cotizando: 'CALCULANDO...',
      btn_cotizar: 'COTIZAR VIAJE',
      btn_pagar: 'PROCEDER AL PAGO SEGURO',
      alerta: '¡Listo para cobrar $',
      titulo_llegada: 'DATOS DE VUELO DE LLEGADA',
      titulo_salida: 'DATOS DE VUELO DE SALIDA',
      hora_llegada: 'HORA DE LLEGADA',
      hora_salida: 'HORA DE SALIDA'
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
      terminos: '* Tax included (16%). ',
      btn_cotizando: 'CALCULATING...',
      btn_cotizar: 'GET QUOTE',
      btn_pagar: 'PROCEED TO SECURE PAYMENT',
      alerta: 'Ready to charge $',
      titulo_llegada: 'ARRIVAL FLIGHT DETAILS',
      titulo_salida: 'DEPARTURE FLIGHT DETAILS',
      hora_llegada: 'ARRIVAL TIME',
      hora_salida: 'DEPARTURE TIME',
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
      horaLlegada: ['', Validators.required],
      
      aerolineaSalida: [''],
      noVueloSalida: [''],
      terminalSalida: ['t1'],
      fechaSalida: [''], 
      horaSalida: [''],
      
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
    // 1. Declaramos las variables una sola vez al inicio
    const form = this.reservationForm.value;
    const isRound = form.tipoViaje === 'round_trip';
    const terminalTexto = form.terminal.toUpperCase();
    const terminalSalidaTexto = form.terminalSalida ? form.terminalSalida.toUpperCase() : '';
    const nombreCompleto = `${form.nombres} ${form.apellidos}`;
    let telLimpio = `${form.codigoPais}${form.telefono}`.replace('+', '').replace(/\s/g, '');
    if (telLimpio.startsWith('521')) telLimpio = '52' + telLimpio.substring(3);

    // CASO 1: COTIZACIÓN
    if (this.cotizacion === null) {
      this.isSubmitting = true; 
      
      try {
        this.cotizacion = isRound ? 3328.00 : 1914.00;
        let tipoTraducido = isRound ? (this.lang === 'en' ? 'Round Trip' : 'Redondo') : (this.lang === 'en' ? 'One Way' : 'Sencillo');

        // 2. Inserción en Base de Datos
        const { error: dbError } = await supabase.from('reservas').insert([{
            nombres: form.nombres,
            apellidos: form.apellidos,
            email: form.email,
            telefono: `${form.codigoPais} ${form.telefono}`,
            destino: form.destino,
            asistencia: form.asistencia || 'Ninguna',
            cotizacion: this.cotizacion,
            estatus: 'COTIZADO',
            tipo_viaje: tipoTraducido,
            pasajeros: form.pasajeros,
            aerolinea_ida: form.aerolinea,
            vuelo_ida: form.noVuelo,
            terminal_ida: terminalTexto,
            fecha_ida: form.fechaLlegada,
            hora_ida: form.horaLlegada,
            aerolinea_vuelta: isRound ? form.aerolineaSalida : null,
            vuelo_vuelta: isRound ? form.noVueloSalida : null,
            terminal_vuelta: isRound ? terminalSalidaTexto : null,
            fecha_vuelta: isRound ? form.fechaSalida : null,
            hora_vuelta: isRound ? form.horaSalida : null
        }]);

        if (dbError) throw dbError;

        // 3. Preparar bloques HTML para el correo
        // ✈️ BLOQUE DE IDA (Traducción dinámica)
        const detalleIdaHTML = `
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fff;">
            <h3 style="color: #888; font-size: 11px; text-transform: uppercase; margin-top: 0; letter-spacing: 1px;">
              ${this.lang === 'en' ? '✈️ Arrival Flight (One Way)' : '✈️ Vuelo de Llegada (Ida)'}
            </h3>
            <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Airline' : 'Aerolínea'}:</strong> ${form.aerolinea}</p>
            <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Flight' : 'Vuelo'}:</strong> ${form.noVuelo} (T${terminalTexto})</p>
            <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Date & Time' : 'Fecha y Hora'}:</strong> ${form.fechaLlegada} | ${form.horaLlegada} hrs</p>
          </div>`;

        // ✈️ BLOQUE DE VUELTA (Traducción dinámica)
        const detalleVueltaHTML = isRound ? `
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #555;">
            <h3 style="color: #888; font-size: 11px; text-transform: uppercase; margin-top: 0; letter-spacing: 1px;">
              ${this.lang === 'en' ? '✈️ Departure Flight (Return)' : '✈️ Vuelo de Salida (Regreso)'}
            </h3>
            <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Airline' : 'Aerolínea'}:</strong> ${form.aerolineaSalida}</p>
            <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Flight' : 'Vuelo'}:</strong> ${form.noVueloSalida} (T${terminalSalidaTexto})</p>
            <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Date & Time' : 'Fecha y Hora'}:</strong> ${form.fechaSalida} | ${form.horaSalida} hrs</p>
          </div>` : '';

          const cotizacionFormateada = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(this.cotizacion);

        const templateParams = {
          titulo_mensaje: this.lang === 'en' ? 'Your Trip Quote' : 'Tu Cotización de Viaje',
          mensaje_principal: this.lang === 'en' ? 'Here are the details of your requested quote.' : 'Aquí están los detalles de la cotización solicitada.',

          nombre: nombreCompleto,
          email_destino: form.email, 
          destino: form.destino,
          cotizacion: cotizacionFormateada,
          pasajeros: form.pasajeros,
          tipo: tipoTraducido,
          asistencia: form.asistencia || 'Ninguna',
          detalle_ida: detalleIdaHTML,
          detalle_vuelta: detalleVueltaHTML 
        };

        // Guardar para uso posterior
        localStorage.setItem('reserva_vancity', JSON.stringify(templateParams));
        localStorage.setItem('idioma_vancity', this.lang);

        // 4. Enviar Email y disparar WhatsApp automático
          const templateId = this.lang === 'en' ? 'template_dcmxpi5' : 'template_s5rm6yu';
          emailjs.send('service_jzr70mc', templateId, templateParams, 'AW3xttKiA-x-8jgoP')
            .catch((err) => console.error('Error al enviar el correo:', err));

        await supabase.functions.invoke('openpay-checkout', {
          body: { 
            tipoAccion: 'WHATSAPP_COTIZACION',
            nombre: nombreCompleto,
            monto: this.cotizacion,
            descripcion: form.destino,
            telefono: telLimpio,
            idioma: this.lang
          }
        });

      } catch (error) {
        console.error("Error crítico:", error);
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