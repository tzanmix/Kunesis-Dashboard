import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';

bootstrapApplication(App, {
  providers: [
    provideAnimations(),
    provideHttpClient(withFetch()),
    provideToastr()
  ]
})
  .catch((err) => console.error(err));