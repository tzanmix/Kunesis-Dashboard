import { 
  ChangeDetectionStrategy, 
  Component, 
  signal 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './header/navbar.component';
import { RouterOutlet } from "@angular/router";

@Component({
    selector: 'app-root',
    imports: [
    CommonModule,
    NavBarComponent,
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

  toggleDarkMode() {
    this.isDarkMode.update(value => !value);
  }

  
}