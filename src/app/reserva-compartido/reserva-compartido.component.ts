import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { createClient } from '@supabase/supabase-js'; 
import { RouterModule, ActivatedRoute } from '@angular/router'; 
import emailjs from '@emailjs/browser'; 

const supabaseUrl = 'https://chyuacdnyaduqnawsoii.supabase.co'; 
const supabaseKey = 'sb_publishable_j34PDqBJtmzklQqnP6kL4A_AxNnerKR'; 
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-reserva-compartido',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reserva-compartido.component.html',
  styleUrl: './reserva-compartido.component.css'
})
export class ReservaCompartidoComponent implements OnInit {
  reservaForm!: FormGroup;
  lang: 'en' | 'es' = 'en';
  loading = false; 
  pagoIniciado = false; 
  cotizacion: number | null = null; 
  
  selectedTourName: string = '';
  opcionesTickets: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; 
  showSuccessModal = false;

  texts: any = {
    en: { title: 'Book Your Shared Experience', tickets: 'Number of Tickets', pickup: 'Fixed Pickup Location' },
    es: { title: 'Reserva tu Experiencia Compartida', tickets: 'Número de Tickets', pickup: 'Punto de Recogida Fijo' }
  };

  // MATRIZ DE PRECIOS POR TICKET (SHARED RIDE)
  preciosShared: any = {
    'Chapultepec Castle': 3008,
    'Basílica of Guadalupe': 2798,
    'Historic Downtown': 2898,
    'Xochimilco': 4298,
    'Frida Khalo Museum & Anahuacalli': 3118,
    'Luis Barragan House': 3448
  };

  // VARIABLES DEL CALENDARIO
  currentYear = 2026;
  currentMonth = 4; // Mayo
  calendarDays: any[] = [];
  hoveredDay: any = null;
  cargandoCalendario = false;

  weekDays: any = { es: ['L', 'M', 'M', 'J', 'V', 'S', 'D'], en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] };
  monthNames: any = {
    es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.reservaForm = this.fb.group({
      boletos: [1, Validators.required],
      fecha_servicio: ['', Validators.required],
      pasajerosDetalle: this.fb.array([]) // Array dinámico de pasajeros
    });

    this.actualizarCamposPasajeros(1); // Inicia con 1 pasajero

    // ATRAPAMOS EL TOUR
    this.route.queryParams.subscribe(params => {
      if (params['tour']) {
        this.selectedTourName = params['tour'];
      }
    });

    // ESCUCHAR CAMBIOS EN LOS TICKETS PARA AJUSTAR PASAJEROS Y CALENDARIO
    this.reservaForm.get('boletos')?.valueChanges.subscribe(cantidad => {
      this.actualizarCamposPasajeros(parseInt(cantidad));
      this.cotizacion = null;
      this.reservaForm.patchValue({ fecha_servicio: '' });
      this.generarCalendario(); 
    });

    this.reservaForm.valueChanges.subscribe(() => { this.cotizacion = null; });

    this.generarCalendario();

    // LÓGICA RETORNO OPENPAY
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const openpayId = urlParams.get('id'); 

      if (openpayId) {
        // 1. LLAMAMOS AL VERIFICADOR
        supabase.functions.invoke('openpay-checkout', { 
          body: { action: 'verify', transaction_id: openpayId } 
        }).then(({ data, error }) => {
          
          // 2. REVISAMOS SI FALLÓ
          if (error || !data || data.status !== 'completed') {
             alert(this.lang === 'en' 
                ? 'Payment could not be completed. The bank declined the authorization. Please try a different card.' 
                : 'El pago no pudo ser procesado o el banco declinó la autorización. Por favor intenta con otro método de pago.');
             window.history.replaceState({}, document.title, window.location.pathname);
             return; 
          }

          // 3. SI FUE EXITOSO (Datos específicos de Experiencia Compartida)
          const datosGuardados = localStorage.getItem('compartido_vancity');
          const idiomaGuardado = localStorage.getItem('idioma_vancity') || 'es';

          if (datosGuardados) {
            const datosCorreo = JSON.parse(datosGuardados);

            const templatePagoParams = {
              titulo_mensaje: idiomaGuardado === 'en' ? '✅ Payment Confirmed' : '✅ Pago Confirmado',
              mensaje_principal: idiomaGuardado === 'en' 
                ? 'Thank you! Your payment was successful and your shared tickets are reserved.' 
                : '¡Gracias! Hemos recibido tu pago exitosamente. Tus boletos compartidos están reservados.',
              nombre: datosCorreo.nombre,
              email_destino: datosCorreo.email_destino,
              folio: openpayId,
              tipo_servicio: datosCorreo.tipo_servicio,
              monto: datosCorreo.cotizacion
            };

            emailjs.send('service_gepyy7k', 'template_giiio1o', templatePagoParams, '8BD-wbQdkJaPiLyLx').catch(() => {});
            
            // Actualizamos la tabla correcta
            supabase.from('reservas_experiencias').update({ estatus: 'PAGADO' }).eq('correo_cliente', datosCorreo.email_destino).then(() => {});
            
            this.showSuccessModal = true;
          }
        });
      }
    }
  }
  closeSuccessModal() {
    this.showSuccessModal = false;
    localStorage.removeItem('compartido_vancity');
    localStorage.removeItem('idioma_vancity');
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  // ==========================================
  // FORMULARIO DINÁMICO DE PASAJEROS
  // ==========================================
  get pasajerosDetalles() {
    return this.reservaForm.get('pasajerosDetalle') as FormArray;
  }

  actualizarCamposPasajeros(cantidad: number) {
    const actual = this.pasajerosDetalles.length;
    if (cantidad > actual) {
      for (let i = actual; i < cantidad; i++) {
        this.pasajerosDetalles.push(this.fb.group({
          nombre: ['', Validators.required],
          apellido: ['', Validators.required],
          correo: ['', [Validators.required, Validators.email]],
          telefono: ['', Validators.required]
        }));
      }
    } else {
      for (let i = actual - 1; i >= cantidad; i--) {
        this.pasajerosDetalles.removeAt(i);
      }
    }
  }

  // ==========================================
  // LÓGICA DEL CALENDARIO
  // ==========================================
  cambiarMes(delta: number) {
    this.currentMonth += delta;
    if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; } 
    else if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
    this.reservaForm.patchValue({ fecha_servicio: '' });
    this.generarCalendario();
  }

  async generarCalendario() {
    const primerDia = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const diasEnMes = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    let startOffset = primerDia - 1;
    if (startOffset < 0) startOffset = 6;

    this.calendarDays = [];
    for (let i = 0; i < startOffset; i++) this.calendarDays.push(null);

    const ticketsRequeridos = parseInt(this.reservaForm.get('boletos')?.value || '1');

    for (let i = 1; i <= diasEnMes; i++) {
      const fechaStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isAllowed = this.checarFechasPermitidas(fechaStr);
      
      this.calendarDays.push({
        day: i, dateStr: fechaStr, isAllowed: isAllowed, remaining: isAllowed ? 10 : 0
      });
    }

    if (this.selectedTourName) {
      this.cargandoCalendario = true;
      this.cdr.detectChanges();

      const startDate = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-01`;
      const endDate = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-31`;

      // Traemos las reservas de ESTE tour en formato Shared
      const { data } = await supabase.from('reservas_experiencias')
        .select('fecha_servicio, pasajeros')
        .eq('tipo_servicio', 'Shared Ride')
        .ilike('itinerario_notas', `%${this.selectedTourName}%`)
        .eq('estatus', 'PAGADO')
        .gte('fecha_servicio', startDate)
        .lte('fecha_servicio', endDate);

      const ocupadosPorDia: any = {};
      if (data) {
        data.forEach(r => {
          const pax = parseInt(r.pasajeros || '0');
          ocupadosPorDia[r.fecha_servicio] = (ocupadosPorDia[r.fecha_servicio] || 0) + pax;
        });
      }

      this.calendarDays.forEach(d => {
        if (d && d.isAllowed) {
          const ocupados = ocupadosPorDia[d.dateStr] || 0;
          d.remaining = Math.max(0, 10 - ocupados); 
          // Si los lugares restantes son menores a los boletos que el usuario quiere, bloqueamos el día
          if (d.remaining < ticketsRequeridos) {
            d.remaining = 0; 
          }
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

  // ==========================================
  // FLUJO DE PAGO Y ENVÍO
  // ==========================================
  async onSubmit() {
    if (this.reservaForm.invalid) {
      alert(this.lang === 'en' ? 'Please fill all fields, including passenger details and date.' : 'Por favor completa todos los campos, incluyendo pasajeros y fecha en el calendario.');
      return;
    }
    
    const formVal = this.reservaForm.value;
    const boletos = parseInt(formVal.boletos);
    const precioUnitario = this.preciosShared[this.selectedTourName] || 0;

    if (this.cotizacion === null) {
      this.cotizacion = precioUnitario * boletos;
      this.loading = false;
      this.cdr.detectChanges(); 

      // El Pasajero 1 se guarda en las columnas principales para control rápido
      const paxPrincipal = formVal.pasajerosDetalle[0];
      const nombreCompleto = `${paxPrincipal.nombre} ${paxPrincipal.apellido}`;
      
      // Guardamos el detalle de TODOS en itinerario_notas para no perder data
      const notasCompletas = `Tour: ${this.selectedTourName} | Pax Details: ${JSON.stringify(formVal.pasajerosDetalle)}`;

      const dataParaGuardar = { 
        nombre: paxPrincipal.nombre,
        apellido: paxPrincipal.apellido,
        correo_cliente: paxPrincipal.correo,
        telefono: paxPrincipal.telefono,
        pasajeros: boletos.toString(), 
        estatus: 'COTIZADO', 
        cotizacion: this.cotizacion,
        fecha_servicio: formVal.fecha_servicio,
        hora_recogida: 'Fijada por Logística',
        lugar_recogida: 'Hotel Hyatt Regency Polanco',
        tipo_servicio: 'Shared Ride',
        vehiculo: 'Shared Van',
        itinerario_notas: notasCompletas
      };
      
      supabase.from('reservas_experiencias').insert([dataParaGuardar]).then();

      const cotizacionFormateada = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.cotizacion);

      const templateParams = {
        titulo_mensaje: this.lang === 'en' ? 'Your Shared Ride Quote' : 'Tu Cotización de Viaje Compartido',
        mensaje_principal: this.lang === 'en' ? 'Here are the details for your shared tickets.' : 'Aquí están los detalles de tus tickets.',
        nombre: nombreCompleto, 
        email_destino: paxPrincipal.correo, 
        destino: this.selectedTourName, 
        cotizacion: cotizacionFormateada,
        pasajeros: boletos, 
        tipo_servicio: 'Shared Ride', 
        asistencia: 'N/A', 
        detalle_ida: `<p><strong>Fecha:</strong> ${formVal.fecha_servicio}</p>`, 
        detalle_vuelta: '' 
      };

      localStorage.setItem('compartido_vancity', JSON.stringify(templateParams));
      localStorage.setItem('idioma_vancity', this.lang);
      emailjs.send('service_gepyy7k', 'template_yyc4gkw', templateParams, '8BD-wbQdkJaPiLyLx').catch();

    } else {
      this.loading = true;
      this.pagoIniciado = true;
      this.cdr.detectChanges(); 
      try {
        const paxPrincipal = formVal.pasajerosDetalle[0];
        const nombreCompleto = `${paxPrincipal.nombre} ${paxPrincipal.apellido}`;
        await this.procederAlPago(nombreCompleto, paxPrincipal.correo);
      } catch (error) {
        this.loading = false; this.pagoIniciado = false; this.cdr.detectChanges(); 
      } 
    }
  }

  async procederAlPago(nombre: string, email: string) {
    // 1. Limpiamos el texto para que OpenPay no lo rechace (cambiamos "&" por "y" y quitamos símbolos raros)
    const tourLimpio = this.selectedTourName.replace(/&/g, 'y').replace(/[^a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ]/g, '');
    const descripcionFinal = `Vancity Shared Tickets ${tourLimpio}`;
    const urlRetorno = window.location.origin + '/reserva-compartido';
    const datosPago = { monto: this.cotizacion, nombre: nombre, email: email, descripcion: descripcionFinal, redirectUrl: urlRetorno };

    try {
      const { data, error } = await supabase.functions.invoke('openpay-checkout', { body: datosPago });
      if (error || (data && data.error)) {
        alert(this.lang === 'en' ? 'Bank connection error.' : 'Error al conectar con el banco.');
        this.loading = false; this.pagoIniciado = false; return;
      }
      window.location.href = data.checkoutLink; 
    } catch (err) {
      this.loading = false; this.pagoIniciado = false;
    }
  }

  toggleLang() { this.lang = this.lang === 'en' ? 'es' : 'en'; }
}