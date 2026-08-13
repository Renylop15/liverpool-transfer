import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { createClient } from '@supabase/supabase-js'; 
import { RouterModule, ActivatedRoute } from '@angular/router'; 
import emailjs from '@emailjs/browser';

const supabaseUrl = 'https://chyuacdnyaduqnawsoii.supabase.co'; 
const supabaseKey = 'sb_publishable_j34PDqBJtmzklQqnP6kL4A_AxNnerKR'; 
const supabase = createClient(supabaseUrl, supabaseKey);

interface Asiento {
  numero: number;
  estado: 'disponible' | 'ocupado' | 'seleccionado';
  top: string;
  left: string;
}

@Component({
  selector: 'app-reserva-vaiven',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reserva-vaiven.component.html',
  styleUrl: './reserva-vaiven.component.css'
})
export class ReservaVaivenComponent implements OnInit {
  reservaForm!: FormGroup;
  lang: 'en' | 'es' = 'es';
  loading = false; 
  pagoIniciado = false; 
  cotizacion: number | null = null; 
  
  opcionesTickets: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; 
  precioPorBoleto: number = 850; // Ajustado a $850 para Vaivén
  
  reservaGeneradaId: string | null = null; 
  showSuccessModal = false;
  unidadActual: number = 1; // Para llevar control de qué camioneta se está llenando

  texts: any = {
    en: { title: 'Vaivén Shuttle Booking', tickets: 'Number of Tickets', pickup: 'Pickup Information' },
    es: { title: 'Reserva Transporte Vaivén', tickets: 'Número de Asientos', pickup: 'Información de Salida' }
  };

  asientos: Asiento[] = [];
  asientosSeleccionados: number[] = [];

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef, private route: ActivatedRoute) {
    this.inicializarAsientos();
  }

  ngOnInit(): void {
    this.reservaForm = this.fb.group({
      boletos: [1, Validators.required],
      punto_encuentro: ['', Validators.required],
      mismoNombre: [false],
      pasajerosDetalle: this.fb.array([]) 
    });

    this.actualizarCamposPasajeros(1); 
    
    // Carga global de asientos al iniciar el componente
    this.cargarAsientosGlobales();

    this.reservaForm.get('boletos')?.valueChanges.subscribe(cantidad => {
      const usarMismoNombre = this.reservaForm.get('mismoNombre')?.value;
      this.actualizarCamposPasajeros(usarMismoNombre ? 1 : parseInt(cantidad));
      this.cotizacion = null;
      this.limpiarAsientosSeleccionados();
    });

    this.reservaForm.get('mismoNombre')?.valueChanges.subscribe(checked => {
      const cantidadBoletos = parseInt(this.reservaForm.get('boletos')?.value || '1');
      this.actualizarCamposPasajeros(checked ? 1 : cantidadBoletos);
      this.cotizacion = null;
    });

    this.reservaForm.get('punto_encuentro')?.valueChanges.subscribe(() => {
      this.cotizacion = null;
    });

    this.verificarPagoOpenpay();
  }

  inicializarAsientos() {
    const posiciones = [
      { num: 11, t: '22%', l: '9.5%' }, { num: 12, t: '36%', l: '9.5%' },
      { num: 13, t: '60%', l: '9.5%' }, { num: 14, t: '75%', l: '9.5%' },
      { num: 10, t: '22%', l: '19.8%' }, { num: 9,  t: '36%', l: '19.8%' }, { num: 15, t: '75%', l: '19.8%' },
      { num: 8,  t: '22%', l: '29.8%' }, { num: 7,  t: '36%', l: '29.8%' }, { num: 16, t: '75%', l: '29.8%' },
      { num: 6,  t: '22%', l: '39.8%' }, { num: 5,  t: '36%', l: '39.8%' }, { num: 17, t: '75%', l: '39.8%' },
      { num: 4,  t: '22%', l: '49.8%' }, { num: 3,  t: '36%', l: '49.8%' }, { num: 18, t: '75%', l: '49.8%' },
      { num: 2,  t: '22%', l: '59.8%' }, { num: 1,  t: '36%', l: '59.8%' },
      { num: 19, t: '76%', l: '69.8%' }
    ];

    this.asientos = posiciones.map((pos): Asiento => ({
      numero: pos.num,
      estado: 'disponible',
      top: pos.t,
      left: pos.l
    })).sort((a, b) => a.numero - b.numero); 
  }

  async cargarAsientosGlobales() {
    this.asientos.forEach(a => a.estado = 'disponible');
    this.asientosSeleccionados = [];
    this.loading = true; 
    this.cdr.detectChanges();

    try {
      const { data, error } = await supabase
        .from('reservas_vaiven')
        .select('unidad_asignada, itinerario_notas')
        .eq('estatus', 'PAGADO'); 

      if (error) throw error;

      let maximaUnidad = 1;
      let asientosEnMaximaUnidad: number[] = [];

      if (data && data.length > 0) {
        maximaUnidad = Math.max(...data.map(d => d.unidad_asignada));
        const reservasUnidad = data.filter(d => d.unidad_asignada === maximaUnidad);

        reservasUnidad.forEach(reserva => {
          const notas = reserva.itinerario_notas || '';
          const match = notas.match(/Asientos:\s*([^|]+)/);
          
          if (match && match[1]) {
            const numeros = match[1].split(',')
                                    .map((n: string) => parseInt(n.trim(), 10))
                                    .filter((n: number) => !isNaN(n));
            asientosEnMaximaUnidad.push(...numeros);
          }
        });

        // Si la camioneta ya tiene 19 asientos pagados, abrimos una nueva camioneta (Unidad + 1)
        if (asientosEnMaximaUnidad.length >= 19) {
          maximaUnidad++;
          asientosEnMaximaUnidad = []; // La nueva unidad empieza vacía
        }
      }

      this.unidadActual = maximaUnidad;

      // Marcamos los ocupados en el mapa
      this.asientos.forEach(a => {
        if (asientosEnMaximaUnidad.includes(a.numero)) {
          a.estado = 'ocupado';
        }
      });

      // --- NUEVA LÓGICA: LIMITAR EL DROPDOWN DE TICKETS ---
      const asientosOcupados = asientosEnMaximaUnidad.length;
      const asientosDisponibles = 19 - asientosOcupados;
      const maxOpciones = Math.min(10, asientosDisponibles); // Máximo 10 o los que queden libres

      // Reconstruimos el arreglo de opciones [1, 2, 3...]
      this.opcionesTickets = [];
      for (let i = 1; i <= maxOpciones; i++) {
        this.opcionesTickets.push(i);
      }

      // Si el usuario tenía seleccionado un número de boletos mayor a los disponibles, auto-corregimos
      const boletosActuales = parseInt(this.reservaForm.get('boletos')?.value || '1');
      if (boletosActuales > maxOpciones) {
        this.reservaForm.patchValue({ boletos: maxOpciones });
        alert(this.lang === 'en' 
          ? `Only ${maxOpciones} seats left in this unit. We adjusted your selection.` 
          : `Solo quedan ${maxOpciones} lugares en esta unidad. Hemos ajustado tu selección.`);
      }
      // ----------------------------------------------------

    } catch (err) {
      console.error('Error al cargar asientos globales:', err);
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
        alert(this.lang === 'en' ? 'You have selected all your tickets.' : 'Ya seleccionaste todos tus asientos.');
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
      alert(this.lang === 'en' ? 'Please fill all fields.' : 'Por favor completa todos los campos requeridos.');
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
      const notasCompletas = `Punto: ${formVal.punto_encuentro} | Asientos: ${this.asientosSeleccionados.join(', ')} | Pax Details: ${JSON.stringify(formVal.pasajerosDetalle)}`;

      const dataParaGuardar = { 
        nombre: paxPrincipal.nombre,
        apellido: paxPrincipal.apellido,
        correo_cliente: paxPrincipal.correo,
        telefono: paxPrincipal.telefono,
        pasajeros: boletos, 
        punto_encuentro: formVal.punto_encuentro,
        unidad_asignada: this.unidadActual,
        estatus: 'COTIZADO', 
        cotizacion: this.cotizacion,
        vehiculo: 'Large Van 19 Pax',
        itinerario_notas: notasCompletas
      };
      
      const { data, error } = await supabase.from('reservas_vaiven').insert([dataParaGuardar]).select();
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
    const boletos = this.reservaForm.get('boletos')?.value;
    const asientosTexto = this.asientosSeleccionados.join(', ');
    
    const descripcionFinal = `Vaiven Shuttle - ${boletos} Tickets`;
    const descripcionParaCorreo = `Vaiven Shuttle - Unidad ${this.unidadActual} - ${boletos} Tickets (Asientos: ${asientosTexto})`;
    
    const urlRetorno = `${window.location.origin}${window.location.pathname}?reserva_id=${this.reservaGeneradaId}`;

    const datosCorreo = {
      nombre: nombre,
      email_destino: email,
      cotizacion: this.cotizacion,
      tipo_servicio: descripcionParaCorreo 
    };
    
    localStorage.setItem('reserva_vaiven_vancity', JSON.stringify(datosCorreo));
    localStorage.setItem('idioma_vancity', this.lang);
    
    const datosPago = { 
      monto: this.cotizacion, 
      nombre: nombre, 
      email: email, 
      descripcion: descripcionFinal, 
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

          // ACTUALIZAR ESTATUS EN SUPABASE TABLA VAIVEN
          const { data: updateData, error: updateError } = await supabase
            .from('reservas_vaiven')
            .update({ estatus: 'PAGADO' })
            .eq('id', reservaIdRecuperada)
            .select('punto_encuentro');

          if (!updateError && updateData && updateData.length > 0) {
            const pEncuentro = updateData[0].punto_encuentro;
            this.reservaForm.patchValue({ punto_encuentro: pEncuentro });
            await this.cargarAsientosGlobales();
          }

          const datosGuardados = localStorage.getItem('reserva_vaiven_vancity');
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
            
            emailjs.send('service_gepyy7k', 'template_giiio1o', templatePagoParams, '8BD-wbQdkJaPiLyLx').catch(() => {});
            localStorage.removeItem('reserva_vaiven_vancity');
          }

          this.showSuccessModal = true;
          this.cdr.detectChanges();
        });
      }
    }
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    localStorage.removeItem('reserva_vaiven_vancity');
    localStorage.removeItem('idioma_vancity');
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}