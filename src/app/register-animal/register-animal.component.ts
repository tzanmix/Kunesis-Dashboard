import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-animal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register-animal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterAnimalComponent {
  // This component emits an event to go back to the admin dashboard
  navigateBack = output<void>();
}