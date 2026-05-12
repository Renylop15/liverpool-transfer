import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { createClient } from '@supabase/supabase-js'; 
import { RouterModule } from '@angular/router';
import emailjs from '@emailjs/browser'; 

const supabaseUrl = 'https://chyuacdnyaduqnawsoii.supabase.co'; 
const supabaseKey = 'sb_publishable_j34PDqBJtmzklQqnP6kL4A_AxNnerKR'; 
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-reserva-chofer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reserva-chofer.component.html',
  styleUrl: './reserva-chofer.component.css'
})
export class ReservaChoferComponent implements OnInit {
  reservaForm!: FormGroup;
  lang: 'en' | 'es' = 'en';
  loading = false; 
  pagoIniciado = false; 
  cotizacion: number | null = null; 

  horas: string[] = [];
  minutos: string[] = [];

  // NUEVAS VARIABLES PARA EL FLUJO EMPRESARIAL
  reservaGeneradaId: string | null = null; 
  showSuccessModal = false;
  showAvailabilityModal = false; // Por si luego añades validación de choferes

  // ==========================================
  // VARIABLES PARA OPENSTREETMAP (LIVE SEARCH)
  // ==========================================
  resultadosOSM: any[] = []; 
  resultadosDestinosOSM: { [key: number]: any[] } = {}; 
  searchTimeout: any;

  texts: any = {
    en: {
      title: 'Private Chauffeur Service',
      firstName: 'First Name',
      lastName: 'Last Name',
      pickup_time: 'Start Time',
      serviceType: 'Duration',
      halfDay: 'Half Day (Up to 5 Hours)',
      fullDay: 'Full Day (Up to 10 Hours)',
      pickup: 'Pickup Location (Hotel / Address)'
    },
    es: {
      title: 'Servicio de Chofer Privado',
      firstName: 'Nombre',
      lastName: 'Apellido',
      pickup_time: 'Hora de Inicio',
      serviceType: 'Duración',
      halfDay: 'Medio Día (Hasta 5 Horas)',
      fullDay: 'Día Completo (Hasta 10 Horas)',
      pickup: 'Lugar de Recogida (Hotel o Dirección)'
    }
  };

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    for (let i = 0; i < 24; i++) {
      this.horas.push(i < 10 ? '0' + i : i.toString());
    }
    for (let i = 0; i < 60; i += 5) {
      this.minutos.push(i < 10 ? '0' + i : i.toString());
    }
  }

  // MÉTODO PARA CERRAR EL MODAL Y LIMPIAR LA URL
  closeSuccessModal() {
    this.showSuccessModal = false;
    localStorage.removeItem('chofer_vancity');
    localStorage.removeItem('idioma_vancity');
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const openpayId = urlParams.get('id'); 

      if (openpayId) {
        // VERIFICAMOS CON OPENPAY
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

          const datosGuardados = localStorage.getItem('chofer_vancity');
          const idiomaGuardado = localStorage.getItem('idioma_vancity') || 'es';

          if (datosGuardados) {
            const datosCorreo = JSON.parse(datosGuardados);

            const templatePagoParams = {
              titulo_mensaje: idiomaGuardado === 'en' ? '✅ Payment Confirmed' : '✅ Pago Confirmado',
              mensaje_principal: idiomaGuardado === 'en' 
                ? 'Thank you! Your payment was successful and your chauffeur is reserved.' 
                : '¡Gracias! Hemos recibido tu pago exitosamente. Tu chofer está reservado.',
              nombre: datosCorreo.nombre,
              email_destino: datosCorreo.email_destino,
              folio: openpayId,
              tipo_servicio: datosCorreo.tipo_servicio, 
              monto: datosCorreo.cotizacion
            };

            emailjs.send('service_gepyy7k', 'template_giiio1o', templatePagoParams, '8BD-wbQdkJaPiLyLx').catch(() => {});

            supabase.from('reservas_chofer').update({ estatus: 'PAGADO' }).eq('email', datosCorreo.email_destino).then(() => {});

            // ACTIVAMOS EL MODAL BONITO EN LUGAR DEL ALERT
            this.showSuccessModal = true;
            this.cdr.detectChanges();
          }
        });
      }
    }

    this.reservaForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo_cliente: ['', [Validators.required, Validators.email]],
      codigoPais: ['+52', Validators.required],
      telefono: ['', Validators.required],
      vehiculo: ['', Validators.required], 
      duracion: ['', Validators.required],
      fecha_servicio: ['', Validators.required],
      hora_recogida: ['', Validators.required], 
      lugar_recogida: ['', Validators.required], 
      destinos: this.fb.array([this.fb.control('', Validators.required)]) 
    });

    this.reservaForm.valueChanges.subscribe(() => {
      this.cotizacion = null;
    });
  }

  // ==========================================
  // GESTIÓN DE DESTINOS DINÁMICOS
  // ==========================================
  get destinos() {
    return this.reservaForm.get('destinos') as FormArray;
  }

  agregarDestino() {
    this.destinos.push(this.fb.control('', Validators.required));
  }

  quitarDestino(index: number) {
    if (this.destinos.length > 1) {
      this.destinos.removeAt(index);
    }
  }

  actualizarHoraSalida(h: string, m: string) {
    if (h && m) {
      this.reservaForm.patchValue({ hora_recogida: `${h}:${m}` });
    }
  }

  calcularMonto(duracion: string, vehiculo: string): number {
    if (duracion === 'half-day') {
      return vehiculo === 'Sedan' ? 3950 : 5135;
    } else if (duracion === 'full-day') {
      return vehiculo === 'Sedan' ? 4950 : 6435;
    }
    return 0;
  }

  // ==========================================
  // FUNCIONES DE OPENSTREETMAP (LIVE SEARCH)
  // ==========================================
  buscarDireccion(event: any, tipo: 'recogida' | 'destino', index: number = -1) {
    const query = event.target.value;
    
    if (query.length < 3) {
      if (tipo === 'recogida') this.resultadosOSM = [];
      else this.resultadosDestinosOSM[index] = [];
      return;
    }

    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=mx&limit=5`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (tipo === 'recogida') this.resultadosOSM = data;
        else this.resultadosDestinosOSM[index] = data;
        
        this.cdr.detectChanges(); 
      } catch (error) {
        console.error("Error buscando en OpenStreetMap:", error);
      }
    }, 500); 
  }

  seleccionarDireccion(lugar: any, tipo: 'recogida' | 'destino', index: number = -1) {
    if (tipo === 'recogida') {
      this.reservaForm.patchValue({ lugar_recogida: lugar.display_name });
      this.resultadosOSM = []; 
    } else {
      this.destinos.at(index).setValue(lugar.display_name);
      this.resultadosDestinosOSM[index] = [];
    }
  }

 // ==========================================
  // FUNCIÓN PRINCIPAL DE ENVÍO Y COTIZACIÓN
  // ==========================================
  async onSubmit() {
    if (this.reservaForm.invalid) {
      alert(this.lang === 'en' ? 'Please fill all fields' : 'Por favor completa todos los campos');
      return;
    }

    const formVal = this.reservaForm.value;

    if (this.cotizacion === null) {
      this.cotizacion = this.calcularMonto(formVal.duracion, formVal.vehiculo);

      const nombreCompleto = `${formVal.nombre} ${formVal.apellido}`;
      const tipoTraducido = formVal.duracion === 'half-day' 
        ? (this.lang === 'en' ? 'Half Day' : 'Medio Día') 
        : (this.lang === 'en' ? 'Full Day' : 'Día Completo');
      const servicioFinal = `${formVal.vehiculo} - ${tipoTraducido}`;

      const cotizacionFormateada = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.cotizacion);
      const listaDestinos = formVal.destinos.join(' <br>➔ ');

      const detalleServicioHTML = `
        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fff;">
          <h3 style="color: #888; font-size: 11px; text-transform: uppercase; margin-top: 0; letter-spacing: 1px;">
            ${this.lang === 'en' ? '📍 Itinerary Details' : '📍 Detalles del Itinerario'}
          </h3>
          <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Date & Time' : 'Fecha y Hora'}:</strong> ${formVal.fecha_servicio} | ${formVal.hora_recogida} hrs</p>
          <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Pickup' : 'Punto de Partida'}:</strong> ${formVal.lugar_recogida}</p>
          <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Destinations' : 'Destinos'}:</strong><br>➔ ${listaDestinos}</p>
        </div>`;

      const templateCotizacionParams = {
        titulo_mensaje: this.lang === 'en' ? 'Your Chauffeur Quote' : 'Tu Cotización de Chofer',
        mensaje_principal: this.lang === 'en' ? 'Here are the details of your requested service.' : 'Aquí están los detalles del servicio solicitado.',
        nombre: nombreCompleto,
        email_destino: formVal.correo_cliente,
        destino: 'Chauffeur Service',
        cotizacion: cotizacionFormateada,
        pasajeros: formVal.vehiculo === 'Sedan' ? 'Max 3' : 'Max 4',
        tipo_servicio: servicioFinal,
        asistencia: 'N/A', 
        detalle_ida: detalleServicioHTML, 
        detalle_vuelta: '' 
      };

      localStorage.setItem('chofer_vancity', JSON.stringify({
        email_destino: formVal.correo_cliente, nombre: nombreCompleto, cotizacion: this.cotizacion, tipo_servicio: servicioFinal
      }));
      localStorage.setItem('idioma_vancity', this.lang);

      emailjs.send('service_gepyy7k', 'template_yyc4gkw', templateCotizacionParams, '8BD-wbQdkJaPiLyLx').catch(() => {});

      const dataInsert = {
        nombre: formVal.nombre, apellido: formVal.apellido, email: formVal.correo_cliente,
        telefono: `${formVal.codigoPais} ${formVal.telefono}`, vehiculo: formVal.vehiculo, duracion: formVal.duracion,
        fecha: formVal.fecha_servicio, hora_recogida: formVal.hora_recogida, punto_partida: formVal.lugar_recogida,
        itinerario: formVal.destinos.join(' -> '), cotizacion: this.cotizacion, estatus: 'COTIZADO'
      };

      // 🚨 SOLUCIÓN: Guardamos la reserva y recuperamos su ID
      const { data, error } = await supabase.from('reservas_chofer').insert([dataInsert]).select();
      if (data && data.length > 0) {
        this.reservaGeneradaId = data[0].id;
      }

      return; 
    }

    this.loading = true;
    this.pagoIniciado = true;

    try {
      const nombreCompleto = `${formVal.nombre} ${formVal.apellido}`;
      await this.procederAlPago(formVal.duracion, formVal.vehiculo, nombreCompleto, formVal.correo_cliente);

    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error as any).message);
      this.loading = false;
      this.pagoIniciado = false;
    } 
  }

  async procederAlPago(duracion: string, vehiculo: string, nombre: string, email: string) {
    const descripcionViaje = duracion === 'half-day' ? 'Half Day' : 'Full Day';
    const descripcionFinal = `Servicio Chofer ${descripcionViaje}  ${vehiculo}`;

    const urlRetorno = window.location.origin + window.location.pathname; // URL dinámica garantizada

    const datosPago = {
      monto: this.cotizacion, 
      nombre: nombre,
      email: email,
      descripcion: descripcionFinal,
      redirectUrl: urlRetorno,
      reserva_id: this.reservaGeneradaId // Mandamos el ID al Webhook
    };

    try {
      const { data, error } = await supabase.functions.invoke('openpay-checkout', { body: datosPago });
      if (error || (data && data.error)) { throw new Error('Bank Error'); }
      window.location.href = data.checkoutLink; 
    } catch (fatalError) {
      alert(this.lang === 'en' ? 'System error.' : 'Error del sistema.');
      this.loading = false;
      this.pagoIniciado = false;
    }
  }
}