import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(App, {
  providers: [
    provideAnimations(),
    provideHttpClient(withFetch()),
    provideToastr(),
    provideRouter(routes)
  ]
})
  .catch((err) => console.error(err));