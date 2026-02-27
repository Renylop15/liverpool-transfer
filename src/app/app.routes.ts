import { Routes } from '@angular/router';
import { ReservaComponent } from './reserva/reserva.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
  { path: '', component: ReservaComponent }, // La página principal (el formulario)
  { path: 'admin', component: AdminComponent }, // Tu panel secreto
  { path: '**', redirectTo: '' } // Si alguien escribe una ruta rara, lo regresa al inicio
];