import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createClient } from '@supabase/supabase-js';
import { Router } from '@angular/router'; // <-- NUEVO

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
  reservasTraslados: any[] = [];
  reservasExperiencias: any[] = []; // <-- Nueva tabla
  cargando = true;
  tabActiva: 'traslados' | 'experiencias' = 'traslados'; // <-- Controla la pestaña

constructor(private cdr: ChangeDetectorRef, private router: Router) {}
  async ngOnInit() {
    setTimeout(() => {
      this.cargarDatos();
    }, 100);
  }

  cambiarTab(tab: 'traslados' | 'experiencias') {
    this.tabActiva = tab;
  }

  async cargarDatos() {
    this.cargando = true;
    try {
      // 1. Cargamos Traslados
      const { data: dataTraslados, error: err1 } = await supabase
        .from('reservas')
        .select('*')
        .order('created_at', { ascending: false });

      if (err1) console.error('Error Traslados:', err1.message);
      else this.reservasTraslados = dataTraslados || [];

      // 2. Cargamos Experiencias
      const { data: dataExp, error: err2 } = await supabase
        .from('reservas_experiencias')
        .select('*')
        .order('created_at', { ascending: false });

      if (err2) console.error('Error Experiencias:', err2.message);
      else this.reservasExperiencias = dataExp || [];

    } catch (err) {
      console.error('ERROR DE CONEXIÓN:', err);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges(); 
    }
    
  }
  async cerrarSesion() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      this.router.navigate(['/login']); // Lo pateamos al login
    } else {
      console.error('Error al cerrar sesión:', error);
    }
  }
}