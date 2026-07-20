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
      
  showSuccessModal = false;
  showAvailabilityModal = false;
  showClosedModal = false; 

  listaHoteles = [ 'Hotel InterContinental Presidente Mexico City Polanco' ];
  
  // NUEVA LISTA DE AEROPUERTOS
  listaAeropuertos = ['AICM (Benito Juárez)', 'AIFA (Felipe Ángeles)', 'AIT (Toluca)'];

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
      aeropuerto: 'AEROPUERTO', aeropuerto_ph: 'Selecciona un aeropuerto',
      aerolinea: 'AEROLÍNEA', aerolinea_ph: 'Ej. Aeroméxico', vuelo: 'NO. DE VUELO', terminal: 'TERMINAL',
      term1: 'Terminal 1', term2: 'Terminal 2', fecha_llegada: 'FECHA DE LLEGADA', fecha_salida: 'FECHA DE SALIDA',
      tipo: 'TIPO DE VIAJE', tipo_llegada: 'Llegada (Aeropuerto ➔ Hotel)', tipo_salida: 'Salida (Hotel ➔ Aeropuerto)', tipo_redondo: 'Redondo (Ambos Trayectos)',
      pasajeros: 'PASAJEROS (Max 4)', destino: 'DESTINO / ORIGEN', destino_ph: 'Hotel de referencia',
      vehiculo: 'VEHÍCULO PREFERIDO', vehiculo_ph: 'Selecciona un auto', asistencia: 'ASISTENCIA ESPECIAL',
      asistencia_opciones: { ninguna: 'Ninguna', silla: 'Silla de Ruedas', bebe: 'Asiento para Bebé', mascota: 'Mascota en Transportadora', otro: 'Otro (Especificar en notas)'},
      tarifa: 'TARIFA ESTIMADA', terminos: '* Incluye IVA (16%).', btn_cotizando: 'CALCULANDO...', btn_cotizar: 'COTIZAR VIAJE',
      btn_pagar: 'PROCEDER AL PAGO SEGURO', alerta: '¡Listo para cobrar $', titulo_llegada: 'DATOS DE VUELO DE LLEGADA',
      titulo_salida: 'DATOS DE VUELO DE SALIDA', hora_llegada: 'HORA DE ATERRIZAJE', hora_salida: 'HORA DE DESPEGUE', hora_recogida_hotel: 'HORA DE RECOGIDA (EN EL HOTEL)',
      
      // NUEVO: Textos de la caja de viaje redondo
      info_redondo_titulo: 'Viaje Redondo Incluido',
      info_redondo_desc: 'Contamos con dos salidas hacia Cuernavaca. Tu compra cubre el traslado de ida y el regreso único programado para el <strong>domingo 20 a las 12:30 pm. Si tus salidas no coinciden con  las fechas programadas favor de contactarnos via whatsapp.</strong>.'
    },
    en: {
      titulo: 'Executive Vehicle Service', nombres: 'FIRST NAME', apellidos: 'LAST NAME',
      nombres_ph: 'E.g. Robert', apellidos_ph: 'E.g. Martin', email: 'CORPORATE EMAIL', telefono: 'PHONE NUMBER',
      aeropuerto: 'AIRPORT', aeropuerto_ph: 'Select an airport',
      aerolinea: 'AIRLINE', aerolinea_ph: 'E.g. Delta Airlines', vuelo: 'FLIGHT NUMBER', terminal: 'TERMINAL',
      term1: 'Terminal 1', term2: 'Terminal 2', fecha_llegada: 'ARRIVAL DATE', fecha_salida: 'DEPARTURE DATE',
      tipo: 'TRIP TYPE', tipo_llegada: 'Arrival (Airport ➔ Hotel)', tipo_salida: 'Departure (Hotel ➔ Airport)', tipo_redondo: 'Round Trip', pasajeros: 'PASSENGERS (Max 4)',
      destino: 'DESTINATION / HOTEL', destino_ph: 'Reference hotel', vehiculo: 'PREFERRED VEHICLE', vehiculo_ph: 'Select a car',
      asistencia: 'SPECIAL ASSISTANCE', asistencia_opciones: { ninguna: 'None', silla: 'Wheelchair', bebe: 'Baby Seat', mascota: 'Pet in Carrier', otro: 'Other (Specify in notes)'},
      tarifa: 'ESTIMATED FARE', terminos: '* Tax included (16%). ', btn_cotizando: 'CALCULATING...', btn_cotizar: 'GET QUOTE',
      btn_pagar: 'PROCEED TO SECURE PAYMENT', alerta: 'Ready to charge $', titulo_llegada: 'ARRIVAL FLIGHT DETAILS',
      titulo_salida: 'DEPARTURE FLIGHT DETAILS', hora_llegada: 'LANDING TIME', hora_salida: 'DEPARTURE TIME', hora_recogida_hotel: 'HOTEL PICKUP TIME',
      info_redondo_titulo: 'Round Trip Included',
      info_redondo_desc: 'We have two departures to Cuernavaca. Your purchase covers the outbound transfer and the single return trip scheduled for <strong>Sunday 20th at 12:30 pm. If your departures do not match the scheduled dates, please contact us via WhatsApp.</strong>.'
    }
  };

  toggleLanguage() { this.lang = this.lang === 'es' ? 'en' : 'es'; }

  closeModal() { this.showAvailabilityModal = false; }
  closeSuccessModal() {
    this.showSuccessModal = false;
    localStorage.removeItem('reserva_vancity');
    localStorage.removeItem('idioma_vancity');
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    // Inicializamos sin Validators.required en los vuelos para ponerlos dinámicamente
    this.reservationForm = this.fb.group({
      nombres: ['', Validators.required], apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]], codigoPais: ['+52', Validators.required],
      telefono: ['', Validators.required], tipoViaje: ['llegada', Validators.required],
      pasajeros: [1, [Validators.required, Validators.min(1), Validators.max(4)]],
      vehiculo: ['', Validators.required], destino: ['', Validators.required],
      
      aeropuertoLlegada: [''], aerolinea: [''], noVuelo: [''], terminal: ['t1'],
      fechaLlegada: [''], horaLlegada: [''],
      
      aeropuertoSalida: [''], aerolineaSalida: [''], noVueloSalida: [''], terminalSalida: ['t1'], 
      fechaSalida: [''], horaSalida: [''], horaRecogidaHotel: [''],
      
      asistencia: ['ninguna'] 
    });

    this.reservationForm.valueChanges.subscribe(() => { this.cotizacion = null; });
  }

  ngOnInit() {
    if (this.showClosedModal) {
      this.reservationForm.disable();
    }

    // MAGIA DE UX: Encender y apagar validaciones según el tipo de viaje
    this.reservationForm.get('tipoViaje')?.valueChanges.subscribe(tipo => {
      this.cotizacion = null;
      
      const idaFields = ['aeropuertoLlegada', 'aerolinea', 'noVuelo', 'fechaLlegada', 'horaLlegada'];
      const vueltaFields = ['aeropuertoSalida', 'aerolineaSalida', 'noVueloSalida', 'fechaSalida', 'horaSalida', 'horaRecogidaHotel'];

      // Primero limpiamos todos
      idaFields.forEach(f => this.reservationForm.get(f)?.clearValidators());
      vueltaFields.forEach(f => this.reservationForm.get(f)?.clearValidators());

      // Luego aplicamos los necesarios
      if (tipo === 'llegada' || tipo === 'redondo') {
        idaFields.forEach(f => this.reservationForm.get(f)?.setValidators(Validators.required));
      }
      if (tipo === 'salida' || tipo === 'redondo') {
        vueltaFields.forEach(f => this.reservationForm.get(f)?.setValidators(Validators.required));
      }

      // Refrescamos el estado del formulario
      idaFields.forEach(f => this.reservationForm.get(f)?.updateValueAndValidity());
      vueltaFields.forEach(f => this.reservationForm.get(f)?.updateValueAndValidity());
    });
    
    // Forzamos la validación inicial para "llegada"
    this.reservationForm.get('tipoViaje')?.setValue('llegada');

    this.reservationForm.get('vehiculo')?.valueChanges.subscribe(vehiculo => {
      if (vehiculo === 'Sedan') {
        this.opcionesPasajeros = [1, 2, 3];
        if (this.reservationForm.value.pasajeros > 3) this.reservationForm.patchValue({ pasajeros: 1 });
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
      const hora = this.reservationForm.get('horaRecogidaHotel')?.value;
      if (fecha && hora) this.validarHorarioDisp(fecha, hora, 'horaRecogidaHotel');
    });

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const openpayId = urlParams.get('id'); 

      if (openpayId) {
        supabase.functions.invoke('openpay-checkout', { 
          body: { action: 'verify', transaction_id: openpayId } 
        }).then(({ data, error }) => {
          if (error || !data || data.status !== 'completed') {
             alert(this.lang === 'en' ? 'Payment could not be completed.' : 'El pago no pudo ser procesado.');
             window.history.replaceState({}, document.title, window.location.pathname); return; 
          }

          const datosGuardados = localStorage.getItem('reserva_vancity');
          const idiomaGuardado = localStorage.getItem('idioma_vancity') || 'es';

          if (datosGuardados) {
            const datosCorreo = JSON.parse(datosGuardados);
            const templatePagoParams = {
              titulo_mensaje: idiomaGuardado === 'en' ? '✅ Payment Confirmed' : '✅ Pago Confirmado',
              mensaje_principal: idiomaGuardado === 'en' ? 'Thank you! Your unit is reserved.' : '¡Gracias! Tu unidad está reservada.',
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
      const { data } = await supabase.from('reservas').select('fecha_ida, hora_ida, fecha_vuelta, hora_vuelta').eq('estatus', 'PAGADO').or(`fecha_ida.eq.${fecha},fecha_vuelta.eq.${fecha}`);
      if (data) {
        const reqMin = this.timeToMinutes(hora);
        let overlaps = 0;
        data.forEach(res => {
          if (res.fecha_ida === fecha && res.hora_ida) {
            if (Math.abs(reqMin - this.timeToMinutes(res.hora_ida)) < 180) overlaps++; 
          }
          if (res.fecha_vuelta === fecha && res.hora_vuelta) {
            if (Math.abs(reqMin - this.timeToMinutes(res.hora_vuelta)) < 180) overlaps++;
          }
        });
        if (overlaps >= 3) {
          this.showAvailabilityModal = true;
          this.reservationForm.get(campoHora)?.setValue('');
          this.cotizacion = null;
        }
      }
    } catch (err) {} finally {
      this.isSubmitting = false; this.cdr.detectChanges();
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
      this.reservationForm.patchValue({ horaSalida: `${h}:${m}` });
    }
  }

  actualizarHoraRecogida(h: string, m: string) {
    if (h && m) {
      const horaCompleta = `${h}:${m}`;
      this.reservationForm.patchValue({ horaRecogidaHotel: horaCompleta });
      this.validarHorarioDisp(this.reservationForm.get('fechaSalida')?.value, horaCompleta, 'horaRecogidaHotel');
    }
  }

  async onSubmit() {
    if (this.reservationForm.valid) {
      const form = this.reservationForm.value;
      const isLlegada = form.tipoViaje === 'llegada';
      const isSalida = form.tipoViaje === 'salida';
      const isRound = form.tipoViaje === 'redondo';
      
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
        let tipoTraducido = isRound ? 'Round Trip' : (isLlegada ? 'Arrival (One Way)' : 'Departure (One Way)');

        // DATA PARA LA BASE DE DATOS
        const dataInsert = {
            nombres: form.nombres, apellidos: form.apellidos, email: form.email, telefono: `${form.codigoPais} ${form.telefono}`, destino: form.destino,
            asistencia: form.asistencia || 'Ninguna', cotizacion: this.cotizacion, estatus: 'COTIZADO', tipo_viaje: tipoTraducido, vehiculo: form.vehiculo, pasajeros: form.pasajeros,
            
            // LLEGADA (Guardado en campos de IDA)
            aeropuerto_ida: isLlegada || isRound ? form.aeropuertoLlegada : null,
            aerolinea_ida: isLlegada || isRound ? form.aerolinea : null, 
            vuelo_ida: isLlegada || isRound ? form.noVuelo : null, 
            terminal_ida: isLlegada || isRound ? terminalTexto : null, 
            fecha_ida: isLlegada || isRound ? form.fechaLlegada : null, 
            hora_ida: isLlegada || isRound ? form.horaLlegada : null,
            
            // SALIDA (Guardado en campos de VUELTA y nuevo campo)
            aeropuerto_vuelta: isSalida || isRound ? form.aeropuertoSalida : null,
            aerolinea_vuelta: isSalida || isRound ? form.aerolineaSalida : null, 
            vuelo_vuelta: isSalida || isRound ? form.noVueloSalida : null,
            terminal_vuelta: isSalida || isRound ? terminalSalidaTexto : null, 
            fecha_vuelta: isSalida || isRound ? form.fechaSalida : null, 
            hora_vuelta: isSalida || isRound ? form.horaSalida : null,
            hora_recogida_hotel: isSalida || isRound ? form.horaRecogidaHotel : null
        };

        const { data, error } = await supabase.from('reservas').insert([dataInsert]).select(); 
        if (data && data.length > 0) this.reservaGeneradaId = data[0].id;

        // EMAILS
        const detalleIdaHTML = (isLlegada || isRound) ? `<div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fff;"><h3 style="color: #888; font-size: 11px; text-transform: uppercase; margin-top: 0; letter-spacing: 1px;">${this.lang === 'en' ? '✈️ Arrival Flight' : '✈️ Vuelo de Llegada'}</h3><p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Airport' : 'Aeropuerto'}:</strong> ${form.aeropuertoLlegada}</p><p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Airline & Flight' : 'Aerolínea y Vuelo'}:</strong> ${form.aerolinea} - ${form.noVuelo} (T${terminalTexto})</p><p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Landing Time' : 'Aterrizaje'}:</strong> ${form.fechaLlegada} | ${form.horaLlegada} hrs</p></div>` : '';
        
        const detalleVueltaHTML = (isSalida || isRound) ? `<div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #555;"><h3 style="color: #888; font-size: 11px; text-transform: uppercase; margin-top: 0; letter-spacing: 1px;">${this.lang === 'en' ? '✈️ Departure Flight' : '✈️ Vuelo de Salida'}</h3><p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Airport' : 'Aeropuerto'}:</strong> ${form.aeropuertoSalida}</p><p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Airline & Flight' : 'Aerolínea y Vuelo'}:</strong> ${form.aerolineaSalida} - ${form.noVueloSalida} (T${terminalSalidaTexto})</p><p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Flight Time' : 'Despegue'}:</strong> ${form.fechaSalida} | ${form.horaSalida} hrs</p><p style="margin: 10px 0 0 0; color: #e11d48; font-size: 14px; font-weight: bold;"><strong>${this.lang === 'en' ? 'Hotel Pickup Time' : 'Hora de Recogida'}:</strong> ${form.horaRecogidaHotel} hrs</p></div>` : '';
        
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
        supabase.functions.invoke('openpay-checkout', { body: { tipoAccion: 'WHATSAPP_COTIZACION', nombre: nombreCompleto, email: form.email, monto: this.cotizacion, descripcion: `Traslado - ${form.destino}`, telefono: telLimpio, idioma: this.lang } }).catch();

      } else {
          this.pagoIniciado = true; 
          this.cdr.detectChanges(); 
          try {
            const urlRetorno = window.location.origin + window.location.pathname; 
            const datosPago = {
              monto: this.cotizacion, nombre: `${this.reservationForm.value.nombres} ${this.reservationForm.value.apellidos}`,
              email: this.reservationForm.value.email, descripcion: `Traslado Ejecutivo Vancity`, redirectUrl: urlRetorno, reserva_id: this.reservaGeneradaId 
            };
            const { data, error } = await supabase.functions.invoke('openpay-checkout', { body: datosPago });
            if (error || (data && data.error)) {
              alert('Hubo un error con el banco. Intenta dar clic de nuevo.');
              this.pagoIniciado = false; this.cdr.detectChanges(); return;
            }
            window.location.href = data.checkoutLink; 
          } catch (fatalError) {
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