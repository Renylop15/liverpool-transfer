import { Component } from '@angular/core';
// 1. IMPORTAMOS LA HERRAMIENTA DE RUTAS
import { RouterOutlet } from '@angular/router'; 
import { WhatsappWidgetComponent } from './whatsapp-widget/whatsapp-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. REEMPLAZAMOS ReservaComponent POR RouterOutlet
  imports: [RouterOutlet,WhatsappWidgetComponent], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Vancity Transfer';
}