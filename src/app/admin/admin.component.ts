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

  // 2. Traemos al "cadenero" que obliga a la pantalla a actualizarse
  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.cargarReservas();
  }

  async cargarReservas() {
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error de Supabase cargando los datos:', error);
      } else {
        this.reservas = data || [];
      }
    } catch (err) {
      console.error('Error inesperado de conexión:', err);
    } finally {
      // 3. Esto asegura que el mensaje "Cargando..." se quite PASE LO QUE PASE
      this.cargando = false;
      this.cdr.detectChanges(); // Obligamos a la pantalla a refrescarse
    }
  }
}