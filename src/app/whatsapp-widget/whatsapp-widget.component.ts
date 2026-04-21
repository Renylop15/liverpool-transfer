import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-whatsapp-widget',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './whatsapp-widget.component.html',
  styleUrl: './whatsapp-widget.component.css'
})
export class WhatsappWidgetComponent {
  isOpen = false;
  waForm: FormGroup;

  // 🚨 IMPORTANTE: Cambia este número por el WhatsApp real de tu asesora. 
  // Debe incluir el código de país (52 para México) SIN el signo "+" ni espacios.
  numeroAsesora = '524422336191'; 

  constructor(private fb: FormBuilder) {
    this.waForm = this.fb.group({
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      mensaje: [''] // Opcional
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  iniciarChat() {
    if (this.waForm.invalid) {
      alert('Por favor, completa tu nombre, teléfono y correo para continuar.');
      return;
    }

    const val = this.waForm.value;
    
    // Armamos el mensaje predeterminado con saltos de línea (%0A)
    const texto = `Hola Vancity, necesito asesoría.%0A%0A*Mis datos:*%0A👤 Nombre: ${val.nombre}%0A📱 Tel: ${val.telefono}%0A📧 Correo: ${val.correo}%0A%0A*Duda/Mensaje:* ${val.mensaje}`;
    
    // Creamos el link de la API de WhatsApp
    const url = `https://api.whatsapp.com/send?phone=${this.numeroAsesora}&text=${texto}`;
    
    // Abrimos WhatsApp en una pestaña nueva
    window.open(url, '_blank');
    
    // Cerramos la ventanita y limpiamos el formulario
    this.isOpen = false;
    this.waForm.reset();
  }
}