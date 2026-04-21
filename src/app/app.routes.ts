import { Routes } from '@angular/router';
import { ReservaComponent } from './reserva/reserva.component';
import { AdminComponent } from './admin/admin.component';
import { LandingComponent } from './landing/landing.component'; 
import { ExperienciasComponent } from './experiencias/experiencias.component'; // <--- 1. IMPORTAMOS LAS EXPERIENCIAS
import { ReservaExperienciaComponent } from './reserva-experiencia/reserva-experiencia.component';
import { authGuard } from './auth-guard'; // <-- IMPORTA TU GUARDIÁN
import { LoginComponent } from './login/login.component'; // <-- IMPORTA EL COMPONENTE DE LOGIN

export const routes: Routes = [
  { path: '', component: LandingComponent }, 
  { path: 'reserva', component: ReservaComponent }, 
  { path: 'experiencias', component: ExperienciasComponent }, // <--- 2. AGREGAMOS LA NUEVA RUTA AQUÍ
  { path: 'reserva-experiencia', component: ReservaExperienciaComponent },
  { path: 'login', component: LoginComponent },
{ 
    path: 'admin', 
    component: AdminComponent, 
    canActivate: [authGuard] // <-- EL CADENERO EN ACCIÓN
  },  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];