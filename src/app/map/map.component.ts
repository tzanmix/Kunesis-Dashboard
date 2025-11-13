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
      html: `<svg class="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" /><path fill-rule="evenodd" d="M.966 8.366A8.25 8.25 0 019.333.966v.002A8.25 8.25 0 0117.698 8.35v.002a8.25 8.25 0 01-8.35 8.366v.002A8.25 8.25 0 01.966 8.366zm1.534-.44a6.75 6.75 0 0112.44 0v.002a6.75 6.75 0 01-12.44 0v-.002z" clip-rule="evenodd" /></svg>`,
      className: 'bg-white/70 rounded-full p-1 shadow-lg backdrop-blur-sm',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // Custom Herd Icon (more dangerous)
    const herdIcon = L.divIcon({
      html: `<svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5zM10 12a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" /></svg>`,
      className: 'bg-white/70 rounded-full p-1 shadow-lg backdrop-blur-sm',
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
    L.circle([38.250, 21.730], {
      color: 'blue',
      fillColor: '#30f',
      fillOpacity: 0.2,
      radius: 200 // in meters
    }).addTo(this.map).bindPopup("<b>School Zone Geofence</b><br>Animals entering this zone trigger an alert.");

    // 2. University Campus (Rectangular Geofence)
    const campusBounds: [[number, number], [number, number]] = [[38.235, 21.738], [38.238, 21.742]];
    L.rectangle(campusBounds, {
      color: 'green',
      fillColor: '#0f0',
      fillOpacity: 0.2,
      weight: 1
    }).addTo(this.map).bindPopup("<b>University Campus Geofence</b>");

    // 3. High-Speed Road (Polyline Geofence)
    const roadCoords: [number, number][] = [
      [38.245, 21.720],
      [38.246, 21.730],
      [38.247, 21.740],
      [38.248, 21.750]
    ];
    // We can use a Polyline decorator or just a thick line
    L.polyline(roadCoords, {
      color: 'red',
      weight: 6,
      opacity: 0.6
    }).addTo(this.map).bindPopup("<b>High-Speed Road Geofence</b>");
  }
}