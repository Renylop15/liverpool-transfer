import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ItineraryDetailed {
  title: string;
  images: string[];
  description: string;
  locationText: string;
  extraDetails: { icon: string; text: string }[];
}

interface Package {
  id: number;
  title: string;
  subtitle: string;
  priceLabel: string;
  price: string; 
  images: string[];
  currentImageIndex: number;
  includes: string[];
  notIncludes: string[];
  recommendationsDetailed: ItineraryDetailed[];
  type: 'shared' | 'private'; // Added to distinguish routing later
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

  // Consolidated list of all available tours
  allTours: ItineraryDetailed[] = [
    {
      title: 'Historic Downtown',
      images: [
        '/assets/images/tours/centro-1.jpg',
        '/assets/images/tours/centro-2.jpg',
        '/assets/images/tours/centro-3.jpg',
        '/assets/images/tours/centro-4.jpg',
        '/assets/images/tours/centro-5.jpg'
      ],
      description: 'Explore the Historic Center’s core, where the Palacio de Bellas Artes’ marble elegance and the Metropolitan Cathedral’s colonial majesty frame the iconic Zócalo; here, you can admire the Palacio Nacional’s historic murals and uncover the Templo Mayor, the sacred heart of the Aztec empire.',
      locationText: 'Mexico City, Mexico',
      extraDetails: [
        { icon: '📍', text: 'Central Mexico City. Mexico City, Mexico' }
      ]
    },
    {
      title: 'Frida Khalo Museum & Anahuacalli',
      images: [
        '/assets/images/tours/house-1.jpg',
        '/assets/images/tours/house-2.jpg',
        '/assets/images/tours/house-3.jpg',
        '/assets/images/tours/house-4.jpg',
        '/assets/images/tours/house-5.jpg'
      ],
      description: 'Experience the dual heart of Mexican art. Step into The Blue House, the vibrant sanctuary where Frida Kahlo’s intimate universe comes to life, then discover the Anahuacalli, a breathtaking architectural "templo" designed by Diego Rivera to stage the indigenous cosmos. Enjoy a seamless two-for-one experience: Your admission to the Frida Kahlo Museum grants you access to the Anahuacalli Museum.',
      locationText: 'Coyoacán, Mexico City',
      extraDetails: [
        { icon: '📍', text: 'Coyoacán Neighborhood. Mexico City' }
      ]
    },
    {
      title: 'Chapultepec Castle',
      images: [
        '/assets/castle-2.jpg',
        '/assets/castle-1.jpg',
        '/assets/castle-3.jpg',
        '/assets/castle-4.jpg',
        '/assets/castle-5.jpg'
      ],
      description: 'Travel through time at this stunning hilltop palace. Explore 12 permanent halls tracing Mexico’s history from the Conquest to the Revolution, and wander through 22 majestic rooms that recreate the imperial life of Maximilian and Carlota, the presidency of Porfirio Díaz, and the heroic defense of the castle. From its breathtaking terraces to its epic murals, this castle is a living masterpiece offering the best views of Mexico City.',
      locationText: 'Chapultepec, Mexico City',
      extraDetails: [
        { icon: '📍', text: 'Chapultepec, Mexico City' }
      ]
    },
    {
      title: 'Basílica of Guadalupe',
      images: [
        '/assets/images/tours/guap-4.jpg',
        '/assets/images/tours/guap-1.jpg',
        '/assets/images/tours/guap-5.jpg',
        '/assets/images/tours/guap-3.jpg',
        '/assets/images/tours/guap-1.jpg'
      ],
      description: 'It is one of the most awe-inspiring cultural and historical epicenters in the Americas. In this complex, the bold modernity of the New Basilica, an engineering marvel designed so the Virgin’s mantle is visible from every possible angle, coexists in exquisite contrast with the Baroque heritage of the Templo Expiatorio. Take a moment to admire Juan Diego’s iconic Tilma, a symbol that transcends religion to define the very heart of Mexican identity. Afterward, wander through the Tepeyac gardens toward the Capilla del Cerrito; from there, you´ll be treated to a stunning panoramic view of the metropolis, the perfect spot to take it all in and truly grasp the sheer scale of this city.',
      locationText: 'Gustavo a Madero, Mexico City',
      extraDetails: [
        { icon: '📍', text: 'Gustavo a Madero, Mexico City' }
      ]
    },
    {
      title: 'Xochimilco',
      images: [
        '/assets/images/tours/coyo-7.jpg',
        '/assets/images/tours/coyo-1.jpg',
        '/assets/images/tours/coyo-2.jpg',
        '/assets/images/tours/coyo-4.jpg',
        '/assets/images/tours/coyo-5.jpg'
      ],
      description: 'Discover the sanctuary where ancient chinampas and 54 hectares of restored canals showcase the seamless fusion of Aztec engineering and modern conservation.',
      locationText: 'Xochimilco, Mexico City',
      extraDetails: [
        { icon: '📍', text: 'Nuevo Nativitas Pier. Xochimilco' }
      ]
    },
    {
      title: 'Luis Barragan House',
      images: [
        '/assets/images/tours/casa-3.jpg',
        '/assets/images/tours/casa-2.jpg',
        '/assets/images/tours/casa-4.jpg',
        '/assets/images/tours/casa-5.jpg',
        '/assets/images/tours/casa-1.jpg'
      ],
      description: 'Step into the only individual residence in Latin America honored as a UNESCO World Heritage site. Built in 1948, this house and studio represent a breathtaking synthesis of modern movement and traditional Mexican elements. Preserved exactly as it was until Barragan’s death in 1988, it is a global pilgrimage site for architects and art lovers, offering a meditative journey through light, color, and masterful design.',
      locationText: 'Miguel Hidalgo, Mexico City',
      extraDetails: [
        { icon: '📍', text: 'Miguel Hidalgo, Mexico City' }
      ]
    }
  ];
  
  packages: Package[] = [
    {
      id: 1,
      title: 'Shared Ride',
      subtitle: 'Experience the city together',
      priceLabel: 'from $',
      price: '2,798.00',
      type: 'shared',
      images: [
        '/assets/images/tours/centro-1.jpg',
        '/assets/images/tours/coyoacan-1.jpg',
        '/assets/castle-4.jpg',
        '/assets/castle-5.jpg'

      ],
      currentImageIndex: 0,
      includes: ['Comfortable Shared Transport', 'Professional Chauffeur', 'Entry Ticket Included', 'Fixed Itinerary & Schedule','Pick-up at Hyatt Regency Polanco', 'Parking & Toll Fees'],
      notIncludes: ['Meals and Beverages', 'Tour Guides', 'Gratuities'],
      recommendationsDetailed: this.allTours
    },
    {
      id: 2,
      title: 'Private Ride',
      subtitle: 'Premium Private Disposal',
      priceLabel: 'from $',
      price: '5,950.00',
      type: 'private',
      images: [
        '/assets/angel4.jpg', 
        '/assets/cdmx.jpg', 
        '/assets/images/tours/guap-4.jpg',
        '/assets/images/tours/coyo-4.jpg',
        '/assets/images/tours/coyo-7.jpg'
      ],
      currentImageIndex: 0,
      includes: ['Professional Chauffeur', 'Premium Sedan or SUV Unit', 'Flexible Schedule', 'Pick-up at Hyatt Regency Polanco', 'Bottled Water', 'Parking & Toll Fees','Entry Tickets to Attractions'],
      notIncludes: [ 'Meals and Beverages', 'Tour Guides', 'Gratuities'],
      recommendationsDetailed: this.allTours
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

  // We now pass the package type to know if they clicked from Shared or Private
  openItineraryDetail(itinerary: ItineraryDetailed, pkgType: 'shared' | 'private', event: Event) {
    event.stopPropagation();
    this.selectedItinerary = { ...itinerary, _pkgType: pkgType } as any; 
  }

  closeItineraryDetail() {
    this.selectedItinerary = null;
  }
}