import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from '../map/map.component'; // <-- Import MapComponent

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MapComponent],
  templateUrl: './admin-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {}