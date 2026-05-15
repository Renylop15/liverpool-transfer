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
  
  selectedTourName: string = '';
  opcionesPasajeros: number[] = [1, 2, 3]; 

  reservaGeneradaId: string | null = null; 
  showSuccessModal = false;

  // 🚨 SWITCH DE CIERRE DE FORMULARIO (SOLD OUT):
  // Cambia a 'false' cuando vuelvas a tener lugares disponibles.
  showClosedModal = true; 

  texts: any = {
    en: { title: 'Book Your Private Ride', firstName: 'First Name', lastName: 'Last Name', pickup: 'Fixed Pickup Location', passengers: 'Number of Passengers' },
    es: { title: 'Reserva tu Viaje Privado', firstName: 'Nombre', lastName: 'Apellido', pickup: 'Punto de Recogida Fijo', passengers: 'Número de Pasajeros' }
  };

  preciosMatrix: any = {
    'Chapultepec Castle': { Sedan: [6160, 7370, 8580], SUV: [7645, 8855, 10065, 11275] },
    'Basílica of Guadalupe': { Sedan: [5950, 6950, 7950], SUV: [7435, 8435, 9435, 10435] },
    'Historic Downtown': { Sedan: [6050, 7150, 8250], SUV: [7535, 8635, 9735, 10835] },
    'Xochimilco': { Sedan: [7450, 9950, 12450], SUV: [8935, 11435, 13935, 16435] },
    'Frida Khalo Museum & Anahuacalli': { Sedan: [6270, 7590, 8910], SUV: [7755, 9075, 10395, 11715] },
    'Luis Barragan House': { Sedan: [6600, 8250, 9900], SUV: [8085, 9735, 11385, 13035] }
  };

  currentYear = 2026;
  currentMonth = 4; 
  calendarDays: any[] = [];
  hoveredDay: any = null;
  cargandoCalendario = false;

  weekDays: any = {
    es: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    en: ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  };
  monthNames: any = {
    es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.reservaForm = this.fb.group({
      vehiculo: ['', Validators.required], 
      pasajeros: [1, Validators.required],
      fecha_servicio: ['', Validators.required], 
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo_cliente: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      itinerario_notas: [''] 
    });

    // 🚨 Si el modal de cerrado está activo, bloqueamos el formulario por seguridad
    if (this.showClosedModal) {
      this.reservaForm.disable();
    }

    this.route.queryParams.subscribe(params => {
      if (params['tour']) {
        this.selectedTourName = params['tour'];
        this.reservaForm.patchValue({ itinerario_notas: params['tour'] });
      }
    });

    this.reservaForm.get('vehiculo')?.valueChanges.subscribe(vehiculo => {
      if (vehiculo === 'Sedan') {
        this.opcionesPasajeros = [1, 2, 3];
        if (this.reservaForm.value.pasajeros > 3) this.reservaForm.patchValue({ pasajeros: 1 });
      } else if (vehiculo === 'SUV') {
        this.opcionesPasajeros = [1, 2, 3, 4];
      }
      this.cotizacion = null;
      this.reservaForm.patchValue({ fecha_servicio: '' }); 
      this.generarCalendario(); 
    });

    this.reservaForm.valueChanges.subscribe(() => { this.cotizacion = null; });

    this.generarCalendario();

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

          const datosGuardados = localStorage.getItem('experiencia_vancity');
          const idiomaGuardado = localStorage.getItem('idioma_vancity') || 'es';

          if (datosGuardados) {
            const datosCorreo = JSON.parse(datosGuardados);

            const templatePagoParams = {
              titulo_mensaje: idiomaGuardado === 'en' ? '✅ Payment Confirmed' : '✅ Pago Confirmado',
              mensaje_principal: idiomaGuardado === 'en' ? 'Thank you! Your payment was successful and your private ride is reserved.' : '¡Gracias! Hemos recibido tu pago exitosamente. Tu viaje privado está reservado.',
              nombre: datosCorreo.nombre, email_destino: datosCorreo.email_destino, folio: openpayId,
              tipo_servicio: datosCorreo.tipo_servicio, monto: datosCorreo.cotizacion
            };
            
            emailjs.send('service_gepyy7k', 'template_giiio1o', templatePagoParams, '8BD-wbQdkJaPiLyLx').catch(() => {});
            
            supabase.from('reservas_experiencias').update({ estatus: 'PAGADO' }).eq('correo_cliente', datosCorreo.email_destino).then(() => {});
            
            this.showSuccessModal = true;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    localStorage.removeItem('experiencia_vancity');
    localStorage.removeItem('idioma_vancity');
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  cambiarMes(delta: number) {
    this.currentMonth += delta;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.reservaForm.patchValue({ fecha_servicio: '' });
    this.generarCalendario();
  }

  async generarCalendario() {
    const primerDia = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const diasEnMes = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    
    let startOffset = primerDia - 1;
    if (startOffset < 0) startOffset = 6;

    this.calendarDays = [];
    for (let i = 0; i < startOffset; i++) {
      this.calendarDays.push(null);
    }

    const vehiculoSeleccionado = this.reservaForm.get('vehiculo')?.value;

    for (let i = 1; i <= diasEnMes; i++) {
      const fechaStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isAllowed = this.checarFechasPermitidas(fechaStr);
      
      this.calendarDays.push({
        day: i,
        dateStr: fechaStr,
        isAllowed: isAllowed,
        remaining: isAllowed && vehiculoSeleccionado ? 3 : 0 
      });
    }

    if (vehiculoSeleccionado) {
      this.cargandoCalendario = true;
      this.cdr.detectChanges();

      const startDate = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-01`;
      const endDate = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-31`;

      const { data } = await supabase.from('reservas_experiencias')
        .select('fecha_servicio')
        .eq('vehiculo', vehiculoSeleccionado)
        .eq('estatus', 'PAGADO')
        .gte('fecha_servicio', startDate)
        .lte('fecha_servicio', endDate);

      const conteoPorDia: any = {};
      if (data) {
        data.forEach(r => {
          conteoPorDia[r.fecha_servicio] = (conteoPorDia[r.fecha_servicio] || 0) + 1;
        });
      }

      this.calendarDays.forEach(d => {
        if (d && d.isAllowed) {
          const ocupados = conteoPorDia[d.dateStr] || 0;
          d.remaining = Math.max(0, 3 - ocupados); 
        }
      });

      this.cargandoCalendario = false;
      this.cdr.detectChanges();
    }
  }

  checarFechasPermitidas(fechaStr: string): boolean {
    const allowed = ['2026-05-17', '2026-05-20', '2026-05-22'];
    if (allowed.includes(fechaStr)) return true;
    if (fechaStr >= '2026-05-23') return true;
    return false;
  }

  seleccionarFecha(d: any) {
    if (d && d.isAllowed && d.remaining > 0) {
      this.reservaForm.patchValue({ fecha_servicio: d.dateStr });
      this.cotizacion = null;
    }
  }

  calcularMonto(tour: string, vehiculo: string, pasajeros: number): number {
    if (this.preciosMatrix[tour] && this.preciosMatrix[tour][vehiculo]) {
      return this.preciosMatrix[tour][vehiculo][pasajeros - 1];
    }
    return 0; 
  }

  async onSubmit() {
    if (this.reservaForm.invalid) {
      alert(this.lang === 'en' ? 'Please fill all fields, including the vehicle and date.' : 'Por favor completa todos los campos, incluyendo vehículo y fecha en el calendario.');
      return;
    }
    const formVal = this.reservaForm.value;

    if (this.cotizacion === null) {
      this.cotizacion = this.calcularMonto(this.selectedTourName, formVal.vehiculo, parseInt(formVal.pasajeros));
      this.loading = false;
      this.cdr.detectChanges(); 

      const nombreCompleto = `${formVal.nombre} ${formVal.apellido}`;
      const servicioFinal = `Private Ride - ${formVal.vehiculo}`;

      const dataParaGuardar = { 
        ...formVal, 
        pasajeros: formVal.pasajeros.toString(), 
        estatus: 'COTIZADO', 
        cotizacion: this.cotizacion,
        hora_recogida: 'Flexible',
        lugar_recogida: 'Hotel Hyatt Regency Polanco',
        tipo_servicio: 'Private Ride'
      };

      const { data, error } = await supabase.from('reservas_experiencias').insert([dataParaGuardar]).select();
      if (error) {
        console.error("Error guardando en Supabase:", error);
      } else if (data && data.length > 0) {
        this.reservaGeneradaId = data[0].id;
      }

      const cotizacionFormateada = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.cotizacion);
      const detalleServicioHTML = `
        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fff;">
          <h3 style="color: #888; font-size: 11px; text-transform: uppercase; margin-top: 0; letter-spacing: 1px;">${this.lang === 'en' ? '📍 Service Details' : '📍 Detalles del Servicio'}</h3>
          <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Date' : 'Fecha'}:</strong> ${formVal.fecha_servicio}</p>
          <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Pickup Location' : 'Punto de Recogida'}:</strong> Hotel Hyatt Regency Polanco</p>
          <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Experience' : 'Experiencia'}:</strong> ${this.selectedTourName}</p>
        </div>`;

      const templateCotizacionParams = {
        titulo_mensaje: this.lang === 'en' ? 'Your Private Ride Quote' : 'Tu Cotización de Viaje Privado',
        mensaje_principal: this.lang === 'en' ? 'Here are the details of your requested experience.' : 'Aquí están los detalles de la experiencia solicitada.',
        nombre: nombreCompleto, email_destino: formVal.correo_cliente, destino: this.selectedTourName, cotizacion: cotizacionFormateada,
        pasajeros: formVal.pasajeros, tipo_servicio: servicioFinal, asistencia: 'N/A', detalle_ida: detalleServicioHTML, detalle_vuelta: '' 
      };

      localStorage.setItem('experiencia_vancity', JSON.stringify(templateCotizacionParams));
      localStorage.setItem('idioma_vancity', this.lang);
      emailjs.send('service_gepyy7k', 'template_yyc4gkw', templateCotizacionParams, '8BD-wbQdkJaPiLyLx').catch();

    } else {
      this.loading = true;
      this.pagoIniciado = true;
      this.cdr.detectChanges(); 
      try {
        const nombreCompleto = `${formVal.nombre} ${formVal.apellido}`;
        await this.procederAlPago(formVal.vehiculo, nombreCompleto, formVal.correo_cliente);
      } catch (error) {
        this.loading = false;
        this.pagoIniciado = false;
        this.cdr.detectChanges(); 
      } 
    }
  }

  async procederAlPago(vehiculo: string, nombre: string, email: string) {
    const descripcionFinal = `Vancity Private Ride ${vehiculo}`;
    const urlRetorno = window.location.origin + window.location.pathname;

    const datosPago = { 
      monto: this.cotizacion, 
      nombre: nombre, 
      email: email, 
      descripcion: descripcionFinal, 
      redirectUrl: urlRetorno,
      reserva_id: this.reservaGeneradaId 
    };

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

  toggleLang() { this.lang = this.lang === 'en' ? 'es' : 'en'; }
}