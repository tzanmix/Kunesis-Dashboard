import { 
  ChangeDetectionStrategy, 
  Component, 
  input, 
  output 
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-navbar',
    imports: [CommonModule],
    standalone: true,
    templateUrl: './navbar.component.html', // <-- Changed
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarComponent {
  isDarkMode = input.required<boolean>();
  currentPage = input.required<'admin' | 'user' | 'register' | 'dog'>();
  toggleDarkMode = output<void>();
  navigate = output<'admin' | 'user' | 'register' | 'dog'>();
}