import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
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
  opcionesPasajeros: number[] = [1, 2, 3, 4];

  // Modales
  showAvailabilityModal = false;
  showSuccessModal = false;
  // FUNCIÓN PARA CERRAR EL MODAL DE ÉXITO Y LIMPIAR DATOS
  closeSuccessModal() {
    this.showSuccessModal = false;
    localStorage.removeItem('chofer_vancity');
    localStorage.removeItem('idioma_vancity');
    // Limpia la URL para quitar el ID de OpenPay
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.reservaForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      confirmarEmail: ['', Validators.required],
      codigoPais: ['+52', Validators.required],
      telefono: ['', Validators.required],
      vehiculo: ['', Validators.required],
      pasajeros: [1, Validators.required],
      duracion: ['medio_dia', Validators.required], // medio_dia o dia_completo
      fecha: ['', Validators.required],
      horaRecogida: ['', Validators.required],
      puntoPartida: ['', Validators.required],
      destinos: this.fb.array([this.fb.control('', Validators.required)]) // Primer destino obligatorio
    }, { validators: this.emailMatchValidator });
  }

  ngOnInit(): void {
    for (let i = 0; i < 24; i++) this.horas.push(i.toString().padStart(2, '0'));
    for (let i = 0; i < 60; i++) this.minutos.push(i.toString().padStart(2, '0'));

    // Escuchar cambios en vehículo para ajustar pasajeros
    this.reservaForm.get('vehiculo')?.valueChanges.subscribe(v => {
      this.opcionesPasajeros = v === 'Sedan' ? [1, 2, 3] : [1, 2, 3, 4];
      if (v === 'Sedan' && this.reservaForm.value.pasajeros > 3) {
        this.reservaForm.patchValue({ pasajeros: 1 });
      }
      this.cotizacion = null;
    });

    // Lógica Retorno OpenPay (El Verificador que ya tenemos)
    this.revisarRetornoPago();
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
    if (this.destinos.length > 1) this.destinos.removeAt(index);
  }

  // ==========================================
  // VALIDACIONES Y DISPONIBILIDAD
  // ==========================================
  emailMatchValidator(g: FormGroup) {
    return g.get('email')?.value === g.get('confirmarEmail')?.value ? null : { mismatch: true };
  }

  timeToMinutes(t: string) {
    const [h, m] = t.split(':').map(Number);
    return (h * 60) + m;
  }

  async validarDisponibilidad(fecha: string, hora: string) {
    if (!fecha || !hora) return;
    this.loading = true;

    const duracionMinutos = this.reservaForm.value.duracion === 'medio_dia' ? 300 : 600;
    const reqInicio = this.timeToMinutes(hora);
    const reqFin = reqInicio + duracionMinutos;

    const { data } = await supabase.from('reservas_chofer')
      .select('*')
      .eq('fecha', fecha)
      .eq('estatus', 'PAGADO');

    let overlaps = 0;
    if (data) {
      data.forEach(res => {
        const resInicio = this.timeToMinutes(res.hora_recogida);
        const resFin = resInicio + (res.duracion === 'medio_dia' ? 300 : 600);
        // Si los rangos de tiempo se cruzan
        if (reqInicio < resFin && reqFin > resInicio) overlaps++;
      });
    }

    if (overlaps >= 3) {
      this.showAvailabilityModal = true;
      this.reservaForm.patchValue({ horaRecogida: '' });
    }
    this.loading = false;
    this.cdr.detectChanges();
  }

  // ==========================================
  // COTIZACIÓN Y PAGO
  // ==========================================
  async onSubmit() {
    if (this.reservaForm.invalid) return;

    const val = this.reservaForm.value;
    if (this.cotizacion === null) {
      // Matriz de precios
      if (val.vehiculo === 'Sedan') {
        this.cotizacion = val.duracion === 'medio_dia' ? 3500 : 5500;
      } else {
        this.cotizacion = val.duracion === 'medio_dia' ? 4500 : 7500;
      }

      // Guardar en Supabase como COTIZADO
      const dataInsert = {
        nombre: val.nombres, apellido: val.apellidos, email: val.email,
        telefono: val.telefono, vehiculo: val.vehiculo, duracion: val.duracion,
        fecha: val.fecha, hora_recogida: val.horaRecogida, punto_partida: val.puntoPartida,
        itinerario: val.destinos.join(' -> '), cotizacion: this.cotizacion, estatus: 'COTIZADO'
      };
      await supabase.from('reservas_chofer').insert([dataInsert]);
      
      // Guardar localmente para el retorno
      localStorage.setItem('chofer_vancity', JSON.stringify({
        email_destino: val.email, nombre: val.nombres, cotizacion: this.cotizacion,
        tipo_servicio: `Chofer Privado - ${val.duracion}`
      }));
      localStorage.setItem('idioma_vancity', this.lang);

    } else {
      this.pagoIniciado = true;
      const urlRetorno = window.location.origin + '/reserva-chofer';
      const body = {
        monto: this.cotizacion, nombre: val.nombres, email: val.email,
        descripcion: `Servicio Chofer Vancity ${val.duracion}`, redirectUrl: urlRetorno
      };
      const { data } = await supabase.functions.invoke('openpay-checkout', { body });
      window.location.href = data.checkoutLink;
    }
  }

  // (Aquí incluirías el revisor de retorno y los modales de éxito igual que en los otros formularios)
  private async revisarRetornoPago() {
    const urlParams = new URLSearchParams(window.location.search);
    const openpayId = urlParams.get('id');
    if (openpayId) {
      const { data } = await supabase.functions.invoke('openpay-checkout', { body: { action: 'verify', transaction_id: openpayId } });
      if (data?.status === 'completed') {
        const local = JSON.parse(localStorage.getItem('chofer_vancity') || '{}');
        // EmailJS y Update Supabase aquí...
        this.showSuccessModal = true;
      }
    }
  }
  // Añade esta función dentro de tu clase ReservaChoferComponent
actualizarHora(h: string, m: string) {
  if (h && m) {
    const horaCompleta = `${h}:${m}`;
    this.reservaForm.patchValue({ horaRecogida: horaCompleta });
    this.validarDisponibilidad(this.reservaForm.value.fecha, horaCompleta);
  }
}
}
