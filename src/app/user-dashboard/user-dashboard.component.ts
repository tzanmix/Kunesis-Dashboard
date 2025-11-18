import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-user-dashboard',
    imports: [CommonModule],
    standalone: true,
    templateUrl: './user-dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDashboardComponent {}