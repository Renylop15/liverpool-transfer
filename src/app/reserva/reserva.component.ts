import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { createClient } from '@supabase/supabase-js'; 
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { RouterModule } from '@angular/router'; 

const supabaseUrl = 'https://chyuacdnyaduqnawsoii.supabase.co'; 
const supabaseKey = 'sb_publishable_j34PDqBJtmzklQqnP6kL4A_AxNnerKR'; 
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,NgxMaterialTimepickerModule, RouterModule],
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.css'
})
export class ReservaComponent implements OnInit {
  reservationForm: FormGroup;
  isSubmitting = false;
  pagoIniciado = false;
  cotizacion: number | null = null;
  lang: 'es' | 'en' = 'en'; 
  horas: string[] = [];
  minutos: string[] = [];
  
  opcionesPasajeros: number[] = [1, 2, 3, 4];
  reservaGeneradaId: string | null = null; 
      
  // ==========================================
  // VARIABLES DE CONTROL DE MODALES
  // ==========================================
  showSuccessModal = false;
  showAvailabilityModal = false;
  
  // 🚨 SWITCH DE CIERRE DE FORMULARIO:
  // Cambia a 'false' cuando vuelvas a tener unidades disponibles.
  showClosedModal = true; 

  listaHoteles = ['Hotel Hyatt Regency Mexico City','Hotel JW Marriott Mexico City Polanco', 'Hotel InterContinental Presidente Mexico City Polanco' ];

  aerolineasPopulares = [
  "Aeroméxico", "Volaris", "Viva Aerobus", "Copa Airlines", "Avianca", "LATAM Airlines", 
  "Aerolíneas Argentinas", "Sky Airline", "JetSmart", "TAG Airlines", "AeroMéxico Connect",
  "American Airlines", "Delta Airlines", "United Airlines", "Southwest Airlines", 
  "Alaska Airlines", "JetBlue Airways", "Spirit Airlines", "Frontier Airlines", 
  "Allegiant Air", "Hawaiian Airlines", "Sun Country Airlines", "Air Canada", 
  "WestJet", "Air Transat", "Porter Airlines", "Flair Airlines",
  "Lufthansa", "Air France", "Iberia", "British Airways", "KLM", "Swiss International", 
  "Austrian Airlines", "TAP Air Portugal", "Alitalia", "ITA Airways", "Turkish Airlines", 
  "Aeroflot", "SAS Scandinavian", "Finnair", "Brussels Airlines", "Virgin Atlantic", 
  "Icelandair", "LOT Polish Airlines", "Air Europa", "Norwegian Air", "Ryanair", 
  "EasyJet", "Vueling", "Wizz Air", "Eurowings", "Condor",
  "Emirates", "Qatar Airways", "Etihad Airways", "Singapore Airlines", "Cathay Pacific", 
  "All Nippon Airways (ANA)", "Japan Airlines (JAL)", "Korean Air", "Asiana Airlines", 
  "China Southern Airlines", "China Eastern Airlines", "Air China", "Hainan Airlines", 
  "Thai Airways", "Malaysia Airlines", "Vietnam Airlines", "Garuda Indonesia", 
  "Philippine Airlines", "Eva Air", "Air India", "IndiGo", "Saudia", "El Al", 
  "Turkish Airlines", "Royal Jordanian", "Oman Air",
  "Qantas", "Air New Zealand", "Virgin Australia", "Jetstar", "Ethiopian Airlines", 
  "South African Airways", "EgyptAir", "Kenya Airways", "Royal Air Maroc",
  "NetJets", "Flexjet", "VistaJet", "Wheels Up", "Charter Privado", "Vuelo Privado"
  ].sort(); 

  textos = {
    es: {
      titulo: 'Servicio Ejecutivo de Vehículos', nombres: 'NOMBRE(S)', apellidos: 'APELLIDOS',
      nombres_ph: 'Ej. Roberto', apellidos_ph: 'Ej. Martínez', email: 'EMAIL CORPORATIVO', telefono: 'TELÉFONO',
      aerolinea: 'AEROLÍNEA', aerolinea_ph: 'Ej. Aeroméxico', vuelo: 'NO. DE VUELO', terminal: 'TERMINAL',
      term1: 'Terminal 1', term2: 'Terminal 2', fecha_llegada: 'FECHA DE LLEGADA', fecha_salida: 'FECHA DE SALIDA',
      tipo: 'TIPO DE VIAJE', tipo_sencillo: 'Sencillo (One Way)', tipo_redondo: 'Redondo (Round Trip)',
      pasajeros: 'PASAJEROS (Max 4)', destino: 'DESTINO / HOTEL', destino_ph: 'Ubicación de llegada',
      vehiculo: 'VEHÍCULO PREFERIDO', vehiculo_ph: 'Selecciona un auto', asistencia: 'ASISTENCIA ESPECIAL',
      asistencia_opciones: { ninguna: 'Ninguna', silla: 'Silla de Ruedas', bebe: 'Asiento para Bebé', mascota: 'Mascota en Transportadora', otro: 'Otro (Especificar en notas)'},
      tarifa: 'TARIFA ESTIMADA', terminos: '* Incluye IVA (16%).', btn_cotizando: 'CALCULANDO...', btn_cotizar: 'COTIZAR VIAJE',
      btn_pagar: 'PROCEDER AL PAGO SEGURO', alerta: '¡Listo para cobrar $', titulo_llegada: 'DATOS DE VUELO DE LLEGADA',
      titulo_salida: 'DATOS DE VUELO DE SALIDA', hora_llegada: 'HORA DE LLEGADA', hora_salida: 'HORA DE SALIDA'
    },
    en: {
      titulo: 'Executive Vehicle Service', nombres: 'FIRST NAME', apellidos: 'LAST NAME',
      nombres_ph: 'E.g. Robert', apellidos_ph: 'E.g. Martin', email: 'CORPORATE EMAIL', telefono: 'PHONE NUMBER',
      aerolinea: 'AIRLINE', aerolinea_ph: 'E.g. Delta Airlines', vuelo: 'FLIGHT NUMBER', terminal: 'TERMINAL',
      term1: 'Terminal 1', term2: 'Terminal 2', fecha_llegada: 'ARRIVAL DATE', fecha_salida: 'DEPARTURE DATE',
      tipo: 'TRIP TYPE', tipo_sencillo: 'One Way', tipo_redondo: 'Round Trip', pasajeros: 'PASSENGERS (Max 4)',
      destino: 'DESTINATION / HOTEL', destino_ph: 'Drop-off location', vehiculo: 'PREFERRED VEHICLE', vehiculo_ph: 'Select a car',
      asistencia: 'SPECIAL ASSISTANCE', asistencia_opciones: { ninguna: 'None', silla: 'Wheelchair', bebe: 'Baby Seat', mascota: 'Pet in Carrier', otro: 'Other (Specify in notes)'},
      tarifa: 'ESTIMATED FARE', terminos: '* Tax included (16%). ', btn_cotizando: 'CALCULATING...', btn_cotizar: 'GET QUOTE',
      btn_pagar: 'PROCEED TO SECURE PAYMENT', alerta: 'Ready to charge $', titulo_llegada: 'ARRIVAL FLIGHT DETAILS',
      titulo_salida: 'DEPARTURE FLIGHT DETAILS', hora_llegada: 'ARRIVAL TIME', hora_salida: 'DEPARTURE TIME',
    }
  };

  toggleLanguage() { this.lang = this.lang === 'es' ? 'en' : 'es'; }

  closeModal() {
    this.showAvailabilityModal = false;
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    localStorage.removeItem('reserva_vancity');
    localStorage.removeItem('idioma_vancity');
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.reservationForm = this.fb.group({
      nombres: ['', Validators.required], apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]], codigoPais: ['+52', Validators.required],
      telefono: ['', Validators.required], tipoViaje: ['one_way', Validators.required],
      pasajeros: [1, [Validators.required, Validators.min(1), Validators.max(4)]],
      vehiculo: ['', Validators.required], destino: ['', Validators.required],
      aerolinea: ['', Validators.required], noVuelo: ['', Validators.required], terminal: ['t1', Validators.required],
      fechaLlegada: ['', Validators.required], horaLlegada: ['', Validators.required],
      aerolineaSalida: [''], noVueloSalida: [''], terminalSalida: ['t1'], fechaSalida: [''], horaSalida: [''],
      asistencia: ['ninguna'] 
    });

    this.reservationForm.valueChanges.subscribe(() => { this.cotizacion = null; });
  }

  ngOnInit() {
    // Si el modal de cerrado está activo, bloqueamos el formulario por seguridad
    if (this.showClosedModal) {
      this.reservationForm.disable();
    }

    this.reservationForm.get('vehiculo')?.valueChanges.subscribe(vehiculo => {
      if (vehiculo === 'Sedan') {
        this.opcionesPasajeros = [1, 2, 3];
        if (this.reservationForm.value.pasajeros > 3) {
          this.reservationForm.patchValue({ pasajeros: 1 });
        }
      } else if (vehiculo === 'SUV') {
        this.opcionesPasajeros = [1, 2, 3, 4];
      }
      this.cotizacion = null;
    });
    
    this.reservationForm.get('fechaLlegada')?.valueChanges.subscribe(fecha => {
      const hora = this.reservationForm.get('horaLlegada')?.value;
      if (fecha && hora) this.validarHorarioDisp(fecha, hora, 'horaLlegada');
    });

    this.reservationForm.get('fechaSalida')?.valueChanges.subscribe(fecha => {
      const hora = this.reservationForm.get('horaSalida')?.value;
      if (fecha && hora) this.validarHorarioDisp(fecha, hora, 'horaSalida');
    });

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const openpayId = urlParams.get('id'); 

      if (openpayId) {
        supabase.functions.invoke('openpay-checkout', { 
          body: { action: 'verify', transaction_id: openpayId } 
        }).then(({ data, error }) => {
          
          if (error || !data || data.status !== 'completed') {
             alert(this.lang === 'en' 
                ? 'Payment could not be completed. The bank declined the authorization. Please try a different card.' 
                : 'El pago no pudo ser procesado o el banco declinó la autorización. Por favor intenta con otro método de pago.');
             window.history.replaceState({}, document.title, window.location.pathname);
             return; 
          }

          const datosGuardados = localStorage.getItem('reserva_vancity');
          const idiomaGuardado = localStorage.getItem('idioma_vancity') || 'es';

          if (datosGuardados) {
            const datosCorreo = JSON.parse(datosGuardados);

            const templatePagoParams = {
              titulo_mensaje: idiomaGuardado === 'en' ? '✅ Payment Confirmed' : '✅ Pago Confirmado',
              mensaje_principal: idiomaGuardado === 'en' ? 'Thank you! Your payment was successful and your unit is reserved.' : '¡Gracias! Hemos recibido tu pago exitosamente. Tu unidad está reservada.',
              nombre: datosCorreo.nombre, email_destino: datosCorreo.email_destino, folio: openpayId,
              tipo_servicio: datosCorreo.tipo_servicio, monto: datosCorreo.cotizacion
            };
            
            emailjs.send('service_gepyy7k', 'template_giiio1o', templatePagoParams, '8BD-wbQdkJaPiLyLx').catch(() => {});
            supabase.from('reservas').update({ estatus: 'PAGADO' }).eq('email', datosCorreo.email_destino).then(() => {});
            
            this.showSuccessModal = true;
            this.cdr.detectChanges(); 
          }
        });
      }
    }
    
    for (let i = 0; i < 24; i++) this.horas.push(i.toString().padStart(2, '0'));
    for (let i = 0; i < 60; i++) this.minutos.push(i.toString().padStart(2, '0'));
  }

  timeToMinutes(timeStr: string): number {
    if(!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
  }

  async validarHorarioDisp(fecha: string, hora: string, campoHora: string) {
    if (!fecha || !hora) return;

    this.isSubmitting = true;
    this.cdr.detectChanges();

    try {
      const { data } = await supabase.from('reservas')
        .select('fecha_ida, hora_ida, fecha_vuelta, hora_vuelta')
        .eq('estatus', 'PAGADO')
        .or(`fecha_ida.eq.${fecha},fecha_vuelta.eq.${fecha}`);

      if (data) {
        const reqMin = this.timeToMinutes(hora);
        let overlaps = 0;

        data.forEach(res => {
          if (res.fecha_ida === fecha && res.hora_ida) {
            const resMin = this.timeToMinutes(res.hora_ida);
            if (Math.abs(reqMin - resMin) < 180) overlaps++; 
          }
          if (res.fecha_vuelta === fecha && res.hora_vuelta) {
            const resMin = this.timeToMinutes(res.hora_vuelta);
            if (Math.abs(reqMin - resMin) < 180) overlaps++;
          }
        });

        if (overlaps >= 3) {
          this.showAvailabilityModal = true;
          this.reservationForm.get(campoHora)?.setValue('');
          this.cotizacion = null;
        }
      }
    } catch (err) {
      console.error('Error validando disponibilidad:', err);
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  actualizarHoraLlegada(h: string, m: string) {
    if (h && m) {
      const horaCompleta = `${h}:${m}`;
      this.reservationForm.patchValue({ horaLlegada: horaCompleta });
      this.validarHorarioDisp(this.reservationForm.get('fechaLlegada')?.value, horaCompleta, 'horaLlegada');
    }
  }

  actualizarHoraSalida(h: string, m: string) {
    if (h && m) {
      const horaCompleta = `${h}:${m}`;
      this.reservationForm.patchValue({ horaSalida: horaCompleta });
      this.validarHorarioDisp(this.reservationForm.get('fechaSalida')?.value, horaCompleta, 'horaSalida');
    }
  }

  async onSubmit() {
    if (this.reservationForm.valid) {
      const form = this.reservationForm.value;
      const isRound = form.tipoViaje === 'round_trip';
      const terminalTexto = form.terminal.toUpperCase();
      const terminalSalidaTexto = form.terminalSalida ? form.terminalSalida.toUpperCase() : '';
      const nombreCompleto = `${form.nombres} ${form.apellidos}`;
      let telLimpio = `${form.codigoPais}${form.telefono}`.replace('+', '').replace(/\s/g, '');
      if (telLimpio.startsWith('521')) telLimpio = '52' + telLimpio.substring(3);

      if (this.cotizacion === null) {
        const tipoAuto = form.vehiculo ? form.vehiculo.toLowerCase() : '';
        if (tipoAuto.includes('suv')) {
          this.cotizacion = isRound ? 4330.00 : 2500.00;
        } else {
          this.cotizacion = isRound ? 3328.00 : 1914.00;
        }

        this.isSubmitting = false; 
        this.cdr.detectChanges(); 
        let tipoTraducido = isRound ? (this.lang === 'en' ? 'Round Trip' : 'Redondo') : (this.lang === 'en' ? 'One Way' : 'Sencillo');

        const { data, error } = await supabase.from('reservas').insert([{
            nombres: form.nombres, apellidos: form.apellidos, email: form.email, telefono: `${form.codigoPais} ${form.telefono}`, destino: form.destino,
            asistencia: form.asistencia || 'Ninguna', cotizacion: this.cotizacion, estatus: 'COTIZADO', tipo_viaje: tipoTraducido, vehiculo: form.vehiculo, pasajeros: form.pasajeros,
            aerolinea_ida: form.aerolinea, vuelo_ida: form.noVuelo, terminal_ida: terminalTexto, fecha_ida: form.fechaLlegada, hora_ida: form.horaLlegada,
            aerolinea_vuelta: isRound ? form.aerolineaSalida : null, vuelo_vuelta: isRound ? form.noVueloSalida : null,
            terminal_vuelta: isRound ? terminalSalidaTexto : null, fecha_vuelta: isRound ? form.fechaSalida : null, hora_vuelta: isRound ? form.horaSalida : null
        }]).select(); 

        if (data && data.length > 0) {
          this.reservaGeneradaId = data[0].id; 
        }

        const detalleIdaHTML = `<div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fff;"><h3 style="color: #888; font-size: 11px; text-transform: uppercase; margin-top: 0; letter-spacing: 1px;">${this.lang === 'en' ? '✈️ Arrival Flight (One Way)' : '✈️ Vuelo de Llegada (Ida)'}</h3><p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Airline' : 'Aerolínea'}:</strong> ${form.aerolinea}</p><p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Flight' : 'Vuelo'}:</strong> ${form.noVuelo} (T${terminalTexto})</p><p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Date & Time' : 'Fecha y Hora'}:</strong> ${form.fechaLlegada} | ${form.horaLlegada} hrs</p></div>`;
        const detalleVueltaHTML = isRound ? `<div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #555;"><h3 style="color: #888; font-size: 11px; text-transform: uppercase; margin-top: 0; letter-spacing: 1px;">${this.lang === 'en' ? '✈️ Departure Flight (Return)' : '✈️ Vuelo de Salida (Regreso)'}</h3><p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Airline' : 'Aerolínea'}:</strong> ${form.aerolineaSalida}</p><p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Flight' : 'Vuelo'}:</strong> ${form.noVueloSalida} (T${terminalSalidaTexto})</p><p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Date & Time' : 'Fecha y Hora'}:</strong> ${form.fechaSalida} | ${form.horaSalida} hrs</p></div>` : '';
        const cotizacionFormateada = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.cotizacion);

        const templateCotizacionParams = {
          titulo_mensaje: this.lang === 'en' ? 'Your Trip Quote' : 'Tu Cotización de Viaje',
          mensaje_principal: this.lang === 'en' ? 'Here are the details of your requested quote.' : 'Aquí están los detalles de la cotización solicitada.',
          nombre: nombreCompleto, email_destino: form.email, destino: form.destino, cotizacion: cotizacionFormateada, pasajeros: form.pasajeros, tipo_servicio: `${form.vehiculo} - ${tipoTraducido}`,
          asistencia: form.asistencia || 'Ninguna', detalle_ida: detalleIdaHTML, detalle_vuelta: detalleVueltaHTML 
        };

        localStorage.setItem('reserva_vancity', JSON.stringify(templateCotizacionParams));
        localStorage.setItem('idioma_vancity', this.lang);

        emailjs.send('service_gepyy7k', 'template_yyc4gkw', templateCotizacionParams, '8BD-wbQdkJaPiLyLx').catch();
        supabase.functions.invoke('openpay-checkout', { body: { tipoAccion: 'WHATSAPP_COTIZACION', nombre: nombreCompleto, email: form.email, monto: this.cotizacion, descripcion: form.destino, telefono: telLimpio, idioma: this.lang } }).catch();

      } else {
          this.pagoIniciado = true; 
          this.cdr.detectChanges(); 
          try {
            const urlRetorno = window.location.origin + window.location.pathname;
            
            const datosPago = {
              monto: this.cotizacion, 
              nombre: `${this.reservationForm.value.nombres} ${this.reservationForm.value.apellidos}`,
              email: this.reservationForm.value.email, 
              descripcion: `Traslado Ejecutivo Vancity`, 
              redirectUrl: urlRetorno,
              reserva_id: this.reservaGeneradaId 
            };
            
            const { data, error } = await supabase.functions.invoke('openpay-checkout', { body: datosPago });
            if (error || (data && data.error)) {
              alert('Hubo un error con el banco. Intenta dar clic de nuevo.');
              this.pagoIniciado = false; this.cdr.detectChanges(); return;
            }
            window.location.href = data.checkoutLink; 
          } catch (fatalError) {
            console.error('Error de conexión:', fatalError);
            this.pagoIniciado = false; this.cdr.detectChanges();
          }
      }
    }
  }

  soloNumeros(event: KeyboardEvent) {
    const tecla = event.key;
    if (tecla < '0' || tecla > '9') event.preventDefault();
  }
}