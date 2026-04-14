import { Component } from '@angular/core';
// 1. IMPORTAMOS LA HERRAMIENTA DE RUTAS
import { RouterOutlet } from '@angular/router'; 

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. REEMPLAZAMOS ReservaComponent POR RouterOutlet
  imports: [RouterOutlet], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Vancity Transfer';
}