import { 
  ChangeDetectionStrategy, 
  Component, 
  signal, 
  input, 
  output, 
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
// This tells TypeScript that a 'L' variable (for Leaflet) will be available globally.
declare var L: any;

// =======================================================================
// 1. HEADER COMPONENT
// Manages navigation, title, and the dark mode toggle.
// =======================================================================
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="bg-white dark:bg-gray-800 shadow-md w-full z-10">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Title -->
          <div class="flex-shrink-0 flex items-center">
            <!-- SVG Icon for the app -->
            <svg class="h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.5-2.5m2.5 2.5l-2.867 5.02.02.001zM12 1.636a11.25 11.25 0 11-10.89 10.89 11.25 11.25 0 0110.89-10.89zM12 12a.75.75 0 100-1.5.75.75 0 000 1.5z" />
            </svg>
            <span class="ml-2 text-xl font-bold text-gray-900 dark:text-white">StrayWatch Patras</span>
          </div>

          <!-- Navigation Links -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <button 
              (click)="navigate.emit('admin')" 
              [class.border-blue-500]="currentPage() === 'admin'"
              [class.text-gray-900]="currentPage() === 'admin'"
              [class.dark:text-white]="currentPage() === 'admin'"
              [class.text-gray-500]="currentPage() !== 'admin'"
              [class.dark:text-gray-400]="currentPage() !== 'admin'"
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300">
              Admin Dashboard
            </button>
            <button 
              (click)="navigate.emit('user')" 
              [class.border-blue-500]="currentPage() === 'user'"
              [class.text-gray-900]="currentPage() === 'user'"
              [class.dark:text-white]="currentPage() === 'user'"
              [class.text-gray-500]="currentPage() !== 'user'"
              [class.dark:text-gray-400]="currentPage() !== 'user'"
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300">
              User Portal
            </button>
            @if (currentPage() === 'admin') {
              <button 
                (click)="navigate.emit('register')"
                class="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Register Animal
              </button>
            }
          </div>

          <!-- Dark Mode Toggle -->
          <div class="flex items-center">
            <button (click)="toggleDarkMode.emit()" type="button" class="p-2 rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <span class="sr-only">Toggle dark mode</span>
              <!-- Sun Icon -->
              @if (!isDarkMode()) {
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591" />
                </svg>
              } @else {
                <!-- Moon Icon -->
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              }
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  isDarkMode = input.required<boolean>();
  currentPage = input.required<'admin' | 'user' | 'register'>();
  toggleDarkMode = output<void>();
  navigate = output<'admin' | 'user' | 'register'>();
}

// =======================================================================
// 2. MAP COMPONENT
// Loads and displays the Leaflet map with all pins and geofences.
// =======================================================================
@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- This div is the map container -->
    <div #map id="map" class="h-[500px] w-full rounded-lg shadow-md z-0"></div>
  `,
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

// =======================================================================
// 3. ADMIN DASHBOARD COMPONENT
// Shows stats and the main map.
// =======================================================================
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MapComponent],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-6">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <!-- Stat Card 1 -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
          <div class="flex-shrink-0 bg-blue-500 rounded-md p-3">
            <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.5-2.5m2.5 2.5l-2.867 5.02.02.001zM12 1.636a11.25 11.25 0 11-10.89 10.89 11.25 11.25 0 0110.89-10.89zM12 12a.75.75 0 100-1.5.75.75 0 000 1.5z" /></svg>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Registered Animals</dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">128</dd>
          </div>
        </div>

        <!-- Stat Card 2 -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
          <div class="flex-shrink-0 bg-yellow-500 rounded-md p-3">
             <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-4.682-2.72V.501A3 3 0 009 3.75v12.75a3 3 0 00-3.741.479zM12 18.72a9.094 9.094 0 01-3.741-.479 3 3 0 014.682-2.72m4.682 2.72V.501A3 3 0 0115 3.75v12.75a3 3 0 01-3.741.479z" /></svg>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Herds</dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">14</dd>
          </div>
        </div>

        <!-- Stat Card 3 -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
          <div class="flex-shrink-0 bg-red-500 rounded-md p-3">
            <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Dangerous Incidents</dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">22</dd>
          </div>
        </div>
        
      </div>

      <!-- Map Section -->
      <div class="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Live Animal & Geofence Map</h2>
        <!-- The Map Component is rendered here -->
        <app-map></app-map>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {}

// =======================================================================
// 4. USER DASHBOARD COMPONENT
// Allows users to report incidents and view mock subscriptions.
// =======================================================================
@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      
      <!-- Report Incident Form -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Report a Dangerous Encounter</h2>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Witnessed an incident? Please let us know. Your report helps keep the community and the animals safe.
        </p>
        <form class="space-y-4">
          <div>
            <label for="incident-location" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Location</label>
            <input type="text" id="incident-location" placeholder="e.g., Near Riga Fereou 120" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
          </div>
          <div>
            <label for="incident-description" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
            <textarea id="incident-description" rows="3" placeholder="Describe what happened..." class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"></textarea>
          </div>
          <button type="button" class="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
            Submit Report
          </button>
        </form>
      </div>

      <!-- Animal Subscriptions -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">My Subscriptions</h2>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Track and support the animals you care about.
        </p>
        <div class="space-y-4">
          
          <!-- Mock Animal Card 1 -->
          <div class="border border-gray-200 dark:border-gray-700 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 class="text-lg font-semibold text-blue-600 dark:text-blue-400">Animal ID: D-101</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Last Seen: Psila Alonia Square</p>
            </div>
            <div class="flex-shrink-0 mt-4 sm:mt-0 sm:ml-4 flex space-x-2">
              <button class="px-3 py-1 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Track</button>
              <button class="px-3 py-1 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700">Feed</button>
              <button class="px-3 py-1 rounded-md text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600">Sponsor</button>
            </div>
          </div>

          <!-- Mock Animal Card 2 -->
          <div class="border border-gray-200 dark:border-gray-700 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 class="text-lg font-semibold text-blue-600 dark:text-blue-400">Animal ID: D-102</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Last Seen: Port Area</p>
            </div>
            <div class="flex-shrink-0 mt-4 sm:mt-0 sm:ml-4 flex space-x-2">
              <button class="px-3 py-1 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Track</button>
              <button class="px-3 py-1 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700">Feed</button>
              <button class="px-3 py-1 rounded-md text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600">Sponsor</button>
            </div>
          </div>

        </div>
      </div>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardComponent {}

// =======================================================================
// 5. REGISTER ANIMAL COMPONENT
// A mock form for registering a new animal.
// =======================================================================
@Component({
  selector: 'app-register-animal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div class="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md mt-6">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Register New Animal / Herd</h2>
        <form class="space-y-6">
          
          <div>
            <label for="animal-type" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Type</label>
            <select id="animal-type" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              <option>Single Dog</option>
              <option>Single Cat</option>
              <option>Dog Herd (2-5)</option>
              <option>Dog Herd (5+)</option>
            </select>
          </div>

          <div>
            <label for="animal-location" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Location (Coordinates)</label>
            <input type="text" id="animal-location" placeholder="38.2466, 21.7345 (or click map - mock)" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Ideally, this would be auto-filled by clicking on a map.</p>
          </div>

          <div>
            <label for="health-status" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Health Status</label>
            <select id="health-status" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              <option>Appears Healthy</option>
              <option>Needs Checkup</option>
              <option>Injured / Urgent</option>
            </select>
          </div>

          <div>
            <label for="animal-notes" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Notes</label>
            <textarea id="animal-notes" rows="3" placeholder="e.g., Black dog, white paws, very friendly..." class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"></textarea>
          </div>

          <div class="flex justify-end">
            <button type="button" (click)="navigateBack.emit()" class="mr-3 inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
              Cancel
            </button>
            <button type="button" class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Register Animal
            </button>
          </div>

        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterAnimalComponent {
  // This component emits an event to go back to the admin dashboard
  navigateBack = output<void>();
}

// =======================================================================
// 6. ROOT APP COMPONENT
// The main component that holds everything together.
// =======================================================================
@Component({
  selector: 'app-root',
  standalone: true,
  // Import all the standalone components you've defined
  imports: [
    CommonModule,
    HeaderComponent,
    AdminDashboardComponent,
    UserDashboardComponent,
    RegisterAnimalComponent
  ],
  template: `
    <!-- 
      These <link> and <script> tags are placed here to load Leaflet.
      In a real Angular app, this would be configured in angular.json.
    -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlLjQ="
      crossorigin=""></script>

    <!-- 
      This root div applies the 'dark' class based on the isDarkMode signal.
      Tailwind's dark: variants will respond to this.
    -->
    <div [class.dark]="isDarkMode()" class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      
      <!-- The Header -->
      <app-header 
        [isDarkMode]="isDarkMode()" 
        [currentPage]="currentPage()"
        (toggleDarkMode)="toggleDarkMode()"
        (navigate)="onNavigate($event)"
      />

      <!-- Main Content Area -->
      <main>
        <!-- 
          Angular's new @switch block to conditionally render
          the active "page" (component).
        -->
        @switch (currentPage()) {
          @case ('admin') {
            <app-admin-dashboard />
          }
          @case ('user') {
            <app-user-dashboard />
          }
          @case ('register') {
            <!-- When the register component emits 'navigateBack', we go to 'admin' -->
            <app-register-animal (navigateBack)="onNavigate('admin')" />
          }
        }
      </main>

      <footer class="text-center p-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-12">
        StrayWatch Patras Mockup | Built with Angular & Tailwind CSS
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // --- STATE MANAGEMENT ---
  
  // Signal for light/dark mode
  isDarkMode = signal<boolean>(false);

  // Signal for page navigation
  currentPage = signal<'admin' | 'user' | 'register'>('admin');

  // --- METHODS ---

  /** Toggles the dark mode signal. */
  toggleDarkMode() {
    this.isDarkMode.update(value => !value);
  }

  /** Updates the current page signal based on header navigation. */
  onNavigate(page: 'admin' | 'user' | 'register') {
    this.currentPage.set(page);
  }
}