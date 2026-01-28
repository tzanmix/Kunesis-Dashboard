import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { DogComponent } from './dog/dog.component';
import { RegisterAnimalComponent } from './register-animal/register-animal.component';

export const routes: Routes = [
  { path: '', redirectTo: '/admin', pathMatch: 'full' },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'user', component: UserDashboardComponent },
  { path: 'dog', component: DogComponent },
  { path: 'register', component: RegisterAnimalComponent }
];