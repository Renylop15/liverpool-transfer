import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { createClient } from '@supabase/supabase-js'; 
import { RouterModule, ActivatedRoute } from '@angular/router'; 
import emailjs from '@emailjs/browser'; 

const supabaseUrl = 'https://chyuacdnyaduqnawsoii.supabase.co'; 
const supabaseKey = 'sb_publishable_j34PDqBJtmzklQqnP6kL4A_AxNnerKR'; 
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-reserva-experiencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reserva-experiencia.component.html',
  styleUrl: './reserva-experiencia.component.css'
})
export class ReservaExperienciaComponent implements OnInit {
  reservaForm!: FormGroup;
  lang: 'en' | 'es' = 'en';
  loading = false; 
  pagoIniciado = false; 
  cotizacion: number | null = null; 
  horas: string[] = [];
  minutos: string[] = [];
  resultadosOSM: any[] = [];
  searchTimeout: any;
  
  // NUEVA VARIABLE PARA MOSTRAR EL TOUR ELEGIDO
  selectedTourName: string = '';

  texts: any = {
    en: { title: 'Book Your Service', firstName: 'First Name', lastName: 'Last Name', pickup_time: 'Pickup Time', serviceType: 'Service Type', halfDay: 'Half Day (6h)', fullDay: 'Full Day (12h)', pickup: 'Pickup Location' },
    es: { title: 'Reserva tu Servicio', firstName: 'Nombre', lastName: 'Apellido', pickup_time: 'Hora de Salida', serviceType: 'Tipo de Servicio', halfDay: 'Medio Día (6h)', fullDay: 'Día Completo (12h)', pickup: 'Lugar de Recogida' }
  };

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef, private route: ActivatedRoute) {
    for (let i = 0; i < 24; i++) this.horas.push(i.toString().padStart(2, '0'));
    for (let i = 0; i < 60; i += 5) this.minutos.push(i.toString().padStart(2, '0'));
  }

  ngOnInit(): void {
    this.reservaForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo_cliente: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      pasajeros: ['1-2', Validators.required],
      vehiculo: ['', Validators.required], 
      tipo_servicio: ['', Validators.required],
      fecha_servicio: ['', Validators.required],
      hora_recogida: ['', Validators.required], 
      lugar_recogida: ['', Validators.required],
      itinerario_notas: [''] 
    });

    // ATRAPAMOS EL TOUR DE LA URL
    this.route.queryParams.subscribe(params => {
      if (params['tour']) {
        this.selectedTourName = params['tour'];
        this.reservaForm.patchValue({
          itinerario_notas: params['tour'], // Mandamos el nombre puro a la BD
          tipo_servicio: params['type'] || ''
        });
      }
    });

    this.reservaForm.valueChanges.subscribe(() => { this.cotizacion = null; });

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const openpayId = urlParams.get('id'); 
      if (openpayId) {
        const datosGuardados = localStorage.getItem('experiencia_vancity');
        const idiomaGuardado = localStorage.getItem('idioma_vancity') || 'es';
        if (datosGuardados) {
          const datosCorreo = JSON.parse(datosGuardados);
          const templatePagoParams = {
            titulo_mensaje: idiomaGuardado === 'en' ? '✅ Payment Confirmed' : '✅ Pago Confirmado',
            mensaje_principal: idiomaGuardado === 'en' ? 'Thank you! Your payment was successful and your experience is reserved.' : '¡Gracias! Hemos recibido tu pago exitosamente. Tu experiencia está reservada.',
            nombre: datosCorreo.nombre, email_destino: datosCorreo.email_destino, folio: openpayId, tipo_servicio: datosCorreo.tipo_servicio, monto: datosCorreo.cotizacion
          };
          emailjs.send('service_gepyy7k', 'template_giiio1o', templatePagoParams, '8BD-wbQdkJaPiLyLx').catch(() => {});
          supabase.from('reservas_experiencias').update({ estatus: 'PAGADO' }).eq('correo_cliente', datosCorreo.email_destino).then(() => {});
          alert(idiomaGuardado === 'en' ? 'Payment Successful! Confirmation email sent.' : '¡Pago Exitoso! Te hemos enviado un correo de confirmación.');
          localStorage.removeItem('experiencia_vancity');
          localStorage.removeItem('idioma_vancity');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }

  async validarFechaDisponibilidad(event: Event) {
    const fecha = (event.target as HTMLInputElement).value;
    if (!fecha) return;

    const allowed = ['2026-05-17', '2026-05-20', '2026-05-22'];
    if (!allowed.includes(fecha) && fecha < '2026-05-23') {
      alert(this.lang === 'en' ? 'Service only available on May 17, 20, 22 and from May 23 onwards.' : 'Servicio solo disponible los días 17, 20, 22 de mayo y a partir del 23.');
      this.reservaForm.patchValue({ fecha_servicio: '' });
      return;
    }

    this.loading = true;
    const { data } = await supabase.from('reservas_experiencias').select('id').eq('fecha_servicio', fecha).eq('estatus', 'PAGADO');
    if ((data?.length || 0) >= 3) {
      alert(this.lang === 'en' ? 'Fully booked! Max 3 experiences for this day.' : '¡Día lleno! Máximo 3 experiencias para este día.');
      this.reservaForm.patchValue({ fecha_servicio: '' });
    }
    this.loading = false;
    this.cdr.detectChanges();
  }

  buscarDestino(event: any) {
    const query = event.target.value;
    if (query.length < 3) { this.resultadosOSM = []; return; }
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(async () => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=mx&limit=5`;
      const res = await fetch(url);
      this.resultadosOSM = await res.json();
      this.cdr.detectChanges();
    }, 500);
  }

  seleccionarDestino(lugar: any) {
    this.reservaForm.patchValue({ lugar_recogida: lugar.display_name });
    this.resultadosOSM = [];
  }

  async onSubmit() {
    if (this.reservaForm.invalid) {
      alert(this.lang === 'en' ? 'Please fill all fields' : 'Por favor completa todos los campos');
      return;
    }
    const formVal = this.reservaForm.value;

    if (this.cotizacion === null) {
      this.cotizacion = formVal.tipo_servicio === 'half-day' ? (formVal.vehiculo === 'Sedan' ? 3950 : 5135) : (formVal.vehiculo === 'Sedan' ? 4950 : 6435);
      this.loading = false;
      this.cdr.detectChanges(); 

      const nombreCompleto = `${formVal.nombre} ${formVal.apellido}`;
      const tipoTraducido = formVal.tipo_servicio === 'half-day' ? (this.lang === 'en' ? 'Half Day' : 'Medio Día') : (this.lang === 'en' ? 'Full Day' : 'Día Completo');
      const servicioFinal = `${formVal.vehiculo} - ${tipoTraducido}`;

      const dataParaGuardar = { ...formVal, estatus: 'COTIZADO', cotizacion: this.cotizacion };
      supabase.from('reservas_experiencias').insert([dataParaGuardar]).then();

      const cotizacionFormateada = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.cotizacion);
      const detalleServicioHTML = `
        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fff;">
          <h3 style="color: #888; font-size: 11px; text-transform: uppercase; margin-top: 0; letter-spacing: 1px;">${this.lang === 'en' ? '📍 Pickup Details' : '📍 Detalles de Recogida'}</h3>
          <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Date & Time' : 'Fecha y Hora'}:</strong> ${formVal.fecha_servicio} | ${formVal.hora_recogida} hrs</p>
          <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Location' : 'Lugar'}:</strong> ${formVal.lugar_recogida}</p>
          <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Experience / Notes' : 'Experiencia / Notas'}:</strong> ${formVal.itinerario_notas || 'N/A'}</p>
        </div>`;

      const templateCotizacionParams = {
        titulo_mensaje: this.lang === 'en' ? 'Your Experience Quote' : 'Tu Cotización de Experiencia',
        mensaje_principal: this.lang === 'en' ? 'Here are the details of your requested experience.' : 'Aquí están los detalles de la experiencia solicitada.',
        nombre: nombreCompleto, email_destino: formVal.correo_cliente, destino: 'City Tour / Experience', cotizacion: cotizacionFormateada,
        pasajeros: formVal.pasajeros, tipo_servicio: servicioFinal, asistencia: 'N/A', detalle_ida: detalleServicioHTML, detalle_vuelta: '' 
      };

      localStorage.setItem('experiencia_vancity', JSON.stringify(templateCotizacionParams));
      localStorage.setItem('idioma_vancity', this.lang);
      emailjs.send('service_gepyy7k', 'template_yyc4gkw', templateCotizacionParams, '8BD-wbQdkJaPiLyLx').catch((err) => console.error('Error Email:', err));

    } else {
      this.loading = true;
      this.pagoIniciado = true;
      this.cdr.detectChanges(); 
      try {
        const nombreCompleto = `${formVal.nombre} ${formVal.apellido}`;
        await this.procederAlPago(formVal.tipo_servicio, formVal.vehiculo, nombreCompleto, formVal.correo_cliente);
      } catch (error) {
        console.error('Error:', error);
        this.loading = false;
        this.pagoIniciado = false;
        this.cdr.detectChanges(); 
      } 
    }
  }

  async procederAlPago(tipoServicio: string, vehiculo: string, nombre: string, email: string) {
    const descripcionViaje = tipoServicio === 'half-day' ? 'Half Day' : 'Full Day';
    const descripcionFinal = `Vancity Experience ${descripcionViaje}  ${vehiculo}`;
    const datosPago = { monto: this.cotizacion, nombre: nombre, email: email, descripcion: descripcionFinal, redirectUrl: "https://igdsmxcity.vancity.mx/reserva-experiencia" };

    try {
      const { data, error } = await supabase.functions.invoke('openpay-checkout', { body: datosPago });
      if (error || (data && data.error)) {
        alert(this.lang === 'en' ? 'Bank connection error. Try again.' : 'Error al conectar con el banco. Intenta de nuevo.');
        this.loading = false; this.pagoIniciado = false; return;
      }
      window.location.href = data.checkoutLink; 
    } catch (fatalError) {
      alert(this.lang === 'en' ? 'System error.' : 'Error del sistema.');
      this.loading = false; this.pagoIniciado = false;
    }
  }

  actualizarHoraSalida(h: string, m: string) { this.reservaForm.patchValue({ hora_recogida: `${h}:${m}` }); }
  toggleLang() { this.lang = this.lang === 'en' ? 'es' : 'en'; }
}