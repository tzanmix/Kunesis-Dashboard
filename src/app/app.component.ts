import { 
  ChangeDetectionStrategy, 
  Component, 
  signal 
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Import all the child components
import { NavBarComponent } from './header/navbar.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { RegisterAnimalComponent } from './register-animal/register-animal.component';
import { DogComponent } from './dog/dog.component';
import { RouterOutlet } from "@angular/router";

@Component({
    selector: 'app-root',
    // Add all imported components to the 'imports' array
    imports: [
    CommonModule,
    NavBarComponent,
    AdminDashboardComponent,
    UserDashboardComponent,
    RegisterAnimalComponent,
    DogComponent,
    RouterOutlet
],
    standalone: true,
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  // --- STATE MANAGEMENT ---
  
  // Signal for light/dark mode
  isDarkMode = signal<boolean>(false);

  // Signal for page navigation
  currentPage = signal<'admin' | 'user' | 'register' | 'dog'>('admin');

  // --- METHODS ---

  /** Toggles the dark mode signal. */
  toggleDarkMode() {
    this.isDarkMode.update(value => !value);
  }

  /** Updates the current page signal based on header navigation. */
  onNavigate(page: 'admin' | 'user' | 'register' | 'dog') {
    this.currentPage.set(page);
  }
}