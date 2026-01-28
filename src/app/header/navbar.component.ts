import { 
  ChangeDetectionStrategy, 
  Component, 
  inject, 
  input, 
  output 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-navbar',
    imports: [CommonModule, RouterLink, RouterLinkActive],
    standalone: true,
    templateUrl: './navbar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarComponent {
  isDarkMode = input.required<boolean>();
  toggleDarkMode = output<void>();
  public router = inject(Router);
}