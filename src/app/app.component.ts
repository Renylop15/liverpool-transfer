import { Component } from '@angular/core';
import { ReservaComponent } from './reserva/reserva.component'; // <--- Importante 1

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReservaComponent], // <--- Importante 2: Agrégalo aquí
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend-app';
}