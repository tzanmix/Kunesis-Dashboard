import { 
  ChangeDetectionStrategy, 
  Component, 
  input, 
  output 
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-header',
    imports: [CommonModule],
    standalone: true,
    templateUrl: './header.component.html', // <-- Changed
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  isDarkMode = input.required<boolean>();
  currentPage = input.required<'admin' | 'user' | 'register'>();
  toggleDarkMode = output<void>();
  navigate = output<'admin' | 'user' | 'register'>();
}