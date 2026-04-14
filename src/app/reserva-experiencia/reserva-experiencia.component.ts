import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { createClient } from '@supabase/supabase-js'; 
import { RouterModule } from '@angular/router';

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
  
  horas: string[] = [];
  minutos: string[] = [];

  texts: any = {
    en: {
      title: 'Book Your Service',
      firstName: 'First Name',
      lastName: 'Last Name',
      pickup_time: 'Pickup Time',
      submit: 'SUBMIT REQUEST',
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
      submit: 'ENVIAR SOLICITUD',
      serviceType: 'Tipo de Servicio',
      halfDay: 'Medio Día (Hasta 6 Horas)',
      fullDay: 'Día Completo (Hasta 12 Horas)',
      pickup: 'Lugar de Recogida (Hotel o Dirección)'
    }
  };

  constructor(private fb: FormBuilder) {
    for (let i = 0; i < 24; i++) {
      this.horas.push(i < 10 ? '0' + i : i.toString());
    }
    for (let i = 0; i < 60; i += 5) {
      this.minutos.push(i < 10 ? '0' + i : i.toString());
    }
  }

  ngOnInit(): void {
    // 1. Aquí podemos agregar después la lógica de EmailJS cuando regresan del pago (igual que en reserva)
    
    this.reservaForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo_cliente: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      pasajeros: ['1-2', Validators.required],
      tipo_servicio: ['', Validators.required],
      fecha_servicio: ['', Validators.required],
      hora_recogida: ['', Validators.required], 
      lugar_recogida: ['', Validators.required],
      itinerario_notas: ['']
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

  async onSubmit() {
    if (this.reservaForm.invalid) {
      alert(this.lang === 'en' ? 'Please fill all fields' : 'Por favor completa todos los campos');
      return;
    }

    this.loading = true;
    const formVal = this.reservaForm.value;

    try {
      // 1. Guardar en Base de Datos
      const { data, error } = await supabase
        .from('reservas_experiencias')
        .insert([formVal])
        .select();

      if (error) throw error;
      
      // 2. Ejecutar la función de pago
      const nombreCompleto = `${formVal.nombre} ${formVal.apellido}`;
      await this.procederAlPago(data[0].id, formVal.tipo_servicio, nombreCompleto, formVal.correo_cliente);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error as any).message);
      this.loading = false;
    } 
    // Quitamos el finally { this.loading = false } de aquí para que no se apague el botón mientras redirige
  }

  // NUEVA FUNCIÓN: Conexión con Openpay a través de Supabase Edge Functions
  async procederAlPago(reservaId: string, tipoServicio: string, nombre: string, email: string) {
    
    // Asignamos los precios según el tipo de servicio (puedes ajustar estos montos)
    const monto = tipoServicio === 'half-day' ? 3500 : 6500;
    const descripcionViaje = tipoServicio === 'half-day' ? 'Half Day Disposal ' : 'Full Day Disposal ';

    const datosPago = {
      monto: monto,
      nombre: nombre,
      email: email,
      descripcion: `Vancity Experience ${descripcionViaje}`
    };

    try {
      // Invocamos la misma Edge Function que usas para el otro formulario
      const { data, error } = await supabase.functions.invoke('openpay-checkout', { body: datosPago });

      if (error || (data && data.error)) {
        alert(this.lang === 'en' ? 'Bank connection error. Try again.' : 'Error al conectar con el banco. Intenta de nuevo.');
        this.loading = false;
        return;
      }

      // Si todo sale bien, guardamos en localStorage para cuando regrese de pagar (igual que en reservas)
      localStorage.setItem('experiencia_vancity', JSON.stringify({ email_destino: email, nombre: nombre }));
      localStorage.setItem('idioma_vancity', this.lang);

      // Redirigir al link de pago
      window.location.href = data.checkoutLink; 

    } catch (fatalError) {
      console.error('Error de conexión:', fatalError);
      alert(this.lang === 'en' ? 'System error.' : 'Error del sistema.');
      this.loading = false;
    }
  }
}