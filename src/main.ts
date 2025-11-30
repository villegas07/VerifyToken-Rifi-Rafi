import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

bootstrapApplication(AppComponent, appConfig)
  .catch(() => {
    document.body.innerHTML = '<h1>Error al cargar la aplicación</h1><p>Por favor, recarga la página.</p>';
  });
