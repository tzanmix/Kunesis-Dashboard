import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(App, {
  providers: [
    provideAnimations() // Required for some Angular Material features, good to have.
  ]
})
  .catch((err) => console.error(err));