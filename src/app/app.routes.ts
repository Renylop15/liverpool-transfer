import { Routes } from '@angular/router';
import { ReservaComponent } from './reserva/reserva.component';
import { AdminComponent } from './admin/admin.component';
import { LandingComponent } from './landing/landing.component'; // <--- IMPORTAMOS LA LANDING

export const routes: Routes = [
  { path: '', component: LandingComponent }, // <--- LA LANDING AHORA ES LA PÁGINA PRINCIPAL
  { path: 'reserva', component: ReservaComponent }, // <--- EL FORMULARIO SE MUEVE AQUÍ
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];