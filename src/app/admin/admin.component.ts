import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createClient } from '@supabase/supabase-js';
import { Router } from '@angular/router'; 

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
  reservasExperiencias: any[] = []; 
  reservasChofer: any[] = []; // <-- NUEVA TABLA CHOFER
  cargando = true;
  tabActiva: 'traslados' | 'experiencias' | 'chofer' = 'traslados'; // <-- 3 PESTAÑAS

constructor(private cdr: ChangeDetectorRef, private router: Router) {}
  async ngOnInit() {
    setTimeout(() => {
      this.cargarDatos();
    }, 100);
  }

  cambiarTab(tab: 'traslados' | 'experiencias' | 'chofer') {
    this.tabActiva = tab;
  }

  // BOTÓN DE RECARGAR
  recargarDatos() {
    this.cargarDatos();
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

      // 3. Cargamos Chofer Privado
      const { data: dataChofer, error: err3 } = await supabase
        .from('reservas_chofer')
        .select('*')
        .order('created_at', { ascending: false });
      if (err3) console.error('Error Chofer:', err3.message);
      else this.reservasChofer = dataChofer || [];

    } catch (err) {
      console.error('ERROR DE CONEXIÓN:', err);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges(); 
    }
  }

  // BOTÓN DE EXPORTAR CSV
  exportarCSV() {
    let dataToExport: any[] = [];
    let fileName = '';

    // Decide qué datos exportar basado en la pestaña activa
    if (this.tabActiva === 'traslados') {
      dataToExport = this.reservasTraslados;
      fileName = 'Vancity_Traslados.csv';
    } else if (this.tabActiva === 'experiencias') {
      dataToExport = this.reservasExperiencias;
      fileName = 'Vancity_Experiencias.csv';
    } else if (this.tabActiva === 'chofer') {
      dataToExport = this.reservasChofer;
      fileName = 'Vancity_Chofer_Privado.csv';
    }

    if (dataToExport.length === 0) {
      alert('No hay datos para exportar en esta pestaña.');
      return;
    }

    // Extrae los nombres de las columnas
    const headers = Object.keys(dataToExport[0]).join(',');

    // Formatea las filas asegurándose de que las comas y los saltos de línea no rompan Excel
    const rows = dataToExport.map(obj => 
      Object.values(obj).map(val => {
        let str = val !== null && val !== undefined ? String(val) : '';
        str = str.replace(/"/g, '""'); // Escapa comillas dobles
        return `"${str}"`; // Envuelve en comillas
      }).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');

    // Crea el archivo y fuerza la descarga en el navegador
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async cerrarSesion() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      this.router.navigate(['/login']); 
    } else {
      console.error('Error al cerrar sesión:', error);
    }
  }
}