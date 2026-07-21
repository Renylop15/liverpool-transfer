import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { createClient } from '@supabase/supabase-js'; 
import { RouterModule, ActivatedRoute } from '@angular/router'; 
import emailjs from '@emailjs/browser';

const supabaseUrl = 'https://chyuacdnyaduqnawsoii.supabase.co'; 
const supabaseKey = 'sb_publishable_j34PDqBJtmzklQqnP6kL4A_AxNnerKR'; 
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. La interfaz correcta y completa va AQUÍ, afuera de la clase
interface Asiento {
  numero: number;
  estado: 'disponible' | 'ocupado' | 'seleccionado';
  top: string;
  left: string;
}

@Component({
  selector: 'app-reserva-boda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reserva-boda.component.html',
  styleUrl: './reserva-boda.component.css'
})
export class ReservaBodaComponent implements OnInit {
  reservaForm!: FormGroup;
  lang: 'en' | 'es' = 'es';
  loading = false; 
  pagoIniciado = false; 
  cotizacion: number | null = null; 
  
  opcionesTickets: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; 
  precioPorBoleto: number = 980; 
  
  reservaGeneradaId: string | null = null; 
  showSuccessModal = false;

  texts: any = {
    en: { title: 'Wedding Shuttle Booking', tickets: 'Number of Tickets', pickup: 'Pickup Information' },
    es: { title: 'Reserva Transporte de Boda', tickets: 'Número de Asientos', pickup: 'Información de Salida' }
  };

  asientos: Asiento[] = [];
  asientosSeleccionados: number[] = [];

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef, private route: ActivatedRoute) {
    this.inicializarAsientos();
  }

  ngOnInit(): void {
    this.reservaForm = this.fb.group({
      boletos: [1, Validators.required],
      horario: ['', Validators.required],
      mismoNombre: [false],
      pasajerosDetalle: this.fb.array([]) 
    });

    this.actualizarCamposPasajeros(1); 

    // LÓGICA ACTUALIZADA PARA BOLETOS
    this.reservaForm.get('boletos')?.valueChanges.subscribe(cantidad => {
      const usarMismoNombre = this.reservaForm.get('mismoNombre')?.value;
      // Si el check está activo, mantenemos 1 solo formulario sin importar cuántos boletos sean
      this.actualizarCamposPasajeros(usarMismoNombre ? 1 : parseInt(cantidad));
      this.cotizacion = null;
      this.limpiarAsientosSeleccionados();
    });

    // NUEVA LÓGICA PARA EL CHECKBOX
    this.reservaForm.get('mismoNombre')?.valueChanges.subscribe(checked => {
      const cantidadBoletos = parseInt(this.reservaForm.get('boletos')?.value || '1');
      this.actualizarCamposPasajeros(checked ? 1 : cantidadBoletos);
      this.cotizacion = null;
    });

    this.reservaForm.get('horario')?.valueChanges.subscribe(horario => {
      this.cargarAsientosOcupados(horario); // <-- Cambio de nombre aquí
      this.cotizacion = null;
      this.limpiarAsientosSeleccionados();
    });

    this.verificarPagoOpenpay();
  }

  inicializarAsientos() {
    const posiciones = [

  // ===== FILA TRASERA =====
  { num: 11, t: '22%', l: '9.5%' },
  { num: 12, t: '36%', l: '9.5%' },
  { num: 13, t: '60%', l: '9.5%' },
  { num: 14, t: '75%', l: '9.5%' },

  // ===== COLUMNA 2 =====
  { num: 10, t: '22%', l: '19.8%' },
  { num: 9,  t: '36%', l: '19.8%' },
  { num: 15, t: '75%', l: '19.8%' },

  // ===== COLUMNA 3 =====
  { num: 8,  t: '22%', l: '29.8%' },
  { num: 7,  t: '36%', l: '29.8%' },
  { num: 16, t: '75%', l: '29.8%' },

  // ===== COLUMNA 4 =====
  { num: 6,  t: '22%', l: '39.8%' },
  { num: 5,  t: '36%', l: '39.8%' },
  { num: 17, t: '75%', l: '39.8%' },

  // ===== COLUMNA 5 =====
  { num: 4,  t: '22%', l: '49.8%' },
  { num: 3,  t: '36%', l: '49.8%' },
  { num: 18, t: '75%', l: '49.8%' },

  // ===== COLUMNA 6 =====
  { num: 2,  t: '22%', l: '59.8%' },
  { num: 1,  t: '36%', l: '59.8%' },

  // ===== COPILOTO =====
  { num: 19, t: '76%', l: '69.8%' }

];

    this.asientos = posiciones.map((pos): Asiento => ({
      numero: pos.num,
      estado: 'disponible',
      top: pos.t,
      left: pos.l
    })).sort((a, b) => a.numero - b.numero); 
  }

  async cargarAsientosOcupados(horario: string) {
    // 1. Primero, reiniciamos todos los asientos a disponibles
    this.asientos.forEach(a => a.estado = 'disponible');
    this.asientosSeleccionados = [];

    if (!horario) return;

    this.loading = true; 
    this.cdr.detectChanges();

    try {
      // 2. Buscamos en Supabase las reservas pagadas para este horario
      const { data, error } = await supabase
        .from('reserva_boda')
        .select('itinerario_notas')
        .eq('tipo_servicio', 'Wedding Shuttle')
        .eq('fecha_servicio', horario)
        .eq('estatus', 'PAGADO'); // Solo bloqueamos los que ya están pagados

      if (error) throw error;

      const asientosOcupados: number[] = [];

      // 3. Extraemos los números de asiento de las notas guardadas
      if (data) {
        data.forEach(reserva => {
          const notas = reserva.itinerario_notas || '';
          // Busca el texto "Asientos: 1, 2, 3 |" usando una expresión regular
          const match = notas.match(/Asientos:\s*([^|]+)/);
          
          if (match && match[1]) {
            const numeros = match[1].split(',')
                                    .map((n: string) => parseInt(n.trim(), 10))
                                    .filter((n: number) => !isNaN(n)); // Ya tiene su tipo definido
            asientosOcupados.push(...numeros);
          }
        });
      }

      // 4. Actualizamos el estado en el mapa
      this.asientos.forEach(a => {
        if (asientosOcupados.includes(a.numero)) {
          a.estado = 'ocupado';
        }
      });

    } catch (err) {
      console.error('Error al cargar asientos:', err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  seleccionarAsiento(asiento: Asiento) {
    if (asiento.estado === 'ocupado') return;
    
    const boletosPermitidos = parseInt(this.reservaForm.get('boletos')?.value || '1');

    if (asiento.estado === 'disponible') {
      if (this.asientosSeleccionados.length < boletosPermitidos) {
        asiento.estado = 'seleccionado';
        this.asientosSeleccionados.push(asiento.numero);
      } else {
        alert(this.lang === 'en' ? 'You have selected all your tickets.' : 'Ya seleccionaste todos tus asientos pagados.');
      }
    } else if (asiento.estado === 'seleccionado') {
      asiento.estado = 'disponible';
      this.asientosSeleccionados = this.asientosSeleccionados.filter(num => num !== asiento.numero);
    }
    
    this.cotizacion = null; 
  }

  limpiarAsientosSeleccionados() {
    this.asientosSeleccionados = [];
    this.asientos.forEach(a => {
      if (a.estado === 'seleccionado') a.estado = 'disponible';
    });
  }

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

  async onSubmit() {
    const boletos = parseInt(this.reservaForm.get('boletos')?.value);

    if (this.reservaForm.invalid) {
      alert(this.lang === 'en' ? 'Please fill all fields.' : 'Por favor completa todos los campos.');
      return;
    }

    if (this.asientosSeleccionados.length !== boletos) {
      alert(this.lang === 'en' ? `Please select exactly ${boletos} seats on the map.` : `Por favor selecciona exactamente ${boletos} asientos en el mapa.`);
      return;
    }
    
    const formVal = this.reservaForm.value;

    if (this.cotizacion === null) {
      this.cotizacion = this.precioPorBoleto * boletos;
      this.loading = false;
      this.cdr.detectChanges(); 

      const paxPrincipal = formVal.pasajerosDetalle[0];
      const notasCompletas = `Horario: ${formVal.horario} | Asientos: ${this.asientosSeleccionados.join(', ')} | Pax Details: ${JSON.stringify(formVal.pasajerosDetalle)}`;

      const dataParaGuardar = { 
        nombre: paxPrincipal.nombre,
        apellido: paxPrincipal.apellido,
        correo_cliente: paxPrincipal.correo,
        telefono: paxPrincipal.telefono,
        pasajeros: boletos.toString(), 
        estatus: 'COTIZADO', 
        cotizacion: this.cotizacion,
        fecha_servicio: formVal.horario,
        hora_recogida: formVal.horario,
        lugar_recogida: 'Hotel Sede CDMX',
        tipo_servicio: 'Wedding Shuttle',
        vehiculo: 'Large Van 20 Pax',
        itinerario_notas: notasCompletas
      };
      
    const { data, error } = await supabase.from('reserva_boda').insert([dataParaGuardar]).select();
      if (data && data.length > 0) {
        this.reservaGeneradaId = data[0].id; 
      }
    } else {
      this.loading = true;
      this.pagoIniciado = true;
      const paxPrincipal = formVal.pasajerosDetalle[0];
      const nombreCompleto = `${paxPrincipal.nombre} ${paxPrincipal.apellido}`;
      await this.procederAlPago(nombreCompleto, paxPrincipal.correo);
    }
  }

  async procederAlPago(nombre: string, email: string) {
    // 1. Obtenemos los boletos y los asientos seleccionados
    const boletos = this.reservaForm.get('boletos')?.value;
    const asientosTexto = this.asientosSeleccionados.join(', '); // Ej: "11, 12"
    
    // 2. Separamos la descripción del banco y la del correo
    const descripcionFinal = `Wedding Shuttle - ${boletos} Tickets`;
    const descripcionParaCorreo = `Wedding Shuttle - ${boletos} Tickets (Asientos / Seats: ${asientosTexto})`;
    
    // 3. Agregamos el reserva_id a la URL de retorno
    const urlRetorno = `${window.location.origin}${window.location.pathname}?reserva_id=${this.reservaGeneradaId}`;

    const datosCorreo = {
      nombre: nombre,
      email_destino: email,
      cotizacion: this.cotizacion,
      tipo_servicio: descripcionParaCorreo // <-- Aquí inyectamos los asientos al correo
    };
    
    localStorage.setItem('reserva_boda_vancity', JSON.stringify(datosCorreo));
    localStorage.setItem('idioma_vancity', this.lang);
    
    const datosPago = { 
      monto: this.cotizacion, 
      nombre: nombre, 
      email: email, 
      descripcion: descripcionFinal, // <-- Openpay se queda con la versión corta
      redirectUrl: urlRetorno,
      reserva_id: this.reservaGeneradaId 
    };

    try {
      this.pagoIniciado = true; 
      const { data, error } = await supabase.functions.invoke('openpay-checkout', { body: datosPago });
      
      if (error || (data && data.error)) {
        alert(this.lang === 'en' ? 'Bank connection error.' : 'Error al conectar con el banco.');
        this.loading = false; 
        this.pagoIniciado = false; 
        this.cdr.detectChanges(); 
        return;
      }
      
      window.location.href = data.checkoutLink; 
    } catch (err) {
      this.loading = false; 
      this.pagoIniciado = false;
      this.cdr.detectChanges();
    }
  }

  verificarPagoOpenpay() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const openpayId = urlParams.get('id'); 
      const reservaIdRecuperada = urlParams.get('reserva_id');

      if (openpayId && reservaIdRecuperada) {
        supabase.functions.invoke('openpay-checkout', { 
          body: { action: 'verify', transaction_id: openpayId } 
        }).then(async ({ data, error }) => {
          
          if (error || !data || data.status !== 'completed') {
             alert('El pago no pudo ser procesado o el banco declinó la autorización.');
             window.history.replaceState({}, document.title, window.location.pathname);
             return; 
          }

          // 1. ACTUALIZAR ESTATUS EN SUPABASE
          const { data: updateData, error: updateError } = await supabase
            .from('reserva_boda')
            .update({ estatus: 'PAGADO' })
            .eq('id', reservaIdRecuperada)
            .select('fecha_servicio');

          if (!updateError && updateData && updateData.length > 0) {
            const horarioPagado = updateData[0].fecha_servicio;
            this.reservaForm.patchValue({ horario: horarioPagado });
            await this.cargarAsientosOcupados(horarioPagado);
          }

          // --- NUEVO: ENVÍO DE CORREO DE CONFIRMACIÓN ---
          const datosGuardados = localStorage.getItem('reserva_boda_vancity');
          const idiomaGuardado = localStorage.getItem('idioma_vancity') || 'es';

          if (datosGuardados) {
            const datosCorreo = JSON.parse(datosGuardados);
            
            const templatePagoParams = {
              titulo_mensaje: idiomaGuardado === 'en' ? '✅ Payment Confirmed' : '✅ Pago Confirmado',
              mensaje_principal: idiomaGuardado === 'en' ? 'Thank you! Your shuttle seats are reserved.' : '¡Gracias! Tus lugares en la Van están reservados.',
              nombre: datosCorreo.nombre, 
              email_destino: datosCorreo.email_destino, 
              folio: openpayId,
              tipo_servicio: datosCorreo.tipo_servicio, 
              monto: datosCorreo.cotizacion
            };
            
            // Reutiliza tus IDs de servicio y plantilla de EmailJS
            emailjs.send('service_gepyy7k', 'template_giiio1o', templatePagoParams, '8BD-wbQdkJaPiLyLx').catch(() => {});
            
            // Limpiamos los datos para no dejar basura en el navegador
            localStorage.removeItem('reserva_boda_vancity');
          }
          // ----------------------------------------------

          this.showSuccessModal = true;
          this.cdr.detectChanges();
        });
      }
    }
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    localStorage.removeItem('reserva_boda_vancity');
    localStorage.removeItem('idioma_vancity');
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}