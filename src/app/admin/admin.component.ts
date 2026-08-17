import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createClient } from '@supabase/supabase-js';
import { Router } from '@angular/router'; 

const supabaseUrl = 'https://chyuacdnyaduqnawsoii.supabase.co'; 
const supabaseKey = 'sb_publishable_j34PDqBJtmzklQqnP6kL4A_AxNnerKR';
const supabase = createClient(supabaseUrl, supabaseKey);

// Actualizamos el tipo para incluir 'vaiven'
type TabType = 'traslados' | 'experiencias' | 'chofer' | 'boda' | 'vaiven';

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
  reservasChofer: any[] = []; 
  reservasBoda: any[] = []; 
  reservasVaiven: any[] = []; // <-- NUEVA TABLA VAIVÉN
  
  cargando = true;
  tabActiva: TabType = 'traslados'; 

constructor(private cdr: ChangeDetectorRef, private router: Router) {}
  async ngOnInit() {
    setTimeout(() => {
      this.cargarDatos();
    }, 100);
  }

  cambiarTab(tab: TabType) {
    this.tabActiva = tab;
  }

  recargarDatos() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.cargando = true;
    try {
      // 1. Cargamos Traslados
      const { data: dataTraslados, error: err1 } = await supabase.from('reservas').select('*').order('created_at', { ascending: false });
      if (err1) console.error('Error Traslados:', err1.message);
      else this.reservasTraslados = dataTraslados || [];

      // 2. Cargamos Experiencias
      const { data: dataExp, error: err2 } = await supabase.from('reservas_experiencias').select('*').order('created_at', { ascending: false });
      if (err2) console.error('Error Experiencias:', err2.message);
      else this.reservasExperiencias = dataExp || [];

      // 3. Cargamos Chofer Privado
      const { data: dataChofer, error: err3 } = await supabase.from('reservas_chofer').select('*').order('created_at', { ascending: false });
      if (err3) console.error('Error Chofer:', err3.message);
      else this.reservasChofer = dataChofer || [];

      // 4. Cargamos Reservas Boda
      const { data: dataBoda, error: err4 } = await supabase.from('reserva_boda').select('*').order('created_at', { ascending: false });
      if (err4) {
        console.error('Error Boda:', err4.message);
      } else {
        this.reservasBoda = (dataBoda || []).map(boda => {
          let asientos = 'N/A';
          let listaPasajeros: any[] = [];
          if (boda.itinerario_notas) {
            const matchAsientos = boda.itinerario_notas.match(/Asientos:\s*([^|]+)/);
            if (matchAsientos) asientos = matchAsientos[1].trim();
            const matchJSON = boda.itinerario_notas.match(/Pax Details:\s*(\[.*\])/);
            if (matchJSON) {
              try { listaPasajeros = JSON.parse(matchJSON[1]); } catch(e) {}
            }
          }
          return { ...boda, asientosParsed: asientos, pasajerosParsed: listaPasajeros };
        });
      }

      // 5. Cargamos Reservas Vaivén (NUEVO)
      const { data: dataVaiven, error: err5 } = await supabase.from('reservas_vaiven').select('*').order('created_at', { ascending: false });
      if (err5) {
        console.error('Error Vaivén:', err5.message);
      } else {
        this.reservasVaiven = (dataVaiven || []).map(vaiven => {
          let asientos = 'N/A';
          let listaPasajeros: any[] = [];
          if (vaiven.itinerario_notas) {
            // Mismo parseo que la boda, la lógica del texto es igual
            const matchAsientos = vaiven.itinerario_notas.match(/Asientos:\s*([^|]+)/);
            if (matchAsientos) asientos = matchAsientos[1].trim();
            const matchJSON = vaiven.itinerario_notas.match(/Pax Details:\s*(\[.*\])/);
            if (matchJSON) {
              try { listaPasajeros = JSON.parse(matchJSON[1]); } catch(e) {}
            }
          }
          return { ...vaiven, asientosParsed: asientos, pasajerosParsed: listaPasajeros };
        });
      }

    } catch (err) {
      console.error('ERROR DE CONEXIÓN:', err);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges(); 
    }
  }

  exportarCSV() {
    let dataToExport: any[] = [];
    let fileName = '';

    if (this.tabActiva === 'traslados') {
      dataToExport = this.reservasTraslados;
      fileName = 'Vancity_Traslados.csv';
    } else if (this.tabActiva === 'experiencias') {
      dataToExport = this.reservasExperiencias;
      fileName = 'Vancity_Experiencias.csv';
    } else if (this.tabActiva === 'chofer') {
      dataToExport = this.reservasChofer;
      fileName = 'Vancity_Chofer_Privado.csv';
    } else if (this.tabActiva === 'boda') {
      dataToExport = this.reservasBoda.map(b => {
        const nombresAcompanantes = b.pasajerosParsed.map((p: any) => `${p.nombre} ${p.apellido} (${p.correo})`).join(' | ');
        return {
          Registro: b.created_at,
          Titular: `${b.nombre} ${b.apellido}`,
          Email: b.correo_cliente,
          Telefono: b.telefono,
          Boletos_Comprados: b.pasajeros,
          Horario: b.fecha_servicio,
          Vehiculo: b.vehiculo,
          Asientos_Asignados: b.asientosParsed,
          Lista_Pasajeros: nombresAcompanantes,
          Tarifa: b.cotizacion,
          Estatus: b.estatus
        };
      });
      fileName = 'Vancity_Boda_Shuttle.csv';
    } else if (this.tabActiva === 'vaiven') {
      // Exportación específica para Vaivén
      dataToExport = this.reservasVaiven.map(v => {
        const nombresAcompanantes = v.pasajerosParsed.map((p: any) => `${p.nombre} ${p.apellido} (${p.correo})`).join(' | ');
        return {
          Registro: v.created_at,
          Titular: `${v.nombre} ${v.apellido}`,
          Email: v.correo_cliente,
          Telefono: v.telefono,
          Boletos_Comprados: v.pasajeros,
          Punto_Encuentro: v.punto_encuentro,
          Unidad_Asignada: `Unidad ${v.unidad_asignada}`,
          Asientos_Asignados: v.asientosParsed,
          Lista_Pasajeros: nombresAcompanantes,
          Tarifa: v.cotizacion,
          Estatus: v.estatus
        };
      });
      fileName = 'Vancity_Vaiven_Shuttle.csv';
    }

    if (dataToExport.length === 0) {
      alert('No hay datos para exportar en esta pestaña.');
      return;
    }

    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(obj => 
      Object.values(obj).map(val => {
        let str = val !== null && val !== undefined ? String(val) : '';
        str = str.replace(/"/g, '""'); 
        return `"${str}"`; 
      }).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
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