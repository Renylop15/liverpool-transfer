import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { createClient } from '@supabase/supabase-js'; 
import { RouterModule } from '@angular/router';
import emailjs from '@emailjs/browser'; // <-- IMPORTANTE: Agregamos EmailJS

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

  texts: any = {
    en: {
      title: 'Book Your Service',
      firstName: 'First Name',
      lastName: 'Last Name',
      pickup_time: 'Pickup Time',
      serviceType: 'Service Type',
      halfDay: 'Half Day Disposal (Up to 6 Hours)',
      fullDay: 'Full Day Disposal (Up to 12 Hours)',
      pickup: 'Pickup Location (Hotel / Address)'
    },
    es: {
      title: 'Reserva tu Servicio',
      firstName: 'Nombre',
      lastName: 'Apellido',
      pickup_time: 'Hora de Salida',
      serviceType: 'Tipo de Servicio',
      halfDay: 'Medio Día (Hasta 6 Horas)',
      fullDay: 'Día Completo (Hasta 12 Horas)',
      pickup: 'Lugar de Recogida (Hotel o Dirección)'
    }
  };

  // Agregamos ChangeDetectorRef al constructor
  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    for (let i = 0; i < 24; i++) {
      this.horas.push(i < 10 ? '0' + i : i.toString());
    }
    for (let i = 0; i < 60; i += 5) {
      this.minutos.push(i < 10 ? '0' + i : i.toString());
    }
  }

  ngOnInit(): void {
    // =========================================================
    // LÓGICA DE RETORNO DEL BANCO (TEMPLATE DE PAGO)
    // =========================================================
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
            mensaje_principal: idiomaGuardado === 'en' 
              ? 'Thank you! Your payment was successful and your experience is reserved.' 
              : '¡Gracias! Hemos recibido tu pago exitosamente. Tu experiencia está reservada.',
            nombre: datosCorreo.nombre,
            email_destino: datosCorreo.email_destino,
            folio: openpayId,
            tipo_servicio: datosCorreo.tipo_servicio, 
            monto: datosCorreo.cotizacion
          };

          // 🚨 IMPORTANTE: Pon aquí tu ID del Template de Pago
          emailjs.send('service_gepyy7k', 'template_giiio1o', templatePagoParams, '8BD-wbQdkJaPiLyLx')          
          .catch(() => {});

          supabase.from('reservas_experiencias').update({ estatus: 'PAGADO' })
            .eq('correo_cliente', datosCorreo.email_destino)
            .then(() => {});
            
          alert(idiomaGuardado === 'en' ? 'Payment Successful! Confirmation email sent.' : '¡Pago Exitoso! Te hemos enviado un correo de confirmación.');
          
          localStorage.removeItem('experiencia_vancity');
          localStorage.removeItem('idioma_vancity');
          
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }

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

    this.reservaForm.valueChanges.subscribe(() => {
      this.cotizacion = null;
    });
  }

  toggleLang() {
    this.lang = this.lang === 'en' ? 'es' : 'en';
  }

  actualizarHoraSalida(h: string, m: string) {
    if (h && m) {
      const horaCompleta = `${h}:${m}`;
      this.reservaForm.patchValue({ hora_recogida: horaCompleta });
    }
  }

  calcularMonto(tipoServicio: string, vehiculo: string): number {
    if (tipoServicio === 'half-day') {
      return vehiculo === 'Sedan' ? 3950 : 5135;
    } else if (tipoServicio === 'full-day') {
      return vehiculo === 'Sedan' ? 4950 : 6435;
    }
    return 0;
  }

  async onSubmit() {
    if (this.reservaForm.invalid) {
      alert(this.lang === 'en' ? 'Please fill all fields' : 'Por favor completa todos los campos');
      return;
    }

    const formVal = this.reservaForm.value;

    // ==================================================
    // PASO 1: COTIZACIÓN Y ENVÍO DE CORREO DE COTIZACIÓN
    // ==================================================
    if (this.cotizacion === null) {
      this.cotizacion = this.calcularMonto(formVal.tipo_servicio, formVal.vehiculo);
      
      const nombreCompleto = `${formVal.nombre} ${formVal.apellido}`;
      const tipoTraducido = formVal.tipo_servicio === 'half-day' 
        ? (this.lang === 'en' ? 'Half Day' : 'Medio Día') 
        : (this.lang === 'en' ? 'Full Day' : 'Día Completo');
      const servicioFinal = `${formVal.vehiculo} - ${tipoTraducido}`;

      const cotizacionFormateada = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.cotizacion);

      // Cajita HTML con estilo para las Experiencias
      const detalleServicioHTML = `
        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fff;">
          <h3 style="color: #888; font-size: 11px; text-transform: uppercase; margin-top: 0; letter-spacing: 1px;">
            ${this.lang === 'en' ? '📍 Pickup Details' : '📍 Detalles de Recogida'}
          </h3>
          <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Date & Time' : 'Fecha y Hora'}:</strong> ${formVal.fecha_servicio} | ${formVal.hora_recogida} hrs</p>
          <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Location' : 'Lugar'}:</strong> ${formVal.lugar_recogida}</p>
          <p style="margin: 5px 0; color: #ddd; font-size: 14px;"><strong>${this.lang === 'en' ? 'Notes' : 'Notas'}:</strong> ${formVal.itinerario_notas || 'N/A'}</p>
        </div>`;

      const templateCotizacionParams = {
        titulo_mensaje: this.lang === 'en' ? 'Your Experience Quote' : 'Tu Cotización de Experiencia',
        mensaje_principal: this.lang === 'en' ? 'Here are the details of your requested experience.' : 'Aquí están los detalles de la experiencia solicitada.',
        nombre: nombreCompleto,
        email_destino: formVal.correo_cliente,
        destino: 'City Tour / Experience',
        cotizacion: cotizacionFormateada,
        pasajeros: formVal.pasajeros,
        tipo_servicio: servicioFinal,
        asistencia: 'N/A', 
        detalle_ida: detalleServicioHTML, 
        detalle_vuelta: '' // Las experiencias no tienen vuelta de vuelo
      };

      // Guardamos en LocalStorage para usarlo después de pagar
      localStorage.setItem('experiencia_vancity', JSON.stringify(templateCotizacionParams));
      localStorage.setItem('idioma_vancity', this.lang);

      // 🚨 IMPORTANTE: Pon aquí tu ID del Template de Cotización
        emailjs.send('service_gepyy7k', 'template_yyc4gkw', templateCotizacionParams, '8BD-wbQdkJaPiLyLx')       
        .catch((err) => console.error('Error Email:', err));

      return; // Detenemos aquí para que el cliente vea la tarifa
    }

    // ==================================================
    // PASO 2: PROCEDER AL PAGO (GUARDAR EN DB Y OPENPAY)
    // ==================================================
    this.loading = true;
    this.pagoIniciado = true;

    try {
      // 1. Guardar en Base de Datos (Le pasamos estatus pendiente por defecto)
      const dataParaGuardar = { ...formVal, estatus: 'COTIZADO' };
      const { data, error } = await supabase
        .from('reservas_experiencias')
        .insert([dataParaGuardar])
        .select();

      if (error) throw error;
      
      // 2. Ejecutar la función de pago
      const nombreCompleto = `${formVal.nombre} ${formVal.apellido}`;
      await this.procederAlPago(data[0].id, formVal.tipo_servicio, formVal.vehiculo, nombreCompleto, formVal.correo_cliente);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error as any).message);
      this.loading = false;
      this.pagoIniciado = false;
    } 
  }

  async procederAlPago(reservaId: string, tipoServicio: string, vehiculo: string, nombre: string, email: string) {
    
    const descripcionViaje = tipoServicio === 'half-day' ? 'Half Day' : 'Full Day';
    const descripcionFinal = `Vancity Experience ${descripcionViaje}  ${vehiculo}`;

    const datosPago = {
      monto: this.cotizacion, 
      nombre: nombre,
      email: email,
      descripcion: descripcionFinal,
      redirectUrl: "https://igdsmxcity.vancity.mx/reserva-experiencia" // <-- AÑADE ESTO
    };

    try {
      const { data, error } = await supabase.functions.invoke('openpay-checkout', { body: datosPago });

      if (error || (data && data.error)) {
        alert(this.lang === 'en' ? 'Bank connection error. Try again.' : 'Error al conectar con el banco. Intenta de nuevo.');
        this.loading = false;
        this.pagoIniciado = false;
        return;
      }

      window.location.href = data.checkoutLink; 

    } catch (fatalError) {
      console.error('Error de conexión:', fatalError);
      alert(this.lang === 'en' ? 'System error.' : 'Error del sistema.');
      this.loading = false;
      this.pagoIniciado = false;
    }
  }
}