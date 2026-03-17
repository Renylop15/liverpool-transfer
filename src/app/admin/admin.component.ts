import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createClient } from '@supabase/supabase-js';

// 1. ¡OJO! REVISA QUE SÍ HAYAS PEGADO TUS LLAVES REALES AQUÍ:
const supabaseUrl = 'https://chyuacdnyaduqnawsoii.supabase.co'; 
const supabaseKey = 'sb_publishable_j34PDqBJtmzklQqnP6kL4A_AxNnerKR';
const supabase = createClient(supabaseUrl, supabaseKey);


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  reservas: any[] = [];
  cargando = true;

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    // Le damos un pequeño respiro a Angular para que termine de "hidratar"
    setTimeout(() => {
      this.cargarReservas();
    }, 100);
  }

  async cargarReservas() {
    console.log("--- INTENTANDO CARGAR RESERVAS ---");
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('ERROR DE SUPABASE:', error.message);
      } else {
        // Asignamos los datos
        this.reservas = data || [];
        console.log("DATOS OBTENIDOS:", this.reservas);
      }
    } catch (err) {
      console.error('ERROR DE CONEXIÓN:', err);
    } finally {
      // Forzamos el cambio de estado y la actualización de la vista
      this.cargando = false;
      this.cdr.detectChanges(); 
      console.log("VISTA ACTUALIZADA. Cargando es:", this.cargando);
    }
  }
}