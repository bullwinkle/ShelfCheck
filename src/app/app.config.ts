import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideFileRouter } from '@analogjs/router';
import { provideClientHydration } from '@angular/platform-browser';
import { withComponentInputBinding } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideFileRouter(withComponentInputBinding()),
    provideClientHydration(),
  ],
};
