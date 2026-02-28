import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <--- IMPORTANTE

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule], // <--- AGREGAR AQUÍ
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent { }