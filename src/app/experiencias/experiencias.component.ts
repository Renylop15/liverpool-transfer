import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ItineraryDetailed {
  title: string;
  images: string[];
  priceText: string;
  description: string;
  locationText: string;
  extraDetails: { icon: string; text: string }[];
  priceNumeric: number;
}

interface Package {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  priceBase: number;
  images: string[];
  currentImageIndex: number;
  includes: string[];
  notIncludes: string[];
  recommendationsDetailed: ItineraryDetailed[];
}

@Component({
  selector: 'app-experiencias',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './experiencias.component.html',
  styleUrl: './experiencias.component.css'
})
export class ExperienciasComponent implements OnInit, OnDestroy { 
  selectedItinerary: ItineraryDetailed | null = null;
  private autoPlayInterval: any; 
  
  packages: Package[] = [
    {
      id: 1,
      title: 'Half Day Service',
      subtitle: 'Executive Private Disposal',
      duration: 'Up to 6 Hours',
      priceBase: 3500,
      images: [
        '/assets/angel4.jpg', 
        '/assets/images/tours/centro-1.jpg',
        '/assets/images/tours/centro-2.jpg',
        '/assets/images/tours/centro-3.jpg',
        '/assets/images/tours/centro-4.jpg'
      ],
      currentImageIndex: 0,
      includes: ['Professional Chauffeur', 'Premium Sedan Unit', 'Fuel & Insurance', 'Bottled Water', 'On-site Wait Time', 'Parking Fees', 'Toll Fees'],
      notIncludes: ['Entry Fees to Attractions', 'Meals and Beverages', 'Tour Guides', 'Gratuities'],
      recommendationsDetailed: [
        {
          title: 'Historic Downtown',
          images: [
            '/assets/images/tours/centro-1.jpg',
            '/assets/images/tours/centro-2.jpg',
            '/assets/images/tours/centro-3.jpg',
            '/assets/images/tours/centro-4.jpg',
            '/assets/images/tours/centro-5.jpg'
          ],
          priceText: 'From $1,800 MXN per unit',
          priceNumeric: 1800,
          description: 'Explore the heart of Mexico City, visiting the Zócalo, the Metropolitan Cathedral, and the Palace of Fine Arts.',
          locationText: 'Mexico City, Mexico',
          extraDetails: [
            { icon: '📍', text: 'Central Mexico City. Mexico City, Mexico' }
          ]
        },
        {
          title: 'Coyoacán District',
          images: [
            '/assets/images/tours/coyoacan-1.jpg',
            '/assets/images/tours/coyoacan-2.jpg',
            '/assets/images/tours/coyoacan-3.jpg',
            '/assets/images/tours/coyoacan-4.jpg',
            '/assets/images/tours/coyoacan-5.jpg'
          ],
          priceText: 'From $1,900 MXN per unit',
          priceNumeric: 1900,
          description: 'Stroll through the cobblestone streets of Coyoacán, visit the Frida Kahlo Museum, and enjoy the bohemian atmosphere.',
          locationText: 'Coyoacán, Mexico City',
          extraDetails: [
            { icon: '📍', text: 'Coyoacán Neighborhood. Mexico City' }
          ]
        },
        {
          title: 'Lucha Libre Experience',
          images: [
            '/assets/luchas.jpg',
            '/assets/images/tours/luchas-1.jpg',
            '/assets/images/tours/luchas-2.jpg',
            '/assets/images/tours/luchas-3.jpg',
            '/assets/images/tours/luchas-4.jpg'
          ],
          priceText: 'From $1,700 MXN per unit',
          priceNumeric: 1700,
          description: 'Immerse yourself in Mexican culture with a night of Lucha Libre, tacos, and beers at Arena Mexico.',
          locationText: 'Arena Mexico, Mexico City',
          extraDetails: [
            { icon: '📍', text: 'Doctores Neighborhood. Arena Mexico' }
          ]
        },
        {
          title: 'City Nightlife (Half Day)',
          images: [
            '/assets/images/tours/night-1.jpg',
            '/assets/images/tours/night-2.jpg',
            '/assets/images/tours/night-3.jpg',
            '/assets/images/tours/night-4.jpg',
            '/assets/images/tours/night-5.jpg'
          ],
          priceText: 'From $1,600 MXN per unit',
          priceNumeric: 1600,
          description: 'Enjoy the vibrant nightlife of Mexico City in the best terraces, bars, and restaurants.',
          locationText: 'Roma-Condesa, Mexico City',
          extraDetails: [
            { icon: '📍', text: 'Roma & Condesa. Mexico City' }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Full Day Service',
      subtitle: 'Premium Private Disposal',
      duration: 'Up to 12 Hours',
      priceBase: 6500,
      images: [
        '/assets/images/tours/teo-1.jpg', 
        '/assets/images/tours/teo-2.jpg',
        '/assets/images/tours/teo-3.jpg',
        '/assets/images/tours/teo-4.jpg',
        '/assets/images/tours/coyo-1.jpg'
      ],
      currentImageIndex: 0,
      includes: ['Professional Chauffeur', 'Premium Sedan Unit', 'Fuel & Insurance', 'Bottled Water', 'On-site Wait Time', 'Parking Fees', 'Toll Fees'],
      notIncludes: ['Entry Fees to Attractions', 'Meals and Beverages', 'Tour Guides', 'Gratuities'],
      recommendationsDetailed: [
        {
          title: 'Teotihuacán Pyramids',
          images: [
            '/assets/images/tours/teo-1.jpg',
            '/assets/images/tours/teo-2.jpg',
            '/assets/images/tours/teo-3.jpg',
            '/assets/images/tours/teo-4.jpg',
            '/assets/images/tours/teo-5.jpg'
          ],
          priceText: 'From $3,200 MXN per unit',
          priceNumeric: 3200,
          description: 'Visit the majestic archaeological site of Teotihuacán, including the Pyramids of the Sun and the Moon.',
          locationText: 'San Juan Teotihuacán, Mexico',
          extraDetails: [
            { icon: '📍', text: 'Archaeological Zone. Teotihuacán' }
          ]
        },
        {
          title: 'Xochimilco Canals',
          images: [
            '/assets/images/tours/coyo-7.jpg',
            '/assets/images/tours/coyo-1.jpg',
            '/assets/images/tours/coyo-2.jpg',
            '/assets/images/tours/coyo-4.jpg',
            '/assets/images/tours/coyo-5.jpg'
          ],
          priceText: 'From $2,800 MXN per unit',
          priceNumeric: 2800,
          description: 'Ride a trajinera through the colorful canals of Xochimilco and enjoy mariachis, food, and drinks.',
          locationText: 'Xochimilco, Mexico City',
          extraDetails: [
            { icon: '📍', text: 'Nuevo Nativitas Pier. Xochimilco' }
          ]
        },
        {
          title: 'Paso de Cortés',
          images: [
            '/assets/images/tours/paseo-5.jpg',
            '/assets/images/tours/paseo-2.webp',
            '/assets/images/tours/paseo-3.webp',
            '/assets/images/tours/paseo-4.webp',
            '/assets/images/tours/paseo-1.webp'
          ],
          priceText: 'From $3,500 MXN per unit',
          priceNumeric: 3500,
          description: 'Enjoy breathtaking views of the Popocatépetl and Iztaccíhuatl volcanoes from the legendary Paso de Cortés.',
          locationText: 'Izta-Popo National Park, Mexico',
          extraDetails: [
            { icon: '📍', text: 'Paso de Cortés. Between volcanoes' }
          ]
        },
        {
          title: 'City Nightlife (Full Day)',
          images: [
            '/assets/images/tours/night-1.jpg',
            '/assets/images/tours/night-2.jpg',
            '/assets/images/tours/night-3.jpg',
            '/assets/images/tours/night-4.jpg',
            '/assets/images/tours/night-5.jpg'
          ],
          priceText: 'From $1,600 MXN per unit',
          priceNumeric: 1600,
          description: 'Enjoy a complete nightlife experience in Mexico City with guaranteed private transportation.',
          locationText: 'Multiple areas, Mexico City',
          extraDetails: [
            { icon: '📍', text: 'Polanco, Roma, Condesa. Mexico City' }
          ]
        }
      ]
    }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.packages.forEach(pkg => {
        if (pkg.images && pkg.images.length > 1) {
          pkg.currentImageIndex = (pkg.currentImageIndex + 1) % pkg.images.length;
        }
      });
      this.cdr.detectChanges(); 
    }, 3000); 
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  nextImage(pkg: Package, event: Event) {
    event.stopPropagation();
    pkg.currentImageIndex = (pkg.currentImageIndex + 1) % pkg.images.length;
  }

  prevImage(pkg: Package, event: Event) {
    event.stopPropagation();
    pkg.currentImageIndex = (pkg.currentImageIndex - 1 + pkg.images.length) % pkg.images.length;
  }

  openItineraryDetail(itinerary: ItineraryDetailed, event: Event) {
    event.stopPropagation();
    this.selectedItinerary = itinerary;
  }

  closeItineraryDetail() {
    this.selectedItinerary = null;
  }
}