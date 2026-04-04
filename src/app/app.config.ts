import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    // provideToastr({
    //   timeOut: 5000,
    //   positionClass: 'toast-top-right',
    //   preventDuplicates: true,
    //   progressBar: true,
    //   // closeButton: true,
    //   newestOnTop: true,
    //   tapToDismiss: false,
    // }),
    provideToastr({
      timeOut: 5000,
      extendedTimeOut: 2000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      countDuplicates: true,
      resetTimeoutOnDuplicate: true,
      progressBar: true,
      // progressAnimation: 'increasing',
      newestOnTop: true,
      enableHtml: false,
      tapToDismiss: false,
      easeTime: 500,
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
};
