import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Usaremos ngModel simple
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://chyuacdnyaduqnawsoii.supabase.co', 'sb_publishable_j34PDqBJtmzklQqnP6kL4A_AxNnerKR'); // Pon tus llaves reales

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #050505; color: white;">
      <div style="background: #111; padding: 40px; border-radius: 10px; width: 300px; text-align: center;">
        <h2>Acceso Vancity</h2>
        <input type="email" [(ngModel)]="email" placeholder="Correo" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 5px; border: none;">
        <input type="password" [(ngModel)]="password" placeholder="Contraseña" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 5px; border: none;">
        <button (click)="iniciarSesion()" style="width: 100%; padding: 10px; background: #2e7d32; color: white; border: none; border-radius: 5px; cursor: pointer;">Entrar</button>
        <p *ngIf="error" style="color: red; font-size: 12px; margin-top: 10px;">{{ error }}</p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  async iniciarSesion() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password,
    });

    if (error) {
      this.error = 'Correo o contraseña incorrectos';
    } else {
      this.router.navigate(['/admin']); // Si es correcto, lo mandamos al admin
    }
  }
}