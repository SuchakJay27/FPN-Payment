import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule, provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
    HttpClientModule,
    provideHttpClient(),
    provideAnimations(),
    importProvidersFrom(TranslateModule.forRoot(provideTranslation())),
     provideToastr({
      timeOut: 2000,
      positionClass: 'toast-top-right',
      preventDuplicates: false,
    }), 
  ]
};

export function provideTranslation() {
    return {
        defaultLanguage: 'en',
        loader: {
            provide: TranslateLoader,
            useFactory: (HttpLoaderFactory),
            deps: [HttpClient]
        },
    }
}