import { 
  ChangeDetectionStrategy, 
  Component, 
  ElementRef, 
  ViewChild, 
  AfterViewInit,
  INJECTOR,
  Injector,
  inject,
  runInInjectionContext
} from '@angular/core';
import { CommonModule } from '@angular/common';

// --- LEAFLET DECLARATION ---
declare var L: any;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html', // <-- Changed
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit {
  @ViewChild('map') mapContainer!: ElementRef;
  private map: any;
  private injector = inject(INJECTOR);

  ngAfterViewInit(): void {
    // We must run Leaflet initialization code in the injection context
    // or after a small delay to ensure the view is ready and Leaflet is loaded.
    // A timeout is a simple way to ensure the global 'L' is available.
    setTimeout(() => {
      runInInjectionContext(this.injector, () => {
        if (typeof L === 'undefined') {
          console.error('Leaflet script not loaded!');
          this.mapContainer.nativeElement.innerHTML = 
            '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative h-full flex items-center justify-center">Map failed to load. Please check console.</div>';
          return;
        }
        this.initMap();
      });
    }, 100); // Wait 100ms for Leaflet script to load
  }

  private initMap(): void {
    if (this.map) return; // Prevent re-initialization

    // Coordinates for Patras, Greece
    const patrasCoords: [number, number] = [38.246639, 21.734573];

    this.map = L.map(this.mapContainer.nativeElement, {
      center: patrasCoords,
      zoom: 13
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // --- Custom Icons ---
    
    // Custom Dog Icon
    const dogIcon = L.divIcon({
      html: `<svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 680 680">
          <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
          <path stroke-linecap="round" stroke-linejoin="round" d="M298.5 156.9C312.8 199.8 298.2 243.1 265.9 253.7C233.6 264.3 195.8 238.1 181.5 195.2C167.2 152.3 181.8 109 214.1 98.4C246.4 87.8 284.2 114 298.5 156.9zM164.4 262.6C183.3 295 178.7 332.7 154.2 346.7C129.7 360.7 94.5 345.8 75.7 313.4C56.9 281 61.4 243.3 85.9 229.3C110.4 215.3 145.6 230.2 164.4 262.6zM133.2 465.2C185.6 323.9 278.7 288 320 288C361.3 288 454.4 323.9 506.8 465.2C510.4 474.9 512 485.3 512 495.7L512 497.3C512 523.1 491.1 544 465.3 544C453.8 544 442.4 542.6 431.3 539.8L343.3 517.8C328 514 312 514 296.7 517.8L208.7 539.8C197.6 542.6 186.2 544 174.7 544C148.9 544 128 523.1 128 497.3L128 495.7C128 485.3 129.6 474.9 133.2 465.2zM485.8 346.7C461.3 332.7 456.7 295 475.6 262.6C494.5 230.2 529.6 215.3 554.1 229.3C578.6 243.3 583.2 281 564.3 313.4C545.4 345.8 510.3 360.7 485.8 346.7zM374.1 253.7C341.8 243.1 327.2 199.8 341.5 156.9C355.8 114 393.6 87.8 425.9 98.4C458.2 109 472.8 152.3 458.5 195.2C444.2 238.1 406.4 264.3 374.1 253.7z"/>
        </svg>`,
      className: 'bg-blue-600 rounded-full p-1 shadow-lg backdrop-blur-sm',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // Custom Herd Icon (more dangerous)
    const herdIcon = L.divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M320 496C342.1 496 360 513.9 360 536C360 558.1 342.1 576 320 576C297.9 576 280 558.1 280 536C280 513.9 297.9 496 320 496zM320 64C346.5 64 368 85.5 368 112C368 112.6 368 113.1 368 113.7L352 417.7C351.1 434.7 337 448 320 448C303 448 289 434.7 288 417.7L272 113.7C272 113.1 272 112.6 272 112C272 85.5 293.5 64 320 64z"/></svg>`,
      className: 'bg-red-500 rounded-full p-1 shadow-lg backdrop-blur-sm',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // --- Add Markers (Mock Data) ---
    L.marker([38.248, 21.735], { icon: dogIcon }).addTo(this.map)
      .bindPopup("<b>Stray Dog (ID: D-101)</b><br>Friendly, often near square.");
      
    L.marker([38.245, 21.730], { icon: dogIcon }).addTo(this.map)
      .bindPopup("<b>Stray Dog (ID: D-102)</b><br>Timid.");

    L.marker([38.240, 21.740], { icon: herdIcon }).addTo(this.map)
      .bindPopup("<b>Dog Herd (ID: H-005)</b><br>3-5 animals. Caution advised.");

    // --- Add Geofences (Mock Data) ---
    
    // 1. School (Circular Geofence)
    L.circle([38.22999333923935, 21.745626563435092], {
      color: 'red',
      fillColor: 'rgba(255, 0, 0, 0.9)',
      radius: 140 // in meters
    }).addTo(this.map).bindPopup("<b>School Zone Geofence</b><br>Animals entering this zone trigger an alert.");

    L.circle([38.23704387727558, 21.746358593723023], {
      color: 'red',
      fillColor: 'rgba(255, 0, 0, 0.9)',
      radius: 100 // in meters
    }).addTo(this.map).bindPopup("<b>School Zone Geofence</b><br>Animals entering this zone trigger an alert.");

    L.circle([38.234894950769316, 21.74590798262347], {
      color: 'red',
      fillColor: 'rgba(255, 0, 0, 0.9)',
      radius: 100 // in meters
    }).addTo(this.map).bindPopup("<b>School Zone Geofence</b><br>Animals entering this zone trigger an alert.");

    // 2. University Campus (Polygon Geofence)
    const campusBounds: [[number, number], [number, number], [number, number], [number, number]] = [[38.28679554472231, 21.77946904060198], [38.280799, 21.787666], [38.285111, 21.794489], [38.292993, 21.789683]];
    L.polygon(campusBounds, {
      color: 'green',
      fillColor: '#0f0',
      fillOpacity: 0.2,
      weight: 1
    }).addTo(this.map).bindPopup("<b>University of Patras Campus Geofence</b>");

    // 3. High-Speed Road (Polyline Geofence)
    const roadCoords: [number, number][] = [
      [38.222579, 21.753936],
      [38.231602, 21.737946],
      [38.231792, 21.738207],
      [38.222735, 21.754053]
    ];
    L.polyline(roadCoords, {
      color: 'red',
      weight: 6,
      opacity: 0.6
    }).addTo(this.map).bindPopup("<b>High-Speed Road Geofence</b>");
  }
}