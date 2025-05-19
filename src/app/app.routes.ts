import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes =  [
  { path: 'page-not-found', component: NotFoundComponent },
  { path: ':council', component: LandingPageComponent },
  { path: '**', redirectTo: 'page-not-found' }
  ];
  
