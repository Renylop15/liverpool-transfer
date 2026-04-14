import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Package {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  images: string[];
  currentImageIndex: number;
  recommendations: string[];
  includes: string[];
  notIncludes: string[];
}

@Component({
  selector: 'app-experiencias',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './experiencias.component.html',
  styleUrl: './experiencias.component.css'
})
export class ExperienciasComponent {
  selectedPackage: Package | null = null; // Para el modal

  packages: Package[] = [
    {
      id: 1,
      title: 'Half Day Service',
      subtitle: 'Executive Private Disposal',
      duration: 'Up to 6 Hours',
      images: ['/assets/angel4.jpg', 
        '/assets/images/tours/centro-1.jpg',
        '/assets/images/tours/centro-2.jpg',
        '/assets/images/tours/centro-3.jpg',
        '/assets/images/tours/centro-4.jpg',
        '/assets/images/tours/centro-5.jpg',
        '/assets/images/tours/centro-6.jpg'
        ],
      currentImageIndex: 0,
      recommendations: ['Historic Downtown', 'Coyoacán District', 'Lucha Libre Experience', 'City Nightlife'],
      includes: ['Professional Chauffeur', 'Premium Sedan Unit', 'Fuel & Insurance', 'Bottled Water', 'On-site Wait Time'],
      notIncludes: ['Entry Fees to Attractions', 'Meals and Beverages', 'Tour Guides', 'Gratuities']
    },
    {
      id: 2,
      title: 'Full Day Service',
      subtitle: 'Premium Private Disposal',
      duration: 'Up to 12 Hours',
      images: ['/assets/images/tours/teo-1.jpg', 
        '/assets/images/tours/teo-1.jpg',
        '/assets/images/tours/teo-2.jpg',
        '/assets/images/tours/teo-3.jpg',
        '/assets/images/tours/teo-4.jpg',
        '/assets/images/tours/teo-5.jpg',
        '/assets/images/tours/coyo-1.jpg',
        '/assets/images/tours/coyo-2.jpg',
        '/assets/images/tours/coyo-4.jpg',
        '/assets/images/tours/coyo-5.jpg',
        '/assets/images/tours/coyo-6.jpg',
        '/assets/images/tours/coyo-7.jpg',
        '/assets/luchas.jpg',
        '/assets/images/tours/paseo-1.webp',
        '/assets/images/tours/paseo-2.webp',
        '/assets/images/tours/paseo-3.webp',
        '/assets/images/tours/paseo-4.webp'],
      currentImageIndex: 0,
      recommendations: ['Teotihuacán Pyramids', 'Xochimilco Canals', 'Paso de Cortés (with Voortus)', 'City Nightlife'],
      includes: ['Professional Chauffeur', 'Premium Sedan Unit', 'Fuel & Insurance', 'Bottled Water', 'On-site Wait Time'],
      notIncludes: ['Entry Fees to Attractions', 'Meals and Beverages', 'Tour Guides', 'Gratuities']
    }
  ];

  openInfo(pkg: Package) { this.selectedPackage = pkg; }
  closeInfo() { this.selectedPackage = null; }

  nextImage(pkg: Package, event: Event) {
    event.stopPropagation();
    pkg.currentImageIndex = (pkg.currentImageIndex + 1) % pkg.images.length;
  }

  prevImage(pkg: Package, event: Event) {
    event.stopPropagation();
    pkg.currentImageIndex = (pkg.currentImageIndex - 1 + pkg.images.length) % pkg.images.length;
  }
}