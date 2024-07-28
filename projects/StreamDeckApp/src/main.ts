import { enableProdMode, importProvidersFrom, provideExperimentalZonelessChangeDetection } from '@angular/core';

import { provideHttpClient } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import 'iconify-icon';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routing.js';
import { environment } from './environments/environment.js';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule),
    provideHttpClient(),
    provideRouter(routes),
    provideExperimentalZonelessChangeDetection()
  ],
}).catch((err) => console.error(err));
