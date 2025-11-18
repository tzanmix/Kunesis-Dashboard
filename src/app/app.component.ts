import { 
  ChangeDetectionStrategy, 
  Component, 
  signal 
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Import all the child components
import { HeaderComponent } from './header/header.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { RegisterAnimalComponent } from './register-animal/register-animal.component';

@Component({
    selector: 'app-root',
    // Add all imported components to the 'imports' array
    imports: [
        CommonModule,
        HeaderComponent,
        AdminDashboardComponent,
        UserDashboardComponent,
        RegisterAnimalComponent
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