import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ItineraryDetailed {
  title: string;
  images: string[];
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
  price: string; 
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
      priceBase: 3950,
      price: '3,950.00',
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
          title: 'Historic Center: Bellas Artes, Cathedral, Zócalo, Palacio Nacional & Templo Mayor',
          images: [
            '/assets/images/tours/centro-1.jpg',
            '/assets/images/tours/centro-2.jpg',
            '/assets/images/tours/centro-3.jpg',
            '/assets/images/tours/centro-4.jpg',
            '/assets/images/tours/centro-5.jpg'
          ],
          priceNumeric: 3950,
          description: 'Explore the Historic Center’s core, where the Palacio de Bellas Artes’ marble elegance and the Metropolitan Cathedral’s colonial majesty frame the iconic Zócalo; here, you can admire the Palacio Nacional’s historic murals and uncover the Templo Mayor, the sacred heart of the Aztec empire.',
          locationText: 'Mexico City, Mexico',
          extraDetails: [
            { icon: '📍', text: 'Central Mexico City. Mexico City, Mexico' }
          ]
        },
        {
          title: 'Coyoacán: The Blue House & Anahuacalli Museum',
          images: [
            '/assets/images/tours/house-1.jpg',
            '/assets/images/tours/house-2.jpg',
            '/assets/images/tours/house-3.jpg',
            '/assets/images/tours/house-4.jpg',
            '/assets/images/tours/house-5.jpg'
          ],
          priceNumeric: 3950,
          description: ' Experience the dual heart of Mexican art. Step into The Blue House, the vibrant sanctuary where Frida Kahlo’s intimate universe comes to life, then discover the Anahuacalli, a breathtaking architectural "templo" designed by Diego Rivera to stage the indigenous cosmos. Enjoy a seamless two-for-one experience: Your admission to the Frida Kahlo Museum grants you access to the Anahuacalli Museum.',
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
          priceNumeric: 3950,
          description: 'Travel through time at this stunning hilltop palace. Explore 12 permanent halls tracing, Mexico’s history from the Conquest to the, Revolution, and wander through 22 majestic, rooms that recreate the imperial life of Maximilian and Carlota, the presidency of Porfirio Díaz, and the heroic defense of the castle. From its breathtaking terraces to its epic murals, this castle is a living masterpiece offering the best views of Mexico City.',
          locationText: 'Chapultepec, Mexico City',
          extraDetails: [
            { icon: '📍', text: 'Chapultepec, Mexico City' }
          ]
        },
        {
          title: 'Basilica of Guadalupe',
          images: [
            '/assets/images/tours/guap-4.jpg',
            '/assets/images/tours/guap-1.jpg',
            '/assets/images/tours/guap-5.jpg',
            '/assets/images/tours/guap-3.jpg',
            '/assets/images/tours/guap-1.jpg'
          ],
          priceNumeric: 3950,
          description: 'It is one of the most awe-inspiring cultural and historical epicenters in the Americas. In this complex, the bold modernity of the New Basilica, an engineering marvel designed so the Virgin’s mantle is visible from every possible angle, coexists in exquisite contrast with the Baroque heritage of the Templo Expiatorio. Take a moment to admire Juan Diego’s iconic Tilma, a symbol that transcends religion to define the very heart of Mexican identity. Afterward, wander through the Tepeyac gardens toward the Capilla del Cerrito; from there, you´ll be treated to a stunning panoramic view of the metropolis, the perfect spot to take it all in and truly grasp the sheer scale of this city.',
          locationText: 'Gustavo a Madero, Mexico City',
          extraDetails: [
            { icon: '📍', text: 'Gustavo a Madero, Mexico City' }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Full Day Service',
      subtitle: 'Premium Private Disposal',
      duration: 'Up to 12 Hours',
      priceBase: 4950,
      price: '4,950.00',
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
          title: 'Xochimilco: Cuemanco Wharf',
          images: [
            '/assets/images/tours/coyo-7.jpg',
            '/assets/images/tours/coyo-1.jpg',
            '/assets/images/tours/coyo-2.jpg',
            '/assets/images/tours/coyo-4.jpg',
            '/assets/images/tours/coyo-5.jpg'
          ],
          priceNumeric: 4950,
          description: 'Discover the sanctuary where ancient chinampas and 54 hectares of restored canals showcase the seamless fusion of Aztec engineering and modern conservation.',
          locationText: 'Xochimilco, Mexico City',
          extraDetails: [
            { icon: '📍', text: 'Nuevo Nativitas Pier. Xochimilco' }
          ]
        },
        {
          title: 'Luis Barragan’s House & Studio',
          images: [
            '/assets/images/tours/casa-3.jpg',
            '/assets/images/tours/casa-2.jpg',
            '/assets/images/tours/casa-4.jpg',
            '/assets/images/tours/casa-5.jpg',
            '/assets/images/tours/casa-1.jpg'
          ],
          priceNumeric: 4950,
          description: 'Step into the only individual residence in Latin America honored as a UNESCO World Heritage site. Built in 1948, this house and studio represent a breathtaking synthesis of modern movement and traditional Mexican elements. Preserved exactly as it was until Barragan’s death in 1988, it is a global pilgrimage site for architects and art lovers, offering a meditative journey through light, color, and masterful design.',
          locationText: 'Miguel Hidalgo, Mexico City',
          extraDetails: [
            { icon: '📍', text: 'Miguel Hidalgo, Mexico City' }
          ]
        },
  
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